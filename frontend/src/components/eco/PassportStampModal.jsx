import React from "react";
import { X, Sparkles, CheckCircle2, ShieldCheck, Stamp, Award, Calendar, MapPin, Download, Share2 } from "lucide-react";

export default function PassportStampModal({ isOpen, onClose, pledge }) {
  if (!isOpen || !pledge) return null;

  const formattedDate = pledge.pledgeDate
    ? new Date(pledge.pledgeDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#FFFDF9] rounded-3xl shadow-2xl border-2 border-[#138808]/40 overflow-hidden z-10 animate-in zoom-in-95 duration-200 text-[#2D1B00]">
        {/* Top Gold & Green ribbon */}
        <div className="h-3 w-full bg-gradient-to-r from-[#138808] via-[#F5A623] to-[#FF6B1A]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors z-20"
        >
          <X size={16} />
        </button>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#138808]/10 text-[#138808] text-[11px] font-bold uppercase tracking-widest mb-1">
              <Sparkles size={12} />
              <span>Official Digital Eco-Certificate</span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#8B1A1A]">
              Sustainable Voyager Oath
            </h3>
            <p className="text-xs text-stone-500">
              Verified Green Commitment for Mindful Travel in India
            </p>
          </div>

          {/* Authentic Passport Stamp Badge */}
          <div className="relative p-6 rounded-3xl bg-gradient-to-br from-[#FFF8EE] via-white to-[#F0FFF0] border-2 border-dashed border-[#138808]/50 shadow-inner space-y-4">
            
            {/* Rubber Stamp Graphic */}
            <div className="absolute top-4 right-4 opacity-80 pointer-events-none transform rotate-12">
              <div className="w-20 h-20 rounded-full border-4 border-double border-[#138808] p-1 flex flex-col items-center justify-center text-[#138808] text-center font-serif leading-none shadow-sm">
                <span className="text-[7px] font-bold uppercase tracking-tighter">TRAVEL IN DEPTH</span>
                <span className="text-xs font-black my-0.5">VERIFIED</span>
                <span className="text-[8px] font-bold">ECO-SEAL</span>
              </div>
            </div>

            {/* Traveler & Destination Info */}
            <div className="space-y-1.5 pr-14">
              <div className="flex items-center gap-1.5 text-xs text-[#8B1A1A] font-bold uppercase tracking-wider">
                <MapPin size={13} className="text-[#FF6B1A]" />
                <span>Destination Pledged:</span>
              </div>
              <h4 className="text-xl font-serif font-black text-[#138808]">
                {pledge.tripDestination}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-stone-200">
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400">Pledged By</p>
                <p className="font-bold text-stone-800">{pledge.userName || "Explorer"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-stone-400">Date Sealed</p>
                <p className="font-bold text-stone-800">{formattedDate}</p>
              </div>
            </div>

            {/* Commitments List */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Pledged Micro-Actions:
              </p>
              <div className="space-y-1.5">
                {(pledge.pledges || []).map((p, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                    <CheckCircle2 size={14} className="text-[#138808] shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Unique Stamp Code */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
              <span className="font-mono bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-300 font-bold text-[#8B1A1A]">
                CODE: {pledge.stampId}
              </span>
              <span className="text-[#138808] font-bold flex items-center gap-1">
                <ShieldCheck size={14} /> Certified
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-full bg-[#138808] hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
