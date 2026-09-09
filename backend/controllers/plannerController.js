const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

/* ─── SINGLE-CITY PROMPT & CURATED FALLBACK ─── */
const buildSingleCityPrompt = ({ destination, days, budget, interests, travelStyle }) => `
You are an expert Indian travel planner. Create a realistic, high-quality ${days}-day itinerary for ${destination}, India.
Budget Tier: ${budget || "mid-range"}.
Traveler Interests: ${interests || "sightseeing, food, culture"}.
Style: ${travelStyle || "balanced"}.

Respond with ONLY valid JSON without markdown fences. Follow this structure:
{
  "destination": "${destination}",
  "days": [
    {
      "day": 1,
      "title": "short day theme (do not repeat 'Day 1:' in title, just theme like 'Iconic Landmarks & Heritage')",
      "morning": "specific activity at landmark with timing",
      "afternoon": "specific activity or market with lunch",
      "evening": "sunset/cultural experience and dinner",
      "meals": "authentic local delicacies recommendation",
      "estimatedBudgetINR": "e.g. ₹2,500",
      "tips": "practical local advice"
    }
  ]
}
Include exactly ${days} entries in "days" array numbered 1 to ${days}. Keep descriptions crisp.`;

const generateCuratedSingleFallback = ({ destination, days, budget, travelStyle }) => {
  const dayTemplates = [
    {
      title: "Iconic Landmarks & Heritage Exploration",
      morning: `Begin early at ${destination}'s most renowned heritage landmark and historic core to beat the afternoon crowds.`,
      afternoon: `Enjoy authentic regional thali lunch at a heritage cafe in ${destination} followed by artisan bazaars.`,
      evening: `Capture panoramic golden hour views from a scenic vantage point, followed by local live musical performance.`,
      meals: "Local special breakfast & traditional regional dinner",
      estimatedBudgetINR: budget === "budget" ? "₹1,200 - ₹2,000" : budget === "luxury" ? "₹8,000 - ₹15,000" : "₹3,000 - ₹5,000",
      tips: "Wear comfortable walking shoes and carry cash for local craft shopping.",
    },
    {
      title: "Cultural Immersion & Food Trail",
      morning: `Explore sacred temples, historic ghats, or royal palaces in ${destination} with an expert local heritage storyteller.`,
      afternoon: `Guided culinary tasting trail sampling century-old family recipes and street delicacies.`,
      evening: `Evening boat ride or rooftop dinner overlooking the illuminated city skyline under the stars.`,
      meals: "Culinary tasting tour with authentic street delicacies and dinner",
      estimatedBudgetINR: budget === "budget" ? "₹1,500 - ₹2,200" : budget === "luxury" ? "₹9,000 - ₹18,000" : "₹3,500 - ₹5,500",
      tips: "Book cultural shows or entry passes in advance.",
    },
    {
      title: "Nature, Eco-Trails & Scenic Serenity",
      morning: `Peaceful sunrise walk through lush botanical gardens, lake reserves, or ancient stepwells.`,
      afternoon: `Visit local artisan village workshops to observe traditional handicrafts.`,
      evening: `Farewell dinner at a celebrated open-air rooftop restaurant with folk music.`,
      meals: "Organic farm-to-table lunch & celebrated dessert specialties",
      estimatedBudgetINR: budget === "budget" ? "₹1,200 - ₹1,800" : budget === "luxury" ? "₹7,500 - ₹14,000" : "₹2,800 - ₹4,800",
      tips: "Carry sunscreen, a reusable bottle, and keep a camera ready.",
    },
    {
      title: "Offbeat Secrets & Hidden Neighborhoods",
      morning: `Discover hidden courtyard havelis and quieter historic quarters before standard tour buses arrive.`,
      afternoon: `Browse contemporary art galleries, boutique souvenir shops, and quiet garden cafes.`,
      evening: `Stargazing or relaxing twilight stroll through vibrant night markets and illuminated fountains.`,
      meals: "Regional heritage dishes and specialty desserts",
      estimatedBudgetINR: budget === "budget" ? "₹1,400 - ₹2,200" : budget === "luxury" ? "₹8,500 - ₹16,000" : "₹3,200 - ₹5,200",
      tips: "Respect local customs and photography restrictions inside inner sanctums.",
    },
  ];

  const generatedDays = [];
  for (let i = 0; i < days; i++) {
    const template = dayTemplates[i % dayTemplates.length];
    generatedDays.push({
      day: i + 1,
      title: template.title,
      morning: template.morning,
      afternoon: template.afternoon,
      evening: template.evening,
      meals: template.meals,
      estimatedBudgetINR: template.estimatedBudgetINR,
      tips: template.tips,
    });
  }

  return {
    destination,
    days: generatedDays,
    isFallback: true,
  };
};

