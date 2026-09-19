import { useState, useContext, useEffect } from "react";
import { CityContext } from "../context/CityContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { useTheme } from "../context/ThemeContext";
import { createSubmission, getMySubmissions } from "../api/submissionApi";
import { Helmet } from "react-helmet-async";
import WishlistButton from "../components/common/WishlistButton";
import JournalButton from "../components/common/JournalButton";


// ─── REGION BADGE COLORS ──────────────────────────────────────────────────────
const regionColors = {
  North: { bg: "bg-[#FF6B1A]", text: "text-white" },
  South: { bg: "bg-[#138808]", text: "text-white" },
  East: { bg: "bg-[#F5A623]", text: "text-white" },
  West: { bg: "bg-[#8B1A1A]", text: "text-white" },
  "North-East": { bg: "bg-[#0284C7]", text: "text-white" },
};

// ─── FILTER TABS ──────────────────────────────────────────────────────────────
const filters = ["All", "North", "South", "East", "West", "North-East"];

// ─── REGION OPTIONS FOR FORM ──────────────────────────────────────────────────
const REGION_OPTIONS = ["North", "South", "East", "West", "North-East"];

// ─── BUDGET OPTIONS FOR FORM ──────────────────────────────────────────────────
const BUDGET_OPTIONS = [
  { value: "Budget", label: "Budget (₹2k–4k/day)" },
  { value: "Mid-Range", label: "Mid-Range (₹5k–10k/day)" },
  { value: "Luxury", label: "Luxury (₹15k–30k/day)" },
];

// ─── PRESET ECO OPTIONS ───────────────────────────────────────────────────────
const PRESET_ECO_OPTIONS = [
  "Homestay / Village Stay",
  "Electric Vehicle Rentals",
  "Public Transport Friendly",
  "Organic Dining",
  "Plastic-Free Zone",
  "Solar-Powered Stays",
  "Local Guide Support",
  "Zero Waste Trails",
];

