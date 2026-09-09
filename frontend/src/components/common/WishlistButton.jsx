import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";
import { useAuth } from "../../features/auth/useAuth";
import { useWishlist } from "../../features/wishlist/useWishlist";

export default function WishlistButton({
  slug,
  className = "",
  size = 18,
  activeClass = "text-red-500 fill-red-500",
  inactiveClass = "text-[#8B1A1A]/70 hover:text-red-500",
}) {
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const [toggling, setToggling] = useState(false);

  const liked = isWishlisted(slug);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }

    if (!slug || toggling) return;

    setToggling(true);
    try {
      await toggleWishlist(slug);
    } catch (err) {
      console.error("Failed to toggle wishlist item:", err);
    } finally {
      setToggling(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
      className={`w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer ${className}`}
    >
      <Heart
        size={size}
        className={`transition-colors duration-200 ${liked ? activeClass : inactiveClass}`}
      />
    </button>
  );
}
