# 🔧 TROUBLESHOOTING GUIDE

Common issues and their solutions.

---

## 🗄️ MONGODB ATLAS ISSUES

### Problem: "Cannot connect to MongoDB"

**Symptoms:**
- Render build fails with "MongooseServerSelectionError"
- Backend logs show connection timeout

**Solutions:**

1. **Check Connection String:**
   ```
   ✅ Correct: mongodb+srv://schooladmin:MyPass123@cluster.mongodb.net/...
   ❌ Wrong: mongodb+srv://schooladmin:<password>@cluster.mongodb.net/...
   ```
   - Make sure you replaced `<password>` with actual password
   - Remove the `<` and `>` brackets

2. **Check Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Make sure you see: `0.0.0.0/0` with status "Active"
   - If not, add it: Add IP Address → Allow Access from Anywhere

3. **Check Database User:**
   - Go to MongoDB Atlas → Database Access
   - Make sure `schooladmin` exists
   - Make sure role is "Read and write to any database"

4. **Check Render Environment Variable:**
   - Go to Render → Your Service → Environment
   - Check MONGODB_URI is set correctly
   - No extra spaces before or after

**Still not working?**
- Create a new database user with a simple password (no special characters)
- Update connection string
- Redeploy

---

### Problem: "Database user authentication failed"

**Solution:**
- Password might have special characters
- MongoDB escapes some characters in URLs
- Use a simple password: letters and numbers only
- Or encode special characters:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `&` → `%26`

---

## 🚀 RENDER BACKEND ISSUES

### Problem: "Build failed" on Render

**Check Build Logs:**
1. Go to Render → Your Service
2. Click on the latest deploy
3. Read the error message

**Common Causes:**

**Error: "Cannot find module..."**
- Root Directory might be wrong
- Make sure it's set to exactly: `backend`

**Error: "npm install failed"**
- Check `package.json` exists in backend folder
- Try Manual Deploy: Click "Manual Deploy" → "Clear build cache & deploy"

**Error: "Port already in use"**
- Make sure Start Command is: `npm start`
- Make sure PORT environment variable is: `5000`

---

### Problem: "Deploy succeeded but /health returns 503"

**Solution:**
1. Wait 2-3 minutes - service might still be starting
2. Check Logs tab for errors
3. Make sure all 6 environment variables are set
4. Try Manual Deploy

---

### Problem: "Backend is very slow (30-60 seconds)"

**This is NORMAL for Render free tier!**
- Free tier sleeps after 15 minutes of inactivity
- First request wakes it up (30-60 seconds)
- Subsequent requests are fast

**Solutions:**
- Upgrade to paid tier ($7/month) for 24/7 uptime
- Or accept the cold start delay
- Or ping your backend every 10 minutes to keep it awake

---

## ☁️ CLOUDFLARE PAGES ISSUES

### Problem: "Build failed" on Cloudflare

**Check Settings:**
1. Framework preset: Should be "None"
2. Build command: Should be EMPTY
3. Build output directory: Should be `frontend`
4. Root directory: Should be `frontend`

**If still failing:**
- Go to Deployments tab
- Click on failed deployment
- Read error message

---

### Problem: "Site deployed but shows 404"

**Solution:**
1. Check Root directory is set to `frontend`
2. Check Build output directory is `frontend`
3. Try redeploying:
   - Go to Deployments
   - Click "..." menu
   - Click "Retry deployment"

---

## 🔗 FRONTEND-BACKEND CONNECTION ISSUES

### Problem: "Cannot connect to backend" or "CORS error"

**Check Browser Console:**
1. Open your site
2. Press F12 (or Cmd+Option+I on Mac)
3. Click "Console" tab
4. Look for red errors

**Common Error: "CORS policy blocked..."**

**Solutions:**

1. **Check config.js:**
   ```javascript
   // ✅ Correct
   BASE_URL: 'https://school-management-api-xxxx.onrender.com',
   
   // ❌ Wrong - has trailing slash
   BASE_URL: 'https://school-management-api-xxxx.onrender.com/',
   
   // ❌ Wrong - localhost in production
   BASE_URL: 'http://localhost:5000',
   ```

