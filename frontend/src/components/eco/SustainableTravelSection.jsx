import React, { useState, useEffect } from "react";
import {
  Leaf,
  ShieldCheck,
  Award,
  Sparkles,
  TrendingUp,
  Droplets,
  DollarSign,
  PlusCircle,
  Footprints,
  Trees,
  CheckCircle2,
  Users,
  Compass,
  ArrowRight,
  Flame,
  Stamp,
  MapPin,
  Calendar,
} from "lucide-react";
import { getEcoStats, logEcoAction, createPledge, getMyPledges } from "../../api/ecoApi";
import LogActionModal from "./LogActionModal";
import EcoPledgeCard from "./EcoPledgeCard";
import PassportStampModal from "./PassportStampModal";
import EcoSpotsFeed from "./EcoSpotsFeed";
import { motion, AnimatePresence } from "framer-motion";

const BADGE_TIERS = {
  "Eco-Novice": {
    label: "Eco-Novice",
    icon: "🌱",
    color: "from-emerald-400 to-green-600",
    text: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-200",
    desc: "Starting the journey towards low-impact exploration.",
    nextTier: "Green Voyager",
    nextThreshold: 50,
  },
  "Green Voyager": {
    label: "Green Voyager",
    icon: "🌿",
    color: "from-teal-500 to-emerald-700",
    text: "text-teal-800",
    bg: "bg-teal-50 border-teal-200",
    desc: "Active sustainable traveler inspiring others on the road.",
    nextTier: "Planet Guardian",
    nextThreshold: 150,
  },
  "Planet Guardian": {
    label: "Planet Guardian",
    icon: "🏆",
    color: "from-amber-500 via-green-600 to-emerald-800",
    text: "text-amber-800",
    bg: "bg-amber-50 border-amber-300",
    desc: "Elite eco-champion with monumental community impact.",
    nextTier: "Max Tier Achieved 🌟",
    nextThreshold: 500,
  },
};

