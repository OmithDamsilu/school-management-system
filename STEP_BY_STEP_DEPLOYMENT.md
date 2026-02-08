# 🚀 COMPLETE DEPLOYMENT GUIDE
## Step-by-Step Instructions with Screenshots

**Time Required:** 30-45 minutes  
**Cost:** $0 (100% Free)  
**Difficulty:** Beginner-Friendly

---

## 📋 BEFORE YOU START

### What You'll Need:
- [ ] A computer with internet connection
- [ ] Email address for account creation
- [ ] The `school-management-system.zip` file (downloaded)
- [ ] 30-45 minutes of uninterrupted time

### Accounts to Create (All Free):
1. GitHub account
2. MongoDB Atlas account
3. Cloudinary account
4. Render account
5. Cloudflare account

**💡 TIP:** Use the same email for all accounts to keep things organized!

---

# PART 1: PREPARE YOUR PROJECT FILES

## Step 1.1: Extract the ZIP File

1. **Download** the `school-management-system.zip` file
2. **Right-click** on the file
3. Choose **"Extract All..."** (Windows) or **"Open"** (Mac)
4. Extract to a folder like `C:\Projects\school-management-system` or `~/Projects/school-management-system`
5. **Open** the extracted folder - you should see:
   ```
   school-management-system/
   ├── backend/
   ├── frontend/
   ├── README.md
   ├── DEPLOYMENT_GUIDE.md
   └── other files...
   ```

✅ **Checkpoint:** You can see both `backend` and `frontend` folders

---

## Step 1.2: Install Git (If Not Already Installed)

### Windows:
1. Go to https://git-scm.com/download/win
2. Download the installer
3. Run the installer (click "Next" through all options)
4. Restart your computer

### Mac:
1. Open Terminal
2. Type: `git --version`
3. If not installed, it will prompt you to install Xcode Command Line Tools
4. Click "Install"

### Linux:
```bash
sudo apt-get install git
```

✅ **Checkpoint:** Open Terminal/Command Prompt and type `git --version` - you should see a version number

---

# PART 2: SETUP MONGODB ATLAS (DATABASE)

## Step 2.1: Create MongoDB Atlas Account

1. **Go to:** https://www.mongodb.com/cloud/atlas/register
2. **Fill in:**
   - First Name: Your name
   - Last Name: Your name
   - Email: Your email
   - Password: Create a strong password (SAVE THIS!)
3. **Click:** "Create your Atlas account"
4. **Verify** your email (check inbox/spam)
5. **Click** the verification link in email

✅ **Checkpoint:** You're logged into MongoDB Atlas

---

## Step 2.2: Create a Free Cluster

1. **Select:** "Shared" (it says FREE)
2. **Cloud Provider:** Choose AWS
3. **Region:** Choose **Singapore** (ap-southeast-1) - closest to Sri Lanka
   - If Singapore is not available, choose **Mumbai** (ap-south-1)
4. **Cluster Name:** Leave as default or type `school-cluster`
5. **Click:** "Create Cluster" button (bottom right)

⏳ **Wait 3-5 minutes** - cluster is being created

✅ **Checkpoint:** You see "school-cluster" with a green status

---

## Step 2.3: Create Database User

1. **Click:** "Database Access" (left sidebar, under Security)
2. **Click:** "Add New Database User" button (green button)
3. **Fill in:**
   - Authentication Method: Password
   - Username: `schooladmin` (WRITE THIS DOWN!)
   - Password: Click "Autogenerate Secure Password" button
   - **IMPORTANT:** Click the "Copy" button to copy password
   - **PASTE PASSWORD IN NOTEPAD - YOU'LL NEED IT LATER!**
4. **Database User Privileges:** Select "Read and write to any database"
5. **Click:** "Add User" button

✅ **Checkpoint:** You see `schooladmin` in the user list

---

## Step 2.4: Allow Network Access

1. **Click:** "Network Access" (left sidebar, under Security)
2. **Click:** "Add IP Address" button
3. **Click:** "Allow Access from Anywhere" button
   - This will show: `0.0.0.0/0`
   - This is REQUIRED for Render to connect!
4. **Click:** "Confirm"

