"use client";

import { Bell, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

interface HeaderProps {
  title: string;
  userName?: string;
  onProfileClick: () => void;
}

export default function Header({ title, userName = "John Doe", onProfileClick }: HeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  const initials = userName.split(" ").map(n => n[0]).join("");

  return (
    <header className="flex items-center justify-between mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
      
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Notifications */}
        <button 
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <button
          onClick={onProfileClick}
          className="flex items-center gap-2 p-1 sm:pr-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label="Go to profile"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium text-sm">
            {initials}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
            {userName.split(" ")[0]}
          </span>
        </button>
      </div>
    </header>
  );
}
