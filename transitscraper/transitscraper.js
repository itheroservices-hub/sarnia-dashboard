/**
 * transitscraper.js
 *
 * Route-level On Time / Delayed aggregator for Sarnia Transit.
 * - Robust static CSV loading (BOM cleanup, delimiter auto-detect)
 * - Tolerant tripId indexing and lookup
 * - Prefer local tripupdates.pb and alerts.pb for offline testing
 * - Writes route_status.json for dashboard consumption
 *
 * Dependencies:
 *   npm install node-fetch gtfs-realtime-bindings csv-parse
 *
 * Place this file in transitscraper/ and put routes.txt, trips.txt, stops.txt,
 * and optional tripupdates.pb / alerts.pb in the same folder (or update CONFIG).
 */

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

// Ensure fetch exists (Node 18+ has global fetch)
let fetchFn = global.fetch;
try { if (!fetchFn) fetchFn = require('node-fetch'); } catch (e) { fetchFn = global.fetch; }

const CONFIG = {
  static: {
    routesFile: path.join(__dirname, 'routes.txt'),
    tripsFile: path.join(__dirname, 'trips.txt'),
    stopsFile: path.join(__dirname, 'stops.txt')
  },
  realtime: {
    tripUpdatesLocal: path.join(__dirname, 'tripupdates.pb'),
    alertsLocal: path.join(__dirname, 'alerts.pb'),
    tripUpdatesUrl: 'https://metrolinx.tmix.se/gtfs-realtime-sarnia/tripupdates.pb', // fallback
    alertsUrl: null,
    timeoutMs: 12_000
  },
  thresholds: {
    delayMinutesThreshold: 5,
    percentDelayedThreshold: 0.20,
    majorDelayMinutes: 15
  },
  outputFile: path.join(__dirname, 'route_status.json'),
  debugSampleLimit: 10
};

// In-memory stores (populated per run)
let routesMeta = new Map();      // route_id and shortName -> meta
let tripsToRoutes = new Map();   // trip_id -> route_id
let tripIdIndex = new Map();     // variant -> route_id
let stopsLookup = new Map();     // stop_id -> stop_name

// Unmatched tripId sample collector (logged at end of a run)
const unmatchedSample = new Set();
function sampleUnmatched(id) {
  if (!id) return;
  unmatchedSample.add(id);
  if (unmatchedSample.size > 1000) unmatchedSample.clear(); // soft cap
}

// -----------------------------
// Helpers
// -----------------------------
function normalizeHex(hex) {
  if (!hex) return null;
  const clean = String(hex).trim().replace(/^#/, '').toUpperCase();
  return /^[0-9A-F]{6}$/.test(clean) ? `#${clean}` : null;
}
function getContrastingTextColor(bgHex) {
  const hex = normalizeHex(bgHex);
  if (!hex) return '#000000';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 186 ? '#000000' : '#FFFFFF';
}
function removeBOM(text) {
  return text.replace(/^\uFEFF/, '');
}
function detectDelimiter(sample) {
  const counts = {
    ',': (sample.match(/,/g) || []).length,
    ';': (sample.match(/;/g) || []).length,
    '\t': (sample.match(/\t/g) || []).length
  };
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  return best || ',';
}
function safeParseCsv(text) {
  const sample = text.split(/\r?\n/).slice(0, 5).join('\n');
  const delimiter = detectDelimiter(sample);
  return parse(text, { columns: true, skip_empty_lines: true, trim: true, delimiter });
}
function buildTripIdVariants(t) {
  const s = String(t || '').trim();
  const variants = new Set();
  if (!s) return [];
  variants.add(s);
  variants.add(s.split(':').pop());
  variants.add(s.split('_')[0]);
  const digits = s.replace(/\D+/g, '');
  if (digits) variants.add(digits);
  if (s.length >= 2) variants.add(s.slice(0, 2));
  if (s.length >= 3) variants.add(s.slice(0, 3));
  if (s.length >= 4) variants.add(s.slice(0, 4));
  return Array.from(variants).filter(Boolean);
}
function buildTripIdIndex() {
  tripIdIndex = new Map();
  for (const [tripId, routeId] of tripsToRoutes.entries()) {
    const variants = buildTripIdVariants(tripId);
    for (const v of variants) {
      if (!tripIdIndex.has(v)) tripIdIndex.set(v, routeId);
    }
  }
}
function findStaticRouteForTrip(tripId) {
  const t = String(tripId || '').trim();
  if (!t) return null;
  if (tripsToRoutes.has(t)) return tripsToRoutes.get(t);
  const variants = buildTripIdVariants(t);
  for (const v of variants) {
    if (tripIdIndex.has(v)) return tripIdIndex.get(v);
  }
  for (const [k, routeId] of tripIdIndex.entries()) {
    if (t.includes(k) || k.includes(t)) return routeId;
  }
  sampleUnmatched(t);
  return null;
}
async function readRealtimeFromFile(pbPath) {
  const buffer = await fs.promises.readFile(pbPath);
  return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
}
async function fetchRealtimeFromUrl(url, timeoutMs) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchFn(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
    const buffer = await res.arrayBuffer();
    return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
  } finally {
    clearTimeout(id);
  }
}

