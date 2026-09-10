import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Compass,
  Sparkles,
  ArrowLeft,
  Bell,
  CheckCircle2,
  MapPin,
  Send,
  Plane,
  Camera,
  Heart,
  Calendar,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function ComingSoonPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Extract feature info passed from state, search params, or fallback
  const searchParams = new URLSearchParams(location.search);
  const featureName =
    location.state?.featureName ||
    searchParams.get("feature") ||
    (location.pathname === "/book-trip" ? "Trip Booking Concierge" : "Upcoming Feature");

  const featureCategory =
    location.state?.category ||
    searchParams.get("category") ||
    "Curated Travel Experience";

  const featureDescription =
    location.state?.description ||
    searchParams.get("desc") ||
    "We are meticulously crafting this experience to bring you seamless bookings, verified local guides, and authentic Indian expeditions.";

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim() && email.includes("@")) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setEmail("");
    }
  };

  const previewHighlights = [
    {
      icon: <Calendar className="w-5 h-5 text-[#FF6B1A]" />,
      title: "Instant Live Reservations",
      desc: "Direct bookings for heritage homestays, licensed cultural guides, and desert safaris.",
    },
    {
      icon: <Compass className="w-5 h-5 text-[#F5A623]" />,
      title: "Handpicked Offbeat Access",
      desc: "Unlock hidden trails and tribal artisan workshops curated with local communities.",
    },
    {
      icon: <Heart className="w-5 h-5 text-[#138808]" />,
      title: "100% Verified & Sustainable",
      desc: "Eco-conscious choices certified for carbon transparency and fair local artisan wages.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EC] text-[#2D1B00] relative overflow-hidden font-sans pt-24 pb-20">
      <Helmet>
        <title>{featureName} — Coming Soon | Travel In Depth</title>
        <meta
          name="description"
          content="This feature is currently in active development. Stay tuned for authentic, deep travel experiences across India."
        />
      </Helmet>

      {/* Hero Background Scenery Canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Scenic Background image with aesthetic golden hour overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 transition-transform duration-10000 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=1920&q=80')`,
            filter: "saturate(1.2) contrast(1.05)",
          }}
        />

        {/* Ambient Gradient Meshes */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-br from-[#FF6B1A]/20 via-[#F5A623]/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-[#8B1A1A]/15 via-[#FF6B1A]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/4 w-[700px] h-[700px] bg-gradient-to-t from-[#138808]/10 via-[#F5A623]/10 to-transparent rounded-full blur-3xl" />

        {/* Traditional Mandala & Compass Patterns */}
        <div className="absolute top-20 right-10 opacity-5 w-96 h-96 pointer-events-none">
          <svg viewBox="0 0 200 200" fill="none" stroke="#8B1A1A" strokeWidth="0.8">
            <circle cx="100" cy="100" r="90" strokeDasharray="3 3" />
            <circle cx="100" cy="100" r="70" />
            <circle cx="100" cy="100" r="50" />
            <circle cx="100" cy="100" r="30" strokeDasharray="4 4" />
            <path d="M100 0 L100 200 M0 100 L200 100 M29 29 L171 171 M29 171 L171 29" />
          </svg>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Navigation Breadcrumb / Back Button */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-xs font-bold text-[#8B1A1A] border border-[#E8DCC4] shadow-sm hover:shadow transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#FF6B1A] hover:text-[#8B1A1A] transition-colors"
          >
            <span>Travel In Depth</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Main Coming Soon Presentation Card */}
        <div className="bg-white/85 backdrop-blur-xl rounded-[32px] p-8 sm:p-12 md:p-16 border border-[#F5A623]/30 shadow-[0_20px_60px_-15px_rgba(139,26,26,0.15)] text-center relative overflow-hidden">
          {/* Top Decorative Indian Motif Band */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF6B1A] via-[#F5A623] to-[#138808]" />

          {/* Floating Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6B1A]/10 border border-[#FF6B1A]/25 text-[#8B1A1A] text-xs font-bold uppercase tracking-[0.25em] mb-6 shadow-sm animate-bounce">
            <Sparkles size={14} className="text-[#FF6B1A]" />
            <span>In Active Crafting • {featureCategory}</span>
          </div>

          {/* Majestic Hero Typography */}
          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl font-black text-[#8B1A1A] leading-[1.1] tracking-tight mb-4">
            Something Extraordinary <br className="hidden sm:inline" />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B1A] via-[#F5A623] to-[#8B1A1A]">
              Is Coming Soon
            </span>
          </h1>

          <div className="flex items-center justify-center gap-3 my-6">
            <span className="w-12 h-[2px] bg-gradient-to-r from-transparent to-[#F5A623]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B1A] shadow-sm shadow-[#FF6B1A]" />
            <span className="w-12 h-[2px] bg-gradient-to-l from-transparent to-[#F5A623]" />
          </div>

          {/* Focused Feature Highlight Box */}
          <div className="max-w-2xl mx-auto bg-[#FDF6EC]/80 border border-[#E8DCC4] rounded-2xl p-5 sm:p-6 mb-8 text-left">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B1A] text-white flex items-center justify-center font-bold text-sm shadow-md">
                ✦
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2D1B00]">
                {featureName}
              </h3>
            </div>
            <p className="text-sm text-[#6B4226] leading-relaxed pl-11">
              {featureDescription}
            </p>
          </div>

          {/* Email Notification Subscriber */}
          <div className="max-w-lg mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
              Be the first to know when this feature unlocks
            </p>

            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  placeholder="Enter your email for early access..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 rounded-2xl bg-white border border-[#E8DCC4] text-sm text-[#2D1B00] placeholder:text-stone-400 focus:outline-none focus:border-[#FF6B1A] focus:ring-2 focus:ring-[#FF6B1A]/20 shadow-inner"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B1A] to-[#8B1A1A] hover:from-[#e05a10] hover:to-[#6e1414] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-950/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Bell size={15} />
                <span>Notify Me</span>
              </button>
            </form>

            {subscribed && (
              <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-[#138808] animate-in fade-in">
                <CheckCircle2 size={15} />
                <span>You're on the VIP list! We will email you once live.</span>
              </div>
            )}
          </div>

          {/* 3 Pillar Previews */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-8 border-t border-[#F0E4D4] text-left">
            {previewHighlights.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white border border-[#E8DCC4] shadow-sm hover:shadow-md hover:border-[#FF6B1A]/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FDF6EC] border border-[#E8DCC4] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h4 className="font-serif text-base font-bold text-[#8B1A1A] mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Quick Action Destinations Links */}
          <div className="mt-10 pt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/destinations"
              className="px-6 py-3 rounded-full bg-[#8B1A1A] hover:bg-[#6e1414] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-2"
            >
              <Compass size={14} />
              <span>Explore Active Destinations</span>
            </Link>

            <Link
              to="/#ai-trip-planner"
              className="px-6 py-3 rounded-full bg-white hover:bg-[#FFF8F0] text-[#8B1A1A] border border-[#8B1A1A]/30 text-xs font-bold uppercase tracking-wider shadow-sm hover:scale-105 transition-all flex items-center gap-2"
            >
              <Sparkles size={14} className="text-[#FF6B1A]" />
              <span>Use AI Itinerary Planner</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
