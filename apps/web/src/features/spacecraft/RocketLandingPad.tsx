import React from 'react';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { Spacecraft } from './Spacecraft.js';

interface RocketLandingPadProps {
  position?: [number, number, number];
  isNearRocket?: boolean;
}

export function RocketLandingPad({
  position = [0, 0, 6],
  isNearRocket = false,
}: RocketLandingPadProps) {
  return (
    <group position={position}>
      {/* Heavy-Duty Reinforced Landing Deck */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[3.8, 4.2, 0.15, 32]} />
        <meshStandardMaterial
          color="#1e2230"
          roughness={0.65}
          metalness={0.6}
        />
      </mesh>

      {/* Inner Blast Plating Plate */}
      <mesh position={[0, 0.13, 0]} receiveShadow>
        <cylinderGeometry args={[2.8, 3.0, 0.02, 32]} />
        <meshStandardMaterial
          color="#0f1422"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Hazard Caution Warning Ring */}
      <mesh position={[0, 0.145, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.3, 3.5, 32]} />
        <meshStandardMaterial
          color="#fbbf24"
          roughness={0.5}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Concentric Guidance Ring */}
      <mesh position={[0, 0.145, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.35, 32]} />
        <meshBasicMaterial
          color={isNearRocket ? '#38bdf8' : '#6366f1'}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Perimeter Deck Landing Beacons (8 directional LED pucks) */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const angle = (i * Math.PI) / 4;
        const x = Math.cos(angle) * 3.6;
        const z = Math.sin(angle) * 3.6;
        return (
          <group key={i} position={[x, 0.12, z]}>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.08, 0.1, 0.1, 12]} />
              <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.11, 0]}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshBasicMaterial color={isNearRocket ? '#38bdf8' : '#fbbf24'} />
            </mesh>
          </group>
        );
      })}

      {/* Soft Ground Contact Shadow Beneath Pad */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[4.6, 32]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.55} side={THREE.DoubleSide} />
      </mesh>

      {/* Parked Exploration Spacecraft - Grounded on Pad */}
      <group position={[0, 0.15, 0]}>
        <Spacecraft mode="landed" thrusterIntensity={0.1} scale={1.0} />
      </group>
    </group>
  );
}
