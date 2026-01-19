function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('clock').innerHTML = `
    <strong>${timeString}</strong><br>
    <span>${dateString}</span>
  `;
}

// Update every second
setInterval(updateClock, 1000);
updateClock();



function fetchWeather() {
  const CITY_ID = 6141190;
  const UNITS = 'metric';
  const WEATHER_API_KEY = '358109cc7c1d67419364bfdde1dbc335';

  fetch(`https://api.openweathermap.org/data/2.5/weather?id=${CITY_ID}&units=${UNITS}&appid=${WEATHER_API_KEY}`)
    .then(response => {
      console.log('Fetch response:', response);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      console.log('Weather data:', data);
      if (!data.main || !data.weather) throw new Error('Invalid weather data');

      const temp = Math.round(data.main.temp);
      const condition = data.weather[0].main;
      const icon = data.weather[0].icon;

      const weatherEl = document.getElementById('weather');
      console.log('Weather element:', weatherEl);
      if (weatherEl) {
        weatherEl.innerHTML = `
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${condition}" />
          <span>${temp}°C & ${condition}</span>
        `;
        console.log('✅ Weather injected');
      } else {
        console.warn('❌ #weather element not found');
      }
    })
    .catch(error => {
      console.warn('Weather fetch error:', error);
      const weatherEl = document.getElementById('weather');
      if (weatherEl) {
        weatherEl.innerText = 'Weather module warming up...';
      }
    });
}

document.addEventListener('DOMContentLoaded', fetchWeather);


let headlines = [];
let index = 0;
let retryCount = 0;
const maxRetries = 3;

// Format timestamp for user-friendly display
function formatTimestamp(isoString) {
  const now = new Date();
  const articleDate = new Date(isoString);
  const diffMs = now - articleDate;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffHours === 0) return 'Today';
  return articleDate.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit' 
  });
}

// Sanitize and truncate text
function sanitizeText(text, maxLength = 120) {
  if (!text) return '';
  const clean = text.replace(/[<>]/g, '').trim();
  return clean.length > maxLength ? clean.substring(0, maxLength) + '...' : clean;
}

// Validate news article
function validateArticle(article) {
  return article && 
         article.title && 
         article.title.trim().length > 10 && 
         article.scrapedAt;
}

// Show fallback news when data is unavailable
function showFallbackNews() {
  const headlineEl = document.getElementById('headline');
  const sourceEl = document.getElementById('news-source');
  const timestampEl = document.getElementById('news-timestamp');
  
  if (headlineEl) {
    headlineEl.textContent = "Local news temporarily unavailable. Please check back later.";
  }
  if (sourceEl) sourceEl.textContent = "";
  if (timestampEl) timestampEl.textContent = "";
}

// Show loading state
function showLoadingState() {
  const headlineEl = document.getElementById('headline');
  const sourceEl = document.getElementById('news-source');
  const timestampEl = document.getElementById('news-timestamp');
  
  if (headlineEl) headlineEl.textContent = "Loading latest news...";
  if (sourceEl) sourceEl.textContent = "";
  if (timestampEl) timestampEl.textContent = "";
}

function fetchHeadlinesWithFallback() {
  showLoadingState();
  
  fetch(`news.json?ts=${Date.now()}`) // cache-busting query param
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No news data available');
      }
      
      // Filter and validate articles
      headlines = data.filter(validateArticle);
      
      if (headlines.length === 0) {
        throw new Error('No valid headlines found');
      }
      
      // Sort by most recent
      headlines.sort((a, b) => new Date(b.scrapedAt) - new Date(a.scrapedAt));
      
      index = 0;
      retryCount = 0;
      updateHeadline(); // show first headline immediately
    })
    .catch(err => {
      console.error("News fetch failed:", err);
      retryCount++;
      
      if (retryCount < maxRetries) {
        // Retry after 5 seconds
        setTimeout(() => fetchHeadlinesWithFallback(), 5000);
      } else {
        showFallbackNews();
        retryCount = 0;
      }
    });
}