⏳ **Wait 1-2 minutes** for the status to become "Active"

✅ **Checkpoint:** You see `0.0.0.0/0` with green "Active" status

---

## Step 2.5: Get Connection String

1. **Click:** "Database" (left sidebar)
2. **Click:** "Connect" button (on your cluster)
3. **Click:** "Drivers" option
4. **Copy** the connection string (looks like this):
   ```
   mongodb+srv://schooladmin:<password>@school-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **IMPORTANT:** Replace `<password>` with the password you saved in Step 2.3
   - Remove the `<` and `>` brackets!
   - Example: If password is `Abc123`, the string becomes:
   ```
   mongodb+srv://schooladmin:Abc123@school-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **SAVE THIS COMPLETE STRING IN NOTEPAD!**

✅ **Checkpoint:** Your connection string has no `<password>` placeholder

---

# PART 3: SETUP CLOUDINARY (IMAGE STORAGE)

## Step 3.1: Create Cloudinary Account

1. **Go to:** https://cloudinary.com/users/register_free
2. **Fill in:**
   - Email: Your email
   - Password: Create a password (SAVE THIS!)
   - First Name: Your name
   - Last Name: Your name
   - Company/Team: "Anuradhapura Central College"
3. **Click:** "Create Account"
4. **Verify** email (check inbox/spam)

✅ **Checkpoint:** You're logged into Cloudinary Dashboard

---

## Step 3.2: Get Cloudinary Credentials

1. You should be on the **Dashboard** page
2. Look for the "Account Details" section (usually at top)
3. **Copy and SAVE these 3 values in Notepad:**
   - **Cloud Name:** (e.g., `dxxxxxxxxxxxx`)
   - **API Key:** (e.g., `123456789012345`)
   - **API Secret:** Click "Click to reveal" then copy (e.g., `abcdefghijklmnopqrstuvwxyz`)

✅ **Checkpoint:** You have all 3 Cloudinary credentials saved

---

## Step 3.3: Generate JWT Secret

This is a random security key for your application.

### Windows (Command Prompt):
1. Press `Win + R`
2. Type `cmd` and press Enter
3. Copy and paste this command:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Press Enter
5. **COPY** the long string that appears (looks like: `f8a7b2c3d4e5...`)
6. **SAVE IT IN NOTEPAD!**

### Mac/Linux (Terminal):
1. Open Terminal
2. Paste this command:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Press Enter
4. **COPY** the result
5. **SAVE IT IN NOTEPAD!**

✅ **Checkpoint:** You have a long random string saved (64 characters)

---

## 📝 CREDENTIALS CHECKLIST

At this point, you should have in Notepad:

```
MongoDB Connection String:
mongodb+srv://schooladmin:YOUR_PASSWORD@school-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority

Cloudinary Cloud Name:
dxxxxxxxxxxxx

Cloudinary API Key:
123456789012345

Cloudinary API Secret:
abcdefghijklmnopqrstuvwxyz123

JWT Secret:
f8a7b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
```

✅ **Checkpoint:** All 5 values are saved

---

# PART 4: PUSH CODE TO GITHUB

## Step 4.1: Create GitHub Account

1. **Go to:** https://github.com/signup
2. **Enter your email**
3. **Create a password** (SAVE THIS!)
4. **Choose a username** (e.g., `acc-vertex-dev`)
5. **Complete verification**
6. **Click:** "Create account"
7. **Verify email**

✅ **Checkpoint:** You're logged into GitHub

---

## Step 4.2: Create New Repository

1. **Click:** the "+" icon (top right corner)
2. **Select:** "New repository"
3. **Fill in:**
   - Repository name: `school-management-system`
   - Description: "Smart School Resource & Waste Management System"
   - **Select:** "Public"
   - **IMPORTANT:** Do NOT check "Add README"
   - Do NOT add .gitignore or license
4. **Click:** "Create repository"

✅ **Checkpoint:** You see an empty repository page with setup instructions

---

## Step 4.3: Push Your Code to GitHub

### Open Terminal/Command Prompt in Project Folder:

