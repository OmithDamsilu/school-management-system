# ✅ DEPLOYMENT CHECKLIST

Print this page and check off each step as you complete it!

---

## 🎯 PREPARATION (5 minutes)

- [ ] Download `school-management-system.zip`
- [ ] Extract the ZIP file
- [ ] Open the folder and see `backend/` and `frontend/`
- [ ] Install Git on your computer
- [ ] Open Notepad to save credentials

---

## 📊 MONGODB ATLAS SETUP (10 minutes)

- [ ] Create MongoDB Atlas account
- [ ] Verify email
- [ ] Create FREE cluster (choose Singapore/Mumbai region)
- [ ] Wait for cluster to be ready (3-5 minutes)
- [ ] Create database user `schooladmin`
- [ ] Save password in Notepad
- [ ] Add Network Access: `0.0.0.0/0`
- [ ] Get connection string
- [ ] Replace `<password>` in connection string
- [ ] Save complete connection string in Notepad

**✅ Checkpoint:** Connection string saved with real password

---

## 🖼️ CLOUDINARY SETUP (5 minutes)

- [ ] Create Cloudinary account
- [ ] Verify email
- [ ] Go to Dashboard
- [ ] Copy Cloud Name → Save in Notepad
- [ ] Copy API Key → Save in Notepad
- [ ] Copy API Secret → Save in Notepad

**✅ Checkpoint:** All 3 Cloudinary credentials saved

---

## 🔐 GENERATE JWT SECRET (2 minutes)

- [ ] Open Terminal/Command Prompt
- [ ] Run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Copy the result
- [ ] Save in Notepad

**✅ Checkpoint:** JWT secret saved (64 characters)

---

## 📦 GITHUB SETUP (10 minutes)

- [ ] Create GitHub account
- [ ] Verify email
- [ ] Create new repository: `school-management-system`
- [ ] Select "Public"
- [ ] Do NOT add README
- [ ] Save repository URL
- [ ] Open Terminal in project folder
- [ ] Run: `git init`
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "Initial commit"`
- [ ] Run: `git branch -M main`
- [ ] Run: `git remote add origin [YOUR-REPO-URL]`
- [ ] Run: `git push -u origin main`
- [ ] Refresh GitHub → See all files uploaded

**✅ Checkpoint:** All code is on GitHub

---

## 🚀 RENDER BACKEND SETUP (15 minutes)

- [ ] Create Render account (use GitHub login)
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Select `school-management-system`
- [ ] Fill in settings:
  - Name: `school-management-api`
  - Region: Singapore
  - Branch: main
  - Root Directory: `backend`
  - Runtime: Node
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Instance Type: Free

- [ ] Add Environment Variables (6 total):
  - [ ] MONGODB_URI = [Your MongoDB connection string]
  - [ ] JWT_SECRET = [Your JWT secret]
  - [ ] CLOUDINARY_CLOUD_NAME = [Your cloud name]
  - [ ] CLOUDINARY_API_KEY = [Your API key]
  - [ ] CLOUDINARY_API_SECRET = [Your API secret]
  - [ ] PORT = `5000`

- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 minutes)
- [ ] See "Live ✓" status
- [ ] Copy backend URL
- [ ] Save backend URL in Notepad
- [ ] Test: Visit `https://YOUR-URL.onrender.com/health`
- [ ] See: `{"status":"OK","message":"Server is running"}`

**✅ Checkpoint:** Backend is live and working

---

## 🔧 UPDATE FRONTEND CONFIG (5 minutes)

- [ ] Open `frontend/js/config.js` in text editor
- [ ] Find line: `BASE_URL: 'http://localhost:5000',`
- [ ] Replace with: `BASE_URL: 'https://YOUR-BACKEND-URL.onrender.com',`
- [ ] Save file
- [ ] Open Terminal in project folder
- [ ] Run: `git add frontend/js/config.js`
- [ ] Run: `git commit -m "Update API URL"`
- [ ] Run: `git push`
- [ ] Refresh GitHub → See update

**✅ Checkpoint:** Config updated and pushed to GitHub

