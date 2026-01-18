# Tailwind Conversion Example - Border Wait Times Module

## Before (Custom CSS)

```html
<section id="border-wait" class="tile tile-primary">
  <div class="tile-header">
    <h2 class="tile-title">Border Wait Times</h2>
    <span id="border-time" class="timestamp-badge">Updating...</span>
  </div>
  <div id="border-data" class="tile-content tile-scrollable">
    <!-- Injected by script.js -->
    <div class="border-section">
      <h3>Blue Water Bridge → USA Bound</h3>
      <p data-status="no-delay">
        <span class="icon">🚗</span> Passenger: 5 minutes
      </p>
      <p data-status="moderate-delay">
        <span class="icon">🚛</span> Commercial: 15 minutes
      </p>
    </div>
  </div>
</section>
```

**Required CSS (100+ lines):**
```css
.tile-primary { ... }
.tile-header { ... }
.tile-title { ... }
.timestamp-badge { ... }
.tile-content { ... }
.tile-scrollable { ... }
.border-section { ... }
.icon { ... }
[data-status="no-delay"] { color: green; }
[data-status="moderate-delay"] { color: orange; }
/* + 20 more lines for responsive */
```

---

## After (Tailwind CSS)

```html
<section id="border-wait" class="bg-white rounded-lg shadow-md border border-border-gray overflow-hidden flex flex-col">
  <div class="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-3 flex items-center justify-between">
    <h2 class="text-base md:text-lg font-bold">Border Wait Times</h2>
    <span id="border-time" class="text-xs bg-white/20 px-2 py-1 rounded">Updating...</span>
  </div>
  <div id="border-data" class="p-4 flex-1 overflow-y-auto max-h-96 space-y-3">
    <!-- Injected by script-tailwind.js -->
    <div class="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
      <h3 class="font-semibold text-sm text-gray-700 mb-2">🇺🇸 Blue Water Bridge → USA Bound</h3>
      <div class="space-y-1 text-sm">
        <p class="text-green-600 flex items-center gap-2">
          <span>🚗</span> <span class="font-medium">Passenger:</span> <span>5 minutes</span>
        </p>
        <p class="text-orange-500 flex items-center gap-2">
          <span>🚛</span> <span class="font-medium">Commercial:</span> <span>15 minutes</span>
        </p>
      </div>
    </div>
  </div>
</section>
```

**Required CSS (0 lines from custom CSS, handled by Tailwind CDN)**

---

## Key Improvements

### 1. **No Custom CSS Required**
- Before: 100+ lines of CSS for one module
- After: All styling via Tailwind utilities

### 2. **Responsive by Default**
- `text-base md:text-lg` - Auto-scales font size
- `px-4 py-3` - Consistent spacing
- `flex flex-col` - Stacks on mobile

### 3. **Clear Intent**
- `text-green-600` vs. `[data-status="no-delay"]`
- Instantly see color/layout without checking CSS file

### 4. **Consistent Spacing**
- `space-y-3` - Uniform vertical gaps
- `gap-2` - Flexbox gaps
- `mb-2` - Bottom margin

### 5. **Professional Shadows & Borders**
- `shadow-md` - Tailwind's pre-designed shadow
- `rounded-lg` - 8px border radius
- `border-l-4` - Thick left accent border

---

## Module-by-Module Breakdown

### Header Bar

**Before:**
```html
<header class="header-bar">
  <div class="header-left">Clock</div>
  <div class="header-center">Logo</div>
  <div class="header-right">Weather</div>
</header>
```

**After:**
```html
<header class="fixed top-0 left-0 right-0 bg-gradient-to-r from-primary via-blue-700 to-secondary text-white shadow-lg z-50">
  <div class="flex flex-col md:flex-row items-center justify-between px-4 py-3 gap-3">
    <div class="flex-1 flex justify-center md:justify-start">Clock</div>
    <div class="flex-1 flex justify-center">Logo</div>
    <div class="flex-1 flex justify-center md:justify-end">Weather</div>
  </div>
</header>
```

### Weather Forecast Card

