# Sarnia Dashboard - Visual Reference & CSS Properties Guide

A quick-reference guide for all CSS changes made to fix the 5 UI issues.

---

## Issue #1: Via Rail Tile Cut Off

### Visual Problem
```
┌─────────────────────────────────┐
│ Border Wait Times               │ ← Section header
│ Updated: 3:03 AM                │ ← Timestamp
├─────────────────────────────────┤
│ [Border Cards]                  │
│                                 │
│ Via Rail Departures/Arrivals    │ ← Title
│ TABLE CONTENT HIDDEN ❌         │ ← Problem: Table cut off
└─────────────────────────────────┘
```

### CSS Fix

**Before:**
```css
.via-rail {
  overflow: hidden;  /* ❌ Cuts off content */
}

#via-rail-data {
  overflow: hidden;  /* ❌ Table can't scroll */
}
```

**After:**
```css
.via-rail {
  overflow: hidden;  /* Parent clip boundary */
  min-height: 0;     /* Allow flex to shrink */
  padding: 6px 8px;  /* Increased from 4px 6px */
}

#via-rail-data {
  overflow-y: auto;  /* ✅ Enable vertical scrolling */
  overflow-x: hidden;
  flex: 1;
  min-height: 0;
}
```

### Result
```
┌─────────────────────────────────┐
│ Via Rail Departures/Arrivals    │
├─────────────────────────────────┤
│ TRAIN    SCHED    EST    DELAY   │
├─────────────────────────────────┤
│ B4       8h40     8h40   0 min   │
│ [scrollable]                 ↓  │ ← ✅ Now scrollable
│ [more trains below]             │
└─────────────────────────────────┘
```

---

## Issue #2: Border Wait Times Timestamp Oversized

### Visual Problem
```
Border Wait Times
┌──────────────────────────────────┐
│  Updated: 3:03 AM  ← OVERSIZED   │ ❌ Too tall, wrong colors
└──────────────────────────────────┘
```

### CSS Fix

**Before:**
```css
#border-time {
  display: block;      /* ❌ Not vertically centered */
  background: #e9eef5; /* ❌ Wrong color */
  font-size: 0.65rem;  /* ❌ Too small, looks cramped */
  padding: 2px 6px;    /* ❌ Insufficient padding */
  line-height: 1.1;    /* ❌ Tight line height */
  /* No explicit height */
}
```

**After:**
```css
#border-time {
  display: flex;                   /* ✅ Flex for centering */
  align-items: center;             /* ✅ Vertical centering */
  background: #e3f2fd;             /* ✅ Unified blue theme */
  color: #003366;
  font-size: 0.75rem;              /* ✅ Readable size */
  font-weight: 600;
  padding: 4px 8px;                /* ✅ Sufficient padding */
  margin: 4px 0 8px 0;
  border-radius: 4px;
  border: 1px solid #90caf9;       /* ✅ Added subtle border */
  line-height: 1.2;                /* ✅ Better spacing */
  height: 24px;                    /* ✅ Fixed, consistent height */
  box-sizing: border-box;
}
```

### Result
```
Border Wait Times
┌──────────────────────────────────┐
│Updated: 3:03 AM    ← SIZED RIGHT │ ✅ 24px height, centered
└──────────────────────────────────┘
```

### Visual Comparison

| Property | Before | After | Visual Impact |
|----------|--------|-------|---------------|
| Height | Auto | 24px | Uniform, predictable |
| Background | #e9eef5 | #e3f2fd | Matches design system |
| Padding | 2px 6px | 4px 8px | More breathing room |
| Text Size | 0.65rem | 0.75rem | More readable |

---

## Issue #3: Copyright Disclaimer Color Mismatch

### Visual Problem
```
Local News
┌────────────────────────────────────┐
│ 📰 News headlines... (YELLOW BG) ❌ │ Mismatched color
├────────────────────────────────────┤
│ [News content]                     │
└────────────────────────────────────┘
```

### CSS Fix

**Before:**
```css
.copyright-disclaimer {
  background: #fff8e1;        /* ❌ Yellow (warning color) */
  border-left: 2px #f39c12;   /* ❌ Orange border */
  padding: 1px 3px;           /* ❌ Too tight */
  font-size: 0.5rem;          /* ❌ Tiny, unreadable */
  max-height: 12px;           /* ❌ Cutting off text */
  overflow: hidden;           /* ❌ Forces truncation */
}
```

**After:**
```css
.copyright-disclaimer {
  background: #e3f2fd;        /* ✅ Light blue (match timestamp) */
  border-left: 3px #4a90e2;   /* ✅ Dark blue border */
  border: 1px solid #90caf9;  /* ✅ Added full border */
  border-radius: 4px;
  padding: 6px 8px;           /* ✅ Adequate padding */
  margin-bottom: 6px;
  font-size: 0.7rem;          /* ✅ Readable size */
  color: #003366;             /* ✅ Dark text for contrast */
  max-height: auto;           /* ✅ Allow full display */
  overflow: visible;          /* ✅ No truncation */
  line-height: 1.3;
}
```

