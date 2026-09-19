import Itinerary from "../models/Itinerary.js";
import { createNotification } from "../utils/createNotification.js";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

const callAI = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("No API key configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI provider error:", response.status, errText);
      throw new Error("AI service temporarily unavailable");
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return rawText.replace(/```json|```/g, "").trim();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
};

import Destination from "../models/Destination.js";

export const regenerateDay = async (req, res) => {
  try {
    const { destination, dayNumber, totalDays } = req.body || {};

    if (!destination || !dayNumber || !totalDays) {
      return res.status(400).json({ message: "destination, dayNumber, and totalDays are required" });
    }

    const destData = await Destination.findOne({
      $or: [
        { name: new RegExp(`^${destination.trim()}$`, "i") },
        { slug: destination.trim().toLowerCase() },
      ],
    });

    const attractionsStr = (destData?.attractions || []).map(a => a.name).join(", ");
    const foodStr = (destData?.foodRecommendations || []).map(f => f.name).join(", ");

    const prompt = `You are an expert Indian travel planner.
Regenerate a rich, authentic alternative Day ${dayNumber} of a ${totalDays}-day travel itinerary for "${destination}, India".
Destination Attractions: ${attractionsStr || "Major cultural and scenic landmarks"}
Local Food Specialities: ${foodStr || "Authentic regional dishes"}

CRITICAL RULES:
1. Do not output generic placeholders. Use real, specific, famous monument, fort, bazaar, and food names in ${destination}.
2. Respond with ONLY valid JSON, no markdown code fences.

Shape:
{
  "day": ${dayNumber},
  "title": "Specific day theme with real place names in ${destination}",
  "morning": "Specific morning landmark activity with timing",
  "afternoon": "Specific afternoon sight, artisan market, and lunch recommendation",
  "evening": "Specific sunset/night experience and dinner",
  "meals": "Named authentic local dishes",
  "estimatedBudgetINR": "e.g. ₹2,000 - ₹3,500",
  "tips": "Practical local tip unique to ${destination}"
}`;

    let dayPlan;
    try {
      const cleaned = await callAI(prompt);
      dayPlan = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("Failed to parse regenerated day:", parseErr.message);
      return res.status(502).json({ message: "AI returned an unexpected format. Please try again." });
    }

    res.status(200).json(dayPlan);
  } catch (err) {
    console.error("Day regeneration failed:", err.message);
    res.status(500).json({ message: "Failed to regenerate day", error: err.message });
  }
};

export const saveItinerary = async (req, res) => {
  try {
    const { destination, cities, days } = req.body || {};

    if (!destination || !Array.isArray(days) || days.length === 0) {
      return res.status(400).json({ message: "A valid destination and days array are required" });
    }

    // Determine cities array: either explicit cities array, or parsed from "City1 → City2", or single city
    let parsedCities = [];
    if (Array.isArray(cities) && cities.length > 0) {
      parsedCities = cities.map((c) => (typeof c === "string" ? c.trim() : (c.destination || c.name || "").trim())).filter(Boolean);
    } else if (typeof destination === "string" && destination.includes("→")) {
      parsedCities = destination.split("→").map((c) => c.trim()).filter(Boolean);
    } else if (typeof destination === "string") {
      parsedCities = [destination.trim()];
    }

    const itinerary = await Itinerary.create({
      userId: req.userId,
      destination,
      cities: parsedCities,
      days,
    });

    if (req.userId) {
      await createNotification({
        userId: req.userId,
        title: "Itinerary saved",
        message: `Your custom travel plan for "${destination}" has been successfully saved to your profile.`,
        type: "booking",
        link: "/dashboard/itineraries",
      });
    }

    res.status(201).json(itinerary);
  } catch (err) {
    res.status(400).json({ message: "Failed to save itinerary", error: err.message });
  }
};

export const getMyItineraries = async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(itineraries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch saved itineraries", error: err.message });
  }
};

export const deleteItinerary = async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!itinerary) {
      return res.status(404).json({ message: "Itinerary not found" });
    }
    res.status(200).json({ message: "Itinerary deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete itinerary", error: err.message });
  }
};
