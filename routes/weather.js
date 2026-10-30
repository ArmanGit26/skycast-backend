// routes/weather.js — real-time weather via Open-Meteo (free, no API key).
// GET /api/weather/:city  ->  { city, temp, feelsLike, condition, icon,
//                               humidity, wind, pressure, forecast: [{day, icon, hi, lo}] }
// Needs Node 18+ (global fetch). Render's default Node is fine.

const express = require("express");
const router = express.Router();

const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const TIMEOUT_MS = 8000;

const cache = new Map(); // key: lowercase city -> { at, data }

// WMO weather code -> [description, day icon, night icon]
const WMO = {
  0: ["Clear Sky", "☀️", "🌙"],
  1: ["Mainly Clear", "🌤️", "🌙"],
  2: ["Partly Cloudy", "⛅", "☁️"],
  3: ["Overcast", "☁️", "☁️"],
  45: ["Fog", "🌫️", "🌫️"],
  48: ["Rime Fog", "🌫️", "🌫️"],
  51: ["Light Drizzle", "🌦️", "🌧️"],
  53: ["Drizzle", "🌦️", "🌧️"],
  55: ["Heavy Drizzle", "🌧️", "🌧️"],
  56: ["Freezing Drizzle", "🌧️", "🌧️"],
  57: ["Freezing Drizzle", "🌧️", "🌧️"],
  61: ["Light Rain", "🌦️", "🌧️"],
  63: ["Rain", "🌧️", "🌧️"],
  65: ["Heavy Rain", "🌧️", "🌧️"],
  66: ["Freezing Rain", "🌧️", "🌧️"],
  67: ["Freezing Rain", "🌧️", "🌧️"],
  71: ["Light Snow", "🌨️", "🌨️"],
  73: ["Snow", "❄️", "❄️"],
  75: ["Heavy Snow", "❄️", "❄️"],
  77: ["Snow Grains", "❄️", "❄️"],
  80: ["Light Showers", "🌦️", "🌧️"],
  81: ["Showers", "🌧️", "🌧️"],
  82: ["Violent Showers", "⛈️", "⛈️"],
  85: ["Snow Showers", "🌨️", "🌨️"],
  86: ["Heavy Snow Showers", "🌨️", "🌨️"],
  95: ["Thunderstorm", "⛈️", "⛈️"],
  96: ["Thunderstorm with Hail", "⛈️", "⛈️"],
  99: ["Thunderstorm with Hail", "⛈️", "⛈️"],
};

function describe(code, isDay = true) {
  const entry = WMO[code] || ["Unknown", "🌡️", "🌡️"];
  return { condition: entry[0], icon: isDay ? entry[1] : entry[2] };
}

async function getJSON(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`Upstream responded ${res.status}`);
  return res.json();
}

async function fetchWeather(city) {
  // 1) city name -> coordinates
  const geo = await getJSON(
    `${GEO_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
  );
  const place = geo.results && geo.results[0];
  if (!place) return null;

  // 2) coordinates -> current weather + 5-day forecast
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,wind_speed_10m,weather_code,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "5",
  });
  const w = await getJSON(`${FORECAST_URL}?${params}`);
  const c = w.current;
  const now = describe(c.weather_code, c.is_day === 1);

  const forecast = w.daily.time.map((date, i) => ({
    day:
      i === 0
        ? "Today"
        : new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: "UTC",
          }),
    icon: describe(w.daily.weather_code[i], true).icon,
    hi: Math.round(w.daily.temperature_2m_max[i]),
    lo: Math.round(w.daily.temperature_2m_min[i]),
  }));

  return {
    city: place.country_code ? `${place.name}, ${place.country_code}` : place.name,
    temp: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    condition: now.condition,
    icon: now.icon,
    humidity: Math.round(c.relative_humidity_2m),
    wind: Math.round(c.wind_speed_10m), // km/h
    pressure: Math.round(c.surface_pressure), // hPa
    forecast,
  };
}

// GET /api/weather/:city
router.get("/:city", async (req, res) => {
  const city = req.params.city.trim();
  if (!city || city.length > 100) {
    return res.status(400).json({ error: "Please enter a valid city name" });
  }

  const key = city.toLowerCase();
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return res.json(hit.data);
  }

  try {
    const data = await fetchWeather(city);
    if (!data) {
      return res.status(404).json({ error: `No city found for "${city}"` });
    }
    cache.set(key, { at: Date.now(), data });
    return res.json(data);
  } catch (err) {
    console.error("Weather fetch failed:", err.message);
    return res
      .status(502)
      .json({ error: "Weather service is unavailable, try again shortly" });
  }
});

// GET /api/weather — usage hint (also stops empty searches from returning junk)
router.get("/", (req, res) => {
  res.status(400).json({ error: "Use GET /api/weather/:city, e.g. /api/weather/Ahmedabad" });
});

module.exports = router;