2. **Check FRONTEND_URL on Render:**
   - Go to Render → Environment
   - Make sure FRONTEND_URL is set
   - Should match your Cloudflare Pages URL exactly
   - Example: `https://school-management.pages.dev`
   - NO trailing slash!

3. **After adding FRONTEND_URL:**
   - Wait for service to redeploy (2-3 minutes)
   - Hard refresh your frontend (Ctrl+Shift+R)

---

### Problem: "Failed to fetch" or "Network error"

**Solutions:**

1. **Backend might be asleep:**
   - Visit `https://YOUR-BACKEND.onrender.com/health` first
   - Wait 30-60 seconds
   - Then try your app again

2. **Wrong backend URL:**
   - Check config.js has correct URL
   - Make sure you pushed the change to GitHub
   - Cloudflare Pages should auto-redeploy

3. **Backend is down:**
   - Go to Render Dashboard
   - Check if service shows "Live"
   - If not, check logs for errors

---

## 🔐 AUTHENTICATION ISSUES

### Problem: "Login not working" or "Invalid credentials"

**Solutions:**

1. **Clear browser cache:**
   - Press Ctrl+Shift+Delete
   - Select "Cookies" and "Cached files"
   - Click "Clear data"
   - Try again

2. **Check JWT_SECRET:**
   - Go to Render → Environment
   - Make sure JWT_SECRET is set
   - Should be 64 characters long

3. **Create new account:**
   - Try signing up with a new account
   - If signup works but login doesn't, it's a JWT issue

4. **Check browser console:**
   - Press F12
   - Look for error messages
   - Share with support if needed

---

### Problem: "Token expired" error

**Solution:**
- This is normal after 7 days
- Just log in again
- Token expiry is set in backend for security

---

## 📤 IMAGE UPLOAD ISSUES

### Problem: "Failed to upload image"

**Solutions:**

1. **Check file size:**
   - Maximum: 5MB per image
   - Compress large images before uploading

2. **Check file type:**
   - Allowed: JPG, JPEG, PNG, GIF, WEBP
   - Not allowed: BMP, TIFF, SVG

3. **Check Cloudinary credentials:**
   - Go to Render → Environment
   - Verify all 3 Cloudinary variables are set
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET

4. **Check Cloudinary quota:**
   - Login to Cloudinary
   - Check Dashboard
   - Free tier: 25 credits/month
   - ~1,000 images
   - If exceeded, upgrade or wait for next month

---

## 🎨 UI/DISPLAY ISSUES

### Problem: "Entry forms not showing for my role"

**Expected behavior:**

| Role | Forms Visible |
|------|---------------|
| Principal | None - only Dashboard |
| Management Staff | None - only Dashboard |
| Class Teacher | All 3 forms |
| Section Head | All 3 forms |
| Non-Academic Staff | All 3 forms |
| Worker | Only Resources form |

**If not seeing expected forms:**
1. Check your role in profile
2. Logout and login again
3. Clear browser cache
4. Try different browser

---

### Problem: "Profile picture not updating"

**Solutions:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Check file size (under 5MB)
4. Check Cloudinary credentials
5. Try different image

---

## 🐛 GENERAL DEBUGGING STEPS

### Step 1: Check Browser Console
```
1. Press F12 (Windows/Linux) or Cmd+Option+I (Mac)
2. Click "Console" tab
3. Look for red errors
4. Read the error messages
```

### Step 2: Check Network Tab
```
1. Press F12
2. Click "Network" tab
3. Reload page
4. Look for failed requests (red)
5. Click on failed request
6. Read error details
```

### Step 3: Check Render Logs
```
1. Go to Render Dashboard
2. Click your service
3. Click "Logs" tab
4. Look for errors
5. Recent logs are at bottom
```

