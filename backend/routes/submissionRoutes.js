import express from "express";
import {
  createSubmission,
  getMySubmissions,
  getAllSubmissions,
  approveSubmission,
  rejectSubmission,
} from "../controllers/submissionController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { plannerRateLimit } from "../middleware/rateLimiter.js";

const router = express.Router();

// User endpoints (Authenticated)
router.post("/", requireAuth, plannerRateLimit, createSubmission);
router.get("/my", requireAuth, getMySubmissions);

// Admin endpoints (requireAuth + requireAdmin)
router.get("/", requireAuth, requireAdmin, getAllSubmissions);
router.patch("/:id/approve", requireAuth, requireAdmin, approveSubmission);
router.patch("/:id/reject", requireAuth, requireAdmin, rejectSubmission);

export default router;
