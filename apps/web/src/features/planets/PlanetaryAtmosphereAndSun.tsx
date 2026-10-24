import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetEnvironmentConfig } from './planetEnvironmentConfig.js';

interface PlanetaryAtmosphereAndSunProps {
  config: PlanetEnvironmentConfig;
}

export function PlanetaryAtmosphereAndSun({ config }: PlanetaryAtmosphereAndSunProps) {
  const { sky, sun, lighting, fog, clouds, particles } = config;

  // Normalized sun direction vector
  const sunDir = useMemo(() => {
    return new THREE.Vector3(...sun.position).normalize();
  }, [sun.position]);

  // Position of visible sun in sky dome (~180 units away)
  const visibleSunPos = useMemo(() => {
    return sunDir.clone().multiplyScalar(185);
  }, [sunDir]);

  // Directional light position (~55 units away along the exact same ray)
  const lightPos = useMemo(() => {
    return [sunDir.x * 55, sunDir.y * 55, sunDir.z * 55] as [number, number, number];
  }, [sunDir]);

  return (
    <group>
      {/* 1. Global Atmospheric Fog matching horizon */}
      <fog attach="fog" args={[fog.color, fog.near, fog.far]} />

      {/* 2. Full 360° Gradient Sky Dome */}
      <ProceduralSkyDome
        zenithColor={sky.zenithColor}
        horizonColor={sky.horizonColor}
        nadirColor={sky.nadirColor}
      />

      {/* 3. The Visible Celestial Sun / Star in the Sky */}
      <VisibleCelestialSun
        position={visibleSunPos}
        sun={sun}
        sunDir={sunDir}
      />

      {/* 4. Harmonized Key Directional Sunlight with Soft PCF Shadows */}
      <directionalLight
        position={lightPos}
        intensity={lighting.directionalIntensity}
        color={lighting.directionalColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-38}
        shadow-camera-right={38}
        shadow-camera-top={38}
        shadow-camera-bottom={-38}
        shadow-bias={-0.0001}
      />

      {/* 5. Hemisphere Light: Sky bounce from above, ground bounce from below */}
      <hemisphereLight
        args={[
          lighting.hemisphereSkyColor,
          lighting.hemisphereGroundColor,
          lighting.hemisphereIntensity,
        ]}
      />

      {/* 6. Soft Ambient Fill for perfectly readable shadows & foreground */}
      <ambientLight
        color={lighting.ambientColor}
        intensity={lighting.ambientIntensity}
      />

      {/* 7. Drifting Atmospheric Cloud Layers */}
      {clouds.enabled && (
        <AtmosphericClouds
          color={clouds.color}
          altitude={clouds.altitude}
          opacity={clouds.opacity}
          speed={clouds.speed}
          layers={clouds.layerCount}
        />
      )}

      {/* 8. Floating Ambient Atmospheric Particles */}
      <AtmosphericParticles config={particles} />
    </group>
  );
}