function updateHeadline() {
  const headlineEl = document.getElementById('headline');
  const sourceEl = document.getElementById('news-source');
  const timestampEl = document.getElementById('news-timestamp');
  
  if (!headlineEl || headlines.length === 0) return;

  const article = headlines[index];
  
  // Update headline with sanitized and truncated text
  headlineEl.textContent = sanitizeText(article.title, 120);
  
  // Update source if available
  if (sourceEl && article.source) {
    sourceEl.textContent = article.source;
  }
  
  // Update timestamp if available
  if (timestampEl && article.scrapedAt) {
    timestampEl.textContent = formatTimestamp(article.scrapedAt);
  }

  // Rotate to next headline
  index = (index + 1) % headlines.length;
}

// Start the loop
fetchHeadlinesWithFallback();
setInterval(updateHeadline, 10000); // rotate every 10 seconds
setInterval(fetchHeadlinesWithFallback, 300000); // refresh data every 5 minutes





function updateBorderWaits() {
  fetch('/api/border-wait')
    .then(res => res.json())
    .then(data => {
      console.log('Parsed data:', data);

      const usPassenger = data.usa.passenger?.USbound || 'N/A';
      const usCommercial = data.usa.commercial?.USbound || 'N/A';
      const caPassenger = data.canada.passenger?.CAbound || 'N/A';
      const caCommercial = data.canada.commercial?.CAbound || 'N/A';

      // Determine last updated timestamp
      let updated = null;

      if (data.usa?.lastUpdated && data.canada?.lastUpdated) {
        const usaTime = new Date(data.usa.lastUpdated).getTime();
        const canadaTime = new Date(data.canada.lastUpdated).getTime();
        updated = new Date(Math.max(usaTime, canadaTime));
      } else if (data.usa?.lastUpdated) {
        updated = new Date(data.usa.lastUpdated);
      } else if (data.canada?.lastUpdated) {
        updated = new Date(data.canada.lastUpdated);
      }

      let timeString = "Unknown";
      let dateString = "Unknown";

      if (updated && !isNaN(updated.getTime())) {
        timeString = updated.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit' });
        dateString = updated.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
      }

      // Update timestamp
      document.getElementById("border-time").innerText =
        `Today: ${dateString} @ ${timeString}`;

      // Helper to determine delay status - improved logic
      const statusClass = (value) => {
        if (!value || value === "N/A" || value.includes("no wait times")) {
          return "no-data";
        }
        if (value === "No Delay" || value === "0 min") {
          return "no-delay";
        }
        // Extract minutes from strings like "5 minutes", "10 min", etc.
        const minutesMatch = value.match(/(\d+)\s*(min|minutes?)/i);
        if (minutesMatch) {
          const minutes = parseInt(minutesMatch[1]);
          if (minutes <= 5) return "minor-delay";
          if (minutes <= 15) return "moderate-delay";
          return "major-delay";
        }
        // Default to delay for any other non-empty value
        return "delay";
      };

      // Helper to render trend arrow
      const trendArrow = (trend) => {
        if (trend === 'up') return '<span class="trend-indicator up">Trend: ↑</span>';
        if (trend === 'down') return '<span class="trend-indicator down">Trend: ↓</span>';
        return '<span class="trend-indicator stable">Trend: →</span>';
      };

      // Extract trends
      const usPassengerTrend = data.usa.trends?.passenger || 'stable';
      const usCommercialTrend = data.usa.trends?.commercial || 'stable';
      const caPassengerTrend = data.canada.trends?.passenger || 'stable';
      const caCommercialTrend = data.canada.trends?.commercial || 'stable';

      // Build HTML cards
      const html = `
  <div class="border-section us-bound">
    <p>Blue Water Bridge → US Bound ${trendArrow(usPassengerTrend)}</p>
    <p data-status="${statusClass(usPassenger)}">
      <span class="icon">🚗</span> Passenger: ${usPassenger}
    </p>
    <p data-status="${statusClass(usCommercial)}">
      <span class="icon">🚛</span> Commercial: ${usCommercial}
    </p>
  </div>

  <div class="border-section ca-bound">
    <p>Blue Water Bridge → Canada Bound ${trendArrow(caPassengerTrend)}</p>
    <p data-status="${statusClass(caPassenger)}">
      <span class="icon">🚗</span> Passenger: ${caPassenger}
    </p>
    <p data-status="${statusClass(caCommercial)}">
      <span class="icon">🚛</span> Commercial: ${caCommercial}
    </p>
  </div>
`;

      const allValues = [usPassenger, usCommercial, caPassenger, caCommercial];
      const allNA = allValues.every(val => val === 'N/A');

      if (allNA) {
        document.getElementById("border-data").innerHTML =
          `<div class="border-section">
             Border wait data currently unavailable or outdated.<br>
             Last checked: ${dateString} @ ${timeString}
           </div>`;
      } else {
        document.getElementById("border-data").innerHTML = html;
      }
    })
    .catch(error => {
      console.error('CBSA fetch failed:', error);
      document.getElementById('border-data').innerHTML =
        `<div class="border-section">Error loading border wait times.</div>`;
    });
}

