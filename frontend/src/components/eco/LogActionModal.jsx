import React, { useState } from "react";
import { Leaf, X, Sparkles, Send, CheckCircle2, ShieldCheck, Footprints, Train, Droplets, DollarSign, Bike, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

const ACTION_PRESETS = [
  {
    type: "public_transit",
    title: "Train / Electric Bus Travel",
    icon: "🚆",
    carbon: 35,
    bottles: 0,
    local: 15,
    desc: "Took train instead of short-haul flight or private taxi",
  },
  {
    type: "reusable_bottle",
    title: "Refilled Reusable Water Flask",
    icon: "💧",
    carbon: 2,
    bottles: 6,
    local: 0,
    desc: "Avoided single-use disposable plastic bottles on journey",
  },
  {
    type: "eco_lodge",
    title: "Stayed in Solar / Eco-Homestay",
    icon: "🏡",
    carbon: 25,
    bottles: 4,
    local: 40,
    desc: "Supported zero-waste, solar-powered local heritage stay",
  },
  {
    type: "local_vendor",
    title: "Ate at Indigenous / Local Eateries",
    icon: "🍲",
    carbon: 8,
    bottles: 2,
    local: 25,
    desc: "Supported local artisans, farmers, and traditional chefs",
  },
  {
    type: "cycling_walking",
    title: "City Walking / Cycle Tour",
    icon: "🚲",
    carbon: 12,
    bottles: 0,
    local: 10,
    desc: "Zero-emission exploration of alleys & temples",
  },
];

export default function LogActionModal({ isOpen, onClose, onActionLogged }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedPreset, setSelectedPreset] = useState(ACTION_PRESETS[0]);
  const [title, setTitle] = useState(ACTION_PRESETS[0].title);
  const [carbonSaved, setCarbonSaved] = useState(ACTION_PRESETS[0].carbon);
  const [bottlesPrevented, setBottlesPrevented] = useState(ACTION_PRESETS[0].bottles);
  const [localSpent, setLocalSpent] = useState(ACTION_PRESETS[0].local);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLoginRedirect = () => {
    onClose();
    navigate("/login");
  };

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setTitle(preset.title);
    setCarbonSaved(preset.carbon);
    setBottlesPrevented(preset.bottles);
    setLocalSpent(preset.local);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Please sign in to log a sustainable travel action.");
      return;
    }

    const carbon = Number(carbonSaved) || 0;
    const bottles = Number(bottlesPrevented) || 0;
    const local = Number(localSpent) || 0;

    if (carbon <= 0 && bottles <= 0 && local <= 0) {
      setError("Please specify at least one positive eco metric.");
      return;
    }

    if (carbon > 500) {
      setError("Carbon saved cannot exceed 500 kg per single action.");
      return;
    }
    if (bottles > 50) {
      setError("Bottles saved cannot exceed 50 per single action.");
      return;
    }
    if (local > 5000) {
      setError("Local spending cannot exceed $5,000 per single action.");
      return;
    }

    try {
      setLoading(true);
      await onActionLogged({
        actionType: selectedPreset?.type || "custom",
        title: title.trim() || "Sustainable Travel Choice",
        carbonSavedKg: carbon,
        bottlesPrevented: bottles,
        localSpentUSD: local,
        notes: notes.trim(),
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to log action. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-[#FFFDF9] rounded-3xl shadow-2xl border border-[#E8DCC4] overflow-hidden z-10 animate-in zoom-in-95">
        <div className="h-2.5 w-full bg-gradient-to-r from-[#138808] via-[#22c55e] to-[#FF6B1A]" />

        <div className="px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between border-b border-[#F0E4D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#138808]/10 border border-[#138808]/20 flex items-center justify-center text-[#138808]">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#138808]">
                Log a Green Choice 🌱
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Record your eco-friendly decision and boost your Community Impact Tier.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* If logged out, render Locked / Login-Prompt State */}
        {!user ? (
          <div className="p-8 sm:p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#138808] to-emerald-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-green-950/20">
              <Lock size={28} />
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h4 className="font-serif text-2xl font-bold text-[#138808]">
                Sign In to Log Eco-Actions
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                To maintain authentic community impact stats and badges, sustainability actions must be recorded on a verified traveler account.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#138808] to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-green-950/20 transition-all hover:scale-105 active:scale-95"
              >
                Sign In / Log In to Log Action
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* Presets */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#138808] mb-2.5">
                Quick Action Presets
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ACTION_PRESETS.map((preset) => {
                  const isSelected = selectedPreset?.type === preset.type;
                  return (
                    <button
                      key={preset.type}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-2xl text-left border transition-all text-xs flex items-start gap-2.5 ${
                        isSelected
                          ? "bg-[#138808]/10 border-[#138808] text-[#138808] font-bold shadow-sm"
                          : "bg-white border-[#E8DCC4] text-stone-600 hover:border-stone-400"
                      }`}
                    >
                      <span className="text-xl">{preset.icon}</span>
                      <div>
                        <p className="font-bold">{preset.title}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5 font-normal">{preset.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#138808] mb-2">
                Action Description / Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Took Shatabdi Express from Delhi to Agra"
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#E8DCC4] text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#138808]/30 focus:border-[#138808]"
              />
            </div>

            {/* Metric Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-[#E8DCC4]">
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  🌱 CO₂ Saved (kg, max 500)
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  step="0.5"
                  value={carbonSaved}
                  onChange={(e) => setCarbonSaved(e.target.value)}
                  className="w-full font-bold text-base text-[#138808] focus:outline-none"
                />
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E8DCC4]">
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  💧 Bottles Saved (max 50)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={bottlesPrevented}
                  onChange={(e) => setBottlesPrevented(e.target.value)}
                  className="w-full font-bold text-base text-[#138808] focus:outline-none"
                />
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#E8DCC4]">
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  🤝 Local Spent ($ max 5000)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={localSpent}
                  onChange={(e) => setLocalSpent(e.target.value)}
                  className="w-full font-bold text-base text-[#138808] focus:outline-none"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#138808] mb-2">
                Personal Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add details about your stay, vendor names, or tips..."
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#E8DCC4] text-stone-800 text-xs focus:outline-none focus:border-[#138808] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#F0E4D4]">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-7 py-3 rounded-full bg-gradient-to-r from-[#138808] to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-green-900/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Logging...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Save Eco Action</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

