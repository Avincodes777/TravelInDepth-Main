import React, { useState } from "react";
import {
  ShieldCheck,
  Sparkles,
  MapPin,
  CheckSquare,
  Square,
  Send,
  Stamp,
  Award,
  Leaf,
  HeartHandshake,
} from "lucide-react";

const OATH_COMMITMENTS = [
  {
    id: "plastic_free",
    label: "Zero Single-Use Plastics",
    desc: "Refill reusable water flasks and refuse single-use carry bags.",
    icon: "💧",
  },
  {
    id: "indigenous_economy",
    label: "Support Local & Indigenous Artisans",
    desc: "Purchase authentic handicrafts and dine at family-run local eateries.",
    icon: "🤝",
  },
  {
    id: "wildlife_nature",
    label: "Respect Wildlife & Natural Habitats",
    desc: "Stay on designated trails, leave no trace, and observe wildlife without disturbance.",
    icon: "🦌",
  },
  {
    id: "low_carbon",
    label: "Prioritize Low-Carbon Transit",
    desc: "Opt for Indian railways, e-rickshaws, cycles, or walking wherever feasible.",
    icon: "🚆",
  },
  {
    id: "cultural_respect",
    label: "Honor Local Traditions & Heritage",
    desc: "Dress respectfully at sacred places and preserve monuments without defacing.",
    icon: "🏛️",
  },
];

export default function EcoPledgeCard({ onSealPledge, defaultDestination = "" }) {
  const [destination, setDestination] = useState(defaultDestination);
  const [selectedPledges, setSelectedPledges] = useState([
    "Zero Single-Use Plastics",
    "Support Local & Indigenous Artisans",
    "Prioritize Low-Carbon Transit",
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const togglePledge = (label) => {
    if (selectedPledges.includes(label)) {
      setSelectedPledges(selectedPledges.filter((item) => item !== label));
    } else {
      setSelectedPledges([...selectedPledges, label]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPledges.length === OATH_COMMITMENTS.length) {
      setSelectedPledges([]);
    } else {
      setSelectedPledges(OATH_COMMITMENTS.map((c) => c.label));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!destination.trim()) {
      setError("Please specify the destination or region you are pledging for.");
      return;
    }

    if (selectedPledges.length === 0) {
      setError("Please check at least one mindful commitment.");
      return;
    }

    try {
      setSubmitting(true);
      await onSealPledge({
        tripDestination: destination.trim(),
        pledges: selectedPledges,
      });
      // Clear or keep destination
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to seal pledge. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FDF9F3] to-[#F3FAF0] rounded-3xl p-6 sm:p-8 border-2 border-[#138808]/30 shadow-xl relative overflow-hidden space-y-6">
      {/* Background Ambience / Stamp watermark */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-[#138808]/5 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E8DCC4] pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#138808] text-white flex items-center justify-center shadow-md shadow-green-950/20 shrink-0">
            <HeartHandshake size={24} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#138808]/10 text-[#138808] text-[10px] font-bold uppercase tracking-widest mb-1">
              <Sparkles size={11} />
              <span>Digital Green Passport</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#8B1A1A]">
              Take the Sustainable Voyager Oath
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSelectAll}
          className="text-xs font-bold text-[#138808] hover:underline"
        >
          {selectedPledges.length === OATH_COMMITMENTS.length
            ? "Deselect All"
            : "Select All Commitments"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Destination input */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-2">
            Pledge for Upcoming Trip / Destination <span className="text-[#FF6B1A]">*</span>
          </label>
          <div className="relative">
            <MapPin
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF6B1A]"
            />
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Manali, Spiti Valley, Munnar, Varanasi..."
              required
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-[#E8DCC4] text-stone-800 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#138808]/30 focus:border-[#138808] shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Micro-Action Commitment Checklist */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#138808]">
            Your Micro-Action Commitments:
          </label>

          <div className="grid grid-cols-1 gap-2.5">
            {OATH_COMMITMENTS.map((item) => {
              const isChecked = selectedPledges.includes(item.label);
              return (
                <div
                  key={item.id}
                  onClick={() => togglePledge(item.label)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      togglePledge(item.label);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isChecked
                      ? "bg-white border-[#138808] shadow-sm"
                      : "bg-[#FFFDF9]/60 border-[#E8DCC4] hover:bg-white hover:border-stone-400"
                  }`}
                >
                  <div className="text-xl shrink-0 mt-0.5">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold ${
                          isChecked ? "text-[#138808]" : "text-stone-800"
                        }`}
                      >
                        {item.label}
                      </span>
                      {isChecked ? (
                        <CheckSquare size={16} className="text-[#138808]" />
                      ) : (
                        <Square size={16} className="text-stone-300" />
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit & Seal Oath Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E8DCC4]">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Stamp size={15} className="text-[#138808]" />
            <span>Generates an official digital Passport Eco-Stamp</span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#138808] via-emerald-600 to-[#138808] hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-green-950/20 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sealing Oath...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Seal Your Pledge & Earn Stamp</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
