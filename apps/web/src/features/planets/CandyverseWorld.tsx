import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text, Billboard, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetaryAtmosphereAndSun } from './PlanetaryAtmosphereAndSun.js';
import { PLANET_ENVIRONMENTS } from './planetEnvironmentConfig.js';
import { RocketLandingPad } from '../spacecraft/RocketLandingPad.js';
import { DetailedTerrain } from '../world/DetailedTerrain.js';
import { ModelAsset } from '../world/ModelAsset.js';
import { SugarSporeling } from './creatures/SugarSporeling.js';
import { SugarWisp } from './creatures/SugarWisp.js';
import { ReactiveFlora } from './flora/ReactiveFlora.js';

interface CandyverseWorldProps {
  playerPosition: [number, number, number];
  isNearRocket?: boolean;
}

export function CandyverseWorld({
  playerPosition,
  isNearRocket = false,
}: CandyverseWorldProps) {
  const donutRingRef = useRef<THREE.Group>(null);
  const crystalCrownRef = useRef<THREE.Group>(null);
  const distantMoonRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (donutRingRef.current) {
      donutRingRef.current.rotation.y += delta * 0.35;
      donutRingRef.current.rotation.x = Math.sin(delta * 2) * 0.05;
    }
    if (crystalCrownRef.current) {
      crystalCrownRef.current.rotation.y += delta * 0.5;
    }
    if (distantMoonRef.current) {
      distantMoonRef.current.rotation.y += delta * 0.04;
    }
  });

  const envConfig = PLANET_ENVIRONMENTS.candyverse;

  return (
    <group>
      {/* Complete Planetary Atmosphere, Visible Sun & Soft Lighting System */}
      <PlanetaryAtmosphereAndSun config={envConfig} />

      {/* Distant Celestial Ringed Confection Moon in the Sky */}
      <group position={[-55, 62, -95]} rotation={[0.4, 0.3, 0]}>
        <mesh ref={distantMoonRef}>
          <sphereGeometry args={[12, 32, 32]} />
          <meshStandardMaterial
            color="#fbcfe8"
            emissive="#be185d"
            emissiveIntensity={0.35}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
        {/* Pastel Ring System */}
        <mesh rotation={[1.1, 0.4, 0]}>
          <ringGeometry args={[16, 26, 64]} />
          <meshBasicMaterial
            color="#f472b6"
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Powdered Sugar & Strawberry Cream Dune Terrain with Seamless Horizon Skirt */}
      <DetailedTerrain
        radius={36}
        skirtRadius={190}
        textureType="candy"
        groundColor={envConfig.terrain.groundColor}
        skirtColor={envConfig.terrain.skirtColor}
        showHorizonRidges={true}
        ridgeColor={envConfig.horizon.color}
        ridgeHeight={24}
      />

      {/* Reinforced Landing Zone with Parked Exploration Lander */}
      <RocketLandingPad position={[-6.5, 0, 4]} isNearRocket={isNearRocket} />

      {/* Landing Apron Geological Formations */}
      <ModelAsset
        url="/assets/models/nature/rock_largeA.glb"
        position={[-11, 0, 6.2]}
        rotation={[0, 0.6, 0]}
        scale={1.6}
        tint="#fda4af"
      />
      <ModelAsset
        url="/assets/models/nature/rock_tallA.glb"
        position={[-3, 0, 6.5]}
        rotation={[0, -0.7, 0]}
        scale={1.5}
        tint="#fb7185"
      />

      {/* ============================================================== */}
      {/* LANDMARK: THE GREAT SUGAR SPIRE at [0, 0, -13]                 */}
      {/* ============================================================== */}
      <group position={[0, 0, -13]}>
        {/* Tier 1 Pedestal: Monumental Frosted Birthday Cake */}
        <ModelAsset
          url="/assets/models/candy/cake-birthday.glb"
          position={[0, 0, 0]}
          scale={3.2}
          tint="#fdf2f8"
        />

        {/* Tier 2: Layered Cake Platform */}
        <ModelAsset
          url="/assets/models/candy/cake.glb"
          position={[0, 1.35, 0]}
          scale={2.6}
          tint="#ffe4e6"
        />

        {/* Central Spire Needle: Towering Strawberry Sugar Obelisk */}
        <ModelAsset
          url="/assets/models/rock_spire.glb"
          position={[0, 2.5, 0]}
          scale={[2.2, 5.2, 2.2]}
          tint="#f43f5e"
        />

        {/* Architectural Orbiting Frosted Sprinkle Donut */}
        <group ref={donutRingRef} position={[0, 5.8, 0]}>
          <ModelAsset
            url="/assets/models/candy/donut-sprinkles.glb"
            position={[0, 0, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={3.2}
          />
        </group>

        {/* Levitating Crystal Apex Crown */}
        <group ref={crystalCrownRef} position={[0, 7.8, 0]}>
          <Float speed={2.5} rotationIntensity={0.25} floatIntensity={0.4}>
            <ModelAsset
              url="/assets/models/crystal_large.glb"
              scale={2.6}
              tint="#fbcfe8"
            />
          </Float>
        </group>

        {/* Radiant Spire Pillar of Confection Light */}
        <pointLight position={[0, 6, 0]} intensity={3.5} color="#f472b6" distance={35} />

        {/* Inscription Label Billboard */}
        <Billboard position={[0, 10.2, 0]}>
          <Text
            fontSize={0.42}
            color="#fff1f2"
            anchorX="center"
            outlineWidth={0.05}
            outlineColor="#3b0764"
          >
            THE GREAT SUGAR SPIRE
          </Text>
          <Text
            position={[0, -0.48, 0]}
            fontSize={0.24}
            color="#fbcfe8"
            anchorX="center"
            outlineWidth={0.035}
            outlineColor="#3b0764"
          >
            Confectionery Nexus • Press [E] to Taste Dream
          </Text>
        </Billboard>
      </group>

      {/* ============================================================== */}
      {/* SURREAL CONFECTIONERY MEGALITHS & PROPS                        */}
      {/* ============================================================== */}

      {/* Giant Glazed Donut Megalith (Stonehenge Style) */}
      <group position={[9.5, 0, -5]} rotation={[0, -0.4, 0]}>
        <ModelAsset
          url="/assets/models/candy/donut.glb"
          position={[0, 1.2, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={3.2}
        />
        <pointLight position={[0, 1.5, 0]} color="#f472b6" intensity={1.2} distance={8} />
      </group>

      {/* Giant Chocolate Donut Half-Buried in Dunes */}
      <group position={[-9.5, -0.2, -6]} rotation={[0.3, 0.6, 0.4]}>
        <ModelAsset
          url="/assets/models/candy/donut-chocolate.glb"
          position={[0, 0, 0]}
          scale={3.4}
        />
      </group>

      {/* Monolithic Basalt Waffle Shelves */}
      <group position={[-14, 0, -2]} rotation={[0.2, 0.8, -0.2]}>
        <ModelAsset
          url="/assets/models/candy/waffle.glb"
          scale={3.8}
        />
      </group>
      <group position={[14, 0, 4]} rotation={[-0.1, -0.7, 0.15]}>
        <ModelAsset
          url="/assets/models/candy/waffle.glb"
          scale={3.6}
        />
      </group>

      {/* Giant Swirl Popsicle Trees */}
      <group position={[-5, 0, -7]} rotation={[0, 0.3, 0.08]}>
        <ModelAsset
          url="/assets/models/candy/popsicle.glb"
          position={[0, 1.8, 0]}
          scale={3.4}
        />
        <pointLight position={[0, 2.8, 0]} color="#ec4899" intensity={1.5} distance={7} />
      </group>
      <group position={[6.5, 0, -8]} rotation={[0, -0.4, -0.06]}>
        <ModelAsset
          url="/assets/models/candy/popsicle-chocolate.glb"
          position={[0, 1.8, 0]}
          scale={3.4}
        />
      </group>

      {/* Towering Soft-Serve Cone & Sundae Monoliths */}
      <group position={[-12.5, 0, 7.5]} rotation={[0, 0.5, 0]}>
        <ModelAsset
          url="/assets/models/candy/ice-cream-cne.glb"
          scale={3.0}
        />
      </group>
      <group position={[11.5, 0, -10]} rotation={[0, -0.6, 0]}>
        <ModelAsset
          url="/assets/models/candy/sundae.glb"
          scale={2.4}
        />
        <pointLight position={[0, 1.8, 0]} color="#38bdf8" intensity={1.4} distance={6} />
      </group>

      {/* Giant Cookie Boulders & Chocolate Slabs */}
      <ModelAsset
        url="/assets/models/candy/cookie-chocolate.glb"
        position={[-10, 0, 2]}
        rotation={[0.3, 0.4, 0.1]}
        scale={2.5}
      />
      <ModelAsset
        url="/assets/models/candy/cookie.glb"
        position={[4.5, 0, 7]}
        rotation={[-0.2, -0.5, 0.1]}
        scale={2.2}
      />
      <ModelAsset
        url="/assets/models/candy/chocolate.glb"
        position={[-3.5, 0, 8.5]}
        rotation={[0.1, 0.9, -0.1]}
        scale={2.2}
      />

      {/* Giant Strawberry & Cherry Garnishes */}
      <ModelAsset
        url="/assets/models/candy/strawberry.glb"
        position={[-4.5, 0, -11]}
        rotation={[0, 0.4, 0.2]}
        scale={2.0}
      />
      <ModelAsset
        url="/assets/models/candy/cherries.glb"
        position={[4.2, 0, -11.5]}
        rotation={[0, -0.6, 0]}
        scale={2.0}
      />

      {/* Bioluminescent Confectionery Mushrooms */}
      <group position={[-7.5, 0, -1]}>
        <ModelAsset
          url="/assets/models/nature/mushroom_redTall.glb"
          scale={2.0}
        />
        <pointLight color="#f43f5e" intensity={1.6} distance={6} position={[0, 1.4, 0]} />
      </group>
      <group position={[7, 0, 1]}>
        <ModelAsset
          url="/assets/models/nature/mushroom_redGroup.glb"
          scale={1.8}
        />
        <pointLight color="#fb7185" intensity={1.5} distance={6} position={[0, 1.2, 0]} />
      </group>
      <ModelAsset
        url="/assets/models/nature/mushroom_tanTall.glb"
        position={[-1.5, 0, -6]}
        scale={1.6}
      />

      {/* Candy Blossom Meadows */}
      <ModelAsset
        url="/assets/models/nature/flower_purpleA.glb"
        position={[-2.2, 0, 2]}
        scale={1.4}
      />
      <ModelAsset
        url="/assets/models/nature/flower_yellowA.glb"
        position={[2.5, 0, 3]}
        scale={1.4}
      />
      <ModelAsset
        url="/assets/models/nature/flower_redA.glb"
        position={[-1.2, 0, -4.5]}
        scale={1.4}
      />

      {/* Resonant Amethyst & Cyan Crystals */}
      <group position={[-7.5, 0, 8]}>
        <ModelAsset
          url="/assets/models/crystal_large.glb"
          scale={1.8}
          tint="#ec4899"
        />
        <pointLight color="#ec4899" intensity={1.5} distance={6} position={[0, 1.6, 0]} />
      </group>
      <group position={[8, 0, 8.5]}>
        <ModelAsset
          url="/assets/models/crystal_cluster.glb"
          scale={1.8}
          tint="#38bdf8"
        />
        <pointLight color="#38bdf8" intensity={1.5} distance={6} position={[0, 1.4, 0]} />
      </group>

      {/* ============================================================== */}
      {/* LIVING FAUNA & INDIGENOUS CREATURES                            */}
      {/* ============================================================== */}
      {/* Curious Sugar Sporelings (Hopping Confectionery Critters) */}
      <SugarSporeling
        initialPosition={[-5.5, 0, -4]}
        wanderRadius={5.5}
        name="Sugar Sporeling"
        playerPosition={playerPosition}
      />
      <SugarSporeling
        initialPosition={[6.5, 0, 3.5]}
        wanderRadius={6.0}
        name="Marshmallow Critter"
        playerPosition={playerPosition}
      />

      {/* Floating Harmonic Sugar Wisps */}
      <SugarWisp
        initialPosition={[-2, 2.2, -10]}
        name="Celestial Sugar Wisp"
        playerPosition={playerPosition}
      />
      <SugarWisp
        initialPosition={[8.5, 2.4, -4.5]}
        name="Resonant Dream Wisp"
        playerPosition={playerPosition}
      />

      {/* ============================================================== */}
      {/* REACTIVE LIVING FLORA                                          */}
      {/* ============================================================== */}
      <ReactiveFlora
        modelUrl="/assets/models/nature/mushroom_redTall.glb"
        position={[-3.5, 0, 1.5]}
        scale={2.2}
        name="Singing Sporecap"
        glowColor="#f43f5e"
        playerPosition={playerPosition}
      />
      <ReactiveFlora
        modelUrl="/assets/models/nature/flower_purpleA.glb"
        position={[3.2, 0, -2.5]}
        scale={1.8}
        name="Harmonic Candy Blossom"
        glowColor="#c084fc"
        playerPosition={playerPosition}
      />
      <ReactiveFlora
        modelUrl="/assets/models/candy/cupcake.glb"
        position={[0.8, 0, 5.5]}
        scale={1.6}
        name="Crystalline Frosting Bloom"
        glowColor="#38bdf8"
        playerPosition={playerPosition}
      />

      {/* ============================================================== */}
      {/* PERIMETER HORIZON CALDERA CLIFFS (Enclosing the world)         */}
      {/* ============================================================== */}
      {[
        { pos: [-24, 0, -14], rot: [0, 0.4, 0], scale: 3.4 },
        { pos: [-18, 0, -23], rot: [0, 1.0, 0], scale: 3.5 },
        { pos: [0, 0, -28], rot: [0, 0, 0], scale: 3.7 },
        { pos: [18, 0, -23], rot: [0, -0.9, 0], scale: 3.4 },
        { pos: [25, 0, -12], rot: [0, -0.6, 0], scale: 3.3 },
        { pos: [26, 0, 7], rot: [0, -1.7, 0], scale: 3.2 },
        { pos: [18, 0, 20], rot: [0, -2.3, 0], scale: 3.3 },
        { pos: [0, 0, 26], rot: [0, 3.14, 0], scale: 3.5 },
        { pos: [-19, 0, 20], rot: [0, 2.2, 0], scale: 3.2 },
        { pos: [-26, 0, 6], rot: [0, 1.4, 0], scale: 3.4 },
      ].map((cliff, i) => (
        <ModelAsset
          key={i}
          url="/assets/models/cliff_formation.glb"
          position={cliff.pos as [number, number, number]}
          rotation={cliff.rot as [number, number, number]}
          scale={cliff.scale}
          tint="#f472b6"
        />
      ))}
    </group>
  );
}
