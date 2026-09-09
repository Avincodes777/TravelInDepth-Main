import React from "react";
import { CheckCircle2, Sparkles, X } from "lucide-react";

export default function ReviewSuccessToast({ show, message, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[130] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="bg-[#120600] text-white p-5 rounded-3xl shadow-2xl border border-[#FF6B1A]/40 flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#138808] to-emerald-600 flex items-center justify-center shrink-0 shadow-md">
          <CheckCircle2 size={22} className="text-white" />
        </div>
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F5A623]">
            <Sparkles size={13} />
            <span>Review Published!</span>
          </div>
          <p className="text-sm text-stone-200 mt-1 leading-relaxed">
            {message || "🎉 Thank you! Your valuable review has been successfully submitted and is now live."}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-white p-1 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
