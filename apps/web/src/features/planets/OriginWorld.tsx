import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetaryAtmosphereAndSun } from './PlanetaryAtmosphereAndSun.js';
import { getPlanetEnvironment } from './planetEnvironmentConfig.js';
import { RocketLandingPad } from '../spacecraft/RocketLandingPad.js';
import { DetailedTerrain } from '../world/DetailedTerrain.js';
import { ModelAsset } from '../world/ModelAsset.js';
import { PLANET_CATALOG, PlanetId } from '@lucid/shared';

interface OriginWorldProps {
  planetId?: PlanetId;
  playerPosition: [number, number, number];
  isNearRocket?: boolean;
}

export function OriginWorld({
  planetId = 'origin',
  playerPosition,
  isNearRocket = false,
}: OriginWorldProps) {
  const landmarkRingRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Group>(null);

  const envConfig = getPlanetEnvironment(planetId);
  const planetMeta = PLANET_CATALOG[planetId] || PLANET_CATALOG['origin'];
  const theme = planetMeta.visualTheme;

  useFrame((state, delta) => {
    if (landmarkRingRef.current) {
      landmarkRingRef.current.rotation.z += delta * 0.35;
      landmarkRingRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.6) * 0.25;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group>
      {/* Complete Planetary Atmosphere, Visible Sun & Soft Lighting System */}
      <PlanetaryAtmosphereAndSun config={envConfig} />

      {/* Distant Ringed Moon in the Celestial Sky */}
      <group position={[-50, 55, -95]}>
        <mesh>
          <sphereGeometry args={[11, 32, 32]} />
          <meshStandardMaterial
            color="#cbd5e1"
            emissive={envConfig.sun.coronaColor}
            emissiveIntensity={0.25}
            roughness={0.55}
          />
        </mesh>
        <mesh rotation={[1.2, 0.4, 0]}>
          <ringGeometry args={[15, 23, 48]} />
          <meshBasicMaterial
            color={theme.accentColor || '#818cf8'}
            side={THREE.DoubleSide}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>

      {/* PBR Textured Detailed Terrain with Seamless Horizon Skirt */}
      <DetailedTerrain
        radius={36}
        skirtRadius={190}
        textureType={envConfig.terrain.textureType}
        groundColor={envConfig.terrain.groundColor}
        skirtColor={envConfig.terrain.skirtColor}
        showHorizonRidges={true}
        ridgeColor={envConfig.horizon.color}
        ridgeHeight={envConfig.horizon.height}
      />

      {/* The Landing Zone with the Spacecraft on Pad */}
      <RocketLandingPad position={[-6.5, 0, 4]} isNearRocket={isNearRocket} />

      {/* Rocks and Boulders around Landing Zone */}
      <ModelAsset
        url="/assets/models/rock_large.glb"
        position={[-10.5, 0, 6.5]}
        rotation={[0, 0.8, 0]}
        scale={1.6}
      />
      <ModelAsset
        url="/assets/models/rock_large.glb"
        position={[-2.5, 0, 5.8]}
        rotation={[0, -1.2, 0]}
        scale={1.4}
      />
      <ModelAsset
        url="/assets/models/rock_spire.glb"
        position={[-11.5, 0, 2.5]}
        rotation={[0.1, 0.4, 0]}
        scale={1.5}
      />

      {/* Midground Exploration Features: Glowing Alien Flora */}
      <ModelAsset
        url="/assets/models/alien_tree.glb"
        position={[-11, 0, 2]}
        scale={1.8}
        tint="#c7d2fe"
      />
      <ModelAsset
        url="/assets/models/alien_tree.glb"
        position={[12, 0, 1]}
        scale={2.0}
        tint="#ddd6fe"
      />
      <ModelAsset
        url="/assets/models/canopy_tree.glb"
        position={[-8, 0, -4]}
        scale={1.7}
      />
      <ModelAsset
        url="/assets/models/canopy_tree.glb"
        position={[9, 0, -5]}
        scale={1.9}
      />

      {/* Surreal Prismatic Crystals flanking the path */}
      <group position={[-5, 0, -1]}>
        <ModelAsset url="/assets/models/crystal_large.glb" scale={1.8} tint="#a5b4fc" />
        <pointLight color="#818cf8" intensity={1.8} distance={6} position={[0, 1.5, 0]} />
      </group>

      <group position={[5.5, 0, -2]}>
        <ModelAsset url="/assets/models/crystal_cluster.glb" scale={1.6} tint="#c084fc" />
        <pointLight color="#a855f7" intensity={1.6} distance={6} position={[0, 1.2, 0]} />
      </group>

      {/* Impact Crater & Meteor */}
      <ModelAsset
        url="/assets/models/crater.glb"
        position={[-14, 0, 7]}
        scale={2.2}
      />
      <ModelAsset
        url="/assets/models/meteor.glb"
        position={[-14, 0.2, 7]}
        scale={1.2}
      />

      {/* Perimeter Cliffs / Mountains Framing the Horizon */}
      {[
        { pos: [-24, 0, -12], rot: [0, 0.6, 0], scale: 3.2 },
        { pos: [-18, 0, -22], rot: [0, 1.1, 0], scale: 3.5 },
        { pos: [0, 0, -27], rot: [0, 0, 0], scale: 3.8 },
        { pos: [18, 0, -22], rot: [0, -1.0, 0], scale: 3.4 },
        { pos: [25, 0, -10], rot: [0, -0.7, 0], scale: 3.2 },
        { pos: [26, 0, 8], rot: [0, -1.8, 0], scale: 3.0 },
        { pos: [19, 0, 20], rot: [0, -2.4, 0], scale: 3.2 },
        { pos: [-20, 0, 19], rot: [0, 2.3, 0], scale: 3.1 },
        { pos: [-26, 0, 7], rot: [0, 1.5, 0], scale: 3.3 },
      ].map((cliff, i) => (
        <ModelAsset
          key={i}
          url="/assets/models/cliff_formation.glb"
          position={cliff.pos as [number, number, number]}
          rotation={cliff.rot as [number, number, number]}
          scale={cliff.scale}
        />
      ))}

      {/* Landmark: The Ancient Monolith of Origin */}
      <group position={[0, 0, -12]}>
        {/* Ancient Gate Complex */}
        <ModelAsset
          url="/assets/models/monument_gate.glb"
          scale={2.4}
          position={[0, 0, 0]}
        />

        {/* Orbiting Resonant Ring */}
        <mesh ref={landmarkRingRef} position={[0, 3.8, 0]} rotation={[0.8, 0, 0]}>
          <torusGeometry args={[2.8, 0.08, 16, 64]} />
          <meshStandardMaterial
            color="#a855f7"
            emissive="#7c3aed"
            emissiveIntensity={1.2}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Levitating Resonant Core Crystal */}
        <group ref={coreRef} position={[0, 3.8, 0]}>
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
            <ModelAsset
              url="/assets/models/crystal_large.glb"
              scale={2.2}
              tint="#c084fc"
            />
          </Float>
        </group>

        {/* Monument Light Pillar */}
        <pointLight position={[0, 4.5, 0]} intensity={3.5} color="#818cf8" distance={25} />

        {/* Landmark Label */}
        <Billboard position={[0, 6.8, 0]}>
          <Text
            fontSize={0.38}
            color="#f8fafc"
            anchorX="center"
            outlineWidth={0.045}
            outlineColor="#030514"
          >
            {planetMeta.landmark.name.toUpperCase()}
          </Text>
          <Text
            position={[0, -0.45, 0]}
            fontSize={0.22}
            color="#c7d2fe"
            anchorX="center"
            outlineWidth={0.03}
            outlineColor="#030514"
            maxWidth={8}
            textAlign="center"
          >
            {`${planetMeta.landmark.lore} • Press [E]`}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}
