/**
 * Unused Space Entry - JavaScript with Cloudinary Integration
 * FIXED: Proper API integration, consistent user handling, and photo upload
 */

// Configuration
const API_URL = 'https://school-management-system-wico.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dsrshx2gz';
const CLOUDINARY_UPLOAD_PRESET = 'echotrack_unused_space';

// Photo Upload State
let uploadedPhotos = [];
const MAX_PHOTOS = 10;
const MIN_PHOTOS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    loadUserInfo();
    setupPhotoUpload();
    setupFormHandlers();
    loadDraft();
});

// Initialize form with current date and user info
function initializeForm() {
    const dateElement = document.getElementById('currentDate');
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    dateElement.textContent = formattedDate;
}

// FIXED: Consistent user data loading
function loadUserInfo() {
    // Try both possible storage keys for compatibility
    let user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Fallback to 'user' key if userData doesn't exist
    if (!user.fullName) {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    }
    
    if (!user.fullName) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('userName').textContent = user.fullName;
    document.getElementById('userRole').textContent = getRoleDisplay(user.role);
    document.getElementById('userSection').textContent = user.section || 'N/A';
}

// Add role display helper
function getRoleDisplay(role) {
    const roleMap = {
        'teacher': 'Teacher',
        'lab_assistant': 'Laboratory Assistant',
        'section_head': 'Section Head',
        'non_academic_staff': 'Non-Academic Staff',
        'admin': 'Administrator'
    };
    return roleMap[role] || role;
}

// FIXED: Photo Upload with Cloudinary Integration
function setupPhotoUpload() {
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoInput = document.getElementById('photoInput');

    // Click to upload
    photoUploadArea.addEventListener('click', () => {
        photoInput.click();
    });

    // File input change
    photoInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    photoUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        photoUploadArea.style.borderColor = '#114814';
        photoUploadArea.style.background = 'linear-gradient(135deg, rgba(33, 163, 0, 0.15), rgba(17, 72, 20, 0.15))';
    });

    photoUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        photoUploadArea.style.borderColor = '#21a300';
        photoUploadArea.style.background = 'linear-gradient(135deg, rgba(33, 163, 0, 0.05), rgba(17, 72, 20, 0.05))';
    });

    photoUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        photoUploadArea.style.borderColor = '#21a300';
        photoUploadArea.style.background = 'linear-gradient(135deg, rgba(33, 163, 0, 0.05), rgba(17, 72, 20, 0.05))';
        
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

function handleFiles(files) {
    const validFiles = files.filter(file => {
        // Check file type
        if (!file.type.startsWith('image/')) {
            alert(`${file.name} is not an image file.`);
            return false;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            alert(`${file.name} is too large. Maximum size is 5MB.`);
            return false;
        }

        return true;
    });

    // Check total photo count
    if (uploadedPhotos.length + validFiles.length > MAX_PHOTOS) {
        alert(`You can only upload up to ${MAX_PHOTOS} photos. You currently have ${uploadedPhotos.length}.`);
        return;
    }

    // Upload each file to Cloudinary
    validFiles.forEach(file => uploadToCloudinary(file));
}

