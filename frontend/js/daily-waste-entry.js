/**
 * Daily Waste Entry - JavaScript with Backend File Upload
 * Handles form submission, photo uploads via backend, and data validation
 */

// Configuration
const API_URL = API_CONFIG?.BASE_URL || 'https://school-management-system-wico.onrender.com';

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
    
    if (!user.fullName) {
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

// Handle file processing - FIXED: Store files locally instead of uploading to Cloudinary
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

    // Store files locally for preview and later upload to backend
    imageFiles.forEach(file => {
        const photoData = {
            file: file,  // Store the actual File object
            originalName: file.name,
            preview: URL.createObjectURL(file)  // Create preview URL
        };
        uploadedPhotos.push(photoData);
        addPhotoPreview(photoData, uploadedPhotos.length - 1);
    });
    
    updatePhotoCount();
}

// Add photo preview - FIXED: Use local preview URL
function addPhotoPreview(photoData, index) {
    const preview = document.getElementById('photoPreview');
    
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.innerHTML = `
        <img src="${photoData.preview}" alt="Waste photo ${index + 1}">
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

// Remove photo - FIXED: Revoke object URL to prevent memory leaks
function removePhoto(index) {
    if (confirm('Remove this photo?')) {
        // Revoke object URL to prevent memory leaks
        if (uploadedPhotos[index].preview) {
            URL.revokeObjectURL(uploadedPhotos[index].preview);
        }
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

// Collect form data (for draft saving and potential other uses)
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

    const formData = {
        // User info
        userId: user._id || user.id,
        teacherName: document.getElementById('teacherName').value,
        userRole: user.role,
        classSection: document.getElementById('classSection')?.value || '',
        entryDate: document.getElementById('entryDate').value,

        // Waste data
        wasteData: {
            recyclable: {
                amount: parseFloat(document.getElementById('recyclableAmount').value) || 0,
                items: getCheckedValues('recyclableItems')
            },
            organic: {
                amount: parseFloat(document.getElementById('organicAmount').value) || 0,
                items: getCheckedValues('organicItems')
            },
            nonRecyclable: {
                amount: parseFloat(document.getElementById('nonRecyclableAmount').value) || 0
            }
        },

        // Total waste
        totalWaste: (
            (parseFloat(document.getElementById('recyclableAmount').value) || 0) +
            (parseFloat(document.getElementById('organicAmount').value) || 0) +
            (parseFloat(document.getElementById('nonRecyclableAmount').value) || 0)
        ),

        // Quality metrics
        separationStatus: document.querySelector('input[name="separationStatus"]:checked')?.value,
        paperManagement: getCheckedValues('paperManagement'),
        cleanlinessRating: selectedRating,

        // Photos (note: for backend upload, we use files directly in FormData)
        photos: uploadedPhotos.map(p => ({ originalName: p.originalName })),

        // Notes
        notes: document.getElementById('notes')?.value || '',
        urgencyLevel: document.getElementById('urgencyLevel')?.value || 'none',

        // Metadata
        submittedAt: new Date().toISOString(),
        status: 'submitted'
    };

    return formData;
}

// FIXED: Handle form submission with backend upload using FormData
async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    if (!confirm('Submit this daily waste entry?')) {
        return;
    }

    // Show loading
    document.getElementById('loadingOverlay').classList.add('active');
    document.getElementById('submitBtn').disabled = true;

    try {
        const user = JSON.parse(localStorage.getItem('userData') || localStorage.getItem('user') || '{}');
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Please login first');
        }

        // Get checked checkboxes
        const getCheckedValues = (name) => {
            return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`))
                .map(cb => cb.value);
        };

        // Create FormData with all form fields AND photos
        const formData = new FormData();
        
        // Add form fields
        formData.append('date', document.getElementById('entryDate').value);
        formData.append('paperWaste', parseFloat(document.getElementById('recyclableAmount').value) || 0);
        formData.append('plasticWaste', parseFloat(document.getElementById('organicAmount').value) || 0);
        formData.append('foodWaste', 0); // Add if you have this field
        formData.append('generalWaste', parseFloat(document.getElementById('nonRecyclableAmount').value) || 0);
        formData.append('wasProperlySegregated', 
            document.querySelector('input[name="separationStatus"]:checked')?.value === 'yes' ? 'true' : 'false');
        formData.append('classroomCleanliness', selectedRating);
        formData.append('additionalNotes', document.getElementById('notes')?.value || '');

        // Add all photos to FormData
        uploadedPhotos.forEach((photoData) => {
            formData.append('photos', photoData.file);
        });

        // Send as multipart/form-data to backend
        const response = await fetch(`${API_URL}/api/waste/daily`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // DON'T set Content-Type - browser will set it with multipart boundary
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
            alert('✅ Daily waste entry submitted successfully!');
            
            // Clear draft
            localStorage.removeItem('dailyWasteDraft');
            
            // Clean up object URLs
            uploadedPhotos.forEach(photo => {
                if (photo.preview) {
                    URL.revokeObjectURL(photo.preview);
                }
            });
            
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
    formData.photoCount = uploadedPhotos.length;
    
    localStorage.setItem('dailyWasteDraft', JSON.stringify(formData));
    alert('💾 Draft saved successfully! You can continue later.');
}

// Load draft if exists
function loadDraftIfExists() {
    const draft = localStorage.getItem('dailyWasteDraft');
    
    if (draft && confirm('Found a saved draft. Load it?')) {
        const data = JSON.parse(draft);
        
        // Load basic fields
        if (data.classSection) document.getElementById('classSection').value = data.classSection;
        if (data.entryDate) document.getElementById('entryDate').value = data.entryDate;
        
        // Load waste amounts
        if (data.wasteData) {
            if (data.wasteData.recyclable) {
                document.getElementById('recyclableAmount').value = data.wasteData.recyclable.amount || 0;
            }
            if (data.wasteData.organic) {
                document.getElementById('organicAmount').value = data.wasteData.organic.amount || 0;
            }
            if (data.wasteData.nonRecyclable) {
                document.getElementById('nonRecyclableAmount').value = data.wasteData.nonRecyclable.amount || 0;
            }
        }
        
        if (data.notes) document.getElementById('notes').value = data.notes;
        if (data.urgencyLevel) document.getElementById('urgencyLevel').value = data.urgencyLevel;

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

        // Note: Photos are not restored from draft (they're File objects, can't be serialized)
        if (data.photoCount && data.photoCount > 0) {
            alert(`Note: Your draft had ${data.photoCount} photos. Please re-upload them.`);
        }
    }
}

// Handle cancel
function handleCancel() {
    if (confirm('Discard this entry and return to dashboard?')) {
        // Clean up object URLs
        uploadedPhotos.forEach(photo => {
            if (photo.preview) {
                URL.revokeObjectURL(photo.preview);
            }
        });
        window.location.href = 'dashboard.html';
    }
}

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to logout? Unsaved changes will be lost.')) {
        // Clean up object URLs
        uploadedPhotos.forEach(photo => {
            if (photo.preview) {
                URL.revokeObjectURL(photo.preview);
            }
        });
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }
});
