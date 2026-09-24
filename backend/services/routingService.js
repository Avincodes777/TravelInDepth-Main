/**
 * Calculates Haversine straight-line distance between two coordinates in km
 */
function calculateHaversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate travel duration and distance using Haversine with winding factor + speed heuristic
 * @param {number} fromLat 
 * @param {number} fromLng 
 * @param {number} toLat 
 * @param {number} toLng 
 */
function estimateHaversineRoute(fromLat, fromLng, toLat, toLng) {
  const straightKm = calculateHaversineDistanceKm(fromLat, fromLng, toLat, toLng);
  // Apply winding factor of 1.3
  const roadKm = straightKm * 1.3;

  let travelMinutes = 0;
  if (roadKm < 0.8) {
    // Under 800m, walkable: ~4.5 km/h walking speed (~13.3 mins per km)
    travelMinutes = Math.max(2, Math.round(roadKm * 13.3));
  } else {
    // Urban transit speed: ~25 km/h (~2.4 mins per km) + 2 min buffer
    travelMinutes = Math.max(3, Math.round(roadKm * 2.4 + 2));
  }

  return {
    travelMinutes,
    travelKm: Math.round(roadKm * 10) / 10,
    estimated: true
  };
}

/**
 * Retrieves route duration and distance between two points.
 * Calls OSRM public server first with 2.5s timeout.
 * Falls back to Haversine estimate if OSRM fails or times out.
 * Returns null if coordinates are missing/invalid. Never throws.
 *
 * @param {number|null} fromLat
 * @param {number|null} fromLng
 * @param {number|null} toLat
 * @param {number|null} toLng
 * @returns {Promise<{travelMinutes: number, travelKm: number, estimated: boolean}|null>}
 */
export async function getRouteDuration(fromLat, fromLng, toLat, toLng) {
  try {
    const lat1 = parseFloat(fromLat);
    const lon1 = parseFloat(fromLng);
    const lat2 = parseFloat(toLat);
    const lon2 = parseFloat(toLng);

    if (
      !Number.isFinite(lat1) ||
      !Number.isFinite(lon1) ||
      !Number.isFinite(lat2) ||
      !Number.isFinite(lon2) ||
      (lat1 === 0 && lon1 === 0) ||
      (lat2 === 0 && lon2 === 0)
    ) {
      return null;
    }

    // Attempt OSRM Public demo server
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;

    try {
      const res = await fetch(osrmUrl, {
        signal: AbortSignal.timeout(2500),
        headers: {
          'User-Agent': 'TravelInDepth/1.0 (RoutingService)'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const distanceMeters = route.distance || 0;
          const durationSeconds = route.duration || 0;
          const km = Math.round((distanceMeters / 1000) * 10) / 10;
          let mins = Math.max(1, Math.round(durationSeconds / 60));

          // Short-distance adjustment: if < 600m in dense city center/ghats, ensure realistic walking floor
          if (km < 0.6) {
            const walkMinsFloor = Math.round((km / 4.5) * 60); // 4.5 km/h
            mins = Math.max(mins, walkMinsFloor);
          }

          return {
            travelMinutes: mins,
            travelKm: km,
            estimated: false
          };
        }
      }
    } catch (osrmErr) {
      // OSRM failed or timed out — silently fallback to Haversine
    }

    // Fallback path
    return estimateHaversineRoute(lat1, lon1, lat2, lon2);
  } catch (err) {
    return null;
  }
}

export default {
  getRouteDuration
};
