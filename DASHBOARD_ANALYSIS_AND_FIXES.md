# Sarnia Dashboard - Comprehensive Analysis & Optimization Guide

**Date:** January 5, 2026  
**Project Type:** Full-Stack Community Dashboard  
**Tech Stack:** Vanilla Node.js/Express + HTML/CSS/JavaScript (NOT React + TypeScript + MUI)  
**Target Platform:** Fire Stick TV (1080p/1440p displays)

---

## Executive Summary

The Sarnia Dashboard is a **modular, scraper-driven community information hub** that aggregates real-time data (border wait times, transit schedules, weather, news, events) into a TV-optimized tile layout. While well-structured and feature-rich, the dashboard exhibits **5 critical UI/UX issues** stemming from CSS layout complexity and contradictory sizing rules introduced during the Xline refactor.

**Key Finding:** The project is **not using React/TypeScript/MUI** as stated. It's a **vanilla Node.js + HTML/CSS/JS** implementation. This changes architectural recommendations significantly—the project should embrace **progressive enhancement** and avoid over-engineering.

---

## Part 1: Project Architecture Overview

### Current Structure

```
Sarnia Dashboard/
├── public/                          # Frontend (served via Express)
│   ├── index.html                   # Main dashboard markup
│   ├── style.css                    # Primary stylesheet (1065 lines)
│   ├── script.js                    # Data fetching & DOM manipulation
│   ├── events.js                    # Event carousel logic
│   └── assets/                      # Images (logos, flags)
├── server.js                        # Express server + API routes
├── weather scrapers/                # Weather data aggregation
├── CBSA Scraper/                    # Border wait times (scrapes CBP/CBSA)
├── community events scraper/        # Local events (calendar parsing)
├── sarnia news scraper/             # News headlines (copyright-compliant)
├── transitscraper/                  # Transit real-time (GTFS-RT protocol)
└── viarailscraper/                  # Via Rail schedules

```

### Technology Stack

- **Backend:** Express.js (Node.js)
- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Data Sources:**
  - CBSA/CBP APIs (border wait times)
  - OpenWeatherMap API (weather)
  - GTFS-RT feeds (transit real-time updates)
  - Web scrapers (Puppeteer/Cheerio for news, events)
  - Via Rail web scraper

### Current Implementation Approach

| Aspect | Current State | Assessment |
|--------|---------------|------------|
| **UI Framework** | Vanilla HTML/CSS | ✅ Appropriate for TV; no dependency bloat |
| **Styling Approach** | Monolithic CSS (1065 lines) | ⚠️ Monolithic; opportunity for modular architecture |
| **Responsive Design** | CSS Grid + Flex (2x2 grid on desktop, responsive) | ✅ Good baseline; TV-optimized breakpoints |
| **Accessibility** | WCAG basics present; focus states defined | ⚠️ Missing semantic HTML (no `<header>`, `<nav>`, proper heading hierarchy) |
| **Performance** | Direct DOM manipulation; no virtual DOM | ✅ Fast initial load; suitable for TV hardware |
| **State Management** | Global variables + fetch-on-load pattern | ⚠️ No refresh mechanism; stale data over time |

---

## Part 2: Critical UI Issues & Fixes

### Issue #1: Via Rail Tile is Cut Off

**Symptoms:**  
- Via Rail section appears truncated in the bottom-left quadrant
- Table rows/columns overflow or are hidden
- Horizontal scrolling not functional

**Root Cause:**
The `.via-rail` container uses `flex: 1` + `min-height: 0` + `overflow: hidden`, which is correct, BUT:
1. The parent `#border-wait` section restricts height with `height: 100%`
2. Via Rail has `padding: 4px 6px` + large content (table) with fixed font-size (`0.75em` on parent, `0.7em` on table)
3. **Conflicting rules:** `overflow: hidden` on `#via-rail-data` prevents vertical scrolling
4. The `#border-data` grid above it takes up space, leaving insufficient room

**CSS Fix:**