// FIXED: Upload to Cloudinary instead of base64
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'echotrack/unused-spaces');

    // Show progress
    const progressContainer = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    progressContainer.classList.add('active');

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData
            }
        );

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const data = await response.json();

        // Add to uploaded photos
        const photoData = {
            url: data.secure_url,
            publicId: data.public_id,
            originalName: file.name,
            uploadedAt: new Date().toISOString()
        };

        uploadedPhotos.push(photoData);
        displayPhoto(photoData);
        updatePhotoCount();

        // Update progress
        const progress = Math.round((uploadedPhotos.length / MAX_PHOTOS) * 100);
        progressBar.style.width = progress + '%';
        progressBar.textContent = progress + '%';

    } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to upload ${file.name}. Please try again.`);
    } finally {
        // Hide progress after a delay
        setTimeout(() => {
            if (uploadedPhotos.length === 0) {
                progressContainer.classList.remove('active');
            }
        }, 1000);
    }
}

function displayPhoto(photoData) {
    const photoPreview = document.getElementById('photoPreview');
    
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.dataset.photoId = photoData.publicId;

    const img = document.createElement('img');
    img.src = photoData.url;
    img.alt = photoData.originalName;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-photo';
    removeBtn.innerHTML = '×';
    removeBtn.type = 'button';
    removeBtn.onclick = () => removePhoto(photoData.publicId);

    previewItem.appendChild(img);
    previewItem.appendChild(removeBtn);
    photoPreview.appendChild(previewItem);
}

function removePhoto(photoId) {
    uploadedPhotos = uploadedPhotos.filter(photo => photo.publicId !== photoId);
    
    const previewItem = document.querySelector(`[data-photo-id="${photoId}"]`);
    if (previewItem) {
        previewItem.remove();
    }
    
    updatePhotoCount();
}

// FIXED: Use CSS classes instead of inline styles
function updatePhotoCount() {
    const photoCount = document.getElementById('photoCount');
    photoCount.textContent = `${uploadedPhotos.length} / ${MAX_PHOTOS} photos`;
    
    photoCount.classList.remove('warning', 'error', 'success');
    if (uploadedPhotos.length < MIN_PHOTOS) {
        photoCount.classList.add('error');
    } else if (uploadedPhotos.length >= MIN_PHOTOS && uploadedPhotos.length < MAX_PHOTOS) {
        photoCount.classList.add('success');
    } else if (uploadedPhotos.length === MAX_PHOTOS) {
        photoCount.classList.add('warning');
    }
}

// Form Handlers
function setupFormHandlers() {
    const form = document.getElementById('unusedSpaceForm');
    const submitBtn = document.getElementById('submitBtn');
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    // Form submission
    form.addEventListener('submit', handleSubmit);

    // Save draft
    saveDraftBtn.addEventListener('click', saveDraft);

    // Cancel
    cancelBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            window.location.href = 'dashboard.html';
        }
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout? Unsaved changes will be lost.')) {
                localStorage.removeItem('user');
                localStorage.removeItem('userData');
                localStorage.removeItem('token');
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
            }
        });
    }
}

// FIXED: Proper form submission with API integration
async function handleSubmit(e) {
    e.preventDefault();

    // Validate photos
    if (uploadedPhotos.length < MIN_PHOTOS) {
        alert(`Please upload at least ${MIN_PHOTOS} photos to help us visualize the space.`);
        document.getElementById('photoUploadArea').scrollIntoView({ behavior: 'smooth' });
        return;
    }

    // Collect form data
    const formData = collectFormData();

    // Validate required fields
    if (!validateForm(formData)) {
        return;
    }

    if (!confirm('Submit this unused space report?')) {
        return;
    }

    // Show loading overlay
    showLoadingOverlay();

    try {
        // FIXED: Actual API submission
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const response = await fetch(`${API_URL}/spaces/unused`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Unused Space Report Submitted Successfully!\n\nThank you for helping us identify this unused space. Your report will be reviewed by the management team.');
            
            // Clear drafts
            localStorage.removeItem('unusedSpaceDraft');
            localStorage.removeItem('unusedSpaceDraftDate');
            localStorage.removeItem('unusedSpaceAutoSave');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            throw new Error(data.message || 'Submission failed');
        }

    } catch (error) {
        console.error('Submission error:', error);
        alert('❌ Failed to submit report: ' + error.message);
    } finally {
        hideLoadingOverlay();
    }
}

// FIXED: Proper user data collection
function collectFormData() {
    const form = document.getElementById('unusedSpaceForm');
    const formData = new FormData(form);
    
    // Get user data with proper fallback
    let user = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!user._id && !user.id) {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    }
    
    const data = {
        // User info
        userId: user._id || user.id,
        submittedBy: document.getElementById('userName').textContent,
        submittedRole: document.getElementById('userRole').textContent,
        submittedSection: document.getElementById('userSection').textContent,
        
        // Location Information
        buildingName: formData.get('buildingName'),
        floorNumber: formData.get('floorNumber'),
        roomNumber: formData.get('roomNumber'),
        nearLocation: formData.get('nearLocation'),
        specificLocation: formData.get('specificLocation'),

        // Space Type
        spaceType: formData.get('spaceType'),
        otherSpaceType: formData.get('otherSpaceType'),

        // Size
        spaceSize: formData.get('spaceSize'),
        estimatedLength: formData.get('estimatedLength'),
        estimatedWidth: formData.get('estimatedWidth'),

        // Current Usage
        currentUsage: formData.get('currentUsage'),
        usageDescription: formData.get('usageDescription'),
        lastUsedDate: formData.get('lastUsedDate'),

        // Condition
        spaceCondition: formData.get('spaceCondition'),
        spaceIssues: formData.getAll('spaceIssues'),
        conditionDetails: formData.get('conditionDetails'),

        // Facilities
        facilities: formData.getAll('facilities'),
        facilitiesNotes: formData.get('facilitiesNotes'),

        // Potential Uses
        potentialUses: formData.getAll('potentialUses'),
        suggestionDetails: formData.get('suggestionDetails'),
        priority: formData.get('priority'),

        // Required Resources
        cleaningNeeds: formData.get('cleaningNeeds'),
        repairNeeds: formData.get('repairNeeds'),
        furnitureNeeds: formData.get('furnitureNeeds'),
        estimatedBudget: formData.get('estimatedBudget'),

        // Additional
        additionalNotes: formData.get('additionalNotes'),
        contactPerson: formData.get('contactPerson'),

        // Photos
        photos: uploadedPhotos,

        // Metadata
        submittedDate: new Date().toISOString(),
        status: 'submitted'
    };

    return data;
}

function validateForm(formData) {
    // Check required text fields
    const requiredFields = [
        { field: 'buildingName', label: 'Building Name' },
        { field: 'floorNumber', label: 'Floor Number' },
        { field: 'nearLocation', label: 'Near/Adjacent To' },
        { field: 'specificLocation', label: 'Detailed Location Description' },
        { field: 'spaceType', label: 'Space Type' },
        { field: 'spaceSize', label: 'Space Size' },
        { field: 'currentUsage', label: 'Current Usage' },
        { field: 'usageDescription', label: 'Usage Description' },
        { field: 'spaceCondition', label: 'Space Condition' },
        { field: 'suggestionDetails', label: 'Detailed Suggestions' }
    ];

    for (let req of requiredFields) {
        if (!formData[req.field] || formData[req.field].trim() === '') {
            alert(`Please fill in the required field: ${req.label}`);
            const element = document.querySelector(`[name="${req.field}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
            return false;
        }
    }

    return true;
}

