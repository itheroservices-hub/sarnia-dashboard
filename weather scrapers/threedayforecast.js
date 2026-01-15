const axios = require('axios');

async function getThreeDayForecast() {
  const LAT = 42.974;
  const LON = -82.4066;
  const UNITS = 'metric';
  const WEATHER_API_KEY = '358109cc7c1d67419364bfdde1dbc335';

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=${UNITS}&appid=${WEATHER_API_KEY}`;
    const { data } = await axios.get(url);

    const grouped = {};

    data.list.forEach(entry => {
      const date = new Date(entry.dt * 1000);
      const day = date.toLocaleDateString('en-CA', { weekday: 'long' });

      if (!grouped[day]) {
        grouped[day] = [];
      }

      grouped[day].push(entry);
    });

    const forecast = {};
    const days = Object.keys(grouped).slice(0, 3); // Next 3 days

    days.forEach(day => {
      const entries = grouped[day];

      const temps = entries.map(e => e.main?.temp).filter(Number.isFinite);
      const middayEntry = entries.find(e => new Date(e.dt * 1000).getHours() === 12) || entries[0];

      const condition = middayEntry?.weather?.[0]?.description || 'Unavailable';
      const icon = middayEntry?.weather?.[0]?.icon || '03d';

      forecast[day] = {
        high: `${Math.round(Math.max(...temps))}°C`,
        low: `${Math.round(Math.min(...temps))}°C`,
        condition,
        icon
      };
    });

    return forecast;
  } catch (error) {
    console.error('❌ Error fetching three-day forecast:', error.message);
    return {};
  }
}

module.exports = getThreeDayForecast;