**Windows:**
1. Open File Explorer
2. Navigate to `school-management-system` folder
3. Click in the address bar
4. Type `cmd` and press Enter

**Mac:**
1. Open Terminal
2. Type: `cd ` (with a space)
3. Drag the `school-management-system` folder into Terminal
4. Press Enter

**Linux:**
1. Right-click in the folder
2. Select "Open in Terminal"

### Run These Commands (One at a Time):

```bash
# 1. Initialize Git repository
git init
```
Press Enter, wait for response

```bash
# 2. Add all files
git add .
```
Press Enter, wait for response

```bash
# 3. Create first commit
git commit -m "Initial commit - School Management System"
```
Press Enter, wait for response

```bash
# 4. Set main branch
git branch -M main
```
Press Enter

```bash
# 5. Connect to GitHub (REPLACE with YOUR repository URL!)
git remote add origin https://github.com/YOUR-USERNAME/school-management-system.git
```
**IMPORTANT:** Replace `YOUR-USERNAME` with your actual GitHub username!

Press Enter

```bash
# 6. Push to GitHub
git push -u origin main
```

**You may be asked to login:**
- Enter your GitHub username
- Enter your GitHub password OR create a Personal Access Token:
  - Go to: https://github.com/settings/tokens
  - Click "Generate new token (classic)"
  - Give it a name: "School Management"
  - Check "repo" checkbox
  - Click "Generate token"
  - Copy the token and use it as password

Press Enter and wait...

✅ **Checkpoint:** Refresh your GitHub repository page - you should see all your files!

---

# PART 5: DEPLOY BACKEND TO RENDER

## Step 5.1: Create Render Account

1. **Go to:** https://dashboard.render.com/register
2. **Option 1 - Sign up with GitHub (EASIER):**
   - Click "GitHub" button
   - Click "Authorize Render"
   - Done!

   **Option 2 - Sign up with Email:**
   - Enter email and password
   - Verify email

✅ **Checkpoint:** You're on Render Dashboard

---

## Step 5.2: Create New Web Service

1. **Click:** "New +" button (top right)
2. **Select:** "Web Service"
3. **Connect GitHub:**
   - If not connected, click "Connect GitHub"
   - Click "Authorize Render"
4. **Find your repository:**
   - Look for `school-management-system`
   - Click "Connect"

✅ **Checkpoint:** You see the configuration page

---

## Step 5.3: Configure Web Service

**Fill in these settings EXACTLY:**

```
Name: school-management-api
```
(You can use any name, but this is recommended)

```
Region: Singapore
```
(Choose closest to you - Singapore or Mumbai)

```
Branch: main
```
(Should be auto-selected)

```
Root Directory: backend
```
**IMPORTANT:** Type exactly `backend` (lowercase, no spaces)

```
Runtime: Node
```

```
Build Command: npm install
```

```
Start Command: npm start
```

```
Instance Type: Free
```
**IMPORTANT:** Make sure "Free" is selected!

✅ **Checkpoint:** All fields are filled correctly

---

## Step 5.4: Add Environment Variables

**Scroll down** to "Environment Variables" section

**Click:** "Add Environment Variable" button

**Add these variables ONE BY ONE:**

### Variable 1:
```
Key: MONGODB_URI
Value: [Paste your MongoDB connection string from Step 2.5]
```

### Variable 2:
```
Key: JWT_SECRET
Value: [Paste your JWT secret from Step 3.3]
```

### Variable 3:
```
Key: CLOUDINARY_CLOUD_NAME
Value: [Paste your Cloudinary Cloud Name from Step 3.2]
```

### Variable 4:
```
Key: CLOUDINARY_API_KEY
Value: [Paste your Cloudinary API Key from Step 3.2]
```

### Variable 5:
```
Key: CLOUDINARY_API_SECRET
Value: [Paste your Cloudinary API Secret from Step 3.2]
```

### Variable 6:
```
Key: PORT
Value: 5000
```

✅ **Checkpoint:** You have 6 environment variables added

---

## Step 5.5: Create Web Service

1. **Scroll down** to the bottom
2. **Click:** "Create Web Service" button (blue button)
3. **WAIT** - this will take 5-10 minutes