// -------------------------------------------------------------------
// Procedural Gradient Sky Dome
// -------------------------------------------------------------------
function ProceduralSkyDome({
  zenithColor,
  horizonColor,
  nadirColor,
}: {
  zenithColor: string;
  horizonColor: string;
  nadirColor: string;
}) {
  const uniforms = useMemo(() => {
    return {
      topColor: { value: new THREE.Color(zenithColor) },
      horizonColor: { value: new THREE.Color(horizonColor) },
      bottomColor: { value: new THREE.Color(nadirColor) },
    };
  }, [zenithColor, horizonColor, nadirColor]);

  const vertexShader = `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 topColor;
    uniform vec3 horizonColor;
    uniform vec3 bottomColor;
    varying vec3 vWorldPosition;
    void main() {
      vec3 dir = normalize(vWorldPosition);
      float h = dir.y;
      vec3 color;
      if (h > 0.0) {
        color = mix(horizonColor, topColor, pow(h, 0.65));
      } else {
        color = mix(horizonColor, bottomColor, pow(-h, 0.75));
      }
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[260, 32, 24]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

// -------------------------------------------------------------------
// Visible Celestial Sun / Star
// -------------------------------------------------------------------
function VisibleCelestialSun({
  position,
  sun,
  sunDir,
}: {
  position: THREE.Vector3;
  sun: PlanetEnvironmentConfig['sun'];
  sunDir: THREE.Vector3;
}) {
  const coronaRef = useRef<THREE.Mesh>(null);
  const raysRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (coronaRef.current) {
      coronaRef.current.rotation.z += delta * 0.05;
    }
    if (raysRef.current) {
      raysRef.current.rotation.z -= delta * 0.03;
    }
  });

  return (
    <group position={position}>
      <Billboard follow lockX={false} lockY={false} lockZ={false}>
        {/* Glowing Sun Core Disc */}
        <mesh>
          <circleGeometry args={[sun.coreRadius, 48]} />
          <meshBasicMaterial
            color={sun.color}
            toneMapped={false}
          />
        </mesh>

        {/* Soft Solar Corona / Atmosphere Glow Ring */}
        <mesh ref={coronaRef}>
          <ringGeometry args={[sun.coreRadius * 0.9, sun.coronaRadius, 64]} />
          <meshBasicMaterial
            color={sun.coronaColor}
            transparent
            opacity={sun.coronaOpacity}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Outer Radiant Atmospheric Haze */}
        <mesh>
          <ringGeometry args={[sun.coronaRadius * 0.8, sun.coronaRadius * 1.5, 48]} />
          <meshBasicMaterial
            color={sun.coronaColor}
            transparent
            opacity={sun.coronaOpacity * 0.35}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Subtle Solar Light Rays */}
        {sun.hasSolarRays && (
          <group ref={raysRef}>
            {[0, 45, 90, 135].map((angle, i) => (
              <mesh key={i} rotation={[0, 0, (angle * Math.PI) / 180]}>
                <planeGeometry args={[sun.coronaRadius * 3.2, sun.coreRadius * 0.35]} />
                <meshBasicMaterial
                  color={sun.color}
                  transparent
                  opacity={0.18}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
            ))}
          </group>
        )}
      </Billboard>
    </group>
  );
}

// -------------------------------------------------------------------
// Atmospheric Drifting Clouds
// -------------------------------------------------------------------
function AtmosphericClouds({
  color,
  altitude,
  opacity,
  speed,
  layers,
}: {
  color: string;
  altitude: number;
  opacity: number;
  speed: number;
  layers: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * speed * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, altitude, 0]}>
      {Array.from({ length: layers }).map((_, i) => (
        <mesh
          key={i}
          position={[0, i * 4.5, 0]}
          rotation={[-Math.PI / 2, 0, (i * Math.PI) / 3]}
        >
          <ringGeometry args={[25, 220, 48]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity * (1 - i * 0.22)}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// -------------------------------------------------------------------
// Atmospheric Ambient Particles (Dust, Spores, Sugar, Embers, Bubbles)
// -------------------------------------------------------------------
function AtmosphericParticles({
  config,
}: {
  config: PlanetEnvironmentConfig['particles'];
}) {
  const { count, color, size, speed, spread } = config;

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Initialize random particle positions & velocities
  const particleData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * spread[0],
      y: Math.random() * spread[1] + 0.3,
      z: (Math.random() - 0.5) * spread[2],
      vx: (Math.random() - 0.5) * 0.15,
      vy: Math.random() * 0.35 + 0.1,
      vz: (Math.random() - 0.5) * 0.15,
      scale: Math.random() * 0.5 + 0.5,
    }));
  }, [count, spread]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    for (let i = 0; i < particleData.length; i++) {
      const p = particleData[i];
      p.y += p.vy * speed * delta * 5;
      p.x += p.vx * speed * delta * 5;
      p.z += p.vz * speed * delta * 5;

      // Loop particles within bounding cylinder
      if (p.y > spread[1]) p.y = 0.5;
      if (Math.hypot(p.x, p.z) > spread[0] * 0.5) {
        p.x = (Math.random() - 0.5) * spread[0] * 0.7;
        p.z = (Math.random() - 0.5) * spread[2] * 0.7;
      }

      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.65}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
