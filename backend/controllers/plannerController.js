import Destination from "../models/Destination.js";
import {
  getDestinationCoordinates,
  searchNearbyPlaces,
  getPlaceDetails,
  mapInterestsToCategories,
} from "../services/placesService.js";
import { getRouteDuration } from "../services/routingService.js";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Enriches days activities with sequential travel calculations from previous activity
 */
async function attachTravelTimesToDays(days) {
  if (!Array.isArray(days)) return days;

  for (const day of days) {
    if (!Array.isArray(day?.activities) || day.activities.length < 2) continue;

    for (let i = 1; i < day.activities.length; i++) {
      const prev = day.activities[i - 1];
      const curr = day.activities[i];

      if (prev && curr && prev.lat && prev.lng && curr.lat && curr.lng) {
        const route = await getRouteDuration(prev.lat, prev.lng, curr.lat, curr.lng);
        if (route) {
          curr.travelFromPrevious = route;
        }
        // Sequential fair-use delay of 120ms
        await delay(120);
      }
    }
  }

  return days;
}

const GEMINI_API_MODELS = [
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
];

/* ─── SINGLE-CITY PROMPT & CURATED FALLBACK ─── */
const buildSingleCityPrompt = ({
  destination,
  days,
  budget,
  interests,
  travelStyle,
  destData,
  realPlaces = [],
}) => {
  let contextSnippet = "";
  if (destData) {
    const attractionsStr = (destData.attractions || []).map((a) => a.name).join(", ");
    const foodStr = (destData.foodRecommendations || []).map((f) => f.name).join(", ");
    const activitiesStr = (destData.activities || []).map((act) => act.name).join(", ");
    const gemsStr = (destData.hiddenGems || []).map((g) => g.name).join(", ");

    contextSnippet = `
DESTINATION KNOWLEDGE FOR ${destination}:
- State / Region: ${destData.state || ""}, ${destData.region || ""}
- Famous Landmarks & Attractions: ${attractionsStr || "Major cultural landmarks"}
- Local Cuisines & Specialities: ${foodStr || "Authentic local dishes"}
- Top Activities & Experiences: ${activitiesStr || "Guided heritage and nature walks"}
- Hidden Gems / Offbeat Spots: ${gemsStr || "Quaint courtyard spots and local quarters"}
`;
  }

  let placesSnippet = "";
  let placesRule = "";

  if (realPlaces && realPlaces.length > 0) {
    placesSnippet = `
VERIFIED REAL ATTRACTION & PLACE DATA FOR ${destination} (FROM GEOLOCATION & GEODATABASE):
${JSON.stringify(realPlaces, null, 2)}
`;
    placesRule = `
CRITICAL ATTRACTION GROUNDING RULE:
You may only recommend attractions from the supplied place data below. Every placeName, lat, and lng must come directly from the supplied place data — never invented. Do not invent place names, coordinates, addresses, or facts not present in the data. If the data doesn't cover something relevant to the user's interests, say so rather than inventing a plausible-sounding place.
`;
  }

  return `
You are a deeply knowledgeable Indian travel expert and itinerary planner.
Create an authentic, non-generic, highly realistic ${days}-day itinerary specifically for "${destination}, India".

CRITICAL INSTRUCTIONS:
1. DO NOT give generic advice. YOU MUST explicitly name real, authentic, specific monuments, ghats, forts, temples, markets, bazaars, cafes, and street food dishes found in "${destination}".
2. Every placeName, lat, and lng MUST come directly from the supplied place data — never invented.
${placesRule}
${contextSnippet}
${placesSnippet}
3. Tailor the activities to:
   - Budget Tier: ${budget || "mid-range"}
   - Traveler Interests: ${interests || "sightseeing, food, culture"}
   - Travel Style: ${travelStyle || "balanced"}

Respond with ONLY valid JSON without markdown code fences in this exact shape:
{
  "destination": "${destination}",
  "days": [
    {
      "day": 1,
      "title": "Specific day theme with real place names in ${destination}",
      "activities": [
        {
          "time": "09:00",
          "placeName": "Exact name from supplied place data or prominent destination landmark",
          "activity": "Specific activity description and morning exploration details",
          "reason": "Why this fits the user's interests (1 concise sentence)",
          "estimatedDurationMinutes": 120,
          "lat": 0.0,
          "lng": 0.0
        },
        {
          "time": "13:30",
          "placeName": "Exact name from supplied place data or prominent food/artisan landmark",
          "activity": "Afternoon cultural, culinary, or artisan exploration details",
          "reason": "Why this fits the user's interests (1 concise sentence)",
          "estimatedDurationMinutes": 90,
          "lat": 0.0,
          "lng": 0.0
        },
        {
          "time": "17:30",
          "placeName": "Exact name from supplied place data or scenic evening spot",
          "activity": "Sunset vistas, cultural show, or evening bazaar walk",
          "reason": "Why this fits the user's interests (1 concise sentence)",
          "estimatedDurationMinutes": 120,
          "lat": 0.0,
          "lng": 0.0
        }
      ],
      "morning": "Specific morning landmark activity with timing",
      "afternoon": "Specific afternoon sight, artisan market, and lunch recommendation",
      "evening": "Specific sunset/night experience and dinner",
      "meals": "Named authentic local dishes and recommended food spots in ${destination}",
      "estimatedBudgetINR": "e.g. ₹2,500 - ₹3,800",
      "tips": "Specific insider tip unique to ${destination}"
    }
  ]
}
Include exactly ${days} entries in "days" array numbered 1 to ${days}. Keep descriptions vivid, accurate, and grounded in real coordinates.`;
};

