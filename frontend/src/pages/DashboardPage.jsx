import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from "../features/auth/useAuth";
import { useWishlist } from "../features/wishlist/useWishlist";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";
import { useNavigate } from "react-router-dom";
import * as plannerApi from "../api/plannerApi";
import * as wishlistApi from "../api/wishlistApi";
import * as journalApi from "../api/journalApi";
import * as reviewApi from "../api/reviewApi";
import * as userApi from "../api/userApi";
import * as ecoApi from "../api/ecoApi";
import { updateInterests } from "../api/authApi";
import { fetchRecommendations } from "../api/recommendationsApi";
import { fetchWeather } from "../api/weatherApi";
import { getMediaUrl } from "../utils/media";
import WishlistButton from "../components/common/WishlistButton";
import SustainableTravelSection from "../components/eco/SustainableTravelSection";
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
  ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Clock, Users, 
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
  <div className={`bg-[#FFF8F0] dark:bg-[#121a2d] rounded-[20px] shadow-sm border border-[#E8DCC4] dark:border-[#23324d] overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}>
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
  const [trips, setTrips] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadDashboardData = async () => {
      try {
        setLoadingStats(true);
        const [recsRes, tripsRes, wishRes, journalRes, reviewsRes] = await Promise.allSettled([
          fetchRecommendations({ limit: 4 }),
          plannerApi.fetchMyItineraries(),
          wishlistApi.getMyWishlist(),
          journalApi.getMyJournalEntries(),
          reviewApi.getMyReviews(),
        ]);

        if (isMounted) {
          if (recsRes.status === "fulfilled" && recsRes.value?.destinations) {
            setRecommended(recsRes.value.destinations);
          }
          if (tripsRes.status === "fulfilled" && Array.isArray(tripsRes.value)) {
            setTrips(tripsRes.value);
          }
          if (wishRes.status === "fulfilled" && Array.isArray(wishRes.value)) {
            setWishlistItems(wishRes.value);
          }
          if (journalRes.status === "fulfilled" && Array.isArray(journalRes.value)) {
            setJournalEntries(journalRes.value);
          }
          if (reviewsRes.status === "fulfilled" && reviewsRes.value?.data) {
            setReviews(reviewsRes.value.data);
          }
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        if (isMounted) {
          setLoadingRecs(false);
          setLoadingStats(false);
        }
      }
    };

    loadDashboardData();
    return () => { isMounted = false; };
  }, [user]);

  // Real Next / Latest Trip
  const latestTrip = trips.length > 0 ? trips[0] : null;

  // Real Explorer Score Calculation based on user's actual engagements
  const explorerScore = useMemo(() => {
    return (
      (trips.length * 100) +
      (journalEntries.length * 50) +
      (reviews.length * 30) +
      (wishlistItems.length * 10) +
      (user?.isContributor ? 200 : 0) +
      ((user?.contributions?.length || 0) * 150)
    );
  }, [trips, journalEntries, reviews, wishlistItems, user]);

  // Real Monthly Activity Trend (Last 6 Months)
  const monthlyActivity = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const name = d.toLocaleString('en-US', { month: 'short' });
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months.push({ name, key, activities: 0 });
    }

    const allDates = [
      ...trips.map(t => t.createdAt),
      ...journalEntries.map(j => j.createdAt || j.date),
      ...reviews.map(r => r.createdAt),
    ].filter(Boolean);

    allDates.forEach(dateStr => {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const k = `${d.getFullYear()}-${d.getMonth()}`;
        const target = months.find(m => m.key === k);
        if (target) target.activities += 1;
      }
    });

    return months;
  }, [trips, journalEntries, reviews]);

  const totalActivities = monthlyActivity.reduce((acc, m) => acc + m.activities, 0);

  // Real Badges with dynamic status
  const badgesList = [
    {
      name: "Verified Explorer",
      icon: Award,
      unlocked: true,
      desc: "Registered traveler",
      color: "primary",
    },
    {
      name: "Trip Architect",
      icon: Map,
      unlocked: trips.length > 0,
      desc: trips.length > 0 ? `${trips.length} Planned` : "Plan 1st itinerary",
      color: "primary",
    },
    {
      name: "Bucket Lister",
      icon: Heart,
      unlocked: wishlistItems.length > 0,
      desc: wishlistItems.length > 0 ? `${wishlistItems.length} Saved` : "Save 1st destination",
      color: "gold",
    },
    {
      name: "Storyteller",
      icon: BookOpen,
      unlocked: journalEntries.length > 0,
      desc: journalEntries.length > 0 ? `${journalEntries.length} Stories` : "Log 1st memory",
      color: "success",
    },
  ];

  return (
    <PageTransition>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <Card className="bg-gradient-to-r from-[#8B1A1A] via-[#A32020] to-[#8B1A1A] text-white p-8 sm:p-12 min-h-[320px] relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-3">Namaste, {user?.name || "Explorer"} 👋</h2>
            <p className="text-orange-200 italic mb-8 max-w-md text-sm sm:text-base">"The world is a book; non-travelers read only one page."</p>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => navigate("/dashboard/planner")}>Start New AI Plan</Button>
              <Button variant="outline" onClick={() => navigate("/destinations")} className="border-white text-white hover:bg-white hover:text-[#8B1A1A]">Explore Guidebooks</Button>
            </div>
          </div>
          
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute right-[-5%] bottom-[-20%] opacity-20"><Globe size={400} /></div>

          {/* Real Next Adventure / Quick Plan Banner */}
          <div className="mt-8 lg:mt-0 lg:absolute right-10 top-1/2 lg:-translate-y-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 w-full lg:w-80 z-20">
            {latestTrip ? (
              <>
                <p className="text-orange-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Navigation size={13} /> Next / Latest Adventure
                </p>
                <h3 className="text-xl font-serif font-bold mt-2 truncate text-white">
                  {latestTrip.cities && latestTrip.cities.length > 1
                    ? latestTrip.cities.join(" → ")
                    : latestTrip.destination}
                </h3>
                <p className="text-orange-100 text-xs mt-1">
                  📅 {new Date(latestTrip.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} • {latestTrip.days?.length || 1} Days
                </p>
                <div className="mt-4 pt-3 border-t border-white/20">
                  <button
                    onClick={() => navigate("/dashboard/trips")}
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-[#8B1A1A] font-bold text-xs hover:bg-orange-50 transition shadow cursor-pointer flex items-center justify-center gap-1"
                  >
                    View AI Itinerary <ArrowRight size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-orange-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={13} /> Next Adventure
                </p>
                <h3 className="text-xl font-serif font-bold mt-2 text-white">
                  Ready to explore?
                </h3>
                <p className="text-orange-100 text-xs mt-1 leading-relaxed">
                  You haven't planned any trips yet. Generate your first day-by-day itinerary with AI.
                </p>
                <div className="mt-4 pt-3 border-t border-white/20">
                  <button
                    onClick={() => navigate("/dashboard/planner")}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#FF6B1A] to-[#F5A623] text-white font-bold text-xs hover:opacity-95 transition shadow cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus size={14} /> Plan First Trip
                  </button>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Real Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Saved Itineraries', val: trips.length, icon: Calendar, link: '/dashboard/trips' },
            { label: 'Bucket List', val: wishlistItems.length, icon: Heart, link: '/dashboard/wishlist' },
            { label: 'Journal Stories', val: journalEntries.length, icon: BookOpen, link: '/dashboard/journal' },
            { label: 'Explorer Points', val: explorerScore, icon: Award, link: '/dashboard/settings' },
          ].map((s, i) => (
            <Card
              key={i}
              className="flex items-center justify-between p-5 hover:border-[#FF6B1A]/40 transition-all cursor-pointer"
              onClick={() => navigate(s.link)}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#FF6B1A]/10 text-[#FF6B1A] rounded-2xl">
                  <s.icon size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#8B1A1A]/60 uppercase tracking-wider">{s.label}</p>
                  <h4 className="text-2xl font-bold text-[#8B1A1A] mt-0.5">
                    {loadingStats ? "…" : s.val}
                  </h4>
                </div>
              </div>
              <ChevronRight size={18} className="text-[#8B1A1A]/30" />
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
                    {d.matchScore || 90}% MATCH
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

        {/* Real Activity Analytics & Real Achievements Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#8B1A1A]">Exploration Activity</h3>
                <p className="text-xs text-[#8B1A1A]/60">Your travel logging and planning actions over time</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-[#FF6B1A]/10 text-[#FF6B1A] rounded-full">
                {totalActivities} Total Actions
              </span>
            </div>

            <div className="h-64">
              {totalActivities === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white/40 rounded-2xl border border-dashed border-[#E8DCC4]">
                  <TrendingUp size={32} className="text-[#8B1A1A]/30 mb-2" />
                  <p className="text-sm font-bold text-[#8B1A1A]">No logged activity yet</p>
                  <p className="text-xs text-[#8B1A1A]/60 max-w-xs mt-1">
                    Plan your first trip, save bucket list destinations, or write journal stories to view your monthly exploration analytics.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyActivity}>
                    <defs>
                      <linearGradient id="colorActivities" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B1A" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#FF6B1A" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC4" vertical={false} />
                    <XAxis dataKey="name" stroke="#8B1A1A70" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#8B1A1A70" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#FFF8F0", borderColor: "#E8DCC4", borderRadius: "12px" }}
                      labelStyle={{ color: "#8B1A1A", fontWeight: "bold" }}
                    />
                    <Area type="monotone" dataKey="activities" name="Logged Actions" stroke="#FF6B1A" strokeWidth={3} fillOpacity={1} fill="url(#colorActivities)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#8B1A1A]">Explorer Badges</h3>
                <p className="text-xs text-[#8B1A1A]/60">Your verified travel achievements</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {badgesList.map((b, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center text-center ${
                    b.unlocked
                      ? "bg-white/80 border-[#E8DCC4] shadow-xs"
                      : "bg-stone-100/60 border-stone-200 opacity-60"
                  }`}
                >
                  <div className={`p-2.5 rounded-xl mb-1.5 ${b.unlocked ? "bg-[#FF6B1A]/10 text-[#FF6B1A]" : "bg-stone-200 text-stone-500"}`}>
                    <b.icon size={22} />
                  </div>
                  <p className="text-[11px] font-bold text-[#8B1A1A] leading-tight mt-1">{b.name}</p>
                  <p className="text-[9px] font-semibold text-[#8B1A1A]/60 mt-0.5">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
};

