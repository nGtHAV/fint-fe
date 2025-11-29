"use client";

import { Clock, X } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export default function ComingSoonModal({ isOpen, onClose, feature }: ComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm animate-scale-in p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors cursor-pointer"
        >
          <X size={20} className="text-gray-500" />
        </button>
        
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Clock className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Coming Soon!
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            <span className="font-medium text-emerald-600 dark:text-emerald-400">{feature}</span> is currently under development. We&apos;re working hard to bring you this feature soon!
          </p>
          
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors cursor-pointer"
            >
              Got it!
            </button>
            
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Stay tuned for updates 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
