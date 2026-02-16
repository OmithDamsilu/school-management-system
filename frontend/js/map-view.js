/**
 * Map View - Displays resources, waste, and unused spaces on school map
 * Uses Leaflet.js for interactive mapping
 */

let map;
let markers = {
    repair: [],
    replace: [],
    unused: [],
    waste: []
};

let markerLayers = {
    repair: L.layerGroup(),
    replace: L.layerGroup(),
    unused: L.layerGroup(),
    waste: L.layerGroup()
};

// Initialize map when page loads
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Check if user can view map (management roles)
    const user = getCurrentUser();
    if (user) {
        const managementRoles = ['Principal', 'Management Staff', 'Deputy Principal', 'Assistant Principal', 'Section Head'];
        if (managementRoles.includes(user.role)) {
            document.getElementById('dashboardLink').style.display = 'block';
        }
    }

    initializeMap();
    
    // Show map immediately after initialization (don't wait for data)
    document.getElementById('loadingMap').style.display = 'none';
    document.getElementById('map').style.display = 'block';
    
    await loadAllMapData();
    initializeFilters();
});

// Initialize the map centered on your school
function initializeMap() {
    // IMPORTANT: Replace these coordinates with your school's exact location
    // Anuradhapura Central College coordinates
    const schoolLat = 8.3114;  // Replace with actual latitude
    const schoolLng = 80.4037; // Replace with actual longitude

    // Create map
    map = L.map('map').setView([schoolLat, schoolLng], 18); // Zoom 18 = building level

    // Add OpenStreetMap tiles (free, no API key needed)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 20,
        minZoom: 15
    }).addTo(map);

    // ============= CUSTOM SCHOOL MAP OVERLAY =============
    // Upload your school layout image to frontend/images/ folder
    // Then uncomment and configure this section:
    
    /*
    const schoolMapUrl = 'images/school-layout.png';  // Your school map image
    
    // Define the corners of your school map image
    // These coordinates should match the actual boundaries of your school
    const imageBounds = [
        [schoolLat - 0.0015, schoolLng - 0.0015],  // Southwest corner
        [schoolLat + 0.0015, schoolLng + 0.0015]   // Northeast corner
    ];
    
    // Add custom school map as overlay
    const schoolMapOverlay = L.imageOverlay(schoolMapUrl, imageBounds, {
        opacity: 0.7,  // Adjust transparency (0.0 to 1.0)
        interactive: false
    }).addTo(map);
    
    // Add control to toggle overlay on/off
    const overlayControl = {
        "School Layout": schoolMapOverlay
    };
    L.control.layers(null, overlayControl, { position: 'topright' }).addTo(map);
    */
    
    // ============= END CUSTOM OVERLAY =============

    // Add school boundary circle
    L.circle([schoolLat, schoolLng], {
        color: '#21a300',
        fillColor: '#21a300',
        fillOpacity: 0.1,
        radius: 150 // 150 meters radius - adjust based on your school size
    }).addTo(map).bindPopup('<b>Anuradhapura Central College</b><br>School Campus');

    // Add all marker layers to map
    Object.values(markerLayers).forEach(layer => layer.addTo(map));

    // Force map to display immediately
    setTimeout(() => {
        map.invalidateSize(); // Recalculate map size
        console.log('✅ Map invalidated and resized');
    }, 100);

    console.log('✅ Map initialized');
}

// Custom icons for different marker types
const icons = {
    repair: L.divIcon({
        html: '🔧',
        iconSize: [30, 30],
        className: 'emoji-marker'
    }),
    replace: L.divIcon({
        html: '🔄',
        iconSize: [30, 30],
        className: 'emoji-marker'
    }),
    unused: L.divIcon({
        html: '🏢',
        iconSize: [30, 30],
        className: 'emoji-marker'
    }),
    waste: L.divIcon({
        html: '🌳',
        iconSize: [30, 30],
        className: 'emoji-marker'
    })
};

// Load all data from backend
async function loadAllMapData() {
    try {
        console.log('📥 Loading map data...');

        // Fetch all four types of entries
        const [resourcesData, spacesData, outdoorWasteData] = await Promise.all([
            apiCall(API_CONFIG.ENDPOINTS.GET_RESOURCES).catch(e => ({ success: false, entries: [] })),
            apiCall(API_CONFIG.ENDPOINTS.GET_SPACES).catch(e => ({ success: false, entries: [] })),
            apiCall('/api/waste/outdoor').catch(e => ({ success: false, entries: [] }))
        ]);

        console.log('📊 Data received:', {
            resources: resourcesData.entries?.length || 0,
            spaces: spacesData.entries?.length || 0,
            outdoorWaste: outdoorWasteData.entries?.length || 0
        });

        // Process and add markers
        if (resourcesData.success && resourcesData.entries) {
            processResourceEntries(resourcesData.entries);
        }

        if (spacesData.success && spacesData.entries) {
            processSpaceEntries(spacesData.entries);
        }

        if (outdoorWasteData.success && outdoorWasteData.entries) {
            processOutdoorWasteEntries(outdoorWasteData.entries);
        }

        // Update counts
        updateMarkerCounts();

        // Update last update time
        document.getElementById('lastUpdate').textContent = new Date().toLocaleString();

        console.log('✅ Map data loaded successfully');

    } catch (error) {
        console.error('❌ Error loading map data:', error);
        alert('Failed to load map data. Please refresh the page.');
    }
}

