import React from "react";
import { Star, MessageSquarePlus, Sparkles, ArrowRight } from "lucide-react";

export default function AddReviewCard({ onOpenModal }) {
  return (
    <div
      onClick={onOpenModal}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenModal();
        }
      }}
      className="group relative cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-[#8B1A1A] via-[#A82424] to-[#FF6B1A] p-8 text-white shadow-xl hover:shadow-2xl hover:shadow-orange-950/30 transition-all duration-300 hover:scale-[1.01] border border-white/10"
    >
      {/* Decorative Orbs */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-[#F5A623]/20 blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wider mb-3.5">
            <Sparkles size={13} className="text-[#F5A623]" />
            <span>Community Voice</span>
          </div>

          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-snug">
            Traveled with us or explored a spot?
          </h3>
          <p className="text-white/80 text-sm sm:text-base mt-2 leading-relaxed">
            Share your authentic stories, rate your experience, report issues, or suggest improvements to help fellow explorers navigate India.
          </p>

          <div className="flex items-center gap-3 mt-4 text-xs font-medium text-amber-200">
            <div className="flex items-center text-[#F5A623]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={15} fill="currentColor" />
              ))}
            </div>
            <span>• 100% Real Community Reviews</span>
          </div>
        </div>

        <div className="shrink-0 w-full sm:w-auto">
          <div className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-[#8B1A1A] font-bold text-sm uppercase tracking-wider shadow-lg group-hover:bg-amber-100 group-hover:scale-105 active:scale-95 transition-all">
            <MessageSquarePlus size={18} className="text-[#FF6B1A]" />
            <span>Write a Review</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
