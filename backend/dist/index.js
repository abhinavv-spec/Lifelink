"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const auth_1 = __importDefault(require("./routes/auth"));
const contacts_1 = __importDefault(require("./routes/contacts"));
const inventory_1 = __importDefault(require("./routes/inventory"));
const requests_1 = __importDefault(require("./routes/requests"));
const emergency_1 = __importDefault(require("./routes/emergency"));
const donations_1 = __importDefault(require("./routes/donations"));
const donors_1 = __importDefault(require("./routes/donors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)({ origin: '*' }));
app.use(express_1.default.json());
// Serve static assets (CSS, images, etc.) from the public folder
const publicPath = path_1.default.join(__dirname, '../../frontend/lifelink-app/public');
app.use(express_1.default.static(publicPath));
app.use('/api/auth', auth_1.default);
app.use('/api/contacts', contacts_1.default);
app.use('/api/inventory', inventory_1.default);
app.use('/api/requests', requests_1.default);
app.use('/api/emergency', emergency_1.default);
app.use('/api/donations', donations_1.default);
app.use('/api/donors', donors_1.default);
// --- CLEAN UI ROUTING ---
// This prepares the backend so clean URLs redirect/serve the correct HTML tabs
const routes = {
    '/': 'index.html',
    '/login': 'hospital_login.html',
    '/bloodbank-login': 'blood_bank_login.html',
    '/dashboard': 'hospital_dashboard.html',
    '/requests': 'hospital_requests.html',
    '/create-request': 'create_request.html',
    '/analytics': 'hospital_analytics.html',
    '/settings': 'hospital_settings.html',
    '/donors': 'donor_database.html',
    '/donor-dashboard': 'donor_dashboard.html',
    '/donor-signup': 'donor_signup.html',
    '/match-results': 'donor_match_results.html',
    '/emergency': 'emergency.html'
};
Object.entries(routes).forEach(([route, file]) => {
    app.get(route, (req, res) => {
        res.sendFile(path_1.default.join(publicPath, file));
    });
});
// Fallback to index.html for any 404
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(publicPath, 'index.html'));
});
// --- SOCKET.IO SETUP for Emergency Live Tracking ---
const io = new socket_io_1.Server(server, {
    cors: { origin: '*' }
});
const activeResponders = {};
const socketRooms = {};
let responderCounter = 1;
io.on('connection', (socket) => {
    socket.on('join_emergency', (requestId) => {
        socket.join(requestId);
        socketRooms[socket.id] = requestId;
        if (!activeResponders[requestId])
            activeResponders[requestId] = [];
        socket.emit('responders_update', activeResponders[requestId]);
    });
    socket.on('update_location', (data) => {
        const { requestId, lat, lng } = data;
        if (!activeResponders[requestId])
            activeResponders[requestId] = [];
        const existingIndex = activeResponders[requestId].findIndex(d => d.socketId === socket.id);
        if (existingIndex >= 0) {
            activeResponders[requestId][existingIndex].lat = lat;
            activeResponders[requestId][existingIndex].lng = lng;
        }
        else {
            activeResponders[requestId].push({
                socketId: socket.id,
                lat,
                lng,
                responderId: `Responder #${responderCounter++}`
            });
        }
        io.to(requestId).emit('responders_update', activeResponders[requestId]);
    });
    socket.on('disconnect', () => {
        const roomId = socketRooms[socket.id];
        if (roomId && activeResponders[roomId]) {
            activeResponders[roomId] = activeResponders[roomId].filter(d => d.socketId !== socket.id);
            io.to(roomId).emit('responders_update', activeResponders[roomId]);
        }
        delete socketRooms[socket.id];
    });
});
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