You'll see:
- "Building..." (yellow)
- Lots of text scrolling (build logs)
- Wait for "Build successful ✓"
- Then "Deploying..."
- Finally "Live ✓" (green)

⏳ **Be patient!** First deployment takes 5-10 minutes.

✅ **Checkpoint:** You see "Live" with a green checkmark

---

## Step 5.6: Get Your Backend URL

1. **Look at the top** of the page
2. You'll see a URL like:
   ```
   https://school-management-api-xxxx.onrender.com
   ```
3. **COPY THIS ENTIRE URL**
4. **SAVE IT IN NOTEPAD!**

---

## Step 5.7: Test Your Backend

1. **Open a new browser tab**
2. **Paste** your backend URL and add `/health` at the end:
   ```
   https://school-management-api-xxxx.onrender.com/health
   ```
3. **Press Enter**
4. **You should see:**
   ```json
   {"status":"OK","message":"Server is running"}
   ```

✅ **Checkpoint:** Backend is working!

---

# PART 6: UPDATE FRONTEND CONFIGURATION

## Step 6.1: Edit config.js File

1. **Go to** your project folder on your computer
2. **Navigate to:** `school-management-system/frontend/js/`
3. **Open** `config.js` with a text editor:
   - **Windows:** Right-click → Open with → Notepad
   - **Mac:** Right-click → Open With → TextEdit
4. **Find this line** (around line 3):
   ```javascript
   BASE_URL: 'http://localhost:5000',
   ```
5. **Replace it with** your Render backend URL:
   ```javascript
   BASE_URL: 'https://school-management-api-xxxx.onrender.com',
   ```
   **IMPORTANT:** 
   - Use YOUR actual URL from Step 5.6
   - Keep the quotes `'...'`
   - Keep the comma `,` at the end
   - NO slash `/` at the end of the URL

6. **Save** the file (Ctrl+S or Cmd+S)

✅ **Checkpoint:** config.js has your Render URL

---

## Step 6.2: Push Updated Code to GitHub

**Open Terminal/Command Prompt** in your project folder again

```bash
# 1. Add the changed file
git add frontend/js/config.js
```
Press Enter

```bash
# 2. Commit the change
git commit -m "Update API URL for production"
```
Press Enter

```bash
# 3. Push to GitHub
git push
```
Press Enter (may ask for password/token again)

✅ **Checkpoint:** Go to GitHub → refresh page → see the update

---

# PART 7: DEPLOY FRONTEND TO CLOUDFLARE PAGES

## Step 7.1: Create Cloudflare Account

1. **Go to:** https://dash.cloudflare.com/sign-up
2. **Enter:**
   - Email address
   - Password (SAVE THIS!)
3. **Click:** "Create Account"
4. **Verify email** (check inbox/spam)
5. **Click** verification link

✅ **Checkpoint:** You're on Cloudflare Dashboard

---

## Step 7.2: Navigate to Pages

1. **Click:** "Workers & Pages" (left sidebar)
2. **Click:** "Create application" button (blue button)
3. **Click:** "Pages" tab
4. **Click:** "Connect to Git" button

✅ **Checkpoint:** You see GitHub connection page

---

## Step 7.3: Connect GitHub

1. **Click:** "Connect GitHub" button
2. **Sign in** to GitHub if asked
3. **Click:** "Authorize Cloudflare-Pages"
4. **Choose:** "Only select repositories"
5. **Click:** "Select repositories" dropdown
6. **Find and select:** `school-management-system`
7. **Click:** "Install & Authorize"

✅ **Checkpoint:** You see your repository listed

---

## Step 7.4: Configure Project

**Click** on `school-management-system` repository

**Fill in these settings:**

```
Project name: school-management
```
(Can be anything, but this is clean and simple)

```
Production branch: main
```

```
Framework preset: None
```
**IMPORTANT:** Select "None" from dropdown

```
Build command: 
```
**IMPORTANT:** Leave EMPTY (delete any text if present)

```
Build output directory: frontend
```
**IMPORTANT:** Type exactly `frontend` (lowercase)

**Click:** "Advanced" (optional)

**Under "Root directory":**
```
Root directory: frontend
```

