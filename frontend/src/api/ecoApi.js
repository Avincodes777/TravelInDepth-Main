import { apiClient } from "./client";

/**
 * Fetch live community eco stats, user green footprint & leaderboard
 */
export const getEcoStats = async () => {
  return apiClient.get("/eco/stats");
};

/**
 * Log a new sustainable travel action
 * @param {Object} data - { actionType, title, carbonSavedKg, bottlesPrevented, localSpentUSD, notes }
 */
export const logEcoAction = async (data) => {
  return apiClient.post("/eco/log-action", data);
};

/**
 * Save an eco-pledge and receive a digital passport stamp
 * @param {Object} data - { tripDestination, pledges, userName }
 */
export const createPledge = async (data) => {
  return apiClient.post("/eco/pledge", data);
};

/**
 * Fetch user's active/past digital eco-pledges
 */
export const getMyPledges = async () => {
  return apiClient.get("/eco/pledge/my");
};

/**
 * Fetch crowdsourced green spots & alerts
 * @param {Object} [params] - { category, search }
 */
export const getEcoSpots = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category && params.category !== "All") query.append("category", params.category);
  if (params.search && params.search.trim()) query.append("search", params.search.trim());

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiClient.get(`/eco/spots${queryString}`);
};

/**
 * Submit a new green spot or eco-alert
 * @param {Object} data - { title, category, location, description, submitterName }
 */
export const createEcoSpot = async (data) => {
  return apiClient.post("/eco/spots", data);
};

/**
 * Upvote an eco spot by ID
 * @param {string} id - Spot ID
 */
export const upvoteEcoSpot = async (id) => {
  return apiClient.post(`/eco/spots/${id}/upvote`);
};

/**
 * Manually trigger live eco-data sync
 */
export const syncLiveEcoFeeds = async () => {
  return apiClient.post("/eco/sync-feeds");
};
