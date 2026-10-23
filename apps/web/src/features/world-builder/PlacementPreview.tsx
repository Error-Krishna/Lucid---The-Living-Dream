import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { useMultiplayer } from '../multiplayer/useMultiplayer.js';

export function PlacementPreview() {
  const isBuildMode = useUniverseStore((s) => s.isBuildMode);
  const selectedTool = useUniverseStore((s) => s.selectedTool);
  const paletteColor = useUniverseStore((s) => s.paletteColor);
  const placeObjectAt = useUniverseStore((s) => s.placeObjectAt);
  const { broadcastObjectCreate } = useMultiplayer();

  const ghostRef = useRef<THREE.Group>(null);
  const [ghostPos, setGhostPos] = useState<[number, number, number]>([0, 0, 0]);
  const [isValid, setIsValid] = useState(true);

  const { raycaster, camera, scene } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const intersectPoint = new THREE.Vector3();

  useFrame((state) => {
    if (!isBuildMode || !ghostRef.current) return;

    raycaster.setFromCamera(state.pointer, camera);
    const hit = raycaster.ray.intersectPlane(plane, intersectPoint);

    if (hit) {
      // Snap to 0.5 unit grid
      const x = Math.round(intersectPoint.x * 2) / 2;
      const z = Math.round(intersectPoint.z * 2) / 2;

      // Safe bounds check
      const distFromCenter = Math.hypot(x, z);
      const inBounds = distFromCenter <= 22;

      setIsValid(inBounds);
      ghostRef.current.position.set(x, 0, z);
      setGhostPos([x, 0, z]);
    }
  });

  if (!isBuildMode) return null;

  const handlePointerDown = (e: any) => {
    if (e.button !== 0 || !isValid) return;
    e.stopPropagation();

    const created = placeObjectAt(ghostPos);
    // Broadcast if in connected mode
    broadcastObjectCreate({
      object: {
        locationId: created.locationId,
        creatorId: created.creatorId,
        creatorName: created.creatorName,
        type: created.type,
        transform: created.transform,
        appearance: created.appearance,
        permissions: created.permissions,
      },
    });
  };

  return (
    <group>
      {/* Invisible raycast receiver plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        onPointerDown={handlePointerDown}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Holographic Ghost Mesh */}
      <group ref={ghostRef}>
        {/* Placement Circle */}
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.7, 0.85, 32]} />
          <meshBasicMaterial
            color={isValid ? paletteColor : '#ef4444'}
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Hologram Representation */}
        <mesh position={[0, 0.8, 0]}>
          {selectedTool === 'dream_beacon' && <sphereGeometry args={[0.4, 16, 16]} />}
          {selectedTool === 'resonant_crystal' && <octahedronGeometry args={[0.7, 0]} />}
          {selectedTool === 'bioluminescent_flora' && <cylinderGeometry args={[0.1, 0.4, 0.9, 8]} />}
          {selectedTool === 'geometric_monument' && <tetrahedronGeometry args={[0.7, 0]} />}
          {selectedTool === 'levitating_platform' && <cylinderGeometry args={[1.2, 1.0, 0.25, 16]} />}
          {selectedTool === 'star_monolith' && <boxGeometry args={[0.6, 2.0, 0.6]} />}

          <meshBasicMaterial
            color={isValid ? paletteColor : '#ef4444'}
            wireframe
            transparent
            opacity={0.65}
          />
        </mesh>
      </group>
    </group>
  );
}