const generateCuratedSingleFallback = ({ destination, days, budget, travelStyle, destData, realPlaces = [] }) => {
  // Extract verified real place names and coordinates
  const dbAttractions = (destData?.attractions || []).map((a) => ({
    name: a.name,
    lat: destData?.coordinates?.lat || 0,
    lng: destData?.coordinates?.lng || 0,
    category: "attraction",
  }));

  const placesList = realPlaces.length > 0 ? realPlaces : dbAttractions;
  const food = (destData?.foodRecommendations || []).map((f) => f.name);
  const hiddenGems = (destData?.hiddenGems || []).map((g) => g.name);

  const generatedDays = [];
  for (let i = 0; i < days; i++) {
    const dayNum = i + 1;
    const p1 = placesList[i % (placesList.length || 1)] || { name: `${destination} Heritage Center`, lat: 0, lng: 0 };
    const p2 = placesList[(i + 1) % (placesList.length || 1)] || { name: `${destination} Promenade`, lat: 0, lng: 0 };
    const p3 = placesList[(i + 2) % (placesList.length || 1)] || { name: `${destination} Cultural Quarter`, lat: 0, lng: 0 };

    const f1 = food[i % (food.length || 1)] || `Authentic ${destination} Delicacies`;
    const gem = hiddenGems[i % (hiddenGems.length || 1)] || `Scenic quarters of ${destination}`;

    const title = `${p1.name}, ${p2.name} & Local Quarters`;
    const morning = `Start your morning exploring ${p1.name} early to beat the crowds and capture scenic sunrise lighting.`;
    const afternoon = `Savor authentic cuisine featuring ${f1} for lunch, followed by a visit to ${p2.name} to observe local craftsmanship and architecture.`;
    const evening = `Experience evening cultural discovery around ${p3.name}, followed by tea and traditional dining near ${gem}.`;
    const meals = `${f1}, local morning specialties & regional dinner`;

    const activities = [
      {
        time: "09:00",
        placeName: p1.name,
        activity: `Morning guided exploration of ${p1.name} with architecture walk.`,
        reason: `Ideal for experiencing ${destination}'s signature heritage at optimal morning lighting.`,
        estimatedDurationMinutes: 120,
        lat: p1.lat || 0,
        lng: p1.lng || p1.lon || 0,
      },
      {
        time: "13:30",
        placeName: p2.name,
        activity: `Afternoon visit to ${p2.name} and local craft centers following a regional lunch.`,
        reason: `Provides an immersive look into regional artistry and local traditions.`,
        estimatedDurationMinutes: 90,
        lat: p2.lat || 0,
        lng: p2.lng || p2.lon || 0,
      },
      {
        time: "17:30",
        placeName: p3.name,
        activity: `Sunset viewpoint and vibrant bazaar walk around ${p3.name}.`,
        reason: `Offers picturesque dusk vistas and vibrant street atmosphere.`,
        estimatedDurationMinutes: 120,
        lat: p3.lat || 0,
        lng: p3.lng || p3.lon || 0,
      },
    ];

    const tips = destData?.tips?.[i % (destData.tips?.length || 1)]?.desc || `Hire a licensed local storyteller or walking guide for deeper insights in ${destination}.`;

    generatedDays.push({
      day: dayNum,
      title,
      activities,
      morning,
      afternoon,
      evening,
      meals,
      estimatedBudgetINR:
        budget === "budget" ? "₹1,200 - ₹2,000" : budget === "luxury" ? "₹8,000 - ₹15,000" : "₹3,000 - ₹5,000",
      tips,
    });
  }

  return {
    destination,
    days: generatedDays,
    isFallback: true,
  };
};