✅ **Checkpoint:** All settings match above

---

## Step 7.5: Deploy Site

1. **Click:** "Save and Deploy" button (blue button at bottom)
2. **WAIT** - this takes 2-3 minutes

You'll see:
- "Initializing build"
- "Deploying"
- "Success!"

✅ **Checkpoint:** You see "Success! Your site is live!"

---

## Step 7.6: Get Your Frontend URL

1. **Look for** a URL like:
   ```
   https://school-management.pages.dev
   ```
   (Your actual URL may have additional characters)

2. **COPY THIS URL**
3. **SAVE IT IN NOTEPAD!**
4. **Click** on the URL to open your website

✅ **Checkpoint:** You see your school management website!

---

# PART 8: FINAL BACKEND CONFIGURATION

## Step 8.1: Add Frontend URL to Backend

1. **Go back** to Render Dashboard: https://dashboard.render.com/
2. **Click** on your `school-management-api` service
3. **Click:** "Environment" tab (left sidebar)
4. **Click:** "Add Environment Variable" button
5. **Fill in:**
   ```
   Key: FRONTEND_URL
   Value: [Your Cloudflare Pages URL from Step 7.6]
   ```
   Example: `https://school-management.pages.dev`

6. **Click:** "Save Changes"

The service will automatically redeploy (takes 2-3 minutes)

✅ **Checkpoint:** Service is redeploying

---

# PART 9: TEST YOUR APPLICATION! 🎉

## Step 9.1: Test Backend Health

1. **Open browser**
2. **Go to:** `https://YOUR-BACKEND-URL.onrender.com/health`
3. **Should see:**
   ```json
   {"status":"OK","message":"Server is running"}
   ```

✅ **Backend is working!**

---

## Step 9.2: Test Frontend

1. **Open browser**
2. **Go to:** Your Cloudflare Pages URL
3. **Should see:** Landing page with "Echo Track Schoolcore"

✅ **Frontend is working!**

---

## Step 9.3: Create Test Account

1. **Click:** "Sign Up" button
2. **Fill in form:**
   ```
   Username: testteacher
   Email: teacher@test.com
   Password: teacher123
   Confirm Password: teacher123
   Full Name: Test Teacher
   Phone: 0771234567
   Role: Class Teacher
   Section: Science Department
   Grade: 10A
   ```
3. **Accept** Terms & Conditions
4. **Click:** "Sign Up"

**If successful:**
- You'll see a success message
- Redirected to login page

✅ **Account creation works!**

---

## Step 9.4: Login

1. **Enter:**
   - Username: `testteacher`
   - Password: `teacher123`
2. **Click:** "Login"

**If successful:**
- You're redirected to profile page
- You see your name
- You see "Class Teacher" badge
- You see 3 entry form cards

✅ **Login works!**

---

## Step 9.5: Test Entry Forms

1. **Click** on "Daily Waste Entry"
2. **Fill in** some test data
3. **Click** "Submit"
4. **Should see** success message

✅ **Forms are working!**

---

## Step 9.6: Test Different Roles

**Create different accounts to test:**

### Principal Account:
```
Username: principal
Email: principal@school.com
Password: principal123
Role: Principal
```
**Expected:** Should see Dashboard link, NO entry forms

### Worker Account:
```
Username: worker  
Email: worker@school.com
Password: worker123
Role: Worker
```
**Expected:** Should see ONLY Resources Entry form

✅ **Role-based access works!**

---

# 🎉 CONGRATULATIONS!

## Your Application is Live!

### 📱 Share These URLs:

**Website:**
```
https://YOUR-SITE.pages.dev
```

**API:**
```
https://YOUR-API.onrender.com
```

---

## 📊 What You Have Now:

✅ Fully functional school management system  
✅ User authentication and role-based access  
✅ Three data entry forms (Waste, Resources, Spaces)  
✅ Management dashboard  
✅ Image upload capability  
✅ Secure database (MongoDB Atlas)  
✅ Professional hosting (Render + Cloudflare)  
✅ **100% FREE** hosting

---

## 🔐 Important Security Notes:

1. **Change Default Passwords:**
   - Don't use `teacher123` in production
   - Use strong passwords

