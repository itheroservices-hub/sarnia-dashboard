const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const VIA_URL = 'https://tsimobile.viarail.ca/';
const TARGET_TRAINS = ['84', '87'];

async function fetchViaRailStatus() {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const results = [];

  try {
    await page.goto(VIA_URL, { waitUntil: 'networkidle0' });

    for (const trainId of TARGET_TRAINS) {
      await page.click('#trainSelect');
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.evaluate((trainId) => {
        const els = Array.from(document.querySelectorAll('#train_list a'));
        const match = els.find(el => el.textContent.includes(trainId));
        if (match) match.click();
      }, trainId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await page.waitForSelector('table.table-bordered tbody tr', { timeout: 5000 });

      const trainOptions = await page.$$eval('#train_list a', els =>
        els.map(el => ({
          text: el.textContent.trim(),
          value: el.textContent.trim().match(/\d+/)?.[0] || null,
          disabled: el.classList.contains('disabled')
        }))
      );
      console.log(`🚦 Available train options:`, trainOptions.map(t => `${t.value} → ${t.text}`));

      const target = trainOptions.find(t => t.value === trainId || t.value === trainId.padStart(3, '0'));
      if (!target) {
        results.push({
          train: trainId,
          status: 'not_found',
          message: 'Train not listed in dropdown',
          stations: []
        });
        continue;
      }

      const html = await page.content();
      const $ = cheerio.load(html);

      const stations = [];
      let lastScheduled = null;
      let lastExpected = null;
      let lastStation = null;

    $('table.table-bordered tbody tr').each((i, el) => {
  const rawRow = $(el).html();
  console.log(`🔍 Raw HTML Row ${i}:\n${rawRow}`);
  const rowText = $(el).text().trim();
  console.log(`🧾 Row ${i} raw: "${rowText}"`);

  const stationName = $(el).find('th').first().text().trim().toLowerCase();
  const scheduledRaw = $(el).find('td').eq(0).text().trim();
  const scheduled = convertUTCtoEastern(scheduledRaw);
  const expectedRaw = $(el).find('td').eq(1).text().trim();
  const countdown = $(el).find('td').eq(2).text().trim();

  let expected = '-';
  let delay = null;

  if (countdown && countdown.includes('h')) {
    const expectedDate = reconstructExpectedTime(countdown, new Date());
    expected = formatToHTime(expectedDate);
    expected = convertUTCtoEastern(expected);
    delay = calculateDelay(scheduled, expected);
  } else if (expectedRaw && expectedRaw.includes('h')) {
    expected = convertUTCtoEastern(expectedRaw);
    delay = calculateDelay(scheduled, expected);
  }

  if (delay === null) delay = '';

  console.log(`🧪 Row ${i}: station=${stationName}, scheduled=${scheduled}, countdown=${countdown}, expected=${expected}, delay=${delay}`);

  if (stationName.includes('sarnia')) {
    if (countdown.toLowerCase().includes('arrived')) {
      console.log(`📍 Sarnia Arrived: ${scheduled}`);
      stations.push({
        station: 'Sarnia',
        scheduled,
        expected: expectedRaw ? convertUTCtoEastern(expectedRaw) : '-',
        delay: ''
      });
    } else {
      console.log(`📍 Sarnia Name Matched: ${scheduled} → ${expected} (${delay} min)`);
      stations.push({
        station: 'Sarnia',
        scheduled,
        expected,
        delay
      });
    }

    if (expected !== '-' && !isNaN(delay)) {
      lastScheduled = scheduled;
      lastExpected = expected;
      lastStation = stationName;
    }
  }
});

      const now = new Date();
      const scheduledTime = parseTime(lastScheduled, now);
      const expectedTime = normalizeTime(lastScheduled, lastExpected, now);
      const timeDiff = Math.abs(now - expectedTime) / (1000 * 60); // in minutes

      let status = 'active';
      let message = '';

      if (target.disabled && timeDiff > 180) {
        status = 'not_running';
        message = 'Train is currently not running';
      } else if (target.disabled && timeDiff <= 180) {
        status = 'recently_arrived';
        message = `Train arrived at ${lastExpected} at ${lastStation}`;
      } else {
        const delay = (expectedTime - scheduledTime) / (1000 * 60);
        message = delay > 0
          ? `Delayed by ${Math.round(delay)} min (last station: ${lastStation})`
          : `On time (last station: ${lastStation})`;
      }

      results.push({
        train: trainId,
        status,
        message,
        stations
      });
    }

    const outputPath = path.join(__dirname, '../public/via_rail.json');
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' });
    const enrichedData = { timestamp, trains: results };

    console.log(`📝 Writing to: ${outputPath}`);
    fs.writeFileSync(outputPath, JSON.stringify(enrichedData, null, 2));
    console.log(`✅ VIA Rail data saved for ${results.length} trains and copied to public folder`);
  } catch (error) {
    console.error('❌ Error fetching VIA Rail data:', error.message);
  } finally {
    await browser.close();
  }
}

function parseTime(str, refDate) {
  if (!str || !str.includes('h')) return new Date(refDate);
  const [hour, min] = str.replace('h', ':').split(':').map(Number);
  const t = new Date(refDate);
  t.setHours(hour, min, 0, 0);
  return t;
}

function normalizeTime(scheduled, estimated, refDate) {
  const sched = parseTime(scheduled, refDate);
  let est = parseTime(estimated, refDate);
  if (est < sched) est.setDate(est.getDate() + 1);
  return est;
}

function calculateDelay(scheduled, expected) {
  const refDate = new Date();
  const s = parseTime(scheduled, refDate);
  const e = normalizeTime(scheduled, expected, refDate);
  return Math.round((e - s) / (1000 * 60)); // in minutes
}

function reconstructExpectedTime(countdownStr, refDate) {
  if (!countdownStr || countdownStr === '-') return null;
  const parts = countdownStr.split('h');
  const hours = parseInt(parts[0], 10);
  const mins = parseInt(parts[1] || '0', 10);
  const expected = new Date(refDate);
  expected.setHours(expected.getHours() + hours);
  expected.setMinutes(expected.getMinutes() + mins);
  return expected;
}

function formatToHTime(date) {
  if (!date) return '-';
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}h${m}`;
}

// Convert UTC time string to Eastern Time (subtract 5 hours)
function convertUTCtoEastern(timeStr) {
  if (!timeStr || timeStr === '-' || !timeStr.includes('h')) return timeStr;
  const [hour, min] = timeStr.replace('h', ':').split(':').map(Number);
  const utcDate = new Date();
  utcDate.setUTCHours(hour, min, 0, 0);
  
  // Convert to Eastern Time
  const easternTime = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/Toronto' }));
  const h = easternTime.getHours();
  const m = String(easternTime.getMinutes()).padStart(2, '0');
  return `${h}h${m}`;
}

function startScrapingLoop() {
  fetchViaRailStatus();
  setInterval(fetchViaRailStatus, 5 * 60 * 1000);
}

startScrapingLoop();

