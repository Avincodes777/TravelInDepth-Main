import { createContext, useContext, useEffect, useState } from "react";
import { getAllDestinations } from "../api/destinationsApi";

const CACHE_KEY = "tid_destinations_cache";
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes cache

// Initial seed memory cache from localStorage if available
const getCachedDestinations = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed.timestamp && Date.now() - parsed.timestamp < CACHE_TTL && Array.isArray(parsed.data)) {
      return parsed.data;
    }
  } catch {
    // Ignore storage parse errors
  }
  return [];
};

export const CityContext = createContext();

export const CityProvider = ({ children }) => {
  const initialCache = getCachedDestinations();
  const [cities, setCities] = useState(initialCache);
  const [loading, setLoading] = useState(initialCache.length === 0);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCities = async () => {
      try {
        const data = await getAllDestinations();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCities(data);
          try {
            localStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ data, timestamp: Date.now() })
            );
          } catch {
            // Ignore storage quota errors
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCities();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <CityContext.Provider value={{ cities, loading, error }}>
      {children}
    </CityContext.Provider>
  );
};

export const useCities = () => useContext(CityContext);