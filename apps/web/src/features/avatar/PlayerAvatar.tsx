import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { useUniverseStore } from '../../stores/useUniverseStore.js';

export interface PlayerAvatarProps {
  position: [number, number, number];
  rotation: [number, number, number];
  isMoving: boolean;
  isSprinting?: boolean;
  isGrounded?: boolean;
  currentEmote?: string;
}

function RiggedExplorer({
  position,
  rotation,
  isMoving,
  isSprinting = false,
  isGrounded = true,
  currentEmote = 'idle',
}: PlayerAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const userName = useUniverseStore((s) => s.userName);
  const avatarConfig = useUniverseStore((s) => s.avatarConfig);

  const { scene, animations } = useGLTF('/assets/models/explorer.glb');

  // Clone scene with skeletal bone hierarchy intact
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    clone.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh || (child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          if (mesh.name === 'Beta_Surface') {
            mat.color = new THREE.Color(avatarConfig.color || '#6366f1');
            mat.roughness = 0.35;
            mat.metalness = 0.55;
            mat.emissive = new THREE.Color(avatarConfig.color || '#6366f1');
            mat.emissiveIntensity = 0.12;
          } else if (mesh.name === 'Beta_Joints') {
            mat.color = new THREE.Color('#1e293b');
            mat.roughness = 0.25;
            mat.metalness = 0.85;
          }
          mesh.material = mat;
        }
      }
    });
    return clone;
  }, [scene, avatarConfig.color]);

  const { actions } = useAnimations(animations, groupRef);

  // Active animation selection
  const targetActionName = useMemo(() => {
    if (currentEmote && currentEmote !== 'idle' && actions[currentEmote]) {
      return currentEmote;
    }
    if (!isMoving) return 'idle';
    if (isSprinting) return 'run';
    return 'walk';
  }, [isMoving, isSprinting, currentEmote, actions]);

  useEffect(() => {
    const action = actions[targetActionName];
    if (action) {
      action.reset().fadeIn(0.2).play();
      return () => {
        action.fadeOut(0.2);
      };
    }
  }, [targetActionName, actions]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.position.set(position[0], position[1], position[2]);
    // Smooth orientation: rotation[1] + Math.PI so explorer faces forward into the world
    groupRef.current.rotation.y = rotation[1] + Math.PI;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 3D Skeletally Rigged Humanoid Explorer (~1.8m height) */}
      <primitive
        object={clonedScene}
        scale={[1.15, 1.15, 1.15]}
        position={[0, 0, 0]}
      />

      {/* Ground Contact Shadow (Soft Decal under feet) */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.65}
          depthWrite={false}
        />
      </mesh>

      {/* Floating Name Label with Billboard camera tracking */}
      <Billboard position={[0, 2.1, 0]}>
        <Text
          fontSize={0.18}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#030514"
        >
          {userName}
        </Text>
      </Billboard>
    </group>
  );
}

export function PlayerAvatar(props: PlayerAvatarProps) {
  return (
    <Suspense fallback={null}>
      <RiggedExplorer {...props} />
    </Suspense>
  );
}

useGLTF.preload('/assets/models/explorer.glb');
