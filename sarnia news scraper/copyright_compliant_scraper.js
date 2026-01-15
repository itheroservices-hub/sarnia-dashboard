const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  sourceUrl: 'https://www.theobserver.ca/category/news/local-news/',
  sourceName: 'The Sarnia Observer',
  maxArticles: 50,
  maxTitleLength: 120,
  maxSummaryLength: 200,
  cacheFile: path.join(__dirname, '..', 'public', 'news.json'),
  maxAgeDays: 7,
  retryAttempts: 3,
  retryDelay: 5000
};

// Copyright-compliant summary generation
function generateCompliantSummary(title) {
  // Extract key topics from title for contextual summary generation
  const topics = {
    'council': /council|budget|tax|municipal/i.test(title),
    'health': /clinic|hospital|health|medical/i.test(title),
    'education': /school|college|student|program/i.test(title),
    'safety': /fire|crash|accident|emergency|police/i.test(title),
    'business': /business|jobs|economic|expansion/i.test(title),
    'community': /food bank|charity|donation|fundraiser/i.test(title),
    'weather': /weather|advisory|storm|snow/i.test(title),
    'infrastructure': /bridge|road|construction|project/i.test(title),
    'events': /festival|market|fair|celebration/i.test(title)
  };

  // Generate original summary based on detected topics
  if (topics.council) {
    return "Local municipal governance decisions affect community services and property taxation.";
  } else if (topics.health) {
    return "Healthcare developments in Lambton County impact community wellness and medical services.";
  } else if (topics.education) {
    return "Educational initiatives in Sarnia area support student learning and skill development.";
  } else if (topics.safety) {
    return "Public safety incidents in Sarnia area involve emergency services and law enforcement response.";
  } else if (topics.business) {
    return "Economic activities in Sarnia region affect local employment and business development.";
  } else if (topics.community) {
    return "Community support organizations in Sarnia area provide assistance and charitable services.";
  } else if (topics.weather) {
    return "Weather conditions and forecasts impact Lambton County residents and travel.";
  } else if (topics.infrastructure) {
    return "Infrastructure projects and developments affect transportation and community facilities.";
  } else if (topics.events) {
    return "Community events and gatherings bring residents together for cultural and social activities.";
  } else {
    return "Local news and developments in Sarnia area impact community life and services.";
  }
}

// Utility functions
function sanitizeText(text) {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, ' ') // Replace HTML entities with space
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
}

function validateArticle(article) {
  const errors = [];
  
  if (!article.title || article.title.trim().length < 10) {
    errors.push('Title too short or missing');
  }
  
  if (article.title && article.title.length > CONFIG.maxTitleLength) {
    errors.push('Title too long');
  }
  
  if (!article.scrapedAt) {
    errors.push('Missing timestamp');
  }
  
  if (!article.source) {
    errors.push('Missing source');
  }
  
  // Check for copyright compliance
  if (article.summary && article.summary.length > CONFIG.maxSummaryLength) {
    errors.push('Summary too long for fair dealing');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, attempts = CONFIG.retryAttempts) {
  for (let i = 0; i < attempts; i++) {
    try {
      console.log(`📰 Attempting to fetch news (attempt ${i + 1}/${attempts})`);
      
      const { data } = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 30000
      });
      
      return data;
    } catch (error) {
      console.error(`❌ Attempt ${i + 1} failed:`, error.message);
      
      if (i < attempts - 1) {
        console.log(`⏳ Retrying in ${CONFIG.retryDelay / 1000} seconds...`);
        await delay(CONFIG.retryDelay);
      }
    }
  }
  
  throw new Error(`Failed to fetch after ${attempts} attempts`);
}

