// routes/weather.js — defines everything under /api/weather

const express = require("express");
const router = express.Router();
const { mockWeather } = require("../data/mockWeather");

// GET /api/weather/:city
// Example: GET /api/weather/Ahmedabad
router.get("/:city", (req, res) => {
  const key = req.params.city.trim().toLowerCase();
  const record = mockWeather[key];

  if (!record) {
    return res.status(404).json({
      error: `No weather data found for "${req.params.city}"`,
    });
  }

  return res.status(200).json(record);
});

// GET /api/weather  — lists which cities this demo API supports
router.get("/", (req, res) => {
  res.json({ supportedCities: Object.keys(mockWeather) });
});

module.exports = router;
