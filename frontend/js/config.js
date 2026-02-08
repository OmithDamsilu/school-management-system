// API Configuration
const API_CONFIG = {
    // Change this to your Render backend URL after deployment
    BASE_URL: 'https://school-management-system-wico.onrender.com', // For local development
    // BASE_URL: 'https://your-backend-url.onrender.com', // For production
    
    ENDPOINTS: {
        // Auth endpoints
        LOGIN: '/api/auth/login',
        SIGNUP: '/api/auth/signup',
        
        // User endpoints
        PROFILE: '/api/user/profile',
        UPDATE_PROFILE: '/api/user/profile',
        UPLOAD_PROFILE_PICTURE: '/api/user/profile-picture',
        CHANGE_PASSWORD: '/api/user/change-password',
        
        // Waste endpoints
        SUBMIT_WASTE: '/api/waste/daily',
        GET_WASTE: '/api/waste/daily',
        
        // Resources endpoints
        SUBMIT_RESOURCES: '/api/resources/weekly',
        GET_RESOURCES: '/api/resources/weekly',
        
        // Space endpoints
        SUBMIT_SPACE: '/api/spaces/unused',
        GET_SPACES: '/api/spaces/unused',
        
        // Dashboard endpoints
        DASHBOARD_STATS: '/api/dashboard/stats'
    }
};

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    
    const defaultHeaders = {
        'Content-Type': 'application/json'
    };
    
    // Add authorization header if token exists
    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    // Merge headers
    const headers = {
        ...defaultHeaders,
        ...options.headers
    };
    
    // Remove Content-Type for FormData
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    }
    
    const config = {
        ...options,
        headers
    };
    
    try {
        const response = await fetch(API_CONFIG.BASE_URL + endpoint, config);
        const data = await response.json();
        
        // Handle unauthorized (token expired or invalid)
        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = 'login.html';
            }
            throw new Error('Session expired. Please login again.');
        }
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API call error:', error);
        throw error;
    }
}

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('authToken') !== null;
}

// Get current user data
function getCurrentUser() {
    const userDataStr = localStorage.getItem('userData');
    return userDataStr ? JSON.parse(userDataStr) : null;
}

// Logout function
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}

// Check if user has permission to access entry forms
function canAccessEntryForms() {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Only Principals and Management Staff cannot access entry forms
    const restrictedRoles = ['Principal', 'Management Staff'];
    return !restrictedRoles.includes(user.role);
}

// Check if user can submit waste entries (Workers cannot)
function canSubmitWaste() {
    const user = getCurrentUser();
    if (!user) return false;
    
    return user.role !== 'Worker' && user.role !== 'Principal' && user.role !== 'Management Staff';
}

// Check if user can submit resource entries (Everyone except Principal/Management)
function canSubmitResources() {
    const user = getCurrentUser();
    if (!user) return false;
    
    return user.role !== 'Principal' && user.role !== 'Management Staff';
}

// Check if user can submit space entries (Workers cannot)
function canSubmitSpaces() {
    const user = getCurrentUser();
    if (!user) return false;
    
    return user.role !== 'Worker' && user.role !== 'Principal' && user.role !== 'Management Staff';
}

// Check if user is management (can see dashboard)
function isManagement() {
    const user = getCurrentUser();
    if (!user) return false;
    
    return user.role === 'Principal' || user.role === 'Management Staff';
}

// Protect pages that require authentication
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Redirect to appropriate page based on role after login
function redirectAfterLogin() {
    window.location.href = 'profile.html';
}
