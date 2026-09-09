import React, { useState, useEffect } from "react";
import {
  MapPin,
  ThumbsUp,
  Filter,
  Plus,
  Search,
  RefreshCw,
  Droplets,
  Utensils,
  Bus,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Globe2,
  Radio,
} from "lucide-react";
import { getEcoSpots, createEcoSpot, upvoteEcoSpot } from "../../api/ecoApi";
import ShareGreenSpotModal from "./ShareGreenSpotModal";

const CATEGORIES = [
  "All",
  "Refill Station",
  "Zero-Waste Eatery",
  "Public Transit Tip",
  "Eco-Alert",
];

const categoryStyles = {
  "Refill Station": {
    bg: "bg-blue-50 text-blue-800 border-blue-200",
    icon: "💧",
  },
  "Zero-Waste Eatery": {
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: "🥗",
  },
  "Public Transit Tip": {
    bg: "bg-amber-50 text-amber-800 border-amber-200",
    icon: "🚆",
  },
  "Eco-Alert": {
    bg: "bg-rose-50 text-rose-800 border-rose-200",
    icon: "⚠️",
  },
};

export default function EcoSpotsFeed({ userName = "" }) {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [upvotingIds, setUpvotingIds] = useState([]);

  const fetchSpotsList = async (isManual = false) => {
    try {
      if (isManual) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const res = await getEcoSpots({
        category: selectedCategory,
        search: searchQuery,
      });

      if (res && res.success) {
        setSpots(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load eco spots:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSpotsList(false);
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSpotsList(false);
  };

  const handleManualRefresh = () => {
    fetchSpotsList(true);
  };

  const handleUpvote = async (id) => {
    try {
      setUpvotingIds((prev) => [...prev, id]);
      const res = await upvoteEcoSpot(id);
      if (res && res.data) {
        setSpots((prev) =>
          prev.map((spot) =>
            spot._id === id
              ? {
                  ...spot,
                  upvotes: res.data.upvotes,
                  isUpvoted: res.data.isUpvoted,
                }
              : spot
          )
        );
      }
    } catch (err) {
      console.error("Failed to upvote:", err);
    } finally {
      setUpvotingIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleSpotSubmitted = async (spotData) => {
    const res = await createEcoSpot(spotData);
    if (res && res.data) {
      setSpots((prev) => [res.data, ...prev]);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8DCC4] shadow-sm space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F0E4D4] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#138808]/10 text-[#138808] text-[10px] font-bold uppercase tracking-widest mb-1">
            <Radio size={11} className="text-[#138808] animate-pulse" />
            <span>Live Open Eco-Data & Community Feed</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#8B1A1A]">
            Community Eco-Map & Verified Tips
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time environmental advisories, zero-waste eateries, water refill stations & transit hacks.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Refresh button - triggers GET /api/eco/spots */}
          <button
            onClick={handleManualRefresh}
            disabled={loading || isRefreshing}
            title="Refresh green spots and live eco-alerts"
            className="p-2.5 rounded-2xl bg-[#FFF8F0] border border-[#E8DCC4] text-stone-600 hover:text-[#138808] hover:border-[#138808] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading || isRefreshing ? "animate-spin text-[#138808]" : ""} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full bg-gradient-to-r from-[#138808] to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus size={15} />
            <span>Share a Green Spot</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all shrink-0 ${
                  isActive
                    ? "bg-[#138808] text-white shadow-md shadow-green-950/20"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                {cat === "All" ? "✨ All Spots" : cat}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="text"
              placeholder="Search spots by city or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-2xl bg-[#FFFDF9] border border-[#E8DCC4] text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#138808]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-2xl transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Spots Grid with Skeleton Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DCC4] animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-6 w-28 bg-stone-200 rounded-full" />
                <div className="h-4 w-20 bg-stone-200 rounded-full" />
              </div>
              <div className="h-5 w-3/4 bg-stone-200 rounded-md" />
              <div className="space-y-2">
                <div className="h-3.5 w-full bg-stone-200 rounded" />
                <div className="h-3.5 w-5/6 bg-stone-200 rounded" />
              </div>
              <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
                <div className="h-4 w-24 bg-stone-200 rounded" />
                <div className="h-6 w-12 bg-stone-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : spots.length === 0 ? (
        <div className="p-10 rounded-2xl bg-[#FFFDF9] border border-dashed border-[#E8DCC4] text-center max-w-md mx-auto space-y-3">
          <p className="text-2xl">🌿</p>
          <h4 className="font-serif text-lg font-bold text-stone-800">No Spots Found</h4>
          <p className="text-xs text-stone-500">
            Be the very first traveler to drop an eco-friendly tip or refill location for this category!
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2 rounded-full bg-[#138808] text-white text-xs font-bold uppercase tracking-wider"
          >
            Drop First Tip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {spots.map((spot) => {
            const catStyle = categoryStyles[spot.category] || {
              bg: "bg-stone-100 text-stone-800 border-stone-200",
              icon: "📍",
            };

            const isUpvoting = upvotingIds.includes(spot._id);

            return (
              <div
                key={spot._id || Math.random()}
                className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#E8DCC4] hover:border-[#138808]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Top Meta */}
                  <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${catStyle.bg}`}
                      >
                        <span>{catStyle.icon}</span>
                        <span>{spot.category}</span>
                      </span>

                      {/* Automated Feed Badge */}
                      {spot.isAutomated && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                          <Globe2 size={11} className="text-teal-600" />
                          <span>Live OpenData</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-stone-400">
                      <MapPin size={12} className="text-[#FF6B1A]" />
                      <span className="font-semibold text-stone-600">{spot.location}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#138808] transition-colors">
                    {spot.title}
                  </h4>
                  <p className="text-xs text-stone-600 mt-2 leading-relaxed whitespace-pre-line">
                    {spot.description}
                  </p>
                </div>

                {/* Submitter & Upvote footer */}
                <div className="mt-5 pt-3.5 border-t border-[#F0E4D4] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-stone-500 text-[11px]">
                    <div className="w-6 h-6 rounded-full bg-[#138808]/10 text-[#138808] font-bold flex items-center justify-center text-[10px]">
                      {spot.isAutomated ? "🌍" : spot.submitterName?.charAt(0) || "G"}
                    </div>
                    <span>
                      {spot.isAutomated ? (
                        <>Source: <b>{spot.source || "Eco-Watch Network"}</b></>
                      ) : (
                        <>Shared by <b>{spot.submitterName || "Explorer"}</b></>
                      )}
                    </span>
                  </div>

                  {/* Upvote Button */}
                  <button
                    onClick={() => handleUpvote(spot._id)}
                    disabled={isUpvoting || !spot._id}
                    className={`px-3.5 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 transition-all ${
                      spot.isUpvoted
                        ? "bg-[#138808] text-white border-[#138808]"
                        : "bg-white text-stone-700 border-[#E8DCC4] hover:border-[#138808] hover:text-[#138808]"
                    }`}
                  >
                    <ThumbsUp size={13} className={spot.isUpvoted ? "fill-white" : ""} />
                    <span>{spot.upvotes || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <ShareGreenSpotModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSpot={handleSpotSubmitted}
        defaultName={userName}
      />
    </div>
  );
}