updateBorderWaits();
setInterval(updateBorderWaits, 60000);

const endpoints = ['/weather/today', '/weather/threeday'];
let current = 0;

const fetchForecasts = async () => {
  try {
    const [todayRes, threeDayRes] = await Promise.all([
      fetch('/weather/today'),
      fetch('/weather/threeday')
    ]);

    const todayData = await todayRes.json();
    const threeDayData = await threeDayRes.json();

    renderToday(todayData);
    renderThreeDay(threeDayData);
  } catch (error) {
    console.error('⚠️ Forecast fetch error:', error.message);
  }
};

const renderToday = (data) => {
  const container = document.getElementById('today-container');
  container.innerHTML = '';

  ['morning', 'afternoon', 'evening'].forEach(time => {
    const icon = data[time].icon;
    console.log(`🧩 ${time} icon URL: https://openweathermap.org/img/wn/${icon}@2x.png`);

    const block = document.createElement('div');
    block.className = 'forecast-card';
    block.innerHTML = `
      <img src="https://openweathermap.org/img/wn/${typeof icon === 'string' ? icon : '03d'}@2x.png" alt="${data[time].condition}" class="weather-icon" />
      <div class="forecast-details">
        <strong>${time.charAt(0).toUpperCase() + time.slice(1)}</strong><br />
        ${data[time].condition}<br />
        ${data[time].temp}<br />
        Wind: ${data[time].wind}
      </div>
    `;
    container.appendChild(block);
  });
};

const renderThreeDay = (data) => {
  const container = document.getElementById('three-day-container');
  container.innerHTML = '';

  Object.entries(data).forEach(([day, info]) => {
  const icon = info.icon;
  console.log(`🧩 ${day} icon URL: https://openweathermap.org/img/wn/${icon}@2x.png`);

  const card = document.createElement('div');
  card.className = 'forecast-card';
  card.innerHTML = `
    <img src="https://openweathermap.org/img/wn/${typeof icon === 'string' ? icon : '03d'}@2x.png" alt="${info.condition}" class="weather-icon" />
    <div class="forecast-details">
      <strong>${day}</strong><br />
      ${info.condition}<br />
      High: ${info.high} | Low: ${info.low}
    </div>
  `;
  container.appendChild(card);
});
};

fetchForecasts();