// -----------------------------
// Load static GTFS (robust)
// -----------------------------
async function loadStatic() {
  try {
    const files = [CONFIG.static.routesFile, CONFIG.static.tripsFile, CONFIG.static.stopsFile];
    for (const f of files) {
      console.log('[DEBUG] Checking file:', f, 'exists?', fs.existsSync(f));
      if (fs.existsSync(f)) {
        const stat = fs.statSync(f);
        console.log('[DEBUG] size:', stat.size, 'bytes');
        const sample = fs.readFileSync(f, 'utf8').split(/\r?\n/).slice(0, 6).map((l, i) => `${i+1}: ${l}`);
        console.log('[DEBUG] first lines:\n' + sample.join('\n'));
      }
    }

    // routes
    const routesRaw = await fs.promises.readFile(CONFIG.static.routesFile, 'utf8');
    const routesText = removeBOM(routesRaw);
    const routes = safeParseCsv(routesText);
    routesMeta = new Map();
    for (const r of routes) {
      const routeId = String(r.route_id || r.RouteID || r.RouteId || '').trim();
      if (!routeId) continue;
      const routeColor = normalizeHex(r.route_color || r.routeColor) || '#FFFFFF';
      const textColor = normalizeHex(r.route_text_color || r.routeTextColor) || getContrastingTextColor(routeColor);
      const shortName = String(r.route_short_name || r.routeShortName || r.route_short || '').trim() || routeId;
      const longName = String(r.route_long_name || r.routeLongName || '').trim() || '';
      const meta = { routeId, shortName, longName, color: routeColor, textColor };
      routesMeta.set(routeId, meta);
      routesMeta.set(shortName, meta);
    }
    console.log('[INFO] Loaded routes:', routes.length);

    // trips
    const tripsRaw = await fs.promises.readFile(CONFIG.static.tripsFile, 'utf8');
    const tripsText = removeBOM(tripsRaw);
    const trips = safeParseCsv(tripsText);
    tripsToRoutes = new Map();
    for (const t of trips) {
      const tripId = String(t.trip_id || t.TripID || '').trim();
      const routeId = String(t.route_id || t.RouteID || '').trim();
      if (tripId && routeId) tripsToRoutes.set(tripId, routeId);
    }
    console.log('[INFO] Loaded trips:', trips.length);

    // stops
    const stopsRaw = await fs.promises.readFile(CONFIG.static.stopsFile, 'utf8');
    const stopsText = removeBOM(stopsRaw);
    const stops = safeParseCsv(stopsText);
    stopsLookup = new Map();
    for (const s of stops) {
      const stopId = String(s.stop_id ?? s['\ufeffstop_id'] ?? s.StopID ?? '').trim();
      const stopName = String(s.stop_name ?? s.stopName ?? '').trim();
      if (stopId) stopsLookup.set(stopId, stopName);
    }
    console.log('[INFO] Loaded stops:', stops.length);

    buildTripIdIndex();
    console.log('[INFO] tripIdIndex built with', tripIdIndex.size, 'entries');
  } catch (err) {
    console.error('[ERROR] loadStatic failed:', err.stack || err);
  }
}

// -----------------------------
// Aggregate route statuses
// -----------------------------
function aggregateRouteStatus(feed) {
  const routeBuckets = new Map();
  const entities = Array.isArray(feed?.entity) ? feed.entity : [];
  for (const e of entities) {
    const tu = e.tripUpdate;
    if (!tu) continue;
    const tripId = tu.trip?.tripId || tu.trip?.trip_id || null;
    const routeId = findStaticRouteForTrip(tripId);
    if (!routeId) continue;
    const updates = tu.stopTimeUpdate || [];
    const nextStu = updates[0] || null;
    const delaySec = nextStu?.arrival?.delay ?? nextStu?.departure?.delay ?? null;
    const delayMin = typeof delaySec === 'number' ? Math.round(delaySec / 60) : null;
    if (!routeBuckets.has(routeId)) routeBuckets.set(routeId, []);
    routeBuckets.get(routeId).push({ tripId, delayMin });
  }

  const results = [];
  for (const [routeId, trips] of routeBuckets.entries()) {
    const meta = routesMeta.get(routeId) || { routeId, shortName: routeId, color: '#FFFFFF', textColor: '#000000' };
    const total = trips.length;
    
    // Normalize null delays to 0 for consistent calculations
    const normalizedTrips = trips.map(t => ({ 
      ...t, 
      delayMin: t.delayMin === null ? 0 : t.delayMin 
    }));
    
    const delayedTrips = normalizedTrips.filter(t => t.delayMin > CONFIG.thresholds.delayMinutesThreshold);
    const majorDelayExists = normalizedTrips.some(t => t.delayMin > CONFIG.thresholds.majorDelayMinutes);
    const percentDelayed = total ? delayedTrips.length / total : 0;
    let status = 'On Time';
    if (majorDelayExists || percentDelayed >= CONFIG.thresholds.percentDelayedThreshold) status = 'Delayed';
    results.push({
      routeId: meta.routeId,
      routeShortName: meta.shortName,
      routeLongName: meta.longName || null,
      color: meta.color,
      textColor: meta.textColor,
      status,
      totalActiveTrips: total,
      delayedTrips: delayedTrips.length,
      percentDelayed: Math.round(percentDelayed * 100),
      sampleDelays: normalizedTrips.slice(0, 3).map(t => ({ tripId: t.tripId, delayMinutes: t.delayMin }))
    });
  }

  // ensure all canonical routes appear
  const seen = new Set(results.map(r => r.routeId));
  for (const meta of new Set(Array.from(routesMeta.values()))) {
    if (!meta || !meta.routeId) continue;
    if (!seen.has(meta.routeId)) {
      results.push({
        routeId: meta.routeId,
        routeShortName: meta.shortName,
        routeLongName: meta.longName || null,
        color: meta.color,
        textColor: meta.textColor,
        status: 'No Active Trips',
        totalActiveTrips: 0,
        delayedTrips: 0,
        percentDelayed: 0,
        sampleDelays: []
      });
    }
  }

  return results.sort((a, b) => {
    const na = parseInt(a.routeShortName, 10);
    const nb = parseInt(b.routeShortName, 10);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    return a.routeShortName.localeCompare(b.routeShortName);
  });
}

