/**
 * Weekly Resources Entry - JavaScript with Cloudinary Integration
 * Handles form submission, photo uploads, dynamic item addition, and data validation
 */

// Configuration
const API_URL = 'http://localhost:5000/api';
const CLOUDINARY_CLOUD_NAME = 'your_cloud_name'; // Replace with your Cloudinary cloud name
const CLOUDINARY_UPLOAD_PRESET = 'echotrack weekly'; // Replace with your upload preset

// State Management
let uploadedPhotos = [];
let furnitureItems = [];
let equipmentItems = [];
const MAX_PHOTOS = 8;
const MIN_PHOTOS = 2;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Furniture and Equipment templates
const FURNITURE_TYPES = [
    'Desks', 'Chairs', 'Tables', 'Cabinets', 'Shelves', 
    'Whiteboards', 'Notice Boards', 'Storage Units', 'Benches', 'Other'
];

const EQUIPMENT_TYPES = [
    'Computers', 'Projectors', 'Printers', 'Microscopes', 'Lab Equipment',
    'Sports Equipment', 'Art Supplies', 'Musical Instruments', 'Books',
    'Stationery', 'Cleaning Supplies', 'Other'
];

const CONDITION_OPTIONS = [
    { value: 'excellent', label: 'Excellent', emoji: '🟢' },
    { value: 'good', label: 'Good', emoji: '🟡' },
    { value: 'fair', label: 'Fair', emoji: '🟠' },
    { value: 'poor', label: 'Poor', emoji: '🔴' },
    { value: 'broken', label: 'Broken/Non-functional', emoji: '❌' }
];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    setWeekEnding();
    initializeEventListeners();
    addFurnitureItem(); // Add initial furniture item
    addEquipmentItem(); // Add initial equipment item
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
        'non_academic_staff': 'Non-Academic Staff',
        'admin': 'Administrator'
    };
    return roleMap[role] || role;
}

// Set week ending date (next Friday)
function setWeekEnding() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7; // Get next Friday
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    
    const weekEndingInput = document.getElementById('weekEnding');
    weekEndingInput.value = nextFriday.toISOString().split('T')[0];
    
    // Display formatted week
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentWeek').textContent = nextFriday.toLocaleDateString('en-US', options);
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

    // Add item buttons
    document.getElementById('addFurnitureBtn').addEventListener('click', addFurnitureItem);
    document.getElementById('addEquipmentBtn').addEventListener('click', addEquipmentItem);

    // Form actions
    document.getElementById('weeklyResourcesForm').addEventListener('submit', handleSubmit);
    document.getElementById('saveDraftBtn').addEventListener('click', saveDraft);
    document.getElementById('cancelBtn').addEventListener('click', handleCancel);
}