document.addEventListener('DOMContentLoaded', () => {
  fetch('/weather')
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById('weather-pulse');
      container.innerHTML = '';

      Object.entries(data).forEach(([day, info]) => {
        const card = document.createElement('div');
        card.className = 'weather-card';
        card.innerHTML = `
          <h3>${day}</h3>
          <p><strong>High:</strong> ${info.high}</p>
          <p><strong>Low:</strong> ${info.low}</p>
          <p><strong>Condition:</strong> ${info.condition}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(err => console.error('Weather fetch failed:', err));
});
document.addEventListener('DOMContentLoaded', () => {
// Other module logic...

function fetchViaRailData() {
  const container = document.getElementById('via-rail-data');
  if (!container) return;

  container.innerHTML = '<p>Loading VIA Rail data...</p>';

  fetch('/api/via-rail')
    .then(res => res.json())
    .then(data => {
      if (!data || !data.trains || data.trains.length === 0) {
        container.innerHTML = '<p>No train data available.</p>';
        return;
      }

      const table = document.createElement('table');
      table.classList.add('via-rail-table');

      table.innerHTML = `
        <tr>
          <th>Train</th>
          <th>Scheduled</th>
          <th>Estimated</th>
          <th>Delay (min)</th>
        </tr>`;

      data.trains.forEach(train => {
        if (train.status === 'active') {
          if (train.stations.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>${train.train}</td>
              <td colspan="3">No station data available</td>`;
            table.appendChild(row);
          } else {
            train.stations.forEach(station => {
              const row = document.createElement('tr');
              row.innerHTML = `
                <td>${train.train}</td>
                <td>${station.scheduled}</td>
                <td>${station.expected}</td>
                <td class="delay ${getDelayClass(station.delay)}">${station.delay}</td>`;
              table.appendChild(row);
            });
          }
        } else {
          const row = document.createElement('tr');
          const statusMsg =
            train.status === 'not_found'
              ? 'Train currently not running'
              : `Disabled — last seen at ${formatTime(train.last_seen) || 'unknown'}`;

          row.innerHTML = `
            <td>${train.train}</td>
            <td colspan="3">${statusMsg}</td>`;
          table.appendChild(row);
        }
      });

      container.innerHTML = `<p>Last updated: ${new Date(data.timestamp).toLocaleTimeString('en-US', { timeZone: 'America/Toronto', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>`;
      container.appendChild(table);
    })
    .catch(err => {
      console.error('❌ VIA Rail fetch error:', err);
      container.innerHTML = '<p>Error loading VIA Rail data.</p>';
    });
}

function formatTime(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getDelayClass(delay) {
  const delayNum = parseInt(delay);
  if (isNaN(delayNum) || delayNum === 0) return "on-time";
  if (delayNum <= 5) return "minor-delay";
  if (delayNum <= 15) return "moderate-delay";
  return "major-delay";
}

// INSIDE your existing DOMContentLoaded block:
fetchViaRailData(); // initial load
setInterval(fetchViaRailData, 60000); // refresh every 60 seconds
});


let currentPage = 0;
const pageSize = 8;
let arrivalsCache = [];