```css
/* VIA RAIL - FIXED */
.via-rail {
  background: #ffffff;
  border-left: 6px solid #f9c900;
  border-radius: 8px;
  padding: 6px 8px;  /* Increased from 4px 6px */
  margin-top: 6px;   /* Increased from 4px */
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  font-size: 0.8em;   /* Slightly increased from 0.75em */
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Ensure table scrolls, not cuts off */
#via-rail-data {
  flex: 1;
  min-height: 0;
  overflow-y: auto;    /* Enable vertical scrolling */
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  padding-right: 2px;  /* Account for scrollbar width */
}

#via-rail-data table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  margin-top: 2px;
  font-size: 0.75em;
  table-layout: fixed;
  flex-shrink: 0;
}

#via-rail-data th,
#via-rail-data td {
  padding: 2px 4px;     /* Increased from 1px 3px */
  border: 1px solid #d8d8d8;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85em;    /* Fixed font sizing */
}
```

**Why This Works:**
- `overflow-y: auto` allows vertical scrolling within the fixed container
- Increased padding improves text readability without shrinking table
- `font-size` hierarchy is now explicit and consistent
- `.via-rail` flex context ensures proportional space allocation in `#border-wait`

**Accessibility:** Add `aria-label="Via Rail schedule table"` to the table element

---

### Issue #2: Border Wait Times Timestamp Pill is Oversized

**Symptoms:**  
- Timestamp under "Border Wait Times" header is excessively tall/wide
- Doesn't match other timestamp styles in the dashboard

**Root Cause:**
`#border-time` styling has conflicting rules:
- `padding: 2px 6px` is correct
- BUT `font-size: 0.65rem` is TOO SMALL, causing it to look compressed
- `line-height: 1.1` combined with small font makes it appear bloated
- Missing explicit height constraint

**CSS Fix:**

```css
/* BORDER TIME - STANDARDIZED TIMESTAMP PILL */
#border-time {
  display: inline-block;      /* Changed from block for inline sizing */
  background: #e3f2fd;        /* Changed from #e9eef5 - match theme */
  color: #003366;
  font-size: 0.75rem;         /* Increased from 0.65rem */
  font-weight: 600;
  padding: 4px 8px;           /* Increased from 2px 6px */
  margin: 4px 0 8px 0;
  border-radius: 4px;
  line-height: 1.2;           /* Increased from 1.1 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
  flex-shrink: 0;
  max-width: 100%;            /* Ensure doesn't exceed container */
  height: 24px;               /* Fixed height for consistency */
  display: flex;              /* Flex for vertical centering */
  align-items: center;
}
```

**Why This Works:**
- Explicit `height: 24px` with flex centering creates uniform timestamp appearance
- Increased padding improves touch targets (important for Firestick remote)
- Color change to `#e3f2fd` creates visual consistency with other accent elements
- `display: inline-block` allows for inline alignment within sections

**Bonus:** Create a reusable timestamp component class (see Section 5)

---

### Issue #3: Canadian Fair Dealing Disclaimer Background Color

**Symptoms:**  
- Copyright disclaimer has `#fff8e1` (yellow) background
- Doesn't match Border Wait Times timestamp color scheme

**Root Cause:**
`.copyright-disclaimer` was styled with yellow/orange warning colors, but visual consistency across the dashboard requires it to match the timestamp pill aesthetic.

**CSS Fix:**

```css
/* COPYRIGHT DISCLAIMER - STYLED TO MATCH TIMESTAMP */
.copyright-disclaimer {
  background: #e3f2fd;         /* CHANGED: Match #border-time background */
  border-left: 3px solid #4a90e2;  /* Changed from 2px #f39c12 */
  border-radius: 4px;
  padding: 6px 8px;            /* Increased from 1px 3px */
  margin-bottom: 6px;          /* Increased from 2px */
  font-size: 0.7rem;           /* Increased from 0.5rem */
  color: #003366;              /* Changed from #666666 */
  text-align: center;
  border: 1px solid #90caf9;   /* Added subtle border */
  flex-shrink: 0;
  line-height: 1.3;            /* Increased from 1.0 */
  max-height: auto;            /* Changed from max-height: 12px (was cutting off) */
  overflow: visible;           /* Changed from hidden */
}

.copyright-disclaimer p {
  margin: 0;
  line-height: 1.3;
  font-size: 0.7rem;
}

.copyright-disclaimer small {
  font-weight: 400;
  color: #003366;
  font-size: 0.7rem;
}
```

