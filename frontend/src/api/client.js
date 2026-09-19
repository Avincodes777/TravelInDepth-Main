const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/+$/, ""); // Trim trailing slash
  }
  if (import.meta.env.PROD) {
    console.error(
      "❌ CRITICAL CONFIGURATION ERROR: VITE_API_URL is missing in production environment variables! API requests will fail."
    );
    return ""; // In production, don't silently fallback to localhost:5000
  }
  return "http://localhost:5000/api";
};

export const BASE_URL = getApiBaseUrl();

async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const apiClient = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }),
  delete: (path) => request(path, { method: "DELETE" }),
};