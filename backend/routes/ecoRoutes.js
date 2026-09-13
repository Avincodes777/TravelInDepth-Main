import express from "express";
import { getEcoStats, logEcoAction } from "../controllers/ecoController.js";
import { createPledge, getUserPledges } from "../controllers/pledgeController.js";
import {
  getAllEcoSpots,
  createEcoSpot,
  upvoteEcoSpot,
  syncFeedsHandler,
} from "../controllers/ecoSpotController.js";
import { optionalAuth, requireAuth, requireAdmin } from "../middleware/authMiddleware.js";
import { ecoActionRateLimit, submissionRateLimit } from "../middleware/rateLimiter.js";

const router = express.Router();

// Community & Personal Impact Metrics
router.get("/stats", optionalAuth, getEcoStats);
router.post("/log-action", requireAuth, ecoActionRateLimit, logEcoAction);

// Eco Pledges & Digital Passport Stamps
router.post("/pledge", optionalAuth, createPledge);
router.get("/pledge", requireAuth, getUserPledges);
router.get("/pledge/my", requireAuth, getUserPledges);

// Crowdsourced Green Spots & Eco-Alerts
router.get("/spots", optionalAuth, getAllEcoSpots);
router.post("/spots", requireAuth, submissionRateLimit, createEcoSpot);
router.post("/spots/:id/upvote", optionalAuth, upvoteEcoSpot);

// Admin-only feed sync
router.post("/sync-feeds", requireAuth, requireAdmin, syncFeedsHandler);

export default router;
