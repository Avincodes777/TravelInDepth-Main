import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, X, MapPin, Sparkles, Compass, ArrowRight, 
  Calendar, Star, Leaf, TrendingUp, Tag, HeartHandshake
} from "lucide-react";
import { useCities } from "../../context/CityContext";

// Fallback images for key destinations
const DESTINATION_FALLBACKS = {
  jaipur: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Hawa_Mahal_2010.jpg/1280px-Hawa_Mahal_2010.jpg",
  varanasi: "https://images.pexels.com/photos/36565405/pexels-photo-36565405.jpeg",
  agra: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80",
  goa: "https://images.pexels.com/photos/28368721/pexels-photo-28368721.jpeg",
  udaipur: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=80",
  mumbai: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=600&q=80",
  kerala: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80",
  manali: "https://images.unsplash.com/photo-1605649487212-47bdab064df8?w=600&q=80",
  rishikesh: "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=600&q=80",
  ladakh: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80",
  leh: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80",
  hampi: "https://images.unsplash.com/photo-1600100397608-f010f4439063?w=600&q=80",
  default: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80"
};

const getCityThumbnail = (city) => {
  if (city?.image) return city.image;
  const key = (city?.name || "").toLowerCase().trim().replace(/[^a-z]/g, "");
  for (const [k, v] of Object.entries(DESTINATION_FALLBACKS)) {
    if (k !== "default" && key.includes(k)) return v;
  }
  return DESTINATION_FALLBACKS.default;
};

const QUICK_TRENDING_TAGS = [
  { label: "Jaipur", query: "Jaipur", type: "city" },
  { label: "Varanasi", query: "Varanasi", type: "city" },
  { label: "Goa Beaches", query: "Goa", type: "city" },
  { label: "Kerala Backwaters", query: "Kerala", type: "city" },
  { label: "Ladakh", query: "Ladakh", type: "city" },
  { label: "Agra Taj", query: "Agra", type: "city" },
  { label: "Udaipur Lakes", query: "Udaipur", type: "city" },
  { label: "Hampi", query: "Hampi", type: "city" },
  { label: "Rishikesh", query: "Rishikesh", type: "city" }
];

const QUICK_SECTIONS = [
  {
    title: "AI Trip Planner",
    desc: "Generate smart custom itineraries in seconds",
    icon: Sparkles,
    color: "text-amber-500 bg-amber-500/10",
    link: "/#ai-trip-planner"
  },
  {
    title: "All Destinations",
    desc: "Explore 30+ curated cities across all regions",
    icon: Compass,
    color: "text-[#FF6B1A] bg-[#FF6B1A]/10",
    link: "/destinations"
  },
  {
    title: "Community Reviews",
    desc: "Authentic stories & traveler ratings",
    icon: Star,
    color: "text-yellow-500 bg-yellow-500/10",
    link: "/reviews"
  },
  {
    title: "Sustainable Travel",
    desc: "Carbon-neutral options & eco tips",
    icon: Leaf,
    color: "text-emerald-500 bg-emerald-500/10",
    link: "/experience"
  }
];

