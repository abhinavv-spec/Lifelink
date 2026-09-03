import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { Server, Socket } from 'socket.io';
import authRoutes from './routes/auth';
import contactsRoutes from './routes/contacts';
import inventoryRoutes from './routes/inventory';
import requestsRoutes from './routes/requests';
import emergencyRoutes from './routes/emergency';
import donationsRoutes from './routes/donations';
import donorsRoutes from './routes/donors';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static assets (CSS, images, etc.) from the public folder
const publicPath = path.join(__dirname, '../../frontend/lifelink-app/public');
app.use(express.static(publicPath));

app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestsRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/donors', donorsRoutes);

// --- CLEAN UI ROUTING ---
// This prepares the backend so clean URLs redirect/serve the correct HTML tabs

const routes = {
  '/': 'index.html',
  '/auth': 'auth.html',
  '/login': 'hospital_login.html',
  '/bloodbank-login': 'blood_bank_login.html',
  '/bb-dashboard': 'blood_bank_dashboard.html',
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
    res.sendFile(path.join(publicPath, file));
  });
});

// Fallback to index.html for any 404
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// --- SOCKET.IO SETUP for Emergency Live Tracking ---
const io = new Server(server, {
  cors: { origin: '*' }
});

interface DonorLocation {
  socketId: string;
  lat: number;
  lng: number;
  responderId: string;
}

const activeResponders: Record<string, DonorLocation[]> = {};
const socketRooms: Record<string, string> = {};
let responderCounter = 1;

io.on('connection', (socket: Socket) => {
  socket.on('join_emergency', (requestId: string) => {
    socket.join(requestId);
    socketRooms[socket.id] = requestId;
    if (!activeResponders[requestId]) activeResponders[requestId] = [];
    socket.emit('responders_update', activeResponders[requestId]);
  });

  socket.on('update_location', (data: { requestId: string, lat: number, lng: number }) => {
    const { requestId, lat, lng } = data;
    if (!activeResponders[requestId]) activeResponders[requestId] = [];

    const existingIndex = activeResponders[requestId].findIndex(d => d.socketId === socket.id);
    if (existingIndex >= 0) {
      activeResponders[requestId][existingIndex].lat = lat;
      activeResponders[requestId][existingIndex].lng = lng;
    } else {
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
