import React, { Suspense } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';

interface ModelAssetProps {
  url: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  tint?: string;
  roughness?: number;
  metalness?: number;
}

function InnerModel({
  url,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  castShadow = true,
  receiveShadow = true,
  tint,
  roughness,
  metalness,
}: ModelAssetProps) {
  const { scene } = useGLTF(url);

  const clonedScene = React.useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = castShadow;
        mesh.receiveShadow = receiveShadow;

        if (mesh.material) {
          const mat = (mesh.material as THREE.MeshStandardMaterial).clone();
          if (tint) {
            mat.color = new THREE.Color(tint);
          }
          if (roughness !== undefined) {
            mat.roughness = roughness;
          }
          if (metalness !== undefined) {
            mat.metalness = metalness;
          }
          mesh.material = mat;
        }
      }
    });
    return clone;
  }, [scene, castShadow, receiveShadow, tint, roughness, metalness]);

  const scaleVec = Array.isArray(scale) ? scale : [scale, scale, scale];

  return (
    <group position={position} rotation={rotation} scale={scaleVec as [number, number, number]}>
      <primitive object={clonedScene} />
    </group>
  );
}

export function ModelAsset(props: ModelAssetProps) {
  return (
    <Suspense fallback={null}>
      <InnerModel {...props} />
    </Suspense>
  );
}

// Preload common models
export function preloadCommonAssets() {
  const assets = [
    '/assets/models/astronaut.glb',
    '/assets/models/craft_speeder.glb',
    '/assets/models/craft_cargo.glb',
    '/assets/models/rock_large.glb',
    '/assets/models/rock_spire.glb',
    '/assets/models/cliff_formation.glb',
    '/assets/models/crystal_large.glb',
    '/assets/models/crystal_cluster.glb',
    '/assets/models/alien_tree.glb',
    '/assets/models/monument_gate.glb',
    '/assets/models/crater.glb',
    '/assets/models/meteor.glb',
    '/assets/models/satellite_dish.glb',
  ];
  assets.forEach((path) => {
    try {
      useGLTF.preload(path);
    } catch {}
  });
}
