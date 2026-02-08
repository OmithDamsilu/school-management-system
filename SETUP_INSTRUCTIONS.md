# 🎯 Complete Setup & Deployment Instructions
## Smart School Resource & Waste Management System

---

## 📦 What You're Getting

This package contains a **complete full-stack web application** with:

### ✅ Backend (Node.js + Express + MongoDB)
- User authentication system (JWT-based)
- Role-based access control
- Daily waste entry API
- Weekly resources tracking API
- Unused space reporting API
- Image upload functionality (Cloudinary)
- Dashboard statistics API

### ✅ Frontend (HTML + CSS + JavaScript)
- Landing page
- Login/Signup pages
- User profile with role-based UI
- Three data entry forms:
  - Daily Waste Entry
  - Weekly Resources Entry
  - Unused Space Entry
- Management Dashboard (for Principal/Management only)
- Responsive design

### ✅ Database Models
- Users collection (with authentication)
- Daily Waste entries
- Weekly Resources entries
- Unused Space reports

---

## 🚀 Deployment Options

You have **TWO** deployment options:

### Option 1: Free Cloud Deployment (Recommended)
- **Cost:** $0/month
- **Time:** ~30 minutes
- **Difficulty:** Medium
- **Platforms:** Render + Cloudflare Pages + MongoDB Atlas

### Option 2: Local Development
- **Cost:** $0
- **Time:** ~15 minutes
- **Difficulty:** Easy
- **Requirements:** Node.js installed on your computer

---

## 📋 OPTION 1: Free Cloud Deployment

### Prerequisites

1. **Create Free Accounts:**
   - MongoDB Atlas: https://www.mongodb.com/cloud/atlas
   - Cloudinary: https://cloudinary.com/
   - Render: https://render.com/
   - Cloudflare: https://cloudflare.com/
   - GitHub: https://github.com/

2. **Download & Extract:**
   - Extract `school-management-system.zip`
   - You'll see two folders: `backend` and `frontend`

---

### STEP 1: Setup MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Click **"Create"** → **"Shared"** (Free tier)
4. Choose **Cloud Provider:** AWS
5. Choose **Region:** Singapore (closest to Sri Lanka)
6. Cluster Name: `school-cluster`
7. Click **"Create Cluster"** (takes 3-5 minutes)

**Configure Database:**

8. Click **"Database Access"** (left sidebar)
9. Click **"Add New Database User"**
   - Username: `schooladmin`
   - Password: Click "Autogenerate" and **SAVE IT**
   - Database User Privileges: "Read and write to any database"
   - Click **"Add User"**

10. Click **"Network Access"** (left sidebar)
11. Click **"Add IP Address"**
12. Click **"Allow Access from Anywhere"** (important for Render!)
13. Click **"Confirm"**

**Get Connection String:**

14. Go to **"Database"** tab
15. Click **"Connect"** button
16. Choose **"Connect your application"**
17. Copy the connection string (looks like):
    ```
    mongodb+srv://schooladmin:<password>@school-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
    ```
18. Replace `<password>` with the password you saved earlier
19. **SAVE THIS STRING** - you'll need it later

---

### STEP 2: Setup Cloudinary (Image Storage)

1. Go to https://cloudinary.com/
2. Sign up for free account
3. After login, go to **Dashboard**
4. **SAVE THESE THREE VALUES:**
   - Cloud Name: `_____________`
   - API Key: `_____________`
   - API Secret: `_____________`

---

### STEP 3: Generate JWT Secret

Open terminal/command prompt and run:

**Windows:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Mac/Linux:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

You'll get something like: `f8a7b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1`

**SAVE THIS** - you'll need it later

---

### STEP 4: Push Code to GitHub

1. Extract the `school-management-system.zip`
2. Open terminal/command prompt in the extracted folder
3. Run these commands:

```bash
# Initialize Git
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit - School Management System"

# Create new branch called 'main'
git branch -M main
```

4. Go to https://github.com/new
5. Repository name: `school-management-system`
6. Make it **Public**
7. Click **"Create repository"**
8. Copy the commands shown (should look like):

```bash
git remote add origin https://github.com/YOUR-USERNAME/school-management-system.git
git push -u origin main
```

9. Paste and run those commands in your terminal

---

### STEP 5: Deploy Backend to Render

1. Go to https://dashboard.render.com/
2. Sign up or login (use GitHub to login - easier!)
3. Click **"New +"** button (top right)
4. Select **"Web Service"**
5. Click **"Connect GitHub"** and authorize Render
6. Find your `school-management-system` repository
7. Click **"Connect"**

