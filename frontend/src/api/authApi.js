import { apiClient } from "./client";

export const signup = (payload, email, password) => {
  const body = typeof payload === "object" ? payload : { name: payload, email, password };
  return apiClient.post("/auth/signup", body);
};

export const login = (email, password) =>
  apiClient.post("/auth/login", { email, password });

export const getMe = () => apiClient.get("/auth/me");

export const updateInterests = (interests) =>
  apiClient.put("/auth/interests", { interests });

export const googleAuth = (idToken) =>
  apiClient.post("/auth/google", { idToken });

export const forgotPassword = (email) =>
  apiClient.post("/auth/forgot-password", { email });

export const resetPassword = (token, password) =>
  apiClient.post("/auth/reset-password", { token, password });