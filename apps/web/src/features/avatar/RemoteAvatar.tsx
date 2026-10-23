import React, { useRef, useMemo, useEffect, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';
import { AvatarPresence } from '@lucid/shared';

interface RemoteAvatarProps {
  presence: AvatarPresence;
}

function RemoteRiggedExplorer({ presence }: RemoteAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(...presence.position));
  const targetRotY = useRef(presence.rotation[1]);

  const { scene, animations } = useGLTF('/assets/models/explorer.glb');

  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene);
    const bodyColor = presence.avatarConfig?.color || '#a855f7';

    clone.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh || (child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          if (mesh.name === 'Beta_Surface') {
            mat.color = new THREE.Color(bodyColor);
            mat.roughness = 0.35;
            mat.metalness = 0.55;
            mat.emissive = new THREE.Color(bodyColor);
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
  }, [scene, presence.avatarConfig?.color]);

  const { actions } = useAnimations(animations, groupRef);

  const emoteAction = useMemo(() => {
    const emote = presence.emote;
    if (emote && actions[emote]) return emote;
    return 'idle';
  }, [presence.emote, actions]);

  useEffect(() => {
    const action = actions[emoteAction] || actions['idle'];
    if (action) {
      action.reset().fadeIn(0.2).play();
      return () => {
        action.fadeOut(0.2);
      };
    }
  }, [emoteAction, actions]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Ground remote avatars to terrain elevation
    const surfaceY = presence.position[1] > 2.0 ? presence.position[1] : 0.0;
    targetPos.current.set(presence.position[0], surfaceY, presence.position[2]);
    targetRotY.current = presence.rotation[1];

    groupRef.current.position.lerp(targetPos.current, Math.min(1, delta * 14));
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY.current + Math.PI,
      Math.min(1, delta * 12)
    );
  });

  return (
    <group ref={groupRef} position={presence.position}>
      {/* 3D Skeletally Rigged Humanoid Explorer */}
      <primitive
        object={clonedScene}
        scale={[1.15, 1.15, 1.15]}
        position={[0, 0, 0]}
      />

      {/* Ground Contact Shadow */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.6} depthWrite={false} />
      </mesh>

      {/* Nameplate Billboard */}
      <Billboard position={[0, 2.1, 0]}>
        <Text
          fontSize={0.18}
          color="#f1f5f9"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#030514"
        >
          {presence.isSimulated ? `[Echo] ${presence.displayName}` : presence.displayName}
        </Text>
      </Billboard>
    </group>
  );
}

export function RemoteAvatar(props: RemoteAvatarProps) {
  return (
    <Suspense fallback={null}>
      <RemoteRiggedExplorer {...props} />
    </Suspense>
  );
}
