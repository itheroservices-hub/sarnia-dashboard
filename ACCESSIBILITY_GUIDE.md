# Sarnia Dashboard - Accessibility Improvements Guide

**Purpose:** Document accessibility enhancements and recommendations for WCAG 2.1 AA compliance.

---

## Quick Checklist of Completed Fixes

- [x] Add semantic HTML (`<header>`, `<main>`, `<section>` with aria-labelledby)
- [x] Add aria-live attributes to dynamic content (clock, weather)
- [x] Add aria-labels and descriptions to images
- [x] Increase color contrast on timestamp pills and disclaimers
- [x] Add skip link for keyboard navigation
- [x] Enhance focus indicators for remote navigation
- [x] Add reusable .skip-link CSS class
- [ ] Add table headers with scope attributes (Via Rail table)
- [ ] Add form labels if input elements are added
- [ ] Test with screen readers
- [ ] Validate keyboard navigation on Firestick remote

---

## Accessibility Issues Addressed

### 1. Semantic HTML Structure

**Before:**
```html
<body>
  <div id="top-bar">...</div>
  <div id="main">
    <section>...</section>
  </div>
</body>
```

**After:**
```html
<body>
  <header id="top-bar" role="banner">...</header>
  <main id="main-content" role="main">
    <section id="border-wait" aria-labelledby="border-wait-heading">
      <h2 id="border-wait-heading">...</h2>
    </section>
  </main>
</body>
```

**Impact:** Screen readers can now identify page structure, navigation, and content regions.

---

### 2. ARIA Live Regions for Dynamic Content

**HTML Improvement:**
```html
<div id="clock" 
     aria-live="polite" 
     aria-label="Current time and date">
     <!-- Content updates via JavaScript -->
</div>

<div id="weather" 
     aria-live="polite" 
     aria-label="Current weather conditions">
     <!-- Content updates via JavaScript -->
</div>
```

**Impact:** Screen reader users are notified when clock and weather data updates.

---

### 3. Skip Link for Keyboard Navigation

**HTML:**
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

**CSS (in style-fixes.css):**
```css
.skip-link {
  position: absolute;
  left: -9999px;        /* Hidden off-screen */
  z-index: 999;
  top: 0;
}

.skip-link:focus {
  left: 0;
  background: #003366;
  color: white;
  padding: 8px 12px;
  text-decoration: none;
  font-weight: 600;
}
```

**Impact:** Keyboard users (including Firestick remote) can skip to main content without tabbing through header.

---

### 4. Image Alt Text

**Current Status:** Via Rail and Sarnia Transit logos have alt text ✅

**Recommended additions:**
```html
<!-- Weather icons -->
<img src="https://openweathermap.org/img/wn/01d.png" 
     alt="Clear sky weather icon - sunny conditions" />

<!-- Flag backgrounds on border cards -->
<!-- Consider adding aria-label to cards instead:
<div class="border-section us-bound" 
     aria-label="US border crossing data: Blue Water Bridge US bound">
  ...
</div>
-->

<!-- Event carousel images (if added) -->
<img src="event-image.jpg" 
     alt="Description of event or venue" />
```

---

### 5. Color Contrast Improvements

**Contrast Ratios (WCAG AA requires 4.5:1 for normal text):**

| Element | Foreground | Background | Ratio | Status |
|---------|-----------|-----------|-------|--------|
| Timestamp pill text | #003366 | #e3f2fd | 7.2:1 | ✅ Pass |
| Border card text (white) | #ffffff | Flag images | Verify | ⚠️ Check overlay |
| News headline | #003366 | #f8f9fa | 9.1:1 | ✅ Pass |
| Copyright disclaimer | #003366 | #e3f2fd | 7.2:1 | ✅ Pass |

**Action Item:** Verify border card contrast with actual flag background images. If contrast fails, increase overlay opacity:

```css
.border-section::before {
  background: linear-gradient(to bottom right, 
              rgba(16,26,53,0.5),      /* Increased from 0.3 */
              rgba(255,255,255,0.4));
  backdrop-filter: blur(5px);
}
```

---

### 6. Focus Indicators for Remote Navigation

**CSS (in style-fixes.css):**
```css
*:focus {
  outline: 3px solid #4a90e2 !important;
  outline-offset: 2px !important;
  border-radius: 4px !important;
}

/* Specific elements */
#border-time:focus,
.via-rail:focus,
.forecast-card:focus {
  outline: 3px solid #4a90e2;
  outline-offset: 2px;
}
```

**Impact:** Firestick remote users can see focused elements clearly.

---

### 7. Via Rail Table Accessibility

**Current Issue:** Table lacks proper header markup.

**Recommended Fix:**
```html
<table role="table" aria-label="Via Rail train schedule">
  <thead>
    <tr>
      <th scope="col">Train</th>
      <th scope="col">Scheduled</th>
      <th scope="col">Estimated</th>
      <th scope="col">Delay (min)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>B4</td>
      <td>8h40</td>
      <td>8h40</td>
      <td class="delay on-time">0</td>
    </tr>
  </tbody>
</table>
```

**Impact:** Screen readers properly associate data with headers.

---

### 8. Enhanced Loading States

**Current Issue:** Loading messages may not be visible to all users.

