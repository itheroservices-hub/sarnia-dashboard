# Sarnia Dashboard - Implementation Guide for CSS Fixes

**Quick Start:** Apply these fixes in order to resolve all 5 UI issues.

---

## What Was Done

### Files Modified
1. **index.html** - Added semantic HTML and ARIA attributes
2. **style-fixes.css** - Created new file with all CSS corrections (NEW)

### Files Created (Reference)
- `DASHBOARD_ANALYSIS_AND_FIXES.md` - Comprehensive analysis document
- `ACCESSIBILITY_GUIDE.md` - Accessibility improvements guide
- `CSS_IMPLEMENTATION_CHECKLIST.md` - This implementation guide

---

## Step-by-Step Implementation

### Step 1: Verify CSS File is Linked ✅ DONE

Check that `style-fixes.css` is included in `index.html`:

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="...">
  <title>Sarnia Community Dashboard</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="style-fixes.css">  <!-- NEW FILE -->
  <link rel="icon" href="assets/logo/IThero logo with red.png" type="image/png">
</head>
```

**Status:** ✅ Applied to index.html

---

### Step 2: Verify Semantic HTML Updates ✅ DONE

Check that `index.html` has been updated with:
- `<header id="top-bar" role="banner">` instead of `<div>`
- `<main id="main-content" role="main">` instead of `<div>`
- ARIA labels on dynamic content (clock, weather)
- ARIA-labelledby on sections

**Status:** ✅ Applied to index.html

---

### Step 3: Test the Changes

#### Test in Browser (Chrome/Firefox)
1. Open `http://localhost:3000` (or your deployment URL)
2. Verify the following fixes are visibile:

**Issue #1 - Via Rail Tile Overflow:**
- [ ] Via Rail section is fully visible (not cut off)
- [ ] Table is scrollable if content exceeds container
- [ ] Padding around content is consistent

**Issue #2 - Border Wait Times Timestamp:**
- [ ] Timestamp pill is properly sized (not oversized)
- [ ] Text is readable with sufficient padding
- [ ] Height is uniform (~24px)

