import JournalEntry from "../models/JournalEntry.js";
import { uploadStream, deleteCloudinaryAsset } from "../config/cloudinary.js";

/**
 * Create a new Journal Entry
 * Handles multipart/form-data upload with in-memory multer
 */
export const createEntry = async (req, res) => {
  try {
    const {
      locationName,
      date,
      time = "",
      title = "",
      note = "",
      mood = "Adventurous",
    } = req.body;

    if (!locationName || !locationName.trim()) {
      return res.status(400).json({ message: "Location name is required." });
    }

    if (!date || !date.trim()) {
      return res.status(400).json({ message: "Date is required." });
    }

    // Parse captions if passed as array or JSON string
    let parsedCaptions = [];
    if (req.body.captions) {
      if (Array.isArray(req.body.captions)) {
        parsedCaptions = req.body.captions;
      } else if (typeof req.body.captions === "string") {
        try {
          parsedCaptions = JSON.parse(req.body.captions);
        } catch {
          parsedCaptions = [req.body.captions];
        }
      }
    }

    // Upload files directly to Cloudinary from memory buffer
    const photoObjects = [];
    const files = req.files || [];

    if (files.length > 0) {
      const uploadPromises = files.map(async (file, index) => {
        const uploadResult = await uploadStream(file.buffer, {
          folder: `travel_journal/user_${req.userId}`,
        });
        const caption =
          (Array.isArray(parsedCaptions) && parsedCaptions[index]) || "";

        return {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          caption: typeof caption === "string" ? caption.trim() : "",
        };
      });

      const uploadedPhotos = await Promise.all(uploadPromises);
      photoObjects.push(...uploadedPhotos);
    }

    const newEntry = await JournalEntry.create({
      user: req.userId,
      locationName: locationName.trim(),
      date: date.trim(),
      time: (time || "").trim(),
      title: (title || "").trim(),
      note: (note || "").trim(),
      mood: (mood || "Adventurous").trim(),
      photos: photoObjects,
    });

    return res.status(201).json({
      message: "Journal entry created successfully.",
      entry: newEntry,
    });
  } catch (err) {
    console.error("Failed to create journal entry:", err);
    return res.status(500).json({
      message: "Failed to create journal entry",
      error: err.message,
    });
  }
};

/**
 * Get all journal entries for logged-in user
 */
export const getMyEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(entries);
  } catch (err) {
    console.error("Failed to fetch journal entries:", err);
    return res.status(500).json({
      message: "Failed to fetch journal entries",
      error: err.message,
    });
  }
};

/**
 * Get single journal entry by ID
 */
export const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await JournalEntry.findOne({ _id: id, user: req.userId });

    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found." });
    }

    return res.status(200).json(entry);
  } catch (err) {
    console.error("Failed to get journal entry:", err);
    return res.status(500).json({
      message: "Failed to get journal entry",
      error: err.message,
    });
  }
};

/**
 * Delete a journal entry
 */
export const deleteEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await JournalEntry.findOne({ _id: id, user: req.userId });

    if (!entry) {
      return res.status(404).json({ message: "Journal entry not found or unauthorized." });
    }

    // Attempt clean up of Cloudinary photos in background
    if (entry.photos && entry.photos.length > 0) {
      for (const photo of entry.photos) {
        if (photo.publicId) {
          deleteCloudinaryAsset(photo.publicId).catch((delErr) =>
            console.warn(`Failed to delete Cloudinary photo ${photo.publicId}:`, delErr.message)
          );
        }
      }
    }

    await JournalEntry.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Journal entry deleted successfully.",
      id,
    });
  } catch (err) {
    console.error("Failed to delete journal entry:", err);
    return res.status(500).json({
      message: "Failed to delete journal entry",
      error: err.message,
    });
  }
};
