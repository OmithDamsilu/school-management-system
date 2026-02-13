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
    'https://school-management-system-431.pages.dev', // Replace with your actual Cloudflare URL
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

// ✅ UPDATED: Increase limit for Base64 photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ extended: true }));

// ✅ ADD THIS NEW CODE HERE (between the lines above and below):
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        res.set('ETag', '');
    }
    next();
});

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
        enum: ['Principal', 'Management Staff', 'Deputy Principal', 'Assistant Principal', 'Non-Academic Staff', 'Class Teacher', 'Section Head', 'Worker']
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
    
    // Location
    location: { type: String, required: true },
    specificArea: { type: String },
    weekEnding: { type: Date, required: true },
    
    // Inventory data
    furniture: [{
        type: { type: String, required: true },
        name: { type: String },
        quantity: { type: Number, required: true },
        condition: { type: String, required: true },
        notes: { type: String }
    }],
    equipment: [{
        type: { type: String, required: true },
        name: { type: String },
        quantity: { type: Number, required: true },
        condition: { type: String, required: true },
        notes: { type: String }
    }],
    
    // Assessment
    overallCondition: { type: String },
    spaceUtilization: { type: String },
    
    // Issues and needs
    repairItems: { type: String },
    replacementItems: { type: String },
    additionalNeeds: { type: String },
    spaceNotes: { type: String },
    
    // ✅ UPDATED: Photos (supports both formats)
    photos: [{
        // Cloudinary format
        url: { type: String },
        publicId: { type: String },
        // Base64 format
        data: { type: String },
        mimeType: { type: String },
        // Common fields
        originalName: { type: String },
        size: { type: Number },
        uploadedAt: { type: Date }
    }],
    
    notes: { type: String },
    priorityLevel: { type: String },
    
    createdAt: { type: Date, default: Date.now }
});
const WeeklyResources = mongoose.model('WeeklyResources', weeklyResourcesSchema);

