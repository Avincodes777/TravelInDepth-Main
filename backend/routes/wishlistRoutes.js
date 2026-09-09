import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getMyWishlistSlugs,
  getMyWishlist,
} from "../controllers/wishlistController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// All wishlist routes require user authentication
router.post("/:slug", requireAuth, addToWishlist);
router.delete("/:slug", requireAuth, removeFromWishlist);
router.get("/slugs", requireAuth, getMyWishlistSlugs);
router.get("/", requireAuth, getMyWishlist);

export default router;
