const axios = require('axios');

async function getTodayForecast() {
  const LAT = 42.974; // Sarnia
  const LON = -82.4066;
  const UNITS = 'metric';
  const WEATHER_API_KEY = '358109cc7c1d67419364bfdde1dbc335';

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&units=${UNITS}&appid=${WEATHER_API_KEY}`;
    const { data } = await axios.get(url);

    const list = data.list;

    const segments = {
      morning: format(getClosestHour(list, 9)),
      afternoon: format(getClosestHour(list, 15)),
      evening: format(getClosestHour(list, 21))
    };

    return segments;
  } catch (error) {
    console.error('❌ Error fetching today forecast:', error.message);
    return {
      morning: { temp: 'N/A', condition: 'Unavailable', wind: 'N/A', icon: '03d' },
      afternoon: { temp: 'N/A', condition: 'Unavailable', wind: 'N/A', icon: '03d' },
      evening: { temp: 'N/A', condition: 'Unavailable', wind: 'N/A', icon: '03d' }
    };
  }
}

function getClosestHour(entries, targetHour) {
  return entries.reduce((closest, entry) => {
    const hour = new Date(entry.dt * 1000).getHours();
    const diff = Math.abs(hour - targetHour);
    const closestHour = new Date(closest.dt * 1000).getHours();
    return diff < Math.abs(closestHour - targetHour) ? entry : closest;
  });
}

function format(entry) {
  const temp = entry?.main?.temp;
  const condition = entry?.weather?.[0]?.description;
  const wind = entry?.wind?.speed;
  const icon = entry?.weather?.[0]?.icon;

  if (!Number.isFinite(temp) || !condition || !wind || !icon) {
    return {
      temp: 'N/A',
      condition: 'Unavailable',
      wind: 'N/A',
      icon: '03d' // fallback to overcast
    };
  }

  return {
    temp: `${Math.round(temp)}°C`,
    condition,
    wind: `${Math.round(wind)} km/h`,
    icon
  };
}

module.exports = getTodayForecast;