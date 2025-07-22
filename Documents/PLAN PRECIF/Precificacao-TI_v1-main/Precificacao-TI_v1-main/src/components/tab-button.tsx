"use client"

import { cn } from "@/lib/utils";
import { type LucideProps } from "lucide-react";
import React from "react";

interface TabButtonProps {
  label: string;
  icon: React.ReactElement<LucideProps>;
  isActive: boolean;
  onClick: () => void;
}

const TabButton = ({ label, icon, isActive, onClick }: TabButtonProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex-1 flex items-center justify-center gap-2 px-3 py-3 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:ring-ring",
      isActive
        ? 'bg-gradient-to-tr from-blue-600 to-cyan-400 text-white shadow-lg scale-105 border-2 border-cyan-300'
        : 'bg-zinc-800/70 text-zinc-300 hover:border-cyan-400 border border-transparent hover:text-white hover:bg-zinc-700/80',
      'transition-all duration-200'
    )}
    style={{ minHeight: 48 }}
  >
    {React.cloneElement(icon, { size: 18 })}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default TabButton;
