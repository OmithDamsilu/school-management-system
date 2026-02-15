/**
 * Outdoor Waste Entry - JavaScript for Workers
 * Handles outdoor area waste collection (gardens, playgrounds, corridors, etc.)
 * This is different from classroom waste entry
 */

// Configuration
const API_URL = 'https://school-management-system-wico.onrender.com';

// State Management
let uploadedPhotos = [];
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
    let user = JSON.parse(localStorage.getItem('userData') || '{}');
    
    if (!user.fullName) {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    }
    
    if (!user.fullName) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('workerName').textContent = user.fullName;
    document.getElementById('workerRole').textContent = user.role || 'Worker';
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

    // Waste amount inputs - auto-calculate total
    const wasteInputs = ['paperWaste', 'plasticWaste', 'organicWaste', 'generalWaste'];
    wasteInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', calculateTotalWaste);
    });

    // Form actions
    document.getElementById('outdoorWasteForm').addEventListener('submit', handleSubmit);
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
    document.getElementById('cancelBtn').addEventListener('click', handleCancel);
}

// Calculate total waste
function calculateTotalWaste() {
    const paper = parseFloat(document.getElementById('paperWaste').value) || 0;
    const plastic = parseFloat(document.getElementById('plasticWaste').value) || 0;
    const organic = parseFloat(document.getElementById('organicWaste').value) || 0;
    const general = parseFloat(document.getElementById('generalWaste').value) || 0;
    
    const total = paper + plastic + organic + general;
    document.getElementById('totalWaste').textContent = total.toFixed(1) + ' kg';
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

    // Convert each file to Base64
    imageFiles.forEach(file => convertToBase64(file));
}

// Image Compression
function compressImage(file, maxWidth = 1200, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if image is too large
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert canvas to blob with compression
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas compression failed'));
                        }
                    },
                    file.type || 'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