// Add furniture item
function addFurnitureItem() {
    const itemId = Date.now();
    furnitureItems.push(itemId);
    
    const container = document.getElementById('furnitureContainer');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-entry';
    itemDiv.id = `furniture-${itemId}`;
    
    itemDiv.innerHTML = `
        <div class="item-header">
            <span class="item-number">Furniture Item #${furnitureItems.length}</span>
            <button type="button" class="remove-item-btn" onclick="removeFurnitureItem(${itemId})">
                ✖ Remove
            </button>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>Item Type *</label>
                <select name="furniture_type_${itemId}" required>
                    <option value="">Select Type</option>
                    ${FURNITURE_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Item Name/Description</label>
                <input type="text" name="furniture_name_${itemId}" placeholder="e.g., Student desks">
            </div>
            <div class="form-group">
                <label>Quantity *</label>
                <input type="number" name="furniture_quantity_${itemId}" min="1" value="1" required>
            </div>
            <div class="form-group">
                <label>Condition *</label>
                <select name="furniture_condition_${itemId}" required>
                    <option value="">Select Condition</option>
                    ${CONDITION_OPTIONS.map(opt => 
                        `<option value="${opt.value}">${opt.emoji} ${opt.label}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Additional Notes</label>
            <textarea name="furniture_notes_${itemId}" rows="2" 
                      placeholder="Any specific details, damages, or observations"></textarea>
        </div>
    `;
    
    container.appendChild(itemDiv);
}

// Remove furniture item
function removeFurnitureItem(itemId) {
    if (furnitureItems.length <= 1) {
        alert('At least one furniture item must be present');
        return;
    }
    
    if (confirm('Remove this furniture item?')) {
        const index = furnitureItems.indexOf(itemId);
        if (index > -1) {
            furnitureItems.splice(index, 1);
        }
        document.getElementById(`furniture-${itemId}`).remove();
        renumberItems('furniture');
    }
}

// Add equipment item
function addEquipmentItem() {
    const itemId = Date.now();
    equipmentItems.push(itemId);
    
    const container = document.getElementById('equipmentContainer');
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-entry';
    itemDiv.id = `equipment-${itemId}`;
    
    itemDiv.innerHTML = `
        <div class="item-header">
            <span class="item-number">Equipment Item #${equipmentItems.length}</span>
            <button type="button" class="remove-item-btn" onclick="removeEquipmentItem(${itemId})">
                ✖ Remove
            </button>
        </div>
        <div class="form-grid">
            <div class="form-group">
                <label>Item Type *</label>
                <select name="equipment_type_${itemId}" required>
                    <option value="">Select Type</option>
                    ${EQUIPMENT_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Item Name/Description</label>
                <input type="text" name="equipment_name_${itemId}" placeholder="e.g., HP Projector">
            </div>
            <div class="form-group">
                <label>Quantity *</label>
                <input type="number" name="equipment_quantity_${itemId}" min="1" value="1" required>
            </div>
            <div class="form-group">
                <label>Condition *</label>
                <select name="equipment_condition_${itemId}" required>
                    <option value="">Select Condition</option>
                    ${CONDITION_OPTIONS.map(opt => 
                        `<option value="${opt.value}">${opt.emoji} ${opt.label}</option>`
                    ).join('')}
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Additional Notes</label>
            <textarea name="equipment_notes_${itemId}" rows="2" 
                      placeholder="Any specific details, damages, or observations"></textarea>
        </div>
    `;
    
    container.appendChild(itemDiv);
}

// Remove equipment item
function removeEquipmentItem(itemId) {
    if (equipmentItems.length <= 1) {
        alert('At least one equipment item must be present');
        return;
    }
    
    if (confirm('Remove this equipment item?')) {
        const index = equipmentItems.indexOf(itemId);
        if (index > -1) {
            equipmentItems.splice(index, 1);
        }
        document.getElementById(`equipment-${itemId}`).remove();
        renumberItems('equipment');
    }
}

// Renumber items after removal
function renumberItems(type) {
    const items = type === 'furniture' ? furnitureItems : equipmentItems;
    items.forEach((itemId, index) => {
        const itemElement = document.getElementById(`${type}-${itemId}`);
        if (itemElement) {
            const numberSpan = itemElement.querySelector('.item-number');
            numberSpan.textContent = `${type === 'furniture' ? 'Furniture' : 'Equipment'} Item #${index + 1}`;
        }
    });
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
    formData.append('folder', 'echotrack/weekly-resources');

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
        <img src="${photoData.url}" alt="Resource photo ${index + 1}">
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
    
    if (count >= MIN_PHOTOS && count <= MAX_PHOTOS) {
        badge.style.background = '#21a300';
    } else if (count < MIN_PHOTOS) {
        badge.style.background = '#ff9800';
    } else {
        badge.style.background = '#d32f2f';
    }
}

