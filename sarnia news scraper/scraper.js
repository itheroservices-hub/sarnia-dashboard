const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function scrapeSarniaNews() {
  const url = 'https://www.theobserver.ca/category/news/local-news/';
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);

    const newStories = [];
   $('.article-card__link').each((i, el) => {
  const raw = $(el).text().trim();

  if (!raw) return;

  // Split on the first period to separate headline + summary
  const parts = raw.split('.');
  const title = parts[0].trim();
  const summary = parts.slice(1).join('.').trim();

  newStories.push({
    title,
    summary: summary || null,   // null if no summary found
    scrapedAt: new Date().toISOString()
  });
});

    // ✅ Hard‑coded to your official public folder
    const publicPath = path.join(__dirname, '..', 'public', 'news.json');
    console.log('Writing to:', publicPath);

    // Load existing file if it exists
    let existingStories = [];
    if (fs.existsSync(publicPath)) {
      existingStories = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
    }

    // Merge new + existing
    let allStories = [...newStories, ...existingStories];

    // --- Deduplication by title ---
    allStories = allStories.filter(
      (story, index, self) =>
        index === self.findIndex(s => s.title === story.title)
    );

    // --- PRUNE LOGIC ---
    // 1. Remove anything older than 7 days
    const cutoff = Date.now() - (7 * 24 * 60 * 60 * 1000);
    allStories = allStories.filter(story => {
      const ts = new Date(story.scrapedAt).getTime();
      return ts >= cutoff;
    });

    // 2. Cap at 50 most recent
    allStories = allStories
      .sort((a, b) => new Date(b.scrapedAt) - new Date(a.scrapedAt))
      .slice(0, 50);

    fs.writeFileSync(publicPath, JSON.stringify(allStories, null, 2));
    console.log(`✅ News scraped, pruned, deduped, and saved (${allStories.length} stories)`);
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
  }
}