/* ─── 1. SINGLE CITY GENERATE (POST /api/planner/generate) ─── */
export const generateItinerary = async (req, res) => {
  try {
    const body = req.body || {};
    const { destination, days, budget, interests, travelStyle } = body;

    if (!destination || !days) {
      return res.status(400).json({ message: "destination and days are required" });
    }
    const numDays = Math.min(14, Math.max(1, parseInt(days, 10)));

    // 1. Fetch database destination knowledge if available
    let destRecord = null;
    try {
      const mongoose = (await import("mongoose")).default;
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        destRecord = await Destination.findOne({
          $or: [
            { name: new RegExp(`^${destination.trim()}$`, "i") },
            { slug: destination.trim().toLowerCase() },
          ],
        }).lean();
      }
    } catch (dbErr) {
      console.warn("DB lookup warning in planner:", dbErr.message);
    }

    // 2. Fetch real attraction data via OpenTripMap, Nominatim & Wikipedia GeoSearch
    let realPlaces = [];
    try {
      const coords = await getDestinationCoordinates(destination);
      if (coords && coords.lat && coords.lon) {
        const categories = mapInterestsToCategories(interests);
        
        // Run radius searches concurrently based on user's interests
        const searchResults = await Promise.all(
          categories.map((cat) => searchNearbyPlaces(coords.lat, coords.lon, cat))
        );

        // Deduplicate nearby places by xid and normalized name
        const seenXids = new Set();
        const seenNames = new Set();
        const combinedPlaces = [];

        for (const list of searchResults) {
          for (const item of list) {
            const normName = item.name.toLowerCase();
            if (!seenXids.has(item.xid) && !seenNames.has(normName)) {
              seenXids.add(item.xid);
              seenNames.add(normName);
              combinedPlaces.push(item);
            }
          }
        }

        // Sort by popularity / rate descending
        combinedPlaces.sort((a, b) => (b.rate || 0) - (a.rate || 0));

        // Cap at top 14 places
        const topPlaces = combinedPlaces.slice(0, 14);

        // Fetch rich place details in parallel
        const detailPromises = topPlaces.map(async (p) => {
          const details = await getPlaceDetails(p.xid);
          if (details) {
            return {
              name: details.name || p.name,
              category: p.kinds,
              address: details.address || undefined,
              description: details.description || undefined,
              wikipedia: details.wikipedia || undefined,
            };
          }
          return {
            name: p.name,
            category: p.kinds,
          };
        });

        const resolvedDetails = await Promise.all(detailPromises);
        realPlaces = resolvedDetails
          .map((details, idx) => {
            const raw = topPlaces[idx];
            if (!details || !details.name) return null;
            return {
              ...details,
              lat: raw?.point?.lat ?? 0,
              lng: raw?.point?.lon ?? 0,
            };
          })
          .filter(Boolean);
      }
    } catch (placesErr) {
      console.warn("Place search notice:", placesErr.message);
      realPlaces = [];
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found, serving curated single-city itinerary.");
      return res.status(200).json(generateCuratedSingleFallback({ destination, days: numDays, budget, travelStyle, destData: destRecord, realPlaces }));
    }

    // Attempt generation with Gemini models with resilience fallback
    const promptText = buildSingleCityPrompt({
      destination,
      days: numDays,
      budget,
      interests,
      travelStyle,
      destData: destRecord,
      realPlaces,
    });

    for (const modelUrl of GEMINI_API_MODELS) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

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
                parts: [{ text: promptText }],
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
          const parsed = JSON.parse(cleaned);
          if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
            parsed.days = await attachTravelTimesToDays(parsed.days);
            return res.status(200).json(parsed);
          }
        } else {
          const errStatus = response.status;
          console.warn(`Gemini model (${modelUrl}) returned status ${errStatus}`);
        }
      } catch (aiErr) {
        clearTimeout(timeout);
        console.warn(`Gemini model attempt failed: ${aiErr.message}`);
      }
    }

    // Curated grounded fallback using real place names if AI is unreachable
    const fallbackPlan = generateCuratedSingleFallback({ destination, days: numDays, budget, travelStyle, destData: destRecord, realPlaces });
    fallbackPlan.days = await attachTravelTimesToDays(fallbackPlan.days);
    return res.status(200).json(fallbackPlan);
  } catch (err) {
    console.error("Planner generation failed:", err.message);
    res.status(500).json({ message: "Failed to generate itinerary", error: err.message });
  }
};


