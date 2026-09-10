import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/**
 * ThemeToggle Component
 * Supports both inline (navbar/header) and floating presentation styles
 */
export default function ThemeToggle({ className = "", isScrolled = false, variant = "nav" }) {
  const { isDarkMode, toggleTheme } = useTheme();

  if (variant === "floating") {
    return (
      <button
        onClick={toggleTheme}
        aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={`fixed bottom-6 right-6 z-50 p-3.5 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer border ${
          isDarkMode
            ? "bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700 shadow-amber-500/10"
            : "bg-white text-slate-800 border-amber-200 hover:bg-amber-50 shadow-orange-950/15"
        } ${className}`}
      >
        {isDarkMode ? (
          <Sun size={20} className="transition-transform duration-500 rotate-0 hover:rotate-90 text-amber-400" />
        ) : (
          <Moon size={20} className="transition-transform duration-500 rotate-0 hover:-rotate-12 text-slate-800" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative p-2 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer border ${
        isScrolled
          ? "bg-white/10 hover:bg-white/20 border-white/20 text-white"
          : isDarkMode
          ? "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-amber-300"
          : "bg-black/5 hover:bg-black/10 border-black/10 text-slate-800"
      } ${className}`}
    >
      {isDarkMode ? (
        <Sun size={17} className="transition-transform duration-500 rotate-0 hover:rotate-90 text-amber-400" />
      ) : (
        <Moon size={17} className="transition-transform duration-500 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