/* ─── 1. SINGLE CITY GENERATE (EXISTING ENDPOINT: POST /api/planner/generate) ─── */
export const generateItinerary = async (req, res) => {
  try {
    const body = req.body || {};
    const { destination, days, budget, interests, travelStyle } = body;

    if (!destination || !days) {
      return res.status(400).json({ message: "destination and days are required" });
    }
    const numDays = Math.min(14, Math.max(1, parseInt(days, 10)));

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found, serving curated single-city itinerary.");
      return res.status(200).json(generateCuratedSingleFallback({ destination, days: numDays, budget, travelStyle }));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

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
              parts: [{ text: buildSingleCityPrompt({ destination, days: numDays, budget, interests, travelStyle }) }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
            maxOutputTokens: 2500,
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
          return res.status(200).json(parsed);
        }
      } else {
        const errText = await response.text();
        console.warn("Gemini API error in single-city generator:", response.status, errText);
      }
    } catch (aiErr) {
      clearTimeout(timeout);
      console.warn("Gemini request timed out or failed:", aiErr.message);
    }

    const fallbackPlan = generateCuratedSingleFallback({ destination, days: numDays, budget, travelStyle });
    return res.status(200).json(fallbackPlan);
  } catch (err) {
    console.error("Planner generation failed:", err.message);
    res.status(500).json({ message: "Failed to generate itinerary", error: err.message });
  }
};


/* ─── MULTI-CITY PROMPT & CURATED FALLBACK ─── */
const buildMultiCityPrompt = ({ cities, budget, interests, travelStyle }) => {
  const citySummary = cities.map((c, idx) => `${idx + 1}. ${c.destination} (${c.days} days)`).join(", ");
  const totalDays = cities.reduce((sum, c) => sum + c.days, 0);

  return `
You are an expert Indian travel planner. Create a realistic, seamless ${totalDays}-day sequential multi-city travel itinerary across India.
Cities Sequence: ${citySummary}.
Budget Tier: ${budget || "mid-range"}.
Traveler Interests: ${interests || "sightseeing, food, culture"}.
Style: ${travelStyle || "balanced"}.

REQUIREMENTS:
1. On the first day of arriving in each new city (from city 2 onward), explicitly include a travel & transition note detailing moving from the previous city to the next (e.g., transit method like train/flight/drive, checking in, and relaxing evening sights).
2. Each day must specify the exact "city" field.
3. Keep day numbers sequentially 1 to ${totalDays} matching the exact day allocation for each city in order.

Respond with ONLY valid JSON without markdown fences formatted exactly as:
{
  "cities": ${JSON.stringify(cities.map(c => c.destination))},
  "totalDays": ${totalDays},
  "days": [
    {
      "day": 1,
      "city": "${cities[0].destination}",
      "title": "short theme for the day",
      "morning": "morning activity with timing",
      "afternoon": "afternoon activity with lunch",
      "evening": "evening activity with dinner",
      "meals": "authentic local food suggestions",
      "estimatedBudgetINR": "e.g. ₹2,500 - ₹4,000",
      "tips": "practical advice or transit tips"
    }
  ]
}
Important: Return exactly ${totalDays} entries in the "days" array. Keep descriptions crisp and inspiring.`;
};

