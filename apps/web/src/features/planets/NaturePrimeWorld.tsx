import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetaryAtmosphereAndSun } from './PlanetaryAtmosphereAndSun.js';
import { PLANET_ENVIRONMENTS } from './planetEnvironmentConfig.js';
import { RocketLandingPad } from '../spacecraft/RocketLandingPad.js';
import { DetailedTerrain } from '../world/DetailedTerrain.js';
import { ModelAsset } from '../world/ModelAsset.js';

interface NaturePrimeWorldProps {
  playerPosition: [number, number, number];
  isNearRocket?: boolean;
}

export function NaturePrimeWorld({
  playerPosition,
  isNearRocket = false,
}: NaturePrimeWorldProps) {
  const sporeGroupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2;
    }
    if (sporeGroupRef.current) {
      sporeGroupRef.current.rotation.y += delta * 0.08;
    }
  });

  const envConfig = PLANET_ENVIRONMENTS.nature;

  return (
    <group>
      {/* Complete Planetary Atmosphere, Visible Sun & Soft Lighting System */}
      <PlanetaryAtmosphereAndSun config={envConfig} />

      {/* Textured Lush Alien Terrain with Seamless Horizon Skirt */}
      <DetailedTerrain
        radius={36}
        skirtRadius={190}
        textureType="rocky"
        groundColor={envConfig.terrain.groundColor}
        skirtColor={envConfig.terrain.skirtColor}
        showHorizonRidges={true}
        ridgeColor={envConfig.horizon.color}
        ridgeHeight={26}
      />

      {/* Landing Zone with Parked Spacecraft */}
      <RocketLandingPad position={[-6.5, 0, 4]} isNearRocket={isNearRocket} />

      {/* Mossy Boulders & Spires around Landing Site */}
      <ModelAsset
        url="/assets/models/rock_large.glb"
        position={[-5, 0, 8]}
        scale={1.5}
        tint="#047857"
      />
      <ModelAsset
        url="/assets/models/rock_large.glb"
        position={[5.5, 0, 7.5]}
        scale={1.4}
        tint="#065f46"
      />
      <ModelAsset
        url="/assets/models/rock_spire.glb"
        position={[-7.5, 0, 4.5]}
        scale={1.6}
        tint="#047857"
      />

      {/* Bioluminescent Alien Forest Canopy */}
      <ModelAsset url="/assets/models/alien_tree.glb" position={[-10, 0, 0]} scale={2.4} tint="#6ee7b7" />
      <ModelAsset url="/assets/models/alien_tree.glb" position={[11, 0, -2]} scale={2.6} tint="#a7f3d0" />
      <ModelAsset url="/assets/models/canopy_tree.glb" position={[-7, 0, -5]} scale={2.2} tint="#34d399" />
      <ModelAsset url="/assets/models/canopy_tree.glb" position={[8, 0, 3]} scale={2.0} tint="#10b981" />

      {/* Living Spore Crystals */}
      <group position={[-5, 0, -1]}>
        <ModelAsset url="/assets/models/crystal_large.glb" scale={1.8} tint="#10b981" />
        <pointLight color="#34d399" intensity={1.8} distance={7} position={[0, 1.5, 0]} />
      </group>

      <group position={[6, 0, -2]}>
        <ModelAsset url="/assets/models/crystal_cluster.glb" scale={1.6} tint="#6ee7b7" />
        <pointLight color="#10b981" intensity={1.6} distance={7} position={[0, 1.2, 0]} />
      </group>

      {/* Perimeter Cliffs Framing the Primeval Grove */}
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
          tint="#064e3b"
        />
      ))}

      {/* Landmark: The Mother Spore Grove */}
      <group position={[0, 0, -13]}>
        <ModelAsset url="/assets/models/monument_gate.glb" scale={2.4} tint="#047857" />

        {/* Orbiting Spore Swarm */}
        <group ref={sporeGroupRef} position={[0, 3.8, 0]}>
          {[0, 1, 2, 3, 4].map((i) => {
            const angle = (i * Math.PI * 2) / 5;
            return (
              <mesh key={i} position={[Math.cos(angle) * 2.2, Math.sin(angle * 2) * 0.4, Math.sin(angle) * 2.2]}>
                <sphereGeometry args={[0.15, 12, 12]} />
                <meshBasicMaterial color="#a7f3d0" />
              </mesh>
            );
          })}
        </group>

        {/* Core Living Spore Crystal */}
        <group ref={coreRef} position={[0, 3.8, 0]}>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
            <ModelAsset url="/assets/models/crystal_large.glb" scale={2.2} tint="#34d399" />
          </Float>
        </group>

        <pointLight position={[0, 4.5, 0]} intensity={3.5} color="#34d399" distance={25} />

        <Billboard position={[0, 7.0, 0]}>
          <Text
            fontSize={0.38}
            color="#ecfdf5"
            anchorX="center"
            outlineWidth={0.045}
            outlineColor="#064e3b"
          >
            THE MOTHER SPORE GROVE
          </Text>
          <Text
            position={[0, -0.45, 0]}
            fontSize={0.22}
            color="#a7f3d0"
            anchorX="center"
            outlineWidth={0.03}
            outlineColor="#064e3b"
          >
            Bioluminescent Canopy Nexus • Press [E] to Commune
          </Text>
        </Billboard>
      </group>
    </group>
  );
}
