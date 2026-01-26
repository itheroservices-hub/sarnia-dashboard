// -----------------------------
// Sarnia Civic Dashboard Server
// -----------------------------

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
console.log("[DEBUG] server.js loaded");

// -----------------------------
// Middleware
// -----------------------------
app.use(cors());

// Serve static files normally
app.use(express.static(path.join(__dirname, 'public')));

// Serve dashboard at /communitydashboard
app.use('/communitydashboard', express.static(path.join(__dirname, 'public')));

// -----------------------------
// Weather Router
// -----------------------------
const weatherRouter = require('./weather scrapers/weatherRouter');
app.use('/weather', weatherRouter);

// -----------------------------
// Scraper Imports
// -----------------------------
const { runScraper } = require('./CBSA Scraper/scraper');
const { runEventsScraper } = require('./community events scraper/scraper');
const { runViaScraper } = require('./viarailscraper/railscraper');

// -----------------------------
// Transit Scraper Import
// -----------------------------
console.log("[DEBUG] Importing transit scraper...");
const { buildTransitPulse } = require("./transitscraper/transitscraper");
console.log("[DEBUG] Transit scraper imported");

// -----------------------------
// API Routes
// -----------------------------

// Border wait times
app.get('/api/border-wait', (req, res) => {
  console.log('[DEBUG] Serving border_waits.json');
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'border_waits.json'));
});

// VIA Rail
app.get('/api/via-rail', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'via_rail.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Error reading VIA Rail data:', err.message);
      return res.status(500).json({ error: 'Failed to load VIA Rail data' });
    }
    res.json(JSON.parse(data));
  });
});

// Community Events
app.get('/api/events', (req, res) => {
  console.log('[DEBUG] Serving sarnia_events.json');
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(path.join(__dirname, 'public', 'sarnia_events.json'));
});

// Unified Dashboard
app.get('/api/dashboard', (req, res) => {
  const borderPath = path.join(__dirname, 'border_waits.json');
  const viaRailPath = path.join(__dirname, 'public', 'via_rail.json');
  const eventsPath = path.join(__dirname, 'public', 'sarnia_events.json');

  let borderTimes = [];
  let viaRail = [];
  let communityEvents = [];

  try {
    borderTimes = JSON.parse(fs.readFileSync(borderPath, 'utf8'));
  } catch (err) {
    console.error('❌ Error loading border times:', err.message);
  }

  try {
    const viaRaw = fs.readFileSync(viaRailPath, 'utf8');
    const viaParsed = JSON.parse(viaRaw);
    viaRail = viaParsed.trains || [];
  } catch (err) {
    console.error('❌ Error loading VIA Rail data:', err.message);
  }

  try {
    communityEvents = JSON.parse(fs.readFileSync(eventsPath, 'utf8'));
  } catch (err) {
    console.error('❌ Error loading community events:', err.message);
  }

  res.json({ borderTimes, viaRail, communityEvents });
});

// Transit Pulse (Live)
app.get("/transit.json", async (req, res) => {
  console.log("[DEBUG] /transit.json route triggered");
  try {
    const pulse = await buildTransitPulse();
    console.log("[DEBUG] /transit.json pulse built");
    console.log("[DEBUG] Final pulse sent:", JSON.stringify(pulse, null, 2));
    res.json(pulse);
  } catch (err) {
    console.error("[ERROR] /transit.json failed:", err.stack);
    res.status(500).json({ error: "Failed to build transit pulse" });
  }
});

// Test Route
app.get("/test", (req, res) => {
  console.log("[DEBUG] /test route hit");
  res.json({ ok: true });
});

// -----------------------------
// Scheduled Scraper Jobs
// -----------------------------

