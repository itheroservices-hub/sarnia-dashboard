const express = require('express');
const router = express.Router();
const getTodayForecast = require('./todayforecast');
const getThreeDayForecast = require('./threedayforecast');

// 🔹 Today Forecast Route
router.get('/today', async (req, res) => {
  try {
    const forecast = await getTodayForecast();
    res.json(forecast);
  } catch (error) {
    console.error('Error in /weather/today route:', error.message);
    res.status(500).json({ error: 'Failed to fetch today forecast' });
  }
});

// 🔹 Three-Day Forecast Route
router.get('/threeday', async (req, res) => {
  try {
    const forecast = await getThreeDayForecast();
    res.json(forecast);
  } catch (error) {
    console.error('Error in /weather/threeday route:', error.message);
    res.status(500).json({ error: 'Failed to fetch three-day forecast' });
  }
});

module.exports = router;