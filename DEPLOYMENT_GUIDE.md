# Smart School Resource & Waste Management System

## 🎯 Complete Deployment Guide

A comprehensive web-based platform for managing school waste, resources, and unused spaces.

## 📁 Project Structure

```
school-management-system/
├── backend/                 # Node.js + Express API
│   ├── server.js           # Main server file
│   ├── package.json        # Dependencies
│   ├── .env.example        # Environment variables template
│   └── README.md           # Backend documentation
│
└── frontend/               # Static HTML/CSS/JS
    ├── index.html          # Landing page
    ├── login.html          # Login page
    ├── signup.html         # Registration page
    ├── profile.html        # User profile (role-based access)
    ├── dashborard.html     # Management dashboard
    ├── daily-waste-entry.html       # Waste entry form
    ├── weekly-resources-entry.html  # Resources entry form
    ├── unused-space-entry.html      # Space entry form
    ├── css/                # Stylesheets
    ├── js/                 # JavaScript files
    │   └── config.js       # API configuration
    └── images/             # Images and assets
```

## 🚀 Deployment Steps

### Part 1: Backend Deployment (Render.com)

#### Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new **FREE** cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)
6. Replace `<password>` with your database password
7. **IMPORTANT:** Go to "Network Access" → "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)
   - This is required for Render to connect

#### Step 2: Setup Cloudinary (for image uploads)

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a **FREE** account
3. Go to your Dashboard
4. Copy these three values:
   - Cloud Name
   - API Key
   - API Secret

#### Step 3: Deploy Backend to Render

1. **Push code to GitHub:**
   ```bash
   cd school-management-system
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select your repository
   - Configure:
     - **Name:** `school-management-api` (or any name you prefer)
     - **Region:** Select closest to Sri Lanka (Singapore recommended)
     - **Branch:** `main`
     - **Root Directory:** `backend`
     - **Runtime:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** `Free`

3. **Add Environment Variables** (in Render dashboard):
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-management?retryWrites=true&w=majority
   JWT_SECRET=your-random-secret-key-min-32-characters-long-change-this
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   PORT=5000
   ```

   **To generate a secure JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Click "Create Web Service"

5. **IMPORTANT:** After deployment, copy your backend URL:
   ```
   https://school-management-api.onrender.com
   ```
   (Your actual URL will be different)

### Part 2: Frontend Deployment (Cloudflare Pages)

#### Step 1: Update Frontend Configuration

1. Open `frontend/js/config.js`
2. Find this line:
   ```javascript
   BASE_URL: 'http://localhost:5000',
   ```
3. Replace it with your Render backend URL:
   ```javascript
   BASE_URL: 'https://school-management-api.onrender.com',
   ```
4. Save the file
5. Commit and push changes:
   ```bash
   git add frontend/js/config.js
   git commit -m "Update API URL for production"
   git push
   ```

#### Step 2: Deploy to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Sign up or log in
3. Go to "Workers & Pages" → "Pages"
4. Click "Create a project"
5. Click "Connect to Git"
6. Connect your GitHub account
7. Select your repository
8. Configure:
   - **Project name:** `school-management` (or any name)
   - **Production branch:** `main`
   - **Build settings:**
     - **Framework preset:** `None`
     - **Build command:** (leave empty)
     - **Build output directory:** `frontend`
   - **Root directory:** `frontend`

9. Click "Save and Deploy"

10. **Your site will be live at:**
    ```
    https://school-management.pages.dev
    ```
    (You can also add a custom domain later)

### Part 3: Final Configuration

#### Update CORS on Backend

1. Go back to Render dashboard
2. Open your backend service
3. Add environment variable:
   ```
   FRONTEND_URL=https://school-management.pages.dev
   ```
4. The backend will automatically restart

#### Test Your Application

