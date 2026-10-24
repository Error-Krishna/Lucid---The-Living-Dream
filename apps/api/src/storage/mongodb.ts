import { MongoClient, Db, Collection } from 'mongodb';
import { config } from '../config/index.js';
import {
  FeedbackExperience,
  FeedbackPrimaryInterest,
  FeedbackDecision,
} from '@lucid/shared';

export interface FeedbackDocument {
  _id?: any;
  experienceRating: FeedbackExperience;
  primaryInterest: FeedbackPrimaryInterest;
  decision: FeedbackDecision;
  improvements?: string;
  rating: number;
  interest: string;
  favoriteFeatures: string[];
  problems?: string;
  additionalThoughts?: string;
  prototypeVersion: string;
  createdAt: string;
}

let client: MongoClient | null = null;
let db: Db | null = null;
let connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
let lastError: string | null = null;

// Allow test mocks
let mockDbInstance: Db | null = null;

export function sanitizeMongoUri(uri: string): string {
  if (!uri) return '';
  return uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
}

export async function connectToDatabase(): Promise<Db> {
  if (mockDbInstance) {
    db = mockDbInstance;
    connectionState = 'connected';
    return mockDbInstance;
  }

  if (db && client && connectionState === 'connected') {
    return db;
  }

  const uri = config.mongodbUri;
  const dbName = config.mongodbDbName || 'lucid';

  if (!uri) {
    connectionState = 'disconnected';
    lastError = 'MONGODB_URI is not set';
    throw new Error('MONGODB_URI is not configured in environment');
  }

  connectionState = 'connecting';
  lastError = null;

  try {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    const activeDb = client.db(dbName);
    await activeDb.command({ ping: 1 });

    db = activeDb;
    connectionState = 'connected';
    console.log(`🌿 MongoDB connected successfully [database: "${dbName}"]`);
    return db;
  } catch (err: any) {
    connectionState = 'error';
    lastError = err?.message || 'Failed to connect to MongoDB';
    console.error(`❌ MongoDB connection failed [database: "${dbName}"]:`, lastError);
    throw err;
  }
}

export function getDatabase(): Db {
  if (mockDbInstance) return mockDbInstance;
  if (!db || connectionState !== 'connected') {
    throw new Error('Database is not connected');
  }
  return db;
}

export function getFeedbackCollection(): Collection<FeedbackDocument> {
  const activeDb = getDatabase();
  return activeDb.collection<FeedbackDocument>('feedback');
}

export function isDatabaseActive(): boolean {
  return Boolean(mockDbInstance || config.mongodbUri);
}

export async function isDatabaseHealthy(): Promise<boolean> {
  const activeDb = mockDbInstance || db;
  if (!activeDb || connectionState !== 'connected') {
    return false;
  }
  try {
    await activeDb.command({ ping: 1 });
    return true;
  } catch {
    connectionState = 'error';
    return false;
  }
}

export function getConnectionState(): {
  state: 'disconnected' | 'connecting' | 'connected' | 'error';
  isConfigured: boolean;
  databaseName: string;
} {
  return {
    state: connectionState,
    isConfigured: Boolean(config.mongodbUri),
    databaseName: config.mongodbDbName || 'lucid',
  };
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    try {
      await client.close();
      console.log('🌿 MongoDB client connection closed gracefully');
    } catch (err: any) {
      console.error('Error closing MongoDB client:', err.message);
    } finally {
      client = null;
      db = null;
      connectionState = 'disconnected';
    }
  }
}

// Test utilities
export function setMockDatabase(mock: Db | null) {
  mockDbInstance = mock;
  if (mock) {
    connectionState = 'connected';
  } else {
    connectionState = 'disconnected';
  }
}

export function resetDatabaseState() {
  mockDbInstance = null;
  client = null;
  db = null;
  connectionState = 'disconnected';
  lastError = null;
}