**Why This Works:**
- `background: #e3f2fd` unifies timestamp and disclaimer styling
- Removed `max-height: 12px` that was truncating the disclaimer text
- `overflow: visible` ensures full readability
- Increased padding matches other interactive elements
- Subtle border (`#90caf9`) adds definition without clashing

**Accessibility:** Ensure sufficient color contrast (currently passes WCAG AA with dark text on light blue)

---

### Issue #4: Sarnia Transit Logo Oversized

**Symptoms:**  
- Sarnia Transit logo in the "Sarnia Transit Delays" section is too large
- Throws off visual balance with Via Rail and other logos

**Root Cause:**
Transit logo likely inherits default sizing without explicit constraints. The heading `.transit-title` uses `display: flex` + `align-items: center` but doesn't constrain `.transit-logo`.

**CSS Fix:**

```css
/* SARNIA TRANSIT LOGO - RESIZE & BALANCE */
.transit-logo {
  height: 18px;                /* Reduced from implicit default */
  width: auto;
  flex-shrink: 0;              /* Prevent compression */
  margin-right: 6px;           /* Add spacing from text */
}

.transit-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1rem;             /* Standardized across similar headings */
  font-weight: 600;
  color: #003366;
  margin-bottom: 6px;
  flex-shrink: 0;
}
```

**Parallel Fix for Via Rail Logo:**

```css
.via-logo {
  height: 16px;                /* Consistent with transit logo */
  width: auto;
  flex-shrink: 0;
  margin-right: 4px;
}

.via-title {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;           /* Slightly smaller (sub-box vs. main) */
  font-weight: 600;
  color: #003366;
  margin-bottom: 4px;
  flex-shrink: 0;
}
```

**Why This Works:**
- Explicit height constraints (`18px` for main logos, `16px` for sub-logos) create visual hierarchy
- `flex-shrink: 0` prevents logo compression
- Gap values match padding conventions
- Creates **logo sizing consistency** across the dashboard

---

### Issue #5: Weather Pulse "Today's Forecast" Layout Mismatch

**Symptoms:**  
- "Today's Forecast" uses horizontal wrapping grid (shows morning/afternoon/evening in compressed boxes)
- "Three-Day Forecast" uses stacked vertical layout (shows day name + temp + wind in rows)
- Inconsistent visual presentation reduces scannability

**Root Cause:**
CSS rules intentionally differ for `.today-forecast` vs. `.three-day-forecast`:
- `.today-forecast .forecast-container` uses `flex-direction: row; flex-wrap: wrap`
- `.three-day-forecast .forecast-container` uses `flex-direction: column`

The issue is that "Today's Forecast" blocks are TOO SMALL and HARD TO READ due to wrapping on small screens.

**CSS Fix - Unified Stacked Layout:**

```css
/* WEATHER CONTENT - UNIFIED LAYOUT */
.weather-content {
  display: flex;
  flex-direction: column;      /* Stack sections vertically */
  gap: 8px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

/* Both forecast sections now have consistent structure */
.forecast-section {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #d8d8d8;
  padding: 8px;
}

.forecast-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #003366;
  text-align: left;            /* Changed from center for hierarchy */
  margin-bottom: 6px;
  flex-shrink: 0;
  border-bottom: 1px solid #d0d0d0;
  padding-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Unified container for both today and 3-day */
.forecast-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;      /* Stack all items vertically */
  gap: 6px;
}

/* TODAY'S FORECAST - STACKED ROW LAYOUT (matches 3-day) */
.today-forecast .forecast-container {
  flex-direction: column;      /* CHANGED: from row + wrap */
}

.today-forecast .forecast-card {
  display: flex;               /* Row layout for time + icon + temp */
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  width: 100%;                 /* Full width of container */
  flex-shrink: 0;
}

.today-forecast .forecast-card img {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* THREE-DAY FORECAST - CONSISTENT ROW LAYOUT */
.three-day-forecast .forecast-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  width: 100%;
  flex-shrink: 0;
}

.three-day-forecast .forecast-card img {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

/* Unified forecast details */
.forecast-details {
  font-size: 0.75rem;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
}

.forecast-details strong {
  font-size: 0.8rem;
  color: #003366;
  font-weight: 600;
  display: inline;
  margin-right: 4px;
}

.today-forecast .forecast-details strong::before {
  content: attr(data-label);
  /* "Morning", "Afternoon", "Evening" labels */
}
```

