# Delay Status Logic Audit Report
## Route 3 (WELLINGTON) - January 3, 2026

## Issue Summary
There is a mismatch between backend delay aggregation and frontend delay display for Route 3 (WELLINGTON):

**Backend Reports:**
- 4 active trips
- 0 delayed trips  
- 0% delayed
- Status: "On Time"

**Frontend Displays:**
- "On Time (2 min late)"
- Shows sample delay of 2 minutes

**Sample Data from Route 3:**
```json
{
  "tripId": "35125:1460742", "delayMinutes": 0
},
{
  "tripId": "35250:1461712", "delayMinutes": 2
},
{
  "tripId": "1043250:1283157", "delayMinutes": null
}
```

## Root Cause Analysis

### 1. Backend Logic (transitscraper.js)
- **Delay Threshold:** 5 minutes (`CONFIG.thresholds.delayMinutesThreshold: 5`)
- **Delayed Trip Calculation:** `trips.filter(t => t.delayMin !== null && t.delayMin > CONFIG.thresholds.delayMinutesThreshold)`
- **Status Logic:** Route marked "Delayed" only if:
  - Any trip has > 15 minutes delay (major delay) OR
  - >= 20% of trips have > 5 minutes delay

**Issue:** The 2-minute delay is correctly NOT counted as delayed by backend standards.

### 2. Frontend Logic (script.js)
- **Delay Display:** Uses `Math.max(...validDelays)` to show maximum sample delay
- **Status Display:** Shows backend status but adds parenthetical delay info
- **Null Handling:** Filters out null values correctly

**Issue:** Frontend shows sample delays regardless of backend threshold, creating confusing mixed messages.

### 3. Data Quality Issues
- **Null Values:** One trip shows `delayMinutes: null`
- **Inconsistent Logic:** Backend and frontend use different delay criteria

## Recommendations

### Option 1: Consistent Threshold Logic (Recommended)
Apply the same 5-minute threshold in frontend display logic:

```javascript
// Replace current delay calculation in script.js
const maxDelay = validDelays.length ? Math.max(...validDelays) : null;
const displayDelay = maxDelay !== null && maxDelay > 5 ? maxDelay : null;

const delayString = displayDelay === null
  ? "on time"
  : displayDelay < 0
    ? `${Math.abs(displayDelay)} min early`
    : `${displayDelay} min late`;
```

### Option 2: Lower Backend Threshold
If 2-minute delays should be considered "late", lower the backend threshold:

```javascript
// In transitscraper.js
thresholds: {
  delayMinutesThreshold: 1, // Changed from 5 to 1
  percentDelayedThreshold: 0.20,
  majorDelayMinutes: 15
}
```

### Option 3: Clearer Frontend Display
Show threshold-aware delay information:

```javascript
const delayString = avgDelay === null
  ? "on time"
  : avgDelay <= 5
    ? `on time (${avgDelay} min late)`
    : `${avgDelay} min late`;
```

## Null Value Normalization

### Backend Fix
In `aggregateRouteStatus()` function, normalize null delays:

```javascript
// Add this line before the delayedTrips calculation
const normalizedTrips = trips.map(t => ({ 
  ...t, 
  delayMin: t.delayMin === null ? 0 : t.delayMin 
}));

// Then use normalizedTrips for calculations
const delayedTrips = normalizedTrips.filter(t => t.delayMin > CONFIG.thresholds.delayMinutesThreshold);
```

### Frontend Fix
Current null handling is correct, but add explicit logging:

```javascript
const validDelays = (a.sampleDelays || [])
  .map(d => d.delayMinutes)
  .filter(d => typeof d === "number");

// Add debug logging
if (a.sampleDelays?.some(d => d.delayMinutes === null)) {
  console.log(`Route ${a.routeShortName}: Null delay values detected and filtered`);
}
```

## Recommended Implementation Path

### Phase 1: Immediate Fix (Frontend Consistency)
1. Update frontend to use 5-minute threshold for display
2. Add null value logging
3. Test with current data

### Phase 2: Backend Enhancement
1. Implement null value normalization in backend
2. Add configuration for display threshold vs. delayed threshold
3. Improve logging for data quality issues

### Phase 3: User Experience
1. Add tooltip explaining delay thresholds
2. Consider showing "minor delay" vs "major delay" distinctions
3. Update status indicators to be more intuitive

## Testing Strategy

### Unit Tests
- Verify threshold logic with various delay values
- Test null value handling
- Confirm percentage calculations

### Integration Tests  
- End-to-end flow from GTFS data to dashboard display
- Verify consistency between backend status and frontend display
- Test with edge cases (all null, all early, mixed delays)

### User Acceptance Tests
- Confirm display makes sense to transit riders
- Verify status information is actionable
- Test with real-time data variations

## Conclusion

The core issue is a logic mismatch between backend aggregation (5-minute threshold) and frontend display (showing all sample delays). The recommended approach is to implement consistent threshold logic while properly normalizing null values. This will provide clearer, more consistent information to transit riders.

**Priority:** High - affects user understanding of transit reliability
**Effort:** Low - requires minimal code changes
**Impact:** High - improves data consistency and user experience
