import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { setupSocketHandlers } from './modules/multiplayer/socketHandler.js';
import { config } from './config/index.js';

const app = createApp();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: config.clientOrigin === '*' ? true : [config.clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocketHandlers(io);

server.listen(config.port, () => {
  console.log(`🌌 LUCID Backend Engine active on port ${config.port}`);
  console.log(`📡 Realtime Gateway ready for multi-wanderer presence`);
  console.log(`💾 Persistence Mode: ${config.mongodbUri ? 'MongoDB' : 'Authoritative In-Memory'}`);
});

export { app, server, io };