/* ─── MULTI-CITY PROMPT & CURATED FALLBACK ─── */
const buildMultiCityPrompt = ({ cities, budget, interests, travelStyle, destRecords = {} }) => {
  const citySummary = cities.map((c, idx) => `${idx + 1}. ${c.destination} (${c.days} days)`).join(", ");
  const totalDays = cities.reduce((sum, c) => sum + c.days, 0);

  let contextBlocks = "";
  cities.forEach(({ destination }) => {
    const destData = destRecords[destination.toLowerCase()];
    if (destData) {
      const attractionsStr = (destData.attractions || []).map(a => a.name).join(", ");
      const foodStr = (destData.foodRecommendations || []).map(f => f.name).join(", ");
      const actsStr = (destData.activities || []).map(act => act.name).join(", ");
      contextBlocks += `
FACTUAL KNOWLEDGE FOR ${destination}:
- Major Monuments/Attractions: ${attractionsStr || "Prominent historic landmarks"}
- Local Dishes: ${foodStr || "Local food specialties"}
- Signature Activities: ${actsStr || "Heritage and cultural tours"}
`;
    }
  });

  return `
You are an expert Indian travel planner. Create an authentic, highly detailed, non-generic ${totalDays}-day sequential multi-city travel itinerary across India.
Cities Sequence: ${citySummary}.
Budget Tier: ${budget || "mid-range"}.
Traveler Interests: ${interests || "sightseeing, food, culture"}.
Style: ${travelStyle || "balanced"}.

${contextBlocks}

CRITICAL RULES:
1. DO NOT give generic placeholders. Use real, specific, famous landmark names, heritage forts, temples, markets, and regional street foods for each designated city.
2. Every placeName, lat, and lng must come directly from real geographic data for each designated city — never invented.
3. On the first day of arriving in each new city (from city 2 onward), explicitly include a realistic transit note (e.g. Vande Bharat train / short flight / private expressway cab), hotel check-in, and relaxed evening sights in that city.
4. Every day MUST have the exact "city" field corresponding to that leg of the trip.
5. Keep day numbers sequentially 1 to ${totalDays}.

Respond with ONLY valid JSON without markdown fences formatted strictly as:
{
  "cities": ${JSON.stringify(cities.map(c => c.destination))},
  "totalDays": ${totalDays},
  "days": [
    {
      "day": 1,
      "city": "${cities[0].destination}",
      "title": "Specific day theme with real place names in ${cities[0].destination}",
      "activities": [
        {
          "time": "09:00",
          "placeName": "Real prominent landmark in ${cities[0].destination}",
          "activity": "Specific morning activity and exploration",
          "reason": "Why this fits the user's interests (1 concise sentence)",
          "estimatedDurationMinutes": 120,
          "lat": 0.0,
          "lng": 0.0
        },
        {
          "time": "13:30",
          "placeName": "Real afternoon sight or market in ${cities[0].destination}",
          "activity": "Afternoon cultural or culinary activity",
          "reason": "Why this fits the user's interests (1 concise sentence)",
          "estimatedDurationMinutes": 90,
          "lat": 0.0,
          "lng": 0.0
        },
        {
          "time": "17:30",
          "placeName": "Real sunset or evening highlight in ${cities[0].destination}",
          "activity": "Evening sunset, bazaar walk, or dinner",
          "reason": "Why this fits the user's interests (1 concise sentence)",
          "estimatedDurationMinutes": 120,
          "lat": 0.0,
          "lng": 0.0
        }
      ],
      "morning": "Specific morning landmark and activity with timing",
      "afternoon": "Specific lunch recommendation, culinary specialty, and afternoon sight",
      "evening": "Specific sunset viewpoint, cultural show, ghat/bazaar walk, and dinner",
      "meals": "Named authentic local dishes of that city",
      "estimatedBudgetINR": "e.g. ₹2,500 - ₹4,000",
      "tips": "Practical advice or transit tip specific to that city"
    }
  ]
}
Important: Return exactly ${totalDays} entries in the "days" array. Keep descriptions crisp and inspiring.`;
};

