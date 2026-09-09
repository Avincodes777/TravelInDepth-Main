import express from "express";
import { signup, login, getMe, updateInterests, googleAuth } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", requireAuth, getMe);
router.put("/interests", requireAuth, updateInterests);

export default router;