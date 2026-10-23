import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import {
  getWorlds,
  getWorld,
  getWorldObjects,
  createWorldObject,
  updateWorldObject,
  deleteWorldObject,
} from './modules/world/worldController.js';
import { submitFeedback, exportFeedback } from './modules/feedback/feedbackController.js';
import { worldStore } from './storage/worldStore.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.clientOrigin === '*' ? true : [config.clientOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    const stats = worldStore.getStats();
    res.json({
      status: 'healthy',
      service: 'LUCID-Universe-Engine',
      version: '1.0.0-mvp',
      timestamp: new Date().toISOString(),
      mode: config.mongodbUri ? 'connected-mongodb' : 'connected-memory',
      database: config.mongodbUri ? 'connected' : 'in-memory-authoritative',
      stats,
    });
  });

  // World endpoints
  app.get('/api/worlds', getWorlds);
  app.get('/api/worlds/:worldId', getWorld);
  app.get('/api/worlds/:worldId/objects', getWorldObjects);
  app.post('/api/worlds/:worldId/objects', createWorldObject);
  app.patch('/api/worlds/:worldId/objects/:objectId', updateWorldObject);
  app.delete('/api/worlds/:worldId/objects/:objectId', deleteWorldObject);

  // Feedback endpoints
  app.post('/api/feedback', submitFeedback);
  app.get('/api/feedback/export', exportFeedback);

  // Fallback 404
  app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found in LUCID universe' });
  });

  return app;
}