**Configure Service:**

8. Fill in these settings:
   ```
   Name: school-management-api
   Region: Singapore (or closest to you)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

9. Click **"Advanced"** to add environment variables

**Add Environment Variables:**

Click **"Add Environment Variable"** for each:

```
Key: MONGODB_URI
Value: [Paste your MongoDB connection string from Step 1]

Key: JWT_SECRET
Value: [Paste your JWT secret from Step 3]

Key: CLOUDINARY_CLOUD_NAME
Value: [Your Cloudinary Cloud Name from Step 2]

Key: CLOUDINARY_API_KEY
Value: [Your Cloudinary API Key from Step 2]

Key: CLOUDINARY_API_SECRET
Value: [Your Cloudinary API Secret from Step 2]

Key: PORT
Value: 5000
```

10. Click **"Create Web Service"**

11. **WAIT** for deployment (5-10 minutes)
    - You'll see logs scrolling
    - Wait for "✓ Build successful"
    - Wait for "Service is live"

12. **COPY YOUR BACKEND URL** from the top:
    ```
    https://school-management-api-xxxx.onrender.com
    ```
    **IMPORTANT:** Save this URL!

---

### STEP 6: Update Frontend Configuration

1. Go back to your `school-management-system` folder
2. Open `frontend/js/config.js` in a text editor
3. Find this line (around line 3):
   ```javascript
   BASE_URL: 'http://localhost:5000',
   ```
4. Replace it with your Render URL:
   ```javascript
   BASE_URL: 'https://school-management-api-xxxx.onrender.com',
   ```
5. **SAVE** the file

6. Commit and push the change:
```bash
git add frontend/js/config.js
git commit -m "Update API URL for production"
git push
```

---

### STEP 7: Deploy Frontend to Cloudflare Pages

1. Go to https://dash.cloudflare.com/
2. Sign up or login
3. Go to **"Workers & Pages"** from the sidebar
4. Click **"Pages"** tab
5. Click **"Create a project"**
6. Click **"Connect to Git"**
7. Click **"GitHub"** and authorize
8. Select your `school-management-system` repository

**Configure Project:**

9. Fill in settings:
   ```
   Project name: school-management
   Production branch: main
   Framework preset: None
   Build command: (leave empty)
   Build output directory: frontend
   Root directory (advanced): frontend
   ```

10. Click **"Save and Deploy"**

11. **WAIT** for deployment (2-3 minutes)

12. **COPY YOUR FRONTEND URL:**
    ```
    https://school-management.pages.dev
    ```

---

### STEP 8: Final Backend Configuration

1. Go back to https://dashboard.render.com/
2. Click on your `school-management-api` service
3. Go to **"Environment"** tab
4. Click **"Add Environment Variable"**
   ```
   Key: FRONTEND_URL
   Value: [Your Cloudflare Pages URL]
   ```
5. Service will automatically redeploy (2-3 minutes)

---

### ✅ STEP 9: Test Your Application!

1. **Test Backend:**
   - Visit: `https://YOUR-BACKEND-URL.onrender.com/health`
   - Should see: `{"status":"OK","message":"Server is running"}`

2. **Test Frontend:**
   - Visit: `https://YOUR-FRONTEND.pages.dev`
   - Should see the landing page

3. **Create Test Account:**
   - Click **"Sign Up"**
   - Fill in the form:
     ```
     Username: teacher1
     Email: teacher@test.com
     Password: teacher123
     Full Name: Test Teacher
     Role: Class Teacher
     Section: Science
     Grade: 10A
     Phone: 0771234567
     ```
   - Click "Sign Up"
   - Should redirect to login

4. **Login:**
   - Username: `teacher1`
   - Password: `teacher123`
   - Click "Login"
   - Should redirect to Profile page

5. **Check Profile:**
   - Should see your name and role
   - Should see 3 entry form cards (Waste, Resources, Space)

6. **Test Management Account:**
   - Logout
   - Sign up with role: `Principal`
   - Login
   - Should see "Management Dashboard" instead of entry forms

---

## 🎉 Success!

Your application is now live! Share these URLs:

- **Website:** `https://YOUR-FRONTEND.pages.dev`
- **API:** `https://YOUR-BACKEND.onrender.com`

---

## 📋 OPTION 2: Local Development

### Prerequisites

1. Install Node.js from https://nodejs.org/ (LTS version)
2. Install Git from https://git-scm.com/
3. Get MongoDB connection string (from Option 1, Step 1)
4. Get Cloudinary credentials (from Option 1, Step 2)

