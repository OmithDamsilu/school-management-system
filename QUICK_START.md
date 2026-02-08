# 🚀 Quick Deployment Checklist

Follow these steps in order for successful deployment.

## ✅ Pre-Deployment Checklist

### 1. Create Accounts (All Free)
- [ ] MongoDB Atlas account - https://www.mongodb.com/cloud/atlas
- [ ] Cloudinary account - https://cloudinary.com/
- [ ] Render account - https://render.com/
- [ ] Cloudflare account - https://cloudflare.com/
- [ ] GitHub account - https://github.com/

### 2. Gather Credentials

**MongoDB Atlas:**
- [ ] Connection String: `mongodb+srv://...`
- [ ] Network Access: Set to `0.0.0.0/0`

**Cloudinary:**
- [ ] Cloud Name: `_____________`
- [ ] API Key: `_____________`
- [ ] API Secret: `_____________`

**JWT Secret:**
- [ ] Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Save it: `_____________`

## 📋 Deployment Steps

### Step 1: Prepare Code
```bash
# 1. Extract the project files
unzip school-management-system.zip

# 2. Navigate to project
cd school-management-system

# 3. Initialize Git
git init
git add .
git commit -m "Initial commit"

# 4. Create GitHub repository and push
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Backend (Render)

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Configure:
   ```
   Name: school-management-api
   Region: Singapore (or closest)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. Add Environment Variables:
   ```
   MONGODB_URI = [Your MongoDB connection string]
   JWT_SECRET = [Your generated JWT secret]
   CLOUDINARY_CLOUD_NAME = [Your Cloudinary cloud name]
   CLOUDINARY_API_KEY = [Your Cloudinary API key]
   CLOUDINARY_API_SECRET = [Your Cloudinary API secret]
   PORT = 5000
   ```

6. Click **"Create Web Service"**

7. **WAIT** for deployment to complete (5-10 minutes)

8. **COPY** your backend URL:
   ```
   https://school-management-api.onrender.com
   ```

### Step 3: Update Frontend Configuration

1. Open `frontend/js/config.js`
2. Find line with `BASE_URL: 'http://localhost:5000'`
3. Replace with your Render URL:
   ```javascript
   BASE_URL: 'https://YOUR-APP-NAME.onrender.com'
   ```
4. Save and commit:
   ```bash
   git add frontend/js/config.js
   git commit -m "Update API URL"
   git push
   ```

### Step 4: Deploy Frontend (Cloudflare Pages)

1. Go to https://dash.cloudflare.com/
2. Navigate to **"Workers & Pages"** → **"Pages"**
3. Click **"Create a project"**
4. Click **"Connect to Git"**
5. Select your repository
6. Configure:
   ```
   Project name: school-management
   Production branch: main
   Framework preset: None
   Build command: (leave empty)
   Build output directory: frontend
   Root directory: frontend
   ```

7. Click **"Save and Deploy"**

8. **COPY** your frontend URL:
   ```
   https://school-management.pages.dev
   ```

### Step 5: Update Backend CORS

1. Go back to Render dashboard
2. Open your backend service
3. Add new environment variable:
   ```
   FRONTEND_URL = https://school-management.pages.dev
   ```
4. Service will auto-restart

## ✅ Verification

### Test Backend
Visit: `https://YOUR-BACKEND.onrender.com/health`

Should see:
```json
{"status":"OK","message":"Server is running"}
```

### Test Frontend
1. Visit: `https://YOUR-FRONTEND.pages.dev`
2. Click **"Sign Up"**
3. Create account:
   ```
   Username: testuser
   Email: test@example.com
   Password: test123
   Full Name: Test User
   Role: Class Teacher
   Section: Science
   Grade: 10A
   ```
4. Login with created account
5. Should redirect to profile page
6. Should see entry forms (3 cards)

## 🐛 Troubleshooting

### Backend Issues

**Problem:** Backend won't start
```bash
# Check Render logs
# Verify all environment variables are set
# Check MongoDB IP whitelist includes 0.0.0.0/0
```

**Problem:** "MongooseServerSelectionError"
```bash
# Check MongoDB connection string is correct
# Verify network access in MongoDB Atlas
# Make sure you replaced <password> in connection string
```

**Problem:** "Cloudinary configuration error"
```bash
# Verify all 3 Cloudinary variables are set correctly
# Check for extra spaces in environment variables
```

### Frontend Issues

**Problem:** Can't connect to backend
```bash
# Verify frontend/js/config.js has correct BASE_URL
# Check CORS is configured in backend
# Try clearing browser cache
```

**Problem:** Login fails
```bash
# Check backend is running (/health endpoint)
# Verify JWT_SECRET is set in backend
# Try creating a new account
```

**Problem:** Images won't upload
```bash
# Check Cloudinary credentials
# Verify file size is under 5MB
# Check browser console for errors
```

## 📊 Post-Deployment

### Create Test Accounts

**Principal Account:**
```
Username: principal
Email: principal@school.com
Password: principal123
Role: Principal
```

**Teacher Account:**
```
Username: teacher
Email: teacher@school.com
Password: teacher123
Role: Class Teacher
Grade: 10A
```

**Management Account:**
```
Username: manager
Email: manager@school.com
Password: manager123
Role: Management Staff
```

**Worker Account:**
```
Username: worker
Email: worker@school.com
Password: worker123
Role: Worker
```

### Test Each Role

- [ ] Principal can see Dashboard
- [ ] Principal cannot see Entry Forms
- [ ] Teacher can see Entry Forms
- [ ] Teacher cannot see Dashboard
- [ ] Worker can see only Resources Entry Form
- [ ] Worker cannot see Dashboard
- [ ] Worker cannot see Waste or Space forms
- [ ] Management can see Dashboard

## 🎉 Success!

Your application is now live at:
- **Frontend:** https://YOUR-APP.pages.dev
- **Backend:** https://YOUR-APP.onrender.com

## 📞 Need Help?

**Email:** urandileepa@gmail.com  
**Team:** ACC Vertex Developers  
**School:** Anuradhapura Central College

---

**Deployment Time:** ~30 minutes  
**Cost:** $0/month  
**Difficulty:** ⭐⭐⭐ (Intermediate)