export default function GlobalSearchModal({ isOpen, onClose }) {
  const { cities } = useCities();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keyboard navigation & Shortcuts (Esc, Arrow keys, Enter)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered destinations based on user query
  const filteredDestinations = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const cityList = Array.isArray(cities) ? cities : [];
    return cityList.filter((city) => {
      const name = (city.name || "").toLowerCase();
      const state = (city.state || "").toLowerCase();
      const region = (city.region || "").toLowerCase();
      const tagline = (city.tagline || "").toLowerCase();
      const about = (city.about || "").toLowerCase();
      const eco = (city.ecoOptions || []).join(" ").toLowerCase();

      return (
        name.includes(q) ||
        state.includes(q) ||
        region.includes(q) ||
        tagline.includes(q) ||
        about.includes(q) ||
        eco.includes(q)
      );
    }).slice(0, 8); // Top 8 relevant matches
  }, [cities, query]);

  // Navigate to destination detail or destination search
  const handleSelectCity = (city) => {
    onClose();
    const slug = city.slug || city.name?.toLowerCase().replace(/\s+/g, "-");
    navigate(`/destinations/${slug}`);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;

    onClose();
    navigate(`/destinations?search=${encodeURIComponent(cleanQuery)}`);
  };

  const handleTagClick = (tagQuery) => {
    setQuery(tagQuery);
    inputRef.current?.focus();
  };

  const handleQuickLinkClick = (link) => {
    onClose();
    if (link.startsWith("/#")) {
      navigate("/");
      setTimeout(() => {
        const id = link.replace("/#", "");
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      navigate(link);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[200] flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-[#FFF8F0] dark:bg-[#121a2d] rounded-3xl shadow-2xl border border-[#E8DCC4] dark:border-[#273857] overflow-hidden z-10 flex flex-col max-h-[82vh]"
        >
          {/* Header Search Input */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="flex items-center gap-3 px-5 py-4 border-b border-[#E8DCC4] dark:border-[#273857] bg-white dark:bg-[#0d1527] sticky top-0 z-20"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FF6B1A]/10 text-[#FF6B1A] flex items-center justify-center shrink-0">
              <Search size={20} className="stroke-[2.5]" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations, states, heritage, experiences..."
              className="flex-1 bg-transparent text-base sm:text-lg font-medium text-stone-900 dark:text-white placeholder:text-stone-400 dark:placeholder:text-slate-500 outline-none"
            />

            {query ? (
              <button
                type="button"
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                className="p-1.5 rounded-full hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-500 dark:text-slate-400 transition-colors"
                title="Clear input"
              >
                <X size={16} />
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg bg-stone-100 dark:bg-[#1a253c] text-stone-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider hover:bg-stone-200 dark:hover:bg-slate-700 transition-colors"
            >
              Esc
            </button>
          </form>

          {/* Body Section */}
          <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1 custom-scrollbar">
            {/* 1. Results when user is searching */}
            {query.trim() ? (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8B1A1A] dark:text-[#fb923c]">
                    Matching Destinations ({filteredDestinations.length})
                  </span>
                  <button
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-[#FF6B1A] hover:underline flex items-center gap-1"
                  >
                    View on map / directory <ArrowRight size={12} />
                  </button>
                </div>

                {filteredDestinations.length > 0 ? (
                  <div className="space-y-2">
                    {filteredDestinations.map((city) => {
                      const img = getCityThumbnail(city);
                      return (
                        <div
                          key={city._id || city.id || city.slug || city.name}
                          onClick={() => handleSelectCity(city)}
                          className="group flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-[#18233c] border border-[#E8DCC4]/80 dark:border-[#273857] hover:border-[#FF6B1A] dark:hover:border-[#FF6B1A] hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-13 h-13 rounded-xl overflow-hidden bg-stone-200 dark:bg-slate-800 shrink-0 border border-stone-200 dark:border-slate-700">
                              <img
                                src={img}
                                alt={city.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-base text-stone-900 dark:text-white group-hover:text-[#FF6B1A] transition-colors truncate">
                                  {city.name}
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FF6B1A]/10 text-[#FF6B1A]">
                                  {city.region || "India"}
                                </span>
                              </div>
                              <p className="text-xs text-stone-500 dark:text-slate-400 truncate mt-0.5">
                                {city.state ? `${city.state} • ` : ""}{city.tagline || "Enchanting Indian destination"}
                              </p>
                              {city.bestSeason && (
                                <p className="text-[11px] text-[#8B1A1A]/70 dark:text-amber-300/80 font-medium mt-0.5 flex items-center gap-1">
                                  <span>🌤️ Best Season: {city.bestSeason}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-[#121a2d] group-hover:bg-[#FF6B1A] group-hover:text-white text-stone-400 dark:text-slate-400 flex items-center justify-center transition-all shrink-0 ml-2">
                            <ArrowRight size={15} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-10 text-center bg-white dark:bg-[#18233c] rounded-2xl border border-dashed border-[#E8DCC4] dark:border-[#273857] p-6 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-xl">
                      🧭
                    </div>
                    <h4 className="font-bold text-stone-900 dark:text-white text-base">
                      No direct destination match for "{query}"
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-slate-400 max-w-sm mx-auto">
                      Try searching by state (e.g. Rajasthan, Kerala, Himachal) or click below to explore the complete directory.
                    </p>
                    <button
                      onClick={handleSearchSubmit}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6B1A] hover:bg-[#e55a10] text-white text-xs font-bold transition-all shadow-md active:scale-95"
                    >
                      <Search size={14} /> Search All Destinations for "{query}"
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* 2. Default View: Trending destinations & Quick sections */
              <>
                {/* Trending quick tags */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B1A1A] dark:text-[#fb923c] mb-2.5">
                    <TrendingUp size={14} />
                    <span>Popular Destinations</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_TRENDING_TAGS.map((tag) => (
                      <button
                        key={tag.label}
                        type="button"
                        onClick={() => handleTagClick(tag.query)}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#18233c] border border-[#E8DCC4] dark:border-[#273857] text-stone-700 dark:text-slate-200 hover:border-[#FF6B1A] hover:text-[#FF6B1A] dark:hover:text-[#FF6B1A] hover:bg-[#FF6B1A]/5 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <MapPin size={12} className="text-[#FF6B1A]" />
                        <span>{tag.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Navigation Sections */}
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8B1A1A] dark:text-[#fb923c] mb-2.5">
                    <Sparkles size={14} />
                    <span>Quick Explorations</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {QUICK_SECTIONS.map((sec) => {
                      const Icon = sec.icon;
                      return (
                        <div
                          key={sec.title}
                          onClick={() => handleQuickLinkClick(sec.link)}
                          className="group p-3.5 rounded-2xl bg-white dark:bg-[#18233c] border border-[#E8DCC4] dark:border-[#273857] hover:border-[#FF6B1A] dark:hover:border-[#FF6B1A] hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${sec.color}`}>
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-stone-900 dark:text-white group-hover:text-[#FF6B1A] transition-colors truncate">
                              {sec.title}
                            </h4>
                            <p className="text-[11px] text-stone-500 dark:text-slate-400 truncate">
                              {sec.desc}
                            </p>
                          </div>
                          <ArrowRight size={14} className="text-stone-400 group-hover:text-[#FF6B1A] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-5 py-3 bg-[#FDF6EC] dark:bg-[#0a0f1d] border-t border-[#E8DCC4] dark:border-[#273857] text-[11px] text-stone-500 dark:text-slate-400 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 text-[10px] font-mono font-bold">↵ Enter</kbd> to search</span>
              <span>•</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-stone-300 dark:border-slate-700 text-[10px] font-mono font-bold">Esc</kbd> to close</span>
            </div>
            <span className="font-bold text-[#FF6B1A]">Travel In Depth • Smart Search</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
