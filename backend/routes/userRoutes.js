import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  updateUserSettings,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Profile & Settings
router.get("/profile", requireAuth, getUserProfile);
router.put("/profile", requireAuth, updateUserProfile);
router.put("/settings", requireAuth, updateUserSettings);

// Notifications
router.get("/notifications", requireAuth, getNotifications);
router.put("/notifications/:id/read", requireAuth, markNotificationAsRead);
router.delete("/notifications/:id", requireAuth, deleteNotification);

export default router;
