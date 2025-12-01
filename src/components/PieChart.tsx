"use client";

import { useState, useEffect, useMemo } from "react";

interface PieChartProps {
  data: { category: string; amount: number; color: string }[];
  size?: number;
}

interface Segment {
  category: string;
  amount: number;
  color: string;
  percent: number;
  startAngle: number;
  endAngle: number;
}

export default function PieChart({ data, size = 200 }: PieChartProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const total = data.reduce((sum, item) => sum + item.amount, 0);
  const radius = size / 2;
  const innerRadius = radius * 0.6;
  
  // Calculate segments using reduce to avoid reassignment
  const segments: Segment[] = useMemo(() => {
    if (data.length <= 1) return [];
    
    const result: Segment[] = [];
    let cumulative = 0;
    
    for (const item of data) {
      const percent = (item.amount / total) * 100;
      const startAngle = cumulative * 3.6;
      cumulative += percent;
      const endAngle = cumulative * 3.6;
      
      result.push({
        ...item,
        percent,
        startAngle,
        endAngle,
      });
    }
    
    return result;
  }, [data, total]);
  
  // Create SVG path for each segment
  const createArcPath = (startAngle: number, endAngle: number, r: number) => {
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    
    const x1 = Math.round((r + r * Math.cos(startRad)) * 1000) / 1000;
    const y1 = Math.round((r + r * Math.sin(startRad)) * 1000) / 1000;
    const x2 = Math.round((r + r * Math.cos(endRad)) * 1000) / 1000;
    const y2 = Math.round((r + r * Math.sin(endRad)) * 1000) / 1000;
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${r} ${r} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };
  
  if (total === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full"
        style={{ width: size, height: size }}
      >
        <span className="text-gray-400 dark:text-gray-500 text-sm">No data</span>
      </div>
    );
  }

  // Show placeholder during SSR to avoid hydration mismatch
  if (!isMounted) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <div 
          className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse"
        />
      </div>
    );
  }

  // Special case: only one category - render a full circle
  if (data.length === 1) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Full circle for single category */}
          <circle
            cx={radius}
            cy={radius}
            r={radius}
            fill={data[0].color}
            className="transition-all duration-300"
          />
          {/* Inner circle for donut effect */}
          <circle
            cx={radius}
            cy={radius}
            r={innerRadius}
            className="fill-white dark:fill-gray-800"
          />
        </svg>
        {/* Center text */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ pointerEvents: "none" }}
        >
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${total.toFixed(0)}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((segment, index) => (
          <path
            key={index}
            d={createArcPath(segment.startAngle, segment.endAngle, radius)}
            fill={segment.color}
            className="transition-all duration-300 hover:opacity-80"
            style={{ cursor: "pointer" }}
          />
        ))}
        {/* Inner circle for donut effect */}
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          className="fill-white dark:fill-gray-800"
        />
      </svg>
      {/* Center text */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ pointerEvents: "none" }}
      >
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          ${total.toFixed(0)}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Total</span>
      </div>
    </div>
  );
}

// Category colors for consistent coloring
export const categoryColors: Record<string, string> = {
  "Food & Dining": "#10b981", // emerald
  "Shopping": "#3b82f6", // blue
  "Transportation": "#f59e0b", // amber
  "Entertainment": "#8b5cf6", // violet
  "Bills & Utilities": "#ef4444", // red
  "Healthcare": "#ec4899", // pink
  "Education": "#06b6d4", // cyan
  "Other": "#6b7280", // gray
};

export const getCategoryColor = (category: string): string => {
  return categoryColors[category] || categoryColors["Other"];
};