### Steps

1. **Extract Files:**
   ```bash
   unzip school-management-system.zip
   cd school-management-system
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```

3. **Edit `.env` file:**
   Open `backend/.env` in text editor and fill in:
   ```
   MONGODB_URI=your-mongodb-connection-string
   JWT_SECRET=your-generated-secret
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   PORT=5000
   ```

4. **Test Connection:**
   ```bash
   node test-connection.js
   ```
   Should see: ✅ MongoDB connection successful!

5. **Start Backend:**
   ```bash
   npm start
   ```
   Should see: 🚀 Server running on port 5000

6. **Open New Terminal for Frontend:**
   ```bash
   cd frontend
   # Open index.html in browser
   # Or use: python -m http.server 8000
   ```

7. **Access Application:**
   - Frontend: http://localhost:8000 (or just open index.html)
   - Backend: http://localhost:5000

---

## 👥 User Roles Explained

### Principal
- ✅ Full dashboard access
- ✅ View all submissions
- ❌ Cannot submit entry forms

### Management Staff
- ✅ Full dashboard access
- ✅ View all submissions
- ❌ Cannot submit entry forms

### Class Teacher
- ✅ Submit all entry forms
- ✅ View own submissions
- ❌ Cannot access dashboard

### Section Head
- ✅ Submit all entry forms
- ✅ View own submissions
- ❌ Cannot access dashboard

### Non-Academic Staff
- ✅ Submit all entry forms
- ✅ View own submissions
- ❌ Cannot access dashboard

### Worker
- ❌ Cannot submit waste entries
- ✅ Can submit weekly resource reports (track furniture and equipment)
- ❌ Cannot submit unused space reports
- ❌ Cannot access dashboard

---

## 🐛 Troubleshooting

### Backend won't start on Render

**Problem:** Build fails
- Check all environment variables are set
- Check MongoDB connection string format
- Look at Render logs for specific errors

**Problem:** "Cannot connect to MongoDB"
- Verify connection string is correct
- Check password doesn't have special characters
- Ensure Network Access is set to 0.0.0.0/0 in MongoDB Atlas

**Problem:** "Cloudinary error"
- Double-check Cloud Name, API Key, and API Secret
- Make sure no extra spaces in environment variables

### Frontend Issues

**Problem:** Can't login / API errors
- Check `frontend/js/config.js` has correct backend URL
- Open browser console (F12) to see errors
- Verify backend is running (visit /health endpoint)

**Problem:** After deploying, shows local development message
- Make sure you updated config.js and pushed to GitHub
- Cloudflare Pages might need to be redeployed manually

**Problem:** Images won't upload
- Check Cloudinary credentials in backend
- Check file size (max 5MB)
- Check image format (jpg, png, gif, webp only)

### General Issues

**Problem:** Render backend is slow
- Free tier sleeps after 15 minutes
- First request after sleep takes 30-60 seconds
- This is normal for free tier

**Problem:** "Session expired" errors
- Clear browser cache and cookies
- Try logging in again

---

## 📞 Support

### Getting Help

**Email:** urandileepa@gmail.com  
**Team:** ACC Vertex Developers  
**School:** Anuradhapura Central College  
**Team Leader:** Lithuli Limansa Samarasinghe  
**Phone:** 0701078584

### Resources

- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Render Docs: https://render.com/docs
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/

---

## ✨ Tips for Production Use

1. **Regular Backups:**
   - MongoDB Atlas has automatic backups
   - Export important data regularly

2. **Monitor Usage:**
   - Render: 750 hours/month (enough for one app)
   - Cloudinary: 25 credits/month (enough for ~1000 images)
   - MongoDB: 512MB storage (enough for thousands of entries)

3. **Security:**
   - Change default passwords
   - Use strong JWT secret
   - Don't share environment variables

4. **Custom Domain (Optional):**
   - Cloudflare Pages supports custom domains for free
   - Example: `school.anuradhapuracollege.lk`

---

## 🎓 Project Information

**Project Name:** Smart School Resource & Waste Management System  
**Team:** ACC Vertex Developers  
**School:** Anuradhapura Central College  
**Purpose:** Digitally manage school waste, resources, and unused spaces  

**Technology Stack:**
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Hosting: Render (Backend) + Cloudflare Pages (Frontend)
- Storage: Cloudinary

**Total Deployment Cost:** $0/month using free tiers

---

## 📄 License

MIT License - Free to use and modify for educational purposes.

---

**Good luck with your deployment! 🚀**

If you have any questions or face any issues, don't hesitate to reach out.