**Issue #3 - Copyright Disclaimer Color:**
- [ ] Disclaimer background is light blue (#e3f2fd)
- [ ] Border is dark blue (#4a90e2)
- [ ] Text is readable with #003366 color

**Issue #4 - Sarnia Transit Logo:**
- [ ] Transit logo is reduced in size (18px height)
- [ ] Logo doesn't dominate the heading
- [ ] Aligned properly with title text

**Issue #5 - Weather Pulse Layout:**
- [ ] Both "Today's Forecast" and "Three-Day Forecast" use stacked vertical layout
- [ ] Forecast cards are uniform size and shape
- [ ] Cards display time/day + weather icon + temperature in rows

#### Test on Firestick Device
1. Navigate to dashboard on Firestick
2. Use remote arrow keys to navigate
3. Verify focus indicators are visible (blue outline)
4. Ensure all data is readable at TV viewing distance

---

## CSS Changes Summary

### Change 1: Via Rail Container (Issue #1)

| Property | Old | New | Reason |
|----------|-----|-----|--------|
| padding | 4px 6px | 6px 8px | Increase readability |
| font-size | 0.75em | 0.8em | Reduce visual compression |
| #via-rail-data overflow | hidden | overflow-y: auto | Enable vertical scrolling |

**Key Fix:**
```css
#via-rail-data {
  overflow-y: auto;  /* Enable scrolling instead of hiding content */
}
```

---

### Change 2: Border Time Timestamp (Issue #2)

| Property | Old | New | Reason |
|----------|-----|-----|--------|
| display | block | flex | Enable vertical centering |
| background | #e9eef5 | #e3f2fd | Unify color theme |
| font-size | 0.65rem | 0.75rem | Improve readability |
| padding | 2px 6px | 4px 8px | Increase touch target |
| height | auto | 24px | Fixed, consistent height |
| line-height | 1.1 | 1.2 | Better spacing |

**Key Fix:**
```css
#border-time {
  display: flex;
  align-items: center;
  height: 24px;  /* Fixed height for consistency */
}
```

---

### Change 3: Copyright Disclaimer (Issue #3)

| Property | Old | New | Reason |
|----------|-----|-----|--------|
| background | #fff8e1 | #e3f2fd | Match timestamp color |
| border-left | 2px #f39c12 | 3px #4a90e2 | Match theme |
| padding | 1px 3px | 6px 8px | Increase readability |
| font-size | 0.5rem | 0.7rem | Fix tiny text |
| color | #666666 | #003366 | Improve contrast |
| max-height | 12px | auto | Stop cutting off text |
| overflow | hidden | visible | Allow full display |

**Key Fix:**
```css
.copyright-disclaimer {
  max-height: auto;   /* Was 12px - cutting off text */
  overflow: visible;  /* Was hidden */
}
```

---

### Change 4: Transit Logo (Issue #4)

| Property | Old | New | Reason |
|----------|-----|-----|--------|
| .transit-logo height | implicit | 18px | Explicit sizing |
| .transit-title font-size | varies | 1rem | Standardized |
| .via-logo height | implicit | 16px | Consistent across section |

**Key Fix:**
```css
.transit-logo {
  height: 18px;  /* Explicit sizing */
  flex-shrink: 0;  /* Prevent compression */
}
```

---

### Change 5: Weather Pulse Layout (Issue #5)

| Component | Old | New | Reason |
|-----------|-----|-----|--------|
| .weather-content | flex-direction: row | flex-direction: column | Stack sections vertically |
| .today-forecast .forecast-container | flex-direction: row; flex-wrap: wrap | flex-direction: column | Match 3-day layout |
| .today-forecast .forecast-card | Size: small, wrapped | Size: full width, stacked | Improve readability |
| .forecast-card | Varied layout | flex-direction: row (unified) | Consistent across both sections |

**Key Fix:**
```css
.forecast-container {
  flex-direction: column;  /* Stack all items vertically */
}

.today-forecast .forecast-card {
  display: flex;
  flex-direction: row;     /* Horizontal layout within card */
  width: 100%;             /* Full width */
}
```

---

## Verification Checklist

### Visual Verification
- [ ] Via Rail table is visible and scrollable
- [ ] Border timestamp is properly sized
- [ ] Copyright disclaimer has light blue background
- [ ] Transit logo is smaller and balanced
- [ ] Weather forecast cards are stacked uniformly

### Code Verification
- [ ] `style-fixes.css` is linked in `<head>`
- [ ] No console errors in browser DevTools
- [ ] CSS cascade is correct (fixes override base styles)
- [ ] No conflicting rules

### Responsive Verification
- [ ] Desktop (1920x1080): All fixes visible
- [ ] Tablet (768px): Layout adapts appropriately
- [ ] High DPI (2x scale): Text remains readable

### Accessibility Verification
- [ ] Semantic HTML is correct (`<header>`, `<main>`, `<section>`)
- [ ] Skip link is functional
- [ ] Focus indicators are visible (Tab key)
- [ ] ARIA labels are present

---

## Troubleshooting

### Issue: Via Rail table still cut off
**Solution:** Verify `overflow-y: auto` is applied to `#via-rail-data`. Check for conflicting `overflow: hidden` in parent.

```css
#via-rail-data {
  overflow-y: auto !important;  /* Force override if needed */
}
```

### Issue: Timestamp pill is still oversized
**Solution:** Check that style-fixes.css is loaded AFTER style.css. CSS cascade order matters.

```html
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="style-fixes.css">  <!-- Must be AFTER style.css -->
```

### Issue: Weather cards are not stacking
**Solution:** Verify `.forecast-container` has `flex-direction: column`. Check browser DevTools to see applied styles.

```
Elements Inspector > Styles panel > Verify .forecast-container rules
```

### Issue: Focus indicators not visible
**Solution:** Add to style-fixes.css:

```css
*:focus {
  outline: 3px solid #4a90e2 !important;
  outline-offset: 2px !important;
}
```

---

## Performance Impact

**Positive:** ✅
- Fixes don't add new JavaScript
- CSS-only changes (no performance overhead)
- Improved scrollability reduces perceived lag

**Neutral:** 🟡
- Additional CSS file (1 extra HTTP request) - mitigate with CSS minification
- No measurable impact on rendering

**Recommendation:** Merge style-fixes.css into main style.css during production build.

---

## Next Steps After Implementation

1. **Test on Firestick:** Verify all fixes work on actual hardware
2. **Monitor for Issues:** Check console logs after deployment
3. **Get User Feedback:** Ask users if visual improvements are visible
4. **Phase 2 Improvements:** 
   - Refactor CSS into modular files
   - Implement data refresh mechanism
   - Add real-time updates

---

## Files Reference

| File | Purpose | Status |
|------|---------|--------|
| index.html | Main dashboard markup | ✅ Updated |
| style.css | Base styles (no changes) | ✅ Unchanged |
| style-fixes.css | All 5 CSS fixes | ✅ Created |
| script.js | Data fetching logic | ✅ Unchanged |
| events.js | Event carousel | ✅ Unchanged |
| DASHBOARD_ANALYSIS_AND_FIXES.md | Detailed analysis | ✅ Created |
| ACCESSIBILITY_GUIDE.md | A11y improvements | ✅ Created |

---

## Support & Documentation

For detailed information on:
- **Each issue & root cause:** See DASHBOARD_ANALYSIS_AND_FIXES.md
- **Accessibility improvements:** See ACCESSIBILITY_GUIDE.md
- **CSS code patterns:** See style-fixes.css comments
- **Architecture & recommendations:** See DASHBOARD_ANALYSIS_AND_FIXES.md Part 4

---

**Implementation Status:** ✅ Ready for Testing

**Date:** January 5, 2026
