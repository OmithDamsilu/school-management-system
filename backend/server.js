const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
// CORS Configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8000',
    'https://school-management.pages.dev',
    'https://school-management-system-431.pages.dev/', // Replace with your actual Cloudflare URL
    process.env.FRONTEND_URL // This will come from environment variable
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if the origin is in our allowed list
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(process.env.FRONTEND_URL)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'school-management',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 800, height: 800, crop: 'limit' }]
    }
});

const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Atlas Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true },
    role: { 
        type: String, 
        required: true,
        enum: ['Principal', 'Management Staff', 'Non-Academic Staff', 'Class Teacher', 'Section Head', 'Worker']
    },
    section: { type: String },
    grade: { type: String },
    phone: { type: String },
    profilePicture: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Weekly Resources Entry Schema
const weeklyResourcesSchema = new mongoose.Schema({
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedByName: { type: String, required: true },
    submittedRole: { type: String, required: true },
    submittedSection: { type: String },
    weekStartDate: { type: Date, required: true },
    weekEndDate: { type: Date, required: true },
    
    // Resource Counts
    desks: {
        good: { type: Number, default: 0 },
        damaged: { type: Number, default: 0 },
        broken: { type: Number, default: 0 }
    },
    chairs: {
        good: { type: Number, default: 0 },
        damaged: { type: Number, default: 0 },
        broken: { type: Number, default: 0 }
    },
    whiteboards: {
        good: { type: Number, default: 0 },
        damaged: { type: Number, default: 0 },
        broken: { type: Number, default: 0 }
    },
    projectors: {
        good: { type: Number, default: 0 },
        damaged: { type: Number, default: 0 },
        broken: { type: Number, default: 0 }
    },
    
    additionalNotes: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const WeeklyResources = mongoose.model('WeeklyResources', weeklyResourcesSchema);

// Daily Waste Entry Schema
const dailyWasteSchema = new mongoose.Schema({
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedByName: { type: String, required: true },
    submittedRole: { type: String, required: true },
    submittedSection: { type: String },
    submittedGrade: { type: String },
    date: { type: Date, required: true },
    
    // Waste Categories
    paperWaste: { type: Number, default: 0 },
    plasticWaste: { type: Number, default: 0 },
    foodWaste: { type: Number, default: 0 },
    generalWaste: { type: Number, default: 0 },
    
    // Waste Separation Status
    wasProperlySegregated: { type: Boolean, required: true },
    classroomCleanliness: { 
        type: String, 
        enum: ['Excellent', 'Good', 'Fair', 'Poor'],
        required: true 
    },
    
    additionalNotes: { type: String },
    photos: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

const DailyWaste = mongoose.model('DailyWaste', dailyWasteSchema);

// Unused Space Entry Schema
const unusedSpaceSchema = new mongoose.Schema({
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    submittedByName: { type: String, required: true },
    submittedRole: { type: String, required: true },
    submittedSection: { type: String },
    
    // Location Information
    buildingName: { type: String, required: true },
    floorNumber: { type: String, required: true },
    roomNumber: { type: String },
    nearLocation: { type: String, required: true },
    specificLocation: { type: String, required: true },
    
    // Space Type
    spaceType: { type: String, required: true },
    otherSpaceType: { type: String },
    
    // Size
    spaceSize: { type: String, required: true },
    estimatedLength: { type: Number },
    estimatedWidth: { type: Number },
    
    // Current Usage
    currentUsage: { type: String, required: true },
    usageDescription: { type: String, required: true },
    lastUsedDate: { type: Date },
    
    // Condition
    spaceCondition: { type: String, required: true },
    spaceIssues: [{ type: String }],
    conditionDetails: { type: String },
    
    // Facilities
    facilities: [{ type: String }],
    facilitiesNotes: { type: String },
    
    // Potential Uses
    potentialUses: [{ type: String }],
    suggestionDetails: { type: String, required: true },
    priority: { type: String, required: true },
    
    // Required Resources
    cleaningNeeds: { type: String },
    repairNeeds: { type: String },
    furnitureNeeds: { type: String },
    estimatedBudget: { type: String },
    
    // Additional
    additionalNotes: { type: String },
    contactPerson: { type: String },
    
    // Photos
    photos: [{ type: String }],
    
    createdAt: { type: Date, default: Date.now }
});

const UnusedSpace = mongoose.model('UnusedSpace', unusedSpaceSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ===================== AUTHENTICATION ROUTES =====================

// Sign Up Route
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password, fullName, role, section, grade, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username or email already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            fullName,
            role,
            section,
            grade,
            phone
        });

        await newUser.save();

        res.status(201).json({ 
            success: true, 
            message: 'Account created successfully!' 
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during signup' 
        });
    }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username or email
        const user = await User.findOne({ 
            $or: [{ username }, { email: username }] 
        });

        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user._id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ 
            success: true, 
            message: 'Login successful!',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                section: user.section,
                grade: user.grade,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// ===================== USER PROFILE ROUTES =====================

// Get User Profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update User Profile
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { fullName, email, phone, section, grade } = req.body;
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { 
                fullName, 
                email, 
                phone, 
                section, 
                grade,
                updatedAt: Date.now()
            },
            { new: true }
        ).select('-password');

        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: updatedUser 
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Upload Profile Picture
app.post('/api/user/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { 
                profilePicture: req.file.path,
                updatedAt: Date.now()
            },
            { new: true }
        ).select('-password');

        res.json({ 
            success: true, 
            message: 'Profile picture updated successfully',
            profilePicture: updatedUser.profilePicture
        });
    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Change Password
