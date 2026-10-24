import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { io as ClientIO } from 'socket.io-client';
import http from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from '../app.js';
import { setupSocketHandlers } from './multiplayer/socketHandler.js';

describe('Socket.IO Real-time Multiplayer Engine', () => {
  let testServer: http.Server;
  let testUrl: string;

  beforeAll(async () => {
    const app = createApp();
    testServer = http.createServer(app);
    const io = new SocketIOServer(testServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });
    setupSocketHandlers(io);

    await new Promise<void>((resolve) => {
      testServer.listen(0, () => {
        const addr = testServer.address();
        if (addr && typeof addr !== 'string') {
          testUrl = `http://localhost:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      testServer.close(() => resolve());
    });
  });

  it('connects two independent wanderers, synchronizes presence, movement and object commits', async () => {
    const clientA = ClientIO(testUrl, {
      transports: ['websocket'],
      reconnection: false,
    });
    const clientB = ClientIO(testUrl, {
      transports: ['websocket'],
      reconnection: false,
    });

    await new Promise<void>((resolve, reject) => {
      let connected = 0;
      clientA.on('connect', () => {
        connected++;
        if (connected === 2) resolve();
      });
      clientB.on('connect', () => {
        connected++;
        if (connected === 2) resolve();
      });
      setTimeout(() => reject(new Error('Connection timeout to local server')), 3000);
    });

    let clientAReceivedPresence = false;
    let clientAReceivedMovement = false;
    let clientBReceivedCommitted = false;

    clientA.on('presence:join', (data) => {
      expect(data.presence.displayName).toBe('Bob');
      clientAReceivedPresence = true;
    });

    clientA.on('avatar:state', (data) => {
      if (data.position && data.position[0] === 4) {
        clientAReceivedMovement = true;
      }
    });

    clientB.on('world:object:committed', (data) => {
      expect(data.object.type).toBe('dream_beacon');
      clientBReceivedCommitted = true;
    });

    // Client A joins Candyverse
    clientA.emit('location:join', {
      locationId: 'candyverse',
      userId: 'test-alice',
      displayName: 'Alice',
      avatarConfig: { color: '#818cf8', glowColor: '#6366f1', style: 'wanderer' },
    });

    await new Promise((r) => setTimeout(r, 100));

    // Client B joins Candyverse
    clientB.emit('location:join', {
      locationId: 'candyverse',
      userId: 'test-bob',
      displayName: 'Bob',
      avatarConfig: { color: '#38bdf8', glowColor: '#0ea5e9', style: 'shimmer' },
    });

    await new Promise((r) => setTimeout(r, 150));

    // Client B updates position
    clientB.emit('avatar:state', {
      position: [4, 1.2, -6],
      rotation: [0, 0, 0],
      emote: 'walk',
    });

    await new Promise((r) => setTimeout(r, 150));

    // Client A commits object
    clientA.emit('world:object:create', {
      object: {
        locationId: 'candyverse',
        creatorId: 'test-alice',
        creatorName: 'Alice',
        type: 'dream_beacon',
        transform: { position: [1, 1, 1], rotation: [0, 0, 0], scale: [1, 1, 1] },
        appearance: { color: '#f472b6' },
        permissions: 'public',
      },
    });

    await new Promise((r) => setTimeout(r, 200));

    clientA.disconnect();
    clientB.disconnect();

    expect(clientAReceivedPresence).toBe(true);
    expect(clientAReceivedMovement).toBe(true);
    expect(clientBReceivedCommitted).toBe(true);
  });
});