export default function SustainableTravelSection({ onAuthRequest }) {
  const [data, setData] = useState({
    community: {
      totalCarbonSavedKg: 4280,
      totalBottlesPrevented: 12600,
      totalLocalSpentUSD: 18450,
      totalActionsLogged: 640,
      greenExplorersCount: 320,
      treesEquivalent: 204,
    },
    userStats: {
      carbonSavedKg: 0,
      bottlesPrevented: 0,
      localSpentUSD: 0,
      ecoScore: 0,
      ecoBadgeLevel: "Eco-Novice",
      nextTierThreshold: 50,
      progressPercent: 0,
      actionsLogged: 0,
      recentActions: [],
    },
    leaderboard: [],
  });

  const [pledges, setPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [activeStampModalPledge, setActiveStampModalPledge] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, pledgeRes] = await Promise.allSettled([
        getEcoStats(),
        getMyPledges(),
      ]);

      if (statsRes.status === "fulfilled" && statsRes.value?.success) {
        setData(statsRes.value);
      }

      if (pledgeRes.status === "fulfilled" && pledgeRes.value?.success) {
        setPledges(pledgeRes.value.data || []);
      }
    } catch (err) {
      console.error("Failed to load eco data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActionLogged = async (actionData) => {
    await logEcoAction(actionData);
    setToastMessage(`🌿 Great job! Action "${actionData.title}" was successfully logged.`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 5000);
    await fetchData();
  };

  const handleSealPledge = async (pledgeData) => {
    const res = await createPledge(pledgeData);
    if (res && res.data) {
      // Add to live pledge list
      setPledges((prev) => [res.data, ...prev]);
      // Open passport stamp popup
      setActiveStampModalPledge(res.data);
      setToastMessage(`🌟 Sustainable Voyager Oath sealed for ${pledgeData.tripDestination}!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  const userBadge = BADGE_TIERS[data.userStats?.ecoBadgeLevel] || BADGE_TIERS["Eco-Novice"];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-10 font-sans">
      {/* 1. Header Banner with Modal Trigger */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-gradient-to-r from-[#138808]/15 via-[#138808]/5 to-transparent p-6 sm:p-8 rounded-3xl border border-[#138808]/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#138808] text-white flex items-center justify-center shadow-lg shadow-green-950/20 shrink-0">
            <Leaf size={32} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#138808]/10 text-[#138808] text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles size={12} />
              <span>Live Eco Movement</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#138808]">
              Community Impact & Eco-Badge System
            </h2>
            <p className="text-sm text-[#8B1A1A]/70 mt-1 max-w-xl">
              Track carbon offsets, plastic reduction, and earn digital Green Passport stamps for responsible travel across India.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsLogModalOpen(true)}
          className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#138808] to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-green-900/25 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <PlusCircle size={16} />
          <span>Log Green Action</span>
        </button>
      </div>

      {/* 2. Global Community Impact Ticker */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl font-bold text-[#8B1A1A] flex items-center gap-2">
            <Flame className="text-[#FF6B1A]" size={20} />
            <span>Real-Time Community Impact</span>
          </h3>
          <span className="text-xs font-semibold text-[#138808] bg-[#138808]/10 px-3 py-1 rounded-full">
            ● Live Network Stats
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Carbon */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8DCC4] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">CO₂ Saved</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#138808] flex items-center justify-center">
                🌱
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-3xl sm:text-4xl font-black text-[#138808]">
                {data.community.totalCarbonSavedKg.toLocaleString()}
                <span className="text-base font-normal text-stone-500 ml-1">kg</span>
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                ≈ {data.community.treesEquivalent} Trees planting equivalent 🌳
              </p>
            </div>
          </div>

          {/* Card 2: Bottles */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8DCC4] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Plastic Saved</span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                💧
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-3xl sm:text-4xl font-black text-blue-700">
                {data.community.totalBottlesPrevented.toLocaleString()}
                <span className="text-base font-normal text-stone-500 ml-1">bottles</span>
              </h4>
              <p className="text-xs text-stone-500 mt-1">Single-use water bottles avoided</p>
            </div>
          </div>

          {/* Card 3: Local Economy */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8DCC4] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Local Economy</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                🤝
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-3xl sm:text-4xl font-black text-amber-700">
                ${data.community.totalLocalSpentUSD.toLocaleString()}
              </h4>
              <p className="text-xs text-stone-500 mt-1">Directly into local artisans & stays</p>
            </div>
          </div>

          {/* Card 4: Green Explorers */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8DCC4] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Green Explorers</span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-[#8B1A1A] flex items-center justify-center">
                <Users size={18} />
              </div>
            </div>
            <div className="mt-4">
              <h4 className="text-3xl sm:text-4xl font-black text-[#8B1A1A]">
                {data.community.greenExplorersCount.toLocaleString()}+
              </h4>
              <p className="text-xs text-stone-500 mt-1">{data.community.totalActionsLogged} Verified eco actions</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. User Green Profile & Badge Progression Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Badge Status Card */}
        <div className={`rounded-3xl p-7 border ${userBadge.bg} shadow-md flex flex-col justify-between relative overflow-hidden`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                Your Eco-Badge Tier
              </span>
              <span className="text-2xl">{userBadge.icon}</span>
            </div>

            <div className="space-y-1">
              <h3 className={`text-2xl font-serif font-black ${userBadge.text}`}>
                {userBadge.label}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {userBadge.desc}
              </p>
            </div>

            {/* Score Progress */}
            <div className="mt-6 pt-5 border-t border-stone-200/60 space-y-2">
              <div className="flex justify-between text-xs font-bold text-stone-700">
                <span>Personal Eco Score</span>
                <span>{data.userStats.ecoScore} pts</span>
              </div>

              <div className="w-full h-3 bg-stone-200/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#138808] to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${data.userStats.progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-stone-500 pt-0.5">
                <span>Next Tier: {userBadge.nextTier}</span>
                <span>{data.userStats.progressPercent}%</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-600">
            <span>Actions Logged: <b>{data.userStats.actionsLogged}</b></span>
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="font-bold text-[#138808] hover:underline flex items-center gap-1"
            >
              + Log More <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* User Personal Metrics Breakdown */}
        <div className="bg-white rounded-3xl p-7 border border-[#E8DCC4] shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h4 className="font-serif text-xl font-bold text-[#8B1A1A]">Your Sustainable Footprint</h4>
                <p className="text-xs text-stone-500 mt-0.5">Personal metrics calculated from your verified travel choices</p>
              </div>
              <span className="text-xs font-bold text-[#138808] px-3 py-1 bg-[#138808]/10 rounded-full">
                Active Member
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-[#FDF6EC] border border-[#E8DCC4]">
                <p className="text-[11px] font-bold uppercase text-stone-500">Your CO₂ Saved</p>
                <p className="text-2xl font-black text-[#138808] mt-1">{data.userStats.carbonSavedKg} kg</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Transit & Stays</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FDF6EC] border border-[#E8DCC4]">
                <p className="text-[11px] font-bold uppercase text-stone-500">Bottles Prevented</p>
                <p className="text-2xl font-black text-blue-700 mt-1">{data.userStats.bottlesPrevented}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Reusable Flask Refills</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FDF6EC] border border-[#E8DCC4]">
                <p className="text-[11px] font-bold uppercase text-stone-500">Local Spending</p>
                <p className="text-2xl font-black text-amber-700 mt-1">${data.userStats.localSpentUSD}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Direct Community Support</p>
              </div>
            </div>
          </div>

          {/* Badge Tier Matrix */}
          <div className="pt-4 border-t border-[#F0E4D4] grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`p-2 rounded-xl border ${data.userStats.ecoBadgeLevel === "Eco-Novice" ? "bg-green-100 border-[#138808] font-bold text-[#138808]" : "bg-stone-50 border-stone-200 text-stone-500"}`}>
              🌱 Eco-Novice
            </div>
            <div className={`p-2 rounded-xl border ${data.userStats.ecoBadgeLevel === "Green Voyager" ? "bg-green-100 border-[#138808] font-bold text-[#138808]" : "bg-stone-50 border-stone-200 text-stone-500"}`}>
              🌿 Green Voyager
            </div>
            <div className={`p-2 rounded-xl border ${data.userStats.ecoBadgeLevel === "Planet Guardian" ? "bg-green-100 border-[#138808] font-bold text-[#138808]" : "bg-stone-50 border-stone-200 text-stone-500"}`}>
              🏆 Planet Guardian
            </div>
          </div>
        </div>
      </div>

      {/* 4. Eco-Pledge & Voyager Oath Commitment Card */}
      <EcoPledgeCard onSealPledge={handleSealPledge} />

      {/* 5. User's Passport Stamp Collection */}
      {pledges.length > 0 && (
        <div className="bg-white rounded-3xl p-7 border border-[#E8DCC4] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-[#8B1A1A] flex items-center gap-2">
              <Stamp className="text-[#138808]" size={22} />
              <span>Your Green Passport Stamps ({pledges.length})</span>
            </h3>
            <span className="text-xs font-semibold text-stone-400">Click to view certificate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pledges.map((p) => (
              <div
                key={p._id || p.stampId}
                onClick={() => setActiveStampModalPledge(p)}
                role="button"
                tabIndex={0}
                className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E8DCC4] hover:border-[#138808] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[10px] font-bold text-[#8B1A1A] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {p.stampId}
                    </span>
                    <span className="text-xs text-[#138808] font-bold flex items-center gap-1">
                      <ShieldCheck size={13} /> Sealed
                    </span>
                  </div>

                  <h4 className="font-serif text-lg font-bold text-stone-800 group-hover:text-[#138808] transition-colors flex items-center gap-1.5">
                    <MapPin size={15} className="text-[#FF6B1A]" />
                    <span>{p.tripDestination}</span>
                  </h4>

                  <p className="text-xs text-stone-500 mt-2 line-clamp-2">
                    {p.pledges?.join(" • ")}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#F0E4D4] flex items-center justify-between text-[11px] text-stone-400">
                  <span>
                    {p.pledgeDate ? new Date(p.pledgeDate).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recently"}
                  </span>
                  <span className="font-bold text-[#138808] group-hover:translate-x-1 transition-transform">
                    View Stamp →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Crowdsourced Green Spots & Eco-Alerts Feed */}
      <EcoSpotsFeed userName={data.userStats?.name} />

      {/* 7. Community Eco-Leaderboard */}
      <div className="bg-white rounded-3xl p-7 border border-[#E8DCC4] shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#8B1A1A] flex items-center gap-2">
              <Award className="text-[#F5A623]" size={22} />
              <span>Community Impact Leaderboard</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">Top eco-conscious travelers preserving India’s beauty and heritage.</p>
          </div>
          <span className="text-xs font-semibold text-stone-500">Updated Hourly</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-[#FFF8F0] uppercase tracking-wider text-[10px] font-bold text-[#8B1A1A] border-b border-[#E8DCC4]">
              <tr>
                <th className="py-3.5 px-4">Rank</th>
                <th className="py-3.5 px-4">Explorer</th>
                <th className="py-3.5 px-4">Eco Badge</th>
                <th className="py-3.5 px-4">CO₂ Saved</th>
                <th className="py-3.5 px-4">Bottles Saved</th>
                <th className="py-3.5 px-4 text-right">Impact Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E4D4]">
              {data.leaderboard.map((member, idx) => (
                <tr key={idx} className="hover:bg-[#FFFDF9] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-sm">
                    {idx === 0 ? "🥇 #1" : idx === 1 ? "🥈 #2" : idx === 2 ? "🥉 #3" : `#${idx + 1}`}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#138808] to-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                      {member.name.charAt(0)}
                    </div>
                    <span>{member.name}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#138808]/10 text-[#138808]">
                      {member.badge}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-800">{member.carbon} kg</td>
                  <td className="py-3.5 px-4 font-semibold text-blue-700">{member.bottles}</td>
                  <td className="py-3.5 px-4 font-black text-right text-stone-900 text-sm">
                    {member.score} pts
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <LogActionModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onActionLogged={handleActionLogged}
      />

      <PassportStampModal
        isOpen={!!activeStampModalPledge}
        onClose={() => setActiveStampModalPledge(null)}
        pledge={activeStampModalPledge}
      />

      {/* Success Notification Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-[130] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#120600] text-white p-5 rounded-3xl shadow-2xl border border-[#138808]/40 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#138808] to-emerald-600 flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 size={22} className="text-white" />
            </div>
            <div className="flex-1 pr-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Sparkles size={13} />
                <span>Eco Commitment Sealed!</span>
              </div>
              <p className="text-sm text-stone-200 mt-1 leading-relaxed">
                {toastMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