1. Go to your Cloudflare Pages URL
2. Click "Sign Up"
3. Create an account with role selection
4. Login
5. You should see your profile
6. Test role-based access:
   - **Principal/Management Staff** → See Dashboard link
   - **Class Teacher/Section Head/Non-Academic Staff** → See all 3 Entry Forms
   - **Worker** → See Resources Entry Form only (with info message)

## 👥 User Roles & Access

### Principal
- ✅ View all submitted data on dashboard
- ❌ Cannot submit entry forms
- ✅ Full access to statistics and reports

### Management Staff
- ✅ View all submitted data on dashboard
- ❌ Cannot submit entry forms
- ✅ Full access to statistics and reports

### Non-Academic Staff
- ✅ Submit daily waste entries
- ✅ Submit weekly resource reports
- ✅ Submit unused space reports
- ❌ Cannot access dashboard

### Class Teacher
- ✅ Submit daily waste entries
- ✅ Submit weekly resource reports
- ✅ Submit unused space reports
- ❌ Cannot access dashboard

### Section Head
- ✅ Submit daily waste entries
- ✅ Submit weekly resource reports
- ✅ Submit unused space reports
- ❌ Cannot access dashboard

### Worker
- ❌ Cannot submit waste entries
- ✅ Can submit weekly resource reports (track furniture and equipment)
- ❌ Cannot submit unused space reports
- ❌ Cannot access dashboard

## 📊 Features

### Data Entry Forms
1. **Daily Waste Entry**
   - Track paper, plastic, food, and general waste
   - Rate classroom cleanliness
   - Upload photos
   - Record segregation status

2. **Weekly Resources Entry**
   - Track desks, chairs, whiteboards, projectors
   - Categorize as good, damaged, or broken
   - Add notes

3. **Unused Space Report**
   - Document location details
   - Upload multiple photos (3-10 required)
   - Describe current condition
   - Suggest potential uses
   - Estimate renovation budget

### Dashboard (Principal/Management Only)
- View all submitted entries
- Generate statistics
- Filter by date, section, grade
- Export reports

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Protected API endpoints
- CORS protection
- Secure file uploads

## 💰 Cost

- **MongoDB Atlas:** FREE (512MB storage)
- **Render Backend:** FREE (sleeps after 15 min inactivity)
- **Cloudflare Pages:** FREE (unlimited bandwidth)
- **Cloudinary:** FREE (25 credits/month)

**Total Cost:** $0/month ✨

## ⚠️ Important Notes

1. **Render Free Tier:** Backend sleeps after 15 minutes of inactivity. First request after sleep takes 30-60 seconds.

2. **MongoDB IP Whitelist:** Make sure "0.0.0.0/0" is added to allow Render to connect.

3. **Environment Variables:** Double-check all environment variables are set correctly in Render.

4. **HTTPS:** Both Render and Cloudflare provide free HTTPS automatically.

5. **Profile Pictures:** Uploaded to Cloudinary, links stored in MongoDB.

## 🐛 Troubleshooting

### Backend won't start on Render
- Check environment variables are set
- Check MongoDB connection string is correct
- Check build logs in Render dashboard

### Frontend can't connect to backend
- Make sure API_CONFIG.BASE_URL in config.js has correct Render URL
- Check CORS is enabled on backend
- Check backend is running (visit /health endpoint)

### Images won't upload
- Check Cloudinary credentials in Render environment variables
- Check file size (max 5MB per image)

### Login not working
- Check JWT_SECRET is set in Render
- Check MongoDB connection
- Clear browser cache and try again

## 📧 Support

For issues or questions, contact:
- **Email:** urandileepa@gmail.com
- **Team:** ACC Vertex Developers
- **School:** Anuradhapura Central College

## 📝 License

MIT License - Feel free to use and modify for your school!

## 🎉 Credits

**Team Name:** ACC Vertex Developers  
**School:** Anuradhapura Central College  
**Team Leader:** Lithuli Limansa Samarasinghe  

---

**Good luck with your deployment! 🚀**
