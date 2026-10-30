// server.js — entry point for the SkyCast backend.
// Run with:  node server.js   (after "npm install" in this folder)

const express = require("express");
const cors = require("cors");
const weatherRoutes = require("./routes/weather");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());              // allow the frontend (different origin) to call this API
app.use(express.json());      // parse JSON request bodies

// mount all /api/weather/* routes from routes/weather.js
app.use("/api/weather", weatherRoutes);

// simple health-check route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "SkyCast Weather API is running" });
});

// 404 handler — runs if no route above matched
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`SkyCast backend listening on http://localhost:${PORT}`);
});
