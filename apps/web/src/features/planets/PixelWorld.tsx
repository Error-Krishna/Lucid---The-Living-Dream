import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { RocketLandingPad } from '../spacecraft/RocketLandingPad.js';

interface PixelWorldProps {
  playerPosition: [number, number, number];
  isNearRocket?: boolean;
}

export function PixelWorld({
  playerPosition,
  isNearRocket = false,
}: PixelWorldProps) {
  const monolithRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (monolithRef.current) {
      monolithRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group>
      {/* Sky & Grid Atmosphere */}
      <color attach="background" args={['#040b17']} />
      <fog attach="fog" args={['#07182c', 14, 55]} />
      <ambientLight intensity={0.8} color="#6ee7b7" />
      <directionalLight position={[-20, 25, 10]} intensity={1.2} color="#34d399" />
      <pointLight position={[0, 8, -10]} intensity={2.2} color="#10b981" distance={28} />

      {/* Stepped Voxel Ground Plane */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[44, 1, 44]} />
        <meshStandardMaterial
          color="#06203a"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Digital Grid Lines */}
      <gridHelper args={[44, 22, '#10b981', '#0a3652']} position={[0, 0.01, 0]} />

      {/* Stepping Voxel Terraces */}
      {[
        { pos: [-8, 0.75, -6], size: [4, 1.5, 4], color: '#0f3d59' },
        { pos: [-6, 1.75, -8], size: [2, 1.5, 2], color: '#134e4a' },
        { pos: [8, 0.75, -6], size: [4, 1.5, 4], color: '#0f3d59' },
        { pos: [10, 1.75, -4], size: [2, 1.5, 2], color: '#134e4a' },
        { pos: [-10, 0.5, 1], size: [3, 1, 3], color: '#0f3d59' },
        { pos: [9, 0.5, 1], size: [3, 1, 3], color: '#0f3d59' },
      ].map((block, i) => (
        <mesh key={i} position={block.pos as any}>
          <boxGeometry args={block.size as any} />
          <meshStandardMaterial
            color={block.color}
            roughness={0.7}
            metalness={0.3}
          />
        </mesh>
      ))}

      {/* Floating Pixel Data Cubes */}
      {[
        { pos: [-4, 3, -4], color: '#34d399', size: 0.7 },
        { pos: [5, 3.5, -5], color: '#10b981', size: 0.9 },
        { pos: [-7, 4, 0], color: '#38bdf8', size: 0.6 },
        { pos: [6, 2.8, 0], color: '#6ee7b7', size: 0.8 },
      ].map((cube, i) => (
        <Float key={i} speed={2} rotationIntensity={0.6} floatIntensity={0.7}>
          <mesh position={cube.pos as any}>
            <boxGeometry args={[cube.size, cube.size, cube.size]} />
            <meshStandardMaterial
              color={cube.color}
              emissive={cube.color}
              emissiveIntensity={0.6}
              roughness={0.3}
              metalness={0.5}
            />
          </mesh>
        </Float>
      ))}

      {/* Landmark: Bit-Monolith 01 */}
      <group ref={monolithRef} position={[0, 2.5, -10]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1.4, 5.0, 1.4]} />
          <meshStandardMaterial
            color="#042f2e"
            emissive="#10b981"
            emissiveIntensity={0.9}
            roughness={0.2}
            metalness={0.8}
            wireframe={false}
          />
        </mesh>
        {/* Floating Ring of Pixels */}
        {[-1.2, 1.2].map((x, i) => (
          <mesh key={i} position={[x, 1.5, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshBasicMaterial color="#34d399" />
          </mesh>
        ))}
        <Billboard position={[0, 4.2, 0]}>
          <Text
            fontSize={0.35}
            color="#a7f3d0"
            anchorX="center"
            outlineWidth={0.04}
            outlineColor="#040b17"
          >
            Bit-Monolith 01
          </Text>
        </Billboard>
      </group>

      {/* Rocket Landing Pad */}
      <RocketLandingPad position={[-6.5, 0, 4]} isNearRocket={isNearRocket} />
    </group>
  );
}
