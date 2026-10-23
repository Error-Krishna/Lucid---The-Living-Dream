import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Billboard, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { RocketLandingPad } from '../spacecraft/RocketLandingPad.js';
import { DetailedTerrain } from '../world/DetailedTerrain.js';
import { ModelAsset } from '../world/ModelAsset.js';

interface GlassiaWorldProps {
  playerPosition: [number, number, number];
  isNearRocket?: boolean;
}

export function GlassiaWorld({
  playerPosition,
  isNearRocket = false,
}: GlassiaWorldProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.3;
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group>
      {/* Sky & Crystalline Atmosphere */}
      <color attach="background" args={['#040c1a']} />
      <fog attach="fog" args={['#081e36', 20, 80]} />

      {/* Prismatic Cyan Lighting */}
      <ambientLight intensity={0.65} color="#93c5fd" />
      <hemisphereLight args={['#7dd3fc', '#0c2340', 0.6]} />
      <directionalLight
        position={[20, 40, 15]}
        intensity={1.5}
        color="#e0f2fe"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={90}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-bias={-0.0001}
      />

      <Stars radius={80} depth={50} count={3000} factor={4} saturation={0.8} fade />

      {/* Textured Crystalline Terrain */}
      <DetailedTerrain radius={30} textureType="rocky" groundColor="#0c2340" />

      {/* Landing Zone with Parked Spacecraft */}
      <RocketLandingPad position={[-6.5, 0, 4]} isNearRocket={isNearRocket} />

      {/* Boulders & Crystal Formations */}
      <ModelAsset
        url="/assets/models/rock_large.glb"
        position={[-5, 0, 8]}
        scale={1.5}
        tint="#38bdf8"
      />
      <ModelAsset
        url="/assets/models/rock_large.glb"
        position={[5.5, 0, 7.5]}
        scale={1.4}
        tint="#0284c7"
      />

      {/* Midground Crystals */}
      <group position={[-6.5, 0, -2]}>
        <ModelAsset url="/assets/models/crystal_large.glb" scale={2.2} tint="#7dd3fc" />
        <pointLight color="#38bdf8" intensity={2.0} distance={7} position={[0, 1.8, 0]} />
      </group>

      <group position={[7, 0, -1.5]}>
        <ModelAsset url="/assets/models/crystal_cluster.glb" scale={1.8} tint="#38bdf8" />
        <pointLight color="#7dd3fc" intensity={1.8} distance={7} position={[0, 1.5, 0]} />
      </group>

      <ModelAsset url="/assets/models/rock_spire.glb" position={[-11, 0, 3]} scale={2.0} tint="#0284c7" />
      <ModelAsset url="/assets/models/rock_spire.glb" position={[12, 0, 2]} scale={2.2} tint="#0369a1" />

      {/* Perimeter Cliffs Framing the Crystalline Basin */}
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
          tint="#0f2b48"
        />
      ))}

      {/* Landmark: The Prism Citadel */}
      <group position={[0, 0, -13]}>
        <ModelAsset url="/assets/models/monument_gate.glb" scale={2.5} tint="#0284c7" />

        {/* Orbiting Ring */}
        <mesh ref={ringRef} position={[0, 4.0, 0]} rotation={[0.8, 0.2, 0]}>
          <torusGeometry args={[2.8, 0.1, 16, 64]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>

        {/* Levitating Crystal Core */}
        <group ref={coreRef} position={[0, 4.0, 0]}>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <ModelAsset url="/assets/models/crystal_large.glb" scale={2.5} tint="#bae6fd" />
          </Float>
        </group>

        <pointLight position={[0, 4.5, 0]} intensity={3.5} color="#38bdf8" distance={25} />

        <Billboard position={[0, 7.0, 0]}>
          <Text
            fontSize={0.38}
            color="#f0f9ff"
            anchorX="center"
            outlineWidth={0.045}
            outlineColor="#081e36"
          >
            THE PRISM CITADEL
          </Text>
          <Text
            position={[0, -0.45, 0]}
            fontSize={0.22}
            color="#7dd3fc"
            anchorX="center"
            outlineWidth={0.03}
            outlineColor="#081e36"
          >
            Prismatic Shard Nexus • Press [E] to Refract Light
          </Text>
        </Billboard>
      </group>
    </group>
  );
}
