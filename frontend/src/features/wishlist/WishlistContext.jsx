import { createContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/useAuth";
import * as wishlistApi from "../../api/wishlistApi";

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistedSlugs, setWishlistedSlugs] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Sync wishlist slugs on user authentication state change
  useEffect(() => {
    let active = true;

    if (!user) {
      setWishlistedSlugs(new Set());
      return;
    }

    setLoading(true);
    wishlistApi
      .getMyWishlistSlugs()
      .then((slugs) => {
        if (active && Array.isArray(slugs)) {
          setWishlistedSlugs(new Set(slugs));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch wishlist slugs:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const isWishlisted = useCallback(
    (slug) => {
      if (!slug) return false;
      return wishlistedSlugs.has(slug);
    },
    [wishlistedSlugs]
  );

  const toggleWishlist = useCallback(
    async (slug) => {
      if (!slug || !user) return false;

      const wasWishlisted = wishlistedSlugs.has(slug);

      // Optimistic update
      setWishlistedSlugs((prev) => {
        const next = new Set(prev);
        if (wasWishlisted) {
          next.delete(slug);
        } else {
          next.add(slug);
        }
        return next;
      });

      try {
        if (wasWishlisted) {
          await wishlistApi.removeFromWishlist(slug);
        } else {
          await wishlistApi.addToWishlist(slug);
        }
        return !wasWishlisted;
      } catch (err) {
        console.error("Wishlist toggle failed, reverting optimistic state:", err);
        // Revert optimistic update on failure
        setWishlistedSlugs((prev) => {
          const next = new Set(prev);
          if (wasWishlisted) {
            next.add(slug);
          } else {
            next.delete(slug);
          }
          return next;
        });
        throw err;
      }
    },
    [user, wishlistedSlugs]
  );

  return (
    <WishlistContext.Provider
      value={{
        wishlistedSlugs,
        isWishlisted,
        toggleWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
