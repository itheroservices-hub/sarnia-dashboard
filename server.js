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

// VIA Rail scraper every 5 minutes
setInterval(() => {
  exec(`node "${path.join(__dirname, 'viarailscraper', 'railscraper.js')}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ VIA Rail scraper error: ${error.message}`);
      return;
    }
    console.log(`🚆 VIA Rail scraper ran at startup`);
  });
}, 5 * 60 * 1000);

// CBSA scraper every 5 minutes
setInterval(runScraper, 5 * 60 * 1000);

// -----------------------------
// NEW: Copyright-Compliant Sarnia News Scraper
// -----------------------------
setInterval(() => {
  exec('node "sarnia news scraper/copyright_compliant_scraper.js"', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ Copyright-compliant news scraper error: ${error.message}`);
      return;
    }
    console.log(`📰 Copyright-compliant news scraper ran at ${new Date().toLocaleString()}`);
  });
}, 20 * 60 * 1000);

// Run copyright-compliant news scraper immediately on startup
exec('node "sarnia news scraper/copyright_compliant_scraper.js"', (error) => {
  if (error) console.error("❌ Initial copyright-compliant news scraper failed:", error.message);
  else console.log("📰 Initial copyright-compliant news scrape complete");
});

// -----------------------------
// Safe runner for scheduled scrapes
// -----------------------------
async function runAllScrapers() {
  console.log('[INFO] runAllScrapers starting', new Date().toISOString());

  // Community events
  try {
    if (typeof runEventsScraper === 'function') {
      console.log('[DEBUG] Running community events scraper...');
      await runEventsScraper();
      console.log('[INFO] community events scraper finished');
    }
  } catch (err) {
    console.error('[ERROR] community events scraper failed:', err.stack || err);
  }

  // Transit
  try {
    if (typeof buildTransitPulse === 'function') {
      console.log('[DEBUG] Running transit pulse builder...');
      await buildTransitPulse();
      console.log('[INFO] transit pulse builder finished');
    }
  } catch (err) {
    console.error('[ERROR] transit pulse builder failed:', err.stack || err);
  }

  console.log('[INFO] runAllScrapers finished', new Date().toISOString());
}

// Run once immediately and schedule every 15 minutes
// runAllScrapers().catch(err => console.error('[ERROR] initial runAllScrapers failed:', err.stack || err));
// setInterval(runAllScrapers, 15 * 60 * 1000);

// Initial run
// runScraper();

// -----------------------------
// Start Server
// -----------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://192.168.2.38:${PORT}`);
});