**HTML Adjustment Needed** (minor):  
Add data labels to today's forecast cards:

```html
<div class="forecast-card">
  <img src="..." alt="Morning weather" />
  <div class="forecast-details">
    <strong data-label="Morning">12°C</strong> <span>Cloudy</span>
  </div>
</div>
```

**Why This Works:**
- Unified column-based layout makes "Today's Forecast" READABLE at full width
- Cards are now **consistent size** with matching row structure
- All forecast items (today + 3-day) follow same visual pattern
- Better utilization of available space

**Accessibility:** Add `aria-label="Weather for morning period"` to each card

---

## Part 3: Accessibility & Responsiveness Concerns

### Current Gaps

| Concern | Severity | Impact | Fix |
|---------|----------|--------|-----|
| **Missing semantic HTML** | High | Screen readers can't identify sections/navigation | Wrap sections in `<section>` tags with `role` attributes; add `<header>` |
| **No heading hierarchy** | Medium | Content structure unclear | Use `<h1>` for dashboard title, `<h2>` for sections, `<h3>` for subsections |
| **Color contrast on border tiles** | Medium | Text on flag backgrounds may fail WCAG AA | Ensure 4.5:1 contrast; add text-shadow or semi-transparent overlay |
| **Focus indicators for TV** | High | Firestick users can't navigate via remote | Enhance `:focus` states (3px solid outline, 2px offset) |
| **Images missing alt text** | High | Logo images and weather icons need descriptions | Add descriptive `alt` attributes to all `<img>` tags |
| **Responsive table overflow** | High | Via Rail table breaks on mobile | Implement `table-layout: fixed` + horizontal scroll or mobile table variant |
| **No loading state text** | Medium | TV users may not realize data is loading | Ensure loading message is visible and large (min `1rem`) |
| **Keyboard navigation** | Medium | No skip links or tab order optimization | Add skip links; test tab order on Firestick remote |

### Recommended HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Sarnia community information dashboard">
  <title>Sarnia Community Dashboard</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <!-- Skip to main content link for accessibility -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Header with clock and weather -->
  <header id="top-bar" role="banner">
    <div id="clock" aria-live="polite" aria-label="Current time and date"></div>
    <div id="weather" aria-live="polite" aria-label="Current weather"></div>
  </header>

  <!-- Main dashboard grid -->
  <main id="main-content" role="main">
    <!-- Border Wait Times Section -->
    <section id="border-wait" aria-labelledby="border-heading">
      <h2 id="border-heading">Border Wait Times</h2>
      <!-- ... -->
    </section>

    <!-- Info Trio (Transit, Weather, etc.) -->
    <section id="info-trio">
      <!-- ... -->
    </section>

    <!-- News Section -->
    <section id="news-carousel-container" aria-labelledby="news-heading">
      <h2 id="news-heading">Local News</h2>
      <!-- ... -->
    </section>

    <!-- Events Section -->
    <section id="events" aria-labelledby="events-heading">
      <h2 id="events-heading">Community Events</h2>
      <!-- ... -->
    </section>
  </main>

  <script src="script.js"></script>