// Process weekly resources entries
function processResourceEntries(entries) {
    console.log('🔧 Processing', entries.length, 'resource entries');

    entries.forEach(entry => {
        // Check if items need repair or replacement
        const repairItems = [];
        const replaceItems = [];

        // Check furniture
        if (entry.furniture) {
            entry.furniture.forEach(item => {
                const condition = item.condition.toLowerCase();
                if (condition.includes('repair') || condition === 'poor') {
                    repairItems.push(`${item.quantity}x ${item.type || item.name}`);
                } else if (condition.includes('beyond repair') || condition === 'broken') {
                    replaceItems.push(`${item.quantity}x ${item.type || item.name}`);
                }
            });
        }

        // Check equipment
        if (entry.equipment) {
            entry.equipment.forEach(item => {
                const condition = item.condition.toLowerCase();
                if (condition.includes('repair') || condition === 'poor') {
                    repairItems.push(`${item.quantity}x ${item.type || item.name}`);
                } else if (condition.includes('beyond repair') || condition === 'broken') {
                    replaceItems.push(`${item.quantity}x ${item.type || item.name}`);
                }
            });
        }

        // Get coordinates for location
        const coords = getLocationCoordinates(entry.location, entry.specificArea);

        // Add repair markers
        if (repairItems.length > 0) {
            addMarker('repair', coords, {
                title: `Repair Needed: ${entry.location}`,
                items: repairItems,
                date: new Date(entry.weekEnding).toLocaleDateString(),
                submittedBy: entry.submittedByName
            });
        }

        // Add replace markers
        if (replaceItems.length > 0) {
            addMarker('replace', coords, {
                title: `Replace Needed: ${entry.location}`,
                items: replaceItems,
                date: new Date(entry.weekEnding).toLocaleDateString(),
                submittedBy: entry.submittedByName
            });
        }
    });
}

// Process unused space entries
function processSpaceEntries(entries) {
    console.log('🏢 Processing', entries.length, 'space entries');

    entries.forEach(entry => {
        const coords = getLocationCoordinates(
            entry.buildingName,
            `${entry.floorNumber} - ${entry.specificLocation}`
        );

        addMarker('unused', coords, {
            title: `Unused Space: ${entry.buildingName}`,
            location: `Floor ${entry.floorNumber}, ${entry.specificLocation}`,
            type: entry.spaceType,
            condition: entry.spaceCondition,
            suggestion: entry.suggestionDetails,
            priority: entry.priority,
            submittedBy: entry.submittedByName
        });
    });
}

// Process outdoor waste entries
function processOutdoorWasteEntries(entries) {
    console.log('🌳 Processing', entries.length, 'outdoor waste entries');

    entries.forEach(entry => {
        const coords = getLocationCoordinates(
            entry.nearBuilding || entry.areaType,
            entry.specificLocation
        );

        addMarker('waste', coords, {
            title: `Outdoor Waste: ${entry.areaType}`,
            location: entry.specificLocation,
            nearBuilding: entry.nearBuilding,
            date: new Date(entry.date).toLocaleDateString(),
            totalWaste: entry.totalWaste + ' kg',
            cleanliness: entry.cleanlinessStatus,
            urgency: entry.urgencyLevel,
            submittedBy: entry.submittedByName
        });
    });
}

