import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { PLANET_CATALOG } from '@lucid/shared';
import { getTerrainElevation } from '../world/DetailedTerrain.js';
import { soundEngine } from '../../lib/sound.js';

interface DesktopControlsProps {
  onMoveUpdate: (
    pos: [number, number, number],
    rot: [number, number, number],
    isMoving: boolean,
    isSprinting?: boolean,
    isGrounded?: boolean
  ) => void;
}

interface CollisionObstacle {
  x: number;
  z: number;
  radius: number;
}

export function DesktopControls({ onMoveUpdate }: DesktopControlsProps) {
  const { camera, gl } = useThree();

  const activePlanet = useUniverseStore((s) => s.activePlanet);
  const contextPrompt = useUniverseStore((s) => s.contextPrompt);
  const setContextPrompt = useUniverseStore((s) => s.setContextPrompt);
  const setIsNearRocket = useUniverseStore((s) => s.setIsNearRocket);
  const boardCraft = useUniverseStore((s) => s.boardCraft);
  const triggerLandmarkInteraction = useUniverseStore((s) => s.triggerLandmarkInteraction);
  const isBuildMode = useUniverseStore((s) => s.isBuildMode);
  const toggleBuildMode = useUniverseStore((s) => s.toggleBuildMode);
  const isFeedbackOpen = useUniverseStore((s) => s.isFeedbackOpen);
  const isFinishExplorationOpen = useUniverseStore((s) => s.isFinishExplorationOpen);
  const isHelpOpen = useUniverseStore((s) => s.isHelpOpen);
  const isMapOpen = useUniverseStore((s) => s.isMapOpen);
  const toggleMap = useUniverseStore((s) => s.toggleMap);
  const objects = useUniverseStore((s) => s.objects);
  const travelState = useUniverseStore((s) => s.travelState);

  const keys = useRef<Record<string, boolean>>({});
  const position = useRef(new THREE.Vector3(0, 1.2, 5));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const velocityY = useRef(0);
  const isGrounded = useRef(true);
  const wasGrounded = useRef(true);
  const yaw = useRef(0);
  const pitch = useRef(0.0);
  const isMouseDown = useRef(false);
  const isPointerLocked = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // First-Person Camera Motion Dynamics
  const walkCycle = useRef(0);
  const landingDip = useRef(0);

  const planetRules = PLANET_CATALOG[activePlanet]?.rules || {
    gravity: 9.8,
    moveSpeed: 6.5,
    jumpForce: 5.5,
  };

  // Reset player spawn position on planet warp
  useEffect(() => {
    const spawn = PLANET_CATALOG[activePlanet]?.startingSpawn || [0, 1.2, 5];
    position.current.set(spawn[0], spawn[1], spawn[2]);
    velocity.current.set(0, 0, 0);
    yaw.current = 0;
    pitch.current = 0.0;
    velocityY.current = 0;
    isGrounded.current = true;
    wasGrounded.current = true;
    landingDip.current = 0;
    walkCycle.current = 0;
  }, [activePlanet]);

  // Pointer Lock and Mouse / Keyboard Listeners
  useEffect(() => {
    const handleLockChange = () => {
      isPointerLocked.current =
        document.pointerLockElement === gl.domElement ||
        document.pointerLockElement === document.body;
    };

    document.addEventListener('pointerlockchange', handleLockChange);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      keys.current[e.code] = true;

      // Quick shortcut keys
      if (e.code === 'KeyE') {
        const distToRocket = Math.hypot(position.current.x - (-6.5), position.current.z - 4);
        if (distToRocket < 4.5) {
          boardCraft();
        } else if (
          contextPrompt?.includes('channel') ||
          contextPrompt?.includes('Awaken') ||
          contextPrompt?.includes('Attune') ||
          contextPrompt?.includes('Refract') ||
          contextPrompt?.includes('Commune') ||
          contextPrompt?.includes('Sync')
        ) {
          triggerLandmarkInteraction();
        }
      } else if (e.code === 'KeyB') {
        toggleBuildMode();
      } else if (e.code === 'KeyM') {
        toggleMap();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Ignore if clicking UI overlays or inside build mode
      if (
        isBuildMode ||
        isFeedbackOpen ||
        isFinishExplorationOpen ||
        isHelpOpen ||
        isMapOpen ||
        (e.target as HTMLElement)?.closest('button') ||
        (e.target as HTMLElement)?.closest('.glass-panel')
      ) {
        return;
      }

      soundEngine.ensureContext();

      if (e.button === 0) {
        isMouseDown.current = true;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        // Attempt pointer lock for first-person FPS mouse look
        if (!isPointerLocked.current && gl.domElement?.requestPointerLock) {
          gl.domElement.requestPointerLock().catch(() => {});
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isBuildMode) return;

      if (isPointerLocked.current) {
        // High-precision pointer-locked look
        const sensitivity = 0.0022;
        yaw.current -= e.movementX * sensitivity;
        pitch.current = Math.max(-1.42, Math.min(1.42, pitch.current - e.movementY * sensitivity));
      } else if (isMouseDown.current) {
        // Fallback drag-look when pointer lock is unengaged
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        lastMousePos.current = { x: e.clientX, y: e.clientY };

        yaw.current -= dx * 0.0035;
        pitch.current = Math.max(-1.42, Math.min(1.42, pitch.current + dy * 0.0035));
      }
    };

    const handleMouseUp = () => {
      isMouseDown.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('pointerlockchange', handleLockChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gl.domElement, contextPrompt, isBuildMode, isFeedbackOpen, isFinishExplorationOpen, isHelpOpen, isMapOpen, boardCraft, triggerLandmarkInteraction, toggleBuildMode, toggleMap]);

  // Movement & Grounded Physics Loop
  useFrame((_, delta) => {
    // Pause physics if modal or flight transition is active
    if (isFeedbackOpen || isFinishExplorationOpen || isHelpOpen || isMapOpen || travelState !== 'on_planet') {
      return;
    }

    const moveDirection = new THREE.Vector3();

    if (keys.current['KeyW'] || keys.current['ArrowUp']) moveDirection.z -= 1;
    if (keys.current['KeyS'] || keys.current['ArrowDown']) moveDirection.z += 1;
    if (keys.current['KeyA'] || keys.current['ArrowLeft']) moveDirection.x -= 1;
    if (keys.current['KeyD'] || keys.current['ArrowRight']) moveDirection.x += 1;

    const isMoving = moveDirection.lengthSq() > 0;
    const isSprinting = (keys.current['ShiftLeft'] || keys.current['ShiftRight']) && isMoving;
    const maxSpeed = planetRules.moveSpeed * (isSprinting ? 1.55 : 1.0);

    // Target velocity in world space
    const targetVelocity = new THREE.Vector3();
    if (isMoving) {
      moveDirection.normalize();
      const forward = new THREE.Vector3(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
      const right = new THREE.Vector3(Math.cos(yaw.current), 0, -Math.sin(yaw.current));

      targetVelocity
        .addScaledVector(forward, -moveDirection.z)
        .addScaledVector(right, moveDirection.x)
        .normalize()
        .multiplyScalar(maxSpeed);
    }

    // Smooth physical acceleration and braking deceleration
    const accelRate = isMoving ? 24 : 32;
    velocity.current.x = THREE.MathUtils.damp(
      velocity.current.x,
      targetVelocity.x,
      accelRate,
      delta
    );
    velocity.current.z = THREE.MathUtils.damp(
      velocity.current.z,
      targetVelocity.z,
      accelRate,
      delta
    );

    // Apply horizontal displacement
    position.current.x += velocity.current.x * delta;
    position.current.z += velocity.current.z * delta;

    // Ground surface height detection (supports contoured dunes & undulating terrain)
    const surfaceElevation = getTerrainElevation(position.current.x, position.current.z);

    // Jumping
    if (keys.current['Space'] && isGrounded.current) {
      velocityY.current = planetRules.jumpForce;
      isGrounded.current = false;
      wasGrounded.current = false;
      soundEngine.playJump();
    }

    // Gravity & Ground Detection
    if (!isGrounded.current) {
      velocityY.current -= planetRules.gravity * delta;
      position.current.y += velocityY.current * delta;

      // Check touchdown against dynamic surface elevation
      if (position.current.y <= surfaceElevation) {
        position.current.y = surfaceElevation;
        velocityY.current = 0;
        isGrounded.current = true;

        if (!wasGrounded.current) {
          // Subtle camera dip upon touching the ground
          landingDip.current = -0.14;
          soundEngine.playLandingThud();
          wasGrounded.current = true;
        }
      }
    } else {
      // Smoothly follow terrain surface contour while walking
      position.current.y = THREE.MathUtils.lerp(position.current.y, surfaceElevation, Math.min(1, delta * 20));
      wasGrounded.current = true;
    }

    // -------------------------------------------------------------
    // Solid Collisions Handling (Cylinder vs Cylinder sliding)
    // -------------------------------------------------------------
    const playerRadius = 0.55;
    const obstacles: CollisionObstacle[] = [
      // 1. The Parked Rocket on Landing Pad
      { x: -6.5, z: 4, radius: 2.4 },
      // 2. Central Planet Landmark
      {
        x: PLANET_CATALOG[activePlanet]?.landmark.position[0] || 0,
        z: PLANET_CATALOG[activePlanet]?.landmark.position[2] || -12,
        radius: 2.5,
      },
    ];

    // Add solid user-placed objects
    for (const obj of objects) {
      if (
        obj.type === 'star_monolith' ||
        obj.type === 'resonant_crystal' ||
        obj.type === 'geometric_monument'
      ) {
        obstacles.push({
          x: obj.transform.position[0],
          z: obj.transform.position[2],
          radius: 0.9,
        });
      }
    }

    // Resolve collision penetration
    for (const obs of obstacles) {
      const dx = position.current.x - obs.x;
      const dz = position.current.z - obs.z;
      const dist = Math.hypot(dx, dz);
      const minDistance = obs.radius + playerRadius;

      if (dist < minDistance && dist > 0.001) {
        const overlap = minDistance - dist;
        const nx = dx / dist;
        const nz = dz / dist;
        position.current.x += nx * overlap;
        position.current.z += nz * overlap;
      }
    }

    // Natural perimeter boundary constraint
    const distFromCenter = Math.hypot(position.current.x, position.current.z);
    if (distFromCenter > 33.5) {
      const angle = Math.atan2(position.current.z, position.current.x);
      position.current.x = Math.cos(angle) * 33.4;
      position.current.z = Math.sin(angle) * 33.4;
    }

    // Graceful recovery if falling out of recoverable bounds
    if (position.current.y < -12) {
      position.current.set(0, 0.0, 3.5);
      velocity.current.set(0, 0, 0);
      velocityY.current = 0;
      isGrounded.current = true;
      wasGrounded.current = true;
    }

    // -------------------------------------------------------------
    // Proximity checking for Rocket & Landmark
    // -------------------------------------------------------------
    const distToRocket = Math.hypot(position.current.x - (-6.5), position.current.z - 4);
    if (distToRocket < 4.8) {
      setIsNearRocket(true);
      setContextPrompt('Board Spacecraft Cockpit [E]');
    } else {
      setIsNearRocket(false);
      const landmarkPos = PLANET_CATALOG[activePlanet]?.landmark.position || [0, 0, -12];
      const distToLandmark = Math.hypot(
        position.current.x - landmarkPos[0],
        position.current.z - landmarkPos[2]
      );
      if (distToLandmark < 5.0) {
        setContextPrompt(`${PLANET_CATALOG[activePlanet]?.landmark.actionPrompt} [E]`);
      } else {
        if (
          contextPrompt?.includes('Spacecraft') ||
          contextPrompt?.includes('channel') ||
          contextPrompt?.includes('Awaken') ||
          contextPrompt?.includes('Attune') ||
          contextPrompt?.includes('Refract') ||
          contextPrompt?.includes('Commune') ||
          contextPrompt?.includes('Sync') ||
          contextPrompt?.includes('Wind') ||
          contextPrompt?.includes('Kindle') ||
          contextPrompt?.includes('Resonate')
        ) {
          setContextPrompt(null);
        }
      }
    }

    // -------------------------------------------------------------
    // First-Person Camera Motion Dynamics
    // -------------------------------------------------------------
    // Head bobbing while walking / sprinting on ground
    let headBob = 0;
    let headTilt = 0;
    if (isMoving && isGrounded.current) {
      walkCycle.current += delta * (isSprinting ? 12.0 : 8.5);
      headBob = Math.sin(walkCycle.current) * (isSprinting ? 0.035 : 0.022);
      headTilt = Math.cos(walkCycle.current * 0.5) * (isSprinting ? 0.008 : 0.004);

      // Trigger synchronized footstep audio
      soundEngine.playFootstep(isSprinting);
    } else {
      walkCycle.current = 0;
    }

    // Recover smoothly from landing compression dip
    landingDip.current = THREE.MathUtils.damp(landingDip.current, 0, 9.5, delta);

    // Eye-level camera height (~1.68m)
    const eyeHeight = 1.68;
    camera.position.set(
      position.current.x,
      position.current.y + eyeHeight + headBob + landingDip.current,
      position.current.z
    );

    // True first-person perspective orientation
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw.current;
    camera.rotation.x = pitch.current;
    camera.rotation.z = headTilt;

    // Report movement update to parent and multiplayer synchronization
    onMoveUpdate(
      [position.current.x, position.current.y, position.current.z],
      [0, yaw.current, 0],
      velocity.current.lengthSq() > 0.05,
      isSprinting && isMoving,
      isGrounded.current
    );
  });

  return null;
}
