# 📸 Live Preview - Border Wait Times Module (Tailwind)

## Complete HTML Structure

```html
<!-- Border Wait Times Card -->
<section id="border-wait" class="bg-white rounded-lg shadow-md border border-border-gray overflow-hidden flex flex-col">
  
  <!-- Header -->
  <div class="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-3 flex items-center justify-between">
    <h2 class="text-base md:text-lg font-bold">Border Wait Times</h2>
    <span id="border-time" class="text-xs bg-white/20 px-2 py-1 rounded">Jan 18 @ 3:45 PM</span>
  </div>
  
  <!-- Content Area -->
  <div id="border-data" class="p-4 flex-1 overflow-y-auto max-h-96 space-y-3">
    
    <!-- USA Bound Section -->
    <div class="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
      <h3 class="font-semibold text-sm text-gray-700 mb-2">
        🇺🇸 Blue Water Bridge → USA Bound
      </h3>
      <div class="space-y-1 text-sm">
        <p class="text-green-600 flex items-center gap-2">
          <span>🚗</span>
          <span class="font-medium">Passenger:</span>
          <span>No Delay</span>
        </p>
        <p class="text-yellow-500 flex items-center gap-2">
          <span>🚛</span>
          <span class="font-medium">Commercial:</span>
          <span>5 minutes</span>
        </p>
      </div>
    </div>

    <!-- Canada Bound Section -->
    <div class="bg-red-50 border-l-4 border-red-600 p-3 rounded">
      <h3 class="font-semibold text-sm text-gray-700 mb-2">
        🇨🇦 Blue Water Bridge → Canada Bound
      </h3>
      <div class="space-y-1 text-sm">
        <p class="text-green-600 flex items-center gap-2">
          <span>🚗</span>
          <span class="font-medium">Passenger:</span>
          <span>No Delay</span>
        </p>
        <p class="text-orange-500 flex items-center gap-2">
          <span>🚛</span>
          <span class="font-medium">Commercial:</span>
          <span>12 minutes</span>
        </p>
      </div>
    </div>

  </div>
  
  <!-- VIA Rail Subsection -->
  <div class="border-t border-border-gray bg-blue-50 p-4">
    <h3 class="flex items-center gap-2 text-sm md:text-base font-semibold text-primary mb-3">
      <img src="/assets/ViaRail.png" alt="Via Rail" class="h-5 w-auto" />
      Via Rail Schedule
    </h3>
    <div id="via-rail-data" class="text-sm overflow-x-auto">
      
      <!-- VIA Rail Table -->
      <table class="w-full text-xs border-collapse">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="p-2 font-semibold">Train</th>
            <th class="p-2 font-semibold">Scheduled</th>
            <th class="p-2 font-semibold">Estimated</th>
            <th class="p-2 font-semibold">Delay</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="p-2 font-medium">84</td>
            <td class="p-2">3:30 PM</td>
            <td class="p-2">3:30 PM</td>
            <td class="p-2 font-semibold text-green-600">On time</td>
          </tr>
          <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="p-2 font-medium">87</td>
            <td class="p-2">6:15 PM</td>
            <td class="p-2">6:25 PM</td>
            <td class="p-2 font-semibold text-red-600">10 min</td>
          </tr>
        </tbody>
      </table>
      
    </div>
  </div>

</section>
```

---

## Tailwind Classes Breakdown

### Card Container
```html
class="bg-white rounded-lg shadow-md border border-border-gray overflow-hidden flex flex-col"
```
- `bg-white` - White background
- `rounded-lg` - 8px border radius
- `shadow-md` - Medium shadow (elevation)
- `border border-border-gray` - 1px gray border
- `overflow-hidden` - Clip content at border radius
- `flex flex-col` - Vertical flexbox layout

### Header
```html
class="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-3 flex items-center justify-between"
```
- `bg-gradient-to-r from-primary to-blue-600` - Horizontal gradient
- `text-white` - White text
- `px-4 py-3` - Padding: 16px horizontal, 12px vertical
- `flex items-center justify-between` - Space between flex items

### Timestamp Badge
```html
class="text-xs bg-white/20 px-2 py-1 rounded"
```
- `text-xs` - Extra small font (0.75rem)
- `bg-white/20` - White background at 20% opacity
- `px-2 py-1` - Padding: 8px horizontal, 4px vertical
- `rounded` - 4px border radius

### Content Area
```html
class="p-4 flex-1 overflow-y-auto max-h-96 space-y-3"
```
- `p-4` - Padding: 16px all sides
- `flex-1` - Grow to fill available space
- `overflow-y-auto` - Vertical scroll if needed
- `max-h-96` - Maximum height: 384px (24rem)
- `space-y-3` - 12px gap between children

### USA Section
```html
class="bg-blue-50 border-l-4 border-blue-600 p-3 rounded"
```
- `bg-blue-50` - Very light blue background
- `border-l-4` - 4px left border (accent stripe)
- `border-blue-600` - Medium blue border color
- `p-3` - Padding: 12px all sides
- `rounded` - 4px border radius

