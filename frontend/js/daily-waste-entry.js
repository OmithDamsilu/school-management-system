/**
 * Daily Waste Entry - JavaScript with Cloudinary Integration
 * Handles form submission, photo uploads, and data validation
 */

// Configuration
const API_URL = 'https://school-management-system-wico.onrender.com';
const CLOUDINARY_CLOUD_NAME = 'dsrshx2gz'; // Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = 'echotrack daily'; // Replace with your upload preset

// State Management
let uploadedPhotos = [];
let selectedRating = 0;
const MAX_PHOTOS = 5;
const MIN_PHOTOS = 2;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    setCurrentDate();
    initializeEventListeners();
    loadDraftIfExists();
});

// Load user information
function loadUserInfo() {
    // Try both possible storage keys for compatibility
    let user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    // Fallback to 'user' key if userData doesn't exist
    if (!user.fullName) {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    }
    
    if (!user.fullName) {  // ✅ Fixed: was 'userData.fullName'
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('userName').textContent = user.fullName;
    document.getElementById('userRole').textContent = getRoleDisplay(user.role);
    document.getElementById('teacherName').value = user.fullName;
}

// Get role display name
function getRoleDisplay(role) {
    const roleMap = {
        'teacher': 'Class Teacher',
        'lab_assistant': 'Laboratory Assistant',
        'section_head': 'Section Head',
        'non_academic_staff': 'Non-Academic Staff'
    };
    return roleMap[role] || role;
}

// Set current date
function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    const entryDateInput = document.getElementById('entryDate');
    entryDateInput.value = today;
    entryDateInput.max = today; // Prevent future dates

    // Display formatted date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', options);
}

// Initialize all event listeners
function initializeEventListeners() {
    // Photo upload
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoInput = document.getElementById('photoInput');

    photoUploadArea.addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', handlePhotoSelection);

    // Drag and drop
    photoUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        photoUploadArea.style.borderColor = '#114814';
    });

    photoUploadArea.addEventListener('dragleave', () => {
        photoUploadArea.style.borderColor = '#21a300';
    });

    photoUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        photoUploadArea.style.borderColor = '#21a300';
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    });

    // Star rating
    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            setRating(rating);
        });

        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            highlightStars(rating);
        });
    });

    document.getElementById('cleanlinessRating').addEventListener('mouseleave', () => {
        highlightStars(selectedRating);
    });

    // Form actions
    document.getElementById('dailyWasteForm').addEventListener('submit', handleSubmit);
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
    document.getElementById('cancelBtn').addEventListener('click', handleCancel);
}

// Handle photo selection
function handlePhotoSelection(e) {
    const files = Array.from(e.target.files);
    handleFiles(files);
}

// Handle file processing
function handleFiles(files) {
    // Filter valid image files
    const imageFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
            alert(`${file.name} is not an image file`);
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            alert(`${file.name} exceeds 5MB limit`);
            return false;
        }
        return true;
    });

    // Check total photo limit
    const totalPhotos = uploadedPhotos.length + imageFiles.length;
    if (totalPhotos > MAX_PHOTOS) {
        alert(`Maximum ${MAX_PHOTOS} photos allowed. You're trying to add ${imageFiles.length} photos but already have ${uploadedPhotos.length}.`);
        return;
    }

    // Upload each file to Cloudinary
    imageFiles.forEach(file => uploadToCloudinary(file));
}

// Upload photo to Cloudinary
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'echotrack/daily-waste');

    // Show progress
    const progressContainer = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    progressContainer.style.display = 'block';

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
        addPhotoPreview(photoData, uploadedPhotos.length - 1);
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
                progressContainer.style.display = 'none';
            }
        }, 1000);
    }
}

// Add photo preview
function addPhotoPreview(photoData, index) {
    const preview = document.getElementById('photoPreview');
    
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.innerHTML = `
        <img src="${photoData.url}" alt="Waste photo ${index + 1}">
        <button type="button" class="remove-photo" data-index="${index}">×</button>
        <div class="photo-info">
            ${photoData.originalName}
        </div>
    `;

    // Add remove listener
    previewItem.querySelector('.remove-photo').addEventListener('click', () => {
        removePhoto(index);
    });

    preview.appendChild(previewItem);
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
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = '';
    uploadedPhotos.forEach((photo, index) => {
        addPhotoPreview(photo, index);
    });
}

// Update photo count badge
function updatePhotoCount() {
    const badge = document.getElementById('photoCount');
    const count = uploadedPhotos.length;
    badge.textContent = `${count} / ${MAX_PHOTOS} photos`;

    // Update badge color based on count
    badge.classList.remove('warning', 'error', 'success');
    if (count < MIN_PHOTOS) {
        badge.classList.add('error');
    } else if (count >= MIN_PHOTOS && count < MAX_PHOTOS) {
        badge.classList.add('success');
    } else if (count === MAX_PHOTOS) {
        badge.classList.add('warning');
    }
}