// Daily Waste Entry Schema
// Daily Waste Entry Schema - UPDATED FOR BASE64
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
    
    // ✅ UPDATED: Base64 photo storage
    photos: [{
        data: { type: String, required: true },        // Base64 string
        originalName: { type: String },
        mimeType: { type: String },
        size: { type: Number },
        uploadedAt: { type: Date }
    }],
    
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
    
    // ✅ UPDATED: Photos (supports both formats)
    photos: [{
        // Cloudinary format
        url: { type: String },
        publicId: { type: String },
        // Base64 format
        data: { type: String },
        mimeType: { type: String },
        // Common fields
        originalName: { type: String },
        size: { type: Number },
        uploadedAt: { type: Date }
    }],
    
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
    message: 'Profile picture updated successfully',
    imageUrl: updatedUser.profilePicture,  // ✅ Correct property name
    profilePicture: updatedUser.profilePicture  // Keep for backward compatibility
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
            imageUrl: updatedUser.profilePicture,  // ✅ Add this field
            profilePicture: updatedUser.profilePicture,  // Keep for compatibility
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                fullName: updatedUser.fullName,
                role: updatedUser.role,
                profilePicture: updatedUser.profilePicture
            }
        });
    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error: ' + error.message 
        });
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
// ✅ UPDATED: Submit Daily Waste Entry (Base64 Photos)
app.post('/api/waste/daily', authenticateToken, async (req, res) => {
    try {
        console.log('📥 Received waste entry submission');
        
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Workers cannot submit waste entries
        if (user.role === 'Worker') {
            return res.status(403).json({ 
                success: false, 
                message: 'Workers are not allowed to submit waste entries' 
            });
        }

        // Parse body data (in case it's stringified)
        const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        console.log('📊 Entry data:', {
            userId: user._id,
            userName: user.fullName,
            date: bodyData.entryDate,
            photosCount: bodyData.photos?.length || 0,
            totalWaste: bodyData.totalWaste
        });

        // Validate required fields
        if (!bodyData.entryDate && !bodyData.date) {
            return res.status(400).json({ 
                success: false, 
                message: 'Date is required' 
            });
        }

        if (!bodyData.photos || !Array.isArray(bodyData.photos) || bodyData.photos.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: 'At least 2 photos are required' 
            });
        }

        if (!bodyData.cleanlinessRating || bodyData.cleanlinessRating === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cleanliness rating is required' 
            });
        }

        // Map cleanliness rating (1-5 stars) to text
        const mapCleanlinessRating = (rating) => {
            const ratingMap = {
                5: 'Excellent',
                4: 'Good',
                3: 'Good',
                2: 'Fair',
                1: 'Poor'
            };
            return ratingMap[rating] || 'Fair';
        };

        // Create waste entry
        const wasteEntry = new DailyWaste({
            submittedBy: req.user.userId,
            submittedByName: user.fullName,
            submittedRole: user.role,
            submittedSection: user.section || bodyData.classSection,
            submittedGrade: user.grade,
            date: bodyData.entryDate || bodyData.date,
            
            // Map frontend data to backend schema
            paperWaste: bodyData.wasteData?.recyclable?.amount || 0,
            plasticWaste: bodyData.wasteData?.organic?.amount || 0,
            foodWaste: bodyData.wasteData?.nonRecyclable?.amount || 0,
            generalWaste: bodyData.totalWaste || 0,
            
            wasProperlySegregated: bodyData.separationStatus === 'properly_separated',
            classroomCleanliness: mapCleanlinessRating(bodyData.cleanlinessRating),
            additionalNotes: bodyData.notes || '',
            
            // ✅ Store Base64 photos directly
            photos: bodyData.photos
        });

        await wasteEntry.save();

        console.log('✅ Waste entry saved successfully:', wasteEntry._id);

        res.status(201).json({ 
            success: true, 
            message: 'Waste entry submitted successfully',
            entry: {
                _id: wasteEntry._id,
                date: wasteEntry.date,
                totalWaste: wasteEntry.generalWaste,
                photosCount: wasteEntry.photos.length,
                cleanliness: wasteEntry.classroomCleanliness
            }
        });
    } catch (error) {
        console.error('❌ Submit waste entry error:', error);
        
        // Better error messages
        let errorMessage = 'Server error';
        if (error.name === 'ValidationError') {
            errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage
        });
    }
});

// ===================== RESOURCES ENTRY ROUTES =====================

// Submit Weekly Resources Entry
// ✅ UPDATED: Submit Weekly Resources Entry (supports both Cloudinary & Base64)
app.post('/api/resources/weekly', authenticateToken, async (req, res) => {
    try {
        console.log('📥 Received weekly resources submission');
        
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        // Parse body data
        const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        console.log('📊 Resources data:', {
            userId: user._id,
            userName: user.fullName,
            weekEnding: bodyData.weekEnding,
            furnitureCount: bodyData.furniture?.length || 0,
            equipmentCount: bodyData.equipment?.length || 0,
            photosCount: bodyData.photos?.length || 0
        });

        // Validate required fields
        if (!bodyData.weekEnding) {
            return res.status(400).json({ 
                success: false, 
                message: 'Week ending date is required' 
            });
        }

        if (!bodyData.location) {
            return res.status(400).json({ 
                success: false, 
                message: 'Location is required' 
            });
        }

        if (!bodyData.photos || !Array.isArray(bodyData.photos) || bodyData.photos.length < 2) {
            return res.status(400).json({ 
                success: false, 
                message: 'At least 2 photos are required' 
            });
        }

        if ((!bodyData.furniture || bodyData.furniture.length === 0) && 
            (!bodyData.equipment || bodyData.equipment.length === 0)) {
            return res.status(400).json({ 
                success: false, 
                message: 'At least one furniture or equipment item is required' 
            });
        }

        const resourceEntry = new WeeklyResources({
            submittedBy: req.user.userId,
            submittedByName: user.fullName,
            submittedRole: user.role,
            submittedSection: user.section,
            
            location: bodyData.location,
            specificArea: bodyData.specificArea,
            weekEnding: bodyData.weekEnding,
            
            furniture: bodyData.furniture || [],
            equipment: bodyData.equipment || [],
            
            overallCondition: bodyData.overallCondition,
            spaceUtilization: bodyData.spaceUtilization,
            
            repairItems: bodyData.repairItems,
            replacementItems: bodyData.replacementItems,
            additionalNeeds: bodyData.additionalNeeds,
            spaceNotes: bodyData.spaceNotes,
            
            photos: bodyData.photos, // ✅ Accepts both Cloudinary & Base64
            
            notes: bodyData.notes,
            priorityLevel: bodyData.priorityLevel || 'routine'
        });

        await resourceEntry.save();

        console.log('✅ Weekly resources entry saved:', resourceEntry._id);

        res.status(201).json({ 
            success: true, 
            message: 'Weekly resources report submitted successfully',
            entry: {
                _id: resourceEntry._id,
                weekEnding: resourceEntry.weekEnding,
                location: resourceEntry.location,
                photosCount: resourceEntry.photos.length
            }
        });
    } catch (error) {
        console.error('❌ Submit resources entry error:', error);
        
        let errorMessage = 'Server error';
        if (error.name === 'ValidationError') {
            errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage
        });
    }
});