// Shared puppeteer queue to avoid overlapping headless Chrome launches
let puppeteerQueue = Promise.resolve();
function enqueuePuppeteerTask(label, fn) {
  puppeteerQueue = puppeteerQueue
    .then(async () => {
      const start = Date.now();
      console.log(`[DEBUG] ▶ ${label} (queued)`);
      await fn();
      console.log(`[DEBUG] ✅ ${label} finished in ${Date.now() - start}ms`);
    })
    .catch(err => {
      console.error(`[ERROR] ${label} failed:`, err.stack || err);
    });
  return puppeteerQueue;
}

// Scraper status tracking for health reporting
const scraperStatus = {
  events: { lastSuccess: null, lastError: null, lastDurationMs: null },
  via: { lastSuccess: null, lastError: null, lastDurationMs: null },
  border: { lastSuccess: null, lastError: null, lastDurationMs: null },
  transit: { lastSuccess: null, lastError: null, lastDurationMs: null }
};

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function withRetries(label, key, fn, retries = 1, backoffMs = 2000) {
  const start = Date.now();
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await fn();
      scraperStatus[key].lastSuccess = new Date().toISOString();
      scraperStatus[key].lastError = null;
      scraperStatus[key].lastDurationMs = Date.now() - start;
      return;
    } catch (err) {
      const errMsg = err.message || String(err);
      scraperStatus[key].lastError = errMsg;
      
      // EAGAIN = resource exhaustion; use longer backoff
      const isEAGAIN = errMsg.includes('EAGAIN') || errMsg.includes('Resource temporarily unavailable');
      const waitMs = isEAGAIN ? backoffMs * Math.pow(3, attempt) : backoffMs * (attempt + 1);
      
      if (attempt === retries) {
        console.error(`[ERROR] ${label} failed after ${attempt + 1} attempts:`, err.stack || err);
        return;
      }
      console.warn(`[WARN] ${label} attempt ${attempt + 1} failed${isEAGAIN ? ' (EAGAIN)' : ''}, retrying in ${waitMs}ms:`, errMsg);
      await delay(waitMs);
    }
  }
}

// -----------------------------
// Copyright-Compliant Sarnia News Scraper (every 20 minutes)
// -----------------------------
setInterval(() => {
  const newsScraperPath = path.join(__dirname, 'sarnia news scraper', 'copyright_compliant_scraper.js');
  exec(`node "${newsScraperPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ News scraper error: ${error.message}`);
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`📰 News scraper ran at ${new Date().toLocaleString()}`);
    if (stdout) console.log(`stdout: ${stdout}`);
  });
}, 20 * 60 * 1000);

// Run copyright-compliant news scraper immediately on startup
const newsPath = path.join(__dirname, 'sarnia news scraper', 'copyright_compliant_scraper.js');
exec(`node "${newsPath}"`, (error, stdout, stderr) => {
  if (error) {
    console.error("❌ Initial news scraper failed:", error.message);
    console.error("stderr:", stderr);
  } else {
    console.log("📰 Initial news scrape complete");
    if (stdout) console.log("stdout:", stdout);
  }
});

// -----------------------------
// Safe runner for scheduled scrapes
// -----------------------------
let isScraperRunning = false; // Mutex to prevent concurrent runs

