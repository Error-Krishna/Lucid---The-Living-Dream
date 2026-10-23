import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetId } from '@lucid/shared';

interface SimulatedEchoesProps {
  planetId: PlanetId;
}

export function SimulatedEchoes({ planetId }: SimulatedEchoesProps) {
  const wandererRef = useRef<THREE.Group>(null);
  const echoEntityRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    // Gentle orbit path for The Wanderer in Origin
    if (wandererRef.current && planetId === 'origin') {
      const radius = 9;
      const angle = time * 0.15;
      wandererRef.current.position.x = Math.cos(angle) * radius;
      wandererRef.current.position.z = Math.sin(angle) * radius - 2;
      wandererRef.current.position.y = 1.0 + Math.sin(time * 2) * 0.1;
      wandererRef.current.rotation.y = -angle + Math.PI / 2;
    }

    // Echo Entity hovering near landmarks
    if (echoEntityRef.current) {
      echoEntityRef.current.position.y = 1.8 + Math.sin(time * 1.8) * 0.2;
      echoEntityRef.current.rotation.y += 0.015;
    }
  });

  if (planetId !== 'origin') return null;

  return (
    <group>
      {/* The Wanderer (Lore NPC) */}
      <group ref={wandererRef} position={[6, 1.0, 4]}>
        <Billboard position={[0, 1.8, 0]}>
          <Text
            fontSize={0.22}
            color="#fde047"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#030514"
          >
            [Dream Echo] The Wanderer
          </Text>
        </Billboard>

        <mesh position={[0, 1.35, 0]} rotation={[1.2, 0, 0]}>
          <torusGeometry args={[0.3, 0.02, 16, 32]} />
          <meshBasicMaterial color="#eab308" />
        </mesh>

        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.2} metalness={0.8} />
        </mesh>

        <mesh position={[0, 0.75, 0]}>
          <octahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial
            color="#fde047"
            emissive="#ca8a04"
            emissiveIntensity={1.3}
          />
        </mesh>

        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[0.35, 0.8, 5]} />
          <meshStandardMaterial color="#2e1065" roughness={0.6} metalness={0.2} />
        </mesh>
      </group>

      {/* Echo (Mysterious Entity) */}
      <group ref={echoEntityRef} position={[0, 1.8, -14]}>
        <Billboard position={[0, 1.2, 0]}>
          <Text
            fontSize={0.2}
            color="#a5f3fc"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.03}
            outlineColor="#030514"
          >
            [Dream Echo] Echo
          </Text>
        </Billboard>
        <mesh>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#06b6d4"
            emissiveIntensity={1.6}
            wireframe
          />
        </mesh>
      </group>
    </group>
  );
}
