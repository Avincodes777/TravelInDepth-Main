import EcoPledge from "../models/EcoPledge.js";
import User from "../models/User.js";
import crypto from "crypto";

/**
 * Generate a unique passport stamp code (e.g., TID-ECO-2026-X8K9)
 */
const generateStampCode = (destination = "") => {
  const cleanCode = destination.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "IND");
  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  const year = new Date().getFullYear();
  return `TID-${cleanCode || "ECO"}-${year}-${randomHex}`;
};

/**
 * POST /api/eco/pledge
 * Create a new eco-pledge and generate unique digital passport stamp
 */
export const createPledge = async (req, res) => {
  try {
    const { tripDestination, pledges, userName } = req.body;

    if (!tripDestination || !tripDestination.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please specify your upcoming trip destination.",
      });
    }

    if (!Array.isArray(pledges) || pledges.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one sustainable commitment.",
      });
    }

    let resolvedName = userName ? userName.trim() : "Conscious Explorer";
    if (req.userId) {
      const user = await User.findById(req.userId).select("name");
      if (user?.name) resolvedName = user.name;
    }

    const stampId = generateStampCode(tripDestination);

    const newPledge = await EcoPledge.create({
      user: req.userId || null,
      userName: resolvedName,
      tripDestination: tripDestination.trim(),
      pledges,
      stampId,
      pledgeDate: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "🌟 Your Sustainable Voyager Oath has been sealed!",
      data: newPledge,
    });
  } catch (error) {
    console.error("Error creating eco pledge:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to seal your eco-pledge.",
    });
  }
};

/**
 * GET /api/eco/pledge/my (or /api/eco/pledges)
 * Fetch active/past user eco-pledges and passport stamps
 */
export const getUserPledges = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Authentication required to fetch your pledges.",
      });
    }

    const pledges = await EcoPledge.find({ user: req.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      count: pledges.length,
      data: pledges,
    });
  } catch (error) {
    console.error("Error fetching eco pledges:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve eco-pledges.",
      error: error.message,
    });
  }
};
