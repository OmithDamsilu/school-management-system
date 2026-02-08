# 🏫 Smart School Resource & Waste Management System

![Project Banner](frontend/images/web%20logo.png)

A comprehensive web-based platform designed to help schools efficiently manage waste disposal practices, reusable resources, and unused spaces. Built for Anuradhapura Central College by ACC Vertex Developers.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Team](#team)
- [License](#license)

## 🎯 Overview

This system addresses common challenges in schools:
- ❌ Improper waste separation in classrooms
- 📄 Paper waste scattered across school premises
- 🪑 Broken furniture not properly tracked
- 🔬 No digital system for laboratory equipment
- 🏢 Unused rooms filled with old materials
- 📊 Lack of centralized monitoring platform

### Solution

A unified platform that integrates:
- **Waste Management** - Daily tracking of classroom waste
- **Resource Tracking** - Weekly inventory of furniture and equipment
- **Space Utilization** - Photo-based reporting of unused areas
- **Role-Based Access** - Different permissions for different users
- **Dashboard Analytics** - Data-driven insights for management

## ✨ Features

### For Teachers & Staff
- ✅ Submit daily waste entries with photos
- ✅ Track weekly resources (desks, chairs, equipment)
- ✅ Report unused spaces with detailed information
- ✅ View personal submission history

### For Management
- ✅ Comprehensive dashboard with all submissions
- ✅ Statistics and analytics
- ✅ Filter by date, section, or grade
- ✅ Generate reports
- ✅ Monitor school-wide compliance

### Security & Access
- ✅ Role-based access control
- ✅ Secure authentication (JWT)
- ✅ Password encryption
- ✅ Protected routes

## 🛠 Technology Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Responsive design
- Modern UI/UX

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas (Cloud)
- **Authentication:** JWT + bcrypt
- **File Upload:** Multer + Cloudinary
- **Security:** CORS enabled

### Deployment
- **Frontend:** Cloudflare Pages
- **Backend:** Render.com
- **Database:** MongoDB Atlas
- **Media Storage:** Cloudinary

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (free)
- Cloudinary account (free)
- Git installed

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR-USERNAME/school-management-system.git
   cd school-management-system
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm start
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   # Update js/config.js with your backend URL
   # Open index.html in browser or use a local server
   ```

4. **Test Connection**
   ```bash
   cd backend
   node test-connection.js
   ```

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for complete step-by-step instructions.

### Quick Deploy

1. **Deploy Backend to Render**
   - Push code to GitHub
   - Connect to Render
   - Set environment variables
   - Deploy

2. **Deploy Frontend to Cloudflare Pages**
   - Connect to GitHub
   - Set build directory to `frontend`
   - Deploy

**Total Cost:** $0/month (all free tiers)

## 👥 User Roles

| Role | Submit Forms | View Dashboard | Access Level |
|------|--------------|----------------|--------------|
| **Principal** | ❌ | ✅ | Full access to all data |
| **Management Staff** | ❌ | ✅ | Full access to all data |
| **Class Teacher** | ✅ All Forms | ❌ | Own submissions only |
| **Section Head** | ✅ All Forms | ❌ | Own submissions only |
| **Non-Academic Staff** | ✅ All Forms | ❌ | Own submissions only |
| **Worker** | ✅ Resources Only | ❌ | Own submissions only |

## 📁 Project Structure

```
school-management-system/
│
├── backend/                      # Backend API
│   ├── server.js                # Main server file
│   ├── package.json             # Dependencies
│   ├── .env.example             # Environment template
│   ├── test-connection.js       # Database test script
│   └── README.md                # Backend docs
│
├── frontend/                     # Frontend application
│   ├── index.html               # Landing page
│   ├── login.html               # Login page
│   ├── signup.html              # Registration
│   ├── profile.html             # User profile
│   ├── dashborard.html          # Management dashboard
│   ├── daily-waste-entry.html   # Waste form
│   ├── weekly-resources-entry.html  # Resources form
│   ├── unused-space-entry.html  # Space form
│   ├── css/                     # Stylesheets
│   ├── js/                      # JavaScript
│   │   └── config.js            # API configuration
│   └── images/                  # Assets
│
├── DEPLOYMENT_GUIDE.md          # Deployment instructions
└── README.md                    # This file
```

## 🎓 Team

**Team Name:** ACC Vertex Developers  
**School:** Anuradhapura Central College  

**Team Leader:** Lithuli Limansa Samarasinghe  
**Contact:** urandileepa@gmail.com  
**Phone:** 0701078584

## 📄 License

MIT License - Free to use and modify for educational purposes.

## 🙏 Acknowledgments

- Anuradhapura Central College for project support
- All teachers and staff who provided feedback
- MongoDB, Cloudinary, Render, and Cloudflare for free hosting

## 📞 Support

For issues, questions, or contributions:
- **Email:** urandileepa@gmail.com
- **GitHub Issues:** [Create an issue](https://github.com/YOUR-USERNAME/school-management-system/issues)

---

**Made with ❤️ by ACC Vertex Developers**

*Transforming Schools Through Smart Digital Management*