// ===================== UNUSED SPACE ROUTES =====================

// Submit Unused Space Entry
https://github.com/OmithDamsilu/school-management-system/blob/main/frontend/js/unused-space-entry.js

// Get All Unused Space Entries
// ✅ UPDATED: Submit Unused Space Entry (supports both Cloudinary & Base64)
app.post('/api/spaces/unused', authenticateToken, async (req, res) => {
    try {
        console.log('📥 Received unused space submission');
        
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Workers cannot submit space entries
        if (user.role === 'Worker') {
            return res.status(403).json({ 
                success: false, 
                message: 'Workers are not allowed to submit space entries' 
            });
        }

        // Parse body data
        const bodyData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

        console.log('📊 Space data:', {
            userId: user._id,
            userName: user.fullName,
            buildingName: bodyData.buildingName,
            spaceType: bodyData.spaceType,
            photosCount: bodyData.photos?.length || 0
        });

        // Validate required fields
        if (!bodyData.buildingName || !bodyData.floorNumber || !bodyData.nearLocation || 
            !bodyData.specificLocation || !bodyData.spaceType || !bodyData.spaceSize || 
            !bodyData.currentUsage || !bodyData.usageDescription || !bodyData.spaceCondition || 
            !bodyData.suggestionDetails || !bodyData.priority) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill in all required fields' 
            });
        }

        if (!bodyData.photos || !Array.isArray(bodyData.photos) || bodyData.photos.length < 3) {
            return res.status(400).json({ 
                success: false, 
                message: 'At least 3 photos are required' 
            });
        }

        const spaceEntry = new UnusedSpace({
            submittedBy: req.user.userId,
            submittedByName: user.fullName,
            submittedRole: user.role,
            submittedSection: user.section,
            
            buildingName: bodyData.buildingName,
            floorNumber: bodyData.floorNumber,
            roomNumber: bodyData.roomNumber,
            nearLocation: bodyData.nearLocation,
            specificLocation: bodyData.specificLocation,
            
            spaceType: bodyData.spaceType,
            otherSpaceType: bodyData.otherSpaceType,
            
            spaceSize: bodyData.spaceSize,
            estimatedLength: bodyData.estimatedLength,
            estimatedWidth: bodyData.estimatedWidth,
            
            currentUsage: bodyData.currentUsage,
            usageDescription: bodyData.usageDescription,
            lastUsedDate: bodyData.lastUsedDate,
            
            spaceCondition: bodyData.spaceCondition,
            spaceIssues: bodyData.spaceIssues || [],
            conditionDetails: bodyData.conditionDetails,
            
            facilities: bodyData.facilities || [],
            facilitiesNotes: bodyData.facilitiesNotes,
            
            potentialUses: bodyData.potentialUses || [],
            suggestionDetails: bodyData.suggestionDetails,
            priority: bodyData.priority,
            
            cleaningNeeds: bodyData.cleaningNeeds,
            repairNeeds: bodyData.repairNeeds,
            furnitureNeeds: bodyData.furnitureNeeds,
            estimatedBudget: bodyData.estimatedBudget,
            
            additionalNotes: bodyData.additionalNotes,
            contactPerson: bodyData.contactPerson,
            
            photos: bodyData.photos // ✅ Accepts both Cloudinary & Base64
        });

        await spaceEntry.save();

        console.log('✅ Unused space entry saved:', spaceEntry._id);

        res.status(201).json({ 
            success: true, 
            message: 'Unused space report submitted successfully',
            entry: {
                _id: spaceEntry._id,
                buildingName: spaceEntry.buildingName,
                spaceType: spaceEntry.spaceType,
                photosCount: spaceEntry.photos.length
            }
        });
    } catch (error) {
        console.error('❌ Submit space entry error:', error);
        
        let errorMessage = 'Server error';
        if (error.name === 'ValidationError') {
            errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage
        });
    }
});