// ─── INDIA MAP SVG COMPONENT ──────────────────────────────────────────────────
function IndiaMap({
  activeRegion,
  onRegionClick,
  cities = [],
  hoveredCity,
  onCityHover,
}) {
  const { isDarkMode } = useTheme();
  // Simplified regional outline paths for India
  const regionPaths = {
    North:
      "M 140 20 L 190 20 L 220 60 L 210 110 L 170 120 L 130 100 L 120 60 Z",
    West:
      "M 90 120 L 150 120 L 160 180 L 130 220 L 90 210 L 70 160 Z",
    East:
      "M 210 110 L 270 115 L 280 180 L 230 200 L 190 170 L 170 120 Z",
    South:
      "M 130 220 L 190 200 L 210 240 L 180 310 L 150 330 L 130 290 Z",
    "North-East":
      "M 280 100 L 340 90 L 350 140 L 310 160 L 275 140 Z",
  };

  // Label centers for regions
  const regionCenters = {
    North: { x: 168, y: 70 },
    West: { x: 112, y: 165 },
    South: { x: 168, y: 265 },
    East: { x: 248, y: 155 },
    "North-East": { x: 325, y: 135 },
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 360 340"
        className="w-full h-full max-h-[480px]"
        style={{ filter: "drop-shadow(0 8px 32px rgba(255,107,26,0.15))" }}
      >
        {/* Background */}
        <rect width="360" height="340" fill="transparent" />

        {/* Region paths */}
        {Object.entries(regionPaths).map(([region, path]) => (
          <path
            key={region}
            d={path}
            fill={
              activeRegion === region
                ? region === "North"
                  ? "#FF6B1A"
                  : region === "South"
                  ? "#138808"
                  : region === "East"
                  ? "#F5A623"
                  : region === "West"
                  ? "#8B1A1A"
                  : "#0284C7"
                : activeRegion === "All"
                ? (isDarkMode ? "#162036" : "#FDF6EC")
                : (isDarkMode ? "#101828" : "#f5ede0")
            }
            stroke="#FF6B1A"
            strokeWidth={activeRegion === region ? "2.5" : "1.5"}
            strokeOpacity={activeRegion === region ? 1 : (isDarkMode ? 0.6 : 0.4)}
            fillOpacity={activeRegion === region ? 0.9 : (isDarkMode ? 0.75 : 0.5)}
            className="cursor-pointer transition-all duration-300"
            onClick={() => onRegionClick(region)}
          />
        ))}

        {/* Region Labels */}
        {Object.entries(regionCenters).map(([region, pos]) => (
          <text
            key={region}
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            fontSize={region === "North-East" ? "9" : "11"}
            fontWeight="600"
            fontFamily="Montserrat"
            fill={activeRegion === region ? "white" : (isDarkMode ? "#cbd5e1" : "#8B1A1A")}
            className="cursor-pointer select-none"
            onClick={() => onRegionClick(region)}
          >
            {region === "North-East" ? "NE" : region}
          </text>
        ))}

        {/* City dots */}
        {cities.map((city) => {
          const x = ((city.mapX || 50) / 100) * 360;
          const y = ((city.mapY || 50) / 100) * 340;
          const cityKey = city._id || city.id || city.slug;
          const isHovered = hoveredCity === cityKey;
          const isActiveRegion = activeRegion === "All" || activeRegion === city.region;

          return (
            <g key={cityKey}>
              {/* Pulse ring on hover */}
              {isHovered && (
                <circle
                  cx={x}
                  cy={y}
                  r="14"
                  fill="none"
                  stroke="#FF6B1A"
                  strokeWidth="1.5"
                  opacity="0.4"
                />
              )}
              {/* City dot */}
              <circle
                cx={x}
                cy={y}
                r={isHovered ? 7 : 5}
                fill={isActiveRegion ? "#FF6B1A" : (isDarkMode ? "#475569" : "#ccc")}
                stroke={isDarkMode ? "#0a0f1d" : "white"}
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => onCityHover(cityKey)}
                onMouseLeave={() => onCityHover(null)}
              />
              {/* City name tooltip */}
              {isHovered && (
                <text
                  x={x + 10}
                  y={y - 8}
                  fontSize="9"
                  fontWeight="700"
                  fontFamily="Montserrat"
                  fill={isDarkMode ? "#ffffff" : "#2D1B00"}
                >
                  {city.name}
                </text>
              )}
            </g>
          );
        })}

        {/* India label */}
        <text
          x="180"
          y="320"
          textAnchor="middle"
          fontSize="10"
          fontWeight="500"
          fontFamily="Montserrat"
          fill="#A07850"
          opacity="0.7"
        >
          INDIA
        </text>
      </svg>
    </div>
  );
}

