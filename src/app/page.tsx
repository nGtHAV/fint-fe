"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Dashboard from "@/components/Dashboard";
import Settings from "@/components/Settings";
import AddReceiptModal from "@/components/AddReceiptModal";
import { authApi, receiptsApi, Receipt as APIReceipt, CreateReceiptData, getStoredUser, User, BudgetAlert } from "@/lib/api";
import { AlertTriangle, Bell, X } from "lucide-react";

interface Receipt {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  imageUrl?: string;
}

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [budgetAlertPopup, setBudgetAlertPopup] = useState<BudgetAlert | null>(null);

  // Convert API receipt to frontend receipt format
  const mapReceipt = (r: APIReceipt): Receipt => ({
    id: r.id.toString(),
    name: r.name,
    amount: r.amount,
    category: r.category,
    date: r.date,
    imageUrl: r.image_url,
  });

  // Fetch receipts from API
  const fetchReceipts = useCallback(async () => {
    try {
      setError(null);
      const { receipts: apiReceipts } = await receiptsApi.getAll();
      setReceipts(apiReceipts.map(mapReceipt));
    } catch (err) {
      console.error("Error fetching receipts:", err);
      // If unauthorized, redirect to login
      if (err instanceof Error && err.message.includes("Token")) {
        authApi.logout();
        router.push("/login");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load receipts");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Check auth and fetch receipts on mount
  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      router.push("/login");
      return;
    }
    
    // Get user from stored data
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    
    fetchReceipts();
  }, [router, fetchReceipts]);

  const handleAddReceipt = async (receipt: {
    name: string;
    amount: number;
    category: string;
    date: string;
    imageData?: string;
  }) => {
    try {
      const createData: CreateReceiptData = {
        name: receipt.name,
        amount: receipt.amount,
        category: receipt.category,
        date: receipt.date,
        imageData: receipt.imageData,
      };
      
      const response = await receiptsApi.create(createData);
      setReceipts((prev) => [mapReceipt(response.receipt), ...prev]);
      
      // Show budget alert popup if any alerts were created
      if (response.budget_alerts && response.budget_alerts.length > 0) {
        setBudgetAlertPopup(response.budget_alerts[0]);
        // Auto-dismiss after 5 seconds
        setTimeout(() => setBudgetAlertPopup(null), 5000);
      }
    } catch (err) {
      console.error("Error adding receipt:", err);
      throw err;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Error banner */}
      {error && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-center text-sm">
          {error}
          <button onClick={fetchReceipts} className="ml-4 underline">
            Retry
          </button>
        </div>
      )}

      {/* Sidebar for Desktop */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddReceipt={() => setIsModalOpen(true)}
      />

      {/* Main Content */}
      <main className="md:ml-64 pb-20 md:pb-0 min-h-screen">
        {activeTab === "dashboard" && (
          <Dashboard 
            receipts={receipts} 
            onNavigateToSettings={() => setActiveTab("settings")}
            userName={user?.name}
          />
        )}
        {activeTab === "settings" && <Settings />}
      </main>

      {/* Bottom Navigation for Mobile */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddReceipt={() => setIsModalOpen(true)}
      />

      {/* Add Receipt Modal */}
      <AddReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddReceipt={handleAddReceipt}
      />

      {/* Budget Alert Popup */}
      {budgetAlertPopup && (
        <div className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-96 z-50 animate-slide-up">
          <div
            className={`p-4 rounded-xl shadow-lg flex items-start gap-3 ${
              budgetAlertPopup.alert_type === "exceeded"
                ? "bg-red-100 dark:bg-red-900/90 border border-red-200 dark:border-red-700"
                : "bg-yellow-100 dark:bg-yellow-900/90 border border-yellow-200 dark:border-yellow-700"
            }`}
          >
            {budgetAlertPopup.alert_type === "exceeded" ? (
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Bell className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`font-semibold ${
                  budgetAlertPopup.alert_type === "exceeded"
                    ? "text-red-800 dark:text-red-200"
                    : "text-yellow-800 dark:text-yellow-200"
                }`}
              >
                {budgetAlertPopup.alert_type === "exceeded" ? "Budget Exceeded!" : "Budget Warning"}
              </p>
              <p
                className={`text-sm mt-1 ${
                  budgetAlertPopup.alert_type === "exceeded"
                    ? "text-red-700 dark:text-red-300"
                    : "text-yellow-700 dark:text-yellow-300"
                }`}
              >
                {budgetAlertPopup.message}
              </p>
            </div>
            <button
              onClick={() => setBudgetAlertPopup(null)}
              className="p-1 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
