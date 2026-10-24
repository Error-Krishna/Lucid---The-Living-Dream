import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface DetailedTerrainProps {
  radius?: number;
  skirtRadius?: number;
  textureType?: 'rocky' | 'sand' | 'candy' | 'crystal' | 'grid';
  groundColor?: string;
  skirtColor?: string;
  accentColor?: string;
  showHorizonRidges?: boolean;
  ridgeColor?: string;
  ridgeHeight?: number;
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
  radius = 36,
  skirtRadius = 190,
  textureType = 'rocky',
  groundColor,
  skirtColor,
  accentColor = '#6366f1',
  showHorizonRidges = true,
  ridgeColor,
  ridgeHeight = 22,
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
      textures.diff.repeat.set(18, 18);
      textures.diff.colorSpace = THREE.SRGBColorSpace;
    }
    if (textures.nor) {
      textures.nor.wrapS = textures.nor.wrapT = THREE.RepeatWrapping;
      textures.nor.repeat.set(18, 18);
    }
  }, [textures]);

  const resolvedColor = useMemo(() => {
    if (groundColor) return groundColor;
    if (textureType === 'candy') return '#f9a8d4';
    if (textureType === 'sand') return '#fef3c7';
    if (textureType === 'crystal') return '#38bdf8';
    return '#334155';
  }, [groundColor, textureType]);

  const resolvedSkirtColor = useMemo(() => {
    if (skirtColor) return skirtColor;
    const base = new THREE.Color(resolvedColor);
    base.multiplyScalar(0.75); // Slightly darker towards horizon
    return '#' + base.getHexString();
  }, [skirtColor, resolvedColor]);

  const resolvedRidgeColor = useMemo(() => {
    if (ridgeColor) return ridgeColor;
    const base = new THREE.Color(resolvedColor);
    base.multiplyScalar(0.55); // Atmospheric silhouette depth
    return '#' + base.getHexString();
  }, [ridgeColor, resolvedColor]);

  // 1. Playable foreground/midground terrain mesh
  const terrainGeo = useMemo(() => {
    const geo = new THREE.CylinderGeometry(radius, radius + 2, 1.4, 72, 8);
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      if (y > 0.3) {
        const elevation = getTerrainElevation(x, z);
        pos.setY(i, y + elevation);
      }
    }

    geo.computeVertexNormals();
    return geo;
  }, [radius]);

  // 2. Continuous extended horizon skirt stretching out to 190 units
  const skirtGeo = useMemo(() => {
    const geo = new THREE.RingGeometry(radius - 0.5, skirtRadius, 64, 8);
    const pos = geo.attributes.position;

    // Rotate ring flat onto ground plane (XZ)
    geo.rotateX(-Math.PI / 2);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const d = Math.hypot(x, z);

      // Gentle rolling dunes and hills towards the horizon
      const wave =
        Math.sin(x * 0.05 + 1.2) * Math.cos(z * 0.05) * 1.5 +
        Math.sin(d * 0.08) * 1.2;

      // Soft dip near outer edge so horizon dissolves seamlessly into atmospheric fog
      const outerFade = Math.max(0, 1 - (d - radius) / (skirtRadius - radius));
      pos.setY(i, -0.05 + wave * (1 - outerFade * 0.5) - (1 - outerFade) * 1.8);
    }

    geo.computeVertexNormals();
    return geo;
  }, [radius, skirtRadius]);

  // 3. Perimeter distant mountain / ridge silhouettes encircling the horizon
  const ridgeGeo = useMemo(() => {
    if (!showHorizonRidges) return null;
    const count = 64;
    const geo = new THREE.CylinderGeometry(
      skirtRadius * 0.58,
      skirtRadius * 0.65,
      ridgeHeight,
      count,
      4,
      true
    );
    const pos = geo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const angle = (i % count) * ((Math.PI * 2) / count);

      // Jagged mountain peaks and passes along the horizon
      const peakNoise =
        Math.sin(angle * 6) * 0.45 +
        Math.cos(angle * 12 + 0.5) * 0.3 +
        Math.sin(angle * 24) * 0.25;

      if (y > 0) {
        pos.setY(i, y + peakNoise * (ridgeHeight * 0.65));
      }
    }

    geo.computeVertexNormals();
    return geo;
  }, [showHorizonRidges, skirtRadius, ridgeHeight]);

  return (
    <group position={[0, -0.7, 0]}>
      {/* 1. Primary Foreground / Midground Contoured Terrain */}
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

      {/* 2. Seamless Extended Horizon Skirt */}
      <mesh geometry={skirtGeo} position={[0, 0.65, 0]} receiveShadow>
        <meshStandardMaterial
          map={textures.diff}
          normalMap={textures.nor}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          roughness={0.88}
          metalness={0.08}
          color={resolvedSkirtColor}
        />
      </mesh>

      {/* 3. Distant Perimeter Mountain Silhouettes rising against the sky */}
      {showHorizonRidges && ridgeGeo && (
        <mesh geometry={ridgeGeo} position={[0, ridgeHeight * 0.45, 0]}>
          <meshStandardMaterial
            color={resolvedRidgeColor}
            roughness={0.92}
            metalness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Foundation apron underneath landing pad */}
      <mesh position={[0, -0.9, 0]} receiveShadow>
        <cylinderGeometry args={[radius + 2, radius + 4, 1.0, 32]} />
        <meshStandardMaterial
          color="#090d16"
          roughness={0.95}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}
