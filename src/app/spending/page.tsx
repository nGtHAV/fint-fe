"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, TrendingUp } from "lucide-react";
import { receiptsApi, authApi, Receipt } from "@/lib/api";

export default function SpendingPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "month" | "custom">("all");

  const applyDateFilter = useCallback(() => {
    let filtered = receipts;
    const now = new Date();

    if (filterMode === "month") {
      filtered = receipts.filter(r => {
        const date = new Date(r.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      });
    } else if (filterMode === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = receipts.filter(r => {
        const date = new Date(r.date);
        return date >= start && date <= end;
      });
    }

    setFilteredReceipts(filtered);
  }, [receipts, filterMode, startDate, endDate]);

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchReceipts();
  }, [router]);

  useEffect(() => {
    applyDateFilter();
  }, [applyDateFilter]);

  const fetchReceipts = async () => {
    try {
      const data = await receiptsApi.getAll();
      setReceipts(data.receipts);
    } catch (error) {
      console.error("Failed to fetch receipts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSpent = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);
  
  // Group by category
  const categoryTotals = filteredReceipts.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group by day for chart
  const dailyTotals = filteredReceipts.reduce((acc, r) => {
    const day = new Date(r.date).toLocaleDateString();
    acc[day] = (acc[day] || 0) + r.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedDays = Object.entries(dailyTotals).sort((a, b) => 
    new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Spending History</h1>
        </div>

        {/* Filter Tabs */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setFilterMode("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterMode === "all"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilterMode("month")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterMode === "month"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilterMode("custom")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterMode === "custom"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              Custom
            </button>
          </div>

          {/* Date Inputs for Custom Filter */}
          {filterMode === "custom" && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg mb-6">
          <p className="text-white/80 text-sm mb-1">
            {filterMode === "all" ? "Total Spent" : filterMode === "month" ? "This Month" : "Selected Period"}
          </p>
          <p className="text-4xl font-bold mb-4">${totalSpent.toFixed(2)}</p>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{filteredReceipts.length} receipts</span>
            </div>
            {filteredReceipts.length > 0 && (
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>Avg: ${(totalSpent / filteredReceipts.length).toFixed(2)}/receipt</span>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">By Category</h2>
          {Object.keys(categoryTotals).length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No data for selected period</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .map(([category, amount]) => {
                  const percentage = (amount / totalSpent) * 100;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{category}</span>
                        <span className="font-medium text-gray-900 dark:text-white">${amount.toFixed(2)}</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Daily Spending */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Daily Spending</h2>
          {sortedDays.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No data for selected period</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sortedDays.map(([day, amount]) => (
                <div key={day} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{day}</span>
                  <span className="font-medium text-gray-900 dark:text-white">${amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