// Add marker to map
function addMarker(type, coords, data) {
    if (!coords || !coords.lat || !coords.lng) {
        console.warn('Invalid coordinates for marker:', data.title);
        return;
    }

    const marker = L.marker([coords.lat, coords.lng], {
        icon: icons[type]
    });

    // Create popup content
    let popupContent = `<div style="min-width: 200px;">
        <h3 style="margin: 0 0 10px 0; color: #114814;">${data.title}</h3>`;

    // Add relevant fields based on type
    if (type === 'repair' || type === 'replace') {
        popupContent += `
            <p><strong>Items:</strong></p>
            <ul style="margin: 5px 0; padding-left: 20px;">
                ${data.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
            <p><strong>Week Ending:</strong> ${data.date}</p>
        `;
    } else if (type === 'unused') {
        popupContent += `
            <p><strong>Location:</strong> ${data.location}</p>
            <p><strong>Type:</strong> ${data.type}</p>
            <p><strong>Condition:</strong> ${data.condition}</p>
            <p><strong>Suggestion:</strong> ${data.suggestion}</p>
            <p><strong>Priority:</strong> <span style="color: ${data.priority === 'High' ? 'red' : data.priority === 'Medium' ? 'orange' : 'green'}">${data.priority}</span></p>
        `;
    } else if (type === 'waste') {
        popupContent += `
            <p><strong>Location:</strong> ${data.location}</p>
            ${data.nearBuilding ? `<p><strong>Near:</strong> ${data.nearBuilding}</p>` : ''}
            <p><strong>Date:</strong> ${data.date}</p>
            <p><strong>Total Waste:</strong> ${data.totalWaste}</p>
            <p><strong>Cleanliness:</strong> ${data.cleanliness}</p>
            <p><strong>Urgency:</strong> <span style="color: ${data.urgency === 'Urgent' ? 'red' : data.urgency === 'Attention' ? 'orange' : 'green'}">${data.urgency}</span></p>
        `;
    }

    popupContent += `<p style="margin-top: 10px; font-size: 12px; color: #666;">
        <strong>Submitted by:</strong> ${data.submittedBy}
    </p></div>`;

    marker.bindPopup(popupContent);

    // Add to appropriate layer
    marker.addTo(markerLayers[type]);
    markers[type].push(marker);
}

// Convert location text to coordinates
// This is a simple approximation system for school buildings
function getLocationCoordinates(location, specificArea) {
    // Base coordinates - your school center
    const baseLatLon = {
        lat: 8.3114,  // Replace with your school's latitude
        lng: 80.4037  // Replace with your school's longitude
    };

    // Offset values (approximate meters converted to degrees)
    // 1 degree latitude ≈ 111km, 1 degree longitude ≈ 111km * cos(latitude)
    // Adjust these based on your actual school layout
    const offsets = {
        // Buildings
        'Main Building': { lat: 0, lng: 0 },
        'Science Block': { lat: 0.0005, lng: 0.0003 },
        'Laboratory Building': { lat: 0.0005, lng: 0.0003 },
        'Admin Block': { lat: -0.0003, lng: 0.0002 },
        'Library': { lat: 0.0002, lng: 0.0005 },
        'Sports Complex': { lat: 0.0008, lng: -0.0002 },
        'Cafeteria': { lat: -0.0002, lng: -0.0004 },
        
        // Outdoor Areas
        'Garden': { lat: 0.0003, lng: -0.0004 },
        'Playground': { lat: -0.0006, lng: 0.0002 },
        'Sports Field': { lat: 0.0008, lng: -0.0003 },
        'Corridor': { lat: 0.0001, lng: 0.0001 },
        'Parking Area': { lat: -0.0005, lng: -0.0005 },
        'Entrance': { lat: -0.0002, lng: 0 },
        'Cafeteria Outdoor': { lat: -0.0002, lng: -0.0005 },
        'Assembly Ground': { lat: 0.0004, lng: 0.0004 },
        'Behind Building': { lat: 0.0006, lng: -0.0001 },
        
        // Sections
        'Primary': { lat: -0.0004, lng: -0.0003 },
        'Secondary': { lat: 0.0003, lng: 0.0002 },
        'Senior': { lat: 0.0006, lng: 0.0001 },
        
        // Default
        'General': { lat: 0, lng: 0 }
    };

    // Get offset for main location
    let offset = offsets[location] || offsets['General'];

    // Add small random offset for specific area to avoid marker overlap
    const randomOffset = {
        lat: (Math.random() - 0.5) * 0.0001,
        lng: (Math.random() - 0.5) * 0.0001
    };

    return {
        lat: baseLatLon.lat + offset.lat + randomOffset.lat,
        lng: baseLatLon.lng + offset.lng + randomOffset.lng
    };
}

// Update marker counts in legend
function updateMarkerCounts() {
    document.getElementById('repairCount').textContent = `(${markers.repair.length})`;
    document.getElementById('replaceCount').textContent = `(${markers.replace.length})`;
    document.getElementById('unusedCount').textContent = `(${markers.unused.length})`;
    document.getElementById('wasteCount').textContent = `(${markers.waste.length})`;
}

// Initialize filter buttons
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Get filter type
            const filter = button.getAttribute('data-filter');
            
            // Apply filter
            applyFilter(filter);
        });
    });
}

// Apply marker filter
function applyFilter(filter) {
    if (filter === 'all') {
        // Show all layers
        Object.values(markerLayers).forEach(layer => {
            map.addLayer(layer);
        });
    } else {
        // Hide all layers
        Object.values(markerLayers).forEach(layer => {
            map.removeLayer(layer);
        });
        
        // Show only selected layer
        map.addLayer(markerLayers[filter]);
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    }
}