// -----------------------------
// Load realtime feeds (local preferred)
// -----------------------------
async function loadRealtimeFeeds() {
  let tripFeed = null;
  let alertFeed = null;
  try {
    if (fs.existsSync(CONFIG.realtime.tripUpdatesLocal)) {
      tripFeed = await readRealtimeFromFile(CONFIG.realtime.tripUpdatesLocal);
      console.log('[INFO] Loaded tripupdates.pb from disk');
    } else if (CONFIG.realtime.tripUpdatesUrl) {
      tripFeed = await fetchRealtimeFromUrl(CONFIG.realtime.tripUpdatesUrl, CONFIG.realtime.timeoutMs);
      console.log('[INFO] Fetched trip updates from remote');
    } else {
      console.warn('[WARN] No trip updates source configured');
    }
  } catch (err) {
    console.error('[ERROR] Failed to load trip updates:', err.message);
  }

  try {
    if (fs.existsSync(CONFIG.realtime.alertsLocal)) {
      alertFeed = await readRealtimeFromFile(CONFIG.realtime.alertsLocal);
      console.log('[INFO] Loaded alerts.pb from disk');
    } else if (CONFIG.realtime.alertsUrl) {
      alertFeed = await fetchRealtimeFromUrl(CONFIG.realtime.alertsUrl, CONFIG.realtime.timeoutMs);
      console.log('[INFO] Fetched alerts from remote');
    }
  } catch (err) {
    console.error('[ERROR] Failed to load alerts:', err.message);
  }

  return { tripFeed, alertFeed };
}

// -----------------------------
// Apply alerts override
// -----------------------------
function applyAlertsToStatuses(statuses, alertFeed) {
  if (!alertFeed || !Array.isArray(alertFeed.entity)) return statuses;
  const routeAlerts = new Set();
  for (const e of alertFeed.entity) {
    const alert = e.alert;
    if (!alert) continue;
    const informed = alert.informedEntity || [];
    for (const inf of informed) {
      if (inf.routeId) routeAlerts.add(String(inf.routeId).trim());
      if (inf.route_id) routeAlerts.add(String(inf.route_id).trim());
    }
  }
  return statuses.map(s => (routeAlerts.has(s.routeShortName) || routeAlerts.has(s.routeId)) ? { ...s, status: 'Service Alert' } : s);
}

// -----------------------------
// Main pulse builder
// -----------------------------
async function buildRouteStatusPulse() {
  try {
    // clear unmatched samples for this run
    unmatchedSample.clear();

    await loadStatic();
    const { tripFeed, alertFeed } = await loadRealtimeFeeds();
    const statuses = tripFeed ? aggregateRouteStatus(tripFeed) : [];
    const final = applyAlertsToStatuses(statuses, alertFeed);
    const output = { updatedAt: new Date().toISOString(), routes: final };

    await fs.promises.writeFile(CONFIG.outputFile, JSON.stringify(output, null, 2));
    console.log('[INFO] route_status.json updated with', final.length, 'routes');

    // log any unmatched samples (debug) once per run
    if (unmatchedSample.size) {
      console.warn('[WARN] Unmatched tripId samples:', Array.from(unmatchedSample).slice(0, CONFIG.debugSampleLimit));
    }

    return output;
  } catch (err) {
    console.error('[ERROR] buildRouteStatusPulse failed:', err.stack || err);
    const fallback = { updatedAt: new Date().toISOString(), routes: [] };
    try { await fs.promises.writeFile(CONFIG.outputFile, JSON.stringify(fallback, null, 2)); } catch {}
    return fallback;
  }
}

// -----------------------------
// Exports (no auto-run on require)
// -----------------------------
// Export under both names so server.js can import either
module.exports = {
  buildRouteStatusPulse,
  buildTransitPulse: buildRouteStatusPulse
};