// 2. PROFILE
const Profile = () => {
  const { user, updateUser, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
      setLocation(user.location || "");
      setBio(user.bio || "");
      setAvatar(user.avatar || "");
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  const initials = (name || user?.name || "Explorer")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await userApi.updateUserProfile({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim(),
        bio: bio.trim(),
        avatar: avatar.trim(),
      });

      if (res && res.data) {
        if (updateUser) {
          updateUser(res.data);
        } else if (setUser) {
          setUser(res.data);
        }
        setSuccessMsg("🎉 Profile updated successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      console.error("Profile save error:", err);
      setErrorMsg(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPrompt = () => {
    const url = window.prompt("Enter image URL for profile avatar:", avatar || "");
    if (url !== null) {
      setAvatar(url);
      setAvatarPreview(url);
    }
  };

  return (
    <PageTransition>
      <form onSubmit={handleSaveProfile} className="p-8 max-w-4xl mx-auto space-y-8 font-sans">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 mb-8">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-[#8B1A1A] flex items-center justify-center text-4xl text-white font-serif font-bold shadow-lg">
                {initials}
              </div>
            )}
            <button
              type="button"
              onClick={handleAvatarPrompt}
              title="Change Profile Photo"
              className="absolute bottom-0 right-0 p-2.5 bg-[#FF6B1A] hover:bg-[#e5590f] text-white rounded-full ring-4 ring-[#FDF6EC] shadow-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
            >
              <Camera size={16} />
            </button>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-bold text-[#8B1A1A]">
              {name || user?.name || "Explorer"}
            </h2>
            <p className="text-[#8B1A1A]/60 font-medium">
              {location || "India"} • {user?.role === "admin" ? "Admin" : "Verified Explorer"}
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
                <Link
                  to="/dashboard/settings"
                  className="text-xs font-semibold text-[#FF6B1A] hover:underline inline-flex items-center gap-1 bg-[#FF6B1A]/10 px-3 py-1 rounded-full border border-[#FF6B1A]/20"
                >
                  + Set your travel interests in Settings
                </Link>
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

        {/* Feedback alerts */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#138808]" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold flex items-center gap-2">
            <AlertCircle size={18} className="text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="font-bold text-[#8B1A1A]">Personal Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2 mt-1 text-sm text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A]"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  readOnly
                  className="w-full bg-stone-100/70 border border-[#E8DCC4] rounded-xl px-4 py-2 mt-1 text-sm text-[#2D1B00]/70 cursor-not-allowed"
                  value={user?.email || ""}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2 mt-1 text-sm text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A]"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest">
                  Location / City
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2 mt-1 text-sm text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A]"
                  placeholder="e.g. Mumbai, India"
                />
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-bold text-[#8B1A1A]">Travel Bio & Philosophy</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest">
                  Bio / Philosophy
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2 mt-1 text-sm h-28 focus:outline-none focus:border-[#FF6B1A] resize-none"
                  placeholder="Share your travel philosophy and explorer spirit..."
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[#8B1A1A]/60 uppercase tracking-widest">
                  Avatar Image Link
                </label>
                <input
                  type="text"
                  value={avatar}
                  onChange={(e) => {
                    setAvatar(e.target.value);
                    setAvatarPreview(e.target.value);
                  }}
                  className="w-full bg-white border border-[#E8DCC4] rounded-xl px-4 py-2 mt-1 text-xs text-[#2D1B00] focus:outline-none focus:border-[#FF6B1A]"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Profile Changes"}
          </Button>
        </div>
      </form>
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
        <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-4xl font-serif font-bold text-[#8B1A1A] dark:text-white">
              My Journeys
            </h2>
            <p className="text-[#8B1A1A]/60 dark:text-[#94a3b8] mt-1">
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
            <div className="flex bg-[#F5E6D3] dark:bg-[#15213b] dark:border dark:border-[#273857] p-1 rounded-xl">
              {["upcoming", "past"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-6 py-2 rounded-lg font-bold capitalize transition-all cursor-pointer ${
                    tab === t
                      ? "bg-[#8B1A1A] text-white shadow"
                      : "text-[#8B1A1A]/60 dark:text-[#94a3b8] hover:text-[#8B1A1A] dark:hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && <div className="text-center py-6 text-[#8B1A1A]/60 dark:text-[#cbd5e1] font-medium">Loading your journeys…</div>}
        {error && <div className="text-center py-2 text-red-500 text-sm">⚠️ {error}</div>}

        {allDisplayTrips.length === 0 && !loading ? (
          <div className="text-center py-16 px-6 bg-white dark:bg-[#121a2d] border border-dashed border-[#E8DCC4] dark:border-[#273857] rounded-3xl space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-[#FFF2E8] dark:bg-[#1a253c] text-[#FF6B1A] dark:text-[#fb923c] flex items-center justify-center mx-auto text-2xl shadow-inner">
              🗺️
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#8B1A1A] dark:text-white">
              No {tab} trips yet
            </h3>
            <p className="text-sm text-[#8B1A1A]/70 dark:text-[#cbd5e1] max-w-md mx-auto leading-relaxed">
              You don't have any {tab} travel plans. Use our AI Trip Planner to build and customize your next dream itinerary.
            </p>
            <div className="pt-2">
              <Button onClick={() => navigate("/dashboard/planner")} className="px-6 py-3 shadow-md">
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
                  <div className="h-44 rounded-xl overflow-hidden relative bg-[#E8DCC4] dark:bg-[#18233c]">
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      loading="lazy"
                      onError={(e) => { e.target.src = DESTINATION_IMAGES.default; }}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
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
                    <h3 className="text-xl font-bold text-[#8B1A1A] dark:text-white line-clamp-2">
                      {trip.title}
                    </h3>
                    {trip.isMultiCity ? (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs font-semibold text-[#FF6B1A] dark:text-[#fb923c]">
                        <span>📍 Route:</span>
                        {trip.cities.map((city, cIdx) => (
                          <span key={cIdx} className="inline-flex items-center gap-1">
                            <span className="bg-[#FFF2E8] dark:bg-[#1a253c] px-2 py-0.5 rounded-md border border-[#E8DCC4] dark:border-[#273857] text-[#8B1A1A] dark:text-[#f8fafc]">
                              {city}
                            </span>
                            {cIdx < trip.cities.length - 1 && <span>→</span>}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#8B1A1A]/60 dark:text-[#94a3b8] mt-1">
                        📍 {trip.destination}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-4 text-sm text-[#8B1A1A]/60 dark:text-[#cbd5e1]">
                      <Calendar size={15} className="text-[#FF6B1A] dark:text-[#fb923c]" />
                      {trip.startDate} — {trip.endDate}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-[#8B1A1A]/60 dark:text-[#cbd5e1]">
                      <Users size={15} className="text-[#FF6B1A] dark:text-[#fb923c]" />
                      {trip.travelers} Traveler{trip.travelers > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E8DCC4] dark:border-[#23324d] flex justify-between items-center">
                  <div>
                    <p className="text-xs text-[#8B1A1A]/50 dark:text-[#94a3b8]">Budget / Day Cost</p>
                    <p className="font-bold text-[#138808] dark:text-[#4ade80]">
                      {typeof trip.budget === "number" ? `₹${trip.budget.toLocaleString()}` : trip.budget}
                    </p>
                  </div>
                  <Button variant="ghost" className="text-sm px-4 py-2 hover:bg-[#FF6B1A]/10 dark:hover:bg-[#FF6B1A]/20" onClick={(e) => { e.stopPropagation(); setSelectedTrip(trip); }}>
                    View Details
                  </Button>
                </div>
              </Card>
            ))}

            <Card
              onClick={() => navigate("/dashboard/planner")}
              className="border-2 border-dashed border-[#E8DCC4] dark:border-[#273857] flex flex-col items-center justify-center min-h-[340px] hover:border-[#FF6B1A] dark:hover:border-[#FF6B1A] transition-all cursor-pointer"
            >
              <div className="w-20 h-20 rounded-full bg-[#FFF2E8] dark:bg-[#1a253c] flex items-center justify-center mb-5">
                <Plus size={34} className="text-[#FF6B1A] dark:text-[#fb923c]" />
              </div>
              <h3 className="text-xl font-bold text-[#8B1A1A] dark:text-white">Plan a New Trip</h3>
              <p className="text-[#8B1A1A]/60 dark:text-[#94a3b8] text-center mt-2 px-6">
                Create a personalized itinerary and start your next adventure.
              </p>
            </Card>
          </div>
        )}
      </div>

      {selectedTrip && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFF8F0] dark:bg-[#121a2d] border border-[#E8DCC4] dark:border-[#273857] rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl custom-scrollbar">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF6B1A] dark:text-[#fb923c]">
                  {selectedTrip.style} Trip
                </span>
                <h3 className="text-2xl font-serif font-bold text-[#8B1A1A] dark:text-white">
                  {selectedTrip.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTrip(null)}
                className="w-8 h-8 rounded-full bg-[#8B1A1A]/10 dark:bg-white/10 text-[#8B1A1A] dark:text-white hover:bg-[#8B1A1A] hover:text-white font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-[#8B1A1A]/70 dark:text-[#cbd5e1] mb-6 pb-4 border-b border-[#E8DCC4] dark:border-[#23324d] flex-wrap">
              <span>📍 {selectedTrip.destination}</span>
              <span>📅 {selectedTrip.startDate}</span>
              <span className="text-[#138808] dark:text-[#4ade80] font-bold">💰 {typeof selectedTrip.budget === 'number' ? `₹${selectedTrip.budget.toLocaleString()}` : selectedTrip.budget}</span>
            </div>

            {selectedTrip.rawDays && selectedTrip.rawDays.length > 0 ? (
              <div className="space-y-4">
                <h4 className="font-bold text-[#8B1A1A] dark:text-white uppercase tracking-wider text-xs">
                  Day-by-Day AI Itinerary
                </h4>
                {selectedTrip.rawDays.map((d) => (
                  <div key={d.day} className="bg-white/80 dark:bg-[#18233c] border border-[#E8DCC4] dark:border-[#273857] rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between items-center font-bold text-[#8B1A1A] dark:text-white flex-wrap gap-2">
                      <span className="flex items-center gap-2">
                        <span>Day {d.day} — {d.title}</span>
                        {d.city && (
                          <span className="text-[10px] bg-[#FF6B1A]/10 dark:bg-[#FF6B1A]/20 text-[#FF6B1A] dark:text-[#fb923c] px-2 py-0.5 rounded-full border border-[#FF6B1A]/20">
                            📍 {d.city}
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-[#138808] dark:text-[#4ade80] font-bold">{d.estimatedBudgetINR}</span>
                    </div>
                    <div className="text-xs text-[#2D1B00]/80 dark:text-[#cbd5e1] space-y-1">
                      <p><b>🌅 Morning:</b> {d.morning}</p>
                      <p><b>☀️ Afternoon:</b> {d.afternoon}</p>
                      <p><b>🌆 Evening:</b> {d.evening}</p>
                      <p><b>🍛 Meals:</b> {d.meals}</p>
                      {d.tips && <p className="text-[#FF6B1A] dark:text-[#fb923c]"><b>💡 Tip:</b> {d.tips}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#8B1A1A]/70 dark:text-[#cbd5e1]">
                Detailed schedule confirmed with your local guides. Check notifications for live transit updates.
              </p>
            )}

            <button
              onClick={() => setSelectedTrip(null)}
              className="mt-6 w-full bg-[#8B1A1A] hover:bg-[#701515] text-white font-bold py-3 rounded-xl transition-all cursor-pointer"
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
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-4xl font-serif font-bold text-[#8B1A1A] dark:text-white">
              Travel Bucket List
            </h2>
            <p className="text-[#8B1A1A]/60 dark:text-[#94a3b8] mt-1">
              Save your dream destinations and start planning.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/60 dark:bg-[#121a2d] border border-[#E8DCC4] dark:border-[#273857] rounded-3xl">
            <div className="w-10 h-10 border-3 border-[#FF6B1A] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium text-[#8B1A1A]/70 dark:text-[#cbd5e1]">Loading your bucket list...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-3xl">
            <p className="text-red-700 dark:text-red-300 font-bold mb-2">⚠️ {error}</p>
            <button
              onClick={fetchWishlist}
              className="px-4 py-2 bg-[#8B1A1A] text-white text-xs font-bold rounded-xl hover:bg-[#701515] transition cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-20 px-6 bg-[#FFF8F0] dark:bg-[#121a2d] border border-[#E8DCC4] dark:border-[#273857] rounded-3xl shadow-sm">
            <div className="w-20 h-20 rounded-full bg-[#FF6B1A]/10 dark:bg-[#1a253c] text-[#FF6B1A] dark:text-[#fb923c] flex items-center justify-center mb-4 shadow-inner">
              <Heart size={36} className="text-[#FF6B1A] dark:text-[#fb923c]" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-[#8B1A1A] dark:text-white mb-2">
              Your bucket list is empty
            </h3>
            <p className="text-sm text-[#8B1A1A]/70 dark:text-[#cbd5e1] max-w-md mb-6 leading-relaxed">
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
const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewApi.getMyReviews();
      if (res && res.success) {
        setReviews(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching user reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      setDeletingId(id);
      await reviewApi.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message || "Failed to delete review.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[#8B1A1A]">My Reviews & Ratings</h2>
            <p className="text-sm text-[#8B1A1A]/60 mt-1">Manage and view feedback you have shared with the community.</p>
          </div>
          <Link
            to="/reviews"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FF6B1A] to-[#F5A623] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all"
          >
            + Write New Review
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-3 border-[#FF6B1A]/30 border-t-[#FF6B1A] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-[#8B1A1A]/60">Loading your reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <Card className="p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FF6B1A]/10 text-[#FF6B1A] flex items-center justify-center mx-auto">
              <Star size={26} />
            </div>
            <h4 className="font-serif text-xl font-bold text-[#8B1A1A]">No Reviews Yet</h4>
            <p className="text-xs text-[#8B1A1A]/70 leading-relaxed">
              You haven't submitted any reviews yet. Share your thoughts on Indian destinations, experiences, or the platform!
            </p>
            <Link
              to="/reviews"
              className="inline-block mt-2 px-6 py-2.5 rounded-full bg-[#8B1A1A] text-white text-xs font-bold uppercase tracking-wider"
            >
              Browse & Write Reviews
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map((r) => {
              const formattedDate = r.createdAt
                ? new Date(r.createdAt).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })
                : "Recently";

              return (
                <Card key={r._id} className="flex gap-6 relative group">
                  <div className="w-20 h-20 bg-[#8B1A1A]/5 rounded-2xl flex items-center justify-center shrink-0 border border-[#E8DCC4]">
                    <Star size={28} className="text-[#F5A623]" fill="currentColor" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#8B1A1A] text-base">{r.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8B1A1A]/10 text-[#8B1A1A]">
                            {r.category}
                          </span>
                        </div>
                        <p className="text-xs text-[#8B1A1A]/40 mt-0.5">Reviewed on {formattedDate}</p>
                      </div>

                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <Star
                            key={idx}
                            size={14}
                            className={idx < (r.rating || 5) ? "text-[#F5A623] fill-current" : "text-[#E8DCC4]"}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm text-[#8B1A1A]/80 mt-3 italic">"{r.comment}"</p>

                    <div className="mt-4 flex gap-4">
                      <button
                        onClick={() => handleDelete(r._id)}
                        disabled={deletingId === r._id}
                        className="text-[11px] font-bold text-red-500 hover:text-red-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={13} /> {deletingId === r._id ? "Deleting..." : "Delete Review"}
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

// 8. SUSTAINABLE TRAVEL
const Sustainable = () => {
  return (
    <PageTransition>
      <SustainableTravelSection />
    </PageTransition>
  );
};

// 9. NOTIFICATIONS
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'alerts'
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [actionMsg, setActionMsg] = useState("");

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await userApi.getNotifications();
      if (res?.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await userApi.markNotificationRead("all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      setActionMsg("All notifications marked as read.");
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleMarkSingleRead = async (id, currentRead) => {
    if (currentRead) return;
    try {
      await userApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      setDeletingId(id);
      await userApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setActionMsg("Notification removed.");
      setTimeout(() => setActionMsg(""), 3000);
    } catch (err) {
      console.error("Failed to delete notification:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredNotifs = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    if (filter === "alerts") return notifications.filter((n) => n.type === "alert");
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case "booking":
      case "trip":
        return { icon: Plane, bg: "bg-[#FF6B1A]/10 text-[#FF6B1A]" };
      case "alert":
      case "sustainability":
        return { icon: Leaf, bg: "bg-[#138808]/10 text-[#138808]" };
      case "review":
        return { icon: Star, bg: "bg-[#F5A623]/10 text-[#F5A623]" };
      case "system":
      default:
        return { icon: Sparkles, bg: "bg-[#8B1A1A]/10 text-[#8B1A1A]" };
    }
  };

  const formatRelativeTime = (dateStr) => {
    if (!dateStr) return "Just now";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-serif font-bold text-[#8B1A1A]">Inbox & Notifications</h2>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FF6B1A] text-white animate-pulse">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-[#8B1A1A]/60 mt-1">
              Stay updated on trip schedules, eco alerts, and community contributions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#FF6B1A] bg-[#FF6B1A]/10 hover:bg-[#FF6B1A]/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                {markingAll ? "Marking..." : "Mark all as read"}
              </button>
            )}
          </div>
        </div>

        {actionMsg && (
          <div className="p-3 bg-[#138808]/10 border border-[#138808]/20 text-[#138808] text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 size={15} /> {actionMsg}
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-2 border-b border-[#E8DCC4] pb-3">
          {[
            { id: "all", label: "All Notifications" },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "alerts", label: "Eco & Safety Alerts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === tab.id
                  ? "bg-[#8B1A1A] text-white shadow-sm"
                  : "text-[#8B1A1A]/60 hover:bg-[#8B1A1A]/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-3 border-[#FF6B1A]/30 border-t-[#FF6B1A] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-[#8B1A1A]/60">Loading notifications...</p>
          </div>
        ) : filteredNotifs.length === 0 ? (
          <Card className="p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FF6B1A]/10 text-[#FF6B1A] flex items-center justify-center mx-auto">
              <Bell size={26} />
            </div>
            <h4 className="font-serif text-xl font-bold text-[#8B1A1A]">No Notifications</h4>
            <p className="text-xs text-[#8B1A1A]/70 leading-relaxed">
              {filter === "unread"
                ? "You have caught up with all your notifications!"
                : "You don't have any notifications right now. We will keep you updated on your trips and alerts."}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredNotifs.map((n) => {
              const { icon: NotifIcon, bg: iconBg } = getNotifIcon(n.type);
              return (
                <div
                  key={n._id}
                  onClick={() => handleMarkSingleRead(n._id, n.isRead)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 relative group ${
                    n.isRead
                      ? "bg-white/80 border-[#E8DCC4] hover:border-[#FF6B1A]/40"
                      : "bg-[#FFF8F0] border-[#FF6B1A]/40 shadow-sm ring-1 ring-[#FF6B1A]/20"
                  }`}
                >
                  <div className={`p-3 rounded-xl shrink-0 ${iconBg}`}>
                    <NotifIcon size={20} />
                  </div>

                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-bold leading-snug ${n.isRead ? "text-[#8B1A1A]" : "text-[#8B1A1A] font-extrabold"}`}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#FF6B1A] inline-block" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#8B1A1A]/5 text-[#8B1A1A]/60">
                        {n.type || "system"}
                      </span>
                    </div>

                    <p className="text-xs text-[#8B1A1A]/70 mt-1 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-[#8B1A1A]/40 font-semibold">
                      <span>🕒 {formatRelativeTime(n.createdAt)}</span>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#FF6B1A] hover:underline font-bold"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDeleteNotification(e, n._id)}
                    disabled={deletingId === n._id}
                    title="Delete Notification"
                    className="absolute right-3 top-3 p-2 rounded-lg text-[#8B1A1A]/30 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

// 10. SETTINGS
const SettingsPage = () => {
  const { user, updateUser, setUser } = useAuth();
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [savingInterests, setSavingInterests] = useState(false);
  const [interestSuccess, setInterestSuccess] = useState(false);
  const [interestError, setInterestError] = useState(null);

  // Preference switches state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [darkMode, setDarkMode] = useState(isDarkMode);
  const [currency, setCurrency] = useState("INR");
  const [syncingPref, setSyncingPref] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState(false);

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
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    if (user?.interests && Array.isArray(user.interests)) {
      setSelectedInterests(user.interests.map((i) => i.toLowerCase()));
    } else {
      setSelectedInterests([]);
    }

    if (user?.settings) {
      setEmailNotifications(user.settings.emailNotifications ?? true);
      setPushNotifications(user.settings.pushNotifications ?? true);
      if (user.settings.darkMode !== undefined) {
        setDarkMode(user.settings.darkMode);
        setIsDarkMode(user.settings.darkMode);
      }
      setCurrency(user.settings.currency || "INR");
    }
  }, [user]);

  const toggleInterest = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSaveInterests = async () => {
    if (selectedInterests.length === 0) {
      setInterestError("Please select at least one travel interest.");
      return;
    }

    setSavingInterests(true);
    setInterestError(null);
    setInterestSuccess(false);

    try {
      const res = await updateInterests(selectedInterests);
      const updated = res?.user || { ...user, interests: selectedInterests };
      if (updateUser) {
        updateUser(updated);
      } else if (setUser) {
        setUser(updated);
      }
      setInterestSuccess(true);
      setTimeout(() => setInterestSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to update preferences:", err);
      setInterestError(err.message || "Failed to save preferences.");
    } finally {
      setSavingInterests(false);
    }
  };

  const handleUpdatePreferences = async (newPrefs) => {
    setSyncingPref(true);
    try {
      const res = await userApi.updateUserSettings(newPrefs);
      const updatedUser = {
        ...user,
        settings: {
          ...(user?.settings || {}),
          ...newPrefs,
        },
      };
      if (updateUser) {
        updateUser(updatedUser);
      } else if (setUser) {
        setUser(updatedUser);
      }
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to sync settings:", err);
    } finally {
      setSyncingPref(false);
    }
  };

  const toggleEmailNotifs = () => {
    const nextVal = !emailNotifications;
    setEmailNotifications(nextVal);
    handleUpdatePreferences({ emailNotifications: nextVal });
  };

  const togglePushNotifs = () => {
    const nextVal = !pushNotifications;
    setPushNotifications(nextVal);
    handleUpdatePreferences({ pushNotifications: nextVal });
  };

  const toggleDarkMode = () => {
    const nextVal = !darkMode;
    setDarkMode(nextVal);
    setIsDarkMode(nextVal);
    handleUpdatePreferences({ darkMode: nextVal });
  };

  const handleCurrencyChange = (newCurr) => {
    setCurrency(newCurr);
    handleUpdatePreferences({ currency: newCurr });
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-4xl mx-auto space-y-8 font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[#8B1A1A]">Settings & Preferences</h2>
            <p className="text-xs text-[#8B1A1A]/60 mt-1">Configure your personal dashboard, notifications, and travel algorithm.</p>
          </div>
          {prefSuccess && (
            <span className="text-xs font-bold text-[#138808] bg-[#138808]/10 px-3 py-1.5 rounded-full flex items-center gap-1">
              ✓ Preferences synced
            </span>
          )}
        </div>

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

            {interestError && (
              <div className="p-3 bg-red-100/70 border border-red-200 text-red-700 text-xs rounded-xl">
                ⚠️ {interestError}
              </div>
            )}

            <div className="pt-4 border-t border-[#E8DCC4] flex items-center justify-between flex-wrap gap-4">
              <span className="text-xs text-[#8B1A1A]/60 font-medium">
                {selectedInterests.length} interest{selectedInterests.length === 1 ? "" : "s"} selected
              </span>
              <Button
                onClick={handleSaveInterests}
                disabled={savingInterests}
                className={interestSuccess ? "bg-[#138808] hover:bg-[#138808]" : ""}
              >
                {interestSuccess ? "✓ Preferences Saved!" : savingInterests ? "Saving…" : "Save Preferences"}
              </Button>
            </div>
          </Card>
        </section>

        {/* System & Notification Preferences */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-[#8B1A1A]/40 uppercase tracking-widest px-2">App & Notification Preferences</h3>
          <Card className="divide-y divide-[#E8DCC4]">
            {/* Dark Mode */}
            <div className="py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#8B1A1A]/5 text-[#8B1A1A]">
                  <Moon size={18} />
                </div>
                <div>
                  <p className="font-bold text-[#8B1A1A] text-sm">Dark Theme (Preview)</p>
                  <p className="text-xs text-[#8B1A1A]/50">Enable dark palette for night browsing</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  darkMode ? "bg-[#138808]" : "bg-[#E8DCC4]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    darkMode ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Email Notifications */}
            <div className="py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#8B1A1A]/5 text-[#8B1A1A]">
                  <Bell size={18} />
                </div>
                <div>
                  <p className="font-bold text-[#8B1A1A] text-sm">Email Updates & Briefs</p>
                  <p className="text-xs text-[#8B1A1A]/50">Receive booking confirmations and curated itineraries via email</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleEmailNotifs}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  emailNotifications ? "bg-[#138808]" : "bg-[#E8DCC4]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    emailNotifications ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Push Notifications */}
            <div className="py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#8B1A1A]/5 text-[#8B1A1A]">
                  <Sparkles size={18} />
                </div>
                <div>
                  <p className="font-bold text-[#8B1A1A] text-sm">In-App Alerts & Eco-Pledges</p>
                  <p className="text-xs text-[#8B1A1A]/50">Live updates on community spots, reviews, and environmental milestones</p>
                </div>
              </div>
              <button
                type="button"
                onClick={togglePushNotifs}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  pushNotifications ? "bg-[#138808]" : "bg-[#E8DCC4]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    pushNotifications ? "right-1" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* Preferred Currency */}
            <div className="py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#8B1A1A]/5 text-[#8B1A1A]">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <p className="font-bold text-[#8B1A1A] text-sm">Preferred Currency</p>
                  <p className="text-xs text-[#8B1A1A]/50">Display prices and budget estimates in your selected currency</p>
                </div>
              </div>
              <select
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#E8DCC4] text-xs font-bold text-[#8B1A1A] focus:outline-none focus:ring-2 focus:ring-[#FF6B1A]/30 cursor-pointer"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </Card>
        </section>

        {/* Account & Security */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold text-[#8B1A1A]/40 uppercase tracking-widest px-2">Account & Security</h3>
          <Card className="divide-y divide-[#E8DCC4]">
            <div className="py-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-[#8B1A1A] text-sm">Registered Email</p>
                <p className="text-xs text-[#8B1A1A]/50">{user?.email || "No email on file"}</p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#138808]/10 text-[#138808]">
                ✓ Verified
              </span>
            </div>
            <div className="py-4 flex justify-between items-center">
              <div>
                <p className="font-bold text-[#8B1A1A] text-sm">Account Type</p>
                <p className="text-xs text-[#8B1A1A]/50">
                  {user?.role === "admin" ? "Platform Administrator" : "Standard Explorer Account"}
                </p>
              </div>
              <Link to="/dashboard/profile" className="text-xs font-bold text-[#FF6B1A] hover:underline">
                Edit Profile →
              </Link>
            </div>
          </Card>
        </section>

        <div className="pt-8 border-t border-[#E8DCC4] flex justify-between items-center flex-wrap gap-4">
          <button
            onClick={() => alert("Data export link has been generated and sent to your registered email.")}
            className="text-xs font-bold text-[#8B1A1A] hover:text-[#FF6B1A] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={15} /> Download My Travel Data
          </button>
          <p className="text-[10px] text-[#8B1A1A]/40">Travel In Depth Platform v2.4 • Secured with JWT</p>
        </div>
      </div>
    </PageTransition>
  );
};

// --- LAYOUT ---

const Sidebar = ({ collapsed, setCollapsed }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const checkUnread = async () => {
      try {
        const res = await userApi.getNotifications();
        if (isMounted && res?.unreadCount !== undefined) {
          setUnreadNotifs(res.unreadCount);
        }
      } catch (e) {
        // silent fallback
      }
    };
    checkUnread();
    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
    { p: '/dashboard/notifications', l: 'Notifications', i: Bell, count: unreadNotifs },
    { p: '/dashboard/settings', l: 'Settings', i: Settings },
  ];

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-72"} bg-[#FDF6EC] border-r border-[#E8DCC4] h-screen sticky top-0 flex flex-col z-50 transition-all duration-300`}
    >
      <div className={`${collapsed ? "px-4 pt-6 pb-2" : "p-8 pb-4"}`}>
        <div className={`flex ${collapsed ? "justify-center" : "items-center justify-between"}`}>
          <div className={`flex items-center ${collapsed ? "justify-center w-full" : "gap-3"}`}>
            <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
              <img
                src={getMediaUrl("logo.jpg")}
                alt="Travel In Depth"
                loading="lazy"
                className="w-full h-full object-cover scale-[1.35]"
              />
            </div>

            {!collapsed && (
              <div className="flex flex-col items-start">
                <Link to="/" className="text-left group">
                  <h1 className="font-serif text-2xl font-black text-[#8B1A1A] dark:text-[#f8fafc] leading-none group-hover:text-[#FF6B1A] transition-colors">
                    TRAVEL
                  </h1>
                  <p className="text-[10px] tracking-[0.3em] font-bold text-[#8B1A1A]/60 dark:text-slate-400 mt-1">
                    IN DEPTH
                  </p>
                </Link>
                {/* Back button below site title */}
                <button
                  onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
                  title="Go back to previous page"
                  className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white dark:bg-[#121a2d] hover:bg-[#FF6B1A] dark:hover:bg-[#FF6B1A] text-[#8B1A1A] dark:text-slate-200 hover:text-white dark:hover:text-white border border-[#E8DCC4] dark:border-[#23324d] hover:border-[#FF6B1A] transition-all duration-200 shadow-sm cursor-pointer"
                >
                  <ArrowLeft size={10} />
                  <span>Back</span>
                </button>
              </div>
            )}
          </div>

          {!collapsed ? (
            <button
              onClick={() => setCollapsed(true)}
              className="w-10 h-10 rounded-xl bg-[#8B1A1A] text-white flex items-center justify-center shadow-md hover:bg-[#701515] transition-all cursor-pointer"
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
            className="w-10 h-10 rounded-xl bg-[#8B1A1A] text-white flex items-center justify-center shadow-md hover:bg-[#701515] transition-all cursor-pointer"
          >
            →
          </button>
        </div>
      )}

      <nav className="flex-1 px-4 pt-2 pb-6 overflow-y-auto space-y-0 custom-scrollbar">
        {items.map((item) => {
          const active = location.pathname === item.p;
          return (
            <Link
              key={item.p}
              to={item.p}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${
                active
                  ? "bg-[#8B1A1A] text-white shadow-lg"
                  : "text-[#8B1A1A]/70 hover:bg-[#8B1A1A]/5"
              }`}
            >
              <div className="flex items-center gap-4">
                <item.i size={18} strokeWidth={active ? 2.5 : 2} />
                {!collapsed && <span className="text-sm font-bold">{item.l}</span>}
              </div>
              {!collapsed && item.count > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF6B1A] text-white">
                  {item.count}
                </span>
              )}
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
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchUnread = async () => {
      try {
        const res = await userApi.getNotifications();
        if (isMounted && res?.unreadCount !== undefined) {
          setUnreadCount(res.unreadCount);
        }
      } catch (e) {
        // silent catch
      }
    };
    fetchUnread();
    return () => {
      isMounted = false;
    };
  }, []);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "EX";

  const userRoleBadge = user?.role === "admin"
    ? "Platform Admin"
    : user?.isContributor
    ? "Verified Contributor"
    : "Verified Explorer";

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="h-20 border-b border-[#E8DCC4] bg-[#FDF6EC]/80 backdrop-blur-md sticky top-0 px-8 flex items-center justify-between z-40">
      <form onSubmit={handleSearch} className="flex-1 max-w-xl relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B1A1A]/40" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search destinations, experiences, or itineraries..."
          className="w-full bg-[#FFF8F0] border border-[#E8DCC4] pl-12 pr-4 py-2.5 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#FF6B1A]/20 text-[#2D1B00]"
        />
      </form>
      <div className="flex items-center gap-4 pl-8 border-l border-[#E8DCC4] ml-8">
        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notification Bell Shortcut */}
        <Link
          to="/dashboard/notifications"
          className="relative p-2.5 rounded-full bg-[#FFF8F0] border border-[#E8DCC4] text-[#8B1A1A] hover:bg-[#FF6B1A]/10 hover:text-[#FF6B1A] transition-colors"
          title="View Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF6B1A] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>

        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-[#8B1A1A]">{user?.name || "Explorer"}</p>
          <p className="text-[10px] font-bold text-[#FF6B1A] uppercase tracking-tighter">
            {userRoleBadge}
          </p>
        </div>

        <Link to="/dashboard/profile" title="My Profile">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name || "Profile"}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#8B1A1A] shadow-sm hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-10 h-10 bg-[#8B1A1A] text-white rounded-full flex items-center justify-center font-bold font-serif hover:scale-105 transition-transform shadow-sm">
              {initials}
            </div>
          )}
        </Link>
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
