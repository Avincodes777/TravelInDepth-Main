import Itinerary from "../models/Itinerary.js";
import Destination from "../models/Destination.js";
import { createNotification } from "../utils/createNotification.js";
import { getRouteDuration } from "../services/routingService.js";
import { getCuratedDestination } from "../services/destinationKnowledge.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const GEMINI_API_MODELS = [
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
];

const callAI = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("No API key configured");
  }

  for (const modelUrl of GEMINI_API_MODELS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(`${modelUrl}?key=${apiKey}`, {
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
            temperature: 0.4,
            maxOutputTokens: 3500,
          },
        }),
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = rawText.replace(/```json|```/g, "").trim();
        if (cleaned) {
          return cleaned;
        }
      } else {
        console.warn(`Gemini model ${modelUrl} returned status ${response.status}`);
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`Gemini model attempt failed on ${modelUrl}:`, err.message);
    }
  }

  throw new Error("AI service temporarily unavailable across all models");
};

export const regenerateDay = async (req, res) => {
  try {
    const { destination, dayNumber, totalDays, city } = req.body || {};
    const targetPlace = city || destination;

    if (!targetPlace || !dayNumber) {
      return res.status(400).json({ message: "destination/city and dayNumber are required" });
    }

    let destData = null;
    try {
      destData = await Destination.findOne({
        $or: [
          { name: new RegExp(`^${targetPlace.trim()}$`, "i") },
          { slug: targetPlace.trim().toLowerCase() },
        ],
      }).lean();
    } catch (dbErr) {
      console.warn("DB lookup warning in regenerateDay:", dbErr.message);
    }

    const curated = getCuratedDestination(targetPlace);
    if (curated) {
      if (!destData) {
        destData = curated;
      } else {
        destData = {
          ...curated,
          ...destData,
          attractions: (destData.attractions && destData.attractions.length > 0) ? destData.attractions : curated.attractions,
          foodRecommendations: (destData.foodRecommendations && destData.foodRecommendations.length > 0) ? destData.foodRecommendations : curated.foodRecommendations,
          activities: (destData.activities && destData.activities.length > 0) ? destData.activities : curated.activities,
          hiddenGems: (destData.hiddenGems && destData.hiddenGems.length > 0) ? destData.hiddenGems : curated.hiddenGems,
          tips: (destData.tips && destData.tips.length > 0) ? destData.tips : curated.tips,
        };
      }
    }

    const attractions = (destData?.attractions || []).map(a => (typeof a === 'string' ? a : a.name));
    const food = (destData?.foodRecommendations || []).map(f => (typeof f === 'string' ? f : f.name));
    const activities = (destData?.activities || []).map(act => (typeof act === 'string' ? act : act.name));
    const hiddenGems = (destData?.hiddenGems || []).map(g => (typeof g === 'string' ? g : g.name));

    const attractionsStr = attractions.join(", ");
    const foodStr = food.join(", ");

    const prompt = `You are an expert Indian travel planner.
Regenerate a rich, authentic, and non-generic alternative Day ${dayNumber} of a ${totalDays || 1}-day travel itinerary for "${targetPlace}, India".
Destination Attractions: ${attractionsStr || "Major cultural and scenic landmarks"}
Local Food Specialities: ${foodStr || "Authentic regional dishes"}

CRITICAL AUTHENTICITY RULES:
1. Do NOT output generic placeholders or filler (e.g. NEVER say "visit local market", "have traditional lunch", or "explore city center").
2. YOU MUST explicitly specify real, famous monument, fort, bazaar, and food names in ${targetPlace}.
3. Every placeName, lat, and lng must come directly from authentic destination landmark data.
4. Respond with ONLY valid JSON, no markdown code fences.

Shape:
{
  "day": ${dayNumber},
  ${city ? `"city": "${city}",` : ""}
  "title": "Specific day theme with real place names in ${targetPlace}",
  "activities": [
    {
      "time": "09:00",
      "placeName": "Real prominent landmark in ${targetPlace}",
      "activity": "Specific morning landmark activity with timing",
      "reason": "Why this fits the itinerary (1 concise sentence)",
      "estimatedDurationMinutes": 120,
      "lat": ${destData?.lat || destData?.coordinates?.lat || 0},
      "lng": ${destData?.lng || destData?.coordinates?.lng || 0}
    },
    {
      "time": "13:30",
      "placeName": "Real afternoon sight or artisan bazaar in ${targetPlace}",
      "activity": "Specific afternoon cultural or artisan discovery",
      "reason": "Why this fits the itinerary (1 concise sentence)",
      "estimatedDurationMinutes": 90,
      "lat": ${destData?.lat || destData?.coordinates?.lat || 0},
      "lng": ${destData?.lng || destData?.coordinates?.lng || 0}
    },
    {
      "time": "17:30",
      "placeName": "Real sunset or evening highlight in ${targetPlace}",
      "activity": "Specific sunset/night experience and dinner",
      "reason": "Why this fits the itinerary (1 concise sentence)",
      "estimatedDurationMinutes": 120,
      "lat": ${destData?.lat || destData?.coordinates?.lat || 0},
      "lng": ${destData?.lng || destData?.coordinates?.lng || 0}
    }
  ],
  "morning": "Specific morning landmark activity with timing",
  "afternoon": "Specific afternoon sight, artisan market, and lunch recommendation",
  "evening": "Specific sunset/night experience and dinner",
  "meals": "Named authentic local dishes in ${targetPlace}",
  "estimatedBudgetINR": "₹2,500 - ₹4,000",
  "tips": "Practical local tip unique to ${targetPlace}"
}`;

    let dayPlan = null;
    try {
      const cleaned = await callAI(prompt);
      dayPlan = JSON.parse(cleaned);
      if (dayPlan) {
        dayPlan.day = Number(dayNumber);
        if (city) dayPlan.city = city;
      }
    } catch (parseErr) {
      console.warn("AI generation failed for regenerateDay, using curated authentic fallback:", parseErr.message);
    }

    if (!dayPlan || !dayPlan.title) {
      const a1 = attractions[(dayNumber + 1) % (attractions.length || 1)] || `${targetPlace} Historic Landmark`;
      const a2 = attractions[(dayNumber + 2) % (attractions.length || 1)] || `${targetPlace} Artisan Bazaar`;
      const f1 = food[(dayNumber + 1) % (food.length || 1)] || `Authentic ${targetPlace} Cuisine`;
      const act = activities[(dayNumber + 1) % (activities.length || 1)] || `Guided walking tour through ${targetPlace} heritage quarters`;
      const gem = hiddenGems[(dayNumber + 1) % (hiddenGems.length || 1)] || `Scenic viewpoints of ${targetPlace}`;

      const fallbackLat = destData?.lat || destData?.coordinates?.lat || 0;
      const fallbackLng = destData?.lng || destData?.coordinates?.lng || 0;

      dayPlan = {
        day: Number(dayNumber),
        ...(city ? { city } : {}),
        title: `${a1}, ${a2} & Local Wonders`,
        activities: [
          {
            time: "09:00",
            placeName: a1,
            activity: `Start your day early at ${a1} to enjoy quiet morning light and architectural details.`,
            reason: `Great time for calm exploration and photography in ${targetPlace}.`,
            estimatedDurationMinutes: 120,
            lat: fallbackLat,
            lng: fallbackLng,
          },
          {
            time: "13:30",
            placeName: a2,
            activity: `Afternoon visit to ${a2} and local craft spots after savoring ${f1}.`,
            reason: `Experience local crafts and regional gastronomy.`,
            estimatedDurationMinutes: 90,
            lat: fallbackLat,
            lng: fallbackLng,
          },
          {
            time: "17:30",
            placeName: act || gem,
            activity: `Experience ${act} around ${gem} followed by traditional dinner.`,
            reason: `Perfect evening sunset and regional dinner.`,
            estimatedDurationMinutes: 120,
            lat: fallbackLat,
            lng: fallbackLng,
          },
        ],
        morning: `Start your day at ${a1} early in the morning to beat crowds and enjoy serene morning light.`,
        afternoon: `Enjoy lunch savoring ${f1}, then discover local art and architecture around ${a2}.`,
        evening: `Experience ${act}, followed by sunset vistas near ${gem} and traditional dinner.`,
        meals: `${f1} & regional culinary delights`,
        estimatedBudgetINR: "₹2,000 - ₹3,500",
        tips: destData?.tips?.[0]?.desc || destData?.tips?.[0] || `Engage with licensed local guides for deeper storytelling in ${targetPlace}.`,
      };
    }

    if (dayPlan && Array.isArray(dayPlan.activities) && dayPlan.activities.length > 1) {
      for (let i = 1; i < dayPlan.activities.length; i++) {
        const prev = dayPlan.activities[i - 1];
        const curr = dayPlan.activities[i];
        if (prev && curr && prev.lat && prev.lng && curr.lat && curr.lng) {
          const route = await getRouteDuration(prev.lat, prev.lng, curr.lat, curr.lng);
          if (route) {
            curr.travelFromPrevious = route;
          }
          await delay(120);
        }
      }
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
