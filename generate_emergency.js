const fs = require('fs');
const path = require('path');

const dashPath = path.join(__dirname, 'frontend/lifelink-app/public/hospital_dashboard.html');
const outPath = path.join(__dirname, 'frontend/lifelink-app/public/emergency.html');

let html = fs.readFileSync(dashPath, 'utf-8');

// Find the start of the body
const bodyStart = html.indexOf('<body');
const bodyEndMatch = html.match(/<body[^>]*>/);
const headerEnd = html.indexOf('</nav>') + 6;

if (bodyEndMatch && headerEnd > 6) {
  // Extract up to the end of the nav bar so we keep their header
  const headAndNav = html.substring(0, headerEnd);
  
  // Create our custom map UI using their tailwind classes
  const customBody = `
  <div class="px-container-margin-mobile md:px-container-margin-desktop py-8 pt-24 max-w-[1400px] mx-auto">
    <h1 class="font-display-lg text-headline-lg font-bold text-on-surface mb-6">Emergency Mobilization Tracking</h1>
    
    <div class="flex flex-col md:flex-row gap-6 h-[70vh]">
      <!-- Map Area -->
      <div class="w-full md:w-3/4 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden relative">
        <div id="map" class="w-full h-full"></div>
      </div>

      <!-- Sidebar -->
      <div class="w-full md:w-1/4 bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-4 flex flex-col">
        <h2 class="font-title-md text-title-md font-bold mb-4 border-b pb-2 text-on-surface">Emergency Status</h2>
        
        <button id="donate-btn" class="w-full bg-primary hover:bg-primary-container text-on-primary py-3 rounded-lg font-bold shadow-md transition transform mb-6">
          ✋ I Can Donate (Opt-In)
        </button>
        
        <div id="tracking-status" class="hidden w-full bg-secondary-container text-on-secondary-container py-3 rounded-lg font-bold text-center mb-6 animate-pulse border border-secondary">
          📡 Live Tracking Active
        </div>

        <div class="flex-1 overflow-y-auto">
          <h3 class="font-label-md text-label-md font-bold text-on-surface-variant mb-3 flex justify-between items-center">
            <span>Live Responders</span>
            <span id="responder-count" class="bg-surface-variant text-on-surface-variant px-2 py-1 rounded-full text-xs">0</span>
          </h3>
          
          <ul id="responder-list" class="space-y-3">
            <p class="text-sm text-on-surface-variant italic text-center mt-4">Waiting for donors to respond...</p>
          </ul>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Leaflet & Socket.io Scripts -->
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="/socket.io/socket.io.js"></script>
  
  <script>
    // Extract request ID from URL or default to 1
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('id') || '1';

    // Haversine formula
    function calculateDistance(lat1, lon1, lat2, lon2) {
      const R = 6371; 
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      return R * c; 
    }

    const hospitalLocation = { lat: 12.9716, lng: 77.5946, name: "City Central Hospital" }; 
    
    // Initialize Map
    const map = L.map('map').setView([hospitalLocation.lat, hospitalLocation.lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const hospitalIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconAnchor: [12, 41],
    });
    const donorIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconAnchor: [12, 41],
    });

    L.marker([hospitalLocation.lat, hospitalLocation.lng], {icon: hospitalIcon})
      .addTo(map)
      .bindPopup('<strong>' + hospitalLocation.name + '</strong><br/>🚨 Needs Blood URGENTLY')
      .openPopup();

    const socket = io();
    socket.emit('join_emergency', requestId);
    
    let donorMarkers = {};

    socket.on('responders_update', (responders) => {
      // Calculate distances
      const withDistance = responders.map(r => ({
        ...r,
        distance: calculateDistance(hospitalLocation.lat, hospitalLocation.lng, r.lat, r.lng)
      })).sort((a, b) => a.distance - b.distance);

      // Update markers
      Object.values(donorMarkers).forEach(m => map.removeLayer(m));
      donorMarkers = {};
      
      withDistance.forEach(r => {
        const marker = L.marker([r.lat, r.lng], {icon: donorIcon}).addTo(map).bindPopup(r.responderId);
        donorMarkers[r.socketId] = marker;
      });

      // Update UI
      document.getElementById('responder-count').innerText = withDistance.length;
      const list = document.getElementById('responder-list');
      
      if (withDistance.length === 0) {
        list.innerHTML = '<p class="text-sm text-on-surface-variant italic text-center mt-4">Waiting for donors to respond...</p>';
      } else {
        list.innerHTML = withDistance.map(r => 
          \`<li class="flex items-center justify-between p-3 bg-surface rounded-lg border border-surface-variant">
            <div class="flex items-center">
              <div class="w-2 h-2 bg-secondary rounded-full mr-2 animate-ping"></div>
              <span class="font-medium text-on-surface">\${r.responderId}</span>
            </div>
            <span class="text-sm text-on-surface-variant font-mono bg-surface-container px-2 py-1 border rounded">
              \${r.distance.toFixed(1)} km
            </span>
          </li>\`
        ).join('');
      }
    });

    // Geolocation Opt-In
    document.getElementById('donate-btn').addEventListener('click', () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
      }
      
      document.getElementById('donate-btn').classList.add('hidden');
      document.getElementById('tracking-status').classList.remove('hidden');

      navigator.geolocation.watchPosition(
        (position) => {
          socket.emit('update_location', {
            requestId: requestId,
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error(error);
          alert("Error getting location: " + error.message);
          document.getElementById('donate-btn').classList.remove('hidden');
          document.getElementById('tracking-status').classList.add('hidden');
        },
        { enableHighAccuracy: true }
      );
    });
  </script>
</body>
</html>`;

  fs.writeFileSync(outPath, headAndNav + customBody);
  console.log('Successfully created emergency.html using native UI/UX headers');
} else {
  console.log("Failed to parse hospital_dashboard.html");
}
