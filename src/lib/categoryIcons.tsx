import {
  Utensils,
  ShoppingBag,
  Car,
  Gamepad2,
  Zap,
  Heart,
  GraduationCap,
  MoreHorizontal,
  Receipt,
  Coffee,
  Plane,
  Home,
  Smartphone,
  Gift,
  Shirt,
  type LucideIcon,
} from "lucide-react";

export interface CategoryConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  darkBgColor: string;
}

// Category configuration with icons and colors
export const categoryConfig: Record<string, CategoryConfig> = {
  "Food & Dining": {
    icon: Utensils,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100",
    darkBgColor: "dark:bg-orange-900/30",
  },
  "Shopping": {
    icon: ShoppingBag,
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-100",
    darkBgColor: "dark:bg-pink-900/30",
  },
  "Transportation": {
    icon: Car,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100",
    darkBgColor: "dark:bg-blue-900/30",
  },
  "Entertainment": {
    icon: Gamepad2,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100",
    darkBgColor: "dark:bg-purple-900/30",
  },
  "Bills & Utilities": {
    icon: Zap,
    color: "text-yellow-600 dark:text-yellow-400",
    bgColor: "bg-yellow-100",
    darkBgColor: "dark:bg-yellow-900/30",
  },
  "Healthcare": {
    icon: Heart,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100",
    darkBgColor: "dark:bg-red-900/30",
  },
  "Education": {
    icon: GraduationCap,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100",
    darkBgColor: "dark:bg-indigo-900/30",
  },
  "Travel": {
    icon: Plane,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100",
    darkBgColor: "dark:bg-cyan-900/30",
  },
  "Housing": {
    icon: Home,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100",
    darkBgColor: "dark:bg-teal-900/30",
  },
  "Electronics": {
    icon: Smartphone,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100",
    darkBgColor: "dark:bg-slate-900/30",
  },
  "Gifts": {
    icon: Gift,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100",
    darkBgColor: "dark:bg-rose-900/30",
  },
  "Clothing": {
    icon: Shirt,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100",
    darkBgColor: "dark:bg-violet-900/30",
  },
  "Coffee": {
    icon: Coffee,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100",
    darkBgColor: "dark:bg-amber-900/30",
  },
  "Other": {
    icon: MoreHorizontal,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-100",
    darkBgColor: "dark:bg-gray-700",
  },
};

// Default config for unknown categories
const defaultConfig: CategoryConfig = {
  icon: Receipt,
  color: "text-emerald-600 dark:text-emerald-400",
  bgColor: "bg-emerald-100",
  darkBgColor: "dark:bg-emerald-900/30",
};

// Get category configuration (with fallback to default)
export function getCategoryConfig(category: string): CategoryConfig {
  return categoryConfig[category] || defaultConfig;
}

// Get icon component for a category
export function getCategoryIcon(category: string): LucideIcon {
  return getCategoryConfig(category).icon;
}

// Get color classes for a category
export function getCategoryColors(category: string): {
  color: string;
  bgColor: string;
  darkBgColor: string;
} {
  const config = getCategoryConfig(category);
  return {
    color: config.color,
    bgColor: config.bgColor,
    darkBgColor: config.darkBgColor,
  };
}
