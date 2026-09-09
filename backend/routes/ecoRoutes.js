import express from "express";
import { getEcoStats, logEcoAction } from "../controllers/ecoController.js";
import { createPledge, getUserPledges } from "../controllers/pledgeController.js";
import {
  getAllEcoSpots,
  createEcoSpot,
  upvoteEcoSpot,
  syncFeedsHandler,
} from "../controllers/ecoSpotController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Community & Personal Impact Metrics
router.get("/stats", optionalAuth, getEcoStats);
router.post("/log-action", optionalAuth, logEcoAction);

// Eco Pledges & Digital Passport Stamps
router.post("/pledge", optionalAuth, createPledge);
router.get("/pledge", optionalAuth, getUserPledges);
router.get("/pledge/my", optionalAuth, getUserPledges);

// Crowdsourced Green Spots & Eco-Alerts
router.get("/spots", optionalAuth, getAllEcoSpots);
router.post("/spots", optionalAuth, createEcoSpot);
router.post("/spots/:id/upvote", optionalAuth, upvoteEcoSpot);
router.post("/sync-feeds", optionalAuth, syncFeedsHandler);

export default router;