### Step 4: Test Backend Health
```
Visit: https://YOUR-BACKEND.onrender.com/health

✅ Working: {"status":"OK","message":"Server is running"}
❌ Not working: Error 503 or timeout
```

### Step 5: Test Backend API
```
Use browser or Postman to test:

1. Health check:
   GET https://YOUR-BACKEND.onrender.com/health

2. Sign up (should work without login):
   POST https://YOUR-BACKEND.onrender.com/api/auth/signup
   Body: {JSON with user data}
```

---

## 📞 STILL HAVING ISSUES?

### Before Contacting Support:

Please gather this information:

1. **What are you trying to do?**
   - Example: "Deploy backend to Render"

2. **What's the exact error message?**
   - Copy/paste from browser console or Render logs

3. **What have you tried?**
   - List the solutions you've attempted

4. **Screenshots:**
   - Take screenshots of errors
   - Take screenshot of Render environment variables
   - Take screenshot of browser console

### Contact Information:

**Email:** urandileepa@gmail.com  
**Subject:** School Management System - [Your Issue]

**Include in email:**
- Error description
- Error messages
- Screenshots
- What you've tried

**Response time:** Usually within 24 hours

---

## 🔍 QUICK DIAGNOSTICS

### Is the problem with Backend or Frontend?

**Test 1: Backend Health**
```
Visit: https://YOUR-BACKEND.onrender.com/health
```

✅ Returns `{"status":"OK"}` → Backend is fine  
❌ Error 503 or timeout → Backend issue

**Test 2: Frontend Loading**
```
Visit: https://YOUR-FRONTEND.pages.dev
```

✅ Page loads → Frontend is deployed  
❌ 404 error → Frontend deployment issue

**Test 3: Backend-Frontend Connection**
```
1. Open your site
2. Open browser console (F12)
3. Try to login
4. Check console for errors
```

✅ No errors → Working fine  
❌ CORS error → FRONTEND_URL not set  
❌ Network error → Wrong BASE_URL in config.js

---

## ✅ PREVENTIVE MEASURES

### Before Deploying:

- [ ] Double-check all environment variables
- [ ] Test MongoDB connection string locally
- [ ] Verify Cloudinary credentials
- [ ] Make sure config.js has correct BASE_URL
- [ ] Push all changes to GitHub

### After Deploying:

- [ ] Test /health endpoint
- [ ] Test frontend loads
- [ ] Test signup
- [ ] Test login
- [ ] Test each entry form
- [ ] Test with different roles

### Regular Maintenance:

- [ ] Check Cloudinary usage monthly
- [ ] Monitor Render build minutes
- [ ] Backup MongoDB data monthly
- [ ] Update passwords quarterly
- [ ] Review user accounts monthly

---

## 📚 USEFUL RESOURCES

### MongoDB Atlas
- Documentation: https://docs.atlas.mongodb.com/
- Connection issues: https://docs.atlas.mongodb.com/troubleshoot-connection/
- Support: https://support.mongodb.com/

### Render
- Documentation: https://render.com/docs
- Status: https://status.render.com/
- Community: https://community.render.com/

### Cloudflare Pages
- Documentation: https://developers.cloudflare.com/pages/
- Status: https://www.cloudflarestatus.com/
- Community: https://community.cloudflare.com/

### Cloudinary
- Documentation: https://cloudinary.com/documentation
- Support: https://support.cloudinary.com/

---

## 💡 PRO TIPS

1. **Keep a deployment log:**
   - Document what you did
   - Save all URLs
   - Save all credentials securely

2. **Test in incognito mode:**
   - Helps identify cache issues
   - Clean slate for testing

3. **Use browser DevTools:**
   - Console tab for errors
   - Network tab for API calls
   - Application tab for localStorage

4. **Monitor service status:**
   - Bookmark status pages
   - Check before troubleshooting

5. **Backup regularly:**
   - Export MongoDB data
   - Keep local copy of code

---

**Remember:** 99% of issues are configuration problems, not code bugs!

**Check environment variables FIRST!**

---

**End of Troubleshooting Guide**