const generateCuratedMultiFallback = ({ cities, budget, destRecords = {} }) => {
  const cityNames = cities.map(c => c.destination);
  const totalDays = cities.reduce((sum, c) => sum + c.days, 0);

  const days = [];
  let dayNum = 1;

  cities.forEach((cityObj, cityIdx) => {
    const currentCity = cityObj.destination;
    const prevCity = cityIdx > 0 ? cities[cityIdx - 1].destination : "";
    const destData = destRecords[currentCity.toLowerCase()];

    const attractions = destData?.attractions || [];
    const food = destData?.foodRecommendations || [];
    const activitiesList = destData?.activities || [];
    const gems = destData?.hiddenGems || [];

    for (let d = 0; d < cityObj.days; d++) {
      const isTransitionDay = cityIdx > 0 && d === 0;

      const a1 = attractions[d % (attractions.length || 1)]?.name;
      const a2 = attractions[(d + 1) % (attractions.length || 1)]?.name;
      const f1 = food[d % (food.length || 1)]?.name;
      const act = activitiesList[d % (activitiesList.length || 1)]?.name;
      const gem = gems[d % (gems.length || 1)]?.name;

      const p1Name = a1 || `${currentCity} Central Heritage`;
      const p2Name = a2 || `${currentCity} Artisan Bazaar`;
      const p3Name = act || gem || `${currentCity} Viewpoint`;

      const dayActivities = [
        {
          time: "09:00",
          placeName: isTransitionDay ? `${prevCity} Station / Departure` : p1Name,
          activity: isTransitionDay
            ? `Morning departure from ${prevCity}; scenic transit to ${currentCity}.`
            : `Morning exploration of ${p1Name} to enjoy quiet sightseeing.`,
          reason: `Optimal start for smooth transit and morning photography.`,
          estimatedDurationMinutes: isTransitionDay ? 180 : 120,
          lat: destData?.coordinates?.lat || 0,
          lng: destData?.coordinates?.lng || 0,
        },
        {
          time: "13:30",
          placeName: p2Name,
          activity: isTransitionDay
            ? `Arrive in ${currentCity}, hotel check-in, and local lunch.`
            : `Afternoon culinary and craft walk around ${p2Name}.`,
          reason: `Experience authentic local cuisine and traditional markets.`,
          estimatedDurationMinutes: 90,
          lat: destData?.coordinates?.lat || 0,
          lng: destData?.coordinates?.lng || 0,
        },
        {
          time: "17:30",
          placeName: p3Name,
          activity: isTransitionDay
            ? `Golden-hour walk along ${currentCity}'s central promenade and dinner.`
            : `Sunset vista near ${p3Name} followed by evening cultural dinner.`,
          reason: `Perfect evening wind-down in ${currentCity}.`,
          estimatedDurationMinutes: 120,
          lat: destData?.coordinates?.lat || 0,
          lng: destData?.coordinates?.lng || 0,
        },
      ];

      if (isTransitionDay) {
        days.push({
          day: dayNum,
          city: currentCity,
          title: `Transit from ${prevCity} to ${currentCity} & Evening Sights`,
          activities: dayActivities,
          morning: `Morning departure from ${prevCity}; scenic transit via train, expressway cab, or flight to ${currentCity}.`,
          afternoon: `Arrive in ${currentCity}, check in to your stay, refresh, and enjoy ${f1 ? `a lunch featuring ${f1}` : "authentic regional thali lunch"}.`,
          evening: `Golden-hour walk ${a1 ? `around ${a1}` : `along ${currentCity}'s central heritage promenade`} and welcome dinner.`,
          meals: `Transit snacks, ${f1 || "local specials"} & welcome dinner in ${currentCity}`,
          estimatedBudgetINR: budget === "budget" ? "₹2,000 - ₹3,500" : budget === "luxury" ? "₹10,000 - ₹20,000" : "₹4,500 - ₹7,000",
          tips: "Pre-book intercity transit tickets and keep digital hotel vouchers handy.",
        });
      } else {
        const title = a1 && a2 ? `${a1}, ${a2} & Heritage Trails` : a1 ? `${a1} & Highlights of ${currentCity}` : `Cultural Discovery of ${currentCity}`;
        const morning = a1
          ? `Begin your day early at ${a1} to beat the crowds and enjoy quiet morning photography.`
          : `Explore the prime historic landmarks and architectural center of ${currentCity}.`;
        const afternoon = f1
          ? `Savor ${f1} at a celebrated heritage eatery, then visit ${a2 || "traditional artisan markets"}.`
          : `Enjoy an authentic regional thali lunch followed by visiting artisan craft bazaars.`;
        const evening = act
          ? `Experience ${act}, followed by evening tea and local dining.`
          : gem
          ? `Discover ${gem} at golden hour, followed by night market exploration and dinner.`
          : `Scenic sunset viewpoint overlooking ${currentCity} with cultural folk dinner.`;

        days.push({
          day: dayNum,
          city: currentCity,
          title,
          activities: dayActivities,
          morning,
          afternoon,
          evening,
          meals: f1 ? `${f1} & authentic regional specialties` : `Authentic ${currentCity} regional delicacies & dinner`,
          estimatedBudgetINR: budget === "budget" ? "₹1,500 - ₹2,500" : budget === "luxury" ? "₹8,000 - ₹16,000" : "₹3,500 - ₹5,500",
          tips: destData?.tips?.[d % (destData.tips?.length || 1)]?.desc || `Carry small currency notes for local auto-rickshaws and craft shopping in ${currentCity}.`,
        });
      }
      dayNum++;
    }
  });

  return {
    cities: cityNames,
    totalDays,
    days,
    isFallback: true,
  };
};

