// WMO mapping for direct client fallback if backend is sleeping or unreachable
const WMO_CODE_MAP = {
  0: { label: "Clear Sky", icon: "☀️", condition: "Clear" },
  1: { label: "Mainly Clear", icon: "🌤️", condition: "Clear" },
  2: { label: "Partly Cloudy", icon: "⛅", condition: "Cloudy" },
  3: { label: "Overcast", icon: "☁️", condition: "Overcast" },
  45: { label: "Foggy", icon: "🌫️", condition: "Fog" },
  48: { label: "Depositing Rime Fog", icon: "🌫️", condition: "Fog" },
  51: { label: "Light Drizzle", icon: "🌦️", condition: "Drizzle" },
  53: { label: "Moderate Drizzle", icon: "🌦️", condition: "Drizzle" },
  55: { label: "Dense Drizzle", icon: "🌧️", condition: "Drizzle" },
  61: { label: "Slight Rain", icon: "🌦️", condition: "Rain" },
  63: { label: "Moderate Rain", icon: "🌧️", condition: "Rain" },
  65: { label: "Heavy Rain", icon: "⛈️", condition: "Rain" },
  71: { label: "Slight Snow", icon: "🌨️", condition: "Snow" },
  73: { label: "Moderate Snow", icon: "❄️", condition: "Snow" },
  75: { label: "Heavy Snow", icon: "❄️", condition: "Snow" },
  80: { label: "Rain Showers", icon: "🌦️", condition: "Showers" },
  81: { label: "Moderate Showers", icon: "🌧️", condition: "Showers" },
  82: { label: "Violent Showers", icon: "⛈️", condition: "Showers" },
  95: { label: "Thunderstorm", icon: "⚡", condition: "Thunderstorm" },
  96: { label: "Thunderstorm with Hail", icon: "⛈️", condition: "Thunderstorm" },
  99: { label: "Severe Thunderstorm", icon: "⛈️", condition: "Thunderstorm" },
};

/**
 * Fetch real-time weather & 5-day forecast
 * First attempts backend /api/weather, with graceful fallback to Open-Meteo direct API
 * @param {Object} params - { slug, lat, lng }
 */
export const fetchWeather = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.slug) query.set("slug", params.slug);
  if (params.lat) query.set("lat", params.lat);
  if (params.lng) query.set("lng", params.lng);

  try {
    const queryString = query.toString();
    const data = await apiClient.get(`/weather${queryString ? `?${queryString}` : ""}`);
    if (data && data.current) return data;
  } catch (backendErr) {
    console.warn("Backend weather endpoint failed, attempting direct Open-Meteo fallback:", backendErr.message);
  }

  // Direct client-side Open-Meteo fallback if lat/lng are provided
  if (params.lat && params.lng) {
    try {
      const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${params.lat}&longitude=${params.lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&timezone=auto&forecast_days=5`;
      const res = await fetch(openMeteoUrl);
      if (res.ok) {
        const raw = await res.json();
        const current = raw.current || {};
        const daily = raw.daily || {};
        const weatherCode = current.weather_code ?? 0;
        const weatherInfo = WMO_CODE_MAP[weatherCode] || { label: "Clear", icon: "☀️", condition: "Clear" };

        const forecast = (daily.time || []).map((dateStr, idx) => {
          const code = daily.weather_code?.[idx] ?? 0;
          const info = WMO_CODE_MAP[code] || { label: "Clear", icon: "☀️" };
          const dateObj = new Date(dateStr);
          const dayName = dateObj.toLocaleDateString("en-IN", { weekday: "short" });

          return {
            date: dateStr,
            day: dayName,
            maxTemp: Math.round(daily.temperature_2m_max?.[idx] ?? 0),
            minTemp: Math.round(daily.temperature_2m_min?.[idx] ?? 0),
            weatherCode: code,
            label: info.label,
            icon: info.icon,
            uvIndex: daily.uv_index_max?.[idx] ?? 0,
          };
        });

        return {
          location: {
            city: params.slug || "Location",
            latitude: params.lat,
            longitude: params.lng,
            timezone: raw.timezone,
          },
          current: {
            temperature: Math.round(current.temperature_2m ?? 0),
            apparentTemperature: Math.round(current.apparent_temperature ?? 0),
            humidity: current.relative_humidity_2m ?? 0,
            precipitation: current.precipitation ?? 0,
            windSpeed: Math.round(current.wind_speed_10m ?? 0),
            weatherCode,
            condition: weatherInfo.condition,
            label: weatherInfo.label,
            icon: weatherInfo.icon,
            isDay: current.is_day === 1,
          },
          forecast,
        };
      }
    } catch (fallbackErr) {
      console.error("Direct Open-Meteo fallback also failed:", fallbackErr);
    }
  }

  return null;
};
