const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const puppeteer = require('puppeteer');

// 🔹 CBSA Scraper
async function scrapeCBSA() {
  const URL = 'https://www.cbsa-asfc.gc.ca/bwt-taf/menu-eng.html';

  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    const waitTimes = {
      lastUpdated: new Date().toISOString(),
      bridge: 'Blue Water Bridge',
      passenger: { USbound: 'N/A', CAbound: 'N/A' },
      commercial: { USbound: 'N/A', CAbound: 'N/A' }
    };

    $('#bwttaf tr').each((j, row) => {
      const crossing = $(row).find('th').text().trim();
      const cells = $(row).find('td');
      if (!crossing || cells.length < 2) return;

      const commercialFlow = $(cells[0]).text().trim();
      const travellersFlow = $(cells[1]).text().trim();

      console.log('Crossing:', crossing, '| Commercial:', commercialFlow, '| Travellers:', travellersFlow);

      if (crossing.includes('Blue Water Bridge') || crossing.includes('Sarnia')) {
        const normalize = str => str.replace(/\s+/g, '').toUpperCase();
        
        // Helper function to normalize delay values
        const normalizeDelay = (value) => {
          if (!value || value === 'N/A') return 'No wait times currently reported';
          
          // Check if it's already "No Delay"
          if (value === 'No Delay') return 'No Delay';
          
          // Check for "0 minutes" or "0 min" pattern
          const zeroMinMatch = value.match(/^0\s*(min|minutes?)$/i);
          if (zeroMinMatch) return 'No Delay';
          
          // For any other numeric value, keep as is
          return value;
        };
        
        waitTimes.passenger.CAbound = normalizeDelay(travellersFlow);
        waitTimes.commercial.CAbound = normalizeDelay(commercialFlow);
      }
    });

    // 🔧 Final cleanup
    const clean = val => val === 'N/A' ? 'No wait times currently reported' : val;
    waitTimes.passenger.USbound = clean(waitTimes.passenger.USbound);
    waitTimes.passenger.CAbound = clean(waitTimes.passenger.CAbound);
    waitTimes.commercial.USbound = clean(waitTimes.commercial.USbound);
    waitTimes.commercial.CAbound = clean(waitTimes.commercial.CAbound);

    return waitTimes;
  } catch (err) {
    console.error('❌ Error scraping CBSA:', err.message);
    return {
      bridge: 'Blue Water Bridge',
      passenger: { USbound: 'N/A', CAbound: 'N/A' },
      commercial: { USbound: 'N/A', CAbound: 'N/A' },
      lastUpdated: new Date().toISOString()
    };
  }
}

// 🔸 US CBP Scraper (Puppeteer)
async function scrapeUSCBP_Puppeteer() {
  const passengerURL = 'https://bwt.cbp.gov/details/03380201/POV';
  const commercialURL = 'https://bwt.cbp.gov/details/03380201/COV';

  const extractFromPage = async (url, type) => {
    let browser;
    try {
      browser = await puppeteer.launch({ 
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
      const page = await browser.newPage();
      
      // Set timeout to prevent hanging
      await page.setDefaultNavigationTimeout(30000);
      await page.setDefaultTimeout(30000);

    try {
      await page.goto(url, { waitUntil: 'networkidle2' });

      const { delay, lanes } = await page.evaluate(() => {
        const delaySpan = document.querySelector('.curr-wait span');
        const infoSpan = document.querySelector('.text-default.nw.m10');

        const delay = delaySpan ? delaySpan.textContent.trim() : 'N/A';
        const infoText = infoSpan ? infoSpan.textContent.trim() : '';

        const lanesMatch = infoText.match(/(\d+ lanes open)/i);

        return {
          delay,
          lanes: lanesMatch ? lanesMatch[1] : 'N/A'
        };
      });

      return { delay, lanes, timestamp: new Date().toISOString() };
    } catch (err) {
      console.error(`❌ Error scraping ${type} page with Puppeteer:`, err.message);
      return { delay: 'N/A', lanes: 'N/A', timestamp: new Date().toISOString() };
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  };

  const passenger = await extractFromPage(passengerURL, 'passenger');
  const commercial = await extractFromPage(commercialURL, 'commercial');

  // Helper function to normalize US delay values
  const normalizeUSDelay = (value) => {
    if (!value || value === 'N/A') return 'N/A';
    
    // Check for "0 minutes" or "0 min" pattern
    const zeroMinMatch = value.match(/^0\s*(min|minutes?)$/i);
    if (zeroMinMatch) return 'No Delay';
    
    // For any other value, keep as is
    return value;
  };

  return {
    bridge: 'Blue Water Bridge',
    passenger: {
      USbound: normalizeUSDelay(passenger.delay),
      lanes: passenger.lanes
    },
    commercial: {
      USbound: normalizeUSDelay(commercial.delay),
      lanes: commercial.lanes
    },
    lastUpdated: passenger.timestamp
  };
}

// 🚀 Master Function
async function runScraper() {
  const cbsaData = await scrapeCBSA();
  const uscbpData = await scrapeUSCBP_Puppeteer();

  // Load previous data to calculate trends
  let previousData = null;
  const borderWaitsPath = path.join(__dirname, '..', 'border_waits.json');
  try {
    const prevFile = fs.readFileSync(borderWaitsPath, 'utf8');
    previousData = JSON.parse(prevFile);
  } catch (err) {
    console.log('No previous border wait data found (first run)');
  }

  // Helper to extract numeric minutes from delay string
  const extractMinutes = (delayStr) => {
    if (!delayStr || delayStr === 'N/A' || delayStr === 'No Delay' || delayStr.includes('no wait times')) {
      return 0;
    }
    const match = delayStr.match(/(\d+)\s*(min|minutes?)/i);
    return match ? parseInt(match[1]) : 0;
  };

  // Calculate trends by comparing with previous data
  const calculateTrend = (current, previous) => {
    const currMin = extractMinutes(current);
    const prevMin = extractMinutes(previous);
    
    if (currMin > prevMin + 2) return 'up';      // Increasing (tolerance of 2 min)
    if (currMin < prevMin - 2) return 'down';    // Decreasing
    return 'stable';                              // No significant change
  };

  // Add trend data
  const trends = {
    usa: {
      passenger: previousData ? calculateTrend(uscbpData.passenger.USbound, previousData.usa?.passenger?.USbound) : 'stable',
      commercial: previousData ? calculateTrend(uscbpData.commercial.USbound, previousData.usa?.commercial?.USbound) : 'stable'
    },
    canada: {
      passenger: previousData ? calculateTrend(cbsaData.passenger.CAbound, previousData.canada?.passenger?.CAbound) : 'stable',
      commercial: previousData ? calculateTrend(cbsaData.commercial.CAbound, previousData.canada?.commercial?.CAbound) : 'stable'
    }
  };

  const combined = {
    canada: { ...cbsaData, trends: trends.canada },
    usa: { ...uscbpData, trends: trends.usa }
  };

  fs.writeFileSync(borderWaitsPath, JSON.stringify(combined, null, 2));
  console.log('✅ Combined border wait data updated with trends:', combined);
}

// 🔥 Trigger
runScraper();
module.exports = { runScraper };
