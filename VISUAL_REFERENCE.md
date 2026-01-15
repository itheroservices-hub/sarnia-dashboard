# Visual Reference - Sarnia Dashboard Redesign

**Professional Civic-Grade Dashboard for TV Display**

---

## Overall Layout Structure

```
╔════════════════════════════════════════════════════════════════╗
║                     FIXED HEADER (60px)                        ║
║  ⏰ 14:32 | 📅 Monday, January 5, 2026     ☀️ 2°C, Partly Cloudy ║
╠═════════════════════════╦════════════════════╦════════════════╣
║                         ║                    ║                ║
║  BORDER WAIT TIMES      ║  TRANSIT STATUS    ║  WEATHER PULSE ║
║  🇨🇦 ↔️ 🇺🇸             ║  🚌 Bus Routes      ║  ☀️ Today       ║
║  ─────────────────────  ║  ─────────────────  ║  📊 3-Day       ║
║  Sarnia Bridge: 23 min  ║  Route 1: On-time   ║  ─────────────  ║
║  Blue Water: 18 min     ║  Route 2: +5 min    ║  Morning: 2°C   ║
║  Huron: 15 min          ║  Route 3: Delayed   ║  Afternoon: 4°C ║
║                         ║                    ║  Evening: 1°C   ║
║  🚆 VIA RAIL            ║                    ║                ║
║  ─────────────────────  ║                    ║  Wed: 3°C ☁️    ║
║  Train 643: 14:45       ║                    ║  Thu: -1°C ❄️   ║
║  Toronto: Boarding      ║                    ║  Fri: 2°C ⛅    ║
║                         ║                    ║                ║
║  Train 644: 18:30       ║                    ║                ║
║  Toronto: 5 hours       ║                    ║                ║
║                         ║                    ║                ║
╠════════════════════════╦═══════════════════════════════════════╣
║                        ║                                        ║
║  LOCAL NEWS            ║  COMMUNITY EVENTS                      ║
║  ─────────────────────  ║  ─────────────────────────────────   ║
║                        ║                                        ║
║  📰 New Community      ║  🎉 Sarnia Winter Festival            ║
║     Center Opens       ║     Sat, Jan 10 @ City Hall            ║
║     this Sunday        ║                                        ║
║     (CBC News)         ║  🏒 Knights Hockey Game                ║
║                        ║     Fri, Jan 9 @ Landmark Arena        ║
║                        ║                                        ║
║                        ║  🎨 Local Art Exhibition               ║
║                        ║     Through Feb 15 @ Sarnia Museum     ║
║                        ║                                        ║
╚════════════════════════╩════════════════════════════════════════╝
```

---

## Header Bar (Fixed, Always Visible)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  ⏰ 14:32          📅 Monday, January 5, 2026     ☀️ 2°C, Partly Cloudy
│                                                                │
└────────────────────────────────────────────────────────────────┘