// ===================== DASHBOARD STATISTICS ROUTES =====================

// Get Dashboard Statistics (for Principal/Management)
// ===================== GET DASHBOARD STATISTICS =====================
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        const allowedRoles = [
            'Principal',
            'Management Staff',
            'Deputy Principal',
            'Assistant Principal',
            'Section Head'
        ];
        
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied' 
            });
        }

        const totalUsers = await User.countDocuments();
        const totalWasteEntries = await DailyWaste.countDocuments();
        const totalResourceEntries = await WeeklyResources.countDocuments();
        const totalSpaceEntries = await UnusedSpace.countDocuments();

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

// ===================== GET DAILY WASTE ENTRIES =====================
app.get('/api/waste/daily', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        let query = {};
        
        const managementRoles = [
            'Principal',
            'Management Staff',
            'Deputy Principal',
            'Assistant Principal',
            'Section Head'
        ];
        
        if (!managementRoles.includes(user.role)) {
            query.submittedBy = req.user.userId;
        }

        const entries = await DailyWaste.find(query)
            .sort({ date: -1, createdAt: -1 })
            .limit(100)
            .lean();

        console.log('✅ Found', entries.length, 'waste entries');

        res.json({ 
            success: true, 
            entries: entries,
            count: entries.length 
        });
    } catch (error) {
        console.error('Get waste entries error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ===================== GET UNUSED SPACE ENTRIES =====================
app.get('/api/spaces/unused', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        let query = {};
        
        const managementRoles = [
            'Principal',
            'Management Staff',
            'Deputy Principal',
            'Assistant Principal',
            'Section Head'
        ];
        
        if (!managementRoles.includes(user.role)) {
            query.submittedBy = req.user.userId;
        }

        const entries = await UnusedSpace.find(query)
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();

        console.log('✅ Found', entries.length, 'space entries');

        res.json({ 
            success: true, 
            entries: entries,
            count: entries.length 
        });
    } catch (error) {
        console.error('Get space entries error:', error);
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

app.get('/api/resources/weekly', authenticateToken, async (req, res) => {
    try {
        console.log('📥 Getting weekly resources entries');
        
        const user = await User.findById(req.user.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        let query = {};
        
        // If not management staff, only show their own entries
        const managementRoles = [
            'Principal',
            'Management Staff',
            'Deputy Principal',
            'Assistant Principal',
            'Section Head'
        ];
        
        if (!managementRoles.includes(user.role)) {
            query.submittedBy = req.user.userId;  // ✅ ADD THIS LINE!
        }

        const entries = await WeeklyResources.find(query)
            .sort({ weekEnding: -1, createdAt: -1 })
            .limit(100)
            .lean();

        console.log('✅ Found', entries.length, 'resource entries');

        res.json({ 
            success: true, 
            entries: entries,
            count: entries.length 
        });
    } catch (error) {
        console.error('Get resources entries error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