---

## ☁️ CLOUDFLARE PAGES SETUP (10 minutes)

- [ ] Create Cloudflare account
- [ ] Verify email
- [ ] Click "Workers & Pages"
- [ ] Click "Create application"
- [ ] Click "Pages" tab
- [ ] Click "Connect to Git"
- [ ] Click "Connect GitHub"
- [ ] Authorize Cloudflare
- [ ] Select `school-management-system` repository
- [ ] Click on repository name
- [ ] Fill in settings:
  - Project name: `school-management`
  - Production branch: main
  - Framework preset: None
  - Build command: (leave empty)
  - Build output directory: `frontend`
  - Root directory: `frontend`

- [ ] Click "Save and Deploy"
- [ ] Wait for deployment (2-3 minutes)
- [ ] See "Success!"
- [ ] Copy frontend URL
- [ ] Save frontend URL in Notepad
- [ ] Visit your frontend URL
- [ ] See the landing page

**✅ Checkpoint:** Frontend is live!

---

## 🔗 FINAL BACKEND CONFIG (5 minutes)

- [ ] Go to Render Dashboard
- [ ] Open `school-management-api` service
- [ ] Click "Environment" tab
- [ ] Click "Add Environment Variable"
- [ ] Add: `FRONTEND_URL` = [Your Cloudflare Pages URL]
- [ ] Click "Save Changes"
- [ ] Wait for redeploy (2-3 minutes)
- [ ] See "Live ✓" again

**✅ Checkpoint:** CORS configured

---

## 🧪 TEST EVERYTHING (10 minutes)

### Test 1: Backend Health
- [ ] Visit: `https://YOUR-BACKEND.onrender.com/health`
- [ ] See: `{"status":"OK"...}`

### Test 2: Frontend Loads
- [ ] Visit: Your Cloudflare Pages URL
- [ ] See: Landing page with logo

### Test 3: Sign Up
- [ ] Click "Sign Up"
- [ ] Create account (Class Teacher role)
- [ ] See success message
- [ ] Redirected to login

### Test 4: Login
- [ ] Enter credentials
- [ ] Click "Login"
- [ ] Redirected to profile
- [ ] See your name and role

### Test 5: Entry Forms
- [ ] See 3 entry form cards
- [ ] Click "Daily Waste Entry"
- [ ] Fill in test data
- [ ] Submit form
- [ ] See success message

### Test 6: Principal Account
- [ ] Logout
- [ ] Sign up as Principal role
- [ ] Login
- [ ] Should see Dashboard link
- [ ] Should NOT see entry forms

### Test 7: Worker Account
- [ ] Logout
- [ ] Sign up as Worker role
- [ ] Login
- [ ] Should see ONLY Resources form
- [ ] Should NOT see Waste/Space forms

**✅ Checkpoint:** Everything works!

---

## 🎉 YOU'RE DONE!

### Your URLs:
```
Frontend: _________________________________

Backend: __________________________________
```

### Default Test Accounts:
```
Teacher:
- Username: testteacher
- Password: teacher123

Principal:
- Username: principal  
- Password: principal123

Worker:
- Username: worker
- Password: worker123
```

---

## 📝 SAVE THESE FOR LATER:

### MongoDB Atlas
- Dashboard: https://cloud.mongodb.com/
- Username: schooladmin
- Password: _______________

### Cloudinary
- Dashboard: https://cloudinary.com/console
- Cloud Name: _______________
- API Key: _______________
- API Secret: _______________

### Render
- Dashboard: https://dashboard.render.com/
- Backend URL: _______________

### Cloudflare
- Dashboard: https://dash.cloudflare.com/
- Frontend URL: _______________

### GitHub
- Repository: _______________

---

## 🆘 HAVING ISSUES?

Check `TROUBLESHOOTING.md` or contact:
- Email: urandileepa@gmail.com
- Phone: 0701078584

---

**Total Time:** ~60 minutes  
**Total Cost:** $0  
**Status:** ✅ DEPLOYED!

---

**Print this checklist and tick off each box as you go!** ✨
