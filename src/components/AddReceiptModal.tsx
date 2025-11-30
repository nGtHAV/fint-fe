"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  X,
  Camera,
  Upload,
  RotateCcw,
  Check,
  Loader2,
  Sparkles,
  AlertCircle,
  Edit3,
} from "lucide-react";
import Image from "next/image";
import { ocrApi, OCRResult } from "@/lib/api";

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

type Step = "capture" | "camera" | "preview" | "processing" | "edit";

export default function AddReceiptModal({
  isOpen,
  onClose,
  onAddReceipt,
}: AddReceiptModalProps) {
  const [step, setStep] = useState<Step>("capture");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "Food & Dining",
    date: new Date().toISOString().split("T")[0],
  });
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

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

  // Start camera - FULL SCREEN
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
      setStep("preview"); // Go to preview step instead of form
    }
  }, [stopCamera]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setStep("preview"); // Go to preview step
      };
      reader.readAsDataURL(file);
    }
  };

  // Process image with AI OCR
  const processWithAI = async () => {
    if (!imagePreview) return;

    setStep("processing");
    setProcessingError(null);

    try {
      // Extract base64 data without the data URL prefix
      const base64Data = imagePreview.split(",")[1] || imagePreview;
      const result = await ocrApi.scanReceipt(base64Data);

      setOcrResult(result);

      if (result.success) {
        // Pre-fill form with OCR results
        setFormData({
          name: result.merchant || "",
          amount: result.total?.toString() || "",
          category: result.category || "Other",
          date: result.date || new Date().toISOString().split("T")[0],
        });
      }

      setStep("edit");
    } catch (error) {
      console.error("OCR error:", error);
      setProcessingError(
        error instanceof Error ? error.message : "Failed to process receipt"
      );
      setStep("edit");
      // Still allow manual entry
      setFormData({
        name: "",
        amount: "",
        category: "Other",
        date: new Date().toISOString().split("T")[0],
      });
    }
  };

  // Skip AI processing
  const skipAIProcessing = () => {
    setFormData({
      name: "",
      amount: "",
      category: "Food & Dining",
      date: new Date().toISOString().split("T")[0],
    });
    setStep("edit");
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
    setProcessingError(null);
    setOcrResult(null);
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

  const skipImage = () => {
    setFormData({
      name: "",
      amount: "",
      category: "Food & Dining",
      date: new Date().toISOString().split("T")[0],
    });
    setStep("edit");
  };

  const goBack = () => {
    stopCamera();
    setImagePreview(null);
    setOcrResult(null);
    setProcessingError(null);
    setStep("capture");
  };

  const retakePhoto = () => {
    setImagePreview(null);
    startCamera();
  };

  if (!isOpen) return null;

  // Full screen camera view
  if (step === "camera") {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Camera overlay with guide */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Receipt guide frame */}
          <div className="absolute inset-8 sm:inset-16 md:inset-24 border-2 border-white/60 rounded-2xl">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
              Align receipt within frame
            </div>
          </div>

          {/* Corner markers */}
          <div className="absolute top-8 left-8 sm:top-16 sm:left-16 md:top-24 md:left-24 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
          <div className="absolute top-8 right-8 sm:top-16 sm:right-16 md:top-24 md:right-24 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
          <div className="absolute bottom-8 left-8 sm:bottom-16 sm:left-16 md:bottom-24 md:left-24 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
          <div className="absolute bottom-8 right-8 sm:bottom-16 sm:right-16 md:bottom-24 md:right-24 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
        >
          <X className="text-white" size={24} />
        </button>

        {/* Camera controls */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-[max(2rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <div className="flex items-center justify-center gap-12">
            <button
              onClick={goBack}
              className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <RotateCcw className="text-white" size={28} />
            </button>
            <button
              onClick={capturePhoto}
              className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-xl"
            >
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                <Camera className="text-white" size={32} />
              </div>
            </button>
            <div className="w-16" /> {/* Spacer for balance */}
          </div>
        </div>
      </div>
    );
  }

  // Preview step - show captured photo
  if (step === "preview") {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        {/* Image preview */}
        <div className="flex-1 relative">
          {imagePreview && (
            <Image
              src={imagePreview}
              alt="Captured receipt"
              fill
              className="object-contain"
              unoptimized
            />
          )}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-colors z-10"
        >
          <X className="text-white" size={24} />
        </button>

        {/* Action buttons */}
        <div className="bg-gray-900 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <p className="text-center text-white/80 mb-4">
            Looking good? Process with AI to extract receipt details
          </p>
          <div className="flex gap-3">
            <button
              onClick={retakePhoto}
              className="flex-1 px-4 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Retake
            </button>
            <button
              onClick={skipAIProcessing}
              className="flex-1 px-4 py-4 bg-gray-600 hover:bg-gray-500 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Edit3 size={20} />
              Manual
            </button>
            <button
              onClick={processWithAI}
              className="flex-1 px-4 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Sparkles size={20} />
              Scan AI
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Processing step - AI loading animation
  if (step === "processing") {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col items-center justify-center">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
        >
          <X className="text-white" size={24} />
        </button>

        {/* Loading animation */}
        <div className="relative mb-8">
          {/* Outer ring */}
          <div className="w-32 h-32 rounded-full border-4 border-emerald-500/20 flex items-center justify-center">
            {/* Spinning ring */}
            <div className="absolute w-32 h-32 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
            {/* Inner icon */}
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="text-emerald-400 w-10 h-10 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Processing text */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Processing Receipt
        </h2>
        <p className="text-gray-400 text-center px-8 mb-6">
          Our AI is analyzing your receipt to extract the details...
        </p>

        {/* Progress dots */}
        <div className="flex gap-2">
          <div
            className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>

        {/* Mini preview */}
        {imagePreview && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-20 h-28 rounded-lg overflow-hidden opacity-50">
            <Image
              src={imagePreview}
              alt="Processing"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
      </div>
    );
  }

  // Regular modal for capture and edit steps
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
            {step === "edit" && "Review & Edit"}
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
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={20} />
                  {cameraError}
                </div>
              )}

              <button
                onClick={startCamera}
                className="w-full flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-colors border-2 border-dashed border-emerald-300 dark:border-emerald-700"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center">
                  <Camera
                    className="text-emerald-600 dark:text-emerald-400"
                    size={24}
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Take a Photo
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Capture receipt with AI scanning
                  </p>
                </div>
                <Sparkles className="text-emerald-500" size={20} />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors border-2 border-dashed border-blue-300 dark:border-blue-700"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <Upload
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Upload Photo
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose from gallery
                  </p>
                </div>
                <Sparkles className="text-blue-500" size={20} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={skipImage}
                className="w-full flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              >
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <Edit3
                    className="text-gray-500 dark:text-gray-400"
                    size={24}
                  />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Manual Entry
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter receipt details yourself
                  </p>
                </div>
              </button>
            </div>
          )}

          {step === "edit" && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* OCR Result indicator */}
              {ocrResult?.success && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm flex items-center gap-2">
                  <Sparkles size={18} />
                  AI successfully extracted receipt details. Please review and
                  correct if needed.
                </div>
              )}

              {processingError && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle size={18} />
                  {processingError}. Please enter details manually.
                </div>
              )}

              {/* Image preview */}
              {imagePreview && (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Receipt preview"
                    width={400}
                    height={160}
                    className="w-full h-40 object-cover rounded-xl"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Receipt Name / Merchant
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Walmart, Starbucks"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Total Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
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
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Detected items from OCR */}
              {ocrResult?.items && ocrResult.items.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Detected Items
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 max-h-32 overflow-y-auto">
                    {ocrResult.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between text-sm py-1"
                      >
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.name}
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      Save Receipt
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
