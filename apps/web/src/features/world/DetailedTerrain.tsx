import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface DetailedTerrainProps {
  radius?: number;
  textureType?: 'rocky' | 'sand' | 'candy' | 'crystal';
  groundColor?: string;
  accentColor?: string;
}

export function getTerrainElevation(x: number, z: number): number {
  const distFromRocket = Math.hypot(x - (-6.5), z - 4);
  const distFromLandmark = Math.hypot(x, z - (-13));
  // Flat landing pad apron and landmark sanctum
  if (distFromRocket < 5.5 || distFromLandmark < 5.0) return 0;

  const distFromCenter = Math.hypot(x, z);
  const fade = Math.min(1, Math.max(0, (distFromCenter - 4) / 6));
  const elevation =
    Math.sin(x * 0.15) * Math.cos(z * 0.15) * 0.45 +
    Math.sin(x * 0.3 + 1.2) * 0.25 +
    Math.cos(z * 0.25) * 0.2;
  return Math.max(0, elevation * fade);
}

export function DetailedTerrain({
  radius = 32,
  textureType = 'rocky',
  groundColor,
  accentColor = '#6366f1',
}: DetailedTerrainProps) {
  // Select PBR texture maps
  const texturePaths = useMemo(() => {
    if (textureType === 'sand' || textureType === 'candy') {
      return {
        diff: '/assets/textures/sand_diff_1k.jpg',
        nor: '/assets/textures/sand_nor_1k.jpg',
      };
    }
    return {
      diff: '/assets/textures/rocky_terrain_diff_1k.jpg',
      nor: '/assets/textures/rocky_terrain_nor_1k.jpg',
    };
  }, [textureType]);

  const textures = useTexture(texturePaths);

  useMemo(() => {
    if (textures.diff) {
      textures.diff.wrapS = textures.diff.wrapT = THREE.RepeatWrapping;
      textures.diff.repeat.set(16, 16);
      textures.diff.colorSpace = THREE.SRGBColorSpace;
    }
    if (textures.nor) {
      textures.nor.wrapS = textures.nor.wrapT = THREE.RepeatWrapping;
      textures.nor.repeat.set(16, 16);
    }
  }, [textures]);

  const resolvedColor = useMemo(() => {
    if (groundColor) return groundColor;
    if (textureType === 'candy') return '#f3c4db';
    if (textureType === 'sand') return '#fef3c7';
    return '#1e293b';
  }, [groundColor, textureType]);

  // Create elevated, contoured terrain geometry matching getTerrainElevation
  const terrainGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(radius, radius + 3, 1.4, 64, 8);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // Only displace top surface vertices (y > 0)
      if (y > 0.3) {
        const elevation = getTerrainElevation(x, z);
        pos.setY(i, y + elevation);
      }
    }

    geo.computeVertexNormals();
    return geo;
  }, [radius]);

  return (
    <group position={[0, -0.7, 0]}>
      {/* Primary Textured Terrain Mesh */}
      <mesh geometry={terrainGeo} receiveShadow>
        <meshStandardMaterial
          map={textures.diff}
          normalMap={textures.nor}
          normalScale={new THREE.Vector2(1.2, 1.2)}
          roughness={textureType === 'candy' ? 0.65 : 0.82}
          metalness={textureType === 'candy' ? 0.15 : 0.12}
          color={resolvedColor}
        />
      </mesh>

      {/* Sub-crust Foundation Ring */}
      <mesh position={[0, -0.9, 0]} receiveShadow>
        <cylinderGeometry args={[radius + 2.5, radius + 4.5, 1.0, 32]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.95}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
