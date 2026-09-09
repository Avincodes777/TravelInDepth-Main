import express from "express";
import multer from "multer";
import {
  createEntry,
  getMyEntries,
  getEntryById,
  deleteEntry,
} from "../controllers/journalController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer with in-memory storage for Cloudinary streaming
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per image
    files: 10, // Max 10 images per entry
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are supported in journal entries"), false);
    }
  },
});

// All journal routes require user authentication
router.post("/", requireAuth, upload.array("photos", 10), createEntry);
router.get("/", requireAuth, getMyEntries);
router.get("/:id", requireAuth, getEntryById);
router.delete("/:id", requireAuth, deleteEntry);

export default router;
