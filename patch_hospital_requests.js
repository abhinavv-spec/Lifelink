const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/lifelink-app/public/hospital_requests.html');
let html = fs.readFileSync(filePath, 'utf-8');

// 1. Remove Simulation Buttons
html = html.replace(/<div class="flex items-center gap-2">\s*<button onclick="simulateDonorPalakkad\(\)"[\s\S]*?<\/div>/, '');

// 2. Remove Click Event from map and storage event
html = html.replace(/\/\/ Click anywhere to add donor[\s\S]*?\}\);/g, '');
html = html.replace(/\/\/ Listen for real-time submissions[\s\S]*?\}\);/g, '');
html = html.replace(/function loadFromStorageAndRefresh\(\) \{[\s\S]*?refreshAll\(\);\n    \}/, '');

// 3. Remove simulation functions
html = html.replace(/function simulateDonorPalakkad\(\) \{[\s\S]*?refreshAll\(\);\n    \}/, '');
html = html.replace(/function simulateDonorAlathur\(\) \{[\s\S]*?refreshAll\(\);\n    \}/, '');
html = html.replace(/function simulateDonorLocal\(\) \{[\s\S]*?refreshAll\(\);\n    \}/, '');
html = html.replace(/function addNewDonorAtPoint[\s\S]*?refreshAll\(\);\n    \}/, '');

// 4. Inject Socket.IO script in <head>
if (!html.includes('socket.io/socket.io.js')) {
    html = html.replace('</head>', '  <script src="/socket.io/socket.io.js"></script>\n</head>');
}

// 5. Add Socket.IO listener logic
const socketLogic = `
    // Initialize Socket connection
    const socket = io();
    
    // Join the specific emergency room to listen for live locations
    socket.emit('join_emergency', 'REQ-8992');
    
    // When backend pushes live donor location updates
    socket.on('responders_update', (responders) => {
        incomingDonors = responders.map((r, idx) => {
            const dist = haversine(r.lat, r.lng, HOSPITAL_DESTINATION.lat, HOSPITAL_DESTINATION.lng);
            const roadDist = parseFloat((dist * 1.3).toFixed(1));
            const eta = Math.round((roadDist / 45) * 60);

            return {
                id: r.socketId,
                name: r.name || r.responderId,
                phone: r.phone || "Live tracking...",
                bloodGroup: HOSPITAL_DESTINATION.neededBlood,
                startingCity: "Live GPS Stream",
                lat: r.lat,
                lng: r.lng,
                distanceKm: roadDist,
                etaMinutes: eta,
                transportMode: "Live"
            };
        });
        
        refreshAll();
    });
`;

html = html.replace('function initMap() {', socketLogic + '\n    function initMap() {');

// Clean up any remaining loadFromStorageAndRefresh calls in initMap
html = html.replace(/loadFromStorageAndRefresh\(\);/g, '');

// Empty the incomingDonors array initially
html = html.replace(/let incomingDonors = \[[\s\S]*?\];/, 'let incomingDonors = [];');

fs.writeFileSync(filePath, html);
console.log('Patched hospital_requests.html for live Socket.io tracking.');
