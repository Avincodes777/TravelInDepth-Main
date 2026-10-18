import Destination from "../models/Destination.js";
import {
  getDestinationCoordinates,
  searchNearbyPlaces,
  getPlaceDetails,
  mapInterestsToCategories,
} from "../services/placesService.js";
import { getRouteDuration } from "../services/routingService.js";
import { getCuratedDestination } from "../services/destinationKnowledge.js";

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
        await delay(120);
      }
    }
  }

  return days;
}

const GEMINI_API_MODELS = [
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
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
    const activitiesStr = (destData.activities || []).map((act) => act.name || act).join(", ");
    const gemsStr = (destData.hiddenGems || []).map((g) => g.name || g).join(", ");
    const tipsStr = (destData.tips || []).map((t) => t.desc || t).join(" ");

    contextSnippet = `
AUTHENTIC DESTINATION KNOWLEDGE FOR ${destination}:
- State / Region: ${destData.state || "India"}, ${destData.region || "India"}
- Real Iconic Landmarks & Attractions: ${attractionsStr || "Prominent cultural landmarks"}
- Signature Local Cuisines & Eateries: ${foodStr || "Authentic regional culinary dishes"}
- Real Activities & Cultural Experiences: ${activitiesStr || "Guided heritage and nature explorations"}
- Authentic Offbeat Spots: ${gemsStr || "Quaint courtyard spots and heritage quarters"}
- Insider Tips: ${tipsStr || "Engage with licensed local guides and respect temple customs"}
`;
  }

  let placesSnippet = "";
  if (realPlaces && realPlaces.length > 0) {
    placesSnippet = `
VERIFIED REAL ATTRACTION & PLACE DATA FOR ${destination} (FROM GEOLOCATION & GEODATABASE):
${JSON.stringify(realPlaces.slice(0, 15), null, 2)}
`;
  }

  return `
You are a top-tier Indian travel connoisseur and bespoke trip planner.
Generate a comprehensive, non-generic, deeply authentic ${days}-day itinerary specifically for "${destination}, India".

CRITICAL AUTHENTICITY MANDATES:
1. NEVER USE GENERIC FILLER OR PLACEHOLDERS. Do NOT say "visit local market", "have traditional lunch", "explore city center", or "heritage walk".
2. YOU MUST NAME REAL, FAMOUS, SPECIFIC PLACES, MONUMENTS, TEMPLES, GHATS, FORTS, BAZAARS, CAFES, AND STREET FOODS SPECIFIC TO "${destination}".
3. Every single placeName, lat, and lng MUST be grounded in real geography for "${destination}". If real place data is provided below, prioritize those verified landmarks and coordinates.
4. Each activity MUST have an insightful, concrete "reason" explaining why it matches the traveler's pacing and interests.
${contextSnippet}
${placesSnippet}
5. Tailor the itinerary to:
   - Budget Tier: ${budget || "mid-range"}
   - Traveler Interests: ${interests || "sightseeing, food, culture"}
   - Travel Style: ${travelStyle || "balanced"}

Respond with ONLY valid JSON without markdown code fences in this exact shape:
{
  "destination": "${destination}",
  "days": [
    {
      "day": 1,
      "title": "Specific day theme featuring real landmarks in ${destination}",
      "activities": [
        {
          "time": "09:00",
          "placeName": "Real prominent landmark in ${destination}",
          "activity": "Detailed morning activity description with specific architecture or cultural focus",
          "reason": "Why this landmark is essential for the traveler's interests (1 concise sentence)",
          "estimatedDurationMinutes": 120,
          "lat": 0.0,
          "lng": 0.0
        },
        {
          "time": "13:30",
          "placeName": "Real afternoon sight, bazaar, or heritage eatery in ${destination}",
          "activity": "Afternoon exploration of craftsmanship, cuisine, or museum exhibits",
          "reason": "Why this fits the user's travel style (1 concise sentence)",
          "estimatedDurationMinutes": 90,
          "lat": 0.0,
          "lng": 0.0
        },
        {
          "time": "17:30",
          "placeName": "Real sunset viewpoint, evening ghat, or cultural show in ${destination}",
          "activity": "Sunset vistas, evening aarti, folk dance, or night market discovery",
          "reason": "Why this creates a memorable evening experience (1 concise sentence)",
          "estimatedDurationMinutes": 120,
          "lat": 0.0,
          "lng": 0.0
        }
      ],
      "morning": "Detailed morning landmark activity with timing",
      "afternoon": "Detailed afternoon sight, artisan market, and named lunch spot",
      "evening": "Detailed sunset/night experience, cultural show, and dinner",
      "meals": "Named authentic local dishes and signature eateries in ${destination}",
      "estimatedBudgetINR": "e.g. ₹2,500 - ₹3,800",
      "tips": "Practical local insider tip unique to ${destination}"
    }
  ]
}
Include exactly ${days} entries in "days" array numbered 1 to ${days}. Ensure all descriptions are vivid, authentic, and grounded in real ${destination} heritage.`;
};

