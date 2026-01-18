# Render.com Deployment Guide
## Sarnia Community Dashboard - Step-by-Step

---

## Prerequisites

- [x] GitHub account
- [x] Render.com account (sign up at https://render.com)
- [x] Domain access (Namecheap account for sarniacommunitydashboard.com)

---

## Part 1: GitHub Setup (15 minutes)

### Step 1: Create Repository

1. Go to https://github.com/new
2. Repository name: `sarnia-community-dashboard` (or your preference)
3. Description: `Real-time community dashboard for Sarnia, Ontario`
4. **Important:** Select **Private** (contains API keys)
5. Do NOT initialize with README (project already has one)
6. Click "Create repository"

### Step 2: Push Project to GitHub

Open PowerShell in your project directory (`E:\IThero\Sarnia Dashboard`):

```powershell
# Initialize Git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Sarnia Community Dashboard ready for deployment"

# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/sarnia-community-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Verify:** Go to your GitHub repo and confirm all files are uploaded (except `node_modules/`)

---

## Part 2: Render.com Setup (20 minutes)

### Step 1: Create Account & Connect GitHub

1. Go to https://render.com
2. Click "Get Started" or "Sign Up"
3. Choose "Sign in with GitHub"
4. Authorize Render to access your GitHub account
5. Select which repositories Render can access (choose your repo)

### Step 2: Create New Web Service

1. From Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your repository: `sarnia-community-dashboard`
3. Click "Connect"

### Step 3: Configure Web Service

Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `sarnia-dashboard` (or your preference) |
| **Region** | Oregon (US West) - closest to Sarnia |
| **Branch** | `main` |
| **Root Directory** | *(leave blank)* |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

### Step 4: Choose Plan

**For Testing:**
- Select **"Free"** plan
- Note: Free tier sleeps after 15 min inactivity (wakes on request)

**For Production (Recommended):**
- Select **"Starter"** plan ($7/month)
- Always-on, no sleep
- Custom domain support

Click **"Create Web Service"**

### Step 5: Wait for Deployment

- Render will automatically:
  1. Clone your repo
  2. Run `npm install`
  3. Start `node server.js`
  4. Assign a URL (e.g., `sarnia-dashboard.onrender.com`)

- Monitor the **Logs** tab for progress
- First deployment takes 3-5 minutes
- You'll see: `🚀 Server running on port 10000` (Render assigns port automatically)

### Step 6: Test Your Deployment

1. Click the URL at top of page (e.g., `https://sarnia-dashboard.onrender.com`)
2. Dashboard should load fully
3. Check that all modules work:
   - Border wait times
   - VIA Rail schedule
   - Transit status
   - Weather
   - Local news
   - Community events

---

## Part 3: Custom Domain Setup (24-48 hours for DNS propagation)

### Step 1: Add Custom Domain in Render

1. In your Render web service, go to **"Settings"** tab
2. Scroll to **"Custom Domain"** section
3. Click **"Add Custom Domain"**
4. Enter: `sarniacommunitydashboard.com`
5. Click **"Save"**

Render will show you DNS instructions (we'll use these next)

### Step 2: Configure Namecheap DNS

1. Log in to Namecheap
2. Go to **Domain List** → Click **"Manage"** next to sarniacommunitydashboard.com
3. Go to **"Advanced DNS"** tab
4. Delete existing A records for `@` (root domain)
5. Add new **CNAME Record**:

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | CNAME Record | @ | sarnia-dashboard.onrender.com | Automatic |

6. If you also want `www.sarniacommunitydashboard.com` to work, add:

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | CNAME Record | www | sarnia-dashboard.onrender.com | Automatic |

7. Click **"Save All Changes"**

### Step 3: Wait for DNS Propagation

- DNS changes take **24-48 hours** to propagate globally
- Usually works within **1-2 hours** for most regions
- Check status: https://dnschecker.org

### Step 4: SSL Certificate (Automatic)

- Render automatically provisions a **free SSL certificate** (Let's Encrypt)
- Once DNS propagates, your site will be accessible at:
  - `https://sarniacommunitydashboard.com` ✅
  - Redirects HTTP → HTTPS automatically

---

## Part 4: Verify Scrapers Are Running

### Check Logs in Render

1. Go to your web service in Render
2. Click **"Logs"** tab
3. Look for these messages:

```
🚆 VIA Rail scraper ran at startup
📰 Initial copyright-compliant news scrape complete
✅ Border scraper completed
[INFO] transit pulse builder finished
```

### Check Live Data Updates

1. Open dashboard in browser
2. Note current border wait time
3. Wait 5-10 minutes
4. Refresh page
5. Verify data has updated (check timestamp badge)

---

## Part 5: Environment Variables (Optional)

If you want to secure API keys (recommended for production):

### Step 1: Create .env File Locally

Create `e:\IThero\Sarnia Dashboard\.env`:

```
OPENWEATHER_API_KEY=358109cc7c1d67419364bfdde1dbc335
PORT=10000
NODE_ENV=production
```

### Step 2: Update Code to Use Environment Variables

In `public/script.js`, replace line 21:

**Old:**
```javascript
const WEATHER_API_KEY = '358109cc7c1d67419364bfdde1dbc335';
```

**New:**
```javascript
// Remove hardcoded key, fetch from backend instead
```

Then create a new endpoint in `server.js`:

```javascript
app.get('/api/weather-key', (req, res) => {
  res.json({ key: process.env.OPENWEATHER_API_KEY });
});
```

### Step 3: Add to Render

1. In Render web service, go to **"Environment"** tab
2. Click **"Add Environment Variable"**
3. Add:
   - **Key:** `OPENWEATHER_API_KEY`
   - **Value:** `358109cc7c1d67419364bfdde1dbc335`
4. Click **"Save Changes"**
5. Render will automatically redeploy

---

## Part 6: Monitoring & Maintenance

### Check Service Health

- **Render Dashboard:** Shows uptime, deployment status
- **Logs Tab:** Real-time server logs
- **Metrics Tab:** CPU, memory, bandwidth usage

### Update Deployment

When you make code changes:

```powershell
git add .
git commit -m "Description of changes"
git push
```

Render automatically redeploys within 2-3 minutes.

### Rollback (if needed)

1. In Render, go to **"Events"** tab
2. Find previous successful deployment
3. Click **"Redeploy"**

---

## Troubleshooting

### Dashboard Shows "Loading..." Forever

**Cause:** Scrapers may have failed  
**Fix:**
1. Check Render logs for errors
2. Look for `❌` emoji in logs
3. Common issues:
   - CBSA website structure changed → update scraper
   - VIA Rail site down → scraper will retry
   - Puppeteer dependency issue → see below

### Puppeteer Error: "Could not find Chromium"

**Cause:** Render needs Chromium for Puppeteer  
**Fix:**

Update `package.json` scripts:

```json
"scripts": {
  "start": "node server.js",
  "build": "npm install && npx puppeteer browsers install chrome"
}
```

In Render settings, change:
- **Build Command:** `npm run build`
- **Start Command:** `npm start`

### Free Tier Sleeps

**Symptom:** First page load takes 30+ seconds  
**Cause:** Free tier spins down after 15 min inactivity  
**Fix:**
- Upgrade to Starter plan ($7/month) for always-on
- OR use free uptime monitoring service (e.g., UptimeRobot) to ping every 10 minutes

### Domain Not Working After 48 Hours

**Check:**
1. DNS propagation: https://dnschecker.org
2. Namecheap DNS settings (verify CNAME is correct)
3. Render custom domain status (should show "Verified")
4. Try accessing via Render URL directly (e.g., `sarnia-dashboard.onrender.com`)

---

## Success Checklist

- [ ] GitHub repo created and code pushed
- [ ] Render account created and connected to GitHub
- [ ] Web service deployed successfully
- [ ] Dashboard loads at Render URL (e.g., `sarnia-dashboard.onrender.com`)
- [ ] All data modules display correctly:
  - [ ] Border wait times
  - [ ] VIA Rail schedule
  - [ ] Transit status
  - [ ] Weather forecast
  - [ ] Local news carousel
  - [ ] Community events
- [ ] Scrapers running (check logs)
- [ ] Data updates every 5-20 minutes
- [ ] Custom domain added in Render
- [ ] Namecheap DNS configured with CNAME
- [ ] Domain accessible (after DNS propagation)
- [ ] HTTPS enabled (automatic)

---

## Next Steps After Deployment

1. **Test on Multiple Devices:** Phone, tablet, desktop
2. **Monitor for 24 Hours:** Check Render logs for any errors
3. **Share with Stakeholders:** Send link to city officials, tourism office
4. **Plan for TV Display:** Test on large screen, adjust font sizes if needed
5. **Set Up Monitoring:** Use Render's built-in metrics or add external uptime monitoring

---

## Support Resources

- **Render Documentation:** https://render.com/docs
- **Render Community Forum:** https://community.render.com
- **Namecheap DNS Guide:** https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain
- **Render Status Page:** https://status.render.com

---

**Deployment Complete! 🎉**

Your Sarnia Community Dashboard is now live and serving real-time data to the community.
