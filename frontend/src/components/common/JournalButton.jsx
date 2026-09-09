import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";

export default function JournalButton({
  destinationName = "",
  className = "",
  size = 18,
  activeClass = "text-[#FF6B1A]",
  title = "Add to Travel Journal",
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login", {
        state: { from: location.pathname + location.search },
      });
      return;
    }

    const now = new Date();
    // YYYY-MM-DD
    const dateStr = now.toISOString().split("T")[0];
    // HH:MM 24h
    const timeStr = now.toTimeString().slice(0, 5);

    const params = new URLSearchParams();
    if (destinationName) {
      params.set("destination", destinationName);
    }
    params.set("date", dateStr);
    params.set("time", timeStr);
    params.set("action", "new");

    navigate(`/dashboard/journal?${params.toString()}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={title}
      title={title}
      className={`w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer text-[#8B1A1A]/70 hover:text-[#FF6B1A] ${className}`}
    >
      <BookOpen size={size} className={activeClass} />
    </button>
  );
}