const generateCuratedMultiFallback = ({ cities, budget }) => {
  const cityNames = cities.map(c => c.destination);
  const totalDays = cities.reduce((sum, c) => sum + c.days, 0);

  const fallbackTemplates = [
    {
      title: (city) => `Heritage & Historic Wonders of ${city}`,
      morning: (city) => `Begin early at ${city}'s premier historic core and iconic monuments to beat afternoon crowds.`,
      afternoon: (city) => `Enjoy authentic regional thali lunch followed by a visit to central artisan bazaars in ${city}.`,
      evening: (city) => `Panoramic sunset views from a prominent viewpoint, followed by cultural music and dinner.`,
      meals: "Local special breakfast & traditional regional dinner",
      estimatedBudgetINR: budget === "budget" ? "₹1,200 - ₹2,000" : budget === "luxury" ? "₹8,000 - ₹15,000" : "₹3,000 - ₹5,000",
      tips: "Wear comfortable walking shoes and carry cash for local craft shopping.",
    },
    {
      title: (city) => `Cultural Immersion & Food Trail in ${city}`,
      morning: (city) => `Explore sacred shrines and royal courtyards in ${city} with a local heritage guide.`,
      afternoon: (city) => `Guided culinary tasting trail sampling ${city}'s century-old family recipes and street delicacies.`,
      evening: (city) => `Twilight walk or scenic dinner overlooking the illuminated city skyline under the stars.`,
      meals: "Culinary tasting tour with authentic regional dishes",
      estimatedBudgetINR: budget === "budget" ? "₹1,500 - ₹2,200" : budget === "luxury" ? "₹9,000 - ₹18,000" : "₹3,500 - ₹5,500",
      tips: "Book cultural shows or entry passes in advance.",
    },
    {
      title: (city) => `Scenic Trails & Hidden Quarters of ${city}`,
      morning: (city) => `Peaceful sunrise walk through scenic nature reserves or historic viewpoints around ${city}.`,
      afternoon: (city) => `Visit local artisan craft workshops to observe traditional handicrafts and textiles.`,
      evening: (city) => `Farewell dinner at an open-air rooftop restaurant with folk storytelling.`,
      meals: "Organic farm-to-table lunch & celebrated dessert specialties",
      estimatedBudgetINR: budget === "budget" ? "₹1,200 - ₹1,800" : budget === "luxury" ? "₹7,500 - ₹14,000" : "₹2,800 - ₹4,800",
      tips: "Carry sunscreen, a reusable water bottle, and your camera.",
    },
  ];

  const days = [];
  let dayNum = 1;

  cities.forEach((cityObj, cityIdx) => {
    for (let d = 0; d < cityObj.days; d++) {
      const isTransitionDay = cityIdx > 0 && d === 0;
      const prevCity = cityIdx > 0 ? cities[cityIdx - 1].destination : "";
      const currentCity = cityObj.destination;

      if (isTransitionDay) {
        days.push({
          day: dayNum,
          city: currentCity,
          title: `Journey from ${prevCity} to ${currentCity} & Evening Sights`,
          morning: `Morning departure from ${prevCity}; scenic transit via train, private cab, or short flight to ${currentCity}.`,
          afternoon: `Arrive in ${currentCity}, check in to your hotel, refresh, and enjoy a relaxed regional lunch.`,
          evening: `Unwind with a golden-hour twilight stroll through ${currentCity}'s vibrant local promenade and lakeside or hilltop dinner.`,
          meals: `Transit snacks & welcome dinner in ${currentCity}`,
          estimatedBudgetINR: budget === "budget" ? "₹2,000 - ₹3,500" : budget === "luxury" ? "₹10,000 - ₹20,000" : "₹4,500 - ₹7,000",
          tips: "Pre-book intercity transit tickets and keep digital hotel vouchers handy.",
        });
      } else {
        const tmpl = fallbackTemplates[(d) % fallbackTemplates.length];
        days.push({
          day: dayNum,
          city: currentCity,
          title: tmpl.title(currentCity),
          morning: tmpl.morning(currentCity),
          afternoon: tmpl.afternoon(currentCity),
          evening: tmpl.evening(currentCity),
          meals: tmpl.meals,
          estimatedBudgetINR: tmpl.estimatedBudgetINR,
          tips: tmpl.tips,
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

/* ─── 2. MULTI-CITY GENERATE (NEW ENDPOINT: POST /api/planner/generate-multi) ─── */
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

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("No GEMINI_API_KEY configured, returning curated multi-city plan.");
      return res.status(200).json(generateCuratedMultiFallback({ cities: sanitizedCities, budget }));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

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
              parts: [{ text: buildMultiCityPrompt({ cities: sanitizedCities, budget, interests, travelStyle }) }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
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
          // Guarantee consistent output shape
          const result = {
            cities: parsed.cities || sanitizedCities.map(c => c.destination),
            totalDays: parsed.totalDays || parsed.days.length,
            days: parsed.days,
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

    // Seamless fallback
    const fallbackPlan = generateCuratedMultiFallback({ cities: sanitizedCities, budget });
    return res.status(200).json(fallbackPlan);
  } catch (err) {
    console.error("Multi-city planner generation error:", err.message);
    return res.status(500).json({
      message: "Failed to generate multi-city itinerary",
      error: err.message,
    });
  }
};