app.post('/api/user/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.userId);
        
        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                message: 'Current password is incorrect' 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        user.password = hashedPassword;
        user.updatedAt = Date.now();
        await user.save();

        res.json({ 
            success: true, 
            message: 'Password changed successfully' 
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===================== WASTE ENTRY ROUTES =====================

// Submit Daily Waste Entry
app.post('/api/waste/daily', authenticateToken, upload.array('photos', 5), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        // Workers cannot submit waste entries
        if (user.role === 'Worker') {
            return res.status(403).json({ 
                success: false, 
                message: 'Workers are not allowed to submit waste entries' 
            });
        }

        const photos = req.files ? req.files.map(file => file.path) : [];

        const wasteEntry = new DailyWaste({
            submittedBy: req.user.userId,
            submittedByName: user.fullName,
            submittedRole: user.role,
            submittedSection: user.section,
            submittedGrade: user.grade,
            date: req.body.date,
            paperWaste: req.body.paperWaste || 0,
            plasticWaste: req.body.plasticWaste || 0,
            foodWaste: req.body.foodWaste || 0,
            generalWaste: req.body.generalWaste || 0,
            wasProperlySegregated: req.body.wasProperlySegregated === 'true',
            classroomCleanliness: req.body.classroomCleanliness,
            additionalNotes: req.body.additionalNotes,
            photos
        });

        await wasteEntry.save();

        res.status(201).json({ 
            success: true, 
            message: 'Waste entry submitted successfully',
            entry: wasteEntry
        });
    } catch (error) {
        console.error('Submit waste entry error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get All Waste Entries (for Management/Principal)
app.get('/api/waste/daily', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        let query = {};
        
        // If not Principal or Management Staff, only show their own entries
        if (user.role !== 'Principal' && user.role !== 'Management Staff') {
            query.submittedBy = req.user.userId;
        }

        const entries = await DailyWaste.find(query)
            .sort({ date: -1 })
            .limit(100);

        res.json({ success: true, entries });
    } catch (error) {
        console.error('Get waste entries error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===================== RESOURCES ENTRY ROUTES =====================

// Submit Weekly Resources Entry
app.post('/api/resources/weekly', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        // All authenticated users including Workers can submit resource entries
        // (Resources are physical items that Workers would know about)

        const resourceEntry = new WeeklyResources({
            submittedBy: req.user.userId,
            submittedByName: user.fullName,
            submittedRole: user.role,
            submittedSection: user.section,
            weekStartDate: req.body.weekStartDate,
            weekEndDate: req.body.weekEndDate,
            desks: {
                good: req.body.desksGood || 0,
                damaged: req.body.desksDamaged || 0,
                broken: req.body.desksBroken || 0
            },
            chairs: {
                good: req.body.chairsGood || 0,
                damaged: req.body.chairsDamaged || 0,
                broken: req.body.chairsBroken || 0
            },
            whiteboards: {
                good: req.body.whiteboardsGood || 0,
                damaged: req.body.whiteboardsDamaged || 0,
                broken: req.body.whiteboardsBroken || 0
            },
            projectors: {
                good: req.body.projectorsGood || 0,
                damaged: req.body.projectorsDamaged || 0,
                broken: req.body.projectorsBroken || 0
            },
            additionalNotes: req.body.additionalNotes
        });

        await resourceEntry.save();

        res.status(201).json({ 
            success: true, 
            message: 'Resources entry submitted successfully',
            entry: resourceEntry
        });
    } catch (error) {
        console.error('Submit resources entry error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get All Resources Entries
app.get('/api/resources/weekly', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        let query = {};
        
        // If not Principal or Management Staff, only show their own entries
        if (user.role !== 'Principal' && user.role !== 'Management Staff') {
            query.submittedBy = req.user.userId;
        }

        const entries = await WeeklyResources.find(query)
            .sort({ weekStartDate: -1 })
            .limit(100);

        res.json({ success: true, entries });
    } catch (error) {
        console.error('Get resources entries error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===================== UNUSED SPACE ROUTES =====================

// Submit Unused Space Entry
app.post('/api/spaces/unused', authenticateToken, upload.array('photos', 10), async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        // Workers cannot submit space entries
        if (user.role === 'Worker') {
            return res.status(403).json({ 
                success: false, 
                message: 'Workers are not allowed to submit space entries' 
            });
        }

        const photos = req.files ? req.files.map(file => file.path) : [];

        const spaceEntry = new UnusedSpace({
            submittedBy: req.user.userId,
            submittedByName: user.fullName,
            submittedRole: user.role,
            submittedSection: user.section,
            buildingName: req.body.buildingName,
            floorNumber: req.body.floorNumber,
            roomNumber: req.body.roomNumber,
            nearLocation: req.body.nearLocation,
            specificLocation: req.body.specificLocation,
            spaceType: req.body.spaceType,
            otherSpaceType: req.body.otherSpaceType,
            spaceSize: req.body.spaceSize,
            estimatedLength: req.body.estimatedLength,
            estimatedWidth: req.body.estimatedWidth,
            currentUsage: req.body.currentUsage,
            usageDescription: req.body.usageDescription,
            lastUsedDate: req.body.lastUsedDate,
            spaceCondition: req.body.spaceCondition,
            spaceIssues: req.body.spaceIssues ? JSON.parse(req.body.spaceIssues) : [],
            conditionDetails: req.body.conditionDetails,
            facilities: req.body.facilities ? JSON.parse(req.body.facilities) : [],
            facilitiesNotes: req.body.facilitiesNotes,
            potentialUses: req.body.potentialUses ? JSON.parse(req.body.potentialUses) : [],
            suggestionDetails: req.body.suggestionDetails,
            priority: req.body.priority,
            cleaningNeeds: req.body.cleaningNeeds,
            repairNeeds: req.body.repairNeeds,
            furnitureNeeds: req.body.furnitureNeeds,
            estimatedBudget: req.body.estimatedBudget,
            additionalNotes: req.body.additionalNotes,
            contactPerson: req.body.contactPerson,
            photos
        });

        await spaceEntry.save();

        res.status(201).json({ 
            success: true, 
            message: 'Space entry submitted successfully',
            entry: spaceEntry
        });
    } catch (error) {
        console.error('Submit space entry error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get All Unused Space Entries
app.get('/api/spaces/unused', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        let query = {};
        
        // If not Principal or Management Staff, only show their own entries
        if (user.role !== 'Principal' && user.role !== 'Management Staff') {
            query.submittedBy = req.user.userId;
        }

        const entries = await UnusedSpace.find(query)
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({ success: true, entries });
    } catch (error) {
        console.error('Get space entries error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===================== DASHBOARD STATISTICS ROUTES =====================

// Get Dashboard Statistics (for Principal/Management)
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        // Only Principal and Management Staff can access dashboard stats
        if (user.role !== 'Principal' && user.role !== 'Management Staff') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        // Get statistics
        const totalUsers = await User.countDocuments();
        const totalWasteEntries = await DailyWaste.countDocuments();
        const totalResourceEntries = await WeeklyResources.countDocuments();
        const totalSpaceEntries = await UnusedSpace.countDocuments();

        // Get recent entries
        const recentWasteEntries = await DailyWaste.find()
            .sort({ createdAt: -1 })
            .limit(5);

        const recentResourceEntries = await WeeklyResources.find()
            .sort({ createdAt: -1 })
            .limit(5);

        const recentSpaceEntries = await UnusedSpace.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalWasteEntries,
                totalResourceEntries,
                totalSpaceEntries
            },
            recentEntries: {
                waste: recentWasteEntries,
                resources: recentResourceEntries,
                spaces: recentSpaceEntries
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
