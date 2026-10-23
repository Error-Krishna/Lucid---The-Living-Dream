import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../../../lib/sound.js';
import { useUniverseStore } from '../../../stores/useUniverseStore.js';
import { ModelAsset } from '../../world/ModelAsset.js';

interface ReactiveFloraProps {
  modelUrl: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  name: string;
  glowColor?: string;
  playerPosition: [number, number, number];
}

export function ReactiveFlora({
  modelUrl,
  position,
  rotation = [0, 0, 0],
  scale = 1.0,
  name,
  glowColor = '#ec4899',
  playerPosition,
}: ReactiveFloraProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const addDiscovery = useUniverseStore((s) => s.addDiscovery);

  const [hasHarvested, setHasHarvested] = useState(false);

  const distToPlayer = useMemo(() => {
    return Math.hypot(
      position[0] - playerPosition[0],
      position[2] - playerPosition[2]
    );
  }, [playerPosition, position]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && distToPlayer < 3.5 && !hasHarvested) {
        setHasHarvested(true);
        soundEngine.playPlantHarmonic();
        addDiscovery(
          name,
          'flora',
          'A bioluminescent confectionery organism that photosynthesizes ambient starlight into crystallized sugar essence.'
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [distToPlayer, hasHarvested, name, addDiscovery]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Gentle wind swaying
    groupRef.current.rotation.z = rotation[2] + Math.sin(time * 1.8 + position[0]) * 0.06;
    groupRef.current.rotation.x = rotation[0] + Math.cos(time * 1.5 + position[2]) * 0.04;

    // If player is close, plant breathes faster and glows with bio-luminescence
    const isClose = distToPlayer < 3.8;
    const targetScale = isClose ? scale * 1.15 : scale;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), delta * 5);

    if (lightRef.current) {
      const targetIntensity = isClose ? (hasHarvested ? 1.0 : 2.4) : 0.4;
      lightRef.current.intensity = THREE.MathUtils.lerp(
        lightRef.current.intensity,
        targetIntensity,
        delta * 6
      );
    }
  });

  return (
    <group position={position}>
      <group ref={groupRef} rotation={rotation} scale={scale}>
        <ModelAsset url={modelUrl} />
      </group>

      {/* Bioluminescent Reactive Glow Light */}
      <pointLight
        ref={lightRef}
        position={[0, 0.8 * scale, 0]}
        color={glowColor}
        intensity={0.4}
        distance={5}
      />

      {/* Proximity Interaction Billboard */}
      {distToPlayer < 3.8 && (
        <Billboard position={[0, 1.4 * scale, 0]}>
          <Text
            fontSize={0.2}
            color="#fff"
            anchorX="center"
            outlineWidth={0.03}
            outlineColor="#3b0764"
          >
            {hasHarvested ? `✦ ${name} (Harmonized)` : `✦ [E] Commune with ${name}`}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