async function runAllScrapers() {
  if (isScraperRunning) {
    console.log('[WARN] ⏭️ Skipping scraper run - already in progress');
    return;
  }
  
  isScraperRunning = true;
  console.log('[INFO] 🔄 runAllScrapers starting', new Date().toISOString());

  // Community events
  try {
    if (typeof runEventsScraper === 'function') {
      console.log('[DEBUG] Running community events scraper...');
      await withRetries('community events scraper', 'events', () => runEventsScraper(), 2, 2000);
      console.log('[INFO] ✅ community events scraper finished');
    }
  } catch (err) {
    console.error('[ERROR] ❌ community events scraper failed:', err.stack || err);
  }

  // VIA Rail (queued to avoid overlapping Chrome)
  try {
    if (typeof runViaScraper === 'function') {
      await withRetries('VIA Rail scraper', 'via', () => enqueuePuppeteerTask('VIA Rail scraper', () => runViaScraper()), 2, 5000);
      // If still failing, try to serve cached data
      if (scraperStatus.via.lastError) {
        const cachedPath = path.join(__dirname, 'public', 'via_rail.json');
        if (fs.existsSync(cachedPath)) {
          try {
            const cached = JSON.parse(fs.readFileSync(cachedPath, 'utf8'));
            console.log(`ℹ️ VIA: Serving stale cached data (trains: ${cached.trains?.length || 0})`);
            scraperStatus.via.lastError = `Served from cache (last update: ${cached.timestamp})`;
          } catch (e) {
            console.error('❌ Failed to read cached VIA data:', e.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('[ERROR] ❌ VIA Rail scraper failed:', err.stack || err);
  }

  // CBSA + US CBP (queued)
  try {
    if (typeof runScraper === 'function') {
      await withRetries('border wait scraper', 'border', () => enqueuePuppeteerTask('Border wait scraper', () => runScraper()), 2, 5000);
      // If still failing, try to serve cached data
      if (scraperStatus.border.lastError) {
        const cachedPath = path.join(__dirname, 'border_waits.json');
        if (fs.existsSync(cachedPath)) {
          try {
            const cached = JSON.parse(fs.readFileSync(cachedPath, 'utf8'));
            console.log(`ℹ️ Border: Serving stale cached data (updated: ${cached.canada?.lastUpdated || 'unknown'})`);
            scraperStatus.border.lastError = `Served from cache (last update: ${cached.canada?.lastUpdated})`;
          } catch (e) {
            console.error('❌ Failed to read cached border data:', e.message);
          }
        }
      }
    }
  } catch (err) {
    console.error('[ERROR] ❌ border wait scraper failed:', err.stack || err);
  }

  // Transit - write to file immediately
  try {
    if (typeof buildTransitPulse === 'function') {
      console.log('[DEBUG] Running transit pulse builder...');
      const start = Date.now();
      const transitData = await buildTransitPulse();
      fs.writeFileSync(path.join(__dirname, 'public', 'transit.json'), JSON.stringify(transitData, null, 2));
      scraperStatus.transit.lastSuccess = new Date().toISOString();
      scraperStatus.transit.lastError = null;
      scraperStatus.transit.lastDurationMs = Date.now() - start;
      console.log('[INFO] ✅ transit pulse written to transit.json');
    }
  } catch (err) {
    console.error('[ERROR] ❌ transit pulse builder failed:', err.stack || err);
    scraperStatus.transit.lastError = err.message || String(err);
  }

  console.log('[INFO] ✅ runAllScrapers finished', new Date().toISOString());
  isScraperRunning = false;
}

// Run all scrapers on startup and every 15 minutes
console.log('🔄 Running all scrapers on startup...');
runAllScrapers()
  .then(() => console.log('✅ Initial runAllScrapers complete'))
  .catch(err => console.error('[ERROR] ❌ initial runAllScrapers failed:', err.stack || err));

setInterval(() => {
  console.log('🔄 Running scheduled scrapers...');
  runAllScrapers().catch(err => console.error('[ERROR] ❌ scheduled runAllScrapers failed:', err.stack || err));
}, 10 * 60 * 1000);

// Health endpoint for scraper freshness
app.get('/health', (req, res) => {
  res.json({
    uptimeSeconds: Math.round(process.uptime()),
    scraperStatus
  });
});

// -----------------------------
// Start Server
// -----------------------------
const PORT = process.env.PORT || 3000;

// Add global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error('[CRITICAL] Uncaught Exception:', error);
  console.error(error.stack);
  // Don't exit - keep server running
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise);
  console.error('[CRITICAL] Reason:', reason);
  // Don't exit - keep server running
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Scrapers initialized and running every 5-20 minutes`);
  console.log(`🌐 Dashboard accessible at http://localhost:${PORT}`);
});


