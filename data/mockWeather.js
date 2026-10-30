// data/mockWeather.js
// In a real project this data would come from a database or a third-party
// weather API (e.g. OpenWeatherMap). Here it's hard-coded so the project
// runs fully offline for demo/viva purposes.

const mockWeather = {
  ahmedabad: {
    city: "Ahmedabad, IN",
    temp: 36,
    feelsLike: 39,
    condition: "Clear Sky",
    humidity: 42,
    wind: 14,
    pressure: 1008,
    icon: "☀️",
    forecast: [
      { day: "Fri", icon: "☀️", hi: 37, lo: 27 },
      { day: "Sat", icon: "⛅", hi: 35, lo: 26 },
      { day: "Sun", icon: "🌦️", hi: 33, lo: 25 },
      { day: "Mon", icon: "⛈️", hi: 31, lo: 24 },
      { day: "Tue", icon: "⛅", hi: 34, lo: 25 },
    ],
  },
  mumbai: {
    city: "Mumbai, IN",
    temp: 29,
    feelsLike: 33,
    condition: "Light Rain",
    humidity: 78,
    wind: 21,
    pressure: 999,
    icon: "🌦️",
    forecast: [
      { day: "Fri", icon: "🌧️", hi: 29, lo: 25 },
      { day: "Sat", icon: "⛈️", hi: 28, lo: 24 },
      { day: "Sun", icon: "🌦️", hi: 29, lo: 25 },
      { day: "Mon", icon: "⛅", hi: 30, lo: 25 },
      { day: "Tue", icon: "☀️", hi: 31, lo: 26 },
    ],
  },
  surat: {
    city: "Surat, IN",
    temp: 33,
    feelsLike: 36,
    condition: "Partly Cloudy",
    humidity: 55,
    wind: 12,
    pressure: 1005,
    icon: "⛅",
    forecast: [
      { day: "Fri", icon: "⛅", hi: 34, lo: 26 },
      { day: "Sat", icon: "☀️", hi: 35, lo: 26 },
      { day: "Sun", icon: "⛅", hi: 33, lo: 25 },
      { day: "Mon", icon: "🌦️", hi: 31, lo: 24 },
      { day: "Tue", icon: "☀️", hi: 34, lo: 25 },
    ],
  },
};

module.exports = { mockWeather };
