import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Billboard, Text, OrbitControls, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { PLANET_CATALOG, PlanetId, PlanetMetadata } from '@lucid/shared';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { Spacecraft } from '../spacecraft/Spacecraft.js';
import { UniverseHUD } from './UniverseHUD.js';
import { SpacecraftTacticalPanel } from './SpacecraftTacticalPanel.js';

function CelestialPlanet({
  metadata,
  isSelected,
  isVisited,
  onSelect,
}: {
  metadata: PlanetMetadata;
  isSelected: boolean;
  isVisited: boolean;
  onSelect: (id: PlanetId) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Select appropriate texture for planet archetype
  const textureUrl = useMemo(() => {
    if (metadata.id === 'origin') return '/assets/textures/earth_atmos_2048.jpg';
    if (metadata.id === 'candyverse') return '/assets/textures/sand_diff_1k.jpg';
    return '/assets/textures/moon_1024.jpg';
  }, [metadata.id]);

  const planetTexture = useTexture(textureUrl);

  // Cloud texture for worlds with dense atmospheres
  const hasClouds = metadata.id === 'origin' || metadata.id === 'zephyr';
  const cloudsTexture = useTexture('/assets/textures/earth_clouds_1024.png');

  useMemo(() => {
    if (planetTexture) {
      planetTexture.wrapS = planetTexture.wrapT = THREE.RepeatWrapping;
      planetTexture.colorSpace = THREE.SRGBColorSpace;
    }
  }, [planetTexture]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.08;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.12;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.03;
    }
  });

  const { visualTheme } = metadata;

  return (
    <group position={metadata.celestialPosition}>
      {/* Target Marker Ring when hovered/selected */}
      {(hovered || isSelected) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[metadata.radius * 1.35, metadata.radius * 1.45, 48]} />
          <meshBasicMaterial
            color={isSelected ? '#38bdf8' : visualTheme.accentColor}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Orbit Indicator Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[metadata.radius * 1.7, metadata.radius * 1.73, 64]} />
        <meshBasicMaterial
          color={visualTheme.accentColor}
          transparent
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Primary Textured Planet Globe */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(metadata.id);
        }}
        scale={hovered ? [1.05, 1.05, 1.05] : [1, 1, 1]}
      >
        <sphereGeometry args={[metadata.radius, 48, 48]} />
        <meshStandardMaterial
          map={planetTexture}
          color={metadata.id === 'origin' ? '#ffffff' : visualTheme.groundColor}
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>

      {/* Atmospheric Cloud Layer */}
      {hasClouds && (
        <mesh ref={cloudsRef} scale={[1.02, 1.02, 1.02]}>
          <sphereGeometry args={[metadata.radius, 32, 32]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Atmospheric Fresnel Rim Glow */}
      <mesh scale={[1.06, 1.06, 1.06]}>
        <sphereGeometry args={[metadata.radius, 32, 32]} />
        <meshBasicMaterial
          color={visualTheme.accentColor}
          transparent
          opacity={hovered || isSelected ? 0.35 : 0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Planetary Rings with Depth */}
      {metadata.hasRings && (
        <mesh ref={ringRef} rotation={[1.1, 0.4, 0]}>
          <ringGeometry
            args={[metadata.radius * 1.45, metadata.radius * 2.3, 64]}
          />
          <meshStandardMaterial
            color={metadata.ringColor || visualTheme.accentColor}
            side={THREE.DoubleSide}
            transparent
            opacity={0.65}
            roughness={0.4}
            metalness={0.3}
          />
        </mesh>
      )}

      {/* Celestial Name Label */}
      <Billboard position={[0, metadata.radius + 1.3, 0]}>
        <Text
          fontSize={0.52}
          color="#f8fafc"
          anchorX="center"
          outlineWidth={0.045}
          outlineColor="#030514"
        >
          {metadata.name.split('—')[0]}
        </Text>
        <Text
          position={[0, -0.45, 0]}
          fontSize={0.28}
          color={isVisited ? '#34d399' : '#94a3b8'}
          anchorX="center"
          outlineWidth={0.03}
          outlineColor="#030514"
        >
          {isVisited ? '✦ Visited Realm' : '○ Unexplored'}
        </Text>
      </Billboard>
    </group>
  );
}

function DeepSpaceEnvironment() {
  return (
    <>
      <color attach="background" args={['#02040c']} />
      <ambientLight intensity={0.5} color="#94a3b8" />

      {/* Primary Solar Light casting realistic directional illumination across planets */}
      <directionalLight position={[60, 30, 40]} intensity={1.8} color="#fff7ed" />
      <pointLight position={[-40, -20, -50]} intensity={0.6} color="#818cf8" distance={150} />

      {/* Multi-layered Deep Space Starfields */}
      <Stars radius={150} depth={90} count={4500} factor={4} saturation={0.7} fade speed={0.3} />

      {/* Distant Colorful Cosmic Nebulae Formations (Soft Luminous Dust) */}
      {[
        { pos: [-60, 25, -80], color: '#3730a3', size: 18 },
        { pos: [70, -35, -90], color: '#6b21a8', size: 22 },
        { pos: [0, -60, 70], color: '#0e7490', size: 20 },
      ].map((neb, i) => (
        <Float key={i} speed={0.4} rotationIntensity={0.05} floatIntensity={0.15}>
          <mesh position={neb.pos as [number, number, number]}>
            <sphereGeometry args={[neb.size, 16, 16]} />
            <meshBasicMaterial
              color={neb.color}
              transparent
              opacity={0.08}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

export function UniverseView() {
  const selectedDestination = useUniverseStore((s) => s.selectedDestination);
  const selectDestination = useUniverseStore((s) => s.selectDestination);
  const visitedPlanets = useUniverseStore((s) => s.visitedPlanets);

  const planets = Object.values(PLANET_CATALOG);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#02040c]">
      {/* 3D Universe Navigation Canvas */}
      <Canvas
        camera={{ position: [0, 14, 38], fov: 55 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <DeepSpaceEnvironment />

        {/* Orbit Controls to Pan and Explore the Universe */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxDistance={80}
          minDistance={8}
          maxPolarAngle={Math.PI / 1.7}
        />

        {/* The Player's Spaceship in Space */}
        <group position={[0, 0, 8]} rotation={[0.1, -0.4, 0]}>
          <Spacecraft mode="space" thrusterIntensity={0.8} scale={1.2} />
        </group>

        {/* All Planetary Celestial Bodies in the Universe */}
        <Suspense fallback={null}>
          {planets.map((planet) => (
            <CelestialPlanet
              key={planet.id}
              metadata={planet}
              isSelected={selectedDestination === planet.id}
              isVisited={Boolean(visitedPlanets[planet.id])}
              onSelect={(id) => selectDestination(id)}
            />
          ))}
        </Suspense>
      </Canvas>

      {/* Universe Navigation HUD */}
      <UniverseHUD />

      {/* Spacecraft Tactical Destination Panel */}
      <SpacecraftTacticalPanel />
    </div>
  );
}