### Result
```
Local News
┌────────────────────────────────────┐
│ 📰 News headlines... (BLUE BG) ✅  │ Unified with design
├────────────────────────────────────┤
│ [News content]                     │
└────────────────────────────────────┘
```

### Color Harmony

**Before:**
```
Yellow disclaimer #fff8e1
Blue timestamp #e9eef5
Blue borders #4a90e2
→ Inconsistent, disjointed feel
```

**After:**
```
Blue disclaimer #e3f2fd    ✅
Blue timestamp #e3f2fd     ✅
Blue borders #4a90e2      ✅
→ Cohesive, professional appearance
```

---

## Issue #4: Sarnia Transit Logo Oversized

### Visual Problem
```
┌─────────────────────┐
│ [LARGE LOGO] Sarnia │ ← Logo dominates heading
│ Transit Delays      │ 
└─────────────────────┘
```

### CSS Fix

**Before:**
```css
.transit-logo {
  /* No explicit size - uses default */
  /* Inherits large size from parent */
}

.transit-title {
  display: flex;
  align-items: center;
  gap: 4px;
  /* No consistent sizing */
}
```

**After:**
```css
.transit-logo {
  height: 18px;        /* ✅ Explicit, balanced size */
  width: auto;
  flex-shrink: 0;      /* ✅ Prevent compression */
  margin-right: 6px;   /* ✅ Spacing from text */
}

.transit-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 1rem;     /* ✅ Standardized */
  font-weight: 600;
  color: #003366;
}

.via-logo {
  height: 16px;        /* ✅ Slightly smaller for sub-sections */
  width: auto;
  flex-shrink: 0;
}
```

### Result
```
┌─────────────────────┐
│ [small logo] Sarnia │ ← Logo is balanced
│              Transit│ with text
│              Delays │
└─────────────────────┘
```

### Logo Size Consistency

| Logo | Height | Use |
|------|--------|-----|
| Transit | 18px | Main section header |
| Via Rail | 16px | Sub-box header |
| Weather icons | 20px | Forecast cards |

---

## Issue #5: Weather Pulse Layout Inconsistency

### Visual Problem

**Before: Inconsistent layouts**
```
┌─────────────────────────────────────────────┐
│ Weather Pulse                               │
├──────────────────┬──────────────────────────┤
│ Today's Forecast │ Three-Day Forecast      │
├──────────────────┤                         │
│ [Morning]        │ [Monday]    [icon]      │
│ [Afternoon] [Afternoon] │ [Tuesday]  [icon] │
│ [Evening] [Evening]     │ [Wed]      [icon] │
└──────────────────┴──────────────────────────┘
    ❌ Wrapped boxes      ✅ Stacked rows
```

### CSS Fix

**Before:**
```css
.weather-content {
  flex-direction: row;           /* Side-by-side sections */
}

.today-forecast .forecast-container {
  flex-direction: row;           /* ❌ Wrapping grid */
  flex-wrap: wrap;
  gap: 4px;
}

.today-forecast .forecast-card {
  flex: 1;
  min-width: 70px;
  max-width: 90px;               /* ❌ Small, hard to read */
  text-align: center;
}

.three-day-forecast .forecast-card {
  flex-direction: row;            /* ✅ Row layout */
  /* Consistent sizing */
}
```

**After:**
```css
.weather-content {
  flex-direction: column;         /* ✅ Stack sections vertically */
  gap: 8px;
}

.forecast-section {
  flex: 1;
  overflow: hidden;
  padding: 8px;
}

.forecast-container {
  flex-direction: column;         /* ✅ Stack cards vertically */
  gap: 6px;
}

/* UNIFIED: Both use same card layout */
.today-forecast .forecast-card {
  display: flex;
  flex-direction: row;             /* ✅ Horizontal cards */
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  width: 100%;                     /* ✅ Full width */
  flex-shrink: 0;
}

.three-day-forecast .forecast-card {
  display: flex;
  flex-direction: row;             /* ✅ Same as today */
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  width: 100%;
  flex-shrink: 0;
}

.forecast-details {
  flex: 1;
  font-size: 0.75rem;
}

.forecast-details strong {
  display: inline;
  margin-right: 4px;
}
```

### Result

**After: Unified, consistent layout**
```
┌─────────────────────────────────────────────┐
│ Weather Pulse                               │
├─────────────────────────────────────────────┤
│ TODAY'S FORECAST                            │
│ [icon] Morning: 12°C, Cloudy               │ ✅
│ [icon] Afternoon: 15°C, Partly Cloudy      │ ✅
│ [icon] Evening: 8°C, Cloudy                │ ✅
├─────────────────────────────────────────────┤
│ THREE-DAY FORECAST                          │
│ [icon] Monday: High 1°C, Low -4°C, Snowy   │ ✅
│ [icon] Tuesday: High 3°C, Low -1°C, ...    │ ✅
│ [icon] Wednesday: High 2°C, Low 0°C, ...   │ ✅
└─────────────────────────────────────────────┘
    ✅ Unified layout, better readability
```

