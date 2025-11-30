"use client";

import { TrendingUp, TrendingDown, Receipt, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import PieChart, { getCategoryColor } from "./PieChart";

interface ReceiptItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  imageUrl?: string;
}

interface DashboardProps {
  receipts: ReceiptItem[];
  onNavigateToSettings: () => void;
  userName?: string;
}

export default function Dashboard({ receipts, onNavigateToSettings, userName = "User" }: DashboardProps) {
  const router = useRouter();
  const totalSpent = receipts.reduce((sum, r) => sum + r.amount, 0);
  const thisMonth = receipts.filter((r) => {
    const receiptDate = new Date(r.date);
    const now = new Date();
    return receiptDate.getMonth() === now.getMonth() && receiptDate.getFullYear() === now.getFullYear();
  });
  const monthlySpent = thisMonth.reduce((sum, r) => sum + r.amount, 0);

  const categories = receipts.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

  // Prepare pie chart data
  const pieChartData = Object.entries(categories).map(([category, amount]) => ({
    category,
    amount,
    color: getCategoryColor(category),
  }));

  return (
    <div className="p-4 md:p-8">
      <Header 
        title="Dashboard" 
        userName={userName}
        onProfileClick={onNavigateToSettings}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <button 
          onClick={() => router.push("/spending")}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-left hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Spent</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
              <DollarSign className="text-emerald-600 dark:text-emerald-400 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </button>

        <button 
          onClick={() => router.push("/spending?filter=month")}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-left hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">This Month</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">${monthlySpent.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingUp className="text-blue-600 dark:text-blue-400 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </button>

        <button 
          onClick={() => router.push("/receipts")}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-left hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Total Receipts</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{receipts.length}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
              <Receipt className="text-purple-600 dark:text-purple-400 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Top Category</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">{topCategory?.[0] || "N/A"}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingDown className="text-orange-600 dark:text-orange-400 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Spending Chart and Recent Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h2>
          {pieChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <DollarSign className="mb-4 opacity-50" size={48} />
              <p>No spending data yet</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <PieChart data={pieChartData} size={200} />
              
              {/* Legend */}
              <div className="mt-6 w-full grid grid-cols-2 gap-3">
                {pieChartData.map((item) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {item.category}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white ml-auto">
                      ${item.amount.toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Receipts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Receipts</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {receipts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <Receipt className="mx-auto mb-4 opacity-50" size={48} />
                <p>No receipts yet. Add your first receipt to get started!</p>
              </div>
            ) : (
              receipts.slice(0, 5).map((receipt) => (
                <div key={receipt.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <Receipt className="text-emerald-600 dark:text-emerald-400" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{receipt.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{receipt.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">${receipt.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(receipt.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
