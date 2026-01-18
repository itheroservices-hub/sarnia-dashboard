# Quick Deployment Commands

## Test Locally First

```powershell
# Install dependencies
npm install

# Start server
npm start

# Open browser to http://localhost:3000
# Verify dashboard loads and all modules work
```

---

## Deploy to GitHub

```powershell
# Initialize Git (if not already done)
git init

# Add all files (respects .gitignore)
git add .

# Commit
git commit -m "Sarnia Community Dashboard - Production Ready"

# Add your GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/sarnia-community-dashboard.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

## After Render Deployment

### Verify All Endpoints Work

Test these URLs (replace `YOUR-APP.onrender.com` with your actual Render URL):

```
https://YOUR-APP.onrender.com
https://YOUR-APP.onrender.com/api/border-wait
https://YOUR-APP.onrender.com/api/via-rail
https://YOUR-APP.onrender.com/api/events
https://YOUR-APP.onrender.com/transit.json
https://YOUR-APP.onrender.com/weather/today
https://YOUR-APP.onrender.com/weather/threeday
```

All should return JSON data (except root URL which shows dashboard).

---

## Update Code After Deployment

```powershell
# Make changes to files
# ...

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Update scraper logic for improved error handling"

# Push (triggers automatic Render redeploy)
git push
```

Render will automatically rebuild and deploy within 2-3 minutes.

---

## Emergency Rollback

If something breaks after an update:

1. Go to Render Dashboard → Your Service → "Events" tab
2. Find the last working deployment
3. Click "Redeploy" next to that event
4. Wait 2-3 minutes for rollback to complete

---

## Monitor Logs

```powershell
# In Render Dashboard, click "Logs" tab
# Look for:
# ✅ Success messages with checkmarks
# ❌ Error messages with X marks
# 🚆 VIA Rail scraper messages
# 📰 News scraper messages
```

---

## Performance Tips

### Free Tier (Spins Down)
- First load may take 30-60 seconds after inactivity
- Use https://uptimerobot.com (free) to ping every 10 minutes
- This keeps service "warm" and responsive

### Paid Tier ($7/month)
- Always-on, no spin-down
- Fast response times 24/7
- Recommended for public display on TVs

---

## Common Issues & Quick Fixes

### Issue: Dashboard shows "Loading..." forever
**Fix:** Check Render logs for scraper errors, may need to update selectors

### Issue: Border times not updating
**Fix:** Verify CBSA website hasn't changed structure, check scraper logs

### Issue: VIA Rail data missing
**Fix:** Check VIA Rail scraper logs, Puppeteer may need Chromium installed

### Issue: Domain not working
**Fix:** Wait 24-48 hours for DNS propagation, verify CNAME in Namecheap

---

## Production Checklist

- [ ] Tested locally on http://localhost:3000
- [ ] All scrapers run without errors
- [ ] Pushed to GitHub
- [ ] Deployed to Render
- [ ] All API endpoints return data
- [ ] Dashboard displays all modules correctly
- [ ] Data updates every 5-20 minutes
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic on Render)
- [ ] Tested on mobile, tablet, desktop
- [ ] Logs monitored for 24 hours (no critical errors)

---

**Ready for Production! 🚀**
