// Unused Space Entry JavaScript
// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    loadUserInfo();
    setupPhotoUpload();
    setupFormHandlers();
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

function loadUserInfo() {
    // Try both possible storage keys for compatibility
    let user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!user.fullName) {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    }
    
    if (!user.fullName) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    // Fixed: Use 'user' instead of 'userData'
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

// Photo Upload Functionality
let uploadedPhotos = [];
const MAX_PHOTOS = 10;
const MIN_PHOTOS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function setupPhotoUpload() {
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoInput = document.getElementById('photoInput');
    const photoPreview = document.getElementById('photoPreview');

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

    validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const photoData = {
                file: file,
                dataUrl: e.target.result,
                id: Date.now() + Math.random()
            };
            uploadedPhotos.push(photoData);
            displayPhoto(photoData);
            updatePhotoCount();
        };
        reader.readAsDataURL(file);
    });
}

function displayPhoto(photoData) {
    const photoPreview = document.getElementById('photoPreview');
    
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.dataset.photoId = photoData.id;

    const img = document.createElement('img');
    img.src = photoData.dataUrl;
    img.alt = photoData.file.name;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-photo';
    removeBtn.innerHTML = '×';
    removeBtn.type = 'button';
    removeBtn.onclick = () => removePhoto(photoData.id);

    previewItem.appendChild(img);
    previewItem.appendChild(removeBtn);
    photoPreview.appendChild(previewItem);
}

function removePhoto(photoId) {
    uploadedPhotos = uploadedPhotos.filter(photo => photo.id !== photoId);
    
    const previewItem = document.querySelector(`[data-photo-id="${photoId}"]`);
    if (previewItem) {
        previewItem.remove();
    }
    
    updatePhotoCount();
}

function updatePhotoCount() {
    const photoCount = document.getElementById('photoCount');
    photoCount.textContent = `${uploadedPhotos.length} / ${MAX_PHOTOS} photos`;
    
    if (uploadedPhotos.length >= MIN_PHOTOS) {
        photoCount.style.background = '#21a300';
    } else {
        photoCount.style.background = '#dc3545';
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
            if (confirm('Are you sure you want to logout?')) {
                localStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }
}

function handleSubmit(e) {
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

    // Show loading overlay
    showLoadingOverlay();

    // Simulate photo upload progress
    simulateUpload(() => {
        // In a real application, this would send data to the server
        submitFormData(formData);
    });
}

function collectFormData() {
    const form = document.getElementById('unusedSpaceForm');
    const formData = new FormData(form);
    
    const data = {
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
        submittedBy: document.getElementById('userName').textContent,
        submittedRole: document.getElementById('userRole').textContent,
        submittedSection: document.getElementById('userSection').textContent,
        submittedDate: new Date().toISOString()
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

function simulateUpload(callback) {
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    
    uploadProgress.classList.add('active');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = progress + '%';
        progressBar.textContent = Math.round(progress) + '%';
        
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                uploadProgress.classList.remove('active');
                callback();
            }, 500);
        }
    }, 200);
}

function submitFormData(formData) {
    // In a real application, this would send to server via API
    console.log('Submitting Space Report:', formData);

    // Simulate API call
    setTimeout(() => {
        hideLoadingOverlay();
        
        // Show success message
        alert('✅ Space Report Submitted Successfully!\n\nThank you for helping us identify this unused space. Your report will be reviewed by the management team.');
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    }, 1500);
}

function saveDraft() {
    const formData = collectFormData();
    
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

// Check for draft on load
window.addEventListener('load', () => {
    loadDraft();
});

// Auto-save every 2 minutes
setInterval(() => {
    const formData = collectFormData();
    if (formData.buildingName || formData.specificLocation) {
        localStorage.setItem('unusedSpaceAutoSave', JSON.stringify(formData));
        console.log('Auto-saved at', new Date().toLocaleTimeString());
    }
}, 120000);