COLOR:  Deep Blue (#003366) gradient to slightly lighter blue
TEXT:   White, bold
HEIGHT: 60px
SPACING: 16px padding on sides, 12px vertical centering
```

### Header Elements

**Left Side (Clock):**
- Large time: `14:32` (1.5rem, monospace font)
- Date below: `Monday, January 5, 2026` (0.9rem)
- Left-aligned

**Right Side (Weather):**
- Weather icon: 32px image
- Temperature + condition: `2°C, Partly Cloudy` (1rem, bold)
- Right-aligned
- Semi-transparent rounded background for visual separation

---

## Main Content Grid

### 3-Column Layout (Desktop View)

```
┌──────────────────┬──────────────────┬──────────────────┐
│    Column 1      │    Column 2      │    Column 3      │
│     (1fr)        │     (1fr)        │     (1fr)        │
├──────────────────┼──────────────────┼──────────────────┤
│   Border Wait    │  Transit Status  │ Weather Forecast │
│   Times          │  (Delays)        │  (Today + 3-Day) │
│   + Via Rail     │                  │                  │
│   (2 rows tall)  │  (2 rows tall)   │  (2 rows tall)   │
├──────────────────┴──────────────────┴──────────────────┤
│              Row 2 (Bottom)                            │
├──────────────────┬──────────────────────────────────────┤
│  Local News      │  Community Events                    │
│  (1 column)      │  (2 columns)                         │
│  (1 row tall)    │  (1 row tall)                        │
└──────────────────┴──────────────────────────────────────┘

Gap between all cells: 12px
Page padding: 16px
```

### Grid Properties
```css
display: grid;
grid-template-columns: repeat(3, 1fr);
grid-template-rows: 1fr 1fr;
gap: 12px;
padding: 16px;
```

---

## Tile / Card Styling

### Base Tile

```
┌─────────────────────────────────┐
│  SECTION TITLE        [Badge]   │ ← Header (Gradient Blue)
├─────────────────────────────────┤
│                                 │
│  Content Area                   │
│  (Scrollable if needed)         │
│                                 │
│                                 │
│                                 │
└─────────────────────────────────┘

Header: Linear gradient (deep blue → lighter blue)
Header text: White, bold
Header padding: 12px 16px
Header border-bottom: 1px divider
Content background: White (#ffffff)
Content padding: 16px
Tile border: 1px solid #d0d0d0
Tile shadow: Subtle (0 2px 4px rgba(0,0,0,0.08))
Border-radius: 6px
```

### Content Scrolling

When content exceeds available height:
- Scrollbar appears on right side
- Custom styling: 8px wide, dark gray thumb
- Content area uses `flex: 1; overflow-y: auto; min-height: 0`

---

## Border Wait Times Tile

```
┌──────────────────────────────────────┐
│ Border Wait Times        [Updated 2m] │ ← Header badge
├──────────────────────────────────────┤
│                                      │
│ ┌────────────┐ ┌────────────┐      │
│ │Sarnia      │ │Blue Water  │      │
│ │Bridge      │ │Bridge      │      │
│ │23 min ↔️    │ │18 min ↔️    │      │
│ │Southbound  │ │Southbound  │      │
│ └────────────┘ └────────────┘      │
│                                      │
│ ┌────────────┐ ┌────────────┐      │
│ │Huron       │ │Bluewater   │      │
│ │Crossing    │ │Port        │      │
│ │15 min ↔️    │ │12 min ↔️    │      │
│ │Northbound  │ │Northbound  │      │
│ └────────────┘ └────────────┘      │
│                                      │
├──────────────────────────────────────┤
│ 🚆 VIA RAIL SCHEDULE                │ ← Sub-section
├──────────────────────────────────────┤
│                                      │
│ ┌─────────────────────────────────┐ │
│ │Train │ Departure │ Status       │ │
│ ├─────────────────────────────────┤ │
│ │ 643  │   14:45   │ Boarding     │ │
│ │ 644  │   18:30   │ On-time      │ │
│ │ 645  │   22:15   │ On-time      │ │
│ └─────────────────────────────────┘ │
│ (Scrollable if more trains)         │
│                                      │
└──────────────────────────────────────┘

Border Cards:
- Background: Light blue (#f0f7ff)
- Border-left: 4px solid #003366
- For high-wait (>30min): Red background, red border-left
- Padding: 12px
- Border-radius: 4px
```

---

## Transit Status Tile

```
┌─────────────────────────────────┐
│ Transit Status                  │ ← Header
├─────────────────────────────────┤
│                                 │
│ Route 1 Eastbound               │
│ ✅ On-time                      │
│                                 │
│ Route 2 Downtown                │
│ ⚠️ +5 minutes delayed           │
│                                 │
│ Route 3 Sarnia East             │
│ ❌ +12 minutes delayed          │
│                                 │
│ Route 4 Waterfront              │
│ ✅ On-time                      │
│                                 │
│ Route 5 North Sarnia            │
│ (Scrollable)                    │
│                                 │
└─────────────────────────────────┘

Arrival Cards:
- Left border: 4px (green for on-time, red for delayed)
- Background: Light gray for on-time, light red for delayed
- Padding: 12px
- Flexbox: info on left, status badge on right
- Status badges: Small pill with colored background
```

---

## Weather Forecast Tile

```
┌────────────────────────────────┐
│ Weather Pulse                  │ ← Header
├────────────────────────────────┤
│                                │
│ TODAY                          │ ← Subsection title
│ ─────────────────────────────  │
│                                │
│ ☀️ Morning: 2°C               │
│    Sunny, Light wind           │
│                                │
│ 🌤️ Afternoon: 4°C             │
│    Partly Cloudy, 15km/h wind  │
│                                │
│ 🌙 Evening: 1°C                │
│    Clear skies                 │
│                                │
│ FORECAST                       │ ← Subsection title
│ ─────────────────────────────  │
│                                │
│ ☁️ Wednesday: 3°C              │
│    Cloudy, High of 5°C         │
│                                │
│ ❄️ Thursday: -1°C              │
│    Light snow, High of 1°C     │
│                                │
│ ⛅ Friday: 2°C                 │
│    Partly Cloudy, High of 4°C  │
│                                │
└────────────────────────────────┘

Forecast Cards:
- Display as rows (icon | temp | info)
- Background: Light gray (#f5f7fa)
- Border-left: 3px solid accent color
- Padding: 8px 12px
- Gap between cards: 8px
- Icons: 40px tall (if needed)
```

---

## News Tile

```
┌──────────────────────────────────┐
│ Local News                       │ ← Header
├──────────────────────────────────┤
│                                  │
│ 📰 Fair Dealing Disclaimer       │ ← Info box
│ News displayed under Canadian    │
│ fair dealing provisions.         │
│                                  │
├──────────────────────────────────┤
│                                  │
│ New Community Center Opens       │ ← Headline
│ in Sarnia This Sunday            │
│                                  │
│ 📰 CBC News  |  Updated 3h ago   │ ← Metadata
│                                  │
├──────────────────────────────────┤
│ (Auto-scrolls between headlines) │
│                                  │
└──────────────────────────────────┘

Copyright Disclaimer:
- Background: Light blue (#f0f7ff)
- Border-left: 3px solid red (#d62828)
- Padding: 12px
- Font-size: 0.85rem
- Italic text
```

---

## Events Tile

```
┌──────────────────────────────────┐
│ Community Events                 │ ← Header
├──────────────────────────────────┤
│                                  │
│ 🎉 Sarnia Winter Festival        │ ← Event title
│    Saturday, Jan 10 @ City Hall  │
│    Annual winter celebration     │ ← Description
│                                  │
│ 🏒 Knights Hockey Game           │ ← Event title
│    Friday, Jan 9 @ Landmark Arena│
│    Semi-final playoff match      │
│                                  │
│ 🎨 Local Art Exhibition          │ ← Event title
│    Through Feb 15 @ Museum       │
│    "Winter in Sarnia" showcase   │
│                                  │
│ 📚 Library Book Sale             │ ← Event title
│    Sat-Sun, Jan 11-12 @ Main Lib │
│    Used books, records, CDs      │
│ (Scrollable)                     │
│                                  │
└──────────────────────────────────┘

Event Cards:
- Background: Light blue gradient (#f0f7ff → white)
- Border-left: 4px solid #003366
- Hover effect: Shadow increases, border turns red
- Padding: 12px
- Border-radius: 4px
- Gap between cards: 12px
```

---

## Colors Used (Civic Palette)

```
Primary Blue      #003366  ███████  Deep, authoritative
Primary Light     #004d99  ███████  Slightly lighter
Accent Red        #d62828  ███████  Alerts, delays
Success Green     #06a77d  ███████  On-time, positive
Warning Orange    #f77f00  ███████  Weather warnings
Text Dark         #1a1a1a  ███████  Dark text (high contrast)
Text Light        #ffffff  ███████  White text on dark
Background Light  #f5f7fa  ███████  Page background
Card White        #ffffff  ███████  Card backgrounds
Border Gray       #d0d0d0  ███████  Dividers
Text Gray         #666666  ███████  Secondary text
```

### Usage
- **Primary Blue:** Headers, titles, navigation
- **Accent Red:** Alerts, delays, urgent info
- **Success Green:** On-time status
- **Warning Orange:** Weather warnings
- **Gray text:** Secondary info, timestamps
- **White cards:** Primary content containers

---

## Typography Scale

```
Heading 2 (1.3rem)          SECTION TITLES
Bold, Deep Blue, Primary content

Heading 3 (1.1rem)          Sub-titles
Bold, Primary color, section divisions

Heading 4 (0.95rem)         Small titles
Bold, Dark text, card headers

Body Text (0.95rem)         Normal content
Regular weight, dark text, readable from 10ft

Small Text (0.85rem)        Metadata
Regular weight, gray text, secondary info

Monospace (Monaco, 1.5rem)  Time display
Bold, white on blue, fixed-width font
```

### Font Family
```
System fonts (best for clarity on TV):
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
"Helvetica Neue", sans-serif
```

---

## Spacing Scale

```
Tiny (2px)          Dividers, inner gaps
Small (4px)         Gaps between small elements
Medium (8px)        Content padding, card gaps
Large (12px)        Section padding, header spacing
XL (16px)           Tile padding, page margins
2XL (24px)          Section spacing
3XL (32px)          Large section gaps
```

### Examples
- Between tiles: 16px (--spacing-xl)
- Inside tile padding: 16px (--spacing-xl)
- Header padding: 12px vertical, 16px horizontal (--spacing-lg, --spacing-xl)
- Card gaps: 8px (--spacing-md)
- Border card spacing: 8px (--spacing-md)

---

## Responsive Breakpoints

### Desktop (1280px+)
```
3-column grid (Border | Transit | Weather)
All sections visible at once
Header: 60px
Fonts: Default (1.3rem, 1.1rem, 0.95rem)
NO scrolling on main page
```

### Tablet (768px - 1280px)
```
2-column grid (Top row adapts)
Header: 50px
Fonts: Slightly smaller (1.1rem, 0.95rem, 0.85rem)
Single scroll in main area
```

### Mobile (Below 768px)
```
1-column stack (vertical)
Header: 80px (time and weather stack)
Fonts: Small (0.9rem, 0.8rem, 0.75rem)
Content scrolls vertically
```

### 4K TV (2560px+)
```
Same 3-column grid
Header: 80px (larger)
Fonts: Very large (1.6rem, 1.3rem, 1.1rem)
Spacing: Increased (20px+ gaps)
Easier reading from distance
```

---

## Interaction States

### Hover (Cards)
```
Before:  Box-shadow: 0 2px 4px rgba(0,0,0,0.08)
After:   Box-shadow: 0 4px 8px rgba(0,0,0,0.12)
Effect:  Card appears to lift slightly
```

### Focus (Tab Navigation)
```
Outline: 2px solid #d62828 (red accent)
Offset: 2px from element
Visible on all interactive elements
High contrast for accessibility
```

### Data Loading
```
Spinner: Rotating circle, 32px, 1s rotation
Text: "Loading..." shown in content area
Hidden when data loads
```

### Data Error
```
Icon: ⚠️ Warning emoji
Text: "Data unavailable" in red
Shown if API fails
```

---

## Animation & Transitions

### Smooth Transitions
```css
transition: all 200ms ease;
```
Applied to:
- Hover state changes (shadows)
- Scrollbar color changes
- Border color changes on events

### No Page Load Animations
- Dashboard renders instantly
- No fade-in, slide-in, or spinning animations
- Professional appearance takes priority

### Scrollbar Animation
```css
Thumb color: #d0d0d0 (normal)
Thumb color: #666666 (hover)
Transition: 200ms smooth
```

---

## Summary

This redesign transforms the Sarnia Dashboard into a **professional, municipal-grade civic information display** that:

✅ **Fits on one screen** - No scrolling for main content  
✅ **Always shows header** - Time, date, weather always visible  
✅ **Large, readable fonts** - Designed for TV viewing (10ft+)  
✅ **Professional aesthetic** - Deep blue + red accents (civic palette)  
✅ **Consistent spacing** - Generous gaps, breathing room  
✅ **Clear visual hierarchy** - Titles > content > metadata  
✅ **Responsive** - Works on any screen size  
✅ **Accessible** - High contrast, keyboard navigation  

The design is clean, readable, and suitable for a public, government-facing information panel.
