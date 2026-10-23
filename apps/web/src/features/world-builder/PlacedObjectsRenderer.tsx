import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { WorldObject } from '@lucid/shared';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { ModelAsset } from '../world/ModelAsset.js';

interface PlacedObjectsRendererProps {
  objects: WorldObject[];
}

function ObjectMesh({
  obj,
  isSelected,
  onSelect,
}: {
  obj: WorldObject;
  isSelected: boolean;
  onSelect: (obj: WorldObject) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const color = obj.appearance?.color || '#818cf8';

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    if (obj.type === 'dream_beacon') {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  const renderGeometry = () => {
    switch (obj.type) {
      case 'dream_beacon':
        return (
          <group>
            {/* Pedestal */}
            <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.35, 0.5, 12]} />
              <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Floating guidance core */}
            <mesh position={[0, 0.75, 0]}>
              <sphereGeometry args={[0.3, 24, 24]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={1.8}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
            {/* Orbiting ring */}
            <mesh position={[0, 0.75, 0]} rotation={[1.1, 0, 0]}>
              <torusGeometry args={[0.5, 0.03, 16, 32]} />
              <meshBasicMaterial color={color} />
            </mesh>
            <pointLight position={[0, 0.8, 0]} color={color} intensity={1.5} distance={6} />
          </group>
        );

      case 'resonant_crystal':
        return (
          <group position={[0, 0, 0]}>
            <ModelAsset url="/assets/models/crystal_large.glb" scale={0.7} tint={color} />
            <pointLight position={[0, 1.0, 0]} color={color} intensity={1.4} distance={5} />
          </group>
        );

      case 'bioluminescent_flora':
        return (
          <group position={[0, 0, 0]}>
            <ModelAsset url="/assets/models/alien_tree.glb" scale={0.5} tint={color} />
            <pointLight position={[0, 1.2, 0]} color={color} intensity={1.2} distance={5} />
          </group>
        );

      case 'geometric_monument':
        return (
          <group position={[0, 0, 0]}>
            <ModelAsset url="/assets/models/crystal_cluster.glb" scale={0.65} tint={color} />
            <pointLight position={[0, 0.8, 0]} color={color} intensity={1.2} distance={5} />
          </group>
        );

      case 'levitating_platform':
        return (
          <group position={[0, 0.3, 0]}>
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[1.2, 1.0, 0.22, 16]} />
              <meshStandardMaterial
                color="#1e2238"
                roughness={0.5}
                metalness={0.6}
              />
            </mesh>
            <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.8, 0.95, 24]} />
              <meshBasicMaterial color={color} />
            </mesh>
          </group>
        );

      case 'star_monolith':
      default:
        return (
          <group position={[0, 0, 0]}>
            <ModelAsset url="/assets/models/rock_spire.glb" scale={0.65} tint={color} />
            <pointLight position={[0, 1.5, 0]} color={color} intensity={1.5} distance={6} />
          </group>
        );
    }
  };

  return (
    <group
      ref={meshRef}
      position={obj.transform.position}
      rotation={obj.transform.rotation}
      scale={obj.transform.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(obj);
      }}
    >
      {renderGeometry()}

      {/* Selected Indicator Ring */}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.35, 32]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

export function PlacedObjectsRenderer({ objects }: PlacedObjectsRendererProps) {
  const selectedObject = useUniverseStore((s) => s.selectedObject);
  const setSelectedObject = useUniverseStore((s) => s.setSelectedObject);

  return (
    <group>
      {objects.map((obj) => (
        <ObjectMesh
          key={obj.objectId}
          obj={obj}
          isSelected={selectedObject?.objectId === obj.objectId}
          onSelect={(selected) => setSelectedObject(selected)}
        />
      ))}
    </group>
  );
}
