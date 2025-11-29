"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import Dashboard from "@/components/Dashboard";
import Settings from "@/components/Settings";
import AddReceiptModal from "@/components/AddReceiptModal";
import { authApi, receiptsApi, Receipt as APIReceipt, CreateReceiptData, getStoredUser, User } from "@/lib/api";

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
      
      const { receipt: newReceipt } = await receiptsApi.create(createData);
      setReceipts((prev) => [mapReceipt(newReceipt), ...prev]);
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
    </div>
  );
}
