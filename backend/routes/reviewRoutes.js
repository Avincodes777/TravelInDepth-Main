import express from "express";
import { getAllReviews, getMyReviews, createReview, deleteReview } from "../controllers/reviewController.js";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public / optionally authenticated
router.get("/", getAllReviews);
router.post("/", optionalAuth, createReview);

// User specific
router.get("/my", requireAuth, getMyReviews);

// Delete review (supports optional auth for owner/admin or guest delete)
router.delete("/:id", optionalAuth, deleteReview);

export default router;
