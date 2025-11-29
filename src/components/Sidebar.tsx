"use client";

import { LayoutDashboard, Settings, PlusCircle } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddReceipt: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onAddReceipt }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-emerald-600">Fint</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Finance Tracker</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Add Receipt Button */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={onAddReceipt}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
        >
          <PlusCircle size={20} />
          <span>Add Receipt</span>
        </button>
      </div>
    </aside>
  );
}
