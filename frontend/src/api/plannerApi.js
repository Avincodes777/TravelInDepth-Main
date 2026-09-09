import { apiClient } from "./client";

/**
 * Generate a new multi-day itinerary using Gemini AI
 * @param {Object} params - { destination, days, budget, interests, travelStyle }
 */
export const generateItinerary = (params) => {
  return apiClient.post("/planner/generate", params);
};

/**
 * Generate an itinerary across multiple sequential cities in one request
 * @param {Object} params - { cities: [{ destination, days }], budget, interests, travelStyle }
 */
export const generateMultiCityItinerary = (params) => {
  return apiClient.post("/planner/generate-multi", params);
};

/**
 * Regenerate a specific day in an existing itinerary
 * @param {Object} params - { destination, dayNumber, totalDays }
 */
export const regenerateDay = (params) => {
  return apiClient.post("/planner/generate/day", params);
};

/**
 * Save an itinerary to the user's account
 * @param {Object} itineraryData - { destination, days: [...] }
 */
export const saveItinerary = (itineraryData) => {
  return apiClient.post("/planner/save", itineraryData);
};

/**
 * Fetch all saved itineraries for the logged-in user
 */
export const fetchMyItineraries = () => {
  return apiClient.get("/planner/my");
};

/**
 * Delete a saved itinerary by ID
 * @param {string} id - Itinerary _id
 */
export const deleteItinerary = (id) => {
  return apiClient.delete(`/planner/my/${id}`);
};