### Status Line
```html
class="text-green-600 flex items-center gap-2"
```
- `text-green-600` - Green text (status: good)
- `flex items-center` - Horizontal flex, vertically centered
- `gap-2` - 8px gap between flex items

### VIA Rail Table
```html
class="w-full text-xs border-collapse"
```
- `w-full` - 100% width
- `text-xs` - Extra small font
- `border-collapse` - Merged table borders

### Table Header Row
```html
class="bg-gray-100 text-left"
```
- `bg-gray-100` - Light gray background
- `text-left` - Left-aligned text

### Table Body Row
```html
class="border-b border-gray-200 hover:bg-gray-50"
```
- `border-b` - Bottom border
- `border-gray-200` - Very light gray
- `hover:bg-gray-50` - Light gray on hover (interactive)

---

## Responsive Behavior

### Mobile (<768px)
```
┌─────────────────┐
│   Border Wait   │ ← Full width
│   [Card]        │
└─────────────────┘
┌─────────────────┐
│   Transit       │ ← Stacked below
│   [Card]        │
└─────────────────┘
```

### Tablet (768px - 1024px)
```
┌──────────────┬──────────────┐
│ Border Wait  │   Transit    │ ← 2 columns
│ [Card]       │   [Card]     │
└──────────────┴──────────────┘
```

### Desktop (>1024px)
```
┌────────────┬────────────┬────────────┐
│ Border     │  Transit   │  Weather   │ ← 3 columns
│ Wait       │  [Card]    │  [Card]    │
│ [Card]     │            │            │
└────────────┴────────────┴────────────┘
```

---

## Status Colors Reference

### Tailwind Color Classes Used

| Status | Class | Hex Color | Use Case |
|--------|-------|-----------|----------|
| Good | `text-green-600` | `#16a34a` | No delay, on time |
| Minor | `text-yellow-500` | `#eab308` | 1-5 min delay |
| Moderate | `text-orange-500` | `#f97316` | 6-15 min delay |
| Major | `text-red-600` | `#dc2626` | >15 min delay |
| Unknown | `text-gray-400` | `#9ca3af` | No data available |

---

## JavaScript Injection Example

### How `script-tailwind.js` Injects This HTML

```javascript
const getStatusColor = (value) => {
  if (!value || value === "N/A") return "text-gray-400";
  if (value === "No Delay" || value === "0 min") return "text-green-600";
  const minutesMatch = value.match(/(\d+)\s*(min|minutes?)/i);
  if (minutesMatch) {
    const minutes = parseInt(minutesMatch[1]);
    if (minutes <= 5) return "text-yellow-500";
    if (minutes <= 15) return "text-orange-500";
    return "text-red-600";
  }
  return "text-gray-500";
};

const html = `
  <div class="space-y-4">
    <div class="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
      <h3 class="font-semibold text-sm text-gray-700 mb-2">🇺🇸 Blue Water Bridge → USA Bound</h3>
      <div class="space-y-1 text-sm">
        <p class="${getStatusColor(usPassenger)} flex items-center gap-2">
          <span>🚗</span> <span class="font-medium">Passenger:</span> <span>${usPassenger}</span>
        </p>
        <p class="${getStatusColor(usCommercial)} flex items-center gap-2">
          <span>🚛</span> <span class="font-medium">Commercial:</span> <span>${usCommercial}</span>
        </p>
      </div>
    </div>
  </div>
`;

document.getElementById("border-data").innerHTML = html;
```

**Live Data Flow:**
1. `updateBorderWaitsTailwind()` fetches from `/api/border-wait`
2. Parses JSON response (USA/Canada passenger/commercial times)
3. `getStatusColor()` determines Tailwind class based on delay minutes
4. Injects HTML with dynamic status colors
5. Updates every 60 seconds (setInterval)

---

## Accessibility Features

### Semantic HTML
- `<section>` for landmarks
- `<h2>`, `<h3>` for heading hierarchy
- `<table>` with `<thead>` and `<tbody>`

### ARIA Labels
```html
<span id="border-time" aria-label="Last updated">Jan 18 @ 3:45 PM</span>
```

### Keyboard Navigation
- All interactive elements focusable
- Table rows have hover states
- Skip links available in header

### Screen Reader Support
- Logical tab order (top to bottom)
- Status colors have text labels ("No Delay", "5 minutes")
- Time updates announced via `aria-live="polite"`

---

## Print-Friendly Version (Optional Enhancement)

Add print-specific classes:

```html
<section class="... print:break-inside-avoid print:shadow-none">
  <div class="... print:bg-white print:text-black">
    ...
  </div>
</section>
```

**Usage:**
- `print:break-inside-avoid` - Keep card together on one page
- `print:shadow-none` - Remove shadows for clean print
- `print:bg-white` - Force white background (save ink)

---

*This preview shows the exact structure you'll see in production. All other modules follow the same Tailwind card pattern.*
