import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface SpacecraftProps {
  mode?: 'space' | 'landing' | 'landed' | 'takeoff';
  thrusterIntensity?: number;
  scale?: number;
}

function SpacecraftModel({
  mode = 'space',
  thrusterIntensity = 1.0,
  scale = 1.0,
}: SpacecraftProps) {
  const groupRef = useRef<THREE.Group>(null);
  const flameLeftRef = useRef<THREE.Mesh>(null);
  const flameRightRef = useRef<THREE.Mesh>(null);
  const innerFlameLeftRef = useRef<THREE.Mesh>(null);
  const innerFlameRightRef = useRef<THREE.Mesh>(null);
  const portStrobeRef = useRef<THREE.PointLight>(null);
  const starStrobeRef = useRef<THREE.PointLight>(null);
  const dorsalBeaconRef = useRef<THREE.PointLight>(null);

  const { scene } = useGLTF('/assets/models/craft_speederD.glb');

  // Clone scene & enhance materials
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          const matName = mat.name.toLowerCase();

          if (matName.includes('metalred')) {
            mat.color = new THREE.Color('#e11d48');
            mat.roughness = 0.3;
            mat.metalness = 0.75;
          } else if (matName.includes('dark') || matName.includes('metaldark')) {
            mat.color = new THREE.Color('#1e293b');
            mat.roughness = 0.55;
            mat.metalness = 0.45;
          } else {
            mat.color = new THREE.Color('#e2e8f0');
            mat.roughness = 0.25;
            mat.metalness = 0.88;
          }
          mesh.material = mat;
        }
      }
    });
    return clone;
  }, [scene]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    if (mode === 'space') {
      // Gentle deep space flight oscillation
      groupRef.current.position.y = Math.sin(time * 1.2) * 0.15;
      groupRef.current.rotation.z = Math.sin(time * 0.8) * 0.05;
      groupRef.current.rotation.x = Math.sin(time * 1.0) * 0.03;
    } else if (mode === 'takeoff') {
      groupRef.current.position.y += 0.08;
      groupRef.current.rotation.x = -0.15;
    }

    // Dynamic dual thruster flame flicker & shock diamond oscillation
    const flicker = 0.92 + Math.sin(time * 38) * 0.1;
    const flameScale =
      thrusterIntensity *
      (mode === 'landed' ? 0.15 : 1.35 + Math.sin(time * 24) * 0.2);

    if (flameLeftRef.current) {
      flameLeftRef.current.scale.set(flicker, flameScale, flicker);
    }
    if (flameRightRef.current) {
      flameRightRef.current.scale.set(flicker, flameScale, flicker);
    }
    if (innerFlameLeftRef.current) {
      innerFlameLeftRef.current.scale.set(flicker * 0.6, flameScale * 0.75, flicker * 0.6);
    }
    if (innerFlameRightRef.current) {
      innerFlameRightRef.current.scale.set(flicker * 0.6, flameScale * 0.75, flicker * 0.6);
    }

    // Wingtip and dorsal strobes (1.2 Hz aviation pulse)
    const strobe = Math.sin(time * 4.8) > 0.82 ? 1.6 : 0.05;
    if (portStrobeRef.current) portStrobeRef.current.intensity = strobe;
    if (starStrobeRef.current) starStrobeRef.current.intensity = strobe;
    if (dorsalBeaconRef.current) dorsalBeaconRef.current.intensity = strobe * 1.4;
  });

  const baseScale = scale * 2.3;

  return (
    <group ref={groupRef}>
      {/* Primary Aerospace Hull Model */}
      <primitive
        object={clonedScene}
        scale={[baseScale, baseScale, baseScale]}
        rotation={[0, Math.PI, 0]}
        position={[0, 0.42, 0]}
      />

      {/* Aerodynamic Cockpit Canopy Visor (Tinted Specular Glass) */}
      <group position={[0, 0.95, -0.2]}>
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[0.38, 0.7, 16, 24]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.08}
            metalness={0.95}
            transparent
            opacity={0.88}
          />
        </mesh>
        {/* Interior Holographic HUD Glow */}
        <pointLight position={[0, -0.05, -0.1]} color="#38bdf8" intensity={0.8} distance={2.5} />
      </group>

      {/* Flanking Heavy Engine Housings / Nacelles */}
      <group position={[0, 0.65, 0.8]}>
        {/* Port Nacelle */}
        <mesh position={[-1.25, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.36, 1.3, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Starboard Nacelle */}
        <mesh position={[1.25, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.32, 0.36, 1.3, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.85} roughness={0.3} />
        </mesh>
      </group>

      {/* Articulated Hydraulic Landing Gear Struts & Footpads */}
      {(mode === 'landed' || mode === 'landing') && (
        <group position={[0, 0, 0]}>
          {/* Nose Landing Strut */}
          <group position={[0, 0.22, -1.9]}>
            {/* Upper Cylinder */}
            <mesh position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.45, 12]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.25} />
            </mesh>
            {/* Lower Piston */}
            <mesh position={[0, -0.12, 0]} castShadow>
              <cylinderGeometry args={[0.045, 0.045, 0.3, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
            </mesh>
            {/* Articulated Hexagonal Footpad grounded firmly at y = 0 */}
            <mesh position={[0, -0.21, 0]} receiveShadow>
              <cylinderGeometry args={[0.26, 0.3, 0.05, 6]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.35} />
            </mesh>
          </group>

          {/* Port Main Gear Strut */}
          <group position={[-1.5, 0.22, 1.1]} rotation={[0, 0, 0.2]}>
            <mesh position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.48, 12]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.25} />
            </mesh>
            <mesh position={[0, -0.12, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.32, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
            </mesh>
            <mesh position={[0, -0.22, 0]} receiveShadow>
              <cylinderGeometry args={[0.3, 0.34, 0.06, 6]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.35} />
            </mesh>
          </group>

          {/* Starboard Main Gear Strut */}
          <group position={[1.5, 0.22, 1.1]} rotation={[0, 0, -0.2]}>
            <mesh position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.08, 0.48, 12]} />
              <meshStandardMaterial color="#475569" metalness={0.9} roughness={0.25} />
            </mesh>
            <mesh position={[0, -0.12, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.05, 0.32, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.15} />
            </mesh>
            <mesh position={[0, -0.22, 0]} receiveShadow>
              <cylinderGeometry args={[0.3, 0.34, 0.06, 6]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.35} />
            </mesh>
          </group>
        </group>
      )}

      {/* Dual Ion Thrusters with Shock Diamonds */}
      <group position={[0, 0.65, 2.1]}>
        {/* Port Thruster Bell */}
        <group position={[-1.25, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.18, 0.42, 20]} />
            <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.2} />
          </mesh>
          {/* Outer Cyan Ion Flame */}
          <mesh ref={flameLeftRef} position={[0, 0, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.22, 1.4, 20]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
          </mesh>
          {/* Inner Shock Diamond Core */}
          <mesh ref={innerFlameLeftRef} position={[0, 0, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.12, 0.9, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
        </group>

        {/* Starboard Thruster Bell */}
        <group position={[1.25, 0, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.18, 0.42, 20]} />
            <meshStandardMaterial color="#0f172a" metalness={0.95} roughness={0.2} />
          </mesh>
          {/* Outer Cyan Ion Flame */}
          <mesh ref={flameRightRef} position={[0, 0, 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.22, 1.4, 20]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
          </mesh>
          {/* Inner Shock Diamond Core */}
          <mesh ref={innerFlameRightRef} position={[0, 0, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.12, 0.9, 16]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
          </mesh>
        </group>

        {/* Dynamic Thruster Light */}
        <pointLight
          position={[0, 0, 0.9]}
          color="#38bdf8"
          intensity={mode === 'landed' ? 0.35 : thrusterIntensity * 4.0}
          distance={10}
        />
      </group>

      {/* Navigation & Anti-Collision Strobes */}
      <group position={[0, 0.8, 0]}>
        {/* Port Wing Red Strobe */}
        <pointLight ref={portStrobeRef} position={[-2.4, 0, 0.2]} color="#ef4444" distance={6} />
        <mesh position={[-2.4, 0, 0.2]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>

        {/* Starboard Wing Green Strobe */}
        <pointLight ref={starStrobeRef} position={[2.4, 0, 0.2]} color="#10b981" distance={6} />
        <mesh position={[2.4, 0, 0.2]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>

        {/* Dorsal White Anti-Collision Strobe */}
        <pointLight ref={dorsalBeaconRef} position={[0, 0.65, 1.2]} color="#ffffff" distance={7} />
        <mesh position={[0, 0.65, 1.2]}>
          <sphereGeometry args={[0.05, 12, 12]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>
    </group>
  );
}

export function Spacecraft(props: SpacecraftProps) {
  return (
    <Suspense fallback={null}>
      <SpacecraftModel {...props} />
    </Suspense>
  );
}

useGLTF.preload('/assets/models/craft_speederD.glb');