// ─── CITY CARD ────────────────────────────────────────────────────────────────
function CityCard({ city, isHighlighted }) {
  const [hovered, setHovered] = useState(false);
  const badge = regionColors[city.region] || { bg: "bg-[#FF6B1A]", text: "text-white" };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden cursor-pointer group
        transition-all duration-400 ease-out
        ${
          isHighlighted
            ? "ring-2 ring-[#FF6B1A] shadow-[0_8px_32px_rgba(255,107,26,0.35)] scale-[1.02]"
            : "shadow-[0_4px_20px_rgba(139,26,26,0.10)] hover:shadow-[0_12px_40px_rgba(255,107,26,0.25)] hover:scale-[1.02]"
        }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link to={`/destinations/${city.slug}`}>
        <div className="relative h-48 overflow-hidden">
          <img
            src={city.image}
            alt={city.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Region badge */}
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${badge.bg} ${badge.text}`}
          >
            {city.region} India
          </span>

          {/* Top-right action group: Rating + Wishlist + Journal */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
            <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-[#2D1B00] flex items-center gap-1 shadow-sm">
              ⭐ {city.rating || "4.5"}
            </span>
            <WishlistButton
              slug={city.slug}
              className="w-7 h-7 shadow-sm bg-white/95"
              size={14}
            />
            <JournalButton
              destinationName={city.name}
              className="w-7 h-7 shadow-sm bg-white/95"
              size={14}
              title={`Add journal entry for ${city.name}`}
            />
          </div>


          {/* Eco options - shown on hover */}
          <div
            className={`absolute bottom-3 left-3 right-3 flex flex-wrap gap-1 transition-all duration-300 ${
              hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            {(city.ecoOptions || []).map((opt, i) => (
              <span
                key={i}
                className="bg-white/20 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full border border-white/30"
              >
                {opt}
              </span>
            ))}
          </div>
        </div>

        {/* Card body */}
        <div className="bg-white p-4">
          <h3 className="text-lg font-black text-[#2D1B00] tracking-tight leading-tight">
            {city.name}
          </h3>
          <p className="text-xs text-[#A07850] font-medium mt-0.5 mb-3 line-clamp-1">
            {city.tagline}
          </p>

          {/* Quick info */}
          <div className="flex items-center gap-3 text-xs text-[#6B4226] mb-4">
            <span className="flex items-center gap-1">
              🌤️ <span>{city.bestSeason}</span>
            </span>
            <span className="w-px h-3 bg-[#F5A623]/40" />
            <span className="flex items-center gap-1">
              💰 <span>{city.budget}</span>
            </span>
          </div>

          {/* CTA Button */}
          <button
            className="w-full py-2.5 rounded-xl text-sm font-bold text-white
              bg-gradient-to-r from-[#FF6B1A] to-[#C94F00]
              hover:from-[#C94F00] hover:to-[#8B1A1A]
              transition-all duration-300 tracking-wide
              flex items-center justify-center gap-2 group/btn"
          >
            Explore City
            <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
              →
            </span>
          </button>
        </div>
      </Link>
      {/* Bottom decorative line */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF6B1A] via-[#F5A623] to-[#138808] transition-opacity duration-300 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

// ─── LOCKED STATE COMPONENT (FOR LOGGED-OUT USERS) ────────────────────────────
function LockedSuggestionPrompt({ onLogin }) {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-[#2D1B00] p-8 md:p-12 text-center text-[#FDF6EC] border border-[#F5A623]/30 shadow-2xl">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#FF6B1A]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#F5A623]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#FF6B1A] to-[#8B1A1A] flex items-center justify-center text-3xl shadow-lg shadow-[#FF6B1A]/40 animate-pulse">
          🔒
        </div>
        <h3 className="text-2xl md:text-3xl font-black mb-3">
          Sign In to Suggest Destinations
        </h3>
        <p className="text-sm text-[#FDF6EC]/70 leading-relaxed mb-6">
          Help our community uncover untouched destinations across India. Log in to submit
          new travel spots, earn contributor status, and track your submission reviews.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={onLogin}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#FF6B1A] to-[#C94F00] text-white font-bold text-sm shadow-lg shadow-[#FF6B1A]/40 hover:from-[#C94F00] hover:to-[#8B1A1A] hover:-translate-y-0.5 transition-all duration-300"
          >
            Sign In / Log In
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#F5A623]/90 pt-4 border-t border-white/10">
          <span className="flex items-center gap-1.5">✦ Community Contributor Badge</span>
          <span className="flex items-center gap-1.5">✦ AI Fact-Check & Verification</span>
          <span className="flex items-center gap-1.5">✦ Real-Time Review Tracking</span>
        </div>
      </div>
    </div>
  );
}

// ─── SUGGEST DESTINATION MODAL / DRAWER ────────────────────────────────────────
function SuggestDestinationModal({ isOpen, onClose, user }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("form"); // "form" | "mySubmissions"
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Submissions list state
  const [mySubmissions, setMySubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Form inputs state
  const [name, setName] = useState("");
  const [stateName, setStateName] = useState("");
  const [region, setRegion] = useState("North");
  const [tagline, setTagline] = useState("");
  const [bestSeason, setBestSeason] = useState("");
  const [budget, setBudget] = useState("Mid-Range");
  const [ecoOptions, setEcoOptions] = useState(["🚲 Cycling", "🏡 Homestay"]);
  const [customEcoInput, setCustomEcoInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Fetch my submissions whenever user opens modal or changes tab
  const fetchUserSubmissions = async () => {
    if (!user) return;
    setLoadingSubmissions(true);
    try {
      const data = await getMySubmissions();
      setMySubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load user submissions:", err);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchUserSubmissions();
    }
    if (isOpen) {
      setErrorMsg("");
      setSuccessMsg("");
    }
  }, [isOpen, user]);

  const handleAddEcoChip = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!ecoOptions.includes(trimmed)) {
      setEcoOptions([...ecoOptions, trimmed]);
    }
    setCustomEcoInput("");
  };

  const handleRemoveEcoChip = (chipToRemove) => {
    setEcoOptions(ecoOptions.filter((c) => c !== chipToRemove));
  };

  const handleKeyDownEco = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEcoChip(customEcoInput);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (
      !name.trim() ||
      !stateName.trim() ||
      !region ||
      !tagline.trim() ||
      !bestSeason.trim() ||
      !budget ||
      !imageUrl.trim() ||
      latitude === "" ||
      longitude === ""
    ) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setErrorMsg("Latitude and Longitude must be valid numbers.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        state: stateName.trim(),
        region,
        tagline: tagline.trim(),
        bestSeason: bestSeason.trim(),
        budget,
        ecoOptions,
        image: imageUrl.trim(),
        lat: parsedLat,
        lng: parsedLng,
      };

      await createSubmission(payload);

      setSuccessMsg(
        "Thanks! Your submission is pending admin review — we'll notify you once it's approved."
      );

      // Reset form
      setName("");
      setStateName("");
      setRegion("North");
      setTagline("");
      setBestSeason("");
      setBudget("Mid-Range");
      setEcoOptions(["🚲 Cycling", "🏡 Homestay"]);
      setCustomEcoInput("");
      setImageUrl("");
      setLatitude("");
      setLongitude("");

      // Refresh submissions
      fetchUserSubmissions();
    } catch (err) {
      setErrorMsg(err.message || "Failed to submit destination. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#FDF6EC] rounded-3xl shadow-2xl border border-[#F5A623]/30 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#2D1B00] px-6 py-5 text-white flex items-center justify-between border-b border-[#F5A623]/20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-[#FF6B1A] flex items-center justify-center text-lg">
              ✨
            </span>
            <div>
              <h2 className="text-lg md:text-xl font-black text-white">
                Suggest a Destination
              </h2>
              <p className="text-xs text-[#F5A623]/90">
                Recommend hidden gems across India for fellow eco-travellers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {!user ? (
            <LockedSuggestionPrompt onLogin={() => navigate("/login")} />
          ) : (
            <>
              {/* Navigation Tabs */}
              <div className="flex items-center gap-2 mb-6 border-b border-[#F5A623]/30 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("form")}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === "form"
                      ? "bg-[#FF6B1A] text-white shadow-md shadow-[#FF6B1A]/20"
                      : "bg-white text-[#6B4226] border border-[#F5A623]/40 hover:text-[#FF6B1A]"
                  }`}
                >
                  📝 New Suggestion
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("mySubmissions");
                    fetchUserSubmissions();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    activeTab === "mySubmissions"
                      ? "bg-[#FF6B1A] text-white shadow-md shadow-[#FF6B1A]/20"
                      : "bg-white text-[#6B4226] border border-[#F5A623]/40 hover:text-[#FF6B1A]"
                  }`}
                >
                  📋 Your Submissions
                  {mySubmissions.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#2D1B00] text-white">
                      {mySubmissions.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Success & Error Banners */}
              {successMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-[#138808]/10 border border-[#138808]/30 text-[#138808] flex items-start gap-3">
                  <span className="text-xl">🎉</span>
                  <div>
                    <p className="font-bold text-sm">{successMsg}</p>
                    <p className="text-xs mt-1 text-[#138808]/80">
                      Our moderation team will verify coordinates, season, and eco options
                      before publishing.
                    </p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-bold text-sm">Submission Error</p>
                    <p className="text-xs mt-0.5">{errorMsg}</p>
                  </div>
                </div>
              )}

              {/* TAB 1: FORM */}
              {activeTab === "form" ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-[#2D1B00] uppercase tracking-wider mb-1.5">
                        Destination Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ziro Valley"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#F5A623]/40 bg-white text-sm text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/10 transition-all"
                      />
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-xs font-bold text-[#2D1B00] uppercase tracking-wider mb-1.5">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Arunachal Pradesh"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#F5A623]/40 bg-white text-sm text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Region */}
                    <div>
                      <label className="block text-xs font-bold text-[#2D1B00] uppercase tracking-wider mb-1.5">
                        Region <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#F5A623]/40 bg-white text-sm text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/10 transition-all"
                      >
                        {REGION_OPTIONS.map((r) => (
                          <option key={r} value={r}>
                            {r} India
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Best Season */}
                    <div>
                      <label className="block text-xs font-bold text-[#2D1B00] uppercase tracking-wider mb-1.5">
                        Best Season <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Oct – Mar"
                        value={bestSeason}
                        onChange={(e) => setBestSeason(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#F5A623]/40 bg-white text-sm text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/10 transition-all"
                      />
                    </div>

                    {/* Budget Tier */}
                    <div>
                      <label className="block text-xs font-bold text-[#2D1B00] uppercase tracking-wider mb-1.5">
                        Budget Tier <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#F5A623]/40 bg-white text-sm text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/10 transition-all"
                      >
                        {BUDGET_OPTIONS.map((b) => (
                          <option key={b.value} value={b.value}>
                            {b.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tagline */}
                  <div>
                    <label className="block text-xs font-bold text-[#2D1B00] uppercase tracking-wider mb-1.5">
                      Tagline / Short Summary <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pine-clad hills, indigenous music, and UNESCO living traditions"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#F5A623]/40 bg-white text-sm text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/10 transition-all"
                    />
                  </div>

                  {/* Eco Options */}
                  <div>
                    <label className="block text-xs font-bold text-[#2D1B00] uppercase tracking-wider mb-1.5">
                      Eco-Travel Options (Add chips)
                    </label>
                    <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-2xl border border-[#F5A623]/40 mb-2 min-h-[48px]">
                      {ecoOptions.map((chip, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#138808]/10 text-[#138808] border border-[#138808]/20"
                        >
                          {chip}
                          <button
                            type="button"
                            onClick={() => handleRemoveEcoChip(chip)}
                            className="hover:text-red-500 font-bold ml-1 text-xs"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="Type & press Enter..."
                        value={customEcoInput}
                        onChange={(e) => setCustomEcoInput(e.target.value)}
                        onKeyDown={handleKeyDownEco}
                        className="flex-1 min-w-[140px] text-xs bg-transparent focus:outline-none text-[#2D1B00] placeholder-[#A07850]"
                      />
                      {customEcoInput.trim() && (
                        <button
                          type="button"
                          onClick={() => handleAddEcoChip(customEcoInput)}
                          className="px-2.5 py-1 rounded-lg bg-[#FF6B1A] text-white text-xs font-bold"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                    {/* Suggested presets */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-[#A07850] font-medium mr-1">
                        Quick add:
                      </span>
                      {PRESET_ECO_OPTIONS.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleAddEcoChip(preset)}
                          className="text-[11px] px-2.5 py-1 rounded-full bg-[#FDF6EC] text-[#6B4226] border border-[#F5A623]/30 hover:border-[#FF6B1A] hover:text-[#FF6B1A] transition-colors"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image URL */}
                  <div>
                    <label className="block text-xs font-bold text-[#2D1B00] uppercase tracking-wider mb-1.5">
                      Image URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/photo-..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#F5A623]/40 bg-white text-sm text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/10 transition-all"
                    />
                  </div>

                  {/* Coordinates: Latitude & Longitude */}
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#2D1B00] uppercase tracking-wider mb-1.5">
                          Latitude <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          placeholder="e.g. 27.5629"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#F5A623]/40 bg-white text-sm text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/10 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#2D1B00] uppercase tracking-wider mb-1.5">
                          Longitude <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="any"
                          required
                          placeholder="e.g. 93.8344"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-[#F5A623]/40 bg-white text-sm text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/10 transition-all"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-[#A07850] mt-1.5 flex items-center gap-1">
                      <span>💡</span>
                      You can find these by searching '[city name] coordinates' on Google Maps
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#F5A623]/20">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 rounded-xl border border-[#F5A623]/40 text-[#6B4226] text-xs font-bold hover:bg-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B1A] to-[#C94F00] text-white text-xs md:text-sm font-bold shadow-md shadow-[#FF6B1A]/30 hover:from-[#C94F00] hover:to-[#8B1A1A] transition-all duration-300 disabled:opacity-60 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verifying & Submitting...</span>
                        </>
                      ) : (
                        <span>Submit for Admin Review →</span>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* TAB 2: MY SUBMISSIONS */
                <div className="space-y-4">
                  {loadingSubmissions ? (
                    <div className="py-12 text-center text-[#A07850]">
                      <div className="w-6 h-6 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      <p className="text-xs">Loading your submissions...</p>
                    </div>
                  ) : mySubmissions.length === 0 ? (
                    <div className="py-12 text-center bg-white rounded-2xl border border-[#F5A623]/20 p-6">
                      <span className="text-4xl block mb-2">📬</span>
                      <h4 className="text-sm font-bold text-[#2D1B00] mb-1">
                        No submissions yet
                      </h4>
                      <p className="text-xs text-[#A07850] max-w-sm mx-auto mb-4">
                        Know a breathtaking destination that deserves to be on Travel In Depth?
                        Submit your first recommendation!
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab("form")}
                        className="px-5 py-2 rounded-xl bg-[#FF6B1A] text-white text-xs font-bold"
                      >
                        + Suggest a Destination
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mySubmissions.map((sub) => {
                        const statusColors =
                          sub.status === "approved"
                            ? "bg-[#138808]/15 text-[#138808] border-[#138808]/30"
                            : sub.status === "rejected"
                            ? "bg-red-500/15 text-red-600 border-red-500/30"
                            : "bg-[#F5A623]/15 text-[#C94F00] border-[#F5A623]/30";

                        const statusLabel =
                          sub.status === "approved"
                            ? "✅ Approved"
                            : sub.status === "rejected"
                            ? "❌ Needs Revision"
                            : "⏳ Pending Review";

                        return (
                          <div
                            key={sub._id}
                            className="bg-white rounded-2xl p-4 border border-[#F5A623]/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div className="flex items-start gap-3">
                              {sub.image && (
                                <img
                                  src={sub.image}
                                  alt={sub.name}
                                  loading="lazy"
                                  className="w-14 h-14 rounded-xl object-cover border border-[#F5A623]/20 flex-shrink-0"
                                />
                              )}
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h4 className="font-bold text-sm text-[#2D1B00]">
                                    {sub.name}
                                  </h4>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FDF6EC] border border-[#F5A623]/30 text-[#6B4226] font-semibold">
                                    {sub.state}, {sub.region}
                                  </span>
                                </div>
                                <p className="text-xs text-[#A07850] mt-0.5 line-clamp-1">
                                  {sub.tagline}
                                </p>
                                <div className="text-[11px] text-[#6B4226] mt-1 flex items-center gap-2 flex-wrap">
                                  <span>🌤️ {sub.bestSeason}</span>
                                  <span>•</span>
                                  <span>💰 {sub.budget}</span>
                                  <span>•</span>
                                  <span>
                                    📅 {new Date(sub.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1.5 flex-shrink-0">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors}`}
                              >
                                {statusLabel}
                              </span>
                              {sub.geminiVerdict?.confidence && (
                                <span className="text-[10px] text-[#A07850]">
                                  AI Fact-Check: {sub.geminiVerdict.confidence}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN DESTINATIONS PAGE ───────────────────────────────────────────────────
export default function DestinationPage() {
  const { cities } = useContext(CityContext);
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchParams, setSearchParams] = useSearchParams();
  const [hoveredCity, setHoveredCity] = useState(null);
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");

  useEffect(() => {
    const urlQuery = searchParams.get("search");
    if (urlQuery !== null && urlQuery !== undefined) {
      setSearchQuery(urlQuery);
    }
  }, [searchParams]);

  // Suggest modal state
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);

  // Filter cities based on region + search
  const filteredCities = (cities || []).filter((city) => {
    const matchesRegion = activeFilter === "All" || city.region === activeFilter;
    const matchesSearch =
      city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (city.state && city.state.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRegion && matchesSearch;
  });

  // Handle map region click
  const handleRegionClick = (region) => {
    setActiveFilter(activeFilter === region ? "All" : region);
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC] font-montserrat">
      <Helmet>
        <title>Explore Destinations in India | Travel In Depth</title>
        <meta
          name="description"
          content="Discover curated destinations across North, South, East, West, and North-East India. Filter by region, budget, and eco-travel options."
        />
        <link rel="canonical" href="https://travelindepth.com/destinations" />
      </Helmet>
      {/* ── PAGE HEADER ─────────────────────────────────────────── */}
      <div className="bg-[#FFF8F0] border-b border-[#F5A623]/20 pt-24 pb-10 px-6">
        <div className="max-w-7xl mx-auto text-center">
          {/* Label */}
          <p className="text-[#FF6B1A] text-xs font-bold tracking-[0.3em] uppercase mb-3">
            Explore India
          </p>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-[#2D1B00] leading-tight mb-4">
            Discover <span className="text-[#FF6B1A]">Incredible</span> Destinations
          </h1>

          <p className="text-[#6B4226] text-base max-w-xl mx-auto leading-relaxed">
            From Himalayan peaks to coastal shores — find your perfect journey and travel the
            eco-friendly way.
          </p>

          {/* Search bar */}
          <div className="mt-6 max-w-md mx-auto relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A07850]">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search city or state..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#F5A623]/40
                bg-white text-sm text-[#2D1B00] placeholder-[#A07850]
                focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/10
                transition-all duration-200"
            />
          </div>

          {/* Suggest CTA in Header */}
          <div className="mt-5 flex items-center justify-center">
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#FF6B1A]/40 text-[#FF6B1A] text-xs sm:text-sm font-bold shadow-sm hover:bg-[#FF6B1A] hover:text-white hover:border-transparent transition-all duration-300"
            >
              <span>✨</span>
              <span>Don't see your destination? Suggest one</span>
              <span className="text-xs">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── FILTER BAR ──────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-[#FDF6EC]/95 backdrop-blur-sm border-b border-[#F5A623]/20 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-200
                  ${
                    activeFilter === filter
                      ? "bg-[#FF6B1A] text-white shadow-md shadow-[#FF6B1A]/30"
                      : "bg-white text-[#6B4226] border border-[#F5A623]/40 hover:border-[#FF6B1A] hover:text-[#FF6B1A]"
                  }`}
              >
                {filter === "All" ? "🇮🇳 All" : filter}
              </button>
            ))}
          </div>

          {/* Right actions: count & suggest button */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-[#A07850] font-medium hidden sm:block">
              {filteredCities.length} destination{filteredCities.length !== 1 ? "s" : ""}
            </p>
            <button
              onClick={() => setIsSuggestModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#FF6B1A] text-white text-xs font-bold shadow-sm shadow-[#FF6B1A]/20 hover:bg-[#C94F00] transition-colors flex items-center gap-1.5"
            >
              <span>+</span>
              <span className="hidden xs:inline">Suggest</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT: MAP + CARDS ───────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: India Map */}
          <div className="lg:w-[38%] lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_24px_rgba(139,26,26,0.08)] border border-[#F5A623]/20">
              <h2 className="text-sm font-bold text-[#8B1A1A] tracking-widest uppercase mb-1">
                Interactive Map
              </h2>
              <p className="text-xs text-[#A07850] mb-4">
                Click a region to filter destinations
              </p>

              {/* Map */}
              <div className="h-[380px]">
                <IndiaMap
                  activeRegion={activeFilter}
                  onRegionClick={handleRegionClick}
                  cities={filteredCities}
                  onCityHover={setHoveredCity}
                  hoveredCity={hoveredCity}
                />
              </div>

              {/* Region legend */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                {Object.entries(regionColors).map(([region, colors]) => (
                  <button
                    key={region}
                    onClick={() => handleRegionClick(region)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold
                      transition-all duration-200 border
                      ${
                        activeFilter === region
                          ? `${colors.bg} ${colors.text} border-transparent`
                          : "bg-[#FDF6EC] text-[#6B4226] border-[#F5A623]/30 hover:border-[#FF6B1A]"
                      }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${colors.bg}`} />
                    {region} India
                  </button>
                ))}
              </div>

              {/* Eco tip */}
              <div className="mt-4 bg-[#138808]/5 border border-[#138808]/20 rounded-xl p-3">
                <p className="text-xs text-[#138808] font-semibold">🌱 Eco Tip</p>
                <p className="text-xs text-[#6B4226] mt-1 leading-relaxed">
                  Choose e-rickshaw or walking tours to earn carbon points and support local
                  communities!
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: City Cards Grid */}
          <div className="lg:w-[62%]">
            {filteredCities.length > 0 ? (
              <>
                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {filteredCities.map((city) => (
                    <CityCard
                      key={city._id || city.id || city.slug}
                      city={city}
                      isHighlighted={hoveredCity === (city._id || city.id || city.slug)}
                    />
                  ))}
                </div>

                {/* Inline CTA Card */}
                <div className="mt-8 rounded-2xl p-6 bg-gradient-to-br from-[#FFF8F0] to-[#FDF6EC] dark:from-[#15213b] dark:to-[#0e1628] border border-[#F5A623]/30 dark:border-[#273857] text-center shadow-sm">
                  <span className="text-3xl block mb-2">🧭</span>
                  <h3 className="text-base font-bold text-[#2D1B00] dark:text-[#f8fafc] mb-1">
                    Don't see your favorite destination?
                  </h3>
                  <p className="text-xs text-[#A07850] dark:text-[#cbd5e1] max-w-md mx-auto mb-4 leading-relaxed">
                    Submit your recommendation with coordinates, best seasons, and eco-travel
                    options for admin approval.
                  </p>
                  <button
                    onClick={() => setIsSuggestModalOpen(true)}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FF6B1A] to-[#C94F00] text-white text-xs font-bold shadow-md shadow-[#FF6B1A]/20 hover:from-[#C94F00] hover:to-[#8B1A1A] transition-all cursor-pointer"
                  >
                    Suggest a Destination
                  </button>
                </div>
              </>
            ) : (
              /* Empty state with CTA */
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-[#121a2d] rounded-3xl border border-[#F5A623]/20 dark:border-[#273857] p-8 shadow-sm">
                <span className="text-5xl mb-3">🗺️</span>
                <h3 className="text-lg font-bold text-[#2D1B00] dark:text-[#f8fafc] mb-2">
                  No destinations found
                </h3>
                <p className="text-sm text-[#A07850] dark:text-[#cbd5e1] max-w-sm mb-6">
                  {searchQuery
                    ? `No destinations matched "${searchQuery}". Suggest adding it to our community travel directory!`
                    : "No destinations found in this filter."}
                </p>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <button
                    onClick={() => {
                      setActiveFilter("All");
                      setSearchQuery("");
                    }}
                    className="px-5 py-2.5 bg-white dark:bg-[#18233c] border border-[#F5A623]/40 dark:border-[#273857] text-[#6B4226] dark:text-[#cbd5e1] text-xs font-bold rounded-full hover:border-[#FF6B1A] cursor-pointer"
                  >
                    Clear filters
                  </button>
                  <button
                    onClick={() => setIsSuggestModalOpen(true)}
                    className="px-5 py-2.5 bg-[#FF6B1A] text-white text-xs font-bold rounded-full shadow-md shadow-[#FF6B1A]/30 hover:bg-[#C94F00] cursor-pointer"
                  >
                    ✨ Suggest "{searchQuery || "a Destination"}"
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM CTA BANNER ───────────────────────────────────── */}
      <div className="bg-[#2D1B00] py-12 px-6 mt-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#F5A623] text-xs font-bold tracking-widest uppercase mb-3">
            Travel Responsibly
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
            Earn Points. Save Carbon. Travel Free.
          </h2>
          <p className="text-[#A07850] text-sm mb-6 leading-relaxed">
            Every eco-friendly choice you make earns you carbon points. Redeem them for free trip
            recommendations!
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-white text-sm">
              <span className="text-[#F5A623]">🛺</span> E-Rickshaw = 500 pts
            </div>
            <div className="flex items-center gap-2 text-white text-sm">
              <span className="text-[#F5A623]">🚶</span> Walking = 1000 pts
            </div>
            <div className="flex items-center gap-2 text-white text-sm">
              <span className="text-[#F5A623]">🏠</span> Homestay = 400 pts
            </div>
          </div>
        </div>
      </div>

      {/* ── SUGGEST DESTINATION MODAL ────────────────────────────── */}
      <SuggestDestinationModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        user={user}
      />
    </div>
  );
}