import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { setupSocketHandlers } from './modules/multiplayer/socketHandler.js';
import { config } from './config/index.js';
import { connectToDatabase, closeDatabase } from './storage/mongodb.js';

const app = createApp();
const server = http.createServer(app);

const allowedOrigins =
  config.clientOrigin === '*'
    ? true
    : [
        ...new Set([
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:5174',
          'http://127.0.0.1:5174',
          ...(config.clientOrigin ? config.clientOrigin.split(',').map((s) => s.trim()) : []),
        ]),
      ];

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocketHandlers(io);

export async function startServer(): Promise<http.Server> {
  // Connect to MongoDB before advertising ready status if configured
  if (config.mongodbUri) {
    try {
      await connectToDatabase();
    } catch (err: any) {
      console.error(
        '⚠️ MongoDB connection failed on initial startup. Service starting in degraded state.'
      );
    }
  } else {
    console.log('ℹ️ MONGODB_URI not configured. Operating in local in-memory mode.');
  }

  return new Promise((resolve) => {
    server.listen(config.port, () => {
      console.log(`🌌 LUCID Backend Engine active on port ${config.port}`);
      console.log(`📡 Realtime Gateway ready for multi-wanderer presence`);
      console.log(
        `💾 Persistence Mode: ${config.mongodbUri ? 'MongoDB Atlas' : 'Authoritative In-Memory'}`
      );
      resolve(server);
    });
  });
}

// Graceful shutdown handling
let isShuttingDown = false;
async function handleShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);

  server.close(async () => {
    console.log('🔌 HTTP & WebSocket connections closed.');
    await closeDatabase();
    process.exit(0);
  });

  // Force close after 10 seconds if lingering connections keep process alive
  setTimeout(() => {
    console.error('⚠️ Forcefully terminating process after shutdown timeout.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('💥 Fatal error during server startup:', err);
    process.exit(1);
  });
}

export { app, server, io };
