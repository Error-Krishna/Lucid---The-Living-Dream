import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../../../lib/sound.js';
import { useUniverseStore } from '../../../stores/useUniverseStore.js';
import { getTerrainElevation } from '../../world/DetailedTerrain.js';

interface SugarSporelingProps {
  initialPosition: [number, number, number];
  wanderRadius?: number;
  name?: string;
  playerPosition: [number, number, number];
}

export function SugarSporeling({
  initialPosition,
  wanderRadius = 6.0,
  name = 'Sugar Sporeling',
  playerPosition,
}: SugarSporelingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const addDiscovery = useUniverseStore((s) => s.addDiscovery);

  const [state, setState] = useState<'idle' | 'wander' | 'investigate' | 'celebrate'>('wander');
  const [hasInteracted, setHasInteracted] = useState(false);

  // Autonomous waypoint navigation
  const targetPos = useRef(new THREE.Vector3(...initialPosition));
  const currentPos = useRef(new THREE.Vector3(...initialPosition));
  const lastStateChange = useRef(0);
  const nextChirpTime = useRef(4000 + Math.random() * 5000);

  // Keyboard listener for [E] interaction when player is nearby
  const distToPlayer = useMemo(() => {
    return Math.hypot(
      currentPos.current.x - playerPosition[0],
      currentPos.current.z - playerPosition[2]
    );
  }, [playerPosition, currentPos.current.x, currentPos.current.z]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && distToPlayer < 3.2 && !hasInteracted) {
        setHasInteracted(true);
        setState('celebrate');
        soundEngine.playCreatureChirp();
        addDiscovery(
          name,
          'fauna',
          'Curious and peaceful native creature that grazes on powdered strawberry sugar dunes.'
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [distToPlayer, hasInteracted, name, addDiscovery]);

  useFrame((stateCtx, delta) => {
    if (!groupRef.current) return;
    const time = stateCtx.clock.elapsedTime;

    // Check distance to player
    const dx = playerPosition[0] - currentPos.current.x;
    const dz = playerPosition[2] - currentPos.current.z;
    const playerDist = Math.hypot(dx, dz);

    if (playerDist < 4.0 && state !== 'celebrate') {
      // Investigate player with curiosity
      setState('investigate');
      const targetAngle = Math.atan2(dx, dz);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetAngle,
        delta * 6
      );

      // Periodic curious chirp
      if (performance.now() > nextChirpTime.current) {
        soundEngine.playCreatureChirp();
        nextChirpTime.current = performance.now() + 6000 + Math.random() * 6000;
      }
    } else if (state !== 'celebrate') {
      // Normal wandering routine
      if (time - lastStateChange.current > 4.5) {
        lastStateChange.current = time;
        const randAngle = Math.random() * Math.PI * 2;
        const randDist = Math.random() * wanderRadius;
        targetPos.current.x = initialPosition[0] + Math.cos(randAngle) * randDist;
        targetPos.current.z = initialPosition[2] + Math.sin(randAngle) * randDist;
      }

      // Move toward waypoint with animated hopping gait
      const moveDir = targetPos.current.clone().sub(currentPos.current);
      moveDir.y = 0;
      if (moveDir.lengthSq() > 0.1) {
        moveDir.normalize();
        currentPos.current.x += moveDir.x * delta * 1.6;
        currentPos.current.z += moveDir.z * delta * 1.6;

        const targetYaw = Math.atan2(moveDir.x, moveDir.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          targetYaw,
          delta * 8
        );
      }
    }

    // Follow contoured terrain elevation perfectly
    const surfaceY = getTerrainElevation(currentPos.current.x, currentPos.current.z);
    const hopHeight = state === 'celebrate'
      ? Math.abs(Math.sin(time * 12)) * 0.45
      : Math.abs(Math.sin(time * 7)) * 0.18;

    currentPos.current.y = surfaceY + hopHeight;
    groupRef.current.position.copy(currentPos.current);

    // Squash and stretch head bounce
    if (headRef.current) {
      headRef.current.scale.y = 1.0 + Math.sin(time * 7) * 0.12;
      headRef.current.scale.x = 1.0 - Math.sin(time * 7) * 0.08;
      headRef.current.scale.z = 1.0 - Math.sin(time * 7) * 0.08;
    }
  });

  return (
    <group ref={groupRef} position={initialPosition}>
      {/* Creature Body Hierarchy */}
      <group ref={headRef} position={[0, 0.35, 0]}>
        {/* Soft Gumdrop Torso */}
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshStandardMaterial
            color="#fb7185"
            roughness={0.25}
            metalness={0.15}
          />
        </mesh>

        {/* Strawberry Mushroom Cap */}
        <mesh position={[0, 0.22, 0]} castShadow>
          <coneGeometry args={[0.42, 0.28, 16]} />
          <meshStandardMaterial
            color="#f43f5e"
            roughness={0.3}
            metalness={0.2}
          />
        </mesh>

        {/* Sugar Polka Dots on Cap */}
        {[0, 1.2, 2.4, 3.6, 4.8].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.26,
              0.2,
              Math.sin(angle) * 0.26,
            ]}
          >
            <sphereGeometry args={[0.045, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}

        {/* Cute Big Cartoon Eyes */}
        <group position={[0, 0.06, 0.28]}>
          {/* Left Eye */}
          <group position={[-0.1, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.065, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
          </group>

          {/* Right Eye */}
          <group position={[0.1, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.065, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0, 0.04]}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
          </group>
        </group>
      </group>

      {/* Tiny Rounded Feet */}
      <mesh position={[-0.14, 0.06, 0]} castShadow>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#fb7185" roughness={0.4} />
      </mesh>
      <mesh position={[0.14, 0.06, 0]} castShadow>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#fb7185" roughness={0.4} />
      </mesh>

      {/* Soft Contact Drop Shadow Decal */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.45} depthWrite={false} />
      </mesh>

      {/* Contextual Interaction Text Billboard when player is close */}
      {distToPlayer < 4.0 && (
        <Billboard position={[0, 0.95, 0]}>
          <Text
            fontSize={0.2}
            color="#fff"
            anchorX="center"
            outlineWidth={0.03}
            outlineColor="#3b0764"
          >
            {hasInteracted ? `✦ ${name} (Observed)` : `✦ [E] Observe ${name}`}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
