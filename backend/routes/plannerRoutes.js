import express from "express";
import {
  generateItinerary,
  generateMultiCityItinerary,
} from "../controllers/plannerController.js";
import {
  regenerateDay,
  saveItinerary,
  getMyItineraries,
  deleteItinerary,
} from "../controllers/plannerExtraController.js";
import { requireAuth, optionalAuth } from "../middleware/authMiddleware.js";
import { plannerRateLimit } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/generate", optionalAuth, plannerRateLimit, generateItinerary);
router.post("/generate-multi", optionalAuth, plannerRateLimit, generateMultiCityItinerary);
router.post("/generate/day", optionalAuth, plannerRateLimit, regenerateDay);
router.post("/save", requireAuth, saveItinerary);
router.get("/my", requireAuth, getMyItineraries);
router.delete("/my/:id", requireAuth, deleteItinerary);

export default router;