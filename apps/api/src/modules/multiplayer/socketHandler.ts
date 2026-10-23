import { Server as SocketIOServer, Socket } from 'socket.io';
import {
  PlanetId,
  AvatarPresence,
  LocationJoinPayload,
  AvatarStatePayload,
  ObjectCreatePayload,
  ObjectUpdatePayload,
  ObjectDeletePayload,
  ChatMessage,
  PLANET_CATALOG,
} from '@lucid/shared';
import { worldStore } from '../../storage/worldStore.js';
import crypto from 'node:crypto';

interface ClientSession {
  sessionId: string;
  userId: string;
  displayName: string;
  locationId: PlanetId;
  avatarConfig: any;
  position: [number, number, number];
  rotation: [number, number, number];
  emote: any;
  lastSeenAt: number;
}

export function setupSocketHandlers(io: SocketIOServer) {
  const activeSessions = new Map<string, ClientSession>();

  io.on('connection', (socket: Socket) => {
    const sessionId = socket.id;

    socket.on('location:join', (payload: LocationJoinPayload) => {
      const { locationId, userId, displayName, avatarConfig, initialPosition } = payload;
      if (!PLANET_CATALOG[locationId]) return;

      // Leave existing room if any
      const existing = activeSessions.get(sessionId);
      if (existing) {
        socket.leave(`planet:${existing.locationId}`);
        socket.to(`planet:${existing.locationId}`).emit('presence:leave', {
          sessionId,
          userId: existing.userId,
        });
      }

      const room = `planet:${locationId}`;
      socket.join(room);

      const spawn = initialPosition || PLANET_CATALOG[locationId].startingSpawn;
      const session: ClientSession = {
        sessionId,
        userId: userId || `user-${sessionId.slice(0, 6)}`,
        displayName: displayName || 'Dreamer',
        locationId,
        avatarConfig: avatarConfig || {
          color: '#818cf8',
          glowColor: '#6366f1',
          style: 'wanderer',
        },
        position: spawn,
        rotation: [0, 0, 0],
        emote: 'idle',
        lastSeenAt: Date.now(),
      };

      activeSessions.set(sessionId, session);

      // Collect other active users in this planet
      const presences: AvatarPresence[] = [];
      for (const [id, s] of activeSessions.entries()) {
        if (id !== sessionId && s.locationId === locationId) {
          presences.push({
            sessionId: s.sessionId,
            userId: s.userId,
            displayName: s.displayName,
            avatarConfig: s.avatarConfig,
            locationId: s.locationId,
            position: s.position,
            rotation: s.rotation,
            emote: s.emote,
            lastSeenAt: s.lastSeenAt,
          });
        }
      }

      // Send snapshot to joining client
      socket.emit('location:snapshot', {
        locationId,
        objects: worldStore.getObjects(locationId),
        presences,
        environment: worldStore.getEnvironment(locationId),
      });

      // Broadcast join to others in the room
      socket.to(room).emit('presence:join', {
        presence: {
          sessionId,
          userId: session.userId,
          displayName: session.displayName,
          avatarConfig: session.avatarConfig,
          locationId: session.locationId,
          position: session.position,
          rotation: session.rotation,
          emote: session.emote,
          lastSeenAt: session.lastSeenAt,
        },
      });
    });

    socket.on('avatar:state', (payload: AvatarStatePayload) => {
      const session = activeSessions.get(sessionId);
      if (!session) return;

      const { position, rotation, emote } = payload;
      if (
        Array.isArray(position) &&
        position.length === 3 &&
        !isNaN(position[0]) &&
        !isNaN(position[1]) &&
        !isNaN(position[2])
      ) {
        session.position = [
          Math.max(-100, Math.min(100, position[0])),
          Math.max(-30, Math.min(60, position[1])),
          Math.max(-100, Math.min(100, position[2])),
        ];
      }

      if (Array.isArray(rotation) && rotation.length === 3) {
        session.rotation = rotation;
      }

      if (emote) {
        session.emote = emote;
      }

      session.lastSeenAt = Date.now();

      // Relay to others in the same world room
      socket.to(`planet:${session.locationId}`).emit('avatar:state', {
        sessionId,
        position: session.position,
        rotation: session.rotation,
        emote: session.emote,
      });
    });

    socket.on('world:object:create', (payload: ObjectCreatePayload) => {
      const session = activeSessions.get(sessionId);
      if (!session) return;

      try {
        const created = worldStore.createObject(session.locationId, {
          ...payload.object,
          creatorId: session.userId,
          creatorName: session.displayName,
        });

        // Broadcast committed object to all clients in the room including sender
        io.to(`planet:${session.locationId}`).emit('world:object:committed', {
          object: created,
        });
      } catch (err: any) {
        socket.emit('world:error', { message: err.message });
      }
    });

    socket.on('world:object:update', (payload: ObjectUpdatePayload) => {
      const session = activeSessions.get(sessionId);
      if (!session) return;

      try {
        const updated = worldStore.updateObject(session.locationId, payload.objectId, {
          transform: payload.transform,
          appearance: payload.appearance,
          version: payload.version,
        });

        io.to(`planet:${session.locationId}`).emit('world:object:update', {
          object: updated,
        });
      } catch (err: any) {
        socket.emit('world:error', { message: err.message });
      }
    });

    socket.on('world:object:delete', (payload: ObjectDeletePayload) => {
      const session = activeSessions.get(sessionId);
      if (!session) return;

      const success = worldStore.deleteObject(session.locationId, payload.objectId);
      if (success) {
        io.to(`planet:${session.locationId}`).emit('world:object:delete', {
          objectId: payload.objectId,
        });
      }
    });

    socket.on('world:environment:trigger', (payload: { type: string; active: boolean }) => {
      const session = activeSessions.get(sessionId);
      if (!session) return;

      const envState = worldStore.setEnvironmentTransformation(
        session.locationId,
        payload.active,
        payload.type
      );

      io.to(`planet:${session.locationId}`).emit('world:environment:changed', {
        locationId: session.locationId,
        environment: envState,
      });
    });

    socket.on('chat:message', (payload: { text: string }) => {
      const session = activeSessions.get(sessionId);
      if (!session || !payload.text) return;

      const msg: ChatMessage = {
        id: `chat-${crypto.randomUUID().slice(0, 8)}`,
        senderId: session.userId,
        senderName: session.displayName,
        text: payload.text.slice(0, 280),
        timestamp: Date.now(),
        locationId: session.locationId,
      };

      io.to(`planet:${session.locationId}`).emit('chat:message', msg);
    });

    socket.on('disconnect', () => {
      const session = activeSessions.get(sessionId);
      if (session) {
        socket.to(`planet:${session.locationId}`).emit('presence:leave', {
          sessionId,
          userId: session.userId,
        });
        activeSessions.delete(sessionId);
      }
    });
  });
}
