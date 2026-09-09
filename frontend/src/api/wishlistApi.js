import { apiClient } from "./client";

export const getMyWishlistSlugs = () => apiClient.get("/wishlist/slugs");

export const getMyWishlist = () => apiClient.get("/wishlist");

export const addToWishlist = (slug) => apiClient.post(`/wishlist/${slug}`);

export const removeFromWishlist = (slug) => apiClient.delete(`/wishlist/${slug}`);
