import React, { useState } from "react";
import { X, Sparkles, Send, MapPin, AlertCircle, Droplets, Utensils, Bus, AlertTriangle, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

const SPOT_CATEGORIES = [
  {
    value: "Refill Station",
    label: "Refill Station",
    icon: "💧",
    desc: "Free / cheap clean RO water refills for flasks",
  },
  {
    value: "Zero-Waste Eatery",
    label: "Zero-Waste Eatery",
    icon: "🥗",
    desc: "Compostable packing, organic farm-to-table food",
  },
  {
    value: "Public Transit Tip",
    label: "Public Transit Tip",
    icon: "🚆",
    desc: "Electric buses, shared rickshaws, cycles, metro",
  },
  {
    value: "Eco-Alert",
    label: "Eco-Alert",
    icon: "⚠️",
    desc: "Trail cleanliness alerts, wildlife notices, advisories",
  },
];

export default function ShareGreenSpotModal({ isOpen, onClose, onSubmitSpot }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Refill Station");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLoginRedirect = () => {
    onClose();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!user) {
      setError("Please sign in to publish an eco-spot.");
      return;
    }

    if (!title.trim()) {
      setError("Please provide a spot or alert name.");
      return;
    }
    if (!location.trim()) {
      setError("Please specify the city or exact location.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError("Please provide a helpful description (at least 10 characters).");
      return;
    }

    try {
      setLoading(true);
      await onSubmitSpot({
        title: title.trim(),
        category,
        location: location.trim(),
        description: description.trim(),
      });
      // Reset form
      setTitle("");
      setLocation("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to share spot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-[#FFFDF9] rounded-3xl shadow-2xl border border-[#E8DCC4] overflow-hidden z-10 animate-in zoom-in-95 text-[#2D1B00]">
        <div className="h-2.5 w-full bg-gradient-to-r from-[#138808] via-[#22c55e] to-[#FF6B1A]" />

        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between border-b border-[#F0E4D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#138808]/10 text-[#138808] flex items-center justify-center font-bold text-lg">
              📍
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#138808]">
                Share a Green Spot or Alert
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Help fellow mindful travelers find refill spots, organic food & eco-tips across India.
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
                Sign In to Share Eco-Spots
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                To keep crowdsourced green tips and advisories authentic, eco-spots must be submitted by verified community members.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#138808] to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-green-950/20 transition-all hover:scale-105 active:scale-95"
              >
                Sign In / Log In to Contribute
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
          /* Form Body for Logged-In User */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submitting As (Authenticated Account Badge) */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#138808] text-white flex items-center justify-center text-xs font-bold">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name?.charAt(0) || <User size={14} />
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Sharing as</p>
                  <p className="text-xs font-bold text-[#138808]">{user.name || "Green Explorer"}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#138808] bg-[#138808]/10 px-2.5 py-1 rounded-full border border-[#138808]/20">
                🌱 Eco Contributor
              </span>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#138808] mb-2">
                Category <span className="text-[#FF6B1A]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {SPOT_CATEGORIES.map((cat) => {
                  const isSelected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-2xl text-left border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#138808]/10 border-[#138808] text-[#138808] font-bold shadow-sm"
                          : "bg-white border-[#E8DCC4] text-stone-600 hover:border-stone-400"
                      }`}
                    >
                      <span className="font-semibold text-xs flex items-center gap-1.5">
                        <span>{cat.icon}</span> {cat.label}
                      </span>
                      <span className="text-[10px] text-stone-500 mt-1 font-normal line-clamp-1">{cat.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#138808] mb-1.5">
                Spot / Alert Title <span className="text-[#FF6B1A]">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Free Water ATM & Refill Point at Ghats"
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#E8DCC4] text-stone-800 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#138808]/30 focus:border-[#138808]"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#138808] mb-1.5">
                City / Exact Location <span className="text-[#FF6B1A]">*</span>
              </label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF6B1A]" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Assi Ghat, Varanasi or Old Manali Bridge"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-[#E8DCC4] text-stone-800 text-xs font-semibold placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#138808]/30 focus:border-[#138808]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#138808] mb-1.5">
                Helpful Details / Tips <span className="text-[#FF6B1A]">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how travelers can access this spot, operating hours, or why it's eco-friendly..."
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#E8DCC4] text-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-[#138808]/30 focus:border-[#138808] resize-none"
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
                className="px-7 py-3 rounded-full bg-gradient-to-r from-[#138808] to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-green-950/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Publish Green Spot</span>
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

