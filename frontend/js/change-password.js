/**
 * Change Password - JavaScript
 * Handles password change functionality with validation and API integration
 */

// Configuration
const API_URL = 'http://localhost:5000/api';

// DOM Elements
let currentPasswordInput;
let newPasswordInput;
let confirmPasswordInput;
let changePasswordForm;
let errorMessageDiv;
let successMessageDiv;
let strengthBar;
let strengthText;

// Password strength rules
const passwordRules = {
    length: { test: (pwd) => pwd.length >= 8, element: null },
    uppercase: { test: (pwd) => /[A-Z]/.test(pwd), element: null },
    lowercase: { test: (pwd) => /[a-z]/.test(pwd), element: null },
    number: { test: (pwd) => /[0-9]/.test(pwd), element: null },
    special: { test: (pwd) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd), element: null }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    checkAuthentication();
});

// Initialize DOM elements
function initializeElements() {
    currentPasswordInput = document.getElementById('currentPassword');
    newPasswordInput = document.getElementById('newPassword');
    confirmPasswordInput = document.getElementById('confirmPassword');
    changePasswordForm = document.getElementById('changePasswordForm');
    errorMessageDiv = document.getElementById('errorMessage');
    successMessageDiv = document.getElementById('successMessage');
    strengthBar = document.getElementById('strengthBar');
    strengthText = document.getElementById('strengthText');

    // Get rule elements
    passwordRules.length.element = document.getElementById('rule-length');
    passwordRules.uppercase.element = document.getElementById('rule-uppercase');
    passwordRules.lowercase.element = document.getElementById('rule-lowercase');
    passwordRules.number.element = document.getElementById('rule-number');
    passwordRules.special.element = document.getElementById('rule-special');
}

// Setup event listeners
function setupEventListeners() {
    // Form submission
    changePasswordForm.addEventListener('submit', handlePasswordChange);

    // Password strength check
    newPasswordInput.addEventListener('input', () => {
        checkPasswordStrength(newPasswordInput.value);
        checkPasswordMatch();
    });

    // Confirm password match
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);

    // Toggle password visibility
    setupPasswordToggles();

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Setup password visibility toggles
function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                button.classList.add('active');
            } else {
                input.type = 'password';
                button.classList.remove('active');
            }
        });
    });
}

// Check if user is authenticated
function checkAuthentication() {
    const user = JSON.parse(localStorage.getItem('userData') || localStorage.getItem('user') || '{}');
    
    if (!user.email) {
        showError('You must be logged in to change your password.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
}

// Check password strength
function checkPasswordStrength(password) {
    let strength = 0;
    let strengthLevel = '';
    let strengthColor = '';

    // Check each rule
    for (const [key, rule] of Object.entries(passwordRules)) {
        const passed = rule.test(password);
        
        if (passed) {
            strength += 20;
            rule.element.classList.add('valid');
            rule.element.querySelector('.rule-icon').textContent = '✓';
        } else {
            rule.element.classList.remove('valid');
            rule.element.querySelector('.rule-icon').textContent = '○';
        }
    }

    // Determine strength level
    if (strength === 0) {
        strengthLevel = '';
        strengthColor = '';
    } else if (strength <= 40) {
        strengthLevel = 'Weak';
        strengthColor = '#dc3545';
    } else if (strength <= 60) {
        strengthLevel = 'Fair';
        strengthColor = '#ffc107';
    } else if (strength <= 80) {
        strengthLevel = 'Good';
        strengthColor = '#28a745';
    } else {
        strengthLevel = 'Strong';
        strengthColor = '#21a300';
    }

    // Update strength bar
    strengthBar.style.width = strength + '%';
    strengthBar.style.backgroundColor = strengthColor;
    strengthText.textContent = strengthLevel;
    strengthText.style.color = strengthColor;
}

// Check if passwords match
function checkPasswordMatch() {
    const newPwd = newPasswordInput.value;
    const confirmPwd = confirmPasswordInput.value;

    if (confirmPwd.length > 0) {
        if (newPwd === confirmPwd) {
            confirmPasswordInput.style.borderColor = '#28a745';
        } else {
            confirmPasswordInput.style.borderColor = '#dc3545';
        }
    } else {
        confirmPasswordInput.style.borderColor = '#e0e0e0';
    }
}

// Validate password
function validatePassword(password) {
    const errors = [];

    for (const [key, rule] of Object.entries(passwordRules)) {
        if (!rule.test(password)) {
            switch(key) {
                case 'length':
                    errors.push('Password must be at least 8 characters long');
                    break;
                case 'uppercase':
                    errors.push('Password must contain at least one uppercase letter');
                    break;
                case 'lowercase':
                    errors.push('Password must contain at least one lowercase letter');
                    break;
                case 'number':
                    errors.push('Password must contain at least one number');
                    break;
                case 'special':
                    errors.push('Password must contain at least one special character');
                    break;
            }
        }
    }

    return errors;
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    // Clear previous messages
    clearMessages();

    // Get form values
    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Validate inputs
    if (!currentPassword) {
        showError('Please enter your current password');
        currentPasswordInput.focus();
        return;
    }

    if (!newPassword) {
        showError('Please enter a new password');
        newPasswordInput.focus();
        return;
    }

    if (!confirmPassword) {
        showError('Please confirm your new password');
        confirmPasswordInput.focus();
        return;
    }

    // Validate password strength
    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
        showError(passwordErrors.join('. '));
        return;
    }

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        confirmPasswordInput.focus();
        return;
    }

    // Check if new password is different from current
    if (currentPassword === newPassword) {
        showError('New password must be different from current password');
        newPasswordInput.focus();
        return;
    }

    // Get user data
    const user = JSON.parse(localStorage.getItem('userData') || localStorage.getItem('user') || '{}');
    
    if (!user.email) {
        showError('User session not found. Please login again.');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }

    // Show loading state
    const submitBtn = changePasswordForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';

    try {
        // Make API call to change password
        const response = await fetch(`${API_URL}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: user.email,
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showSuccess('Password changed successfully! Redirecting to profile...');
            
            // Clear form
            changePasswordForm.reset();
            
            // Reset password strength
            strengthBar.style.width = '0%';
            strengthText.textContent = '';
            
            // Reset rule indicators
            for (const rule of Object.values(passwordRules)) {
                rule.element.classList.remove('valid');
                rule.element.querySelector('.rule-icon').textContent = '○';
            }

            // Redirect to profile after 2 seconds
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);
        } else {
            showError(data.message || 'Failed to change password. Please try again.');
        }
    } catch (error) {
        console.error('Password change error:', error);
        showError('An error occurred. Please check your current password and try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

// Show error message
function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    successMessageDiv.style.display = 'none';
    
    // Scroll to message
    errorMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Show success message
function showSuccess(message) {
    successMessageDiv.textContent = message;
    successMessageDiv.style.display = 'block';
    errorMessageDiv.style.display = 'none';
    
    // Scroll to message
    successMessageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Clear messages
function clearMessages() {
    errorMessageDiv.style.display = 'none';
    successMessageDiv.style.display = 'none';
    errorMessageDiv.textContent = '';
    successMessageDiv.textContent = '';
}

// Handle logout
function handleLogout(e) {
    e.preventDefault();
    
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// Prevent form resubmission on page refresh
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