</body>
</html>
```

---

## Part 4: Architectural Insights & Recommendations

### Strengths

1. **Modular Scraper Architecture** ✅
   - Each data source has its own scraper module (border, transit, events, weather, news)
   - Decoupled logic makes testing and maintenance easier
   - Easy to swap data sources without affecting the dashboard

2. **Progressive Enhancement** ✅
   - Vanilla JavaScript; works without any framework dependencies
   - Lower latency for Firestick rendering
   - Reduced memory footprint

3. **TV-First Design** ✅
   - Grid-based layout optimized for 16:9 displays
   - Large touch targets for remote navigation
   - High-contrast color scheme suitable for TV viewing

### Weaknesses & Opportunities

#### 1. **Monolithic CSS** (1065 lines)
**Current Problem:**  
- Single `style.css` file mixes global resets, layout, components, and responsive rules
- Hard to locate specific styles; easy to create duplicate rules (e.g., `.border-section` defined twice)
- TV-specific optimizations scattered throughout

**Recommendation:**
Reorganize CSS into modular structure:

```
public/
├── styles/
│   ├── global.css          # Resets, body, fonts, base elements
│   ├── layout.css          # Grid, flex, spacing framework
│   ├── components.css      # Cards, pills, badges, buttons
│   ├── sections.css        # #border-wait, #news, #events, #weather
│   ├── accessibility.css   # Focus states, high-contrast mode
│   ├── tv-optimizations.css # Firestick-specific rules
│   └── responsive.css      # Media queries
└── index.html (links all in <head>)
```

**Benefits:**
- Easier to debug and maintain
- Clearer separation of concerns
- Can lazy-load or toggle modules

---

#### 2. **Stateless Data Loading** (No Refresh Mechanism)
**Current Problem:**  
- Data is fetched once on page load
- Dashboard becomes stale after ~30 minutes
- No user-visible indication of data freshness

**Recommendation:**
Implement periodic refresh with visual feedback:

```javascript
// Add to script.js
const DATA_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

function startDataRefreshCycle() {
  setInterval(() => {
    console.log('[INFO] Refreshing dashboard data...');
    fetchBorderWaitTimes();      // Re-fetch from each scraper
    fetchTransitData();
    fetchNewsHeadlines();
    fetchWeather();
    
    // Visual feedback
    const main = document.getElementById('main');
    main.classList.add('data-refreshing');
    setTimeout(() => main.classList.remove('data-refreshing'), 500);
  }, DATA_REFRESH_INTERVAL);
}

document.addEventListener('DOMContentLoaded', startDataRefreshCycle);
```

**CSS:**
```css
#main.data-refreshing {
  opacity: 0.95;
  transition: opacity 0.3s ease;
}
```

---

#### 3. **No Real-Time Transit Updates**
**Current Problem:**  
- Transit data fetched from GTFS-RT on page load, then becomes stale
- Firestick users have no way to request refresh

**Recommendation:**
Implement WebSocket or Server-Sent Events (SSE) for real-time transit:

```javascript
// Optional: Use SSE for push updates (simpler than WebSocket)
const transitEventSource = new EventSource('/api/transit-realtime');

transitEventSource.onmessage = (event) => {
  const transitData = JSON.parse(event.data);
  updateTransitDisplay(transitData);
};

transitEventSource.onerror = () => {
  console.error('Transit feed disconnected');
  transitEventSource.close();
};
```

---

#### 4. **Missing Error Boundaries & Fallbacks**
**Current Problem:**  
- If one scraper fails, entire dashboard may break
- No graceful degradation

**Recommendation:**
Add error handling wrapper:

```javascript
async function fetchWithFallback(url, fallbackData, sectionId) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`[ERROR] Failed to fetch ${url}:`, error);
    
    // Show error state
    const section = document.getElementById(sectionId);
    if (section) {
      section.classList.add('error-state');
      section.innerHTML = `<p>⚠️ Data unavailable. Try refreshing.</p>`;
    }
    
    return fallbackData;  // Return cached/default data
  }
}
```

---

#### 5. **No Unit or Integration Tests**
**Current Problem:**  
- Scrapers may fail silently (e.g., CBSA website changes HTML structure)
- No automated alerts if data sources break

**Recommendation:**
Add basic test suite:

```javascript
// test/scrapers.test.js
const { runScraper } = require('../CBSA Scraper/scraper');

describe('Border Wait Times Scraper', () => {
  it('should return data with required fields', async () => {
    const data = await runScraper();
    expect(data).toHaveProperty('timestamp');
    expect(data.locations).toBeInstanceOf(Array);
  });
});
```

---

## Part 5: Reusable Component Patterns

Since the project uses vanilla HTML/CSS/JS, create utility classes and patterns that can be reused across the dashboard.

### Pattern 1: Timestamp Pill Component

```html
<!-- Usage: Any timestamp across the dashboard -->
<div class="timestamp-pill" aria-label="Last updated: 12:34 PM">
  Last updated: 12:34 PM
