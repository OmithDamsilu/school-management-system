/**
 * Unused Space Entry - JavaScript with Base64 Photo Storage to MongoDB
 * FIXED: Proper Base64 upload matching daily-waste.js pattern
 */

// Configuration
const API_URL = 'https://school-management-system-wico.onrender.com';

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

// Load user information
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

// Photo Upload Setup
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

    // Upload each file to Base64
    validFiles.forEach(file => convertToBase64(file));
}

// Image compression function
function compressImage(file, maxWidth = 1200, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Compression failed'));
                        }
                    },
                    file.type || 'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Image load failed'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
    });
}

// Convert photo to Base64 (matching daily-waste.js pattern)
async function convertToBase64(file) {
    const progressContainer = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    progressContainer.classList.add('active');

    try {
        console.log(`📸 Processing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
        
        // Compress image
        const compressedBlob = await compressImage(file);
        console.log(`✅ Compressed to ${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`);
        
        // Convert to Base64
        const base64String = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(compressedBlob);
        });

        const photoData = {
            data: base64String,
            originalName: file.name,
            mimeType: file.type,
            size: compressedBlob.size,
            uploadedAt: new Date().toISOString()
        };

        uploadedPhotos.push(photoData);
        displayPhoto(photoData, uploadedPhotos.length - 1);
        updatePhotoCount();

        const progress = Math.round((uploadedPhotos.length / MAX_PHOTOS) * 100);
        progressBar.style.width = progress + '%';
        progressBar.textContent = progress + '%';

    } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to process ${file.name}: ${error.message}`);
    } finally {
        setTimeout(() => {
            if (uploadedPhotos.length === 0) {
                progressContainer.classList.remove('active');
            }
        }, 1000);
    }
}

// Display photo preview
function displayPhoto(photoData, index) {
    const photoPreview = document.getElementById('photoPreview');
    
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.dataset.photoIndex = index;

    const img = document.createElement('img');
    img.src = photoData.data;  // Uses Base64 data
    img.alt = photoData.originalName;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-photo';
    removeBtn.innerHTML = '×';
    removeBtn.type = 'button';
    removeBtn.onclick = () => removePhoto(index);

    const photoInfo = document.createElement('div');
    photoInfo.className = 'photo-info';
    photoInfo.textContent = photoData.originalName;

    previewItem.appendChild(img);
    previewItem.appendChild(removeBtn);
    previewItem.appendChild(photoInfo);
    photoPreview.appendChild(previewItem);
}

// Remove photo
function removePhoto(index) {
    if (confirm('Remove this photo?')) {
        uploadedPhotos.splice(index, 1);
        refreshPhotoPreview();
        updatePhotoCount();
    }
}

// Refresh photo preview
function refreshPhotoPreview() {
    const photoPreview = document.getElementById('photoPreview');
    photoPreview.innerHTML = '';
    uploadedPhotos.forEach((photo, idx) => {
        displayPhoto(photo, idx);
    });
}

// Update photo count
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

// Handle form submission (FIXED TO MATCH DAILY WASTE PATTERN)
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
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        console.log('📤 Submitting to:', `${API_URL}/api/spaces/unused`);
        console.log('📊 Payload summary:', {
            buildingName: formData.buildingName,
            spaceType: formData.spaceType,
            photosCount: formData.photos.length,
            photoSizes: formData.photos.map(p => `${(p.size / 1024).toFixed(1)}KB`)
        });
        
        const response = await fetch(`${API_URL}/api/spaces/unused`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('❌ Failed to parse response:', parseError);
            throw new Error('Invalid server response');
        }
        
        console.log('📥 Server response:', data);

        if (response.ok) {
            alert('✅ Unused Space Report Submitted Successfully!\n\nThank you for helping us identify this unused space. Your report will be reviewed by the management team.');
            
            // Clear drafts
            localStorage.removeItem('unusedSpaceDraft');
            localStorage.removeItem('unusedSpaceDraftDate');
            localStorage.removeItem('unusedSpaceAutoSave');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            throw new Error(data.message || data.error || `Server error (${response.status})`);
        }

    } catch (error) {
        console.error('❌ Submission error:', error);
        
        let errorMessage = 'Failed to submit report: ';
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Cannot reach server. Check your internet connection.';
        } else if (error.message.includes('413') || error.message.includes('too large')) {
            errorMessage += 'Files too large. Try fewer or smaller photos.';
        } else if (error.message.includes('401') || error.message.includes('token')) {
            errorMessage += 'Session expired. Please login again.';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            errorMessage += error.message;
        }
        
        alert('❌ ' + errorMessage);
    } finally {
        hideLoadingOverlay();
    }
}

// Collect form data (MATCHING BACKEND SCHEMA)
function collectFormData() {
    const form = document.getElementById('unusedSpaceForm');
    const formData = new FormData(form);
    
    // Get user data with proper fallback
    let user = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!user._id && !user.id) {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    }
    
    const data = {
        // User info (NOT NEEDED - backend gets from token)
        // userId: user._id || user.id,
        
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
        estimatedLength: parseFloat(formData.get('estimatedLength')) || undefined,
        estimatedWidth: parseFloat(formData.get('estimatedWidth')) || undefined,

        // Current Usage
        currentUsage: formData.get('currentUsage'),
        usageDescription: formData.get('usageDescription'),
        lastUsedDate: formData.get('lastUsedDate') || undefined,

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

        // Photos (Base64 format)
        photos: uploadedPhotos
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
        { field: 'suggestionDetails', label: 'Detailed Suggestions' },
        { field: 'priority', label: 'Priority Level' }
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
                refreshPhotoPreview();
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
