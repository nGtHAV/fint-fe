"use client";

import { useState, useEffect, useMemo } from "react";
import { TrendingUp, TrendingDown, Receipt, Wallet, AlertTriangle, Bell, X, DollarSign } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import PieChart, { getCategoryColor } from "./PieChart";
import { getCategoryConfig } from "@/lib/categoryIcons";
import { budgetsApi, BudgetSummary, BudgetAlert } from "@/lib/api";

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

type PeriodType = "daily" | "weekly" | "monthly";

export default function Dashboard({ receipts, onNavigateToSettings, userName = "User" }: DashboardProps) {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<"all" | "month">("all");
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [showAlertBanner] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("monthly");
  
  // Load budget summary and alerts
  useEffect(() => {
    const loadBudgetData = async () => {
      try {
        const [summary, alertsData] = await Promise.all([
          budgetsApi.getSummary(),
          budgetsApi.getAlerts(),
        ]);
        setBudgetSummary(summary);
        setAlerts(alertsData.filter(a => !a.is_read));
      } catch (error) {
        console.error("Failed to load budget data:", error);
      }
    };
    loadBudgetData();
  }, [receipts]); // Re-fetch when receipts change
  
  // Get date range based on selected period
  const getDateRange = (period: PeriodType) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case "daily":
        return { start: today, end: today };
      case "weekly":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return { start: weekStart, end: weekEnd };
      case "monthly":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { start: monthStart, end: monthEnd };
    }
  };
  
  // Filter receipts based on selected period
  const filteredReceipts = useMemo(() => {
    const { start, end } = getDateRange(selectedPeriod);
    return receipts.filter((r) => {
      const receiptDate = new Date(r.date);
      return receiptDate >= start && receiptDate <= end;
    });
  }, [receipts, selectedPeriod]);
  
  // Calculate totals for selected period
  const periodSpent = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);
  const periodReceiptCount = filteredReceipts.length;
  
  // Categories for selected period
  const periodCategories = useMemo(() => {
    return filteredReceipts.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + r.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredReceipts]);
  
  const topCategory = Object.entries(periodCategories).sort((a, b) => b[1] - a[1])[0];

  // Filter receipts based on selected filter for pie chart
  const filteredForChart = categoryFilter === "month" 
    ? receipts.filter((r) => {
        const receiptDate = new Date(r.date);
        const now = new Date();
        return receiptDate.getMonth() === now.getMonth() && receiptDate.getFullYear() === now.getFullYear();
      })
    : receipts;

  const chartCategories = filteredForChart.reduce((acc, r) => {
    acc[r.category] = (acc[r.category] || 0) + r.amount;
    return acc;
  }, {} as Record<string, number>);

  // Prepare pie chart data
  const pieChartData = Object.entries(chartCategories).map(([category, amount]) => ({
    category,
    amount,
    color: getCategoryColor(category),
  }));
  
  // Get budget data for selected period
  const currentBudget = budgetSummary?.budgets[selectedPeriod];
  
  // Toggle to next period
  const cyclePeriod = () => {
    const periods: PeriodType[] = ["daily", "weekly", "monthly"];
    const currentIndex = periods.indexOf(selectedPeriod);
    const nextIndex = (currentIndex + 1) % periods.length;
    setSelectedPeriod(periods[nextIndex]);
  };
  
  const getPeriodLabel = (period: PeriodType) => {
    switch (period) {
      case "daily": return "Today";
      case "weekly": return "This Week";
      case "monthly": return "This Month";
    }
  };

  return (
    <div className="p-4 md:p-8">
      <Header 
        title="Dashboard" 
        userName={userName}
        onProfileClick={onNavigateToSettings}
      />

      {/* Budget Alert Banner */}
      {showAlertBanner && alerts.length > 0 && (
        <div className="mb-6">
          {alerts.slice(0, 2).map((alert) => (
            <div
              key={alert.id}
              className={`mb-2 p-4 rounded-xl flex items-center gap-3 ${
                alert.alert_type === "exceeded"
                  ? "bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
                  : "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800"
              }`}
            >
              {alert.alert_type === "exceeded" ? (
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              ) : (
                <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              )}
              <p
                className={`flex-1 text-sm font-medium ${
                  alert.alert_type === "exceeded"
                    ? "text-red-800 dark:text-red-300"
                    : "text-yellow-800 dark:text-yellow-300"
                }`}
              >
                {alert.message}
              </p>
              <button
                onClick={async () => {
                  await budgetsApi.markAlertRead(alert.id);
                  setAlerts(alerts.filter((a) => a.id !== alert.id));
                }}
                className="p-1 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}
          {alerts.length > 2 && (
            <button
              onClick={() => router.push("/budget")}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              View all {alerts.length} alerts →
            </button>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {/* Budget Card - Tappable to cycle periods */}
        <button 
          onClick={cyclePeriod}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-left hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                {getPeriodLabel(selectedPeriod)} Budget
              </p>
              {currentBudget ? (
                <>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                    ${currentBudget.spent.toFixed(0)}<span className="text-sm font-normal text-gray-500">/${currentBudget.budget.toFixed(0)}</span>
                  </p>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all ${
                        currentBudget.status === "exceeded"
                          ? "bg-red-500"
                          : currentBudget.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(currentBudget.percentage, 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">
                  ${periodSpent.toFixed(0)}
                </p>
              )}
            </div>
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ml-2 ${
              currentBudget?.status === "exceeded" 
                ? "bg-red-100 dark:bg-red-900/30" 
                : currentBudget?.status === "warning"
                ? "bg-yellow-100 dark:bg-yellow-900/30"
                : "bg-emerald-100 dark:bg-emerald-900/30"
            }`}>
              <Wallet className={`w-5 h-5 md:w-6 md:h-6 ${
                currentBudget?.status === "exceeded" 
                  ? "text-red-600 dark:text-red-400" 
                  : currentBudget?.status === "warning"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`} />
            </div>
          </div>
        </button>

        {/* Period Spent Card */}
        <button 
          onClick={() => router.push("/spending?filter=month")}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-left hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Spent {getPeriodLabel(selectedPeriod)}</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">${periodSpent.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
              <TrendingUp className="text-blue-600 dark:text-blue-400 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </button>

        {/* Receipt Count - Dynamic based on period */}
        <button 
          onClick={() => router.push("/receipts")}
          className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700 text-left hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Receipts {getPeriodLabel(selectedPeriod)}</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{periodReceiptCount}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
              <Receipt className="text-purple-600 dark:text-purple-400 w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </button>

        {/* Top Category - Dynamic based on period */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 md:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Top Category</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">{topCategory?.[0] || "N/A"}</p>
              {topCategory && (
                <p className="text-xs text-gray-500 dark:text-gray-400">${topCategory[1].toFixed(0)} spent</p>
              )}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Spending by Category</h2>
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  categoryFilter === "all"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setCategoryFilter("month")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  categoryFilter === "month"
                    ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                This Month
              </button>
            </div>
          </div>
          {pieChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <DollarSign className="mb-4 opacity-50" size={48} />
              <p>No spending data {categoryFilter === "month" ? "this month" : "yet"}</p>
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
              receipts.slice(0, 5).map((receipt) => {
                const categoryConf = getCategoryConfig(receipt.category);
                const CategoryIcon = categoryConf.icon;
                
                return (
                  <div key={receipt.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className={`w-12 h-12 ${categoryConf.bgColor} ${categoryConf.darkBgColor} rounded-lg flex items-center justify-center`}>
                      <CategoryIcon className={`${categoryConf.color}`} size={20} />
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
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