/* ─── 2. MULTI-CITY GENERATE (POST /api/planner/generate-multi) ─── */
export const generateMultiCityItinerary = async (req, res) => {
  try {
    const { cities: rawCities, budget, interests, travelStyle } = req.body || {};

    if (!Array.isArray(rawCities) || rawCities.length === 0) {
      return res.status(400).json({
        message: "A non-empty 'cities' array is required. Example: [{ destination: 'Jaipur', days: 3 }, ...]",
      });
    }

    // Sanitize and validate each city item
    const sanitizedCities = rawCities
      .map((c) => {
        const destination = typeof c === "string" ? c.trim() : (c.destination || c.name || "").trim();
        const days = Math.min(14, Math.max(1, parseInt(c.days || 1, 10)));
        return { destination, days };
      })
      .filter((c) => c.destination.length > 0);

    if (sanitizedCities.length === 0) {
      return res.status(400).json({ message: "No valid city destinations provided." });
    }

    // Enforce overall combined days max limit (e.g. max 21 total days)
    const totalDays = sanitizedCities.reduce((sum, c) => sum + c.days, 0);
    if (totalDays > 21) {
      return res.status(400).json({
        message: `Combined trip duration of ${totalDays} days exceeds the maximum allowed limit of 21 days.`,
      });
    }

    // Fetch destination documents from MongoDB for grounding
    const cityQueryNames = sanitizedCities.map((c) => c.destination);
    const destDocs = await Destination.find({
      $or: [
        { name: { $in: cityQueryNames.map((name) => new RegExp(`^${name}$`, "i")) } },
        { slug: { $in: cityQueryNames.map((name) => name.toLowerCase()) } },
      ],
    });

    const destRecords = {};
    destDocs.forEach((doc) => {
      destRecords[doc.name.toLowerCase()] = doc;
      destRecords[doc.slug.toLowerCase()] = doc;
    });

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("No GEMINI_API_KEY configured, returning curated multi-city plan.");
      return res.status(200).json(generateCuratedMultiFallback({ cities: sanitizedCities, budget, destRecords }));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

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
              parts: [{ text: buildMultiCityPrompt({ cities: sanitizedCities, budget, interests, travelStyle, destRecords }) }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.5,
            maxOutputTokens: 5000,
          },
        }),
      });

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const cleaned = rawText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
          const enrichedDays = await attachTravelTimesToDays(parsed.days);
          const result = {
            cities: parsed.cities || sanitizedCities.map(c => c.destination),
            totalDays: parsed.totalDays || parsed.days.length,
            days: enrichedDays,
          };
          return res.status(200).json(result);
        }
      } else {
        const errText = await response.text();
        console.warn("Gemini API error in multi-city generator:", response.status, errText);
      }
    } catch (aiErr) {
      clearTimeout(timeout);
      console.warn("Gemini multi-city request timed out or failed:", aiErr.message);
    }

    // Seamless fallback using real destination knowledge
    const fallbackPlan = generateCuratedMultiFallback({ cities: sanitizedCities, budget, destRecords });
    fallbackPlan.days = await attachTravelTimesToDays(fallbackPlan.days);
    return res.status(200).json(fallbackPlan);
  } catch (err) {
    console.error("Multi-city planner generation error:", err.message);
    return res.status(500).json({
      message: "Failed to generate multi-city itinerary",
      error: err.message,
    });
  }
};