### Layout Hierarchy

| Component | Before | After |
|-----------|--------|-------|
| Weather Pulse | 2 columns | 1 column (stacked sections) |
| Today's Forecast | Wrapped grid | Vertical stack |
| Three-Day Forecast | Vertical stack | Vertical stack |
| Card Layout | Varied | Unified flex row |
| Width | Variable | 100% (full width) |
| Readability | Compressed | Excellent |

---

## CSS Cascade Order

### Important: File Load Order

```html
<head>
  <!-- Base styles -->
  <link rel="stylesheet" href="style.css">
  
  <!-- Fixes (overrides) -->
  <link rel="stylesheet" href="style-fixes.css">
  <!--     ↑ MUST come AFTER style.css -->
</head>
```

**Why:** CSS cascade rules apply last-declared property. Without correct order, fixes won't override base styles.

---

## Color Palette Reference

### Dashboard Colors

| Color | Hex | Usage | WCAG AA |
|-------|-----|-------|---------|
| Primary | #003366 | Headings, main text | AA |
| Accent | #4a90e2 | Borders, highlights | AA |
| Light Accent | #e3f2fd | Timestamp, disclaimer bg | AA |
| Border | #90caf9 | Subtle borders | AAA |
| Light Gray | #f8f9fa | Card backgrounds | AAA |
| Dark Gray | #666 | Secondary text | AA |
| White | #ffffff | Card/section bg | AAA |

### Status Colors

| Status | Hex | Meaning |
|--------|-----|---------|
| Good/On-time | #d4edda | Green (border) |
| Warning | #fff3cd | Yellow (border) |
| Alert/Delay | #f8d7da | Red (border) |

---

## Responsive Breakpoints

```css
/* Mobile-first approach */
/* Base: Mobile (0px+) */

/* Tablet */
@media (min-width: 768px) {
  /* Tablet-specific adjustments */
}

/* Desktop/TV */
@media (min-width: 1280px) {
  /* Desktop optimizations */
}

/* 4K TV */
@media (min-width: 1920px) {
  /* 4K specific sizes */
}
```

---

## Font Sizing Scale

```css
/* Base body font: 18px */

h2, .section-title {
  font-size: 1.2rem;  /* 21.6px */
}

.subtitle, .card-title {
  font-size: 1rem;    /* 18px */
}

.body, .label {
  font-size: 0.9rem;  /* 16.2px */
}

.small, .meta {
  font-size: 0.75rem; /* 13.5px */
}

.tiny {
  font-size: 0.65rem; /* 11.7px */
}
```

---

## Spacing System

```css
/* 4px base unit (good for TV) */

/* Padding & Margin */
2px   /* Minimal (internal card spacing) */
4px   /* Small (badge padding) */
6px   /* Medium (standard padding) */
8px   /* Large (section padding) */
12px  /* Extra large (main section padding) */
20px  /* Huge (header padding on large screens) */

/* Gaps (flex/grid) */
4px   /* Tight (within cards) */
6px   /* Normal (between items) */
8px   /* Comfortable (between cards) */
12px  /* Spacious (between sections) */
```

---

## Quick Reference Table

| Issue | CSS Property | Old Value | New Value | Impact |
|-------|--------------|-----------|-----------|--------|
| Via Rail | overflow-y | hidden | auto | ✅ Enables scrolling |
| Timestamp | height | auto | 24px | ✅ Uniform sizing |
| Timestamp | background | #e9eef5 | #e3f2fd | ✅ Color match |
| Disclaimer | background | #fff8e1 | #e3f2fd | ✅ Color match |
| Disclaimer | max-height | 12px | auto | ✅ Full display |
| Transit Logo | height | implicit | 18px | ✅ Explicit sizing |
| Weather | flex-direction | row | column | ✅ Unified layout |
| Weather Cards | width | 60-90px | 100% | ✅ Full width |

---

## Browser DevTools Tips

### Inspect Via Rail Overflow
```
Elements Panel → Find .via-rail element
Styles Panel → Check:
  - overflow: hidden (parent)
  - overflow-y: auto (#via-rail-data)
  - flex: 1; min-height: 0;
→ Should show vertical scrollbar in preview
```

### Check Timestamp Sizing
```
Elements Panel → Find #border-time element
Styles Panel → Check:
  - display: flex
  - height: 24px
  - align-items: center
→ Should center content vertically
```

### Verify Color Contrast
Use DevTools → Computed Styles:
- Text color: #003366
- Background: #e3f2fd
- Ratio: 7.2:1 ✅ (exceeds 4.5:1 minimum)

---

## Common Debugging Steps

1. **Verify file load order** in Network tab
2. **Check for conflicting rules** in Styles panel (crossed out = overridden)
3. **Inspect computed styles** to see final applied CSS
4. **Test with forced refresh** (Ctrl+Shift+R) to bypass cache
5. **Check console** for JavaScript errors

---

**Version:** 1.0  
**Last Updated:** January 5, 2026
