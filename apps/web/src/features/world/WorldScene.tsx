import React, { useState, useCallback, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { useMultiplayer } from '../multiplayer/useMultiplayer.js';
import { WorldDispatcher } from '../planets/WorldDispatcher.js';
import { PlayerAvatar } from '../avatar/PlayerAvatar.js';
import { RemoteAvatar } from '../avatar/RemoteAvatar.js';
import { SimulatedEchoes } from '../avatar/SimulatedEchoes.js';
import { PlacedObjectsRenderer } from '../world-builder/PlacedObjectsRenderer.js';
import { PlacementPreview } from '../world-builder/PlacementPreview.js';
import { DesktopControls } from '../controls/DesktopControls.js';
import { MobileControls } from '../controls/MobileControls.js';
import { InWorldHUD } from '../ui/InWorldHUD.js';
import { BuildPalette } from '../world-builder/BuildPalette.js';
import { LoreModal } from '../ui/LoreModal.js';
import { ProfileModal } from '../ui/ProfileModal.js';
import { ChatDrawer } from '../ui/ChatDrawer.js';
import { PLANET_CATALOG } from '@lucid/shared';

export function WorldScene() {
  const activePlanet = useUniverseStore((s) => s.activePlanet);
  const objects = useUniverseStore((s) => s.objects);
  const presences = useUniverseStore((s) => s.presences);
  const userId = useUniverseStore((s) => s.userId);

  const { broadcastAvatarState } = useMultiplayer();

  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0.0, 3.5]);
  const [playerRot, setPlayerRot] = useState<[number, number, number]>([0, 0, 0]);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const [isSprinting, setIsSprinting] = useState<boolean>(false);
  const [isGrounded, setIsGrounded] = useState<boolean>(true);

  const handleMoveUpdate = useCallback(
    (
      pos: [number, number, number],
      rot: [number, number, number],
      moving: boolean,
      sprinting: boolean = false,
      grounded: boolean = true
    ) => {
      setPlayerPos(pos);
      setPlayerRot(rot);
      setIsMoving(moving);
      setIsSprinting(sprinting);
      setIsGrounded(grounded);

      // Broadcast transient movement to nearby wanderers
      broadcastAvatarState({
        position: pos,
        rotation: rot,
        emote: !grounded ? 'jump' : moving ? (sprinting ? 'run' : 'walk') : 'idle',
      });
    },
    [broadcastAvatarState]
  );

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#030514]">
      {/* 3D WebGL Canvas with Soft Contact Shadows & Filmic Tone Mapping */}
      <Canvas
        shadows={{ type: THREE.PCFSoftShadowMap }}
        camera={{ position: [0, 2.8, 7.5], fov: 55 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        <Suspense fallback={null}>
          <DesktopControls onMoveUpdate={handleMoveUpdate} />

          {/* Dynamic Planet Environment */}
          <WorldDispatcher
            activePlanet={activePlanet}
            playerPosition={playerPos}
          />

          {/* Local player is rendered in true first-person eye perspective */}

          {/* Other Connected Wanderers */}
          {presences
            .filter((p) => p.userId !== userId && p.locationId === activePlanet)
            .map((presence) => (
              <RemoteAvatar key={presence.sessionId} presence={presence} />
            ))}

          {/* Lore NPCs & Simulated Echoes in Local Mode */}
          <SimulatedEchoes planetId={activePlanet} />

          {/* Persistent User-Placed World Objects */}
          <PlacedObjectsRenderer objects={objects} />

          {/* World Builder Holographic Placement Preview */}
          <PlacementPreview />
        </Suspense>
      </Canvas>

      {/* In-World HUD & Navigation UI */}
      <InWorldHUD playerPosition={playerPos} />

      {/* Building Tray */}
      <BuildPalette />

      {/* Touch Screen Controls for Mobile */}
      <MobileControls
        onVirtualMove={() => {}}
        onVirtualJump={() => {}}
      />

      {/* Overlay Modals specific to In-World */}
      <LoreModal />
      <ProfileModal />
      <ChatDrawer />
    </div>
  );
}