function saveDraft() {
    const formData = collectFormData();
    formData.status = 'draft';
    
    // Save to localStorage
    localStorage.setItem('unusedSpaceDraft', JSON.stringify(formData));
    localStorage.setItem('unusedSpaceDraftDate', new Date().toISOString());
    
    alert('💾 Draft saved successfully!\n\nYou can continue editing this form later.');
}

function loadDraft() {
    const draft = localStorage.getItem('unusedSpaceDraft');
    if (draft) {
        const shouldLoad = confirm('A saved draft was found. Would you like to load it?');
        if (shouldLoad) {
            const data = JSON.parse(draft);
            populateForm(data);
            
            // Load photos
            if (data.photos && data.photos.length > 0) {
                uploadedPhotos = data.photos;
                data.photos.forEach(photo => displayPhoto(photo));
                updatePhotoCount();
            }
        }
    }
}

function populateForm(data) {
    // Populate text inputs
    for (let key in data) {
        const element = document.querySelector(`[name="${key}"]`);
        if (element && typeof data[key] === 'string') {
            element.value = data[key];
        }
    }

    // Populate checkboxes
    if (data.spaceIssues) {
        data.spaceIssues.forEach(value => {
            const checkbox = document.querySelector(`[name="spaceIssues"][value="${value}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    if (data.facilities) {
        data.facilities.forEach(value => {
            const checkbox = document.querySelector(`[name="facilities"][value="${value}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }

    if (data.potentialUses) {
        data.potentialUses.forEach(value => {
            const checkbox = document.querySelector(`[name="potentialUses"][value="${value}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
}

function showLoadingOverlay() {
    document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoadingOverlay() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// Auto-save every 2 minutes
setInterval(() => {
    const formData = collectFormData();
    if (formData.buildingName || formData.specificLocation) {
        localStorage.setItem('unusedSpaceAutoSave', JSON.stringify(formData));
        console.log('Auto-saved at', new Date().toLocaleTimeString());
    }
}, 120000);
