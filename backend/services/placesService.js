import Destination from "../models/Destination.js";

// In-memory cache for resolved destination coordinates: destinationName.toLowerCase() -> { lat, lon }
const coordsCache = new Map();

// Rate limiting state for Nominatim (max 1 request per second as per OSM usage policy)
let lastNominatimCallTime = 0;
let nominatimQueue = Promise.resolve();

/**
 * Enforces at least 1000ms delay between consecutive Nominatim requests.
 */
const rateLimitedNominatimFetch = async (url) => {
  return new Promise((resolve, reject) => {
    nominatimQueue = nominatimQueue
      .then(async () => {
        const now = Date.now();
        const elapsed = now - lastNominatimCallTime;
        if (elapsed < 1000) {
          await new Promise((res) => setTimeout(res, 1000 - elapsed));
        }
        lastNominatimCallTime = Date.now();

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        try {
          const response = await fetch(url, {
            headers: {
              "User-Agent": "TravelInDepth/1.0 (contact: info@travelindepth.com)",
              Accept: "application/json",
            },
            signal: controller.signal,
          });
          clearTimeout(timeout);
          return response;
        } catch (err) {
          clearTimeout(timeout);
          throw err;
        }
      })
      .then(resolve)
      .catch(reject);
  });
};

/**
 * Resolves destination name to coordinates { lat, lon }.
 * 1. Checks in-memory cache
 * 2. Checks MongoDB Destination model (if lat/lng already stored)
 * 3. Falls back to Nominatim with 1 req/sec rate limiting & caching
 *
 * @param {string} destinationName
 * @returns {Promise<{ lat: number, lon: number } | null>}
 */
export const getDestinationCoordinates = async (destinationName) => {
  if (!destinationName || typeof destinationName !== "string") {
    return null;
  }

  const normalized = destinationName.trim().toLowerCase();

  // 1. In-memory cache check
  if (coordsCache.has(normalized)) {
    return coordsCache.get(normalized);
  }

  // 2. MongoDB Destination record check (only if mongoose is connected)
  try {
    const mongoose = (await import("mongoose")).default;
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const destDoc = await Destination.findOne({
        $or: [
          { name: new RegExp(`^${destinationName.trim()}$`, "i") },
          { slug: destinationName.trim().toLowerCase() },
        ],
      }).lean();

      if (destDoc && typeof destDoc.lat === "number" && (typeof destDoc.lng === "number" || typeof destDoc.lon === "number")) {
        const coords = {
          lat: Number(destDoc.lat),
          lon: Number(destDoc.lng ?? destDoc.lon),
        };
        coordsCache.set(normalized, coords);
        return coords;
      }
    }
  } catch (dbErr) {
    console.warn("DB coordinate lookup warning:", dbErr.message);
  }

  // 3. Fallback to Nominatim Geocoding API
  try {
    const query = `${destinationName.trim()}, India`;
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const response = await rateLimitedNominatimFetch(url);

    if (response && response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        if (!isNaN(lat) && !isNaN(lon)) {
          const coords = { lat, lon };
          coordsCache.set(normalized, coords);

          // Persist coordinates back to MongoDB Destination document if present without coords
          try {
            const mongoose = (await import("mongoose")).default;
            if (mongoose.connection && mongoose.connection.readyState === 1) {
              await Destination.updateOne(
                {
                  $or: [
                    { name: new RegExp(`^${destinationName.trim()}$`, "i") },
                    { slug: destinationName.trim().toLowerCase() },
                  ],
                  $or: [{ lat: { $exists: false } }, { lat: null }, { lng: { $exists: false } }, { lng: null }],
                },
                { $set: { lat, lng: lon } }
              );
            }
          } catch (updateErr) {
            console.warn("Could not save resolved coordinates to DB:", updateErr.message);
          }

          return coords;
        }
      }
    }
  } catch (geoErr) {
    console.warn(`Nominatim geocoding failed for "${destinationName}":`, geoErr.message);
  }

  return null;
};

