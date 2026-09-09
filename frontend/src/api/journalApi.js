import { apiClient } from "./client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Get all journal entries for the logged-in user
 */
export const getMyJournalEntries = () => apiClient.get("/journal");

/**
 * Get single journal entry by ID
 */
export const getJournalEntryById = (id) => apiClient.get(`/journal/${id}`);

/**
 * Create a new journal entry with multipart/form-data (photo upload)
 * @param {FormData} formData
 */
export const createJournalEntry = async (formData) => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}/journal`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Note: Let fetch set Content-Type header with multipart boundary automatically
    },
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Failed to create entry (Status ${res.status})`);
  }

  return data;
};

/**
 * Delete a journal entry by ID
 * @param {string} id
 */
export const deleteJournalEntry = (id) => apiClient.delete(`/journal/${id}`);
