/**
 * Weekly Resources Entry - JavaScript with Base64 Photo Storage - FIXED
 * Handles form submission, photo uploads to MongoDB, and data validation
 */

// Configuration
const API_URL = 'https://school-management-system-wico.onrender.com';

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
    
    if (!user.fullName) {
        alert('Please login first');
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('userName').textContent = user.fullName;
    document.getElementById('userRole').textContent = getRoleDisplay(user.role);
    // ✅ FIXED: Changed from teacherName to staffName
    document.getElementById('staffName').value = user.fullName;
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
    // Photo upload - ✅ FIXED: Better error handling
    const photoUploadArea = document.getElementById('photoUploadArea');
    const photoInput = document.getElementById('photoInput');

    if (!photoUploadArea || !photoInput) {
        console.error('Photo upload elements not found!');
        return;
    }

    // ✅ FIXED: Prevent default click behavior and trigger file input
    photoUploadArea.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        photoInput.click();
    });

    // ✅ FIXED: Added logging to debug
    photoInput.addEventListener('change', (e) => {
        console.log('📸 File input changed, files:', e.target.files);
        handlePhotoSelection(e);
    });

    // Drag and drop
    photoUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        photoUploadArea.style.borderColor = '#114814';
    });

    photoUploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        photoUploadArea.style.borderColor = '#21a300';
    });

    photoUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        photoUploadArea.style.borderColor = '#21a300';
        const files = Array.from(e.dataTransfer.files);
        console.log('📸 Files dropped:', files.length);
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

// Handle photo selection - ✅ FIXED: Added better logging
function handlePhotoSelection(e) {
    console.log('📸 handlePhotoSelection called');
    const files = Array.from(e.target.files);
    console.log('📸 Files selected:', files.length);
    
    if (files.length === 0) {
        console.warn('⚠️ No files selected');
        return;
    }
    
    handleFiles(files);
    
    // ✅ FIXED: Reset input value so same file can be selected again
    e.target.value = '';
}