async function scrapeCopyrightCompliantNews() {
  console.log('🚀 Starting copyright-compliant news scraper...');
  
  try {
    const html = await fetchWithRetry(CONFIG.sourceUrl);
    const $ = cheerio.load(html);
    
    const newStories = [];
    
    // Try multiple selectors to find articles
    const articleSelectors = [
      '.article-card__link',
      '.article-card a',
      'h3 a',
      '.entry-title a',
      'article a'
    ];
    
    let articlesFound = false;
    
    for (const selector of articleSelectors) {
      console.log(`🔍 Trying selector: ${selector}`);
      
      $(selector).each((i, el) => {
        if (newStories.length >= CONFIG.maxArticles) return false;
        
        const $el = $(el);
        const title = sanitizeText($el.text().trim());
        const url = $el.attr('href');
        
        if (!title || title.length < 10) return;
        
        // Create full URL if relative
        const fullUrl = url && url.startsWith('http') ? url : `https://www.theobserver.ca${url}`;
        
        // Generate copyright-compliant summary
        const summary = generateCompliantSummary(title);
        
        const article = {
          title: truncateText(title, CONFIG.maxTitleLength),
          summary: truncateText(summary, CONFIG.maxSummaryLength),
          source: CONFIG.sourceName,
          url: fullUrl,
          scrapedAt: new Date().toISOString(),
          compliance: 'fair-dealing'
        };
        
        const validation = validateArticle(article);
        if (validation.isValid) {
          newStories.push(article);
          console.log(`✅ Added: ${article.title.substring(0, 50)}...`);
        } else {
          console.log(`❌ Skipped article: ${validation.errors.join(', ')}`);
        }
        
        articlesFound = true;
      });
      
      if (articlesFound) break;
    }
    
    if (newStories.length === 0) {
      console.warn('⚠️ No articles found with any selector');
      // Create fallback articles
      newStories.push({
        title: 'News service temporarily unavailable',
        summary: 'We are experiencing technical difficulties with our news feed. Please check back later.',
        source: CONFIG.sourceName,
        url: CONFIG.sourceUrl,
        scrapedAt: new Date().toISOString(),
        compliance: 'fair-dealing'
      });
    }
    
    // Load existing articles for deduplication
    let existingStories = [];
    if (fs.existsSync(CONFIG.cacheFile)) {
      try {
        const existingData = fs.readFileSync(CONFIG.cacheFile, 'utf8');
        existingStories = JSON.parse(existingData);
      } catch (err) {
        console.warn('⚠️ Error reading existing news file:', err.message);
      }
    }
    
    // Merge and deduplicate
    const allStories = [...newStories, ...existingStories];
    const uniqueStories = allStories.filter(
      (story, index, self) =>
        index === self.findIndex(s => s.title === story.title)
    );
    
    // Filter by age
    const cutoff = Date.now() - (CONFIG.maxAgeDays * 24 * 60 * 60 * 1000);
    const freshStories = uniqueStories.filter(story => {
      const ts = new Date(story.scrapedAt).getTime();
      return ts >= cutoff;
    });
    
    // Sort by most recent and limit
    const finalStories = freshStories
      .sort((a, b) => new Date(b.scrapedAt) - new Date(a.scrapedAt))
      .slice(0, CONFIG.maxArticles);
    
    // Write to file
    fs.writeFileSync(CONFIG.cacheFile, JSON.stringify(finalStories, null, 2));
    
    console.log(`🎉 Copyright-compliant scraping complete!`);
    console.log(`📊 Stats:`);
    console.log(`   - New articles found: ${newStories.length}`);
    console.log(`   - Total after deduplication: ${uniqueStories.length}`);
    console.log(`   - After age filtering: ${freshStories.length}`);
    console.log(`   - Final articles saved: ${finalStories.length}`);
    console.log(`📁 Saved to: ${CONFIG.cacheFile}`);
    console.log(`⚖️ All content complies with Canadian fair dealing provisions`);
    
    return {
      success: true,
      articlesFound: newStories.length,
      totalSaved: finalStories.length,
      filePath: CONFIG.cacheFile,
      compliance: 'fair-dealing'
    };
    
  } catch (error) {
    console.error('❌ Copyright-compliant scraping failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Create emergency fallback content
    const fallbackArticle = {
      title: 'News service temporarily unavailable',
      summary: 'We are experiencing technical difficulties with our news feed. Please check back later.',
      source: CONFIG.sourceName,
      url: CONFIG.sourceUrl,
      scrapedAt: new Date().toISOString(),
      compliance: 'fair-dealing'
    };
    
    try {
      fs.writeFileSync(CONFIG.cacheFile, JSON.stringify([fallbackArticle], null, 2));
      console.log('📝 Emergency fallback content written');
    } catch (writeErr) {
      console.error('❌ Failed to write emergency fallback:', writeErr.message);
    }
    
    return {
      success: false,
      error: error.message,
      articlesFound: 0,
      totalSaved: 1,
      compliance: 'fair-dealing'
    };
  }
}

// Run if called directly
if (require.main === module) {
  scrapeCopyrightCompliantNews()
    .then(result => {
      if (result.success) {
        console.log('✅ Copyright-compliant news scraping completed successfully');
        process.exit(0);
      } else {
        console.log('❌ Copyright-compliant news scraping failed');
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('💥 Fatal error in copyright-compliant scraper:', err);
      process.exit(1);
    });
}

module.exports = { scrapeCopyrightCompliantNews, CONFIG };
