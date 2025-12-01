"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Bell, 
  Moon, 
  Sun,
  Shield, 
  HelpCircle, 
  LogOut, 
  CreditCard, 
  Globe, 
  Smartphone,
  Download,
  Trash2,
  ChevronRight,
  Camera,
  Mail,
  Calendar,
  Wallet,
  Tags,
  CheckCircle,
  X,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import ComingSoonModal from "./ComingSoonModal";
import { useTheme } from "./ThemeProvider";
import { authApi, statsApi, usersApi, exportApi, getStoredUser, User as UserType } from "@/lib/api";
import Image from "next/image";

export default function Settings() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const [notifications, setNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [exportTimeframe, setExportTimeframe] = useState<"all" | "month" | "week" | "custom">("all");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");
  const [selectedLanguage] = useState("English (US)");
  const [selectedCurrency] = useState("USD ($)");
  const [user, setUser] = useState<UserType | null>(null);
  const [stats, setStats] = useState({
    totalReceipts: 0,
    monthlySpent: 0,
    categories: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Get stored user first
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
      }

      // Fetch fresh user data from API
      try {
        const { user: freshUser } = await authApi.getCurrentUser();
        setUser(freshUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }

      // Fetch stats
      try {
        const statsData = await statsApi.getSummary();
        setStats({
          totalReceipts: statsData.total_receipts,
          monthlySpent: statsData.monthly_spent,
          categories: statsData.categories?.length || 0
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    } finally {
      // Loading complete
    }
  };

  const handleLogout = () => {
    authApi.logout();
    router.push("/login");
  };

  const handleDeleteAccount = async () => {
    try {
      await usersApi.deleteAccount();
      authApi.logout();
      router.push("/login");
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  const getExportDates = () => {
    const today = new Date();
    let start_date: string | undefined;
    let end_date: string | undefined;
    
    switch (exportTimeframe) {
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        start_date = weekAgo.toISOString().split('T')[0];
        end_date = today.toISOString().split('T')[0];
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(today.getMonth() - 1);
        start_date = monthAgo.toISOString().split('T')[0];
        end_date = today.toISOString().split('T')[0];
        break;
      case "custom":
        start_date = customStartDate || undefined;
        end_date = customEndDate || undefined;
        break;
      default:
        // All time - no date filter
        break;
    }
    
    return { start_date, end_date };
  };

  const handleExportData = async () => {
    setExportLoading(true);
    setExportSuccess(false);
    
    try {
      const { start_date, end_date } = getExportDates();
      const blob = await exportApi.exportReceipts({ 
        format: exportFormat, 
        start_date, 
        end_date 
      });
      
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `fint-receipts-${timestamp}.${exportFormat}`;
      exportApi.downloadBlob(blob, filename);
      
      setExportSuccess(true);
      setTimeout(() => {
        setShowExportModal(false);
        setExportSuccess(false);
        setExportLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Export failed:", error);
      setExportLoading(false);
    }
  };

  const showComingSoonModal = (feature: string) => {
    setComingSoonFeature(feature);
    setShowComingSoon(true);
  };

  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return "Recently";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const settingsGroups = [
    {
      title: "Account",
      items: [
        { icon: User, label: "Edit Profile", description: "Update your personal information", action: () => showComingSoonModal("Edit Profile") },
        { icon: Mail, label: "Email Settings", description: "Manage email preferences", action: () => showComingSoonModal("Email Settings") },
        { icon: CreditCard, label: "Payment Methods", description: "Add or remove payment options", action: () => showComingSoonModal("Payment Methods") },
        { icon: Bell, label: "Notifications", description: notifications ? "Notifications are enabled" : "Notifications are disabled", toggle: true, value: notifications, onToggle: () => setNotifications(!notifications) },
      ],
    },
    {
      title: "Budget & Categories",
      items: [
        { icon: Wallet, label: "Budget Settings", description: "Set daily, weekly, monthly limits", hasArrow: true, action: () => router.push("/budget") },
        { icon: Tags, label: "Custom Categories", description: "Create and manage categories", hasArrow: true, action: () => router.push("/categories") },
      ],
    },
    {
      title: "Preferences",
      items: [
        { icon: isDarkMode ? Sun : Moon, label: "Dark Mode", description: isDarkMode ? "Switch to light mode" : "Switch to dark mode", toggle: true, value: isDarkMode, onToggle: toggleTheme },
        { icon: Globe, label: "Language", description: selectedLanguage, hasArrow: true, action: () => showComingSoonModal("Language Selection") },
        { icon: CreditCard, label: "Currency", description: selectedCurrency, hasArrow: true, action: () => showComingSoonModal("Currency Selection") },
      ],
    },
    {
      title: "Data & Privacy",
      items: [
        { icon: Download, label: "Export Data", description: "Download your financial data", action: () => setShowExportModal(true) },
        { icon: Shield, label: "Privacy Settings", description: "Manage your data and security", action: () => showComingSoonModal("Privacy Settings") },
        { icon: Smartphone, label: "Connected Devices", description: "Manage logged in devices", action: () => showComingSoonModal("Connected Devices") },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: HelpCircle, label: "Help Center", description: "Get help and support", action: () => showComingSoonModal("Help Center") },
        { icon: Mail, label: "Contact Us", description: "Send us a message", action: () => showComingSoonModal("Contact Us") },
      ],
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      {/* User Profile Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="flex flex-col items-center text-center">
          {/* Profile Picture */}
          <div className="relative mb-4">
            {user?.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={user.name || "User"}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                <span className="text-3xl font-bold">
                  {user?.name?.split(" ").map(n => n[0]).join("") || "?"}
                </span>
              </div>
            )}
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:scale-105 transition-transform">
              <Camera className="w-4 h-4 text-emerald-600" />
            </button>
          </div>

          {/* User Name */}
          <h2 className="text-xl font-bold mb-1">{user?.name || "User"}</h2>
          <p className="text-white/80 text-sm mb-3">{user?.email || ""}</p>

          {/* User Stats */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <Calendar className="w-4 h-4" />
              <span>Member since {formatMemberSince(user?.created_at)}</span>
            </div>
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-medium">
              Free Plan
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalReceipts}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Receipts</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${stats.monthlySpent.toFixed(0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.categories}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Categories</p>
        </div>
      </div>

      <div className="space-y-6">
        {settingsGroups.map((group) => (
          <div key={group.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">{group.title}</h2>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={item.toggle ? item.onToggle : item.action}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Icon className="text-gray-600 dark:text-gray-400" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>
                    {item.toggle ? (
                      <div
                        className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${
                          item.value ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                            item.value ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/50">
            <h2 className="font-semibold text-red-600 dark:text-red-400">Danger Zone</h2>
          </div>
          <div className="p-4">
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center gap-4 p-4 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-left cursor-pointer"
            >
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <Trash2 className="text-red-600 dark:text-red-400" size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-600 dark:text-red-400">Delete Account</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and data</p>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-colors font-medium border border-gray-200 dark:border-gray-700 cursor-pointer"
        >
          <LogOut size={20} />
          <span>Log Out</span>
        </button>

        {/* App Version */}
        <p className="text-center text-sm text-gray-400 dark:text-gray-500">
          Fint v1.0.0 • Made with ❤️(Definitely not AI)
        </p>
      </div>

      {/* Coming Soon Modal */}
      <ComingSoonModal 
        isOpen={showComingSoon} 
        onClose={() => setShowComingSoon(false)} 
        feature={comingSoonFeature} 
      />

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm animate-scale-in p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600 dark:text-red-400" size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Account?</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Data Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !exportLoading && setShowExportModal(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md animate-scale-in p-6">
            {exportSuccess ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Export Complete!</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Your {exportFormat.toUpperCase()} file has been downloaded.
                </p>
              </div>
            ) : exportLoading ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 border-4 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Exporting Data...</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Please wait while we prepare your {exportFormat.toUpperCase()} file.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Receipts</h2>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Format Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Export Format
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setExportFormat("csv")}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        exportFormat === "csv"
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <FileSpreadsheet className={`w-8 h-8 ${exportFormat === "csv" ? "text-emerald-600" : "text-gray-400"}`} />
                      <span className={`font-medium ${exportFormat === "csv" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}>
                        CSV
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Spreadsheet</span>
                    </button>
                    <button
                      onClick={() => setExportFormat("pdf")}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                        exportFormat === "pdf"
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <FileText className={`w-8 h-8 ${exportFormat === "pdf" ? "text-emerald-600" : "text-gray-400"}`} />
                      <span className={`font-medium ${exportFormat === "pdf" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}>
                        PDF
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Document</span>
                    </button>
                  </div>
                </div>

                {/* Timeframe Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Time Period
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "all", label: "All Time" },
                      { value: "month", label: "Last Month" },
                      { value: "week", label: "Last Week" },
                      { value: "custom", label: "Custom" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setExportTimeframe(option.value as typeof exportTimeframe)}
                        className={`py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                          exportTimeframe === option.value
                            ? "bg-emerald-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Date Range */}
                {exportTimeframe === "custom" && (
                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                )}

                {/* Export Button */}
                <button
                  onClick={handleExportData}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Export {exportFormat.toUpperCase()}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
