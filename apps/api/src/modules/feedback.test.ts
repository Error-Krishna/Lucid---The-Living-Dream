import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { ObjectId, Db } from 'mongodb';
import { createApp } from '../app.js';
import {
  setMockDatabase,
  resetDatabaseState,
} from '../storage/mongodb.js';

describe('MongoDB Persistent Feedback Engine', () => {
  let server: http.Server;
  let baseUrl: string;
  let mockCollection: any;
  let mockDocuments: any[];

  beforeAll(async () => {
    const app = createApp();
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr !== 'string') {
          baseUrl = `http://localhost:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  beforeEach(() => {
    mockDocuments = [];
    mockCollection = {
      insertOne: async (doc: any) => {
        const insertedId = new ObjectId();
        const stored = { _id: insertedId, ...doc };
        mockDocuments.push(stored);
        return { acknowledged: true, insertedId };
      },
      countDocuments: async () => mockDocuments.length,
      find: () => ({
        sort: () => ({
          toArray: async () => [...mockDocuments].reverse(),
        }),
      }),
    };

    const mockDb = {
      collection: (name: string) => {
        if (name === 'feedback') return mockCollection;
        throw new Error(`Unexpected collection: ${name}`);
      },
      command: async (cmd: any) => {
        if (cmd.ping) return { ok: 1 };
        return {};
      },
    } as unknown as Db;

    setMockDatabase(mockDb);
  });

  afterEach(() => {
    resetDatabaseState();
  });

  it('1. Valid feedback is stored successfully in MongoDB', async () => {
    const payload = {
      experienceRating: 'Amazing',
      primaryInterest: 'Exploring the planets',
      decision: 'YES',
      improvements: 'Add more planetary landing zones.',
      rating: 5,
    };

    const res = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const data = await res.json();

    expect(data.success).toBe(true);
    expect(data.submissionId).toBeDefined();
    expect(typeof data.submissionId).toBe('string');
    expect(data.submission.decision).toBe('YES');
    expect(data.submission.experienceRating).toBe('Amazing');
    expect(data.submission.primaryInterest).toBe('Exploring the planets');
    expect(data.submission.improvements).toBe('Add more planetary landing zones.');
    expect(data.submission.submittedAt).toBeDefined();

    // Verify stored directly in MongoDB collection
    expect(mockDocuments.length).toBe(1);
    expect(mockDocuments[0].decision).toBe('YES');
    expect(mockDocuments[0].createdAt).toBeDefined();
  });

  it('2. Invalid required fields are rejected with HTTP 400', async () => {
    // Missing decision
    const resNoDecision = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experienceRating: 'Amazing',
        primaryInterest: 'Exploring the planets',
      }),
    });
    expect(resNoDecision.status).toBe(400);
    const err1 = await resNoDecision.json();
    expect(err1.error).toContain('decisive question');

    // Invalid decision value (not YES or NO)
    const resBadDecision = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experienceRating: 'Amazing',
        primaryInterest: 'Exploring the planets',
        decision: 'MAYBE',
      }),
    });
    expect(resBadDecision.status).toBe(400);

    // Invalid experience rating
    const resBadRating = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experienceRating: 'Spectacular', // Not in allowed 4-tier list
        primaryInterest: 'Exploring the planets',
        decision: 'YES',
      }),
    });
    expect(resBadRating.status).toBe(400);
    const err2 = await resBadRating.json();
    expect(err2.error).toContain('Please rate your experience');

    // Missing primary interest
    const resNoInterest = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experienceRating: 'Good',
        decision: 'NO',
      }),
    });
    expect(resNoInterest.status).toBe(400);
    const err3 = await resNoInterest.json();
    expect(err3.error).toContain('Please select what interested you most');
  });

  it('3. Optional comments are handled properly (valid, omitted, oversized, malformed)', async () => {
    // Valid omitted comment
    const resOmitted = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experienceRating: 'Good',
        primaryInterest: 'The visuals and atmosphere',
        decision: 'YES',
      }),
    });
    expect(resOmitted.status).toBe(201);
    const dataOmitted = await resOmitted.json();
    expect(dataOmitted.submission.improvements).toBe('');

    // Malformed comment (not a string)
    const resMalformed = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experienceRating: 'Good',
        primaryInterest: 'The visuals and atmosphere',
        decision: 'YES',
        improvements: { bad: 'object' },
      }),
    });
    expect(resMalformed.status).toBe(400);
    const errMalformed = await resMalformed.json();
    expect(errMalformed.error).toContain('Improvements comment must be a string');

    // Oversized comment (> 2000 characters)
    const resOversized = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experienceRating: 'Good',
        primaryInterest: 'The visuals and atmosphere',
        decision: 'YES',
        improvements: 'a'.repeat(2001),
      }),
    });
    expect(resOversized.status).toBe(400);
    const errOversized = await resOversized.json();
    expect(errOversized.error).toContain('cannot exceed 2000 characters');
  });

  it('4. MongoDB write failures produce an appropriate HTTP 5xx error', async () => {
    mockCollection.insertOne = async () => {
      throw new Error('Mongo network timeout / cluster unreachable');
    };

    const res = await fetch(`${baseUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        experienceRating: 'Amazing',
        primaryInterest: 'Exploring the planets',
        decision: 'YES',
        improvements: 'Test failure handling',
      }),
    });

    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toContain('unavailable');
    // Ensure raw connection details / stack traces are NOT leaked
    expect(data.error).not.toContain('mongodb');
    expect(data.error).not.toContain('cluster');
  });

  it('5. Feedback counts come from the database countDocuments', async () => {
    // Seed 3 mock feedback items
    mockDocuments.push({ _id: new ObjectId(), decision: 'YES' });
    mockDocuments.push({ _id: new ObjectId(), decision: 'YES' });
    mockDocuments.push({ _id: new ObjectId(), decision: 'NO' });

    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(200);
    const data = await res.json();

    expect(data.status).toBe('healthy');
    expect(data.mode).toBe('connected-mongodb');
    expect(data.database).toBe('connected');
    expect(data.stats.totalFeedback).toBe(3);
  });

  it('6. Database connection failures do not report a healthy persistent service', async () => {
    // Inject a failing mock database
    const failingDb = {
      collection: () => mockCollection,
      command: async (cmd: any) => {
        if (cmd.ping) throw new Error('Connection refused by MongoDB cluster');
        return {};
      },
    } as unknown as Db;

    setMockDatabase(failingDb);

    const res = await fetch(`${baseUrl}/api/health`);
    expect(res.status).toBe(503);
    const data = await res.json();

    expect(data.status).toBe('unhealthy');
    expect(data.database).toBe('disconnected');
    expect(data.error).toBe('Database connection unavailable');
    // Ensure no raw error details or sensitive data in health response
    expect(data.error).not.toContain('refused');
    expect(data.error).not.toContain('cluster');
  });
});