// Handle file processing - ✅ FIXED: Added better logging
function handleFiles(files) {
    console.log('📸 handleFiles called with', files.length, 'files');
    
    // Filter valid image files
    const imageFiles = files.filter(file => {
        console.log('📸 Checking file:', file.name, 'Type:', file.type, 'Size:', file.size);
        
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

    console.log('📸 Valid image files:', imageFiles.length);

    // Check total photo limit
    const totalPhotos = uploadedPhotos.length + imageFiles.length;
    if (totalPhotos > MAX_PHOTOS) {
        alert(`Maximum ${MAX_PHOTOS} photos allowed. You're trying to add ${imageFiles.length} photos but already have ${uploadedPhotos.length}.`);
        return;
    }

    // Convert each file to Base64
    imageFiles.forEach((file, index) => {
        console.log(`📸 Processing file ${index + 1}/${imageFiles.length}:`, file.name);
        processPhoto(file);
    });
}

// ✅ Image Compression Function
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

// ✅ FIXED: Renamed from uploadToCloudinary to processPhoto for clarity
async function processPhoto(file) {
    const progressContainer = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    progressContainer.style.display = 'block';

    try {
        console.log(`📸 Processing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
        
        // Compress image
        const compressedBlob = await compressImage(file);
        console.log(`✅ Compressed to ${(compressedBlob.size / 1024 / 1024).toFixed(2)}MB`);
        
        // Convert to Base64
        const base64String = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                console.log('✅ Base64 conversion complete');
                resolve(reader.result);
            };
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
        console.log(`✅ Photo added to array. Total photos: ${uploadedPhotos.length}`);
        
        addPhotoPreview(photoData, uploadedPhotos.length - 1);
        updatePhotoCount();

        const progress = Math.round((uploadedPhotos.length / MAX_PHOTOS) * 100);
        progressBar.style.width = progress + '%';
        progressBar.textContent = progress + '%';

    } catch (error) {
        console.error('❌ Upload error:', error);
        alert(`Failed to process ${file.name}: ${error.message}`);
    } finally {
        setTimeout(() => {
            if (uploadedPhotos.length === 0) {
                progressContainer.style.display = 'none';
            }
        }, 1000);
    }
}

// ✅ Add photo preview for Base64
function addPhotoPreview(photoData, index) {
    console.log(`📸 Adding preview for photo ${index + 1}`);
    const preview = document.getElementById('photoPreview');
    
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    previewItem.setAttribute('data-index', index);
    previewItem.innerHTML = `
        <img src="${photoData.data}" alt="Resource photo ${index + 1}">
        <button type="button" class="remove-photo" data-index="${index}">×</button>
        <div class="photo-info">
            ${photoData.originalName}
        </div>
    `;

    previewItem.querySelector('.remove-photo').addEventListener('click', () => {
        removePhoto(index);
    });

    preview.appendChild(previewItem);
    console.log(`✅ Preview added for photo ${index + 1}`);
}

// Remove photo
function removePhoto(index) {
    console.log(`🗑️ Removing photo ${index + 1}`);
    if (confirm('Remove this photo?')) {
        uploadedPhotos.splice(index, 1);
        refreshPhotoPreview();
        updatePhotoCount();
        console.log(`✅ Photo removed. Remaining: ${uploadedPhotos.length}`);
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
    
    badge.classList.remove('warning', 'error', 'success');
    if (count < MIN_PHOTOS) {
        badge.classList.add('error');
    } else if (count >= MIN_PHOTOS && count < MAX_PHOTOS) {
        badge.classList.add('success');
    } else if (count === MAX_PHOTOS) {
        badge.classList.add('warning');
    }
    
    console.log(`📊 Photo count updated: ${count}/${MAX_PHOTOS}`);
}

// Form validation
function validateForm() {
    const form = document.getElementById('weeklyResourcesForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }

    if (uploadedPhotos.length < MIN_PHOTOS) {
        alert(`Please upload at least ${MIN_PHOTOS} photos`);
        document.getElementById('photoUploadArea').scrollIntoView({ behavior: 'smooth' });
        return false;
    }

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
    let user = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!user._id && !user.id) {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    }
    
    // ✅ FIXED: Changed from teacherName to staffName
    const formData = {
        userId: user._id || user.id,
        staffName: document.getElementById('staffName').value,
        userRole: user.role,
        
        location: document.getElementById('location').value,
        specificArea: document.getElementById('specificArea').value,
        weekEnding: document.getElementById('weekEnding').value,

        furniture: collectFurnitureData(),
        equipment: collectEquipmentData(),

        overallCondition: document.querySelector('input[name="overallCondition"]:checked')?.value,
        spaceUtilization: document.querySelector('input[name="spaceUtilization"]:checked')?.value,

        repairItems: document.getElementById('repairItems').value,
        replacementItems: document.getElementById('replacementItems').value,
        additionalNeeds: document.getElementById('additionalNeeds').value,
        spaceNotes: document.getElementById('spaceNotes').value,

        // ✅ CRITICAL: Photos are included here
        photos: uploadedPhotos,

        notes: document.getElementById('notes').value,
        priorityLevel: document.getElementById('priorityLevel').value,

        submittedAt: new Date().toISOString(),
        status: 'submitted'
    };

    console.log('📦 Form data collected:', {
        ...formData,
        photos: `${formData.photos.length} photos (${(JSON.stringify(formData.photos).length / 1024).toFixed(2)} KB)`
    });

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

    document.getElementById('loadingOverlay').classList.add('active');
    document.getElementById('submitBtn').disabled = true;

    try {
        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        
        console.log('📤 Submitting to:', `${API_URL}/api/resources/weekly`);
        console.log('📊 Payload summary:', {
            weekEnding: formData.weekEnding,
            furniture: formData.furniture.length,
            equipment: formData.equipment.length,
            photos: formData.photos.length,
            payloadSize: `${(JSON.stringify(formData).length / 1024 / 1024).toFixed(2)} MB`
        });
        
        const response = await fetch(`${API_URL}/api/resources/weekly`, {
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
            alert('✅ Weekly resources report submitted successfully!');
            localStorage.removeItem('weeklyResourcesDraft');
            window.location.href = 'profile.html';
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
        
        document.getElementById('location').value = data.location || '';
        document.getElementById('specificArea').value = data.specificArea || '';
        document.getElementById('repairItems').value = data.repairItems || '';
        document.getElementById('replacementItems').value = data.replacementItems || '';
        document.getElementById('additionalNeeds').value = data.additionalNeeds || '';
        document.getElementById('spaceNotes').value = data.spaceNotes || '';
        document.getElementById('notes').value = data.notes || '';
        document.getElementById('priorityLevel').value = data.priorityLevel || 'routine';

        if (data.overallCondition) {
            const radio = document.querySelector(`input[name="overallCondition"][value="${data.overallCondition}"]`);
            if (radio) radio.checked = true;
        }

        if (data.spaceUtilization) {
            const radio = document.querySelector(`input[name="spaceUtilization"][value="${data.spaceUtilization}"]`);
            if (radio) radio.checked = true;
        }

        if (data.photos && data.photos.length > 0) {
            uploadedPhotos = data.photos;
            refreshPhotoPreview();
            updatePhotoCount();
        }

        if (data.furnitureItemIds && data.furniture) {
            furnitureItems = [];
            document.getElementById('furnitureContainer').innerHTML = '';
            
            data.furnitureItemIds.forEach((itemId, index) => {
                addFurnitureItem();
                const furnitureData = data.furniture[index];
                if (furnitureData) {
                    document.querySelector(`[name="furniture_type_${itemId}"]`).value = furnitureData.type || '';
                    document.querySelector(`[name="furniture_name_${itemId}"]`).value = furnitureData.name || '';
                    document.querySelector(`[name="furniture_quantity_${itemId}"]`).value = furnitureData.quantity || 1;
                    document.querySelector(`[name="furniture_condition_${itemId}"]`).value = furnitureData.condition || '';
                    document.querySelector(`[name="furniture_notes_${itemId}"]`).value = furnitureData.notes || '';
                }
            });
        }

        if (data.equipmentItemIds && data.equipment) {
            equipmentItems = [];
            document.getElementById('equipmentContainer').innerHTML = '';
            
            data.equipmentItemIds.forEach((itemId, index) => {
                addEquipmentItem();
                const equipmentData = data.equipment[index];
                if (equipmentData) {
                    document.querySelector(`[name="equipment_type_${itemId}"]`).value = equipmentData.type || '';
                    document.querySelector(`[name="equipment_name_${itemId}"]`).value = equipmentData.name || '';
                    document.querySelector(`[name="equipment_quantity_${itemId}"]`).value = equipmentData.quantity || 1;
                    document.querySelector(`[name="equipment_condition_${itemId}"]`).value = equipmentData.condition || '';
                    document.querySelector(`[name="equipment_notes_${itemId}"]`).value = equipmentData.notes || '';
                }
            });
        }
    }
}

// Handle cancel
function handleCancel() {
    if (confirm('Discard this report and return to profile?')) {
        window.location.href = 'profile.html';
    }
}

// Logout handler
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Are you sure you want to logout? Unsaved changes will be lost.')) {
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }
});

// Make remove functions globally accessible
window.removeFurnitureItem = removeFurnitureItem;
window.removeEquipmentItem = removeEquipmentItem;
