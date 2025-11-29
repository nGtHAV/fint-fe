"use client";

import { LayoutDashboard, Settings, PlusCircle } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddReceipt: () => void;
}

export default function BottomNav({ activeTab, setActiveTab, onAddReceipt }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-40">
      <div className="flex items-center justify-around py-2">
        {/* Dashboard */}
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            activeTab === "dashboard"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <LayoutDashboard size={24} />
          <span className="text-xs font-medium">Dashboard</span>
        </button>

        {/* Add Receipt - Center FAB style */}
        <button
          onClick={onAddReceipt}
          className="flex items-center justify-center w-14 h-14 -mt-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg transition-transform hover:scale-105"
        >
          <PlusCircle size={28} />
        </button>

        {/* Settings */}
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            activeTab === "settings"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          <Settings size={24} />
          <span className="text-xs font-medium">Settings</span>
        </button>
      </div>
    </nav>
  );
}
