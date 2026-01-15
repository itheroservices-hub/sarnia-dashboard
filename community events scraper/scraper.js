const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function quickDisplay(iso) {
  if (!iso) return '';
  return iso.replace('T', ' - ').replace(':00:00', '');
}

function parseDateFromHeader(headerText) {
  // Example: "Tuesday December 2/2025 - Fritter Day"
  const match = headerText.match(/(\w+)\s+(\w+)\s+(\d+)\/(\d+)/);
  if (!match) return null;

  const [, , monthName, day, year] = match;
  const monthMap = {
    January: '01', February: '02', March: '03', April: '04',
    May: '05', June: '06', July: '07', August: '08',
    September: '09', October: '10', November: '11', December: '12'
  };
  const month = monthMap[monthName];
  return `${year}-${month}-${day.padStart(2, '0')}`;
}

function parseTimeToISO(dateStr, timeStr) {
  if (!timeStr) return `${dateStr}T00:00:00`;

  const lower = timeStr.toLowerCase().trim();

  // Handle special cases
  if (lower === 'noon') return `${dateStr}T12:00:00`;
  if (lower === 'midnight') return `${dateStr}T00:00:00`;

  // Normalize formats like "7pm", "7:00 pm", "07:30PM"
  const timeMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!timeMatch) return `${dateStr}T00:00:00`;

  let [ , hour, minute = '00', period ] = timeMatch;
  hour = parseInt(hour, 10);

  if (period === 'pm' && hour < 12) hour += 12;
  if (period === 'am' && hour === 12) hour = 0;

  return `${dateStr}T${hour.toString().padStart(2, '0')}:${minute}:00`;
}

async function scrapeEvents() {
  console.log('🛠 Starting scrapeEvents()...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.goto('https://www.sarniarocks.com/', { waitUntil: 'networkidle2' });

  const events = await page.evaluate(() => {
  const results = [];
const fonts = Array.from(document.querySelectorAll('font'));

fonts.forEach(fontEl => {
  const headerText = fontEl.innerText.trim();
  if (!headerText.match(/\d{1,2}\/\d{4}/)) return; // only date-like headers

  const datePart = headerText.split(' - ')[0];
  const theme = headerText.split(' - ')[1] || '';

  // Find the next <ul> after this header
  let ul = fontEl.closest('p')?.nextElementSibling;
  if (!ul || ul.tagName !== 'UL') return;

  const items = Array.from(ul.querySelectorAll('li'));
  items.forEach(item => {
    const text = item.innerText.trim();
    const parts = text.split(' - ');
    const title = parts[0] || '';
    const location = parts.length >= 2 ? parts.slice(1, parts.length - 1).join(' - ') : '';
    const time = parts[parts.length - 1] || '';

    results.push({
      title,
      rawDate: datePart,
      rawTime: time,
      location,
      description: `${theme} – ${title} at ${location}`
    });
  });
});

return results;
});

  

  await browser.close();

  // Normalize date/time
  const normalized = events.map(ev => {
    const dateISO = parseDateFromHeader(ev.rawDate);
    const start_date = dateISO ? parseTimeToISO(dateISO, ev.rawTime) : '';
    return {
      title: ev.title,
      date: start_date,
      location: ev.location,
      description: ev.description
    };
  });

  // Filter out past events
  const now = new Date();
  const upcoming = normalized.filter(ev => {
    if (!ev.date) return true;
    return new Date(ev.date) >= now;
  });

  console.log(`✅ Scraped ${upcoming.length} upcoming events`);
  return upcoming;
}

async function runEventsScraper() {
  try {
    const events = await scrapeEvents();
    const filePath = path.join(__dirname, '..', 'public', 'sarnia_events.json');
    fs.writeFileSync(filePath, JSON.stringify(events, null, 2));
    console.log(`✅ Saved ${events.length} events to sarnia_events.json`);
  } catch (err) {
    console.error('❌ Event scrape failed:', err);
  }
}

module.exports = { runEventsScraper };
runEventsScraper();