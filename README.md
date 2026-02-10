# 🏫 EchoTrack SchoolCore


A comprehensive web-based platform designed to help schools efficiently manage waste disposal practices, reusable resources, and unused spaces. Built for **Anuradhapura Central College** by **ACC Vertex Developers**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/cloud/atlas)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [User Roles](#-user-roles)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

### Problem Statement

This system addresses critical challenges faced by educational institutions:

- ❌ **Improper waste separation** in classrooms leading to environmental concerns
- 📄 **Scattered paper waste** across school premises
- 🪑 **Untracked broken furniture** causing inefficiency in resource allocation
- 🔬 **No digital inventory** for laboratory equipment and resources
- 🏢 **Unused rooms** filled with old materials and no proper documentation
- 📊 **Lack of centralized monitoring** making data-driven decisions difficult

### Solution

A unified digital platform that integrates:

- **Daily Waste Management** - Track and monitor classroom waste with photo documentation
- **Weekly Resource Tracking** - Inventory management for furniture and equipment
- **Space Utilization Reports** - Photo-based reporting of unused or underutilized areas
- **Role-Based Access Control** - Different permissions for different user types
- **Analytical Dashboard** - Data-driven insights for school management

---

## ✨ Features

### 👨‍🏫 For Teachers & Staff

- ✅ **Daily Waste Entry** - Submit waste data with photo evidence and location details
- ✅ **Weekly Resource Tracking** - Record furniture, equipment, and resource status
- ✅ **Unused Space Reporting** - Document underutilized areas with detailed information
- ✅ **Submission History** - View personal submission history and track progress
- ✅ **Profile Management** - Update personal information and profile picture

### 👔 For Management (Principal & Admin Staff)

- ✅ **Comprehensive Dashboard** - View all submissions in one centralized location
- ✅ **Real-time Statistics** - Analytics on waste patterns, resource usage, and space utilization
- ✅ **Advanced Filtering** - Filter by date, section, grade, or submission type
- ✅ **Report Generation** - Generate reports for decision-making
- ✅ **School-wide Monitoring** - Monitor compliance and trends across the institution

### 🔐 Security & Authentication

- ✅ **Secure Login System** - JWT-based authentication with encrypted passwords
- ✅ **Role-Based Access Control** - Different permission levels for different user types
- ✅ **Password Protection** - bcrypt encryption for user passwords
- ✅ **Protected Routes** - API and frontend routes secured by authentication
- ✅ **Session Management** - Automatic token expiration and renewal

---

## 🛠 Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic markup and structure |
| **CSS3** | Styling with custom animations and responsive design |
| **JavaScript (ES6+)** | Interactive functionality and API integration |
| **Responsive Design** | Mobile-first approach for all devices |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | ≥18.0.0 | Runtime environment |
| **Express.js** | ^4.18.2 | Web application framework |
| **MongoDB** | ^8.0.3 | NoSQL database |
| **Mongoose** | ^8.0.3 | MongoDB object modeling |
| **JWT** | ^9.0.2 | Authentication tokens |
| **bcrypt** | ^5.1.1 | Password hashing |
| **Multer** | ^1.4.5 | File upload handling |
| **Cloudinary** | ^1.41.0 | Image storage and optimization |
| **CORS** | ^2.8.5 | Cross-origin resource sharing |
| **dotenv** | ^16.3.1 | Environment variable management |

### Infrastructure & Hosting

- **Frontend Hosting:** Cloudflare Pages (Free)
- **Backend Hosting:** Render.com (Free tier)
- **Database:** MongoDB Atlas (Free tier - 512MB)
- **Media Storage:** Cloudinary (Free tier - 25 GB)

**💰 Total Monthly Cost:** $0 (All services on free tier)

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [Git](https://git-scm.com/)
- [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas) (Free)
- [Cloudinary Account](https://cloudinary.com/) (Free)

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/school-management-system.git
cd school-management-system
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your credentials (see Configuration section)
nano .env  # or use your preferred text editor

# Start the backend server
npm start
```

The backend server will start on `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd frontend

# Update the API configuration
# Edit js/config.js and set BASE_URL to http://localhost:5000

# Open in browser
# You can use any local server or simply open index.html
# For a simple local server:
npx http-server -p 3000
```

The frontend will be accessible at `http://localhost:3000`

#### 4. Test Database Connection

```bash
cd backend
node test-connection.js
```

You should see a success message confirming MongoDB connection.

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/school-management?retryWrites=true&w=majority

# JWT Secret (Generate a random secure string)
# You can generate one using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration
# Get these from your Cloudinary dashboard at https://cloudinary.com/console
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server Port
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration

Update `frontend/js/config.js`:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000', // For local development
    // BASE_URL: 'https://your-backend-url.onrender.com', // For production
    
    ENDPOINTS: {
        // Endpoints are pre-configured
    }
};
```

### Obtaining API Keys

#### MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string and replace `<password>` with your database password

#### Cloudinary

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret

---

## 📦 Deployment

### Quick Deploy Guide

#### Backend Deployment (Render.com)

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR-USERNAME/school-management-system.git
   git push -u origin main
   ```

2. **Deploy on Render**
   - Go to [Render.com](https://render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** school-management-backend
     - **Environment:** Node
     - **Build Command:** `cd backend && npm install`
     - **Start Command:** `cd backend && npm start`
     - **Add Environment Variables** from your `.env` file

3. **Get Backend URL**
   - After deployment, copy your backend URL (e.g., `https://your-app.onrender.com`)

#### Frontend Deployment (Cloudflare Pages)

1. **Prepare Frontend**
   - Update `frontend/js/config.js` with your Render backend URL

2. **Deploy on Cloudflare Pages**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub repository
   - Configure:
     - **Project name:** school-management-system
     - **Production branch:** main
     - **Build command:** (leave empty)
     - **Build output directory:** frontend

3. **Final Configuration**
   - Update the `FRONTEND_URL` in your Render environment variables with your Cloudflare Pages URL

### Deployment Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Cloudinary account configured
- [ ] Backend deployed on Render with all environment variables
- [ ] Frontend deployed on Cloudflare Pages
- [ ] Frontend config.js updated with production backend URL
- [ ] Backend CORS configured with frontend URL
- [ ] Test all functionality in production

---

## 👥 User Roles

The system supports six different user roles with specific permissions:

| Role | Submit Waste | Submit Resources | Submit Spaces | View Dashboard | Description |
|------|--------------|------------------|---------------|----------------|-------------|
| **Principal** | ❌ | ❌ | ❌ | ✅ | Full access to dashboard and analytics |
| **Management Staff** | ❌ | ❌ | ❌ | ✅ | Full access to dashboard and analytics |
| **Class Teacher** | ✅ | ✅ | ✅ | ❌ | Can submit all types of entries |
| **Section Head** | ✅ | ✅ | ✅ | ❌ | Can submit all types of entries |
| **Non-Academic Staff** | ✅ | ✅ | ✅ | ❌ | Can submit all types of entries |
| **Worker** | ❌ | ✅ | ❌ | ❌ | Can only submit resource entries |

### Role Permissions Matrix

```
Feature                    Principal  Management  Class Teacher  Section Head  Non-Academic  Worker
────────────────────────────────────────────────────────────────────────────────────────────────────
Daily Waste Entry              ❌         ❌           ✅            ✅            ✅          ❌
Weekly Resources Entry         ❌         ❌           ✅            ✅            ✅          ✅
Unused Space Entry             ❌         ❌           ✅            ✅            ✅          ❌
Dashboard Access               ✅         ✅           ❌            ❌            ❌          ❌
View All Submissions           ✅         ✅           ❌            ❌            ❌          ❌
Profile Management             ✅         ✅           ✅            ✅            ✅          ✅
```

---

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
Register a new user

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "role": "Class Teacher",
  "section": "Grade 10A",
  "phoneNumber": "0771234567"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "Class Teacher"
  }
}
```

#### POST `/api/auth/login`
Login user

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

### User Endpoints

#### GET `/api/user/profile`
Get current user profile (Requires authentication)

#### PUT `/api/user/profile`
Update user profile (Requires authentication)

#### POST `/api/user/profile-picture`
Upload profile picture (Requires authentication, multipart/form-data)

#### POST `/api/user/change-password`
Change user password (Requires authentication)

### Waste Management Endpoints

#### POST `/api/waste/daily`
Submit daily waste entry (Requires authentication)

**Request Body (multipart/form-data):**
```
date: 2025-02-10
section: Grade 10A
wasteType: Plastic
quantity: 5
image: [File]
notes: Found in classroom
```

#### GET `/api/waste/daily`
Get waste entries (Requires authentication)

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)
- `section` (optional)

### Resource Management Endpoints

#### POST `/api/resources/weekly`
Submit weekly resource entry (Requires authentication)

#### GET `/api/resources/weekly`
Get resource entries (Requires authentication)

### Space Management Endpoints

#### POST `/api/spaces/unused`
Submit unused space entry (Requires authentication)

#### GET `/api/spaces/unused`
Get space entries (Requires authentication)

### Dashboard Endpoints

#### GET `/api/dashboard/stats`
Get dashboard statistics (Requires management role)

**Response:**
```json
{
  "totalWasteEntries": 150,
  "totalResourceEntries": 85,
  "totalSpaceEntries": 20,
  "recentSubmissions": [...],
  "wasteByType": {...},
  "resourceTrends": {...}
}
```

---

## 📁 Project Structure

```
school-management-system/
│
├── backend/                          # Backend API
│   ├── server.js                    # Main Express server
│   ├── package.json                 # Node.js dependencies
│   ├── package-lock.json            # Dependency lock file
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore                   # Git ignore rules
│   ├── test-connection.js           # Database connection test
│   └── README.md                    # Backend documentation
│
├── frontend/                         # Frontend application
│   ├── index.html                   # Landing page
│   ├── login.html                   # User login page
│   ├── signup.html                  # User registration
│   ├── profile.html                 # User profile page
│   ├── dashborard.html              # Management dashboard
│   ├── settings.html                # User settings
│   ├── instruction.html             # System instructions
│   ├── contact.html                 # Contact page
│   │
│   ├── # Data Entry Pages
│   ├── daily-waste-entry.html       # Daily waste form
│   ├── weekly-resources-entry.html  # Weekly resources form
│   ├── unused-space-entry.html      # Unused space form
│   ├── create-record.html           # Record creation
│   │
│   ├── # User Management Pages
│   ├── edit-profile.html            # Edit profile
│   ├── upload-profile-picture.html  # Profile picture upload
│   ├── change-password.html         # Password change
│   │
│   ├── # Legal Pages
│   ├── PP.html                      # Privacy Policy
│   ├── T & C.html                   # Terms & Conditions
│   │
│   ├── css/                         # Stylesheets
│   │   ├── common.css               # Shared styles
│   │   ├── auth.css                 # Authentication styles
│   │   ├── login.css                # Login page styles
│   │   ├── signup.css               # Signup page styles
│   │   ├── profile.css              # Profile page styles
│   │   ├── settings.css             # Settings page styles
│   │   ├── instruction.css          # Instruction page styles
│   │   ├── navbar-dropdown.css      # Navigation styles
│   │   ├── edit-profile.css         # Edit profile styles
│   │   └── change-password.css      # Password change styles
│   │
│   ├── js/                          # JavaScript files
│   │   ├── config.js                # API configuration
│   │   ├── custom-cursor.js         # Custom cursor effects
│   │   ├── daily-waste-entry.js     # Waste entry logic
│   │   ├── weekly-resources-entry.js # Resources entry logic
│   │   ├── unused-space-entry.js    # Space entry logic
│   │   └── change-password.js       # Password change logic
│   │
│   ├── images/                      # Image assets
│   │   ├── web logo.png             # Application logo
│   │   ├── webbg.png                # Background image 1
│   │   └── webbg2.png               # Background image 2
│   │
│   └── wrangler.toml                # Cloudflare configuration
│
├── .gitignore                       # Global git ignore
├── README.md                        # This file
└── DEPLOYMENT_GUIDE.md              # Deployment instructions (if exists)
```

---

## 🔒 Security

### Authentication & Authorization

- **JWT Tokens:** Secure JSON Web Tokens for session management
- **Password Hashing:** bcrypt with salt rounds for password encryption
- **Protected Routes:** Middleware-based route protection on both frontend and backend
- **Role-Based Access:** Granular permissions based on user roles

### Data Security

- **HTTPS:** All production deployments use HTTPS
- **CORS Configuration:** Whitelist-based cross-origin requests
- **Input Validation:** Server-side validation for all user inputs
- **SQL Injection Prevention:** MongoDB's parameterized queries
- **XSS Protection:** Sanitization of user-generated content

### Best Practices

- Environment variables for sensitive data
- Regular dependency updates
- Secure file upload validation
- Session timeout implementation
- Rate limiting on API endpoints (recommended for production)

---

## 🤝 Contributing

We welcome contributions to improve the School Management System! Here's how you can help:

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/school-management-system.git
   cd school-management-system
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Write clean, documented code
   - Follow existing code style
   - Test your changes thoroughly

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "Add: Description of your feature"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes in detail

### Contribution Guidelines

- Write clear commit messages
- Comment your code where necessary
- Update documentation for new features
- Ensure backward compatibility
- Test thoroughly before submitting

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Testing improvements
- 🌐 Localization/translations

---

## 🎓 Team

**Organization:** ACC Vertex Developers  
**Institution:** Anuradhapura Central College

### Team Members

**Team Leader:** Lithuli Limansa Samarasinghe  
📧 Email: urandileepa@gmail.com  
📱 Phone: +94 70 107 8584

### Project Information

- **Project Type:** School Management Solution
- **Development Period:** 2024-2025
- **Purpose:** Digital transformation of school resource management

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

```
MIT License

Copyright (c) 2025 ACC Vertex Developers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

We would like to thank:

- **Anuradhapura Central College** - For project support and resources
- **Teachers and Staff** - For valuable feedback during development
- **MongoDB** - For providing free database hosting
- **Cloudinary** - For free image storage and optimization
- **Render.com** - For free backend hosting
- **Cloudflare** - For free frontend hosting and CDN
- **Open Source Community** - For the tools and libraries that made this possible

---

## 📞 Support

### Getting Help

If you encounter any issues or have questions:

1. **Check Documentation** - Review this README and inline code comments
2. **Search Issues** - Look through [existing issues](https://github.com/YOUR-USERNAME/school-management-system/issues)
3. **Create an Issue** - If your problem is new, [create an issue](https://github.com/YOUR-USERNAME/school-management-system/issues/new)
4. **Contact Team** - Reach out directly via email

### Contact Information

- **📧 Email:** urandileepa@gmail.com
- **📱 Phone:** +94 70 107 8584
- **🐛 GitHub Issues:** [Report a bug](https://github.com/YOUR-USERNAME/school-management-system/issues)

### Common Issues

**Backend won't start:**
- Check if all environment variables are set correctly
- Verify MongoDB connection string
- Ensure Node.js version is 18 or higher

**Frontend can't connect to backend:**
- Verify `config.js` has correct backend URL
- Check CORS settings in backend
- Ensure backend is running

**Image upload fails:**
- Verify Cloudinary credentials
- Check file size limits
- Ensure proper file format (jpg, png)

---

## 🚀 Future Enhancements

Planned features for upcoming versions:

- [ ] Mobile application (React Native)
- [ ] Email notifications for submissions
- [ ] Advanced analytics and reporting
- [ ] Data export functionality (PDF, Excel)
- [ ] Multi-language support
- [ ] Automated waste collection scheduling
- [ ] Integration with school ERP systems
- [ ] Real-time notifications
- [ ] Mobile-responsive dashboard improvements

---

## 📊 Project Status

- **Version:** 1.0.0
- **Status:** ✅ Production Ready
- **Last Updated:** February 2025
- **Maintained:** ✅ Yes

---

<div align="center">

**Made with ❤️ by ACC Vertex Developers**

*Transforming Schools Through Smart Digital Management*

[⬆ Back to Top](#-smart-school-resource--waste-management-system)

</div>
