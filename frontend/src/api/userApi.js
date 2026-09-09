import { apiClient } from "./client";

/**
 * Fetch authenticated user profile details
 */
export const getUserProfile = async () => {
  return apiClient.get("/users/profile");
};

/**
 * Update authenticated user profile
 * @param {Object} data - { name, bio, location, avatar, phone }
 */
export const updateUserProfile = async (data) => {
  return apiClient.put("/users/profile", data);
};

/**
 * Update user settings & preferences
 * @param {Object} data - { emailNotifications, pushNotifications, darkMode, currency }
 */
export const updateUserSettings = async (data) => {
  return apiClient.put("/users/settings", data);
};

/**
 * Fetch all notifications
 */
export const getNotifications = async () => {
  return apiClient.get("/users/notifications");
};

/**
 * Mark notification as read (or 'all')
 * @param {string} id - Notification ID or 'all'
 */
export const markNotificationRead = async (id) => {
  return apiClient.put(`/users/notifications/${id}/read`);
};

/**
 * Delete notification by ID or 'all'
 * @param {string} id - Notification ID or 'all'
 */
export const deleteNotification = async (id) => {
  return apiClient.delete(`/users/notifications/${id}`);
};