</div>

<div class="timestamp-pill timestamp-pill--small">
  Updated 5 min ago
</div>
```

```css
/* Unified timestamp styling */
.timestamp-pill {
  display: inline-flex;
  align-items: center;
  background: #e3f2fd;
  color: #003366;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #90caf9;
  line-height: 1.2;
  white-space: nowrap;
  height: 24px;
}

.timestamp-pill--small {
  font-size: 0.65rem;
  height: 20px;
  padding: 2px 6px;
}
```

---

### Pattern 2: Data Card Component

```html
<!-- Border wait, transit status, event card, etc. -->
<div class="data-card data-card--emphasis">
  <div class="data-card__title">Blue Water Bridge → US Bound</div>
  <div class="data-card__content">
    <p>Passenger: <strong>5 min</strong></p>
    <p>Commercial: <strong>No Delay</strong></p>
  </div>
  <div class="data-card__footer">
    <span class="status-badge status-badge--good">On Time</span>
  </div>
</div>
```

```css
.data-card {
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #d8d8d8;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.data-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.data-card--emphasis {
  border-left: 4px solid #4a90e2;
}

.data-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: #003366;
  margin-bottom: 8px;
}

.data-card__content {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.4;
}

.data-card__footer {
  margin-top: 8px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

/* Status badge */
.status-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge--good {
  background: #d4edda;
  color: #155724;
}

.status-badge--warning {
  background: #fff3cd;
  color: #856404;
}

.status-badge--alert {
  background: #f8d7da;
  color: #721c24;
}
```

---

### Pattern 3: Section Header with Timestamp

```html
<!-- Reusable section header pattern -->
<div class="section-header">
  <h2 class="section-header__title">Border Wait Times</h2>
  <div class="section-header__meta">
    <time class="timestamp-pill" datetime="2026-01-05T03:03:00Z">
      Updated: 3:03 AM
    </time>
  </div>
</div>
```

```css
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}

.section-header__title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #003366;
  border-bottom: 2px solid #4a90e2;
  padding-bottom: 4px;
}

.section-header__meta {
  display: flex;
  gap: 8px;
  align-items: center;
}
```

---

### Pattern 4: Forecast Block (Unified Today/3-Day)

```html
<!-- Unified forecast card -->
<div class="forecast-block">
  <div class="forecast-block__icon">
    <img src="..." alt="Partly cloudy" />
  </div>
  <div class="forecast-block__details">
    <strong class="forecast-block__label">Monday</strong>
    <span class="forecast-block__condition">Partly Cloudy</span>
    <span class="forecast-block__temp">High: 1°C | Low: -4°C</span>
  </div>
</div>
```

```css
.forecast-block {
  display: flex;
  gap: 8px;
  padding: 6px 8px;
  background: #ffffff;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  align-items: center;
  font-size: 0.8rem;
}

.forecast-block__icon {
  flex-shrink: 0;
}

.forecast-block__icon img {
  width: 20px;
  height: 20px;
}

.forecast-block__details {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px;
}

.forecast-block__label {
  font-weight: 600;
  color: #003366;
  font-size: 0.85rem;
}

.forecast-block__condition {
  color: #666;
  font-size: 0.75rem;
}