// Convert photo to Base64 with compression
async function convertToBase64(file) {
    try {
        // Compress image first
        console.log(`📸 Compressing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
        const compressedBlob = await compressImage(file);
        console.log(`✅ Compressed to ${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`);
        
        // Convert compressed blob to base64
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
        addPhotoPreview(photoData, uploadedPhotos.length - 1);
        updatePhotoCount();

    } catch (error) {
        console.error('Upload error:', error);
        alert(`Failed to process ${file.name}: ${error.message}`);
    }
}

// Add photo preview
function addPhotoPreview(photoData, index) {
    const previewContainer = document.getElementById('photoPreview');
    
    const previewItem = document.createElement('div');
    previewItem.className = 'photo-preview-item';
    previewItem.innerHTML = `
        <img src="${photoData.data}" alt="Photo ${index + 1}">
        <button class="photo-remove-btn" onclick="removePhoto(${index})" type="button">×</button>
    `;
    
    previewContainer.appendChild(previewItem);
}

// Remove photo
function removePhoto(index) {
    uploadedPhotos.splice(index, 1);
    refreshPhotoPreview();
    updatePhotoCount();
}

// Refresh photo preview
function refreshPhotoPreview() {
    const previewContainer = document.getElementById('photoPreview');
    previewContainer.innerHTML = '';
    
    uploadedPhotos.forEach((photo, index) => {
        addPhotoPreview(photo, index);
    });
}

// Update photo count
function updatePhotoCount() {
    const count = uploadedPhotos.length;
    const countEl = document.getElementById('photoCount');
    countEl.textContent = `${count} photo${count !== 1 ? 's' : ''} uploaded (minimum ${MIN_PHOTOS} required)`;
    
    if (count < MIN_PHOTOS) {
        countEl.style.color = '#dc3545';
    } else {
        countEl.style.color = '#28a745';
    }
}

// Validate form
function validateForm() {
    // Check required fields
    const areaType = document.getElementById('areaType').value;
    const specificLocation = document.getElementById('specificLocation').value;
    const entryDate = document.getElementById('entryDate').value;
    const cleanlinessStatus = document.querySelector('input[name="cleanlinessStatus"]:checked');

    if (!areaType) {
        alert('Please select an area type');
        return false;
    }

    if (!specificLocation.trim()) {
        alert('Please specify the location');
        return false;
    }

    if (!entryDate) {
        alert('Please select the collection date');
        return false;
    }

    if (!cleanlinessStatus) {
        alert('Please select the area cleanliness status');
        return false;
    }

    // Check photos
    if (uploadedPhotos.length < MIN_PHOTOS) {
        alert(`Please upload at least ${MIN_PHOTOS} photos`);
        return false;
    }

    // Check if at least some waste is recorded
    const totalWaste = 
        (parseFloat(document.getElementById('paperWaste').value) || 0) +
        (parseFloat(document.getElementById('plasticWaste').value) || 0) +
        (parseFloat(document.getElementById('organicWaste').value) || 0) +
        (parseFloat(document.getElementById('generalWaste').value) || 0);

    if (totalWaste === 0) {
        if (!confirm('No waste amount recorded. Continue anyway?')) {
            return false;
        }
    }

    return true;
}

// Collect form data
function collectFormData() {
    const user = JSON.parse(localStorage.getItem('userData') || localStorage.getItem('user') || '{}');
    
    // Get checked issues
    const getCheckedIssues = () => {
        return Array.from(document.querySelectorAll('input[name="issues"]:checked'))
            .map(cb => cb.value);
    };

    const formData = {
        // User info
        userId: user._id || user.id,
        workerName: user.fullName,
        userRole: user.role,
        
        // Location info
        areaType: document.getElementById('areaType').value,
        specificLocation: document.getElementById('specificLocation').value,
        nearBuilding: document.getElementById('nearBuilding').value,
        entryDate: document.getElementById('entryDate').value,

        // Waste data
        paperWaste: parseFloat(document.getElementById('paperWaste').value) || 0,
        plasticWaste: parseFloat(document.getElementById('plasticWaste').value) || 0,
        organicWaste: parseFloat(document.getElementById('organicWaste').value) || 0,
        generalWaste: parseFloat(document.getElementById('generalWaste').value) || 0,

        // Total waste
        totalWaste: 
            (parseFloat(document.getElementById('paperWaste').value) || 0) +
            (parseFloat(document.getElementById('plasticWaste').value) || 0) +
            (parseFloat(document.getElementById('organicWaste').value) || 0) +
            (parseFloat(document.getElementById('generalWaste').value) || 0),

        // Condition assessment
        cleanlinessStatus: document.querySelector('input[name="cleanlinessStatus"]:checked')?.value,
        issues: getCheckedIssues(),

        // Photos - Base64 data
        photos: uploadedPhotos,

        // Notes
        notes: document.getElementById('notes').value,
        urgencyLevel: document.getElementById('urgencyLevel').value,

        // Metadata
        entryType: 'outdoor', // Important: marks this as outdoor waste
        submittedAt: new Date().toISOString(),
        status: 'submitted'
    };

    return formData;
}

// Handle form submission
async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) {
        return;
    }

    if (!confirm('Submit this outdoor waste entry?')) {
        return;
    }

    const formData = collectFormData();

    // Show loading
    document.getElementById('loadingOverlay').classList.add('active');
    document.getElementById('submitBtn').disabled = true;

    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        console.log('📤 Submitting outdoor waste entry to:', `${API_URL}/api/waste/outdoor`);
        console.log('📊 Payload summary:', {
            areaType: formData.areaType,
            location: formData.specificLocation,
            photos: formData.photos.length,
            totalWaste: formData.totalWaste,
            cleanliness: formData.cleanlinessStatus
        });
        
        const response = await fetch(`${API_URL}/api/waste/outdoor`, {
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
            alert('✅ Outdoor waste entry submitted successfully!');
            
            // Clear draft
            localStorage.removeItem('outdoorWasteDraft');
            
            // Redirect to profile
            window.location.href = 'profile.html';
        } else {
            // Show specific error from server
            throw new Error(data.message || data.error || `Server error (${response.status})`);
        }

    } catch (error) {
        console.error('❌ Submission error:', error);
        
        // User-friendly error messages
        let errorMessage = 'Failed to submit entry: ';
        
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
        document.getElementById('loadingOverlay').classList.remove('active');
        document.getElementById('submitBtn').disabled = false;
    }
}

// Save draft
function saveDraft() {
    const formData = collectFormData();
    formData.status = 'draft';
    
    localStorage.setItem('outdoorWasteDraft', JSON.stringify(formData));
    alert('💾 Draft saved successfully! You can continue later.');
}

// Load draft if exists
function loadDraftIfExists() {
    const draft = localStorage.getItem('outdoorWasteDraft');
    
    if (draft && confirm('Found a saved draft. Load it?')) {
        const data = JSON.parse(draft);
        
        // Load basic fields
        document.getElementById('areaType').value = data.areaType || '';
        document.getElementById('specificLocation').value = data.specificLocation || '';
        document.getElementById('nearBuilding').value = data.nearBuilding || '';
        document.getElementById('paperWaste').value = data.paperWaste || 0;
        document.getElementById('plasticWaste').value = data.plasticWaste || 0;
        document.getElementById('organicWaste').value = data.organicWaste || 0;
        document.getElementById('generalWaste').value = data.generalWaste || 0;
        document.getElementById('notes').value = data.notes || '';
        document.getElementById('urgencyLevel').value = data.urgencyLevel || 'Normal';

        // Load checkboxes for issues
        if (data.issues) {
            data.issues.forEach(issue => {
                const checkbox = document.querySelector(`input[name="issues"][value="${issue}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }

        // Load radio for cleanliness
        if (data.cleanlinessStatus) {
            const radio = document.querySelector(`input[name="cleanlinessStatus"][value="${data.cleanlinessStatus}"]`);
            if (radio) radio.checked = true;
        }

        // Load photos
        if (data.photos && data.photos.length > 0) {
            uploadedPhotos = data.photos;
            refreshPhotoPreview();
            updatePhotoCount();
        }

        // Recalculate total
        calculateTotalWaste();
    }
}

// Handle cancel
function handleCancel() {
    if (confirm('Discard this entry and return to profile?')) {
        window.location.href = 'profile.html';
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout? Unsaved changes will be lost.')) {
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }
}
