import { apiClient } from "./client";

/**
 * Fetch all reviews
 * @param {Object} [params] - optional { category, rating, sort }
 */
export const getReviews = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.category && params.category !== "All") query.append("category", params.category);
  if (params.rating) query.append("rating", params.rating);
  if (params.sort) query.append("sort", params.sort);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return apiClient.get(`/reviews${queryString}`);
};

/**
 * Fetch user's own reviews
 */
export const getMyReviews = async () => {
  return apiClient.get("/reviews/my");
};

/**
 * Create a new review
 * @param {Object} data - { rating, category, comment }
 */
export const createReview = async (data) => {
  return apiClient.post("/reviews", data);
};

/**
 * Delete a review by ID
 * @param {string} id - Review ID
 */
export const deleteReview = async (id) => {
  return apiClient.delete(`/reviews/${id}`);
};
