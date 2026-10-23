import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Spacecraft } from '../spacecraft/Spacecraft.js';

function DreamCelestial() {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  const earthTex = useTexture('/assets/textures/earth_atmos_2048.jpg');

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.12;
      ringRef.current.rotation.x += delta * 0.03;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z -= delta * 0.08;
      ring2Ref.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group position={[0, 0.5, -12]}>
      {/* Central Textured Celestial Globe */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[3.8, 48, 48]} />
        <meshStandardMaterial
          map={earthTex}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Atmospheric Inner Glow */}
      <mesh>
        <sphereGeometry args={[4.05, 32, 32]} />
        <meshBasicMaterial
          color="#818cf8"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Primary Celestial Ring */}
      <mesh ref={ringRef} rotation={[1.1, 0.4, 0]}>
        <ringGeometry args={[5.2, 5.8, 64]} />
        <meshStandardMaterial
          color="#c084fc"
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Secondary Orbiting Ring */}
      <mesh ref={ring2Ref} rotation={[-0.8, -0.6, 0.2]}>
        <ringGeometry args={[6.4, 6.7, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          side={THREE.DoubleSide}
          transparent
          opacity={0.45}
        />
      </mesh>
    </group>
  );
}

function OrbitingCruiser() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.position.y = -1.2 + Math.sin(time * 0.8) * 0.12;
      groupRef.current.rotation.z = Math.sin(time * 0.6) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={[2.8, -1.2, -3.5]} rotation={[0.15, -0.6, 0]}>
      <Spacecraft mode="space" thrusterIntensity={1.0} scale={0.65} />
    </group>
  );
}

export function LandingScene() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 1.5, 6], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#030514']} />
        <fog attach="fog" args={['#030514', 12, 40]} />

        <ambientLight intensity={0.65} color="#818cf8" />
        <directionalLight position={[20, 25, 15]} intensity={1.6} color="#e0e7ff" />
        <pointLight position={[-10, 10, -5]} intensity={1.2} color="#38bdf8" />

        <Stars
          radius={60}
          depth={45}
          count={2500}
          factor={4}
          saturation={0.6}
          fade
          speed={0.6}
        />

        <Suspense fallback={null}>
          <DreamCelestial />
          <OrbitingCruiser />
        </Suspense>
      </Canvas>
    </div>
  );
}
