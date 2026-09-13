import React, { useState } from "react";
import { Star, X, Sparkles, Send, AlertCircle, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

const CATEGORIES = [
  { value: "Location", label: "📍 Location & Destination", desc: "Spots, attractions, sights" },
  { value: "Website", label: "💻 Website & Platform", desc: "Navigation, design, speed" },
  { value: "Issue/Bug", label: "🐛 Issue or Bug", desc: "Report technical glitches" },
  { value: "General", label: "✨ General Feedback", desc: "Overall experience & thoughts" },
];

export default function ReviewModal({ isOpen, onClose, onSubmitSuccess }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [category, setCategory] = useState("Location");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
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
      setError("Please sign in to submit a review.");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setError("Please select a star rating between 1 and 5.");
      return;
    }
    if (!comment.trim() || comment.trim().length < 5) {
      setError("Please write a detailed review (at least 5 characters).");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmitSuccess({
        rating: Number(rating),
        category,
        comment: comment.trim(),
      });
      // reset form
      setCategory("Location");
      setRating(5);
      setComment("");
      onClose();
    } catch (err) {
      console.error("Submission failed:", err);
      setError(err.message || "Something went wrong while submitting. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeRating = hoverRating || rating;

  const ratingDescriptions = {
    1: "Poor — Needs vast improvement",
    2: "Fair — Had several issues",
    3: "Good — Satisfactory experience",
    4: "Great — Highly enjoyable!",
    5: "Exceptional — Absolutely loved it! 🌟",
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-[#FFFDF9] rounded-3xl shadow-2xl border border-[#E8DCC4] overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header decoration bar */}
        <div className="h-2.5 w-full bg-gradient-to-r from-[#FF6B1A] via-[#F5A623] to-[#8B1A1A]" />

        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between border-b border-[#F0E4D4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF2E8] border border-[#FF6B1A]/20 flex items-center justify-center text-[#FF6B1A]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#8B1A1A]">
                Share Your Experience
              </h3>
              <p className="text-xs text-[#8B1A1A]/60 mt-0.5">
                Your feedback helps thousands of fellow travelers explore India deeply.
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FF6B1A] to-[#8B1A1A] text-white mx-auto flex items-center justify-center shadow-lg shadow-orange-950/20">
              <Lock size={28} />
            </div>
            <div className="space-y-2 max-w-sm mx-auto">
              <h4 className="font-serif text-2xl font-bold text-[#8B1A1A]">
                Sign In to Post a Review
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                To keep community ratings authentic and prevent spam or impersonation, reviews must be tied to a verified account.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FF6B1A] to-[#8B1A1A] hover:from-[#e5590f] hover:to-[#731515] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
              >
                Sign In / Log In to Review
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
          /* Body Form for Logged-In User */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
                <AlertCircle size={18} className="shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Submitting As (Authenticated Account Badge) */}
            <div className="p-3.5 rounded-2xl bg-[#FFF8F0] border border-[#E8DCC4] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#8B1A1A] text-white flex items-center justify-center text-xs font-bold">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user.name?.charAt(0) || <User size={14} />
                  )}
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-stone-400">Reviewing as</p>
                  <p className="text-xs font-bold text-[#8B1A1A]">{user.name || "Verified Traveler"}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#138808] bg-[#138808]/10 px-2.5 py-1 rounded-full border border-[#138808]/20">
                ✓ Verified Account
              </span>
            </div>

            {/* Category Dropdown/Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-2">
                Review Category <span className="text-[#FF6B1A]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.value;
                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-2xl text-left border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#FFF2E8] border-[#FF6B1A] text-[#8B1A1A] font-bold shadow-sm"
                          : "bg-white border-[#E8DCC4] text-stone-600 hover:border-stone-400"
                      }`}
                    >
                      <span className="font-semibold text-[13px]">{cat.label}</span>
                      <span className="text-[11px] text-stone-500 mt-1 font-normal">{cat.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Rating */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-2">
                Overall Rating <span className="text-[#FF6B1A]">*</span>
              </label>
              <div className="bg-white p-4 rounded-2xl border border-[#E8DCC4] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                      aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={28}
                        className={`transition-colors duration-150 ${
                          star <= activeRating
                            ? "text-[#F5A623] fill-[#F5A623]"
                            : "text-stone-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-medium text-[#8B1A1A]/80 italic">
                  {ratingDescriptions[activeRating] || "Select your rating"}
                </span>
              </div>
            </div>

            {/* Message / Comment */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8B1A1A] mb-2">
                Your Review / Feedback <span className="text-[#FF6B1A]">*</span>
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What made your travel memorable? Or what should we improve regarding our destinations and website? Tell us your story..."
                required
                className="w-full px-4 py-3 rounded-2xl bg-white border border-[#E8DCC4] text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A] text-sm resize-none transition-all"
              />
              <div className="flex justify-between items-center text-[11px] text-stone-400 mt-1 px-1">
                <span>Markdown supported</span>
                <span>{comment.length}/2000 chars</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#F0E4D4]">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-stone-600 hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3 rounded-full bg-gradient-to-r from-[#FF6B1A] to-[#F5A623] hover:from-[#e5590f] hover:to-[#df9419] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Review</span>
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

