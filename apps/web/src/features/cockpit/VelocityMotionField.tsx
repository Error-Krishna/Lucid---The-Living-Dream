import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { DEFAULT_FLIGHT_EFFECTS_CONFIG, FlightEffectsConfig } from './flightEffectsConfig';

interface VelocityMotionFieldProps {
  velocity: [number, number, number];
  config?: Partial<FlightEffectsConfig>;
}

export function VelocityMotionField({
  velocity,
  config: userConfig,
}: VelocityMotionFieldProps) {
  const { camera } = useThree();
  const lineSegmentsRef = useRef<THREE.LineSegments>(null);
  const dustPointsRef = useRef<THREE.Points>(null);

  const cfg = useMemo(() => ({
    ...DEFAULT_FLIGHT_EFFECTS_CONFIG,
    ...userConfig,
  }), [userConfig]);

  const count = cfg.baseParticleCount;
  const dustCount = cfg.dustParticleCount;
  const [spreadX, spreadY, spreadZ] = cfg.particleSpread;

  // Smoothed velocity vector & speed ratio for gentle visual transitions
  const smoothedVel = useRef(new THREE.Vector3());
  const smoothedSpeedRatio = useRef(0);

  // Reusable scratch vectors to avoid any per-frame GC allocations
  const targetVelRef = useRef(new THREE.Vector3());
  const velDirRef = useRef(new THREE.Vector3());
  const tailOffsetRef = useRef(new THREE.Vector3());

  // Pre-allocated static particle state buffers
  const particleData = useMemo(() => {
    // Local offsets relative to camera: [-spread/2, spread/2]
    const localPositions = new Float32Array(count * 3);
    const lineVertices = new Float32Array(count * 6); // 2 vertices per streak line (x1,y1,z1, x2,y2,z2)
    const lineColors = new Float32Array(count * 6); // r,g,b for each vertex

    const palette = [
      new THREE.Color('#38bdf8'), // Cyan
      new THREE.Color('#818cf8'), // Indigo
      new THREE.Color('#c084fc'), // Purple
      new THREE.Color('#f8fafc'), // Starlight white
      new THREE.Color('#67e8f9'), // Light sky
    ];

    for (let i = 0; i < count; i++) {
      const lx = (Math.random() - 0.5) * spreadX;
      const ly = (Math.random() - 0.5) * spreadY;
      const lz = (Math.random() - 0.5) * spreadZ;

      localPositions[i * 3 + 0] = lx;
      localPositions[i * 3 + 1] = ly;
      localPositions[i * 3 + 2] = lz;

      const col = palette[Math.floor(Math.random() * palette.length)];
      const idx6 = i * 6;

      // Vertex 1 color (head of streak)
      lineColors[idx6 + 0] = col.r;
      lineColors[idx6 + 1] = col.g;
      lineColors[idx6 + 2] = col.b;

      // Vertex 2 color (tail of streak - fades out)
      lineColors[idx6 + 3] = col.r * 0.2;
      lineColors[idx6 + 4] = col.g * 0.2;
      lineColors[idx6 + 5] = col.b * 0.2;
    }

    return { localPositions, lineVertices, lineColors };
  }, [count, spreadX, spreadY, spreadZ]);

  // Ambient dust particle positions
  const dustPositions = useMemo(() => {
    const arr = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      arr[i + 0] = (Math.random() - 0.5) * (spreadX * 0.6);
      arr[i + 1] = (Math.random() - 0.5) * (spreadY * 0.6);
      arr[i + 2] = (Math.random() - 0.5) * (spreadZ * 0.6);
    }
    return arr;
  }, [dustCount, spreadX, spreadY, spreadZ]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const targetVel = targetVelRef.current.set(velocity[0], velocity[1], velocity[2]);

    // Damped interpolation of velocity to avoid abrupt snapping
    const lerpFactor = Math.min(1.0, dt * cfg.visualDampingFactor);
    smoothedVel.current.lerp(targetVel, lerpFactor);

    const currentSpeed = smoothedVel.current.length();
    const targetRatio = THREE.MathUtils.clamp(
      currentSpeed / cfg.maxSpeedReference,
      0,
      1
    );
    smoothedSpeedRatio.current = THREE.MathUtils.lerp(
      smoothedSpeedRatio.current,
      targetRatio,
      lerpFactor
    );

    const speedRatio = smoothedSpeedRatio.current;
    const isWarpSpeed = currentSpeed > cfg.warpSpeedThreshold;

    // Direction of relative motion using zero-allocation scratch vectors
    const velDir = velDirRef.current.copy(smoothedVel.current).normalize();
    const streakLength = isWarpSpeed
      ? THREE.MathUtils.lerp(
          cfg.streakMinLength,
          cfg.streakMaxLength,
          Math.min(1.0, (currentSpeed - cfg.warpSpeedThreshold) / (cfg.maxSpeedReference - cfg.warpSpeedThreshold))
        )
      : cfg.streakMinLength;

    const tailOffset = tailOffsetRef.current.copy(velDir).multiplyScalar(-streakLength);

    const halfX = spreadX * 0.5;
    const halfY = spreadY * 0.5;
    const halfZ = spreadZ * 0.5;

    const { localPositions, lineVertices } = particleData;
    const lineGeom = lineSegmentsRef.current?.geometry;
    const dustGeom = dustPointsRef.current?.geometry;

    if (!lineGeom) return;

    // Relative displacement step: particles move opposite to velocity vector
    // Multiply by speed multiplier so high speed feels visibly fast
    const motionSpeed = Math.max(1.8, currentSpeed * cfg.particleSpeedMultiplier);
    const stepX = -smoothedVel.current.x * (motionSpeed / (currentSpeed || 1)) * dt;
    const stepY = -smoothedVel.current.y * (motionSpeed / (currentSpeed || 1)) * dt;
    const stepZ = -smoothedVel.current.z * (motionSpeed / (currentSpeed || 1)) * dt;

    const camPos = camera.position;

    // Update streak lines
    for (let i = 0; i < count; i++) {
      const idx3 = i * 3;
      const idx6 = i * 6;

      let lx = localPositions[idx3 + 0] + stepX;
      let ly = localPositions[idx3 + 1] + stepY;
      let lz = localPositions[idx3 + 2] + stepZ;

      // Toroidal wrap-around in camera-relative volume
      if (lx > halfX) lx -= spreadX;
      else if (lx < -halfX) lx += spreadX;

      if (ly > halfY) ly -= spreadY;
      else if (ly < -halfY) ly += spreadY;

      if (lz > halfZ) lz -= spreadZ;
      else if (lz < -halfZ) lz += spreadZ;

      localPositions[idx3 + 0] = lx;
      localPositions[idx3 + 1] = ly;
      localPositions[idx3 + 2] = lz;

      // World positions anchored to camera position
      const wx = camPos.x + lx;
      const wy = camPos.y + ly;
      const wz = camPos.z + lz;

      // Vertex 1: Head of the particle/streak
      lineVertices[idx6 + 0] = wx;
      lineVertices[idx6 + 1] = wy;
      lineVertices[idx6 + 2] = wz;

      // Vertex 2: Tail of the streak (stretching opposite to velocity)
      lineVertices[idx6 + 3] = wx + tailOffset.x;
      lineVertices[idx6 + 4] = wy + tailOffset.y;
      lineVertices[idx6 + 5] = wz + tailOffset.z;
    }

    const posAttr = lineGeom.getAttribute('position') as THREE.BufferAttribute;
    if (posAttr) {
      posAttr.needsUpdate = true;
    }

    // Dynamic opacity: streaks become more radiant with higher velocity
    const lineMat = lineSegmentsRef.current?.material as THREE.LineBasicMaterial;
    if (lineMat) {
      const baseOpacity = isWarpSpeed ? 0.35 + speedRatio * 0.55 : 0.22;
      lineMat.opacity = THREE.MathUtils.clamp(baseOpacity, 0.1, 0.95);
    }

    // Update floating ambient micro-dust
    if (dustGeom) {
      const dustPosAttr = dustGeom.getAttribute('position') as THREE.BufferAttribute;
      if (dustPosAttr) {
        const dustArr = dustPosAttr.array as Float32Array;
        const dustStepMult = 0.35; // dust moves slower, closer to cockpit glass
        for (let j = 0; j < dustCount; j++) {
          const j3 = j * 3;
          let dx = dustPositions[j3 + 0] + stepX * dustStepMult;
          let dy = dustPositions[j3 + 1] + stepY * dustStepMult;
          let dz = dustPositions[j3 + 2] + stepZ * dustStepMult;

          if (dx > halfX * 0.6) dx -= spreadX * 0.6;
          else if (dx < -halfX * 0.6) dx += spreadX * 0.6;
          if (dy > halfY * 0.6) dy -= spreadY * 0.6;
          else if (dy < -halfY * 0.6) dy += spreadY * 0.6;
          if (dz > halfZ * 0.6) dz -= spreadZ * 0.6;
          else if (dz < -halfZ * 0.6) dz += spreadZ * 0.6;

          dustPositions[j3 + 0] = dx;
          dustPositions[j3 + 1] = dy;
          dustPositions[j3 + 2] = dz;

          dustArr[j3 + 0] = camPos.x + dx;
          dustArr[j3 + 1] = camPos.y + dy;
          dustArr[j3 + 2] = camPos.z + dz;
        }
        dustPosAttr.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      {/* Dynamic Velocity Directional Streaks */}
      <lineSegments ref={lineSegmentsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count * 2}
            array={particleData.lineVertices}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count * 2}
            array={particleData.lineColors}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* Ambient Micro-Dust and Cosmic Particulates */}
      <points ref={dustPointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dustCount}
            array={new Float32Array(dustPositions)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.6}
          color="#38bdf8"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
