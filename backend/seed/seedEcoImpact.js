import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import EcoImpact from "../models/EcoImpact.js";
import User from "../models/User.js";

dotenv.config();

/**
 * Curated initial eco actions to seed the database pre-launch with realistic data.
 * These create real documents in the database rather than fabricating the aggregation.
 */
export const seedEcoData = async () => {
  try {
    const existingCount = await EcoImpact.countDocuments();
    if (existingCount > 0) {
      console.log(`ℹ️ [SeedEco] EcoImpact collection already has ${existingCount} documents.`);
      return;
    }

    // Find or create a demo eco contributor user if needed
    let demoUser = await User.findOne({ email: "ecovoyager.demo@travelindepth.local" });
    if (!demoUser) {
      demoUser = await User.create({
        name: "Eco Voyager Demo",
        email: "ecovoyager.demo@travelindepth.local",
        password: "SeedUser_NoLogin_12345!",
        role: "user",
      });
    }

    const initialEcoImpacts = [
      {
        user: demoUser._id,
        actionType: "public_transit",
        title: "Electric Water Metro Commute",
        carbonSavedKg: 18.5,
        bottlesPrevented: 4,
        localSpentUSD: 25,
        ecoBadgeLevel: "Green Voyager",
        notes: "Used solar-electric ferry across Kochi backwaters instead of private cab.",
      },
      {
        user: demoUser._id,
        actionType: "reusable_bottle",
        title: "RO Refill Station Usage",
        carbonSavedKg: 6.2,
        bottlesPrevented: 12,
        localSpentUSD: 10,
        ecoBadgeLevel: "Eco-Novice",
        notes: "Refilled stainless steel flask at municipal water kiosks in Varanasi.",
      },
      {
        user: demoUser._id,
        actionType: "eco_lodge",
        title: "Solar-Powered Homestay",
        carbonSavedKg: 45.0,
        bottlesPrevented: 15,
        localSpentUSD: 120,
        ecoBadgeLevel: "Planet Guardian",
        notes: "Stayed at community-owned zero-waste heritage farm stay in Himachal.",
      },
    ];

    await EcoImpact.insertMany(initialEcoImpacts);
    console.log(`✅ [SeedEco] Seeded ${initialEcoImpacts.length} initial EcoImpact records.`);
  } catch (error) {
    console.error("❌ [SeedEco] Failed to seed eco data:", error.message);
  }
};

const run = async () => {
  await connectDB();
  try {
    await seedEcoData();
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// If run directly from CLI (e.g., node seed/seedEcoImpact.js)
if (process.argv[1] && process.argv[1].endsWith("seedEcoImpact.js")) {
  run();
}