**Before:**
```html
<div class="forecast-card">
  <img src="icon.png" class="forecast-icon" />
  <div class="forecast-info">
    <div class="time">Morning</div>
    <div class="temp">15°C</div>
    <div class="condition">Cloudy</div>
  </div>
</div>
```

**After:**
```html
<div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
  <img src="icon.png" class="w-12 h-12 flex-shrink-0" />
  <div class="flex-1 text-sm">
    <div class="font-semibold text-primary capitalize">Morning</div>
    <div class="text-gray-700">15°C</div>
    <div class="text-gray-600">Cloudy</div>
  </div>
</div>
```

### VIA Rail Table

**Before:**
```html
<table class="via-rail-table">
  <tr>
    <th>Train</th>
    <th>Delay</th>
  </tr>
  <tr>
    <td>84</td>
    <td class="delay on-time">On time</td>
  </tr>
</table>
```

**After:**
```html
<table class="w-full text-xs border-collapse">
  <thead>
    <tr class="bg-gray-100 text-left">
      <th class="p-2 font-semibold">Train</th>
      <th class="p-2 font-semibold">Delay</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-gray-200 hover:bg-gray-50">
      <td class="p-2 font-medium">84</td>
      <td class="p-2 font-semibold text-green-600">On time</td>
    </tr>
  </tbody>
</table>
```

### News Carousel

**Before:**
```html
<div class="news-carousel">
  <div class="news-content">
    <p class="news-headline">Local business opens downtown</p>
    <div class="news-metadata">
      <span class="news-source">Sarnia Observer</span>
      <span class="news-timestamp">2 hours ago</span>
    </div>
  </div>
</div>
```

**After:**
```html
<div class="p-4 flex-1 min-h-[150px]">
  <div class="news-content">
    <p class="text-base md:text-lg font-semibold text-gray-800 mb-3 leading-relaxed">
      Local business opens downtown
    </p>
    <div class="flex gap-4 text-xs md:text-sm text-gray-500 flex-wrap">
      <span class="news-source">Sarnia Observer</span>
      <span class="news-timestamp">2 hours ago</span>
    </div>
  </div>
</div>
```

---

## Responsive Grid Example

### Before (Custom CSS Grid)

```css
#main-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1280px) {
  #main-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  #main-content {
    grid-template-columns: 1fr;
  }
}
```

### After (Tailwind)

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <!-- Modules -->
</div>
```

**Single line replaces 15+ lines of CSS!**

---

## Color System

### Before (Custom Variables)
```css
:root {
  --color-primary: #1e3a8a;
  --color-secondary: #3b82f6;
  --color-accent: #c62828;
  --color-bg-white: #ffffff;
  --color-bg-light: #f9fafb;
  --color-text-dark: #1f2937;
  --color-gray: #6b7280;
  --color-border: #e5e7eb;
}

.primary-text { color: var(--color-primary); }
.secondary-bg { background: var(--color-secondary); }
/* ...50 more utility classes... */
```

### After (Tailwind Config)
```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#3b82f6',
        accent: '#c62828',
      }
    }
  }
}
```

**Usage:**
- `text-primary` instead of `.primary-text`
- `bg-secondary` instead of `.secondary-bg`
- Built-in shades: `bg-blue-50`, `bg-blue-100`, ..., `bg-blue-900`

---

## Final Comparison

| Aspect | Custom CSS | Tailwind CSS |
|--------|-----------|--------------|
| **Lines of CSS** | 1,213 lines | 105 lines (custom only) |
| **File Size** | 31 KB | 2 KB (custom) + 50 KB CDN (cached) |
| **Responsive Breakpoints** | 4 custom media queries | Built-in (sm/md/lg/xl/2xl) |
| **Color Utilities** | 8 custom classes | 100+ built-in shades |
| **Spacing Scale** | Custom variables | Consistent 0-96 scale |
| **Maintainability** | Edit CSS file | Edit HTML directly |
| **Development Speed** | Slower (context switching) | Faster (no CSS file editing) |
| **Learning Curve** | Low (familiar CSS) | Medium (utility-first mindset) |
| **Production Ready** | ✅ Yes | ✅ Yes (with purge) |

---

*This visual guide demonstrates the transformation from custom CSS to Tailwind utilities across all dashboard modules.*
