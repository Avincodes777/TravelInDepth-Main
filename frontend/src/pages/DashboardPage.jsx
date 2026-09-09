import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from "../features/auth/useAuth";
import { useWishlist } from "../features/wishlist/useWishlist";
import { useNavigate } from "react-router-dom";
import * as plannerApi from "../api/plannerApi";
import * as wishlistApi from "../api/wishlistApi";
import * as journalApi from "../api/journalApi";
import { updateInterests } from "../api/authApi";
import { fetchRecommendations } from "../api/recommendationsApi";
import { fetchWeather } from "../api/weatherApi";
import { getMediaUrl } from "../utils/media";
import WishlistButton from "../components/common/WishlistButton";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useSearchParams,
  Navigate
}  from 'react-router-dom';

import { 
  LayoutDashboard,Home, User, Map, Heart, Calendar, BookOpen, 
  Star, Leaf, Bell, Settings, Search, LogOut, ChevronRight, 
  MapPin, Plus, Filter, Trash2, Camera, Wind, Plane, 
  Navigation, Award, TrendingUp, Info, ShoppingBag, 
  ArrowRight, CheckCircle2, AlertCircle, Clock, Users, 
  IndianRupee, CloudSun, Share2, MessageSquare, ShieldCheck, 
  Eye, Download, Moon, Sun, Globe,Sparkles
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

/** 
 * THEME & CONSTANTS
 */
const COLORS = {
  primary: '#FF6B1A', // Saffron
  secondary: '#8B1A1A', // Maroon
  bg: '#FDF6EC', // Cream
  card: '#FFF8F0', // Ivory
  accent: '#F5A623', // Gold
  success: '#138808' // Green
};

const DESTINATION_IMAGES = {
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
  default: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80",
};

const getDestinationImage = (dest) => {
  if (!dest) return DESTINATION_IMAGES.default;
  const key = dest.toString().toLowerCase().trim().replace(/[^a-z]/g, "");
  for (const [k, v] of Object.entries(DESTINATION_IMAGES)) {
    if (k !== "default" && (key.includes(k) || k.includes(key))) {
      return v;
    }
  }
  return DESTINATION_IMAGES.default;
};

// --- SHARED COMPONENTS ---

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

const Card = ({ children, className = "", noPadding = false }) => (
  <div className={`bg-[#FFF8F0] rounded-[20px] shadow-sm border border-[#E8DCC4] overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'primary' }) => {
  const styles = {
    primary: "bg-[#FF6B1A]/10 text-[#FF6B1A]",
    secondary: "bg-[#8B1A1A]/10 text-[#8B1A1A]",
    success: "bg-[#138808]/10 text-[#138808]",
    gold: "bg-[#F5A623]/10 text-[#F5A623]"
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles[variant]}`}>
      {children}
    </span>
  );
};

