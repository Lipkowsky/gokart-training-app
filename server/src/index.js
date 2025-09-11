import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api/index.js';
// import { startCleanupCron } from './lib/cleanSignUp.js';

const app = express();

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Host, na którym nasłuchuje backend
const HOST = NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// URL frontendu do CORS
const CLIENT_URL =
  NODE_ENV === 'production'
    ? process.env.CLIENT_URL || 'https://www.app.gokart-training.cloud'
    : process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Trasy
app.use('/auth', authRoutes);      // → /auth/...
app.use('/api', apiRoutes);        // → /api/...

// Tworzymy serwer HTTP i Socket.IO
const server = http.createServer(app);
export const io = new Server(server, {
  cors: { origin: CLIENT_URL, credentials: true },
});

// Socket.IO – obsługa połączeń
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// startCleanupCron();

// Uruchomienie serwera
server.listen(PORT, () => {
  console.log(`API + WebSocket running on ${NODE_ENV} mode at http://${HOST}:${PORT}`);
});