// Form validation
function validateForm() {
    // Check required fields
    const form = document.getElementById('weeklyResourcesForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }

    // Check minimum photos
    if (uploadedPhotos.length < MIN_PHOTOS) {
        alert(`Please upload at least ${MIN_PHOTOS} photos`);
        document.getElementById('photoUploadArea').scrollIntoView({ behavior: 'smooth' });
        return false;
    }

    // Validate at least one furniture or equipment item
    if (furnitureItems.length === 0 && equipmentItems.length === 0) {
        alert('Please add at least one furniture or equipment item');
        return false;
    }

    return true;
}

// Collect furniture data
function collectFurnitureData() {
    return furnitureItems.map(itemId => {
        const getFieldValue = (fieldName) => {
            const element = document.querySelector(`[name="${fieldName}_${itemId}"]`);
            return element ? element.value : '';
        };

        return {
            type: getFieldValue('furniture_type'),
            name: getFieldValue('furniture_name'),
            quantity: parseInt(getFieldValue('furniture_quantity')) || 0,
            condition: getFieldValue('furniture_condition'),
            notes: getFieldValue('furniture_notes')
        };
    }).filter(item => item.type && item.quantity > 0);
}

// Collect equipment data
function collectEquipmentData() {
    return equipmentItems.map(itemId => {
        const getFieldValue = (fieldName) => {
            const element = document.querySelector(`[name="${fieldName}_${itemId}"]`);
            return element ? element.value : '';
        };

        return {
            type: getFieldValue('equipment_type'),
            name: getFieldValue('equipment_name'),
            quantity: parseInt(getFieldValue('equipment_quantity')) || 0,
            condition: getFieldValue('equipment_condition'),
            notes: getFieldValue('equipment_notes')
        };
    }).filter(item => item.type && item.quantity > 0);
}

// Collect form data
function collectFormData() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const formData = {
        // User info
        userId: user._id || user.id,
        staffName: document.getElementById('staffName').value,
        userRole: user.role,
        
        // Location
        location: document.getElementById('location').value,
        specificArea: document.getElementById('specificArea').value,
        weekEnding: document.getElementById('weekEnding').value,

        // Inventory data
        furniture: collectFurnitureData(),
        equipment: collectEquipmentData(),

        // Assessment
        overallCondition: document.querySelector('input[name="overallCondition"]:checked')?.value,
        spaceUtilization: document.querySelector('input[name="spaceUtilization"]:checked')?.value,

        // Issues and needs
        repairItems: document.getElementById('repairItems').value,
        replacementItems: document.getElementById('replacementItems').value,
        additionalNeeds: document.getElementById('additionalNeeds').value,
        spaceNotes: document.getElementById('spaceNotes').value,

        // Photos
        photos: uploadedPhotos,

        // Notes
        notes: document.getElementById('notes').value,
        priorityLevel: document.getElementById('priorityLevel').value,

        // Metadata
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

    if (!confirm('Submit this weekly resources report?')) {
        return;
    }

    const formData = collectFormData();

    // Show loading
    document.getElementById('loadingOverlay').classList.add('active');
    document.getElementById('submitBtn').disabled = true;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/resources/weekly`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ Weekly resources report submitted successfully!');
            
            // Clear draft
            localStorage.removeItem('weeklyResourcesDraft');
            
            // Redirect to dashboard
            window.location.href = 'dashboard.html';
        } else {
            throw new Error(data.message || 'Submission failed');
        }

    } catch (error) {
        console.error('Submission error:', error);
        alert('❌ Failed to submit report: ' + error.message);
    } finally {
        document.getElementById('loadingOverlay').classList.remove('active');
        document.getElementById('submitBtn').disabled = false;
    }
}

// Save draft
function saveDraft() {
    const formData = collectFormData();
    formData.status = 'draft';
    formData.furnitureItemIds = furnitureItems;
    formData.equipmentItemIds = equipmentItems;
    
    localStorage.setItem('weeklyResourcesDraft', JSON.stringify(formData));
    alert('💾 Draft saved successfully! You can continue later.');
}

// Load draft if exists
function loadDraftIfExists() {
    const draft = localStorage.getItem('weeklyResourcesDraft');
    
    if (draft && confirm('Found a saved draft. Load it?')) {
        const data = JSON.parse(draft);
        
        // Load basic fields
        document.getElementById('location').value = data.location || '';
        document.getElementById('specificArea').value = data.specificArea || '';
        document.getElementById('repairItems').value = data.repairItems || '';
        document.getElementById('replacementItems').value = data.replacementItems || '';
        document.getElementById('additionalNeeds').value = data.additionalNeeds || '';
        document.getElementById('spaceNotes').value = data.spaceNotes || '';
        document.getElementById('notes').value = data.notes || '';
        document.getElementById('priorityLevel').value = data.priorityLevel || 'routine';

        // Load radio selections
        if (data.overallCondition) {
            const radio = document.querySelector(`input[name="overallCondition"][value="${data.overallCondition}"]`);
            if (radio) radio.checked = true;
        }

        if (data.spaceUtilization) {
            const radio = document.querySelector(`input[name="spaceUtilization"][value="${data.spaceUtilization}"]`);
            if (radio) radio.checked = true;
        }

        // Load photos
        if (data.photos && data.photos.length > 0) {
            uploadedPhotos = data.photos;
            refreshPhotoPreview();
            updatePhotoCount();
        }

        // TODO: Load furniture and equipment items (more complex)
        // This would require recreating the dynamic items
    }
}

// Handle cancel
function handleCancel() {
    if (confirm('Discard this report and return to dashboard?')) {
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

// Make remove functions globally accessible
window.removeFurnitureItem = removeFurnitureItem;
window.removeEquipmentItem = removeEquipmentItem;
