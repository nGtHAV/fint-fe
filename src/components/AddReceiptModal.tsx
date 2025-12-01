"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  RotateCcw,
  Check,
  Loader2,
  Sparkles,
  AlertCircle,
  Edit3,
  ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { ocrApi, OCRResult, categoriesApi, Category } from "@/lib/api";

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

type Step = "capture" | "preview" | "processing" | "edit";

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
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
        // Fallback to default categories
        setCategories([
          { id: null, name: "Food & Dining", icon: "utensils", color: "orange" },
          { id: null, name: "Shopping", icon: "shopping-bag", color: "pink" },
          { id: null, name: "Transportation", icon: "car", color: "blue" },
          { id: null, name: "Entertainment", icon: "film", color: "purple" },
          { id: null, name: "Bills & Utilities", icon: "file-text", color: "gray" },
          { id: null, name: "Healthcare", icon: "heart", color: "red" },
          { id: null, name: "Education", icon: "book", color: "indigo" },
          { id: null, name: "Other", icon: "more-horizontal", color: "gray", is_other: true },
        ]);
      }
    };
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Handle file selection (from camera or gallery)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setStep("preview");
      };
      reader.readAsDataURL(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
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
  const handleClose = () => {
    setStep("capture");
    setImagePreview(null);
    setProcessingError(null);
    setOcrResult(null);
    setFormData({
      name: "",
      amount: "",
      category: "Food & Dining",
      date: new Date().toISOString().split("T")[0],
    });
    onClose();
  };

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
    setImagePreview(null);
    setOcrResult(null);
    setProcessingError(null);
    setStep("capture");
  };

  const retakePhoto = () => {
    setImagePreview(null);
    setStep("capture");
  };

  if (!isOpen) return null;

  // Preview step - show captured/selected photo
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
              {/* Hidden file inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Take Photo - opens system camera */}
              <button
                onClick={() => cameraInputRef.current?.click()}
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
                    Open camera to capture receipt
                  </p>
                </div>
                <Sparkles className="text-emerald-500" size={20} />
              </button>

              {/* Upload from Gallery */}
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors border-2 border-dashed border-blue-300 dark:border-blue-700"
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                  <ImageIcon
                    className="text-blue-600 dark:text-blue-400"
                    size={24}
                  />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Choose from Gallery
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select an existing photo
                  </p>
                </div>
                <Sparkles className="text-blue-500" size={20} />
              </button>

              {/* Manual Entry */}
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
                  {categories.map((cat, index) => (
                    <option key={cat.id || `cat-${index}`} value={cat.name}>
                      {cat.name}
                      {cat.is_custom && " ★"}
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