const Button = ({ children, variant = 'primary', className = "", ...props }) => {
  const variants = {
    primary: "bg-[#FF6B1A] text-white hover:bg-[#e55a10]",
    secondary: "bg-[#8B1A1A] text-white hover:bg-[#6d1414]",
    outline: "border-2 border-[#8B1A1A] text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white",
    ghost: "text-[#8B1A1A] hover:bg-[#8B1A1A]/5"
  };
  return (
    <button className={`px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

// --- PAGES ---

// 1. DASHBOARD
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommended, setRecommended] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const distanceData = [
    { name: 'Jan', km: 1200 }, { name: 'Feb', km: 450 }, { name: 'Mar', km: 3400 },
    { name: 'Apr', km: 890 }, { name: 'May', km: 2100 }, { name: 'Jun', km: 5600 },
  ];

  useEffect(() => {
    let isMounted = true;
    const loadRecs = async () => {
      try {
        const res = await fetchRecommendations({ limit: 4 });
        if (isMounted && res?.destinations) {
          setRecommended(res.destinations);
        }
      } catch (err) {
        console.error("Dashboard recs failed:", err);
      } finally {
        if (isMounted) setLoadingRecs(false);
      }
    };
    loadRecs();
    return () => { isMounted = false; };
  }, [user]);

  return (
    <PageTransition>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <Card className="bg-gradient-to-r from-[#8B1A1A] via-[#A32020] to-[#8B1A1A] text-white p-12 min-h-[320px] relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-serif font-bold mb-4">Namaste, {user?.name} 👋</h2>
            <p className="text-orange-200 italic mb-8 max-w-md">"The world is a book; non-travelers read only one page."</p>
            <div className="flex gap-4">
              <Button onClick={() => navigate("/dashboard/planner")}>Start New Plan</Button>
              <Button variant="outline" onClick={() => navigate("/destinations")} className="border-white text-white hover:bg-white hover:text-[#8B1A1A]">Explore Guidebooks</Button>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute right-[-5%] bottom-[-20%] opacity-20"><Globe size={400} /></div>
          <div className="absolute right-10 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 w-80">
            <p className="text-orange-300 text-sm font-semibold">NEXT ADVENTURE</p>
            <h3 className="text-2xl font-serif font-bold mt-2"> Varanasi & Sarnath</h3>
            <p className="text-orange-100 mt-2">15 July 2026 </p>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Preparation</span> <span>78%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-orange-400 h-2 rounded-full"
                  style={{ width: "78%" }}
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Completed', val: '18', icon: CheckCircle2 },
            { label: 'States', val: '09/28', icon: MapPin },
            { label: 'Wishlist', val: '12', icon: Heart },
            { label: 'Eco Score', val: '840', icon: Leaf },
          ].map((s, i) => (
            <Card key={i} className="flex items-center gap-4">
              <div className="p-3 bg-[#FF6B1A]/10 text-[#FF6B1A] rounded-xl"><s.icon size={24} /></div>
              <div>
                <p className="text-[10px] font-bold text-[#8B1A1A]/50 uppercase">{s.label}</p>
                <h4 className="text-xl font-bold text-[#8B1A1A]">{s.val}</h4>
              </div>
            </Card>
          ))}
        </div>

        {/* Personalized Recommendations Widget */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#8B1A1A] flex items-center gap-2">
                <Sparkles size={22} className="text-[#FF6B1A]" />
                Curated Recommendations
              </h3>
              <p className="text-xs text-[#8B1A1A]/60">
                Matched to your interests in {user?.interests?.length ? user.interests.join(", ") : "cultural & scenic India"}.
              </p>
            </div>
            <Link to="/destinations" className="text-xs font-bold text-[#FF6B1A] hover:underline flex items-center gap-1">
              View All <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loadingRecs ? (
              [1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white rounded-2xl h-60 animate-pulse border border-[#E8DCC4] p-4" />
              ))
            ) : recommended.map(d => (
              <Card
                key={d.slug || d._id}
                noPadding
                className="group overflow-hidden hover:border-[#FF6B1A] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                onClick={() => navigate(`/destinations/${d.slug}`)}
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={d.image}
                    alt={d.name}
                    loading="lazy"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80"; }}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-black text-[#8B1A1A]">
                    {d.matchScore}% MATCH
                  </div>
                  <div className="absolute bottom-2 left-3 right-3 text-white">
                    <h4 className="font-serif font-bold text-lg leading-tight">{d.name}</h4>
                    <p className="text-[10px] text-amber-200">{d.region} India • {d.state}</p>
                  </div>
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-[#8B1A1A]/70 line-clamp-2 italic">
                    "{d.tagline}"
                  </p>
                  <div className="pt-2 border-t border-[#E8DCC4] flex justify-between items-center text-xs">
                    <span className="font-semibold text-[#8B1A1A]/60">🗓 {d.bestSeason}</span>
                    <span className="font-bold text-[#138808]">{d.budget}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <h3 className="font-serif text-xl font-bold text-[#8B1A1A] mb-6">Travel Analytics</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={distanceData}>
                  <defs>
                    <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF6B1A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF6B1A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#8B1A1A50" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="km" stroke="#FF6B1A" strokeWidth={3} fillOpacity={1} fill="url(#colorKm)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
            <h3 className="font-serif text-xl font-bold text-[#8B1A1A] mb-6">Badges</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              {[
                { n: 'Himalayan Soul', i: Wind, c: 'success' },
                { n: 'Heritage Hunter', i: Award, c: 'primary' },
                { n: 'Wild Heart', i: AlertCircle, c: 'gold' },
                { n: 'Beach Bum', i: Sun, c: 'secondary' },
              ].map((b, i) => (
                <div key={i} className="p-4 bg-white/50 rounded-2xl border border-[#E8DCC4] flex flex-col items-center">
                  <b.i size={32} className={`text-${b.c === 'primary' ? '[#FF6B1A]' : '[#8B1A1A]'}`} />
                  <p className="text-[10px] font-bold mt-2 uppercase">{b.n}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

// 2. MY PROFILE
const Profile = () => {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AM";

  return (
    <PageTransition>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-8 mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-[#8B1A1A] flex items-center justify-center text-4xl text-white font-serif font-bold">
              {initials}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-[#FF6B1A] text-white rounded-full ring-4 ring-[#FDF6EC]">
              <Camera size={16} />
            </button>
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold text-[#8B1A1A]">
              {user?.name || "Explorer"}
            </h2>
            <p className="text-[#8B1A1A]/60 font-medium">
              {user?.location || "India"} • {user?.role === "admin" ? "Admin" : "Pro Traveler"}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {user?.isContributor && (
                <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-gradient-to-r from-[#F5A623] to-[#FF6B1A] text-white shadow-md shadow-[#F5A623]/30 border border-[#F5A623]/50 inline-flex items-center gap-1.5">
                  🏆 Contributor
                </span>
              )}
              {user?.interests && user.interests.length > 0 ? (
                user.interests.map((int) => (
                  <Badge key={int} variant="primary">
                    {int}
                  </Badge>
                ))
              ) : (
                <>
                  <Badge>Spiritual</Badge>
                  <Badge>Adventure</Badge>
                  <Badge variant="gold">Luxury</Badge>
                </>
              )}
            </div>

            {user?.contributions && user.contributions.length > 0 && (
              <div className="mt-3.5 pt-3 border-t border-[#E8DCC4] flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[#8B1A1A]/80">
                  Contributed:
                </span>
                {user.contributions.map((c, i) => (
                  <Link
                    key={c.destinationSlug || i}
                    to={`/destinations/${c.destinationSlug}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#138808]/10 text-[#138808] border border-[#138808]/20 hover:bg-[#138808] hover:text-white transition-all shadow-sm"
                  >
                    📍 {c.destinationName}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="font-bold text-[#8B1A1A]">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#8B1A1A]/40 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2 mt-1 text-sm text-[#2D1B00]"
                  defaultValue={user?.name || ""}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8B1A1A]/40 uppercase tracking-widest">
                  Email
                </label>
                <input
                  type="email"
                  readOnly
                  className="w-full bg-white/70 border border-[#E8DCC4] rounded-xl px-4 py-2 mt-1 text-sm text-[#2D1B00]/70 cursor-not-allowed"
                  value={user?.email || ""}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8B1A1A]/40 uppercase tracking-widest">
                  Phone
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2 mt-1 text-sm text-[#2D1B00]"
                  defaultValue={user?.phone || ""}
                  placeholder="+91..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8B1A1A]/40 uppercase tracking-widest">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2 mt-1 text-sm text-[#2D1B00]"
                  defaultValue={user?.location || ""}
                  placeholder="e.g. Mumbai, India"
                />
              </div>
            </div>
          </Card>
          <Card className="space-y-4">
            <h3 className="font-bold text-[#8B1A1A]">Travel Preferences</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#8B1A1A]/40 uppercase tracking-widest">
                  Bio
                </label>
                <textarea
                  className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2 mt-1 text-sm h-24"
                  placeholder="Share your travel philosophy..."
                  defaultValue="Passionate explorer discovering hidden gems and authentic cultures across India."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8B1A1A]/40 uppercase tracking-widest">
                  Known Languages
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {["Hindi", "English", "Marathi", "Gujarati"].map((lang) => (
                    <span
                      key={lang}
                      className="bg-white border border-[#E8DCC4] px-3 py-1 rounded-full text-xs font-bold text-[#8B1A1A]"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
        <div className="flex justify-end">
          <Button>Save Profile Changes</Button>
        </div>
      </div>
    </PageTransition>
  );
};

// 3. MY TRIPS
const MyTrips = ({ savedTrips = [], setSavedTrips }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("upcoming");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [backendTrips, setBackendTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadItineraries = async () => {
      setLoading(true);
      try {
        const data = await plannerApi.fetchMyItineraries();
        if (isMounted && Array.isArray(data)) {
          setBackendTrips(data);
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadItineraries();
    return () => { isMounted = false; };
  }, []);

  const handleDeleteBackendTrip = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this itinerary?")) return;
    try {
      await plannerApi.deleteItinerary(id);
      setBackendTrips(prev => prev.filter(t => t._id !== id));
      if (selectedTrip?._id === id) setSelectedTrip(null);
    } catch (err) {
      alert("Failed to delete itinerary: " + err.message);
    }
  };

  // Map backend AI itineraries to card format with multi-city support
  const formattedBackendTrips = backendTrips.map(bt => {
    const rawCities = (Array.isArray(bt.cities) && bt.cities.length > 0)
      ? bt.cities
      : (typeof bt.destination === "string" && bt.destination.includes("→"))
      ? bt.destination.split("→").map(s => s.trim()).filter(Boolean)
      : [bt.destination];

    const isMultiCity = rawCities.length > 1;
    const totalDays = bt.days?.length || 1;
    const firstCity = rawCities[0] || bt.destination;

    return {
      _id: bt._id,
      id: bt._id,
      destination: bt.destination,
      cities: rawCities,
      isMultiCity,
      title: isMultiCity
        ? `${totalDays}-Day Circuit: ${rawCities.join(" → ")}`
        : `${bt.destination} AI Expedition`,
      startDate: new Date(bt.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      endDate: `${totalDays} Days Plan`,
      status: "upcoming",
      budget: "AI Tailored",
      style: isMultiCity ? "Multi-City Circuit" : "AI Planned",
      travelers: 1,
      image: getDestinationImage(firstCity),
      isAiGenerated: true,
      rawDays: bt.days,
    };
  });

  const allDisplayTrips = [...formattedBackendTrips, ...savedTrips].filter(
    (trip) => trip.status === tab
  );

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-4xl font-serif font-bold text-[#8B1A1A]">
              My Journeys
            </h2>
            <p className="text-[#8B1A1A]/60 mt-1">
              Manage your past and future expeditions
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/dashboard/planner")}
              className="flex items-center gap-2 px-4 py-2 text-sm shadow-sm"
            >
              <Plus size={16} /> Plan New Trip
            </Button>
            <div className="flex bg-[#F5E6D3] p-1 rounded-xl">
              {["upcoming", "past"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-6 py-2 rounded-lg font-bold capitalize transition-all ${
                    tab === t
                      ? "bg-[#8B1A1A] text-white shadow"
                      : "text-[#8B1A1A]/60"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && <div className="text-center py-6 text-[#8B1A1A]/60 font-medium">Loading your journeys…</div>}
        {error && <div className="text-center py-2 text-red-500 text-sm">⚠️ {error}</div>}

        {allDisplayTrips.length === 0 && !loading ? (
          <div className="text-center py-16 px-6 bg-white/70 border border-dashed border-[#E8DCC4] rounded-3xl space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#FFF2E8] text-[#FF6B1A] flex items-center justify-center mx-auto text-2xl">
              🗺️
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#8B1A1A]">
              No {tab} trips yet
            </h3>
            <p className="text-sm text-[#8B1A1A]/60 max-w-md mx-auto">
              You don't have any {tab} travel plans. Use our AI Trip Planner to build and customize your next dream itinerary.
            </p>
            <div className="pt-2">
              <Button onClick={() => navigate("/dashboard/planner")} className="px-6 py-3">
                <Plus size={16} className="mr-2 inline" /> Start Planning with AI
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {allDisplayTrips.map((trip) => (
              <Card
                key={trip.id || trip._id}
                className="group overflow-hidden hover:border-[#FF6B1A] transition-all duration-300 cursor-pointer flex flex-col justify-between"
                onClick={() => setSelectedTrip(trip)}
              >
                <div>
                  <div className="h-44 rounded-xl overflow-hidden relative bg-[#E8DCC4]">
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      loading="lazy"
                      onError={(e) => { e.target.src = DESTINATION_IMAGES.default; }}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge variant={trip.style === "Adventure" ? "primary" : trip.isMultiCity ? "primary" : trip.isAiGenerated ? "gold" : "secondary"}>
                        {trip.style}
                      </Badge>
                    </div>
                    {trip.isAiGenerated && (
                      <button
                        onClick={(e) => handleDeleteBackendTrip(trip._id, e)}
                        title="Delete Itinerary"
                        className="absolute top-4 right-4 p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-full transition-all shadow-md cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <div className="mt-5">
                    <h3 className="text-xl font-bold text-[#8B1A1A] line-clamp-2">
                      {trip.title}
                    </h3>
                    {trip.isMultiCity ? (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs font-semibold text-[#FF6B1A]">
                        <span>📍 Route:</span>
                        {trip.cities.map((city, cIdx) => (
                          <span key={cIdx} className="inline-flex items-center gap-1">
                            <span className="bg-[#FFF2E8] px-2 py-0.5 rounded-md border border-[#E8DCC4]">
                              {city}
                            </span>
                            {cIdx < trip.cities.length - 1 && <span>→</span>}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#8B1A1A]/50 mt-1">
                        📍 {trip.destination}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-4 text-sm text-[#8B1A1A]/60">
                      <Calendar size={15} />
                      {trip.startDate} — {trip.endDate}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-[#8B1A1A]/60">
                      <Users size={15} />
                      {trip.travelers} Traveler{trip.travelers > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E8DCC4] flex justify-between items-center">
                  <div>
                    <p className="text-xs text-[#8B1A1A]/50">Budget / Day Cost</p>
                    <p className="font-bold text-[#138808]">
                      {typeof trip.budget === "number" ? `₹${trip.budget.toLocaleString()}` : trip.budget}
                    </p>
                  </div>
                  <Button variant="ghost" className="text-sm px-4 py-2" onClick={(e) => { e.stopPropagation(); setSelectedTrip(trip); }}>
                    View Details
                  </Button>
                </div>
              </Card>
            ))}

            <Card
              onClick={() => navigate("/dashboard/planner")}
              className="border-2 border-dashed border-[#E8DCC4] flex flex-col items-center justify-center min-h-[340px] hover:border-[#FF6B1A] transition-all cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-[#FFF2E8] flex items-center justify-center mb-5">
                <Plus size={34} className="text-[#FF6B1A]" />
              </div>
              <h3 className="text-xl font-bold text-[#8B1A1A]">Plan a New Trip</h3>
              <p className="text-[#8B1A1A]/50 text-center mt-2 px-6">
                Create a personalized itinerary and start your next adventure.
              </p>
            </Card>
          </div>
        )}
      </div>

      {selectedTrip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFF8F0] border border-[#E8DCC4] rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B1A]">
                  {selectedTrip.style} Trip
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#8B1A1A]">
                  {selectedTrip.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                className="w-8 h-8 rounded-full bg-[#8B1A1A]/10 text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-[#8B1A1A]/70 mb-6 pb-4 border-b border-[#E8DCC4]">
              <span>📍 {selectedTrip.destination}</span>
              <span>📅 {selectedTrip.startDate}</span>
              <span>💰 {typeof selectedTrip.budget === 'number' ? `₹${selectedTrip.budget.toLocaleString()}` : selectedTrip.budget}</span>
            </div>

            {selectedTrip.rawDays && selectedTrip.rawDays.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-bold text-[#8B1A1A] uppercase tracking-wider text-xs">
                  Day-by-Day AI Itinerary
                </h4>
                {selectedTrip.rawDays.map((d) => (
                  <div key={d.day} className="bg-white/80 border border-[#E8DCC4] rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center font-bold text-[#8B1A1A]">
                      <span className="flex items-center gap-2">
                        <span>Day {d.day} — {d.title}</span>
                        {d.city && (
                          <span className="text-[10px] bg-[#FF6B1A]/10 text-[#FF6B1A] px-2 py-0.5 rounded-full border border-[#FF6B1A]/20">
                            📍 {d.city}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-[#138808]">{d.estimatedBudgetINR}</span>
                    </div>
                    <div className="text-xs text-[#2D1B00]/80 space-y-1">
                      <p><b>🌅 Morning:</b> {d.morning}</p>
                      <p><b>☀️ Afternoon:</b> {d.afternoon}</p>
                      <p><b>🌆 Evening:</b> {d.evening}</p>
                      <p><b>🍛 Meals:</b> {d.meals}</p>
                      {d.tips && <p className="text-[#FF6B1A]"><b>💡 Tip:</b> {d.tips}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8B1A1A]/70">
                Detailed schedule confirmed with your local guides. Check notifications for live transit updates.
              </p>
            )}

            <button
              onClick={() => setSelectedTrip(null)}
              className="mt-6 w-full bg-[#8B1A1A] text-white font-bold py-3 rounded-xl hover:bg-[#701515] transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

/// 4. WISHLIST
const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlistedSlugs } = useWishlist();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await wishlistApi.getMyWishlist();
      setWishlistItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      setError(err.message || "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
  }, [user]);

  // Keep displayed list reactive to optimistic toggle un-likes from WishlistContext
  const displayedItems = useMemo(() => {
    return wishlistItems.filter((item) => wishlistedSlugs.has(item.slug));
  }, [wishlistItems, wishlistedSlugs]);

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-serif font-bold text-[#8B1A1A]">
              Travel Bucket List
            </h2>
            <p className="text-[#8B1A1A]/60 mt-1">
              Save your dream destinations and start planning.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/60 border border-[#E8DCC4] rounded-3xl">
            <div className="w-10 h-10 border-3 border-[#FF6B1A] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-[#8B1A1A]/70">Loading your bucket list...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 border border-red-200 rounded-3xl">
            <p className="text-red-700 font-bold mb-2">⚠️ {error}</p>
            <button
              onClick={fetchWishlist}
              className="px-4 py-2 bg-[#8B1A1A] text-white text-xs font-bold rounded-xl hover:bg-[#701515] transition"
            >
              Retry
            </button>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-[#FFF8F0] border border-[#E8DCC4] rounded-3xl shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#FF6B1A]/10 flex items-center justify-center mb-4">
              <Heart size={36} className="text-[#FF6B1A]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#8B1A1A] mb-2">
              Your bucket list is empty
            </h3>
            <p className="text-sm text-[#8B1A1A]/70 max-w-md mb-6 leading-relaxed">
              Start exploring and tap the heart on any destination you love to build your personalized travel wishlist.
            </p>
            <Link
              to="/destinations"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF6B1A] to-[#C94F00] text-white font-bold text-sm shadow-md hover:from-[#C94F00] hover:to-[#8B1A1A] transition-all flex items-center gap-2"
            >
              🧭 Explore Destinations
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-7">
            {displayedItems.map((item) => (
              <Card
                key={item.slug}
                noPadding
                className="overflow-hidden group hover:-translate-y-2 transition duration-300 cursor-pointer flex flex-col justify-between"
                onClick={() => navigate(`/destinations/${item.slug}`)}
              >
                <div>
                  <div className="relative h-60 overflow-hidden">
                    <img
                      src={item.image || getDestinationImage(item.slug)}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    <div className="absolute top-4 right-4 z-10">
                      <WishlistButton
                        slug={item.slug}
                        className="w-10 h-10 shadow-lg bg-white"
                        size={18}
                      />
                    </div>

                    <div className="absolute bottom-4 left-4">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#8B1A1A]">
                        {item.region ? `${item.region} India` : "Incredible India"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-[#8B1A1A] leading-snug">
                        {item.name}
                      </h3>
                      {item.rating && (
                        <span className="text-xs font-bold text-[#2D1B00] bg-[#FF6B1A]/10 px-2 py-0.5 rounded-md">
                          ⭐ {item.rating}
                        </span>
                      )}
                    </div>

                    {item.tagline && (
                      <p className="text-xs text-[#8B1A1A]/70 font-medium mt-1 line-clamp-1">
                        {item.tagline}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm text-[#8B1A1A]/60 mt-3">
                      <MapPin size={15} />
                      {item.region} India
                    </div>

                    {item.bestSeason && (
                      <div className="flex items-center gap-2 text-sm text-[#8B1A1A]/60 mt-1.5">
                        🗓 Best Time: {item.bestSeason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <div className="flex justify-between items-center pt-4 border-t border-[#E8DCC4]">
                    <div>
                      <p className="text-xs text-[#8B1A1A]/50">
                        Estimated Budget
                      </p>
                      <p className="font-bold text-[#138808]">
                        {item.budget || "Affordable"}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      className="rounded-xl hover:bg-[#FF6B1A]/10 hover:text-[#FF6B1A]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/destinations/${item.slug}`);
                      }}
                    >
                      <ArrowRight size={18} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

// 5. TRIP PLANNER
const TripPlanner = ({ savedTrips, setSavedTrips }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Multi-city queue state
  const [cityQueue, setCityQueue] = useState([
    { id: '1', name: 'Jaipur', days: 3, emoji: '🛕' },
  ]);
  const [customInput, setCustomInput] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Preference states
  const [travelStyle, setTravelStyle] = useState('Cultural & Heritage');
  const [budgetTier, setBudgetTier] = useState('Comfort (₹5,000–₹10,000/day)');
  const [pace, setPace] = useState('Moderate');
  const [interests, setInterests] = useState(['Heritage', 'Food & Cuisine', 'Culture']);

  // Weather telemetry for primary city
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Generation & Result State
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [activeDay, setActiveDay] = useState(1);
  const [error, setError] = useState(null);
  const [saveState, setSaveState] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [regenDay, setRegenDay] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const availableDestinations = [
    { e: '🛕', n: 'Jaipur' }, { e: '🌅', n: 'Udaipur' }, { e: '🏜️', n: 'Jodhpur' },
    { e: '🏔️', n: 'Ladakh' }, { e: '🌴', n: 'Kerala' }, { e: '🌊', n: 'Goa' },
    { e: '⛰️', n: 'Himachal' }, { e: '🕌', n: 'Varanasi' }, { e: '🐯', n: 'Jim Corbett' },
    { e: '🌺', n: 'Meghalaya' }, { e: '🏛️', n: 'Hampi' }, { e: '🎭', n: 'Kolkata' },
    { e: '⛵', n: 'Rishikesh' }, { e: '🏰', n: 'Agra' }, { e: '🏙️', n: 'Mumbai' },
    { e: '🛕', n: 'Mysore' }, { e: '🌲', n: 'Manali' }
  ];

  const travelStylesList = [
    { icon: '🏛️', name: 'Cultural & Heritage', desc: 'Monuments, history & royal palaces' },
    { icon: '🏔️', name: 'Adventure & Nature', desc: 'Trekking, wildlife & expeditions' },
    { icon: '🧘', name: 'Spiritual & Wellness', desc: 'Ghats, yoga & peaceful retreats' },
    { icon: '🍜', name: 'Food & Culinary', desc: 'Street food, royal feasts & tastings' },
    { icon: '💎', name: 'Luxury & Leisure', desc: 'Heritage havelis & premium comfort' },
  ];

  const interestOptions = [
    'Heritage', 'Food & Cuisine', 'Wellness', 'Wildlife', 'Adventure', 
    'Photography', 'Culture', 'Eco Travel', 'Spirituality', 'Arts & Craft'
  ];

  const totalTripDays = cityQueue.reduce((acc, c) => acc + (parseInt(c.days, 10) || 1), 0);
  const primaryCity = cityQueue[0]?.name || 'Jaipur';

  // Fetch weather for primary city
  useEffect(() => {
    let isMounted = true;
    if (!primaryCity) {
      setWeatherData(null);
      return;
    }
    const loadCityWeather = async () => {
      setLoadingWeather(true);
      try {
        const data = await fetchWeather({ slug: primaryCity.toLowerCase() });
        if (isMounted && data) {
          setWeatherData(data);
        }
      } catch (err) {
        console.error("Planner weather error:", err);
      } finally {
        if (isMounted) setLoadingWeather(false);
      }
    };
    const timeout = setTimeout(loadCityWeather, 350);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [primaryCity]);

  // Queue manipulation functions
  const handleAddCity = (cityName, emoji = '📍') => {
    if (!cityName.trim()) return;
    const exists = cityQueue.some(c => c.name.toLowerCase() === cityName.trim().toLowerCase());
    if (exists) {
      alert(`${cityName} is already in your route.`);
      return;
    }
    setCityQueue(prev => [
      ...prev,
      { id: Date.now().toString(), name: cityName.trim(), days: 2, emoji }
    ]);
    setCustomInput('');
    setShowCityDropdown(false);
  };

  const handleRemoveCity = (id) => {
    if (cityQueue.length <= 1) {
      alert("Your journey must have at least one destination.");
      return;
    }
    setCityQueue(prev => prev.filter(c => c.id !== id));
  };

  const handleCityDaysChange = (id, val) => {
    const parsed = Math.max(1, Math.min(14, parseInt(val, 10) || 1));
    setCityQueue(prev => prev.map(c => c.id === id ? { ...c, days: parsed } : c));
  };

  const handleMoveCity = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= cityQueue.length) return;
    const updated = [...cityQueue];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setCityQueue(updated);
  };

  const toggleInterest = (item) => {
    setInterests(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  // Generate Itinerary
  const generatePlan = async () => {
    setLoading(true);
    setError(null);
    setSaveState('idle');
    try {
      let data;
      if (cityQueue.length > 1) {
        const payload = {
          cities: cityQueue.map(c => ({ destination: c.name, days: parseInt(c.days, 10) || 1 })),
          budget: budgetTier,
          travelStyle,
          interests: interests.join(', '),
          pace
        };
        data = await plannerApi.generateMultiCityItinerary(payload);
      } else {
        const payload = {
          destination: cityQueue[0].name,
          days: parseInt(cityQueue[0].days, 10) || 3,
          budget: budgetTier,
          travelStyle,
          interests: interests.join(', '),
          pace
        };
        data = await plannerApi.generateItinerary(payload);
      }
      setItinerary(data);
      setActiveDay(1);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to generate AI plan. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDayFieldChange = (dayNumber, field, value) => {
    setItinerary(prev => ({
      ...prev,
      days: prev.days.map(d => d.day === dayNumber ? { ...d, [field]: value } : d),
    }));
  };

  const regenerateDay = async (dayNumber) => {
    setRegenDay(dayNumber);
    try {
      const newDay = await plannerApi.regenerateDay({
        destination: itinerary.destination,
        dayNumber,
        totalDays: itinerary.days.length,
      });
      setItinerary(prev => ({
        ...prev,
        days: prev.days.map(d => d.day === dayNumber ? newDay : d),
      }));
    } catch (err) {
      alert('Could not regenerate day. Please try again.');
    } finally {
      setRegenDay(null);
    }
  };

  const saveItinerary = async () => {
    if (!itinerary) return;
    setSaveState('saving');
    try {
      const saved = await plannerApi.saveItinerary(itinerary);
      setSaveState('saved');
      if (setSavedTrips) {
        setSavedTrips(prev => [
          ...prev,
          {
            id: saved._id || Date.now(),
            destination: itinerary.destination,
            title: itinerary.cities?.length > 1 
              ? `${itinerary.days.length}-Day Circuit: ${itinerary.cities.join(' → ')}`
              : `${itinerary.destination} AI Expedition`,
            startDate: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
            endDate: `${itinerary.days.length} Days Plan`,
            status: "upcoming",
            budget: budgetTier,
            style: travelStyle,
            travelers: 2,
            image: getDestinationImage(cityQueue[0]?.name),
            isAiGenerated: true,
            rawDays: itinerary.days
          }
        ]);
      }
    } catch (err) {
      setSaveState('error');
    }
  };

  const current = itinerary?.days?.find(d => d.day === activeDay);

  return (
    <PageTransition>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-[#8B1A1A] via-[#A32020] to-[#8B1A1A] rounded-[24px] p-8 text-white relative overflow-hidden shadow-xl border border-white/10">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold text-orange-200 uppercase tracking-wider mb-3">
              <Sparkles size={14} className="text-[#FFB347]" /> AI Multiverse Planner 2.0
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
              Custom Itinerary Builder
            </h2>
            <p className="text-orange-100 text-sm sm:text-base mt-2 leading-relaxed">
              Design comprehensive single or multi-city journeys across India. Add stops, adjust day pacing, connect transit routes, and receive real-time AI curated breakdowns.
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-40px] opacity-15 pointer-events-none">
            <Globe size={280} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Controls Panel (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. STYLISH CONNECTED CITY QUEUE */}
            <Card className="space-y-5 bg-white border-[#E8DCC4] shadow-sm">
              <div className="flex justify-between items-center flex-wrap gap-2 border-b border-[#E8DCC4] pb-4">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#8B1A1A] flex items-center gap-2">
                    <Navigation size={20} className="text-[#FF6B1A]" />
                    Connected Route Queue
                  </h3>
                  <p className="text-xs text-[#8B1A1A]/60 mt-0.5">
                    Order your trip stops. The AI dynamically calculates transit and daily itineraries between each city.
                  </p>
                </div>
                <span className="bg-[#FFF2E8] text-[#FF6B1A] border border-[#FF6B1A]/20 px-3 py-1 rounded-full font-bold text-xs">
                  {totalTripDays} Total Days ({cityQueue.length} {cityQueue.length > 1 ? 'Cities' : 'City'})
                </span>
              </div>

              {/* Quick Destination Chips */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8B1A1A]/70 mb-2 block">
                  Quick Add Destinations:
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar p-1">
                  {availableDestinations.map(d => {
                    const inQueue = cityQueue.some(c => c.name.toLowerCase() === d.n.toLowerCase());
                    return (
                      <button
                        key={d.n}
                        type="button"
                        onClick={() => handleAddCity(d.n, d.e)}
                        disabled={inQueue}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 font-medium ${
                          inQueue
                            ? 'bg-[#8B1A1A]/5 text-[#8B1A1A]/40 border-[#E8DCC4] cursor-not-allowed'
                            : 'bg-white text-[#8B1A1A] border-[#E8DCC4] hover:border-[#FF6B1A] hover:bg-[#FFF7F1] hover:scale-105 shadow-2xs'
                        }`}
                      >
                        <span>{d.e}</span>
                        <span>{d.n}</span>
                        {inQueue ? <span className="text-[10px]">✓</span> : <Plus size={12} className="opacity-60" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom City Input Bar */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B1A1A]/40" />
                  <input
                    type="text"
                    placeholder="Type any Indian city or hidden gem (e.g. Munnar, Gokarna)..."
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCity(customInput);
                      }
                    }}
                    className="w-full bg-[#FFF8F0] border border-[#E8DCC4] rounded-xl pl-10 pr-4 py-2 text-sm text-[#2D1B00] outline-none focus:border-[#FF6B1A] transition-all"
                  />
                </div>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => handleAddCity(customInput)}
                  className="text-xs px-4 py-2"
                >
                  <Plus size={15} /> Add Stop
                </Button>
              </div>

              {/* VISUAL CONNECTED ROUTE PIPELINE */}
              <div className="space-y-0 pt-2">
                <div className="space-y-3">
                  {cityQueue.map((city, idx) => (
                    <React.Fragment key={city.id}>
                      <div className="flex items-center justify-between bg-gradient-to-r from-[#FFF8F0] to-white border border-[#E8DCC4] rounded-2xl p-3.5 sm:p-4 shadow-xs hover:border-[#FF6B1A]/60 transition-all">
                        <div className="flex items-center gap-3.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B1A] to-[#8B1A1A] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{city.emoji || '📍'}</span>
                              <h4 className="font-serif font-bold text-base text-[#8B1A1A]">
                                {city.name}
                              </h4>
                            </div>
                            <p className="text-[10px] text-[#8B1A1A]/50 font-medium">
                              Stop #{idx + 1} of your grand circuit
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Days Counter */}
                          <div className="flex items-center gap-1.5 bg-white border border-[#E8DCC4] px-2.5 py-1 rounded-xl shadow-2xs">
                            <span className="text-xs text-[#8B1A1A]/70 font-semibold">Stay:</span>
                            <input
                              type="number"
                              min="1"
                              max="14"
                              value={city.days}
                              onChange={(e) => handleCityDaysChange(city.id, e.target.value)}
                              className="w-10 text-center font-bold text-sm text-[#FF6B1A] outline-none"
                            />
                            <span className="text-xs text-[#8B1A1A]/70 font-semibold">days</span>
                          </div>

                          {/* Up / Down Controls */}
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveCity(idx, -1)}
                              disabled={idx === 0}
                              title="Move Stop Earlier"
                              className="w-7 h-7 rounded-lg border border-[#E8DCC4] bg-white text-[#8B1A1A] flex items-center justify-center text-xs disabled:opacity-20 hover:bg-[#FFF2E8] hover:border-[#FF6B1A] transition-all cursor-pointer"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveCity(idx, 1)}
                              disabled={idx === cityQueue.length - 1}
                              title="Move Stop Later"
                              className="w-7 h-7 rounded-lg border border-[#E8DCC4] bg-white text-[#8B1A1A] flex items-center justify-center text-xs disabled:opacity-20 hover:bg-[#FFF2E8] hover:border-[#FF6B1A] transition-all cursor-pointer"
                            >
                              ▼
                            </button>
                          </div>

                          {/* Delete City */}
                          {cityQueue.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveCity(city.id)}
                              title="Remove Stop"
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Connected Connector Line */}
                      {idx < cityQueue.length - 1 && (
                        <div className="flex items-center justify-center py-1">
                          <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#FFF2E8] border border-[#FF6B1A]/25 text-[11px] font-bold text-[#FF6B1A]">
                            <span>↓ Scenic Transit & Transfer ↓</span>
                          </div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Trail Summary */}
                {cityQueue.length > 1 && (
                  <div className="mt-4 pt-3 border-t border-dashed border-[#E8DCC4] flex items-center gap-2 text-xs font-semibold text-[#8B1A1A]/80 flex-wrap">
                    <span className="text-[#FF6B1A] font-bold">🛣️ Route Trail:</span>
                    {cityQueue.map((c, i) => (
                      <span key={c.id} className="inline-flex items-center gap-1.5">
                        <span className="bg-[#FFF8F0] px-2.5 py-0.5 rounded-lg border border-[#E8DCC4]">
                          {c.name} ({c.days}d)
                        </span>
                        {i < cityQueue.length - 1 && <span className="text-[#FF6B1A]">➔</span>}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* 2. TRAVEL STYLE SELECTION */}
            <Card className="space-y-4 bg-white border-[#E8DCC4]">
              <h3 className="font-serif font-bold text-lg text-[#8B1A1A] flex items-center gap-2">
                <Sparkles size={18} className="text-[#FF6B1A]" />
                Select Travel Archetype
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {travelStylesList.map(st => (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() => setTravelStyle(st.name)}
                    className={`p-3.5 rounded-2xl text-left border transition-all duration-300 ${
                      travelStyle === st.name
                        ? 'bg-gradient-to-br from-[#8B1A1A] to-[#6d1414] text-white border-[#8B1A1A] shadow-md scale-[1.02]'
                        : 'bg-[#FFF8F0] border-[#E8DCC4] hover:border-[#FF6B1A] text-[#8B1A1A]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{st.icon}</div>
                    <h4 className="font-bold text-sm leading-snug">{st.name}</h4>
                    <p className={`text-[11px] mt-1 line-clamp-2 ${travelStyle === st.name ? 'text-orange-200' : 'text-[#8B1A1A]/60'}`}>
                      {st.desc}
                    </p>
                  </button>
                ))}
              </div>
            </Card>

            {/* 3. INTERESTS & SPECIALTIES */}
            <Card className="space-y-4 bg-white border-[#E8DCC4]">
              <h3 className="font-serif font-bold text-lg text-[#8B1A1A] flex items-center gap-2">
                <Heart size={18} className="text-[#FF6B1A]" />
                Personalize Key Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(int => {
                  const sel = interests.includes(int);
                  return (
                    <button
                      key={int}
                      type="button"
                      onClick={() => toggleInterest(int)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
                        sel
                          ? 'bg-[#FF6B1A] text-white border-[#FF6B1A] shadow-sm'
                          : 'bg-[#FFF8F0] text-[#8B1A1A]/70 border-[#E8DCC4] hover:border-[#FF6B1A] hover:text-[#8B1A1A]'
                      }`}
                    >
                      {sel ? '✓ ' : '+ '} {int}
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Generate Action Button */}
            <Button
              type="button"
              onClick={generatePlan}
              disabled={loading}
              className="w-full py-4 text-base tracking-wide uppercase font-bold bg-gradient-to-r from-[#FF6B1A] via-[#E55A10] to-[#8B1A1A] hover:opacity-95 shadow-lg flex items-center justify-center gap-3 rounded-2xl"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Comprehensive AI Plan…
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Generate {totalTripDays}-Day Multi-City Circuit
                </>
              )}
            </Button>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Sidebar Telemetry & Parameters (1 Col) */}
          <div className="space-y-6">
            {/* Live Weather Telemetry */}
            <Card className="bg-white border-[#E8DCC4]">
              <h4 className="font-bold text-[#8B1A1A] mb-3 flex items-center gap-2 text-sm">
                <CloudSun size={18} className="text-[#FF6B1A]" />
                Gateway Weather: {primaryCity}
              </h4>
              {loadingWeather ? (
                <p className="text-xs text-[#8B1A1A]/60 animate-pulse">Syncing meteorology telemetry…</p>
              ) : weatherData?.current ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{weatherData.current.icon}</span>
                      <div>
                        <div className="text-2xl font-serif font-bold text-[#8B1A1A]">
                          {weatherData.current.temperature}°C
                        </div>
                        <p className="text-[11px] font-semibold text-[#8B1A1A]/70">
                          {weatherData.current.label}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-[#8B1A1A]/70 space-y-0.5 font-medium">
                      <p>💧 {weatherData.current.humidity}% Humidity</p>
                      <p>💨 {weatherData.current.windSpeed} km/h</p>
                    </div>
                  </div>

                  {weatherData.forecast && weatherData.forecast.length > 0 && (
                    <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-[#E8DCC4] text-center">
                      {weatherData.forecast.slice(0, 4).map((f) => (
                        <div key={f.date} className="bg-[#FFF8F0] p-1.5 rounded-xl border border-[#E8DCC4]">
                          <p className="text-[10px] font-bold text-[#8B1A1A]/60">{f.day}</p>
                          <p className="text-base my-0.5">{f.icon}</p>
                          <p className="text-[10px] font-bold text-[#8B1A1A]">{f.maxTemp}°</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#8B1A1A]/60">Weather conditions updated in real-time.</p>
              )}
            </Card>

            {/* Budget & Pacing Controls */}
            <Card className="bg-white border-[#E8DCC4] space-y-4">
              <h4 className="font-bold text-[#8B1A1A] flex items-center gap-2 text-sm">
                <IndianRupee size={18} className="text-[#FF6B1A]" />
                Budget & Pacing
              </h4>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8B1A1A]/60 block mb-1">
                  Budget Tier
                </label>
                <select
                  value={budgetTier}
                  onChange={(e) => setBudgetTier(e.target.value)}
                  className="w-full bg-[#FFF8F0] border border-[#E8DCC4] rounded-xl px-3 py-2 text-xs font-semibold text-[#8B1A1A] outline-none"
                >
                  <option value="Backpacker (₹1,500–₹3,000/day)">Backpacker (₹1,500–₹3,000/day)</option>
                  <option value="Budget (₹3,000–₹5,000/day)">Budget (₹3,000–₹5,000/day)</option>
                  <option value="Comfort (₹5,000–₹10,000/day)">Comfort (₹5,000–₹10,000/day)</option>
                  <option value="Luxury (₹10,000–₹25,000/day)">Luxury (₹10,000–₹25,000/day)</option>
                  <option value="Ultra-Luxury (₹25,000+/day)">Ultra-Luxury (₹25,000+/day)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8B1A1A]/60 block mb-1">
                  Travel Pacing
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Relaxed', 'Moderate', 'Intense'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPace(p)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        pace === p
                          ? 'bg-[#8B1A1A] text-white border-[#8B1A1A]'
                          : 'bg-[#FFF8F0] text-[#8B1A1A] border-[#E8DCC4] hover:bg-[#FFF2E8]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-gradient-to-br from-[#FFF8F0] to-[#FFF2E8] border border-[#FFE2C5] p-4">
              <div className="flex gap-2.5">
                <span className="text-xl">💡</span>
                <div className="text-xs text-[#8B1A1A]/80 leading-relaxed">
                  <b>Pro Tip:</b> For multi-city journeys across Rajasthan or North India, keep at least 2 days per major hub to experience morning aartis and local sunset spots.
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* 4. RESULTS & INTERACTIVE ITINERARY BREAKDOWN */}
        {itinerary && current && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6 pt-6 border-t-2 border-dashed border-[#E8DCC4]"
          >
            <div className="flex justify-between items-start flex-wrap gap-4 bg-white border border-[#E8DCC4] rounded-2xl p-6 shadow-sm">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <Badge variant="primary">AI Generated Route</Badge>
                  <Badge variant="gold">{budgetTier.split('(')[0]}</Badge>
                  <Badge variant="secondary">{travelStyle}</Badge>
                </div>
                <h3 className="font-serif font-bold text-2xl text-[#8B1A1A] mt-2">
                  Your {itinerary.days.length}-Day Expedition: {itinerary.destination}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={saveItinerary}
                  disabled={saveState === 'saving'}
                  className="text-xs px-5 py-2.5"
                >
                  📥 {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved to Dashboard' : 'Save Itinerary'}
                </Button>
              </div>
            </div>

            {/* City-Grouped Day Tabs */}
            {(() => {
              const uniqueCities = Array.from(new Set(itinerary.days.map(d => d.city).filter(Boolean)));
              const isMultiCity = (itinerary.cities && itinerary.cities.length > 1) || uniqueCities.length > 1 || (typeof itinerary.destination === 'string' && itinerary.destination.includes('→'));

              if (isMultiCity) {
                const cityGroups = [];
                itinerary.days.forEach(d => {
                  const cityName = d.city || 'City';
                  const last = cityGroups[cityGroups.length - 1];
                  if (last && last.city === cityName) {
                    last.days.push(d);
                  } else {
                    cityGroups.push({ city: cityName, days: [d] });
                  }
                });

                return (
                  <div className="flex items-center gap-3 flex-wrap bg-white p-3.5 rounded-2xl border border-[#E8DCC4]">
                    {cityGroups.map((group, gIdx) => (
                      <React.Fragment key={group.city + '-' + gIdx}>
                        <div className="inline-flex items-center gap-2 bg-[#FFF8F0] border border-[#E8DCC4] rounded-full px-3 py-1">
                          <span className="font-serif font-bold text-xs text-[#8B1A1A]">
                            📍 {group.city}:
                          </span>
                          <div className="flex gap-1.5">
                            {group.days.map(d => (
                              <button
                                key={d.day}
                                type="button"
                                onClick={() => setActiveDay(d.day)}
                                className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  d.day === activeDay
                                    ? 'bg-[#8B1A1A] text-white shadow-sm'
                                    : 'bg-white border border-[#E8DCC4] text-[#8B1A1A] hover:bg-[#FFF2E8]'
                                }`}
                              >
                                {d.day}
                              </button>
                            ))}
                          </div>
                        </div>
                        {gIdx < cityGroups.length - 1 && (
                          <span className="text-[#8B1A1A]/30 font-light">|</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                );
              }

              // Single city tabs
              return (
                <div className="flex gap-2 flex-wrap bg-white p-3 rounded-2xl border border-[#E8DCC4]">
                  {itinerary.days.map(d => (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => setActiveDay(d.day)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        d.day === activeDay
                          ? 'bg-[#8B1A1A] text-white shadow-sm'
                          : 'bg-[#FFF8F0] border border-[#E8DCC4] text-[#8B1A1A] hover:bg-[#FFF2E8]'
                      }`}
                    >
                      Day {d.day}
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Active Day Detail Card */}
            <Card className="bg-white border-[#E8DCC4] p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#E8DCC4] pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-serif font-bold text-2xl text-[#8B1A1A]">
                      Day {current.day} — {current.title}
                    </h3>
                    {current.city && (
                      <span className="text-xs bg-[#FF6B1A]/10 text-[#FF6B1A] border border-[#FF6B1A]/20 px-2.5 py-0.5 rounded-full font-bold">
                        📍 {current.city}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-3.5 py-1.5 rounded-xl border border-[#E8DCC4] text-xs font-bold text-[#8B1A1A] hover:bg-[#FFF8F0] transition-colors"
                  >
                    {isEditing ? '✓ Done Editing' : '✏️ Edit Day'}
                  </button>
                  <button
                    type="button"
                    onClick={() => regenerateDay(current.day)}
                    disabled={regenDay === current.day}
                    className="px-3.5 py-1.5 rounded-xl bg-[#FFF8F0] border border-[#E8DCC4] text-xs font-bold text-[#FF6B1A] hover:bg-[#FFF2E8] transition-colors disabled:opacity-50"
                  >
                    🔄 {regenDay === current.day ? 'Regenerating…' : 'Regenerate Day'}
                  </button>
                </div>
              </div>

              {/* Day Breakdown Activities */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#FFF8F0] p-4 rounded-2xl border border-[#E8DCC4] space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B1A] flex items-center gap-1">
                    <span>🌅</span> Morning
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={current.morning}
                      onChange={(e) => handleDayFieldChange(current.day, 'morning', e.target.value)}
                      className="w-full bg-white border border-[#E8DCC4] rounded-xl p-2 text-xs text-[#2D1B00] outline-none"
                    />
                  ) : (
                    <p className="text-xs text-[#2D1B00]/80 leading-relaxed">{current.morning}</p>
                  )}
                </div>

                <div className="bg-[#FFF8F0] p-4 rounded-2xl border border-[#E8DCC4] space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B1A] flex items-center gap-1">
                    <span>☀️</span> Afternoon
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={current.afternoon}
                      onChange={(e) => handleDayFieldChange(current.day, 'afternoon', e.target.value)}
                      className="w-full bg-white border border-[#E8DCC4] rounded-xl p-2 text-xs text-[#2D1B00] outline-none"
                    />
                  ) : (
                    <p className="text-xs text-[#2D1B00]/80 leading-relaxed">{current.afternoon}</p>
                  )}
                </div>

                <div className="bg-[#FFF8F0] p-4 rounded-2xl border border-[#E8DCC4] space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#FF6B1A] flex items-center gap-1">
                    <span>🌆</span> Evening
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={current.evening}
                      onChange={(e) => handleDayFieldChange(current.day, 'evening', e.target.value)}
                      className="w-full bg-white border border-[#E8DCC4] rounded-xl p-2 text-xs text-[#2D1B00] outline-none"
                    />
                  ) : (
                    <p className="text-xs text-[#2D1B00]/80 leading-relaxed">{current.evening}</p>
                  )}
                </div>
              </div>

              {/* Meals & Budget Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-[#E8DCC4] space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B1A1A]/70 flex items-center gap-1.5">
                    🍛 Curated Cuisine & Meals:
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={current.meals}
                      onChange={(e) => handleDayFieldChange(current.day, 'meals', e.target.value)}
                      className="w-full bg-[#FFF8F0] border border-[#E8DCC4] rounded-xl px-3 py-1.5 text-xs text-[#2D1B00] outline-none"
                    />
                  ) : (
                    <p className="text-xs font-semibold text-[#8B1A1A]">{current.meals}</p>
                  )}
                </div>

                <div className="bg-white p-4 rounded-2xl border border-[#E8DCC4] space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B1A1A]/70 flex items-center gap-1.5">
                    💰 Day Cost Estimate:
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={current.estimatedBudgetINR}
                      onChange={(e) => handleDayFieldChange(current.day, 'estimatedBudgetINR', e.target.value)}
                      className="w-full bg-[#FFF8F0] border border-[#E8DCC4] rounded-xl px-3 py-1.5 text-xs text-[#2D1B00] outline-none"
                    />
                  ) : (
                    <p className="text-xs font-bold text-[#138808]">{current.estimatedBudgetINR}</p>
                  )}
                </div>
              </div>

              {/* Day Tip */}
              {current.tips && (
                <div className="bg-[#FFF2E8] border border-[#FF6B1A]/20 rounded-2xl p-4 flex items-start gap-3">
                  <span className="text-lg text-[#FF6B1A]">💡</span>
                  <div className="text-xs text-[#8B1A1A]/90">
                    <b className="text-[#FF6B1A]">Local Insider Tip: </b>
                    {isEditing ? (
                      <input
                        type="text"
                        value={current.tips}
                        onChange={(e) => handleDayFieldChange(current.day, 'tips', e.target.value)}
                        className="w-full bg-white border border-[#E8DCC4] rounded-xl px-3 py-1 text-xs text-[#2D1B00] outline-none mt-1"
                      />
                    ) : (
                      current.tips
                    )}
                  </div>
                </div>
              )}
            </Card>

            {saveState === 'saved' && (
              <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center justify-between">
                <span>✓ Itinerary successfully saved! View and manage it anytime in your My Trips dashboard.</span>
                <Button variant="ghost" onClick={() => navigate("/dashboard/trips")} className="text-xs px-3 py-1">
                  View in My Trips →
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
};

// 6. TRAVEL JOURNAL
const Journal = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    locationName: "",
    date: "",
    time: "",
    title: "",
    note: "",
    mood: "Adventurous",
  });
  const [selectedPhotos, setSelectedPhotos] = useState([]); // Array of { file, previewUrl, caption }

  const MOOD_OPTIONS = [
    "Adventurous",
    "Peaceful",
    "Ecstatic",
    "Nostalgic",
    "Spiritual",
    "Enchanted",
    "Exhausted but Happy",
  ];

  // Fetch entries on load
  const loadJournalEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await journalApi.getMyJournalEntries();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load journal entries:", err);
      setError(err.message || "Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJournalEntries();
  }, []);

  // Handle query params when navigated from destination page
  useEffect(() => {
    const destParam = searchParams.get("destination");
    const dateParam = searchParams.get("date");
    const timeParam = searchParams.get("time");
    const actionParam = searchParams.get("action");

    if (actionParam === "new" || destParam) {
      const now = new Date();
      setFormData((prev) => ({
        ...prev,
        locationName: destParam || prev.locationName,
        date: dateParam || now.toISOString().split("T")[0],
        time: timeParam || now.toTimeString().slice(0, 5),
        title: destParam ? `Memories of ${destParam}` : prev.title,
      }));
      setIsModalOpen(true);
    }
  }, [searchParams]);

  const handleOpenNewEntry = () => {
    const now = new Date();
    setFormData({
      locationName: "",
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      title: "",
      note: "",
      mood: "Adventurous",
    });
    setSelectedPhotos([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhotos([]);
    // Clean up query params if present
    if (searchParams.get("action") || searchParams.get("destination")) {
      setSearchParams({});
    }
  };

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newPhotoItems = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      caption: "",
    }));

    setSelectedPhotos((prev) => [...prev, ...newPhotoItems]);
    e.target.value = ""; // Reset input
  };

  const handlePhotoCaptionChange = (index, newCaption) => {
    setSelectedPhotos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], caption: newCaption };
      return updated;
    });
  };

  const handleRemovePhoto = (index) => {
    setSelectedPhotos((prev) => {
      const item = prev[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.locationName.trim()) {
      alert("Please specify a destination / location name.");
      return;
    }
    if (!formData.date) {
      alert("Please select a date for your journal entry.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("locationName", formData.locationName.trim());
      payload.append("date", formData.date);
      payload.append("time", formData.time || "");
      payload.append("title", formData.title.trim() || `Journey to ${formData.locationName}`);
      payload.append("note", formData.note.trim());
      payload.append("mood", formData.mood);

      const captionsArray = [];
      selectedPhotos.forEach((item) => {
        payload.append("photos", item.file);
        captionsArray.push(item.caption || "");
      });
      payload.append("captions", JSON.stringify(captionsArray));

      const res = await journalApi.createJournalEntry(payload);
      if (res?.entry) {
        setEntries((prev) => [res.entry, ...prev]);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Failed to create journal entry:", err);
      alert(err.message || "Failed to create journal entry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this travel journal memory?")) return;

    setDeletingId(id);
    try {
      await journalApi.deleteJournalEntry(id);
      setEntries((prev) => prev.filter((entry) => entry._id !== id));
    } catch (err) {
      console.error("Failed to delete journal entry:", err);
      alert("Failed to delete entry: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-4xl font-serif font-bold text-[#8B1A1A]">
              My Travel Journal
            </h2>
            <p className="text-[#8B1A1A]/60 mt-1">
              Personal chronicles, authentic snapshots, and reflections from your explorations across India.
            </p>
          </div>
          <Button onClick={handleOpenNewEntry} className="shadow-md">
            <Plus size={18} /> New Entry
          </Button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/60 border border-[#E8DCC4] rounded-3xl">
            <div className="w-10 h-10 border-3 border-[#FF6B1A] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-[#8B1A1A]/70">Loading your travel journal...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 border border-red-200 rounded-3xl">
            <p className="text-red-700 font-bold mb-2">⚠️ {error}</p>
            <button
              onClick={loadJournalEntries}
              className="px-4 py-2 bg-[#8B1A1A] text-white text-xs font-bold rounded-xl hover:bg-[#701515] transition"
            >
              Retry
            </button>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 px-6 bg-[#FFF8F0] border border-dashed border-[#E8DCC4] rounded-3xl space-y-4 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#FFF2E8] text-[#FF6B1A] flex items-center justify-center mx-auto text-3xl">
              📖
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#8B1A1A]">
              Your journal is waiting for its first story
            </h3>
            <p className="text-sm text-[#8B1A1A]/70 max-w-md mx-auto leading-relaxed">
              Capture your travel memories, thoughts, and real moments. Click on the journal icon on any destination page or start a new entry right here.
            </p>
            <div className="pt-2">
              <Button onClick={handleOpenNewEntry} className="px-6 py-3">
                <Plus size={16} className="mr-1 inline" /> Record Your First Memory
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8 relative before:absolute before:left-8 before:top-4 before:bottom-4 before:w-0.5 before:bg-[#E8DCC4]">
            {entries.map((entry) => (
              <div key={entry._id} className="pl-16 relative group">
                <div className="absolute left-6 top-6 w-4 h-4 bg-[#FF6B1A] rounded-full border-4 border-[#FDF6EC] shadow-sm"></div>

                <Card className="transition-all duration-300 hover:border-[#FF6B1A]/40 hover:shadow-md">
                  {/* Entry Header */}
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#FF6B1A] uppercase tracking-wider flex items-center gap-1">
                        <Calendar size={13} />
                        {entry.date}
                      </span>
                      {entry.time && (
                        <span className="text-xs text-[#8B1A1A]/50 flex items-center gap-1">
                          • <Clock size={12} /> {entry.time}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {entry.mood && (
                        <span className="text-xs font-bold bg-[#8B1A1A]/5 px-2.5 py-1 rounded-full text-[#8B1A1A] border border-[#8B1A1A]/10">
                          Mood: {entry.mood}
                        </span>
                      )}
                      <button
                        onClick={(e) => handleDeleteEntry(entry._id, e)}
                        disabled={deletingId === entry._id}
                        title="Delete journal entry"
                        className="p-1.5 text-[#8B1A1A]/40 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Location */}
                  <div className="mt-3">
                    <h3 className="text-2xl font-serif font-bold text-[#8B1A1A]">
                      {entry.title || `Trip to ${entry.locationName}`}
                    </h3>
                    <p className="text-xs font-semibold text-[#8B1A1A]/70 flex items-center gap-1 mt-1">
                      <MapPin size={13} className="text-[#FF6B1A]" />
                      {entry.locationName}
                    </p>
                  </div>

                  {/* Free-text Note */}
                  {entry.note && (
                    <div className="mt-4 text-[#2D1B00]/85 text-sm leading-relaxed whitespace-pre-line bg-[#FDF6EC]/60 p-4 rounded-2xl border border-[#E8DCC4]/50">
                      {entry.note}
                    </div>
                  )}

                  {/* Photo Gallery & Captions */}
                  {entry.photos && entry.photos.length > 0 && (
                    <div className="mt-5 space-y-3">
                      <p className="text-[10px] font-bold text-[#8B1A1A]/50 uppercase tracking-wider flex items-center gap-1">
                        <Camera size={13} /> Captured Photos ({entry.photos.length})
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {entry.photos.map((photo, pIdx) => (
                          <div
                            key={photo._id || pIdx}
                            className="bg-white rounded-2xl overflow-hidden border border-[#E8DCC4] shadow-sm flex flex-col"
                          >
                            <div className="relative h-44 overflow-hidden bg-[#F5E6D3]">
                              <img
                                src={photo.url}
                                alt={photo.caption || entry.locationName}
                                loading="lazy"
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            {photo.caption && (
                              <div className="p-3 bg-[#FFF8F0] border-t border-[#E8DCC4]/40 flex-1">
                                <p className="text-xs text-[#8B1A1A]/80 italic line-clamp-2">
                                  💬 "{photo.caption}"
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Modal: New Journal Entry Form */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-[#FFF8F0] border border-[#E8DCC4] rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar"
              >
                {/* Modal Header */}
                <div className="flex justify-between items-start mb-6 border-b border-[#E8DCC4] pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B1A]">
                      New Memory
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-[#8B1A1A]">
                      Record Travel Journal Entry
                    </h3>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="w-8 h-8 rounded-full bg-[#8B1A1A]/10 text-[#8B1A1A] hover:bg-[#8B1A1A] hover:text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Destination and Title */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest block mb-1">
                        Destination / Location *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Jaipur, Hampi, Varanasi"
                        value={formData.locationName}
                        onChange={(e) =>
                          setFormData({ ...formData, locationName: e.target.value })
                        }
                        className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2.5 text-sm text-[#2D1B00] outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest block mb-1">
                        Entry Title
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Twilight over Amber Fort"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2.5 text-sm text-[#2D1B00] outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A]"
                      />
                    </div>
                  </div>

                  {/* Date, Time, Mood */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest block mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                        className="w-full bg-white border border-[#E8DCC4] rounded-xl px-3 py-2 text-sm text-[#2D1B00] outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest block mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) =>
                          setFormData({ ...formData, time: e.target.value })
                        }
                        className="w-full bg-white border border-[#E8DCC4] rounded-xl px-3 py-2 text-sm text-[#2D1B00] outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest block mb-1">
                        Travel Mood
                      </label>
                      <select
                        value={formData.mood}
                        onChange={(e) =>
                          setFormData({ ...formData, mood: e.target.value })
                        }
                        className="w-full bg-white border border-[#E8DCC4] rounded-xl px-3 py-2 text-sm text-[#2D1B00] outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A]"
                      >
                        {MOOD_OPTIONS.map((mood) => (
                          <option key={mood} value={mood}>
                            {mood}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Main Free-Text Note */}
                  <div>
                    <label className="text-[11px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest block mb-1">
                      Your Story & Personal Reflections
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Write your impressions, sights, scents, conversations with locals, and serendipitous moments..."
                      value={formData.note}
                      onChange={(e) =>
                        setFormData({ ...formData, note: e.target.value })
                      }
                      className="w-full bg-white border border-[#E8DCC4] rounded-xl p-4 text-sm text-[#2D1B00] outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 focus:border-[#FF6B1A] leading-relaxed resize-y"
                    />
                  </div>

                  {/* Device Photo Upload Section */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest flex items-center gap-1.5">
                        <Camera size={14} className="text-[#FF6B1A]" /> Upload Real Photos from Your Device
                      </label>
                      <span className="text-xs text-[#8B1A1A]/50">
                        {selectedPhotos.length} photo{selectedPhotos.length !== 1 ? 's' : ''} chosen
                      </span>
                    </div>

                    <label className="border-2 border-dashed border-[#E8DCC4] hover:border-[#FF6B1A] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/70 hover:bg-[#FFF2E8]/40 transition-colors">
                      <div className="w-12 h-12 rounded-full bg-[#FFF2E8] text-[#FF6B1A] flex items-center justify-center">
                        <Camera size={22} />
                      </div>
                      <p className="text-sm font-bold text-[#8B1A1A]">
                        Click to select photos from your device
                      </p>
                      <p className="text-xs text-[#8B1A1A]/50">
                        JPG, PNG, WebP up to 10MB per photo (stored securely on Cloudinary)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>

                    {/* Previews with per-photo captions */}
                    {selectedPhotos.length > 0 && (
                      <div className="space-y-3 mt-3">
                        <p className="text-xs font-bold text-[#8B1A1A] uppercase tracking-wider">
                          Photo Captions & Moments
                        </p>
                        <div className="space-y-3">
                          {selectedPhotos.map((item, idx) => (
                            <div
                              key={idx}
                              className="bg-white border border-[#E8DCC4] rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3"
                            >
                              <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#F5E6D3] shrink-0 border border-[#E8DCC4]">
                                <img
                                  src={item.previewUrl}
                                  alt={`Upload preview ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 w-full">
                                <label className="text-[10px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest block mb-1">
                                  Caption for Photo #{idx + 1}
                                </label>
                                <input
                                  type="text"
                                  placeholder="e.g. Chai stall near the old ghats at 6 AM..."
                                  value={item.caption}
                                  onChange={(e) =>
                                    handlePhotoCaptionChange(idx, e.target.value)
                                  }
                                  className="w-full bg-[#FFF8F0] border border-[#E8DCC4] rounded-lg px-3 py-2 text-xs text-[#2D1B00] outline-none focus:ring-1 focus:ring-[#FF6B1A]"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                title="Remove photo"
                                className="self-end sm:self-center p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-[#E8DCC4]">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCloseModal}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Uploading & Saving..." : "Save Journal Entry"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
};

// 7. REVIEWS
const Reviews = () => (
  <PageTransition>
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-serif font-bold text-[#8B1A1A] mb-8">My Reviews & Ratings</h2>
      <div className="grid grid-cols-1 gap-6">
        {[
          { place: 'The Leela Palace, Udaipur', rating: 5, date: 'May 2024', comment: 'Exceptional hospitality. The lake view is unmatched in India.' },
          { place: 'Fort Tiracol Heritage Hotel', rating: 4, date: 'Mar 2024', comment: 'A hidden gem in North Goa. Quiet, historic, and beautiful.' },
        ].map((r, i) => (
          <Card key={i} className="flex gap-6">
            <div className="w-24 h-24 bg-[#8B1A1A]/5 rounded-2xl flex items-center justify-center shrink-0">
               <Star size={32} className="text-[#F5A623]" fill="currentColor" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-bold text-[#8B1A1A]">{r.place}</h4>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} className={idx < r.rating ? "text-[#F5A623] fill-current" : "text-[#E8DCC4]"} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#8B1A1A]/40 mt-1">Reviewed on {r.date}</p>
              <p className="text-sm text-[#8B1A1A]/80 mt-3 italic">"{r.comment}"</p>
              <div className="mt-4 flex gap-4">
                 <button className="text-[10px] font-bold text-[#8B1A1A]/60 flex items-center gap-1"><MessageSquare size={12} /> Edit</button>
                 <button className="text-[10px] font-bold text-[#8B1A1A]/60 flex items-center gap-1 text-red-400"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </PageTransition>
);

// 8. SUSTAINABLE TRAVEL
const Sustainable = () => {
  const data = [ { name: 'Train', value: 70 }, { name: 'Flight', value: 30 } ];
  return (
    <PageTransition>
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-6">
  <div className="flex items-center gap-4">
    <div className="w-16 h-16 rounded-full bg-[#138808]/10 flex items-center justify-center">
      <Leaf size={32} className="text-[#138808]" />
    </div>

    <div>
      <h2 className="text-3xl font-serif font-bold text-[#138808]">
        Eco Explorer Score
      </h2>

      <p className="text-[#8B1A1A]/60">
        You're among the top 5% of sustainable travelers in India.
      </p>
    </div>
  </div>

  <div className="bg-[#138808]/10 px-5 py-3 rounded-2xl">
    <p className="text-xs uppercase tracking-wider text-[#138808] font-bold">
      Eco Rank
    </p>

    <p className="text-2xl font-bold text-[#138808]">
      #142
    </p>
  </div>
</div>


<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

  {/* Eco Score */}

  <Card className="flex flex-col items-center justify-center py-10">

    <div className="relative w-44 h-44">

      <div className="absolute inset-0 flex flex-col items-center justify-center">

        <span className="text-5xl font-bold text-[#138808]">
          840
        </span>

        <span className="text-xs text-gray-500">
          /1000
        </span>

      </div>

      <svg className="w-full h-full -rotate-90">

        <circle
          cx="88"
          cy="88"
          r="75"
          stroke="#E8DCC4"
          strokeWidth="12"
          fill="none"
        />

        <circle
          cx="88"
          cy="88"
          r="75"
          stroke="#138808"
          strokeWidth="12"
          fill="none"
          strokeDasharray="471"
          strokeDashoffset="75"
          strokeLinecap="round"
        />

      </svg>

    </div>

    <p className="mt-5 text-xl font-bold text-[#138808]">
      Excellent
    </p>

    <p className="text-sm text-[#8B1A1A]/60 mt-1">
      Keep making eco-friendly choices 🌱
    </p>

  </Card>


  {/* Carbon Saved */}

  <Card className="flex flex-col justify-between p-8">

    <div>

      <div className="flex items-center gap-3">

        <div className="w-12 h-12 rounded-xl bg-[#138808]/10 flex items-center justify-center">

          🌍

        </div>

        <div>

          <h3 className="font-bold text-[#8B1A1A]">
            Carbon Saved
          </h3>

          <p className="text-xs text-[#8B1A1A]/50">
            Compared to average travelers
          </p>

        </div>

      </div>

      <div className="mt-8">

        <h1 className="text-5xl font-bold text-[#138808]">
          126
        </h1>

        <p className="text-[#8B1A1A]/60">
          kg CO₂
        </p>

      </div>

    </div>

    <div className="mt-8 border-t pt-5">

      <div className="flex justify-between">

        <span className="text-[#8B1A1A]/60">
          Trees Equivalent
        </span>

        <span className="font-bold text-[#138808]">
          🌳 6 Trees
        </span>

      </div>

    </div>

  </Card>


  {/* Quick Stats */}

  <Card className="p-8">

    <h3 className="font-bold text-[#8B1A1A] mb-6">
      Sustainability Highlights
    </h3>

    <div className="space-y-5">

      <div className="flex justify-between items-center">

        <span>Train Journeys</span>

        <span className="font-bold text-[#138808]">
          18
        </span>

      </div>

      <div className="flex justify-between items-center">

        <span>Eco Hotels</span>

        <span className="font-bold text-[#138808]">
          9
        </span>

      </div>

      <div className="flex justify-between items-center">

        <span>Plastic Saved</span>

        <span className="font-bold text-[#138808]">
          52 Bottles
        </span>

      </div>

      <div className="flex justify-between items-center">

        <span>Green Trips</span>

        <span className="font-bold text-[#138808]">
          14
        </span>

      </div>

      <div className="flex justify-between items-center">

        <span>Eco Rating</span>

        <span className="font-bold text-[#138808]">
          ⭐ 4.9/5
        </span>

      </div>

    </div>

  </Card>

</div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          <Card className="md:col-span-2 p-8">

  <h3 className="font-bold text-[#8B1A1A] text-xl mb-8">
    Transport Impact & Eco Score Breakdown
  </h3>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

    <div className="h-64">

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={65}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            <Cell fill="#138808" />
            <Cell fill="#8B1A1A" />
          </Pie>

          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

    </div>

    <div className="space-y-5">

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>Train Journeys</span>
          <span className="font-bold text-[#138808]">+250</span>
        </div>

        <div className="w-full h-2 rounded-full bg-[#E8DCC4]">
          <div className="w-[90%] h-full bg-[#138808] rounded-full"></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>Eco Hotels</span>
          <span className="font-bold text-[#138808]">+180</span>
        </div>

        <div className="w-full h-2 rounded-full bg-[#E8DCC4]">
          <div className="w-[75%] h-full bg-[#138808] rounded-full"></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>Reusable Bottle</span>
          <span className="font-bold text-[#138808]">+60</span>
        </div>

        <div className="w-full h-2 rounded-full bg-[#E8DCC4]">
          <div className="w-[45%] h-full bg-[#138808] rounded-full"></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-2">
          <span>Flights Taken</span>
          <span className="font-bold text-[#8B1A1A]">-120</span>
        </div>

        <div className="w-full h-2 rounded-full bg-[#E8DCC4]">
          <div className="w-[35%] h-full bg-[#8B1A1A] rounded-full"></div>
        </div>
      </div>

      <div className="mt-8 p-4 rounded-xl bg-[#138808]/5 border border-[#138808]/20">

        <p className="font-bold text-[#138808]">
          🌱 Sustainability Insight
        </p>

        <p className="text-sm text-[#8B1A1A]/70 mt-2">
          Choosing trains instead of flights saved approximately
          <span className="font-bold text-[#138808]">
            {" "}126 kg CO₂
          </span>
          on your recent trips.
        </p>

      </div>

    </div>

  </div>

</Card>

        </div>
        <section>
  <h3 className="font-serif text-2xl font-bold text-[#138808] mb-6">
    💡 Personalized Eco Tips
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

    {[
      {
        icon: "♻️",
        title: "Carry a Reusable Bottle",
        desc: "Avoid purchasing single-use plastic bottles while travelling.",
        impact: "Saves ~25 plastic bottles/year"
      },
      {
        icon: "🚆",
        title: "Prefer Trains Over Flights",
        desc: "For journeys under 500 km, trains reduce carbon emissions significantly.",
        impact: "Up to 80% lower CO₂"
      },
      {
        icon: "🏨",
        title: "Choose Eco-certified Stays",
        desc: "Support accommodations that use renewable energy and sustainable practices.",
        impact: "Supports Green Tourism"
      },
      {
        icon: "🥗",
        title: "Eat Local Food",
        desc: "Choose locally sourced meals to reduce transportation emissions.",
        impact: "Supports Local Communities"
      },
      {
        icon: "🚲",
        title: "Walk or Cycle",
        desc: "Explore destinations on foot or by bicycle whenever possible.",
        impact: "Zero Carbon Travel"
      },
      {
        icon: "🌳",
        title: "Offset Your Carbon",
        desc: "Contribute to verified carbon offset projects for unavoidable emissions.",
        impact: "Improves Eco Score"
      }
    ].map((tip, index) => (
      <Card
        key={index}
        className="group hover:border-[#138808] hover:shadow-lg transition-all duration-300"
      >
        <div className="flex gap-5">

          <div className="w-14 h-14 rounded-2xl bg-[#138808]/10 flex items-center justify-center text-3xl">
            {tip.icon}
          </div>

          <div className="flex-1">

            <h4 className="font-bold text-lg text-[#8B1A1A]">
              {tip.title}
            </h4>

            <p className="text-sm text-[#8B1A1A]/60 mt-2 leading-6">
              {tip.desc}
            </p>

            <span className="inline-block mt-4 px-3 py-1 rounded-full bg-[#138808]/10 text-[#138808] text-xs font-bold">
              {tip.impact}
            </span>

          </div>

        </div>
      </Card>
    ))}

  </div>
</section>
      </div>
      
    </PageTransition>
  );
};

// 9. NOTIFICATIONS
const Notifications = () => (
  <PageTransition>
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-[#8B1A1A]">Inbox</h2>
        <button className="text-xs font-bold text-[#FF6B1A]">Mark all as read</button>
      </div>
      <div className="space-y-4">
        {[
          { icon: Plane, color: 'primary', title: 'Trip Update', desc: 'Your flight to Varanasi is on schedule. Web check-in opens in 24h.', time: '2h ago' },
          { icon: Leaf, color: 'success', title: 'Sustainability Badge', desc: 'You earned the "Green Traveler" badge for choosing rail travel!', time: '1d ago' },
          { icon: ShoppingBag, color: 'gold', title: 'Exclusive Deal', desc: 'Up to 20% off on luxury heritage properties in Rajasthan.', time: '3d ago' },
        ].map((n, i) => (
          <Card key={i} className="flex gap-4 items-start hover:bg-[#F5E6D3]/30 transition-colors cursor-pointer">
            <div className={`p-3 bg-${n.color === 'primary' ? '[#FF6B1A]' : '[#138808]'}/10 text-${n.color === 'primary' ? '[#FF6B1A]' : '[#138808]'} rounded-xl`}>
              <n.icon size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-[#8B1A1A] text-sm">{n.title}</h4>
              <p className="text-xs text-[#8B1A1A]/60 mt-1">{n.desc}</p>
            </div>
            <span className="text-[10px] font-bold text-[#8B1A1A]/30">{n.time}</span>
          </Card>
        ))}
      </div>
    </div>
  </PageTransition>
);

// 10. SETTINGS
const SettingsPage = () => {
  const { user, updateUser, setUser } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState(null);

  const interestCategories = [
    { id: "heritage", label: "🏛️ Heritage", desc: "Forts, Palaces & Ancient Sites" },
    { id: "adventure", label: "🏔️ Adventure", desc: "Trekking, Climbing & Expeditions" },
    { id: "spiritual", label: "🧘 Spiritual", desc: "Temples, Ghats & Meditation" },
    { id: "wildlife", label: "🐅 Wildlife", desc: "Safaris & National Parks" },
    { id: "coastal", label: "🌊 Coastal", desc: "Beaches, Sea & Coastal Towns" },
    { id: "food", label: "🍛 Food Trails", desc: "Culinary & Street Food Tours" },
    { id: "wellness", label: "🌿 Wellness", desc: "Yoga, Ayurveda & Healing" },
    { id: "photography", label: "📸 Photography", desc: "Scenic Vistas & Sunsets" },
    { id: "himalayan", label: "❄️ Himalayan", desc: "Snow Peaks & Mountain Passes" },
    { id: "cultural", label: "🎭 Cultural", desc: "Bazaars, Folk Art & Festivals" },
  ];

  useEffect(() => {
    if (user?.interests && Array.isArray(user.interests)) {
      setSelectedInterests(user.interests.map(i => i.toLowerCase()));
    } else {
      setSelectedInterests([]);
    }
  }, [user]);

  const toggleInterest = (id) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSavePreferences = async () => {
    if (selectedInterests.length === 0) {
      setError("Please select at least one travel interest.");
      return;
    }

    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const res = await updateInterests(selectedInterests);
      const updated = res?.user || { ...user, interests: selectedInterests };
      if (updateUser) {
        updateUser(updated);
      } else if (setUser) {
        setUser(updated);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to update preferences:", err);
      setError(err.message || "Failed to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <h2 className="text-3xl font-serif font-bold text-[#8B1A1A]">Settings</h2>

        {/* Travel Interests & Recommendation Preferences Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-xs font-bold text-[#8B1A1A]/40 uppercase tracking-widest">Travel Profile & Recommendation Interests</h3>
              <p className="text-xs text-[#8B1A1A]/70 mt-1">Select the experiences that inspire you most to power personalized trip recommendations and curated guides.</p>
            </div>
          </div>

          <Card className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {interestCategories.map((cat) => {
                const isSelected = selectedInterests.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleInterest(cat.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "bg-[#8B1A1A] text-white border-[#8B1A1A] shadow-md shadow-[#8B1A1A]/20"
                        : "bg-white text-[#8B1A1A] border-[#E8DCC4] hover:border-[#FF6B1A] hover:bg-[#FFF7F1]"
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-bold text-sm flex items-center justify-between">
                        <span>{cat.label}</span>
                        {isSelected && <span className="text-xs font-black">✓</span>}
                      </div>
                      <p className={`text-xs mt-1 ${isSelected ? "text-orange-200" : "text-[#8B1A1A]/60"}`}>
                        {cat.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {error && (
              <div className="p-3 bg-red-100/70 border border-red-200 text-red-700 text-xs rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <div className="pt-4 border-t border-[#E8DCC4] flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-[#8B1A1A]/60 font-medium">
                {selectedInterests.length} interest{selectedInterests.length === 1 ? "" : "s"} selected
              </span>
              <Button
                onClick={handleSavePreferences}
                disabled={saving}
                className={savedSuccess ? "bg-[#138808] hover:bg-[#138808]" : ""}
              >
                {savedSuccess ? "✓ Preferences Saved!" : saving ? "Saving…" : "Save Preferences"}
              </Button>
            </div>
          </Card>
        </section>
        
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-[#8B1A1A]/40 uppercase tracking-widest px-2">Account & Security</h3>
          <Card className="divide-y divide-[#E8DCC4]">
            <div className="py-4 flex justify-between items-center">
              <div><p className="font-bold text-[#8B1A1A] text-sm">Email Address</p><p className="text-xs text-[#8B1A1A]/50">{user?.email || "arjun.mehta@travelindepth.in"}</p></div>
              <Button variant="ghost" className="text-xs">Change</Button>
            </div>
            <div className="py-4 flex justify-between items-center">
              <div><p className="font-bold text-[#8B1A1A] text-sm">Password</p><p className="text-xs text-[#8B1A1A]/50">Last changed 3 months ago</p></div>
              <Button variant="ghost" className="text-xs">Update</Button>
            </div>
            <div className="py-4 flex justify-between items-center">
              <div><p className="font-bold text-[#8B1A1A] text-sm">Two-Factor Authentication</p><p className="text-xs text-[#8B1A1A]/50">Enhance your account security</p></div>
              <div className="w-10 h-5 bg-[#138808] rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
            </div>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-bold text-[#8B1A1A]/40 uppercase tracking-widest px-2">Preferences</h3>
          <Card className="space-y-6">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3"><Moon size={18} className="text-[#8B1A1A]"/> <span className="text-sm font-bold">Dark Mode</span></div>
               <div className="w-10 h-5 bg-[#E8DCC4] rounded-full relative"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
            </div>
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3"><Bell size={18} className="text-[#8B1A1A]"/> <span className="text-sm font-bold">Email Notifications</span></div>
               <div className="w-10 h-5 bg-[#138808] rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></div>
            </div>
          </Card>
        </section>

        <div className="pt-8 border-t border-[#E8DCC4] flex justify-between">
          <button className="text-sm font-bold text-red-500 flex items-center gap-2"><Trash2 size={16}/> Delete Account</button>
          <button className="text-sm font-bold text-[#8B1A1A] flex items-center gap-2"><Download size={16}/> Download My Data</button>
        </div>
      </div>
    </PageTransition>
  );
};

// --- LAYOUT ---

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const location = useLocation();
  const items = [
    { l: 'Home', p: '/', i: Home },
  { p: '/dashboard', l: 'Dashboard', i: LayoutDashboard },
  { p: '/dashboard/profile', l: 'My Profile', i: User },
  { p: '/dashboard/trips', l: 'My Trips', i: Map },
  { p: '/dashboard/wishlist', l: 'Wishlist', i: Heart },
  { p: '/dashboard/planner', l: 'Trip Planner', i: Calendar },
  { p: '/dashboard/journal', l: 'Travel Journal', i: BookOpen },
  { p: '/dashboard/reviews', l: 'Reviews & Ratings', i: Star },
  { p: '/dashboard/sustainable', l: 'Sustainable Travel', i: Leaf },
  { p: '/dashboard/notifications', l: 'Notifications', i: Bell },
  { p: '/dashboard/settings', l: 'Settings', i: Settings },
];

  return (
    <aside
  className={`${collapsed ? "w-20" : "w-72"} bg-[#FDF6EC] border-r border-[#E8DCC4] h-screen sticky top-0 flex flex-col z-50 transition-all duration-300`}>
      <div className={`${collapsed ? "px-4 pt-6 pb-2" : "p-8 pb-4"}`}>
        
       <div className={`flex ${   collapsed ? "justify-center" : "items-center justify-between"}`}>
  <div
  className={`flex items-center ${ collapsed ? "justify-center w-full" : "gap-3" }`}>
    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
      <img
        src={getMediaUrl("logo.jpg")}
        alt="Travel In Depth"
        loading="lazy"
        className="w-full h-full object-cover scale-[1.35]"
      />
    </div>

    {!collapsed && (
      <div>
        <h1 className="font-serif text-2xl font-black text-[#8B1A1A] leading-none">
          TRAVEL
        </h1>
        <p className="text-[10px] tracking-[0.3em] font-bold text-[#8B1A1A]/60 mt-1">
          IN DEPTH
        </p>
      </div>
    )}
  </div>

  {!collapsed ? (
  <button
    onClick={() => setCollapsed(true)}
    className="w-10 h-10 rounded-xl bg-[#8B1A1A] text-white flex items-center justify-center shadow-md hover:bg-[#701515] transition-all"
  >
    ←
  </button>
) : null}
</div>
      </div>
      {collapsed && (
  <div className="flex justify-center mb-1">
    <button
      onClick={() => setCollapsed(false)}
      className="w-10 h-10 rounded-xl bg-[#8B1A1A] text-white flex items-center justify-center shadow-md hover:bg-[#701515] transition-all"
    >
      →
    </button>
  </div>
)}

       
     <nav className="flex-1 px-4 pt-2 pb-6 overflow-y-auto space-y-0 custom-scrollbar">
        {items.map(item => {
          const active = location.pathname === item.p;
          return (
            <Link key={item.p} to={item.p} className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group ${active ? 'bg-[#8B1A1A] text-white shadow-lg' : 'text-[#8B1A1A]/70 hover:bg-[#8B1A1A]/5'}`}>
              <item.i size={18} strokeWidth={active ? 2.5 : 2} />
              {!collapsed && ( <span className="text-sm font-bold">{item.l}</span>)}
            </Link>
          );
        })}
      </nav>
      <div className="p-6 border-t border-[#E8DCC4]">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center lg:justify-start gap-3 w-full text-[#8B1A1A] hover:text-red-600 font-bold transition-colors cursor-pointer"
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

const Topbar = () => {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AM";

  return (
    <header className="h-20 border-b border-[#E8DCC4] bg-[#FDF6EC]/80 backdrop-blur-md sticky top-0 px-8 flex items-center justify-between z-40">
      <div className="flex-1 max-w-xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B1A1A]/40" size={18} />
        <input type="text" placeholder="Search experiences, stays, or itineraries..." className="w-full bg-[#FFF8F0] border border-[#E8DCC4] pl-12 pr-4 py-2.5 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#FF6B1A]/20" />
      </div>
      <div className="flex items-center gap-4 pl-8 border-l border-[#E8DCC4] ml-8">
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-[#8B1A1A]">{user?.name || "Explorer"}</p>
          <p className="text-[10px] font-bold text-[#FF6B1A] uppercase tracking-tighter">
            {user?.role === "admin" ? "Admin" : "Level 4: Heritage Hunter"}
          </p>
        </div>
        <div className="w-10 h-10 bg-[#8B1A1A] text-white rounded-full flex items-center justify-center font-bold font-serif">
          {initials}
        </div>
      </div>
    </header>
  );
};

const App = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [savedTrips, setSavedTrips] = useState([]);
  return(
  
    <div className="flex min-h-screen bg-[#FDF6EC] font-sans selection:bg-[#FF6B1A]/20">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="/trips" element={<MyTrips savedTrips={savedTrips}setSavedTrips={setSavedTrips}/>} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/planner" element={<TripPlanner savedTrips={savedTrips} setSavedTrips={setSavedTrips}/>} />
              <Route path="/journal" element={<Journal />} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/sustainable" element={<Sustainable />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@700;900&display=swap');
        body { font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E8DCC4; border-radius: 10px; }
      `}} />
    </div>
  
);
}

export default App;
