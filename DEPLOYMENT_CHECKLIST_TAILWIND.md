# 🚀 Tailwind Deployment Checklist

## ✅ Pre-Deployment Testing

Test the new Tailwind version locally before deploying:

1. **Open index-tailwind.html directly:**
   ```
   File → Open → e:\IThero\Sarnia Dashboard\public\index-tailwind.html
   ```

2. **Check all modules load:**
   - [ ] Border wait times display
   - [ ] VIA Rail schedule appears
   - [ ] Transit status loads
   - [ ] Weather forecast shows (today + 3-day)
   - [ ] News carousel rotates
   - [ ] Events appear
   - [ ] QR code visible (desktop only)
   - [ ] Ad section visible (desktop only)

3. **Test responsive breakpoints:**
   - [ ] Open Chrome DevTools (F12)
   - [ ] Toggle device toolbar (Ctrl+Shift+M)
   - [ ] Test these sizes:
     - iPhone SE (375px) - 1 column
     - iPad (768px) - 2 columns
     - Desktop (1440px) - 3 columns
     - 4K (3840px) - 3 columns with max-width

4. **Verify no console errors:**
   - [ ] Check Console tab (F12)
   - [ ] Look for "✅ Tailwind mode detected" message
   - [ ] Confirm no 404 errors for Tailwind CDN

---

## 🔄 Deployment Options

### Option A: Immediate Full Replacement (Recommended)

**Use this if testing looks good:**

```bash
cd "e:\IThero\Sarnia Dashboard"

# Backup old version
mv public/index.html public/index-legacy.html
mv public/style-dashboard.css public/style-legacy.css

# Activate Tailwind
mv public/index-tailwind.html public/index.html

# Deploy
git add -A
git commit -m "Switch to Tailwind CSS - replace old dashboard"
git push
```

**Timeline:** Railway redeploys in ~2 minutes

---

### Option B: Gradual A/B Testing

**Use this if you want to test both versions live:**

```bash
cd "e:\IThero\Sarnia Dashboard"

# Just push the Tailwind files without replacing
git push
```

**Access:**
- Old version: `https://sarniacommunitydashboard.com/`
- New version: `https://sarniacommunitydashboard.com/index-tailwind.html`

**Share both URLs with test users for feedback**

Once satisfied (after 24-48 hours):
```bash
# Then replace index.html with Tailwind version
mv public/index.html public/index-legacy.html
mv public/index-tailwind.html public/index.html
git add -A
git commit -m "Promote Tailwind version to production"
git push
```

---

### Option C: Keep Both Versions Permanently

**Use this if you need different versions for different displays:**

- Default: `index.html` (current CSS grid)
- Tailwind: `index-tailwind.html` (new responsive)

**Use case:** TV displays use old version, mobile users use new version

---

## 📱 Post-Deployment Testing

After Railway deploys:

### 1. Desktop Testing
- [ ] Visit `https://sarniacommunitydashboard.com/` (or index-tailwind.html)
- [ ] Verify 3-column grid
- [ ] Check QR code bottom-right
- [ ] Check ad section above QR code
- [ ] Test all data modules load

### 2. Mobile Testing
- [ ] Open on real phone (iPhone/Android)
- [ ] Verify 1-column stacked layout
- [ ] Confirm QR/ads hidden
- [ ] Test scrolling in each module
- [ ] Check header stacks vertically

### 3. Tablet Testing
- [ ] Open on iPad or tablet
- [ ] Verify 2-column grid
- [ ] Check news section spans 2 columns

### 4. TV/Kiosk Testing
- [ ] Open on 1080p or 4K display
- [ ] Verify max-width container (doesn't stretch too wide)
- [ ] Check all modules visible without scrolling

---

## 🐛 Common Issues & Fixes

### Issue: "Tailwind classes not applying"
**Symptom:** Page looks unstyled or broken
**Fix:** 
1. Check network tab - ensure Tailwind CDN loaded
2. Look for `https://cdn.tailwindcss.com` in Network tab
3. If blocked, check Railway logs for CSP errors

### Issue: "Data not updating"
**Symptom:** Border times show "Updating..." forever
**Fix:**
1. Check Railway logs: `railway logs`
2. Verify scrapers running (should see scrape messages)
3. Test API endpoints: `/api/border-wait`, `/api/via-rail`

### Issue: "Layout broken on mobile"
**Symptom:** Horizontal scrolling or overlap
**Fix:**
1. Check `<meta name="viewport">` tag exists
2. Verify `max-w-[2560px] mx-auto` on main container
3. Look for fixed-width elements (should use `max-w-*`)

### Issue: "Old CSS conflicts with Tailwind"
**Symptom:** Some elements look wrong
**Fix:**
1. Ensure `style-dashboard.css` NOT loaded in index-tailwind.html
2. Only `style-custom.css` should be loaded
3. Check browser cache (hard refresh: Ctrl+Shift+R)

---

## 🧹 Cleanup After Successful Deployment

Once Tailwind version is live and tested (1 week):

```bash
cd "e:\IThero\Sarnia Dashboard"

# Remove old files
rm public/index-legacy.html
rm public/style-legacy.css

# Commit cleanup
git add -A
git commit -m "Remove legacy CSS files - Tailwind now default"
git push
```

**Keep these files:**
- `style-custom.css` - Essential for animations
- `script.js` - Core logic
- `script-tailwind.js` - Tailwind-specific rendering
- `events.js` - Event carousel

---

## 📊 Rollback Plan

If something breaks after deployment:

### Quick Rollback (5 minutes)

```bash
cd "e:\IThero\Sarnia Dashboard"

# Restore old version
mv public/index-legacy.html public/index.html

# Redeploy
git add public/index.html
git commit -m "Rollback to legacy CSS - investigating Tailwind issues"
git push
```

### Full Rollback (keep old files)

```bash
# If you didn't delete legacy files yet, just rename:
mv public/index.html public/index-tailwind-broken.html
mv public/index-legacy.html public/index.html
git add -A
git commit -m "Temporary rollback to legacy version"
git push
```

---

## 🎯 Success Criteria

✅ **Deployment is successful when:**

1. All 6 data modules load and update in real-time
2. Mobile view (< 768px) shows 1-column layout
3. Desktop view shows 3-column grid
4. No horizontal scrolling on any device
5. QR code and ads hidden on mobile
6. Typography is readable on all screen sizes
7. No console errors in browser DevTools
8. Page loads in < 3 seconds

---

## 📞 Need Help?

Check these resources:

1. **Implementation Guide:** `TAILWIND_IMPLEMENTATION_GUIDE.md`
2. **Visual Examples:** `TAILWIND_VISUAL_COMPARISON.md`
3. **Railway Logs:** Run `railway logs` in terminal
4. **Browser Console:** F12 → Console tab

---

*Ready to deploy? Choose Option A, B, or C above and follow the steps!*
