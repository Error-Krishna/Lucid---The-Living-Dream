import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import {
  AvatarStatePayload,
  ObjectCreatePayload,
  ChatMessage,
  WorldObject,
} from '@lucid/shared';

export function useMultiplayer() {
  const socketRef = useRef<Socket | null>(null);

  const activePlanet = useUniverseStore((s) => s.activePlanet);
  const viewMode = useUniverseStore((s) => s.viewMode);
  const userId = useUniverseStore((s) => s.userId);
  const userName = useUniverseStore((s) => s.userName);
  const avatarConfig = useUniverseStore((s) => s.avatarConfig);

  const setConnectionMode = useUniverseStore((s) => s.setConnectionMode);
  const setSnapshot = useUniverseStore((s) => s.setSnapshot);
  const addRemoteObject = useUniverseStore((s) => s.addRemoteObject);
  const updateRemoteObject = useUniverseStore((s) => s.updateRemoteObject);
  const removeRemoteObject = useUniverseStore((s) => s.removeRemoteObject);
  const addOrUpdatePresence = useUniverseStore((s) => s.addOrUpdatePresence);
  const removePresence = useUniverseStore((s) => s.removePresence);
  const updatePresenceTransform = useUniverseStore((s) => s.updatePresenceTransform);
  const setEnvironmentState = useUniverseStore((s) => s.setEnvironmentState);
  const addChatMessage = useUniverseStore((s) => s.addChatMessage);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

    const socket: Socket = io(socketUrl, {
      reconnectionAttempts: 4,
      reconnectionDelay: 1500,
      timeout: 3500,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🌌 Connected to LUCID Realtime Gateway:', socket.id);
      setConnectionMode('connected');

      // Join current world if already in world view
      socket.emit('location:join', {
        locationId: activePlanet,
        userId,
        displayName: userName,
        avatarConfig,
      });
    });

    socket.on('connect_error', () => {
      // Gracefully switch to local mode
      setConnectionMode('local');
    });

    socket.on('disconnect', () => {
      setConnectionMode('local');
    });

    socket.on('location:snapshot', (data) => {
      setSnapshot(data.objects, data.presences, data.environment);
    });

    socket.on('presence:join', (data) => {
      addOrUpdatePresence(data.presence);
    });

    socket.on('presence:leave', (data) => {
      removePresence(data.sessionId);
    });

    socket.on('avatar:state', (data) => {
      updatePresenceTransform(data.sessionId, data.position, data.rotation, data.emote);
    });

    socket.on('world:object:committed', (data: { object: WorldObject }) => {
      addRemoteObject(data.object);
    });

    socket.on('world:object:update', (data: { object: WorldObject }) => {
      updateRemoteObject(data.object);
    });

    socket.on('world:object:delete', (data: { objectId: string }) => {
      removeRemoteObject(data.objectId);
    });

    socket.on('world:environment:changed', (data) => {
      setEnvironmentState(data.environment);
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      addChatMessage(msg);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  // When activePlanet changes, re-join location room
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected && viewMode === 'world') {
      socketRef.current.emit('location:join', {
        locationId: activePlanet,
        userId,
        displayName: userName,
        avatarConfig,
      });
    }
  }, [activePlanet, viewMode, userName]);

  // Movement broadcast throttle
  const lastBroadcastRef = useRef<number>(0);
  const broadcastAvatarState = useCallback(
    (payload: AvatarStatePayload) => {
      if (!socketRef.current || !socketRef.current.connected) return;

      const now = performance.now();
      // 20hz update rate = 50ms throttle
      if (now - lastBroadcastRef.current >= 50) {
        lastBroadcastRef.current = now;
        socketRef.current.emit('avatar:state', payload);
      }
    },
    []
  );

  const broadcastObjectCreate = useCallback((payload: ObjectCreatePayload) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('world:object:create', payload);
    }
  }, []);

  const broadcastObjectDelete = useCallback((objectId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('world:object:delete', { objectId });
    }
  }, []);

  const sendChatMessage = useCallback((text: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('chat:message', { text });
    }
  }, []);

  const triggerEnvironmentEffect = useCallback((type: string, active: boolean) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('world:environment:trigger', { type, active });
    }
  }, []);

  return {
    broadcastAvatarState,
    broadcastObjectCreate,
    broadcastObjectDelete,
    sendChatMessage,
    triggerEnvironmentEffect,
  };
}