2. **Keep Credentials Safe:**
   - Never share environment variables
   - Never commit `.env` file to GitHub

3. **Regular Backups:**
   - MongoDB Atlas has automatic backups
   - Download important data regularly

---

## 💡 Tips for Production:

### 1. Custom Domain (Optional - Free!)

You can add a custom domain to Cloudflare Pages:

1. Buy a domain (e.g., `anuradhapuracollege.lk`)
2. Go to Cloudflare Pages → Your Project → Custom domains
3. Follow the instructions
4. Your site will be at `school.anuradhapuracollege.lk`

### 2. Monitor Usage

**Render Free Tier:**
- 750 hours/month (enough for one app)
- Sleeps after 15 minutes of inactivity
- First request after sleep = 30-60 seconds

**Cloudflare Pages:**
- Unlimited bandwidth
- Unlimited requests
- 500 builds/month

**MongoDB Atlas Free Tier:**
- 512 MB storage (enough for ~10,000 entries)
- Can upgrade anytime

**Cloudinary Free Tier:**
- 25 credits/month
- ~1,000 images storage
- Can upgrade anytime

### 3. Regular Updates

**To update your code:**

```bash
# Make changes to your files
git add .
git commit -m "Description of changes"
git push
```

- Backend will auto-deploy on Render (2-3 minutes)
- Frontend will auto-deploy on Cloudflare (1-2 minutes)

---

## 🐛 Common Issues and Solutions:

### Issue 1: "Cannot connect to database"
**Solution:**
- Check MongoDB connection string has correct password
- Verify Network Access is set to `0.0.0.0/0`
- Check Render environment variables

### Issue 2: "Backend is slow"
**Solution:**
- This is normal for Render free tier
- Backend sleeps after 15 min
- First request takes 30-60 seconds
- Subsequent requests are fast

### Issue 3: "Login not working"
**Solution:**
- Clear browser cache and cookies
- Check browser console for errors (F12)
- Verify backend URL in `config.js`
- Test `/health` endpoint

### Issue 4: "Images won't upload"
**Solution:**
- Check Cloudinary credentials in Render
- Verify file size is under 5MB
- Check file format (jpg, png, gif, webp only)

### Issue 5: "CORS error in browser"
**Solution:**
- Make sure FRONTEND_URL is set in Render
- Verify the URL matches exactly (no trailing slash)
- Wait for backend to redeploy

---

## 📞 Need Help?

### Contact Information:
- **Email:** urandileepa@gmail.com
- **Team:** ACC Vertex Developers
- **School:** Anuradhapura Central College
- **Team Leader:** Lithuli Limansa Samarasinghe
- **Phone:** 0701078584

### Resources:
- **MongoDB Docs:** https://docs.atlas.mongodb.com/
- **Render Docs:** https://render.com/docs
- **Cloudflare Docs:** https://developers.cloudflare.com/pages/

---

## 📝 Quick Reference Card

**Save this for future reference:**

```
MongoDB Atlas:
- Dashboard: https://cloud.mongodb.com/
- Connection String: mongodb+srv://schooladmin:PASSWORD@...

Cloudinary:
- Dashboard: https://cloudinary.com/console

Render:
- Dashboard: https://dashboard.render.com/
- Backend URL: https://school-management-api-xxxx.onrender.com

Cloudflare Pages:
- Dashboard: https://dash.cloudflare.com/
- Frontend URL: https://school-management.pages.dev

GitHub:
- Repository: https://github.com/YOUR-USERNAME/school-management-system
```

---

## ✨ You Did It!

You've successfully deployed a full-stack web application with:
- ✅ Backend API (Node.js + Express)
- ✅ Frontend Website (HTML/CSS/JavaScript)  
- ✅ Database (MongoDB Atlas)
- ✅ Image Storage (Cloudinary)
- ✅ Authentication & Authorization
- ✅ Role-based Access Control

**Total Cost: $0/month**

---

**Made with ❤️ by ACC Vertex Developers**  
*Transforming Schools Through Smart Digital Management*

---

**End of Deployment Guide**

🎉 **Congratulations and Good Luck!** 🎉
