"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { X, Camera, Upload, Image as ImageIcon, RotateCcw, Check } from "lucide-react";

interface AddReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddReceipt: (receipt: {
    name: string;
    amount: number;
    category: string;
    date: string;
    imageData?: string;
  }) => void;
}

export default function AddReceiptModal({ isOpen, onClose, onAddReceipt }: AddReceiptModalProps) {
  const [step, setStep] = useState<"capture" | "camera" | "form">("capture");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "Food & Dining",
    date: new Date().toISOString().split("T")[0],
  });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const categories = [
    "Food & Dining",
    "Shopping",
    "Transportation",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Other",
  ];

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setStep("camera");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError(
        err instanceof Error
          ? err.message
          : "Unable to access camera. Please check permissions."
      );
      setStep("capture");
    }
  }, []);

  // Capture photo from camera
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      setImagePreview(imageData);
      stopCamera();
      setStep("form");
    }
  }, [stopCamera]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setStep("form");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onAddReceipt({
        name: formData.name,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date,
        imageData: imagePreview || undefined,
      });
      handleClose();
    } catch (error) {
      console.error("Error adding receipt:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset and close modal
  const handleClose = useCallback(() => {
    stopCamera();
    setStep("capture");
    setImagePreview(null);
    setCameraError(null);
    setFormData({
      name: "",
      amount: "",
      category: "Food & Dining",
      date: new Date().toISOString().split("T")[0],
    });
    onClose();
  }, [stopCamera, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const skipImage = () => setStep("form");

  const goBack = () => {
    stopCamera();
    setImagePreview(null);
    setStep("capture");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-xl max-h-[90vh] overflow-hidden animate-slide-up">
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {step === "capture" && "Add Receipt"}
            {step === "camera" && "Take Photo"}
            {step === "form" && "Receipt Details"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {step === "capture" && (
            <div className="p-6 space-y-4">
              {cameraError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                  {cameraError}
                </div>
              )}

              <button
                onClick={startCamera}
                className="w-full flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-colors border-2 border-dashed border-emerald-300 dark:border-emerald-700"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center">
                  <Camera className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Take a Photo</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Use your camera to capture the receipt
                  </p>
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors border-2 border-dashed border-blue-300 dark:border-blue-700"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <Upload className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Upload Photo</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose an image from your device
                  </p>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={skipImage}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <ImageIcon className="text-gray-500 dark:text-gray-400" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">Skip Photo</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add receipt details manually
                  </p>
                </div>
              </button>
            </div>
          )}

          {step === "camera" && (
            <div className="relative">
              <div className="relative bg-black aspect-[3/4] sm:aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-8 border-2 border-white/50 rounded-lg" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-center gap-8">
                  <button
                    onClick={goBack}
                    className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                  >
                    <RotateCcw className="text-white" size={24} />
                  </button>
                  <button
                    onClick={capturePhoto}
                    className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                  >
                    <div className="w-12 h-12 bg-emerald-500 rounded-full" />
                  </button>
                  <div className="w-12" />
                </div>
              </div>
            </div>
          )}

          {step === "form" && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Receipt preview"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Receipt Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Grocery shopping"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={goBack}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Add Receipt
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
