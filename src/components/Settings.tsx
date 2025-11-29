"use client";

import { useState } from "react";
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
  Calendar
} from "lucide-react";
import ComingSoonModal from "./ComingSoonModal";
import { useTheme } from "./ThemeProvider";
import Image from "next/image";

export default function Settings() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const [notifications, setNotifications] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState("");
  const [selectedLanguage] = useState("English (US)");
  const [selectedCurrency] = useState("USD ($)");

  // Mock user data - in a real app, this would come from your auth context/API
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: null, // Could be a URL to user's profile picture
    memberSince: "November 2025",
    plan: "Premium",
  };

  const handleLogout = () => {
    // Clear any stored data
    localStorage.removeItem("user");
    // Redirect to login
    router.push("/login");
  };

  const handleExportData = () => {
    setShowExportModal(true);
    // Simulate export
    setTimeout(() => {
      setShowExportModal(false);
    }, 2000);
  };

  const showComingSoonModal = (feature: string) => {
    setComingSoonFeature(feature);
    setShowComingSoon(true);
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
        { icon: Download, label: "Export Data", description: "Download your financial data", action: handleExportData },
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
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30">
                <span className="text-3xl font-bold">
                  {user.name.split(" ").map(n => n[0]).join("")}
                </span>
              </div>
            )}
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:scale-105 transition-transform">
              <Camera className="w-4 h-4 text-emerald-600" />
            </button>
          </div>

          {/* User Name */}
          <h2 className="text-xl font-bold mb-1">{user.name}</h2>
          <p className="text-white/80 text-sm mb-3">{user.email}</p>

          {/* User Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <Calendar className="w-4 h-4" />
              <span>Member since {user.memberSince}</span>
            </div>
            <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-medium">
              {user.plan}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Receipts</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">$2.4k</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">This Month</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
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
                  onClick={() => { setShowDeleteModal(false); router.push("/login"); }}
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
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm animate-scale-in p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Exporting Data...</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Please wait while we prepare your data for download.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
