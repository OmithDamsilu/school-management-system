# Smart School Management System - Backend

Backend API for the Smart School Resource and Waste Management System.

## Features

- User Authentication (JWT-based)
- Role-based Access Control
- Daily Waste Entry Management
- Weekly Resources Tracking
- Unused Space Reporting
- Image Upload (via Cloudinary)
- Dashboard Statistics

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer + Cloudinary
- **Security:** CORS enabled

## User Roles

1. **Principal** - Full access to all data and dashboard
2. **Management Staff** - Full access to all data and dashboard
3. **Non-Academic Staff** - Can submit all entry forms
4. **Class Teacher** - Can submit all entry forms
5. **Section Head** - Can submit all entry forms
6. **Worker** - Can submit weekly resource reports only (not waste or space)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then edit `.env` and fill in your credentials:

- **MongoDB URI:** Get from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **JWT Secret:** Generate a random secure string
- **Cloudinary:** Get credentials from [Cloudinary](https://cloudinary.com/)

### 3. Run Locally

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Deployment to Render

### Step 1: Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist all IP addresses (0.0.0.0/0) for Render
5. Get your connection string

### Step 2: Setup Cloudinary

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard

### Step 3: Deploy to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** school-management-api
   - **Region:** Choose closest to your users
   - **Branch:** main
   - **Root Directory:** backend
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

6. Add Environment Variables:
   - `MONGODB_URI` - Your MongoDB connection string
   - `JWT_SECRET` - Random secure string
   - `CLOUDINARY_CLOUD_NAME` - From Cloudinary
   - `CLOUDINARY_API_KEY` - From Cloudinary
   - `CLOUDINARY_API_SECRET` - From Cloudinary
   - `PORT` - 5000
   - `FRONTEND_URL` - Your frontend URL (after deploying)

7. Click "Create Web Service"

### Step 4: Note Your Backend URL

After deployment, Render will provide a URL like:
```
https://school-management-api.onrender.com
```

You'll need this for your frontend configuration.

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - User login

### User Profile
- `GET /api/user/profile` - Get user profile (requires auth)
- `PUT /api/user/profile` - Update profile (requires auth)
- `POST /api/user/profile-picture` - Upload profile picture (requires auth)
- `POST /api/user/change-password` - Change password (requires auth)

### Waste Management
- `POST /api/waste/daily` - Submit daily waste entry (requires auth, not for Workers)
- `GET /api/waste/daily` - Get waste entries (requires auth)

### Resources Management
- `POST /api/resources/weekly` - Submit weekly resources (requires auth, not for Workers)
- `GET /api/resources/weekly` - Get resource entries (requires auth)

### Space Management
- `POST /api/spaces/unused` - Submit unused space (requires auth, not for Workers)
- `GET /api/spaces/unused` - Get space entries (requires auth)

### Dashboard
- `GET /api/dashboard/stats` - Get statistics (Principal/Management only)

## Database Schema

### Users Collection
- username, email, password (hashed)
- fullName, role, section, grade, phone
- profilePicture (Cloudinary URL)

### DailyWaste Collection
- Submitted by user details
- Waste categories (paper, plastic, food, general)
- Cleanliness rating, photos

### WeeklyResources Collection
- Submitted by user details
- Resource counts (desks, chairs, whiteboards, projectors)
- Condition categories (good, damaged, broken)

### UnusedSpace Collection
- Location details
- Space type, size, condition
- Facilities, potential uses
- Photos, priority level

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- CORS protection
- Request validation

## Support

For issues or questions, contact: urandileepa@gmail.com