const generateCuratedSingleFallback = ({ destination, days, budget, travelStyle, destData, realPlaces = [] }) => {
  // 1. Gather curated real attractions
  const dbAttractions = (destData?.attractions || []).map((a) => ({
    name: a.name,
    lat: a.lat || destData?.lat || destData?.coordinates?.lat || 0,
    lng: a.lng || destData?.lng || destData?.coordinates?.lng || 0,
    category: "attraction",
    reason: a.reason || `Prime historic landmark in ${destination}.`,
    time: a.time,
    duration: a.duration || 120,
  }));

  const placesList = dbAttractions.length > 0 ? dbAttractions : realPlaces;

  // Curated food and gems
  const food = (destData?.foodRecommendations || []).map((f) => (typeof f === "string" ? f : f.name));
  const hiddenGems = (destData?.hiddenGems || []).map((g) => (typeof g === "string" ? g : g.name));
  const tipsList = (destData?.tips || []).map((t) => (typeof t === "string" ? t : t.desc || t.title));
  const activitiesList = (destData?.activities || []).map((act) => (typeof act === "string" ? act : act.name));

  const fallbackLat = destData?.lat || destData?.coordinates?.lat || (realPlaces[0]?.lat) || 26.9124;
  const fallbackLng = destData?.lng || destData?.coordinates?.lng || (realPlaces[0]?.lng) || 75.7873;

  const generatedDays = [];
  for (let i = 0; i < days; i++) {
    const dayNum = i + 1;

    // Pick 3 distinct real places for the day
    let p1 = placesList[i % (placesList.length || 1)];
    let p2 = placesList[(i + 1) % (placesList.length || 1)];
    let p3 = placesList[(i + 2) % (placesList.length || 1)];

    if (!p1 || !p1.name) p1 = { name: `${destination} Heritage Promenade`, lat: fallbackLat, lng: fallbackLng, duration: 120 };
    if (!p2 || !p2.name) p2 = { name: `${destination} Traditional Bazaar`, lat: fallbackLat, lng: fallbackLng, duration: 90 };
    if (!p3 || !p3.name) p3 = { name: `${destination} Sunset Point`, lat: fallbackLat, lng: fallbackLng, duration: 120 };

    const f1 = food[i % (food.length || 1)] || `Authentic regional ${destination} specialties`;
    const gem = hiddenGems[i % (hiddenGems.length || 1)] || `${destination} old quarter artisan trails`;
    const act = activitiesList[i % (activitiesList.length || 1)] || `Heritage architectural exploration in ${destination}`;
    const tip = tipsList[i % (tipsList.length || 1)] || `Engage with licensed local guides for deep cultural storytelling in ${destination}.`;

    const title = `${p1.name}, ${p2.name} & ${p3.name}`;
    const morning = `Begin early with a guided exploration of ${p1.name} to beat crowds and capture soft morning lighting.`;
    const afternoon = `Savor authentic regional dishes featuring ${f1} for lunch, followed by cultural immersion at ${p2.name}.`;
    const evening = `Experience golden-hour atmosphere around ${p3.name}, followed by tea and traditional dining near ${gem}.`;
    const meals = `${f1}, local breakfast delicacies & traditional dinner`;

    const activities = [
      {
        time: "09:00",
        placeName: p1.name,
        activity: `Morning exploration of ${p1.name} with architectural tour.`,
        reason: p1.reason || `Prime morning heritage landmark in ${destination}.`,
        estimatedDurationMinutes: p1.duration || 120,
        lat: p1.lat || fallbackLat,
        lng: p1.lng || p1.lon || fallbackLng,
      },
      {
        time: "13:30",
        placeName: p2.name,
        activity: `Afternoon visit to ${p2.name} following a lunch featuring ${f1}.`,
        reason: p2.reason || `Vibrant artisan and cultural discovery in ${destination}.`,
        estimatedDurationMinutes: p2.duration || 90,
        lat: p2.lat || fallbackLat,
        lng: p2.lng || p2.lon || fallbackLng,
      },
      {
        time: "17:30",
        placeName: p3.name,
        activity: `Sunset viewpoint and vibrant evening atmosphere around ${p3.name}.`,
        reason: p3.reason || `Scenic golden-hour vistas and cultural dining in ${destination}.`,
        estimatedDurationMinutes: p3.duration || 120,
        lat: p3.lat || fallbackLat,
        lng: p3.lng || p3.lon || fallbackLng,
      },
    ];

    generatedDays.push({
      day: dayNum,
      title,
      activities,
      morning,
      afternoon,
      evening,
      meals,
      estimatedBudgetINR:
        budget === "budget" ? "₹1,500 - ₹2,500" : budget === "luxury" ? "₹8,000 - ₹16,000" : "₹3,500 - ₹5,500",
      tips: tip,
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

    // 1. Fetch database destination knowledge & curated knowledge
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

    // Merge with curated authentic destination knowledge if DB has limited data
    const curated = getCuratedDestination(destination);
    if (curated) {
      if (!destRecord) {
        destRecord = curated;
      } else {
        destRecord = {
          ...curated,
          ...destRecord,
          attractions: (destRecord.attractions && destRecord.attractions.length > 0)
            ? destRecord.attractions
            : curated.attractions,
          foodRecommendations: (destRecord.foodRecommendations && destRecord.foodRecommendations.length > 0)
            ? destRecord.foodRecommendations
            : curated.foodRecommendations,
          activities: (destRecord.activities && destRecord.activities.length > 0)
            ? destRecord.activities
            : curated.activities,
          hiddenGems: (destRecord.hiddenGems && destRecord.hiddenGems.length > 0)
            ? destRecord.hiddenGems
            : curated.hiddenGems,
          tips: (destRecord.tips && destRecord.tips.length > 0)
            ? destRecord.tips
            : curated.tips,
        };
      }
    }

    // 2. Fetch real attraction data via OpenTripMap, Nominatim & Wikipedia GeoSearch
    let realPlaces = [];
    try {
      const coords = await getDestinationCoordinates(destination);
      if (coords && coords.lat && coords.lon) {
        const categories = mapInterestsToCategories(interests);
        
        const searchResults = await Promise.all(
          categories.map((cat) => searchNearbyPlaces(coords.lat, coords.lon, cat))
        );

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

        combinedPlaces.sort((a, b) => (b.rate || 0) - (a.rate || 0));
        const topPlaces = combinedPlaces.slice(0, 14);

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
              lat: raw?.point?.lat ?? coords.lat,
              lng: raw?.point?.lon ?? coords.lon,
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
      console.warn("No GEMINI_API_KEY found, serving curated authentic itinerary.");
      const curatedPlan = generateCuratedSingleFallback({ destination, days: numDays, budget, travelStyle, destData: destRecord, realPlaces });
      curatedPlan.days = await attachTravelTimesToDays(curatedPlan.days);
      return res.status(200).json(curatedPlan);
    }

    // Attempt generation with Gemini models
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
      const timeout = setTimeout(() => controller.abort(), 14000);

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
              maxOutputTokens: 4000,
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
          console.warn(`Gemini model (${modelUrl}) returned status ${response.status}`);
        }
      } catch (aiErr) {
        clearTimeout(timeout);
        console.warn(`Gemini model attempt failed on ${modelUrl}:`, aiErr.message);
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
    const destData = destRecords[destination.toLowerCase()] || getCuratedDestination(destination);
    if (destData) {
      const attractionsStr = (destData.attractions || []).map(a => a.name).join(", ");
      const foodStr = (destData.foodRecommendations || []).map(f => (typeof f === 'string' ? f : f.name)).join(", ");
      const actsStr = (destData.activities || []).map(act => (typeof act === 'string' ? act : act.name)).join(", ");
      contextBlocks += `
REAL DESTINATION DATA FOR ${destination}:
- Real Landmarks & Forts: ${attractionsStr || "Major historic monuments"}
- Real Local Cuisine: ${foodStr || "Authentic local dishes"}
- Signature Activities: ${actsStr || "Heritage and cultural tours"}
`;
    }
  });

  return `
You are an expert Indian travel planner creating a bespoke ${totalDays}-day sequential multi-city journey across India.
Cities Sequence: ${citySummary}.
Budget Tier: ${budget || "mid-range"}.
Traveler Interests: ${interests || "sightseeing, food, culture"}.
Style: ${travelStyle || "balanced"}.

${contextBlocks}

CRITICAL AUTHENTICITY MANDATES:
1. NEVER USE GENERIC FILLER. Do NOT say "visit local market", "have traditional lunch", or "explore city center".
2. YOU MUST use real, specific, famous landmark names, heritage forts, temples, markets, and regional street foods for each designated city.
3. Every placeName, lat, and lng must come directly from real geographic data for each designated city.
4. On the first day of arriving in each new city (from city 2 onward), explicitly include a realistic transit note (e.g. Vande Bharat Express / short flight / private expressway cab), hotel check-in, and relaxed evening sights in that city.
5. Every day MUST have the exact "city" field corresponding to that leg of the trip.
6. Keep day numbers sequentially 1 to ${totalDays}.

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
Include exactly ${totalDays} entries in the "days" array. Keep descriptions crisp, authentic, and inspiring.`;
};

const generateCuratedMultiFallback = ({ cities, budget, destRecords = {} }) => {
  const cityNames = cities.map(c => c.destination);
  const totalDays = cities.reduce((sum, c) => sum + c.days, 0);

  const days = [];
  let dayNum = 1;

  cities.forEach((cityObj, cityIdx) => {
    const currentCity = cityObj.destination;
    const prevCity = cityIdx > 0 ? cities[cityIdx - 1].destination : "";
    const destData = destRecords[currentCity.toLowerCase()] || getCuratedDestination(currentCity);

    const attractions = destData?.attractions || [];
    const food = destData?.foodRecommendations || [];
    const activitiesList = destData?.activities || [];
    const gems = destData?.hiddenGems || [];
    const fallbackLat = destData?.lat || destData?.coordinates?.lat || 26.9124;
    const fallbackLng = destData?.lng || destData?.coordinates?.lng || 75.7873;

    for (let d = 0; d < cityObj.days; d++) {
      const isTransitionDay = cityIdx > 0 && d === 0;

      const a1 = (typeof attractions[d % (attractions.length || 1)] === 'object' ? attractions[d % (attractions.length || 1)]?.name : attractions[d % (attractions.length || 1)]);
      const a2 = (typeof attractions[(d + 1) % (attractions.length || 1)] === 'object' ? attractions[(d + 1) % (attractions.length || 1)]?.name : attractions[(d + 1) % (attractions.length || 1)]);
      const f1 = (typeof food[d % (food.length || 1)] === 'object' ? food[d % (food.length || 1)]?.name : food[d % (food.length || 1)]);
      const act = (typeof activitiesList[d % (activitiesList.length || 1)] === 'object' ? activitiesList[d % (activitiesList.length || 1)]?.name : activitiesList[d % (activitiesList.length || 1)]);
      const gem = (typeof gems[d % (gems.length || 1)] === 'object' ? gems[d % (gems.length || 1)]?.name : gems[d % (gems.length || 1)]);

      const p1Name = a1 || `${currentCity} Heritage Landmark`;
      const p2Name = a2 || `${currentCity} Traditional Market`;
      const p3Name = act || gem || `${currentCity} Sunset Point`;

      const dayActivities = [
        {
          time: "09:00",
          placeName: isTransitionDay ? `${prevCity} Station / Departure` : p1Name,
          activity: isTransitionDay
            ? `Morning departure from ${prevCity}; scenic transit to ${currentCity}.`
            : `Morning exploration of ${p1Name} to enjoy serene sightseeing.`,
          reason: `Optimal start for smooth transit and morning photography.`,
          estimatedDurationMinutes: isTransitionDay ? 180 : 120,
          lat: fallbackLat,
          lng: fallbackLng,
        },
        {
          time: "13:30",
          placeName: p2Name,
          activity: isTransitionDay
            ? `Arrive in ${currentCity}, hotel check-in, and local lunch featuring ${f1 || 'regional cuisine'}.`
            : `Afternoon culinary and craft walk around ${p2Name}.`,
          reason: `Experience authentic local cuisine and traditional markets.`,
          estimatedDurationMinutes: 90,
          lat: fallbackLat,
          lng: fallbackLng,
        },
        {
          time: "17:30",
          placeName: p3Name,
          activity: isTransitionDay
            ? `Golden-hour walk along ${currentCity}'s central promenade and welcome dinner.`
            : `Sunset vista near ${p3Name} followed by evening cultural dinner.`,
          reason: `Perfect evening wind-down in ${currentCity}.`,
          estimatedDurationMinutes: 120,
          lat: fallbackLat,
          lng: fallbackLng,
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

    const totalDays = sanitizedCities.reduce((sum, c) => sum + c.days, 0);
    if (totalDays > 21) {
      return res.status(400).json({
        message: `Combined trip duration of ${totalDays} days exceeds the maximum allowed limit of 21 days.`,
      });
    }

    // Fetch destination documents from MongoDB and curated knowledge for grounding
    const cityQueryNames = sanitizedCities.map((c) => c.destination);
    let destDocs = [];
    try {
      destDocs = await Destination.find({
        $or: [
          { name: { $in: cityQueryNames.map((name) => new RegExp(`^${name}$`, "i")) } },
          { slug: { $in: cityQueryNames.map((name) => name.toLowerCase()) } },
        ],
      }).lean();
    } catch (dbErr) {
      console.warn("DB multi-city lookup warning:", dbErr.message);
    }

    const destRecords = {};
    destDocs.forEach((doc) => {
      destRecords[doc.name.toLowerCase()] = doc;
      destRecords[doc.slug.toLowerCase()] = doc;
    });

    sanitizedCities.forEach((c) => {
      const lower = c.destination.toLowerCase();
      if (!destRecords[lower]) {
        const curated = getCuratedDestination(c.destination);
        if (curated) {
          destRecords[lower] = curated;
        }
      }
    });

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("No GEMINI_API_KEY configured, returning curated multi-city plan.");
      const fallback = generateCuratedMultiFallback({ cities: sanitizedCities, budget, destRecords });
      fallback.days = await attachTravelTimesToDays(fallback.days);
      return res.status(200).json(fallback);
    }

    const promptText = buildMultiCityPrompt({ cities: sanitizedCities, budget, interests, travelStyle, destRecords });

    for (const modelUrl of GEMINI_API_MODELS) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 16000);

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
          console.warn(`Gemini model ${modelUrl} returned status ${response.status} in multi-city generator`);
        }
      } catch (aiErr) {
        clearTimeout(timeout);
        console.warn(`Gemini model attempt failed on ${modelUrl}:`, aiErr.message);
      }
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