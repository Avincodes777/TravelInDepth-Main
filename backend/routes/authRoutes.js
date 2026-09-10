import express from "express";
import { signup, login, getMe, updateInterests, googleAuth } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { authRateLimit } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/signup", authRateLimit, signup);
router.post("/login", authRateLimit, login);
router.post("/google", authRateLimit, googleAuth);
router.get("/me", requireAuth, getMe);
router.put("/interests", requireAuth, updateInterests);

export default router;