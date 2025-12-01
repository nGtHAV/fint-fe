"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wallet,
  Calendar,
  CalendarDays,
  CalendarRange,
  Plus,
  Trash2,
  Bell,
  AlertTriangle,
  CheckCircle2,
  X,
  Edit2,
  Save,
} from "lucide-react";
import { authApi, budgetsApi, Budget, BudgetAlert, BudgetSummary } from "@/lib/api";

type PeriodType = "daily" | "weekly" | "monthly";

interface EditingBudget {
  id: number;
  amount: string;
  alert_threshold: string;
}

export default function BudgetPage() {
  const router = useRouter();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<EditingBudget | null>(null);
  const [newBudget, setNewBudget] = useState({
    period: "monthly" as PeriodType,
    amount: "",
    alert_threshold: "80",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authApi.isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [budgetsData, alertsData, summaryData] = await Promise.all([
        budgetsApi.getAll(),
        budgetsApi.getAlerts(),
        budgetsApi.getSummary(),
      ]);
      setBudgets(budgetsData);
      setAlerts(alertsData);
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to load budget data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async () => {
    if (!newBudget.amount || parseFloat(newBudget.amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    try {
      await budgetsApi.create({
        period: newBudget.period,
        amount: parseFloat(newBudget.amount),
        alert_threshold: parseInt(newBudget.alert_threshold),
      });
      setShowAddModal(false);
      setNewBudget({ period: "monthly", amount: "", alert_threshold: "80" });
      setError("");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create budget");
    }
  };

  const handleUpdateBudget = async (budgetId: number) => {
    if (!editingBudget) return;

    try {
      await budgetsApi.update(budgetId, {
        amount: parseFloat(editingBudget.amount),
        alert_threshold: parseInt(editingBudget.alert_threshold),
      });
      setEditingBudget(null);
      loadData();
    } catch (err) {
      console.error("Failed to update budget:", err);
    }
  };

  const handleDeleteBudget = async (budgetId: number) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;

    try {
      await budgetsApi.delete(budgetId);
      loadData();
    } catch (err) {
      console.error("Failed to delete budget:", err);
    }
  };

  const handleMarkAlertRead = async (alertId: number) => {
    try {
      await budgetsApi.markAlertRead(alertId);
      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, is_read: true } : a)));
    } catch (err) {
      console.error("Failed to mark alert as read:", err);
    }
  };

  const handleMarkAllAlertsRead = async () => {
    try {
      await budgetsApi.markAllAlertsRead();
      setAlerts(alerts.map((a) => ({ ...a, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all alerts as read:", err);
    }
  };

  const getPeriodIcon = (period: PeriodType) => {
    switch (period) {
      case "daily":
        return Calendar;
      case "weekly":
        return CalendarDays;
      case "monthly":
        return CalendarRange;
    }
  };

  const getPeriodLabel = (period: PeriodType) => {
    switch (period) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
    }
  };

  const getStatusColor = (percentage: number, threshold: number) => {
    if (percentage >= 100) return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";
    if (percentage >= threshold) return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
    return "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30";
  };

  const getProgressColor = (percentage: number, threshold: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= threshold) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  const unreadAlertsCount = alerts.filter((a) => !a.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Budget Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your spending limits</p>
          </div>
          {unreadAlertsCount > 0 && (
            <button
              onClick={() => setShowAlertsModal(true)}
              className="relative p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                {unreadAlertsCount}
              </span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Budget Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["daily", "weekly", "monthly"] as PeriodType[]).map((period) => {
              const data = summary.budgets[period];
              const Icon = getPeriodIcon(period);
              
              return (
                <div
                  key={period}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {getPeriodLabel(period)}
                    </span>
                  </div>
                  
                  {data ? (
                    <>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${data.spent.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          / ${data.budget.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${getProgressColor(data.percentage, data.alert_threshold)}`}
                          style={{ width: `${Math.min(data.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(data.percentage, data.alert_threshold)}`}>
                          {data.percentage.toFixed(0)}% used
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          ${data.remaining.toFixed(2)} left
                        </span>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No budget set</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Budget List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Your Budgets
            </h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Budget
            </button>
          </div>

          {budgets.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-4">No budgets set yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                Create Your First Budget
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {budgets.map((budget) => {
                const Icon = getPeriodIcon(budget.period);
                const isEditing = editingBudget?.id === budget.id;
                const percentage = budget.percentage || 0;

                return (
                  <div key={budget.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${getStatusColor(percentage, budget.alert_threshold)}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {getPeriodLabel(budget.period)} Budget
                          </h3>
                          {budget.category && (
                            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                              {budget.category}
                            </span>
                          )}
                        </div>

                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1">
                              <label className="text-xs text-gray-500 dark:text-gray-400">Amount</label>
                              <input
                                type="number"
                                value={editingBudget.amount}
                                onChange={(e) =>
                                  setEditingBudget({ ...editingBudget, amount: e.target.value })
                                }
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                            <div className="w-24">
                              <label className="text-xs text-gray-500 dark:text-gray-400">Alert %</label>
                              <input
                                type="number"
                                value={editingBudget.alert_threshold}
                                onChange={(e) =>
                                  setEditingBudget({ ...editingBudget, alert_threshold: e.target.value })
                                }
                                min="1"
                                max="100"
                                className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                ${(budget.current_spent || 0).toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                / ${budget.amount.toFixed(2)}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                              <div
                                className={`h-full transition-all ${getProgressColor(percentage, budget.alert_threshold)}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Alert at {budget.alert_threshold}% • {percentage.toFixed(0)}% used
                            </p>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleUpdateBudget(budget.id)}
                              className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                            >
                              <Save className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </button>
                            <button
                              onClick={() => setEditingBudget(null)}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() =>
                                setEditingBudget({
                                  id: budget.id,
                                  amount: budget.amount.toString(),
                                  alert_threshold: budget.alert_threshold.toString(),
                                })
                              }
                              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteBudget(budget.id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-2">💡 Budget Tips</h3>
          <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <li>• Set realistic budgets based on your spending history</li>
            <li>• Use alerts at 80% to give yourself a heads up</li>
            <li>• Review and adjust your budgets monthly</li>
          </ul>
        </div>
      </div>

      {/* Add Budget Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md animate-scale-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Budget</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Set a spending limit</p>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Period
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["daily", "weekly", "monthly"] as PeriodType[]).map((period) => {
                    const Icon = getPeriodIcon(period);
                    const isSelected = newBudget.period === period;
                    const existingBudget = budgets.find((b) => b.period === period && !b.category);

                    return (
                      <button
                        key={period}
                        onClick={() => setNewBudget({ ...newBudget, period })}
                        disabled={!!existingBudget}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                            : existingBudget
                            ? "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${
                            isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {getPeriodLabel(period)}
                        </span>
                        {existingBudget && (
                          <span className="text-xs text-gray-400">Already set</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Amount ($)
                </label>
                <input
                  type="number"
                  value={newBudget.amount}
                  onChange={(e) => setNewBudget({ ...newBudget, amount: e.target.value })}
                  placeholder="e.g., 500"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alert Threshold (%)
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={newBudget.alert_threshold}
                  onChange={(e) => setNewBudget({ ...newBudget, alert_threshold: e.target.value })}
                  className="w-full accent-emerald-600"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Get alerted when you reach {newBudget.alert_threshold}% of your budget
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError("");
                }}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBudget}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium"
              >
                Create Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Modal */}
      {showAlertsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAlertsModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col animate-scale-in">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Budget Alerts</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadAlertsCount} unread alert{unreadAlertsCount !== 1 ? "s" : ""}
                </p>
              </div>
              {unreadAlertsCount > 0 && (
                <button
                  onClick={handleMarkAllAlertsRead}
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {alerts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No alerts yet</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.is_read
                        ? "bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700"
                        : alert.alert_type === "exceeded"
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                        : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {alert.alert_type === "exceeded" ? (
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                      ) : (
                        <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            alert.is_read
                              ? "text-gray-600 dark:text-gray-400"
                              : "text-gray-900 dark:text-white font-medium"
                          }`}
                        >
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {alert.created_at ? new Date(alert.created_at).toLocaleString() : ""}
                        </p>
                      </div>
                      {!alert.is_read && (
                        <button
                          onClick={() => handleMarkAlertRead(alert.id)}
                          className="p-1 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAlertsModal(false)}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
