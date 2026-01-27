# Resource Exhaustion Fixes - January 27, 2025

## Problem
Deployment was failing with fork errors:
```
fork: Resource temporarily unavailable (11)
/bin/sh: 1: Cannot fork
```

These errors indicate the system ran out of resources (memory/processes) to spawn new child processes, specifically when launching multiple Puppeteer instances concurrently.

## Root Causes
1. **Multiple Puppeteer instances running simultaneously** - VIA Rail and Border scrapers both use headless Chrome
2. **Insufficient delays between resource-intensive operations** - Only 2s between Chrome launches
3. **Too many retry attempts** - 2 retries meant up to 3 attempts per scraper
4. **Scrapers running on startup** - Immediate execution before server stabilized
5. **Memory threshold too low** - 256MB threshold insufficient for container limits
6. **Incomplete cleanup** - Browser instances not properly disposed

## Fixes Implemented

### 1. Server.js Changes

#### Reduced Retry Attempts
- Changed from 2 retries to 0 retries (1 attempt total)
- Prevents cascading failures and resource buildup
- Faster failure = faster recovery

#### Increased Delays Between Scrapers
- Community events → VIA Rail: 3 seconds (was immediate)
- VIA Rail → Border scraper: 10 seconds (was 2 seconds)
- This gives system time to release resources between Puppeteer launches

#### Better Error Detection
- Added `fork` error detection in retry logic
- Increased backoff multiplier from 3x to 4x for resource errors
- Initial backoff increased from 2s to 5s

#### Delayed Startup
- Scrapers now start 30 seconds after server launch
- Prevents startup congestion when all services initialize

#### Reduced Scraper Frequency
- Increased from 10 minutes to 15 minutes between full scraper runs
- Reduces overall system load

#### News Scraper Improvements
- Wrapped in proper promise with timeout (60s)
- Better error handling for fork failures
- Graceful degradation if scraper fails

### 2. VIA Rail Scraper Changes

#### Memory Threshold Increased
- Raised from 256MB to 512MB free memory required
- More conservative approach prevents OOM situations

#### Enhanced Puppeteer Args
Added aggressive resource reduction flags:
```javascript
'--single-process',          // Use single process instead of multi-process
'--disable-background-timer-throttling',
'--disable-backgrounding-occluded-windows',
'--disable-breakpad',        // Disable crash reporting
'--disable-client-side-phishing-detection',
'--disable-hang-monitor',
'--disable-popup-blocking',
'--disable-prompt-on-repost',
'--disable-renderer-backgrounding',
'--disable-translate',
'--metrics-recording-only',
'--mute-audio',
'--disable-web-security'
```

#### Better Cleanup
- Explicit browser close with null assignment
- 2-second delay after close to let system cleanup processes
- Proper error re-throwing for retry logic
- Catches and logs cleanup errors

#### Timeout Added
- 30-second timeout on Puppeteer launch

### 3. CBSA Scraper Changes

#### Same Memory Threshold Increase
- 512MB minimum free memory required

#### Same Enhanced Puppeteer Args
- All the same aggressive resource flags as VIA Rail scraper

#### Better Cleanup
- Page closed separately from browser
- Both get null assignment after close
- 2-second delay for process cleanup
- Proper error re-throwing

#### Conditional Execution
- Only runs when executed directly (not on import)
- Prevents accidental double execution

## Expected Results

### Immediate Improvements
1. **No more fork errors** - Reduced concurrent process spawning
2. **Lower memory usage** - More aggressive browser resource limits
3. **Faster recovery** - Less retry attempts means quicker fallback to cached data
4. **Cleaner startup** - Server stabilizes before heavy operations

### Performance Characteristics
- **First scraper run**: 30 seconds after server start
- **Scraper interval**: Every 15 minutes
- **Between Puppeteer scrapers**: 10+ seconds
- **Memory checks**: Before each Puppeteer launch
- **Cleanup delays**: 2 seconds after each browser close

### Fallback Behavior
If scrapers fail:
- Uses cached data from previous successful runs
- Logs errors but doesn't crash server
- Health endpoint shows scraper status
- Next scheduled run will retry

## Monitoring

Check `/health` endpoint for scraper status:
```json
{
  "uptimeSeconds": 1234,
  "scraperStatus": {
    "events": { "lastSuccess": "...", "lastError": null },
    "via": { "lastSuccess": "...", "lastError": null },
    "border": { "lastSuccess": "...", "lastError": null },
    "transit": { "lastSuccess": "...", "lastError": null }
  }
}
```

## Deployment Notes

1. **Commit all changes**
2. **Push to deployment branch**
3. **Monitor logs for first 30 minutes** to ensure scrapers run successfully
4. **Check `/health` endpoint** after first scraper cycle completes
5. **Verify data freshness** in dashboard UI

## If Issues Persist

Consider these additional measures:
1. **Increase scraper interval to 20-30 minutes**
2. **Switch to API-based solutions** instead of Puppeteer where possible
3. **Use external scraper service** (separate container/service)
4. **Upgrade deployment plan** for more resources
5. **Implement scraper queuing service** (Redis-based job queue)

## Files Modified
- `server.js` - Main orchestration and retry logic
- `viarailscraper/railscraper.js` - VIA Rail Puppeteer scraper
- `CBSA Scraper/scraper.js` - Border wait Puppeteer scraper