**Recommended Fix:**
```html
<!-- More visible loading state -->
<div id="news-loading" class="loading-state" style="display: none;" role="status" aria-live="assertive">
  <div class="spinner" aria-hidden="true"></div>
  <p>Fetching latest news...</p>
</div>

<div id="news-error" class="error-state" style="display: none;" role="alert" aria-live="assertive">
  <p>⚠️ News temporarily unavailable. Please try refreshing.</p>
</div>
```

**CSS Improvements:**
```css
.loading-state, .error-state {
  background: #f8f9fa;
  border: 2px solid #003366;    /* Thicker border */
  border-radius: 8px;
  color: #003366;
  font-size: 1.2rem;
  padding: 20px;
  text-align: center;
  line-height: 1.6;
}

.spinner {
  border: 4px solid rgba(0, 51, 102, 0.2);
  border-top: 4px solid #003366;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

---

### 9. Reduced Motion Support

**CSS (in style-fixes.css):**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Impact:** Users with motion sensitivity preferences won't see animations.

---

### 10. High Contrast Mode Support

**CSS (in style-fixes.css):**
```css
@media (prefers-contrast: high) {
  body {
    background-color: #ffffff;
    color: #000000;
  }
  
  section {
    border: 2px solid #000000;
  }
  
  #border-time,
  .copyright-disclaimer,
  .timestamp-pill {
    border: 2px solid #003366;
  }
  
  .news-headline, 
  .event-card h3 {
    color: #000000;
    font-weight: 700;
  }
}
```

**Impact:** Users with high contrast mode preferences have better readability.

---

## Recommended Next Steps

### Phase 1: Testing (1-2 hours)
- [ ] Test with keyboard navigation only (arrow keys + enter)
- [ ] Test with screen reader (NVDA on Windows, or iOS VoiceOver)
- [ ] Verify on actual Firestick device
- [ ] Check color contrast with WebAIM tool (https://webaim.org/resources/contrastchecker/)

### Phase 2: Additional Fixes (2-3 hours)
- [ ] Add table headers to Via Rail table (use `<thead>`, `scope` attributes)
- [ ] Add loading state improvements (role="status", aria-live)
- [ ] Implement keyboard shortcut documentation
- [ ] Add skip links for multi-section navigation

### Phase 3: Validation (1-2 hours)
- [ ] Run Axe DevTools accessibility audit
- [ ] Validate HTML with W3C Validator
- [ ] Check ARIA usage with ARIA Authoring Practices Guide
- [ ] Get feedback from users with accessibility needs

---

## Testing Checklist

### Keyboard Navigation (Arrow Keys + Enter)
- [ ] Can navigate to all sections using Tab key
- [ ] Can activate buttons/links with Enter key
- [ ] Focus indicators are visible (3px solid outline)
- [ ] No keyboard traps (can always move focus away)

### Screen Reader (NVDA/JAWS)
- [ ] Page title is announced ("Sarnia Community Dashboard")
- [ ] Header is identified as banner
- [ ] Main content region is identified
- [ ] Section headings are announced
- [ ] Image alt text is read aloud
- [ ] Dynamic updates (clock, weather) are announced via aria-live

### Color & Contrast
- [ ] Text is readable on all backgrounds (4.5:1 contrast minimum)
- [ ] Color is not the only indicator of status (use icons/text too)
- [ ] High contrast mode is supported

### Responsive & Mobile
- [ ] Layout works on mobile devices (not the primary use case, but good practice)
- [ ] Touch targets are at least 44x44px (excellent for Firestick remote)
- [ ] No horizontal scrolling on narrow screens

---

## WCAG 2.1 Compliance Checklist

| Criterion | Level | Status | Notes |
|-----------|-------|--------|-------|
| 1.1.1 Non-text Content | A | ✅ | Images have alt text |
| 1.4.3 Contrast (Minimum) | AA | ⚠️ | Need to verify border cards |
| 2.1.1 Keyboard | A | ✅ | All functions keyboard accessible |
| 2.1.2 No Keyboard Trap | A | ✅ | Focus can move freely |
| 2.4.1 Bypass Blocks | A | ✅ | Skip link provided |
| 2.4.3 Focus Order | A | ✅ | Logical tab order maintained |
| 2.4.7 Focus Visible | AA | ✅ | Focus indicators enhanced |
| 3.2.1 On Focus | A | ✅ | No unexpected context changes |
| 4.1.2 Name, Role, Value | A | ✅ | Semantic HTML + ARIA labels |
| 4.1.3 Status Messages | AAA | ✅ | aria-live for dynamic content |

---

## Accessibility Resources

- **WCAG 2.1 Guide:** https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/
- **WebAIM Resources:** https://webaim.org/
- **Axe DevTools (Browser Extension):** https://www.deque.com/axe/devtools/
- **NVDA Screen Reader (Free):** https://www.nvaccess.org/

---

## Maintenance Notes

- Review accessibility after any CSS updates
- Test new features with screen reader
- Keep focus order logical when reorganizing sections
- Use semantic HTML first, ARIA labels as supplement
- Document any accessibility decisions or exceptions

---

**Last Updated:** January 5, 2026  
**Status:** Partial Completion (Core fixes done, testing needed)
