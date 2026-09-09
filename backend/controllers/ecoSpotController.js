import EcoSpot from "../models/EcoSpot.js";
import User from "../models/User.js";
import { syncLiveEcoFeeds, PRE_SEEDED_ECO_SPOTS } from "../services/ecoFeedSync.js";

/**
 * Trigger manual feed sync (Admin / Dev)
 * POST /api/eco/sync-feeds
 */
export const syncFeedsHandler = async (req, res) => {
  try {
    const result = await syncLiveEcoFeeds();
    return res.status(200).json({
      success: true,
      message: "Live Eco-Data sync triggered successfully!",
      result,
    });
  } catch (error) {
    console.error("Error triggering eco feed sync:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to sync eco feeds.",
      error: error.message,
    });
  }
};

/**
 * GET /api/eco/spots
 * Fetch crowdsourced green spots with optional filter for category or location
 */
export const getAllEcoSpots = async (req, res) => {
  try {
    const { category, search } = req.query;

    const query = {};
    if (category && category !== "All") {
      query.category = category;
    }
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { location: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    let spots = await EcoSpot.find(query).sort({ upvotes: -1, createdAt: -1 }).lean();

    // If database has no spots yet and no restrictive query, auto-seed and return fallback
    if (spots.length === 0 && !search && (!category || category === "All")) {
      try {
        await EcoSpot.insertMany(PRE_SEEDED_ECO_SPOTS);
        spots = await EcoSpot.find(query).sort({ upvotes: -1, createdAt: -1 }).lean();
      } catch (seedErr) {
        console.error("Error auto-seeding default eco spots:", seedErr);
        spots = PRE_SEEDED_ECO_SPOTS;
      }
    }

    return res.status(200).json({
      success: true,
      count: spots.length,
      data: spots,
    });
  } catch (error) {
    console.error("Error fetching eco spots, returning resilient fallback:", error.message);
    // Return resilient pre-seeded fallback if database is currently reconnecting
    return res.status(200).json({
      success: true,
      count: PRE_SEEDED_ECO_SPOTS.length,
      data: PRE_SEEDED_ECO_SPOTS,
    });
  }
};

/**
 * POST /api/eco/spots
 * Submit a new green spot or alert
 */
export const createEcoSpot = async (req, res) => {
  try {
    const { title, category, location, description, submitterName } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Please provide a spot or alert title." });
    }

    const validCategories = [
      "Refill Station",
      "Zero-Waste Eatery",
      "Public Transit Tip",
      "Eco-Alert",
    ];
    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${validCategories.join(", ")}`,
      });
    }

    if (!location || !location.trim()) {
      return res.status(400).json({ success: false, message: "Please provide a location/city for this spot." });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Please provide details and description." });
    }

    let resolvedName = submitterName ? submitterName.trim() : "Green Explorer";
    if (req.userId) {
      const user = await User.findById(req.userId).select("name");
      if (user?.name) resolvedName = user.name;
    }

    const newSpot = await EcoSpot.create({
      title: title.trim(),
      category,
      location: location.trim(),
      description: description.trim(),
      submittedBy: req.userId || null,
      submitterName: resolvedName,
      upvotes: 1,
      upvotedBy: req.userId ? [req.userId.toString()] : [],
      isAutomated: false,
      source: "Community",
    });

    return res.status(201).json({
      success: true,
      message: "🌱 Green Spot submitted to community feed!",
      data: newSpot,
    });
  } catch (error) {
    console.error("Error creating eco spot:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit green spot.",
    });
  }
};

/**
 * POST /api/eco/spots/:id/upvote
 * Upvote a helpful green spot or alert
 */
export const upvoteEcoSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const spot = await EcoSpot.findById(id);

    if (!spot) {
      return res.status(404).json({ success: false, message: "Eco spot not found." });
    }

    const identifier = req.userId ? req.userId.toString() : req.ip || "guest";

    if (spot.upvotedBy && spot.upvotedBy.includes(identifier)) {
      spot.upvotedBy = spot.upvotedBy.filter((u) => u !== identifier);
      spot.upvotes = Math.max(0, spot.upvotes - 1);
    } else {
      if (!spot.upvotedBy) spot.upvotedBy = [];
      spot.upvotedBy.push(identifier);
      spot.upvotes += 1;
    }

    await spot.save();

    return res.status(200).json({
      success: true,
      message: "Upvote updated!",
      data: {
        _id: spot._id,
        upvotes: spot.upvotes,
        isUpvoted: spot.upvotedBy.includes(identifier),
      },
    });
  } catch (error) {
    console.error("Error upvoting eco spot:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upvote spot.",
      error: error.message,
    });
  }
};