function renderTransitTilesPage() {
  const container = document.getElementById('transit-data');
  
  // Check if transit is operating (6:00 AM - 10:45 PM in Sarnia)
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTimeInMinutes = hours * 60 + minutes;
  
  const serviceStartMinutes = 6 * 60; // 6:00 AM
  const serviceEndMinutes = 22 * 60 + 45; // 10:45 PM
  
  // If outside service hours, show friendly message
  if (currentTimeInMinutes < serviceStartMinutes || currentTimeInMinutes >= serviceEndMinutes) {
    const nextServiceTime = currentTimeInMinutes < serviceStartMinutes ? "6:00 AM" : "6:00 AM tomorrow";
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #666;">
        <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">🌙 Transit Service Offline</p>
        <p style="font-size: 0.9rem;">Service resumes at ${nextServiceTime}</p>
        <p style="font-size: 0.8rem; margin-top: 0.5rem; opacity: 0.7;">Operating hours: 6:00 AM - 10:45 PM</p>
      </div>
    `;
    return;
  }
  
  if (!arrivalsCache || arrivalsCache.length === 0) {
    container.textContent = "No current delays";
    return;
  }

  const start = currentPage * pageSize;
  const end = start + pageSize;
  const pageArrivals = arrivalsCache.slice(start, end);

  container.innerHTML = pageArrivals.map(a => {
    // Build rider-facing route label: number + title
    const displayRoute = [
      a.routeShortName || a.routeId,
      a.routeLongName || ""
    ].filter(Boolean).join(" ");

    // Compute average delay from sampleDelays
    const validDelays = (a.sampleDelays || [])
      .map(d => d.delayMinutes)
      .filter(d => typeof d === "number");

    // Add debug logging for null values
    if (a.sampleDelays?.some(d => d.delayMinutes === null)) {
      console.log(`Route ${a.routeShortName}: Null delay values detected and filtered`);
    }

    // Apply 5-minute threshold for display consistency with backend
    const maxDelay = validDelays.length ? Math.max(...validDelays) : null;
    const displayDelay = maxDelay !== null && maxDelay > 5 ? maxDelay : null;

    // Format delay string
    const delayString = displayDelay === null
      ? "on time"
      : displayDelay < 0
        ? `${Math.abs(displayDelay)} min early`
        : `${displayDelay} min late`;

    // Decide CSS class based on status/delay
    let statusClass = "on-time";
    if (a.status.toLowerCase().includes("cancelled")) {
      statusClass = "cancelled";
    } else if (displayDelay === null || displayDelay === 0) {
      statusClass = "on-time";
    } else if (displayDelay > 0 && displayDelay <= 5) {
      statusClass = "minor-delay";
    } else if (displayDelay > 5) {
      statusClass = "delayed";
    }

    return `
      <div class="arrival-card ${statusClass}">
        <strong>${displayRoute}</strong><br>
        Status: ${a.status} (${delayString})
      </div>
    `;
  }).join('');

  // advance page, loop back if needed
  currentPage = (currentPage + 1) % Math.ceil(arrivalsCache.length / pageSize);
}

async function fetchTransitData() {
  try {
    const res = await fetch("/transit.json");
    const data = await res.json();
    arrivalsCache = data.routes;
    currentPage = 0;
    renderTransitTilesPage();
    
    // Update timestamp
    if (data.updatedAt) {
      const timestamp = new Date(data.updatedAt);
      const timeStr = timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      document.getElementById('transit-updated').textContent = `Updated ${timeStr}`;
    }
  } catch (err) {
    console.error("Transit fetch failed:", err);
    showTransitUnavailableBadge();
  }
}

function showTransitUnavailableBadge() {
  document.getElementById('transit-data').textContent = "Transit info unavailable";
}

document.addEventListener('DOMContentLoaded', () => {
  fetchTransitData();
  setInterval(fetchTransitData, 30000);       // refresh data every 30s
  setInterval(renderTransitTilesPage, 10000); // rotate carousel every 10s
  
  // Initialize advertisement carousel
  initAdCarousel();
});

/* ================================================================ */
/* ADVERTISEMENT CAROUSEL                                           */
/* ================================================================ */

function initAdCarousel() {
  let currentAdSlide = 1;
  const totalAdSlides = 3;
  
  function showAdSlide(slideNum) {
    // Remove active class from all slides and dots
    document.querySelectorAll('.ad-slot').forEach(slot => {
      slot.classList.remove('active');
    });
    document.querySelectorAll('.ad-dot').forEach(dot => {
      dot.classList.remove('active');
    });
    
    // Add active class to current slide and dot
    const currentSlot = document.querySelector(`.ad-slot[data-ad="${slideNum}"]`);
    const currentDot = document.querySelector(`.ad-dot[data-slide="${slideNum}"]`);
    
    if (currentSlot) currentSlot.classList.add('active');
    if (currentDot) currentDot.classList.add('active');
  }
  
  function nextAdSlide() {
    currentAdSlide++;
    if (currentAdSlide > totalAdSlides) {
      currentAdSlide = 1;
    }
    showAdSlide(currentAdSlide);
  }
  
  // Add click handlers to dots
  document.querySelectorAll('.ad-dot').forEach(dot => {
    dot.addEventListener('click', function() {
      currentAdSlide = parseInt(this.getAttribute('data-slide'));
      showAdSlide(currentAdSlide);
    });
  });
  
  // Auto-rotate ads every 5 seconds
  setInterval(nextAdSlide, 5000);
  
  // Show first slide
  showAdSlide(currentAdSlide);
}