/**
 * Searches nearby attractions via OpenTripMap radius endpoint, with seamless
 * fallback to Wikipedia GeoSearch API if OpenTripMap key is absent or unreachable.
 *
 * @param {number} lat
 * @param {number} lon
 * @param {string} category - OpenTripMap kinds string (e.g. "historic,cultural", "foods", "natural")
 * @returns {Promise<Array<{ xid: string, name: string, kinds: string, point: { lat: number, lon: number }, rate: number }>>}
 */
export const searchNearbyPlaces = async (lat, lon, category = "interesting_places") => {
  if (typeof lat !== "number" || typeof lon !== "number" || isNaN(lat) || isNaN(lon)) {
    return [];
  }

  const apiKey = process.env.OPENTRIPMAP_API_KEY;

  // 1. If OpenTripMap API Key is configured, try OpenTripMap first
  if (apiKey) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=7000&lon=${lon}&lat=${lat}&kinds=${encodeURIComponent(
        category
      )}&format=json&limit=30&apikey=${apiKey}`;

      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        let items = [];

        if (Array.isArray(data)) {
          items = data;
        } else if (data && Array.isArray(data.features)) {
          items = data.features.map((f) => ({
            xid: f.properties?.xid,
            name: f.properties?.name,
            kinds: f.properties?.kinds,
            rate: f.properties?.rate || 0,
            point: {
              lat: f.geometry?.coordinates?.[1],
              lon: f.geometry?.coordinates?.[0],
            },
          }));
        }

        const results = items
          .filter((item) => item && item.xid && item.name && item.name.trim().length > 0)
          .map((item) => ({
            xid: item.xid,
            name: item.name.trim(),
            kinds: item.kinds || category,
            point: {
              lat: item.point?.lat ?? item.lat ?? lat,
              lon: item.point?.lon ?? item.lon ?? lon,
            },
            rate: typeof item.rate === "number" ? item.rate : 1,
          }));

        if (results.length > 0) {
          return results;
        }
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`OpenTripMap radius search fallback triggered (${category}):`, err.message);
    }
  }

  // 2. Zero-config keyless fallback: Wikipedia GeoSearch API (100% free, no API key or signup required)
  try {
    const wikiGeoUrl = `https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gscoord=${lat}%7C${lon}&gsradius=10000&gslimit=40&format=json`;
    const response = await fetch(wikiGeoUrl, {
      headers: {
        "User-Agent": "TravelInDepth/1.0 (contact: info@travelindepth.com)",
        Accept: "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const geoItems = data.query?.geosearch || [];
      const NON_TOURIST_REGEX = /attacks|terror|bombing|police|headquarters|station|railway|depot|assembly|court|barracks|embassy|consulate|jail|prison|office|corporation|school|high school|college|university|hospital|clinic|constituency|district|bank|limited|pvt|ltd/i;
      const TOURIST_PRIORITY_REGEX = /gateway|fort|palace|museum|gallery|temple|beach|cave|garden|park|ghat|lake|memorial|cathedral|church|synagogue|mosque|dargah|bazaar|market|promenade|point|sanctuary|drive|gate|monument|heritage|viewpoint|island|waterfall|aquarium|tower|cafe|restaurant|hotel|library/i;

      // Filter out utility, institutional, or incident entries
      const filtered = geoItems.filter((item) => item && item.title && !NON_TOURIST_REGEX.test(item.title));

      // Sort prioritizing recognized tourist and cultural spots
      filtered.sort((a, b) => {
        const aIsTouristy = TOURIST_PRIORITY_REGEX.test(a.title) ? 1 : 0;
        const bIsTouristy = TOURIST_PRIORITY_REGEX.test(b.title) ? 1 : 0;
        return bIsTouristy - aIsTouristy;
      });

      return filtered.slice(0, 20).map((item, index) => ({
        xid: `wiki_${item.pageid}`,
        name: item.title,
        kinds: category,
        point: { lat: item.lat, lon: item.lon },
        rate: Math.max(1, 20 - index),
      }));
    }
  } catch (wikiErr) {
    console.warn("Wikipedia GeoSearch fallback error:", wikiErr.message);
  }

  return [];
};

/**
 * Fetches place details for a given OpenTripMap XID or Wikipedia page ID.
 *
 * @param {string} xid
 * @returns {Promise<{ name: string, address: string, description: string, image: string, url: string, wikipedia: string } | null>}
 */
export const getPlaceDetails = async (xid) => {
  if (!xid) {
    return null;
  }

  // 1. If it's a Wikipedia fallback ID (wiki_{pageid})
  if (xid.startsWith("wiki_")) {
    const pageId = xid.replace("wiki_", "");
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|info&inprop=url&exintro=1&explaintext=1&exchars=300&piprop=thumbnail&pithumbsize=400&pageids=${pageId}&format=json`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "TravelInDepth/1.0 (contact: info@travelindepth.com)",
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        const page = data.query?.pages?.[pageId];
        if (page) {
          return {
            name: page.title || "",
            address: "",
            description: (page.extract || "").slice(0, 300),
            image: page.thumbnail?.source || "",
            url: page.fullurl || `https://en.wikipedia.org/?curid=${pageId}`,
            wikipedia: page.fullurl || "",
          };
        }
      }
    } catch (err) {
      console.warn(`Wikipedia place detail error for page ${pageId}:`, err.message);
    }
    return null;
  }

  // 2. OpenTripMap place details lookup
  const apiKey = process.env.OPENTRIPMAP_API_KEY;
  if (!apiKey) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const url = `https://api.opentripmap.com/0.1/en/places/xid/${encodeURIComponent(xid)}?apikey=${apiKey}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (!data || !data.name) {
      return null;
    }

    let addressStr = "";
    if (data.address) {
      if (typeof data.address === "object") {
        addressStr = Object.values(data.address).filter(Boolean).join(", ");
      } else if (typeof data.address === "string") {
        addressStr = data.address;
      }
    }

    const description =
      data.wikipedia_extracts?.text ||
      data.info?.descr ||
      data.description ||
      "";

    const image = data.preview?.source || data.image || "";
    const urlLink = data.url || data.otm || "";
    const wikipedia = data.wikipedia || "";

    return {
      name: data.name.trim(),
      address: addressStr,
      description: description.slice(0, 300),
      image,
      url: urlLink,
      wikipedia,
    };
  } catch (err) {
    clearTimeout(timeout);
    return null;
  }
};

/**
 * Maps user interest keywords to 2-3 OpenTripMap category kinds.
 *
 * @param {string} interestsStr
 * @returns {string[]} Array of 2 to 3 OpenTripMap kinds strings
 */
export const mapInterestsToCategories = (interestsStr = "") => {
  const raw = (interestsStr || "").toLowerCase();
  const categories = new Set();

  if (/heritage|history|historic|monument|fort|palace|architecture|culture|museum/.test(raw)) {
    categories.add("historic,cultural");
  }
  if (/food|culinary|dining|street food|cuisine|cafe|restaurant/.test(raw)) {
    categories.add("foods");
  }
  if (/nature|wildlife|natural|park|lake|mountain|hill|scenic|outdoor|garden/.test(raw)) {
    categories.add("natural");
  }
  if (/temple|spirituality|spiritual|religion|holy|ghat|pilgrimage/.test(raw)) {
    categories.add("religion");
  }
  if (/adventure|sport|trek|trekking|hike|camping|watersports/.test(raw)) {
    categories.add("sport,amusements");
  }
  if (/shopping|bazaar|market|handicraft|souvenir/.test(raw)) {
    categories.add("shops,marketplaces");
  }

  // Default fallbacks if fewer than 2 categories matched
  if (!categories.has("historic,cultural")) categories.add("historic,cultural");
  if (categories.size < 2) categories.add("foods");
  if (categories.size < 3) categories.add("natural");

  return Array.from(categories).slice(0, 3);
};
