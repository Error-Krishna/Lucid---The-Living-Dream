import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Billboard, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { RocketLandingPad } from '../spacecraft/RocketLandingPad.js';
import { DetailedTerrain } from '../world/DetailedTerrain.js';
import { ModelAsset } from '../world/ModelAsset.js';

interface AbyssWorldProps {
  playerPosition: [number, number, number];
  isNearRocket?: boolean;
}

export function AbyssWorld({
  playerPosition,
  isNearRocket = false,
}: AbyssWorldProps) {
  const obeliskRef = useRef<THREE.Group>(null);
  const bubbleGroupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (obeliskRef.current) {
      obeliskRef.current.rotation.y += delta * 0.15;
    }

    if (bubbleGroupRef.current) {
      bubbleGroupRef.current.children.forEach((b, i) => {
        b.position.y += delta * (0.8 + (i % 3) * 0.3);
        if (b.position.y > 10) {
          b.position.y = 0.5;
        }
      });
    }
  });

  return (
    <group>
      {/* Deep Ocean Fog & Atmospheric Water Shimmer */}
      <color attach="background" args={['#010912']} />
      <fog attach="fog" args={['#021220', 14, 65]} />

      {/* Bioluminescent Deep Sea Glow */}
      <ambientLight intensity={0.65} color="#5eead4" />
      <hemisphereLight args={['#2dd4bf', '#021e2f', 0.6]} />
      <directionalLight
        position={[10, 30, 15]}
        intensity={1.2}
        color="#a7f3d0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-bias={-0.0001}
      />

      <Stars radius={70} depth={40} count={1800} factor={2} saturation={0.9} fade />

      {/* Submerged Seabed Terrain */}
      <DetailedTerrain radius={30} textureType="sand" groundColor="#021e2f" />

      {/* Landing Zone with Parked Spacecraft */}
      <RocketLandingPad position={[-6.5, 0, 4]} isNearRocket={isNearRocket} />

      {/* Deep Seabed Rocks & Ancient Hydrothermal Vents */}
      <ModelAsset
        url="/assets/models/rock_large.glb"
        position={[-5, 0, 8]}
        scale={1.5}
        tint="#0f766e"
      />
      <ModelAsset
        url="/assets/models/rock_large.glb"
        position={[5.5, 0, 7.5]}
        scale={1.4}
        tint="#115e59"
      />
      <ModelAsset
        url="/assets/models/rock_spire.glb"
        position={[-7.5, 0, 4.5]}
        scale={1.7}
        tint="#0f766e"
      />

      {/* Bioluminescent Coral & Hydrothermal Crystals */}
      <group position={[-6, 0, -1]}>
        <ModelAsset url="/assets/models/crystal_large.glb" scale={1.8} tint="#14b8a6" />
        <pointLight color="#2dd4bf" intensity={2.0} distance={7} position={[0, 1.5, 0]} />
      </group>

      <group position={[6.5, 0, -2]}>
        <ModelAsset url="/assets/models/crystal_cluster.glb" scale={1.6} tint="#06b6d4" />
        <pointLight color="#06b6d4" intensity={1.8} distance={7} position={[0, 1.2, 0]} />
      </group>

      {/* Rising Bubble Particles */}
      <group ref={bubbleGroupRef}>
        {[
          [-3, 1, -2],
          [4, 2, -4],
          [-6, 3, 3],
          [2, 0.5, 1],
          [-2, 2.5, -6],
          [5, 4, 2],
        ].map((pos, i) => (
          <mesh key={i} position={pos as [number, number, number]}>
            <sphereGeometry args={[0.08 + (i % 3) * 0.04, 12, 12]} />
            <meshStandardMaterial
              color="#67e8f9"
              transparent
              opacity={0.65}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        ))}
      </group>

      {/* Perimeter Trench Cliffs */}
      {[
        { pos: [-24, 0, -14], rot: [0, 0.4, 0], scale: 3.2 },
        { pos: [-18, 0, -23], rot: [0, 1.0, 0], scale: 3.4 },
        { pos: [0, 0, -28], rot: [0, 0, 0], scale: 3.6 },
        { pos: [18, 0, -23], rot: [0, -0.9, 0], scale: 3.3 },
        { pos: [25, 0, -12], rot: [0, -0.6, 0], scale: 3.1 },
        { pos: [26, 0, 7], rot: [0, -1.7, 0], scale: 3.0 },
        { pos: [18, 0, 20], rot: [0, -2.3, 0], scale: 3.1 },
        { pos: [-19, 0, 20], rot: [0, 2.2, 0], scale: 3.0 },
        { pos: [-26, 0, 6], rot: [0, 1.4, 0], scale: 3.2 },
      ].map((cliff, i) => (
        <ModelAsset
          key={i}
          url="/assets/models/cliff_formation.glb"
          position={cliff.pos as [number, number, number]}
          rotation={cliff.rot as [number, number, number]}
          scale={cliff.scale}
          tint="#022c44"
        />
      ))}

      {/* Landmark: The Sunken Trench Shrine */}
      <group position={[0, 0, -13]}>
        <ModelAsset url="/assets/models/monument_gate.glb" scale={2.4} tint="#0f766e" />

        <group ref={obeliskRef} position={[0, 3.8, 0]}>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
            <ModelAsset url="/assets/models/crystal_large.glb" scale={2.2} tint="#2dd4bf" />
          </Float>
        </group>

        <pointLight position={[0, 4.5, 0]} intensity={3.5} color="#2dd4bf" distance={25} />

        <Billboard position={[0, 7.0, 0]}>
          <Text
            fontSize={0.38}
            color="#f0fdfa"
            anchorX="center"
            outlineWidth={0.045}
            outlineColor="#021220"
          >
            THE SUNKEN TRENCH SHRINE
          </Text>
          <Text
            position={[0, -0.45, 0]}
            fontSize={0.22}
            color="#5eead4"
            anchorX="center"
            outlineWidth={0.03}
            outlineColor="#021220"
          >
            Submerged Oceanic Relic • Press [E] to Commune
          </Text>
        </Billboard>
      </group>
    </group>
  );
}