// Star rating functions
function setRating(rating) {
    selectedRating = rating;
    document.getElementById('cleanlinessValue').value = rating;
    highlightStars(rating);
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Form validation
function validateForm() {
    // Check required fields
    const form = document.getElementById('dailyWasteForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }

    // Check cleanliness rating
    if (selectedRating === 0) {
        alert('Please rate the cleanliness (1-5 stars)');
        document.getElementById('cleanlinessRating').scrollIntoView({ behavior: 'smooth' });
        return false;
    }

    // Check minimum photos
    if (uploadedPhotos.length < MIN_PHOTOS) {
        alert(`Please upload at least ${MIN_PHOTOS} photos`);
        document.getElementById('photoUploadArea').scrollIntoView({ behavior: 'smooth' });
        return false;
    }

    // Validate waste amounts
    const recyclable = parseFloat(document.getElementById('recyclableAmount').value) || 0;
    const organic = parseFloat(document.getElementById('organicAmount').value) || 0;
    const nonRecyclable = parseFloat(document.getElementById('nonRecyclableAmount').value) || 0;

    if (recyclable === 0 && organic === 0 && nonRecyclable === 0) {
        alert('Please enter waste amounts for at least one category');
        return false;
    }

    return true;
}

// Collect form data - FIXED to match backend schema
function collectFormData() {
const user = JSON.parse(localStorage.getItem('userData') || '{}');
if (!user._id && !user.id) {
    user = JSON.parse(localStorage.getItem('user') || '{}');
}
    
    // Get checked checkboxes
    const getCheckedValues = (name) => {
        return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
            .map(cb => cb.value);
    };

    // Get waste amounts
    const recyclableAmount = parseFloat(document.getElementById('recyclableAmount').value) || 0;
    const organicAmount = parseFloat(document.getElementById('organicAmount').value) || 0;
    const nonRecyclableAmount = parseFloat(document.getElementById('nonRecyclableAmount').value) || 0;
    
    // Map recyclable items to paper/plastic
    const recyclableItems = getCheckedValues('recyclableItems');
    let paperWaste = 0;
    let plasticWaste = 0;
    
    if (recyclableItems.includes('paper') || recyclableItems.includes('cardboard')) {
        paperWaste = recyclableAmount * 0.5;
    }
    if (recyclableItems.includes('plastic') || recyclableItems.includes('bottles')) {
        plasticWaste = recyclableAmount * 0.5;
    }
    if (recyclableItems.length === 1) {
        if (recyclableItems.includes('paper') || recyclableItems.includes('cardboard')) {
            paperWaste = recyclableAmount;
            plasticWaste = 0;
        } else {
            plasticWaste = recyclableAmount;
            paperWaste = 0;
        }
    }

    // Map separation status to boolean
    const separationStatus = document.querySelector('input[name="separationStatus"]:checked')?.value;
    const wasProperlySegregated = separationStatus === 'properly_separated';

    // Map star rating to cleanliness enum
    const cleanlinessMap = {
        1: 'Poor',
        2: 'Fair',
        3: 'Fair',
        4: 'Good',
        5: 'Excellent'
    };

    const formData = {
        date: document.getElementById('entryDate').value,
        paperWaste: paperWaste,
        plasticWaste: plasticWaste,
        foodWaste: organicAmount,
        generalWaste: nonRecyclableAmount,
        wasProperlySegregated: wasProperlySegregated,
        classroomCleanliness: cleanlinessMap[selectedRating],
        additionalNotes: document.getElementById('notes').value || '',
        photos: uploadedPhotos.map(photo => photo.url)
    };

    return formData;
}

// Handle form submission - FIXED API endpoint
async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    if (!confirm('Submit this daily waste entry?')) {
        return;
    }

    const formData = collectFormData();

    // Show loading
    document.getElementById('loadingOverlay').classList.add('active');
    document.getElementById('submitBtn').disabled = true;

    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/waste/daily`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Daily waste entry submitted successfully!');
            
            // Clear draft
            localStorage.removeItem('dailyWasteDraft');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            throw new Error(data.message || 'Submission failed');
        }

    } catch (error) {
        console.error('Submission error:', error);
        alert('❌ Failed to submit entry: ' + error.message);
    } finally {
        document.getElementById('loadingOverlay').classList.remove('active');
        document.getElementById('submitBtn').disabled = false;
    }
}

// Save draft
function saveDraft() {
    const formData = collectFormData();
    formData.status = 'draft';
    
    localStorage.setItem('dailyWasteDraft', JSON.stringify(formData));
    alert('💾 Draft saved successfully! You can continue later.');
}

// Load draft if exists
function loadDraftIfExists() {
    const draft = localStorage.getItem('dailyWasteDraft');
    
    if (draft && confirm('Found a saved draft. Load it?')) {
        const data = JSON.parse(draft);
        
        // Load basic fields
        document.getElementById('classSection').value = data.classSection || '';
        document.getElementById('recyclableAmount').value = data.wasteData?.recyclable?.amount || 0;
        document.getElementById('organicAmount').value = data.wasteData?.organic?.amount || 0;
        document.getElementById('nonRecyclableAmount').value = data.wasteData?.nonRecyclable?.amount || 0;
        document.getElementById('notes').value = data.notes || '';
        document.getElementById('urgencyLevel').value = data.urgencyLevel || 'none';

        // Load checkboxes
        if (data.wasteData?.recyclable?.items) {
            data.wasteData.recyclable.items.forEach(item => {
                const checkbox = document.querySelector(`input[name="recyclableItems"][value="${item}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        if (data.wasteData?.organic?.items) {
            data.wasteData.organic.items.forEach(item => {
                const checkbox = document.querySelector(`input[name="organicItems"][value="${item}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        if (data.paperManagement) {
            data.paperManagement.forEach(item => {
                const checkbox = document.querySelector(`input[name="paperManagement"][value="${item}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // Load radio
        if (data.separationStatus) {
            const radio = document.querySelector(`input[name="separationStatus"][value="${data.separationStatus}"]`);
            if (radio) radio.checked = true;
        }

        // Load rating
        if (data.cleanlinessRating) {
            setRating(data.cleanlinessRating);
        }

        // Load photos
        if (data.photos && data.photos.length > 0) {
            uploadedPhotos = data.photos;
            refreshPhotoPreview();
            updatePhotoCount();
        }
    }
}

// Handle cancel
function handleCancel() {
    if (confirm('Discard this entry and return to dashboard?')) {
        window.location.href = 'dashboard.html';
    }
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to logout? Unsaved changes will be lost.')) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
});
