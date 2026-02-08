// Test script to verify MongoDB connection and create test user
// Run this file with: node test-connection.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('Database Name:', mongoose.connection.name);
    return testDatabase();
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

async function testDatabase() {
    try {
        // Simple User Schema for testing
        const userSchema = new mongoose.Schema({
            username: String,
            email: String,
            password: String,
            fullName: String,
            role: String,
            createdAt: { type: Date, default: Date.now }
        });

        const User = mongoose.model('User', userSchema);

        // Create a test user
        const hashedPassword = await bcrypt.hash('test123', 10);
        
        const testUser = new User({
            username: 'testadmin',
            email: 'admin@test.com',
            password: hashedPassword,
            fullName: 'Test Administrator',
            role: 'Principal'
        });

        // Check if test user already exists
        const existing = await User.findOne({ username: 'testadmin' });
        
        if (existing) {
            console.log('ℹ️  Test user already exists');
        } else {
            await testUser.save();
            console.log('✅ Test user created successfully!');
            console.log('   Username: testadmin');
            console.log('   Password: test123');
            console.log('   Role: Principal');
        }

        // Count documents
        const userCount = await User.countDocuments();
        console.log(`📊 Total users in database: ${userCount}`);

        console.log('\n🎉 Database test completed successfully!');
        console.log('You can now run your server with: npm start');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Database test error:', error.message);
        process.exit(1);
    }
}