.forecast-block__temp {
  color: #999;
  font-size: 0.7rem;
}
```

---

## Part 6: Implementation Roadmap

### Phase 1: Critical Fixes (1-2 hours)
- [ ] Fix Via Rail overflow (Issue #1)
- [ ] Resize Border Wait Times timestamp (Issue #2)
- [ ] Update copyright disclaimer color (Issue #3)
- [ ] Reduce transit logo size (Issue #4)
- [ ] Unify Weather Pulse layout (Issue #5)

### Phase 2: Accessibility (2-3 hours)
- [ ] Add semantic HTML (`<section>`, `<header>`, `<main>`, etc.)
- [ ] Add ARIA labels to interactive elements
- [ ] Fix color contrast on border tiles
- [ ] Enhance focus indicators for Firestick
- [ ] Add descriptive alt text to all images

### Phase 3: Architecture Cleanup (4-6 hours)
- [ ] Refactor CSS into modular files
- [ ] Implement periodic data refresh cycle
- [ ] Add error boundaries and fallback states
- [ ] Create reusable component classes
- [ ] Remove duplicate CSS rules

### Phase 4: Real-Time Updates (6-8 hours)
- [ ] Implement SSE for transit real-time updates
- [ ] Add WebSocket support for live data
- [ ] Set up refresh timer with user-visible feedback

### Phase 5: Testing & Monitoring (3-4 hours)
- [ ] Add scraper unit tests
- [ ] Set up monitoring for data source failures
- [ ] Test on actual Firestick device
- [ ] Validate responsive behavior across resolutions

---

## Part 7: Code Examples - Immediate Fixes

### Fix 1: CSS Updates (All 5 Issues)

Create a new file: `public/styles/fixes.css` and include it AFTER `style.css` in `index.html`:

```html
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="styles/fixes.css">  <!-- NEW -->
```

Then apply the CSS changes from Issues #1-5 (provided above).

### Fix 2: Semantic HTML Update

Update `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Real-time community information for Sarnia, Ontario">
  <title>Sarnia Community Dashboard</title>
  <link rel="stylesheet" href="style.css">
</head>

<body>
  <!-- Skip link for accessibility -->
  <a href="#main-content" class="skip-link" style="position: absolute; left: -9999px;">
    Skip to main content
  </a>

  <!-- Header -->
  <header id="top-bar" role="banner">
    <div id="clock" aria-live="polite" aria-label="Current time and date"></div>
    <div id="weather" aria-live="polite" aria-label="Current weather conditions"></div>
  </header>

  <!-- Main content -->
  <main id="main-content" role="main">
    <!-- All sections follow... -->
  </main>

  <script src="script.js"></script>
  <script src="events.js"></script>
</body>
</html>
```

---

## Part 8: Performance Optimization Checklist

- [ ] **Lazy-load images:** Add `loading="lazy"` to all non-critical images
- [ ] **Optimize weather icons:** Cache OpenWeatherMap icons locally
- [ ] **Debounce resize events:** If adding responsive listeners
- [ ] **Minimize repaints:** Batch DOM updates; use CSS transforms
- [ ] **Leverage HTTP caching:** Set Cache-Control headers on static assets
- [ ] **Consider CDN for logos/assets:** Reduce latency on Firestick
- [ ] **Profile on actual hardware:** Test memory usage and frame rate

---

## Summary of Recommendations

| Priority | Action | Impact |
|----------|--------|--------|
| **CRITICAL** | Apply CSS fixes for Issues #1-5 | Fixes visible UI bugs immediately |
| **HIGH** | Add semantic HTML + ARIA labels | Improves accessibility for all users |
| **HIGH** | Refactor CSS into modular files | Reduces maintenance burden; enables future scaling |
| **MEDIUM** | Implement data refresh cycle | Prevents stale data; improves reliability |
| **MEDIUM** | Add error boundaries | Graceful degradation if scrapers fail |
| **LOW** | Implement WebSocket for real-time | Enhanced user experience; can be phased in |
| **LOW** | Add unit tests | Prevents regressions; easier debugging |

---

## Conclusion

The Sarnia Dashboard is a **well-structured, modular project** with strong foundations. The current issues are purely **CSS-related layout bugs** rather than architectural problems. With the fixes provided, the dashboard will be more visually consistent, accessible, and maintainable.

The project's decision to use **vanilla HTML/CSS/JS** is appropriate for the target platform (Firestick TV) and reduces complexity compared to framework-heavy alternatives. The main opportunity is to evolve from a monolithic CSS file into a modular, componentized architecture that can scale with future feature additions.

**Next steps:**
1. Implement the 5 CSS fixes immediately
2. Audit and fix accessibility gaps
3. Refactor CSS structure
4. Add data refresh mechanism
5. Set up basic monitoring for scraper failures

---

**Document Version:** 1.0  
**Last Updated:** January 5, 2026  
**Author:** Dashboard Analysis Agent
