import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { soundEngine } from '../../../lib/sound.js';
import { useUniverseStore } from '../../../stores/useUniverseStore.js';

interface SugarWispProps {
  initialPosition: [number, number, number];
  name?: string;
  playerPosition: [number, number, number];
}

export function SugarWisp({
  initialPosition,
  name = 'Sugar Wisp',
  playerPosition,
}: SugarWispProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const addDiscovery = useUniverseStore((s) => s.addDiscovery);

  const [hasTuned, setHasTuned] = useState(false);

  const distToPlayer = useMemo(() => {
    return Math.hypot(
      initialPosition[0] - playerPosition[0],
      initialPosition[2] - playerPosition[2]
    );
  }, [playerPosition, initialPosition]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyE' && distToPlayer < 3.8 && !hasTuned) {
        setHasTuned(true);
        soundEngine.playPlantHarmonic();
        addDiscovery(
          name,
          'fauna',
          'Floating harmonic dream entity that drifts above candy spires and resonates with sweet synth frequencies.'
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [distToPlayer, hasTuned, name, addDiscovery]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Sinusoidal floating drift
    groupRef.current.position.y = initialPosition[1] + Math.sin(time * 2.2) * 0.45;
    groupRef.current.position.x = initialPosition[0] + Math.sin(time * 0.8) * 0.6;
    groupRef.current.position.z = initialPosition[2] + Math.cos(time * 0.8) * 0.6;

    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 1.5;
      ringRef.current.rotation.x += delta * 0.8;
    }
  });

  return (
    <group ref={groupRef} position={initialPosition}>
      {/* Bioluminescent Wisp Core */}
      <mesh>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={1.4}
          roughness={0.1}
          metalness={0.2}
        />
      </mesh>

      {/* Orbiting Resonant Ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[0.38, 0.02, 12, 32]} />
        <meshBasicMaterial color="#f472b6" transparent opacity={0.75} />
      </mesh>

      {/* Soft Ambient Glow Light */}
      <pointLight color="#38bdf8" intensity={1.6} distance={5} />

      {/* Ground Contact Shadow Projection */}
      <mesh position={[0, -initialPosition[1] + 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.28, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} depthWrite={false} />
      </mesh>

      {/* Interaction prompt billboard */}
      {distToPlayer < 4.5 && (
        <Billboard position={[0, 0.65, 0]}>
          <Text
            fontSize={0.2}
            color="#fff"
            anchorX="center"
            outlineWidth={0.03}
            outlineColor="#0369a1"
          >
            {hasTuned ? `✦ ${name} (Resonating)` : `✦ [E] Attune to ${name}`}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
