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
import {
  isDatabaseActive,
  isDatabaseHealthy,
  getFeedbackCollection,
} from './storage/mongodb.js';

export function createApp() {
  const app = express();

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

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));

  // Health check endpoint
  app.get('/api/health', async (_req, res) => {
    const worldStats = worldStore.getStats();
    const isDbActive = isDatabaseActive();

    if (isDbActive) {
      try {
        const isHealthy = await isDatabaseHealthy();
        if (!isHealthy) {
          return res.status(503).json({
            status: 'unhealthy',
            service: 'LUCID-Universe-Engine',
            version: '1.0.0-mvp',
            timestamp: new Date().toISOString(),
            mode: 'connected-mongodb',
            database: 'disconnected',
            error: 'Database connection unavailable',
            stats: {
              totalWorlds: worldStats.totalWorlds,
              totalObjects: worldStats.totalObjects,
              totalFeedback: 0,
            },
          });
        }

        const collection = getFeedbackCollection();
        const totalFeedback = await collection.countDocuments();

        return res.json({
          status: 'healthy',
          service: 'LUCID-Universe-Engine',
          version: '1.0.0-mvp',
          timestamp: new Date().toISOString(),
          mode: 'connected-mongodb',
          database: 'connected',
          stats: {
            totalWorlds: worldStats.totalWorlds,
            totalObjects: worldStats.totalObjects,
            totalFeedback,
          },
        });
      } catch {
        return res.status(503).json({
          status: 'unhealthy',
          service: 'LUCID-Universe-Engine',
          version: '1.0.0-mvp',
          timestamp: new Date().toISOString(),
          mode: 'connected-mongodb',
          database: 'error',
          error: 'Database query failed',
          stats: {
            totalWorlds: worldStats.totalWorlds,
            totalObjects: worldStats.totalObjects,
            totalFeedback: 0,
          },
        });
      }
    }

    // Default when MongoDB URI is not set in environment (e.g. local offline demo)
    return res.json({
      status: 'healthy',
      service: 'LUCID-Universe-Engine',
      version: '1.0.0-mvp',
      timestamp: new Date().toISOString(),
      mode: 'connected-memory',
      database: 'in-memory-authoritative',
      stats: {
        totalWorlds: worldStats.totalWorlds,
        totalObjects: worldStats.totalObjects,
        totalFeedback: 0,
      },
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
