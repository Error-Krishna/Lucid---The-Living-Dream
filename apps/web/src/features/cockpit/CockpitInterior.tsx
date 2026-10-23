import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetId, PLANET_CATALOG, getPlanetUniversePosition } from '@lucid/shared';

interface CockpitInteriorProps {
  throttle: number;
  speed: number;
  boost: boolean;
  autopilot: boolean;
  distanceToTarget: number;
  targetName: string;
  targetAccentColor?: string;
  awakeningStage: 'dark' | 'electrical' | 'lighting' | 'displays' | 'ready';
  steering: { pitch: number; yaw: number; roll: number };
  gearDeployed?: boolean;
  radarAltitude?: number;
  flightMode?: string;
  discoveredPlanets?: Partial<Record<PlanetId, boolean>>;
  spacecraftPosition?: [number, number, number];
  targetPlanetId?: PlanetId | null;
}

export function CockpitInterior({
  throttle,
  speed,
  boost,
  autopilot,
  distanceToTarget,
  targetName,
  targetAccentColor = '#38bdf8',
  awakeningStage,
  steering,
  gearDeployed = false,
  radarAltitude = 999,
  flightMode = 'spaceflight',
  discoveredPlanets = { origin: true },
  spacecraftPosition = [0, 8, 48],
  targetPlanetId = null,
}: CockpitInteriorProps) {
  const radarSweepRef = useRef<THREE.Mesh>(null);
  const leftStickRef = useRef<THREE.Group>(null);
  const rightStickRef = useRef<THREE.Group>(null);
  const warningLedRef = useRef<THREE.PointLight>(null);

  // Compute dynamic radar blips based on actual 3D universe coordinates
  const radarBlips = useMemo(() => {
    const list: {
      id: PlanetId;
      x: number;
      y: number;
      color: string;
      isTarget: boolean;
      dist: number;
    }[] = [];

    const pIds = Object.keys(PLANET_CATALOG) as PlanetId[];
    const [cx, , cz] = spacecraftPosition;

    pIds.forEach((pid) => {
      // Only render blip if discovered
      if (!discoveredPlanets[pid]) return;

      const [px, , pz] = getPlanetUniversePosition(pid);
      const dx = px - cx;
      const dz = pz - cz;
      const dist = Math.hypot(dx, dz);

      // Radar range radius ~ 2500 units max projection
      const maxRange = 2500;
      const normDist = Math.min(1.0, dist / maxRange);
      const r = normDist * 0.125; // Screen radius bounds

      // Angle relative to spacecraft yaw heading
      const angle = Math.atan2(dx, -dz) - steering.yaw;
      const bx = Math.sin(angle) * r;
      const by = Math.cos(angle) * r;

      const isTarget = targetPlanetId === pid;
      const meta = PLANET_CATALOG[pid];
      list.push({
        id: pid,
        x: bx,
        y: by,
        color: isTarget ? targetAccentColor : meta?.visualTheme.accentColor || '#38bdf8',
        isTarget,
        dist,
      });
    });

    return list;
  }, [discoveredPlanets, spacecraftPosition, targetPlanetId, steering.yaw, targetAccentColor]);

  // Compute lighting intensity based on awakening sequence
  const lightLevels = useMemo(() => {
    switch (awakeningStage) {
      case 'dark':
        return { ambient: 0.02, panel: 0, screens: 0, leds: 0 };
      case 'electrical':
        return { ambient: 0.15, panel: 0.1, screens: 0.2, leds: 0.6 };
      case 'lighting':
        return { ambient: 0.65, panel: 0.6, screens: 0.5, leds: 0.8 };
      case 'displays':
      case 'ready':
      default:
        return { ambient: 0.95, panel: 1.0, screens: 1.0, leds: 1.0 };
    }
  }, [awakeningStage]);

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Radar sweep rotation
    if (radarSweepRef.current && awakeningStage !== 'dark') {
      radarSweepRef.current.rotation.z -= delta * 2.2;
    }

    // Physical flight stick tilt responding to player controls
    if (leftStickRef.current && rightStickRef.current) {
      const targetPitch = steering.pitch * 0.25;
      const targetRoll = steering.roll * 0.3 + steering.yaw * 0.15;

      leftStickRef.current.rotation.x = THREE.MathUtils.lerp(
        leftStickRef.current.rotation.x,
        targetPitch,
        delta * 14
      );
      leftStickRef.current.rotation.z = THREE.MathUtils.lerp(
        leftStickRef.current.rotation.z,
        targetRoll,
        delta * 14
      );

      rightStickRef.current.rotation.x = THREE.MathUtils.lerp(
        rightStickRef.current.rotation.x,
        targetPitch,
        delta * 14
      );
      rightStickRef.current.rotation.z = THREE.MathUtils.lerp(
        rightStickRef.current.rotation.z,
        targetRoll,
        delta * 14
      );
    }

    // Warning / Autopilot pulsing beacon
    if (warningLedRef.current) {
      const pulse = autopilot ? 0.8 + Math.sin(time * 6) * 0.4 : 0.2;
      warningLedRef.current.intensity = pulse * lightLevels.leds;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Cockpit Interior Illumination */}
      <ambientLight intensity={lightLevels.ambient * 0.4} color="#0f172a" />
      <pointLight
        position={[0, 0.4, -0.4]}
        intensity={lightLevels.ambient * 1.2}
        color="#38bdf8"
        distance={2.8}
      />
      <pointLight
        ref={warningLedRef}
        position={[0, -0.15, -0.85]}
        intensity={lightLevels.leds * 0.8}
        color={autopilot ? '#38bdf8' : boost ? '#f59e0b' : '#10b981'}
        distance={1.5}
      />

      {/* ============================================================== */}
      {/* FORWARD CANOPY & REINFORCED COCKPIT FRAME                       */}
      {/* ============================================================== */}
      {/* Forward Arch Strut */}
      <mesh position={[0, 0.65, -1.05]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.08, 0.12]} />
        <meshStandardMaterial color="#0f172a" metalness={0.88} roughness={0.3} />
      </mesh>

      {/* Port Diagonal Canopy Pillar */}
      <mesh position={[-0.82, 0.1, -0.95]} rotation={[0, 0, -0.32]} castShadow>
        <boxGeometry args={[0.09, 1.35, 0.14]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.35} />
      </mesh>

      {/* Starboard Diagonal Canopy Pillar */}
      <mesh position={[0.82, 0.1, -0.95]} rotation={[0, 0, 0.32]} castShadow>
        <boxGeometry args={[0.09, 1.35, 0.14]} />
        <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.35} />
      </mesh>

      {/* Cockpit Roof & Dorsal Bulkhead */}
      <mesh position={[0, 0.85, -0.4]} rotation={[-0.1, 0, 0]}>
        <boxGeometry args={[1.8, 0.15, 1.4]} />
        <meshStandardMaterial color="#0b0f19" metalness={0.9} roughness={0.4} />
      </mesh>

      {/* Windshield Glare / Tinted Specular Glass */}
      <mesh position={[0, 0.22, -1.02]} rotation={[-0.2, 0, 0]}>
        <planeGeometry args={[1.65, 0.95]} />
        <meshPhysicalMaterial
          color="#020617"
          transparent
          opacity={0.12}
          roughness={0.08}
          metalness={0.1}
          reflectivity={0.6}
          clearcoat={1.0}
          clearcoatRoughness={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* ============================================================== */}
      {/* MAIN INSTRUMENT CONSOLE / DASHBOARD                            */}
      {/* ============================================================== */}
      <group position={[0, -0.42, -0.92]} rotation={[-0.45, 0, 0]}>
        {/* Main Angled Console Deck */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.82, 0.52, 0.28]} />
          <meshStandardMaterial color="#111827" metalness={0.7} roughness={0.5} />
        </mesh>

        {/* Console Bezel Edge Trim */}
        <mesh position={[0, 0.24, 0.12]}>
          <boxGeometry args={[1.8, 0.04, 0.06]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.25} />
        </mesh>

        {/* ------------------------------------------------------------ */}
        {/* LEFT MFD: RADAR / CELESTIAL TARGET SCANNER                   */}
        {/* ------------------------------------------------------------ */}
        <group position={[-0.52, 0.04, 0.15]}>
          {/* MFD Bezel Screen Base */}
          <mesh>
            <planeGeometry args={[0.42, 0.34]} />
            <meshBasicMaterial color="#030712" />
          </mesh>

          {/* Radar Circles */}
          {lightLevels.screens > 0.1 && (
            <>
              <mesh position={[0, 0, 0.005]}>
                <ringGeometry args={[0.07, 0.075, 32]} />
                <meshBasicMaterial color="#0284c7" transparent opacity={lightLevels.screens * 0.4} />
              </mesh>
              <mesh position={[0, 0, 0.005]}>
                <ringGeometry args={[0.13, 0.135, 32]} />
                <meshBasicMaterial color="#0284c7" transparent opacity={lightLevels.screens * 0.3} />
              </mesh>

              {/* Rotating Radar Sweep Line */}
              <mesh ref={radarSweepRef} position={[0, 0, 0.008]}>
                <ringGeometry args={[0.002, 0.135, 32, 1, 0, Math.PI / 4]} />
                <meshBasicMaterial
                  color="#38bdf8"
                  transparent
                  opacity={lightLevels.screens * 0.65}
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Dynamic Discovered Planetary Radar Blips */}
              {radarBlips.map((blip) => (
                <group key={blip.id} position={[blip.x, blip.y, 0.01]}>
                  <mesh>
                    <circleGeometry args={[blip.isTarget ? 0.011 : 0.007, 16]} />
                    <meshBasicMaterial color={blip.color} />
                  </mesh>
                  {blip.isTarget && (
                    <>
                      <pointLight color={blip.color} intensity={0.6} distance={0.4} />
                      <mesh rotation={[0, 0, Math.PI / 4]}>
                        <ringGeometry args={[0.016, 0.02, 4]} />
                        <meshBasicMaterial color={blip.color} />
                      </mesh>
                    </>
                  )}
                </group>
              ))}

              {/* Radar Data Header Text */}
              <Text
                position={[-0.18, 0.14, 0.01]}
                fontSize={0.022}
                color="#38bdf8"
                anchorX="left"
              >
                RADAR // DISCOVERED WORLDS
              </Text>
              <Text
                position={[-0.18, -0.13, 0.01]}
                fontSize={0.018}
                color={targetPlanetId ? targetAccentColor : '#64748b'}
                anchorX="left"
              >
                {targetPlanetId
                  ? `TRG: ${targetName.toUpperCase()} • ${Math.round(distanceToTarget)}KM`
                  : 'TRG: NONE [TAB / M TO SELECT]'}
              </Text>
            </>
          )}
        </group>

        {/* ------------------------------------------------------------ */}
        {/* CENTER CONSOLE: FLIGHT METRICS & ATTITUDE                    */}
        {/* ------------------------------------------------------------ */}
        <group position={[0, 0.04, 0.15]}>
          <mesh>
            <planeGeometry args={[0.45, 0.34]} />
            <meshBasicMaterial color="#020617" />
          </mesh>

          {lightLevels.screens > 0.1 && (
            <>
              {/* Artificial Horizon Center Line */}
              <mesh position={[0, 0, 0.005]} rotation={[0, 0, steering.roll * 0.4]}>
                <boxGeometry args={[0.26, 0.008, 0.001]} />
                <meshBasicMaterial color="#38bdf8" transparent opacity={0.7} />
              </mesh>

              {/* Digital Speed Tape */}
              <Text
                position={[0, 0.12, 0.01]}
                fontSize={0.026}
                color="#f8fafc"
                anchorX="center"
              >
                {`SPEED: ${Math.round(speed)} KM/S`}
              </Text>

              {/* Flight Mode Status */}
              <Text
                position={[0, 0.065, 0.01]}
                fontSize={0.019}
                color={
                  flightMode === 'landed'
                    ? '#10b981'
                    : flightMode === 'atmospheric_entry'
                    ? '#f59e0b'
                    : autopilot
                    ? '#38bdf8'
                    : '#06b6d4'
                }
                anchorX="center"
              >
                {flightMode === 'landed'
                  ? '■ GROUNDED // TOUCHDOWN'
                  : flightMode === 'atmospheric_entry'
                  ? '⚠ ATMOSPHERIC ENTRY'
                  : flightMode === 'descent'
                  ? '▼ TERMINAL DESCENT'
                  : autopilot
                  ? '● AUTOPILOT LOCKED'
                  : boost
                  ? '▲ SUPERLUMINAL BOOST'
                  : '● MANUAL SPACEFLIGHT'}
              </Text>

              {/* Radar Altimeter or Target Range */}
              {radarAltitude < 250 ? (
                <>
                  <Text
                    position={[0, -0.04, 0.01]}
                    fontSize={0.034}
                    color="#f59e0b"
                    anchorX="center"
                  >
                    {`ALT: ${Math.round(radarAltitude)} M`}
                  </Text>
                  <Text
                    position={[0, -0.11, 0.01]}
                    fontSize={0.019}
                    color={gearDeployed ? '#10b981' : '#ef4444'}
                    anchorX="center"
                  >
                    {gearDeployed ? 'GEAR: DEPLOYED' : '⚠ GEAR: RETRACTED [G]'}
                  </Text>
                </>
              ) : (
                <>
                  <Text
                    position={[0, -0.04, 0.01]}
                    fontSize={0.034}
                    color="#f472b6"
                    anchorX="center"
                  >
                    {targetPlanetId ? `${Math.round(distanceToTarget)} KM` : 'FREE FLIGHT'}
                  </Text>
                  <Text
                    position={[0, -0.11, 0.01]}
                    fontSize={0.019}
                    color="#94a3b8"
                    anchorX="center"
                  >
                    {targetPlanetId
                      ? `EST: ~${Math.max(1, Math.round(distanceToTarget / Math.max(10, speed)))}S`
                      : 'PRESS [M] FOR STARMAP'}
                  </Text>
                </>
              )}
            </>
          )}
        </group>

        {/* ------------------------------------------------------------ */}
        {/* RIGHT MFD: ENGINE TELEMETRY & SYSTEM GAUGES                  */}
        {/* ------------------------------------------------------------ */}
        <group position={[0.52, 0.04, 0.15]}>
          <mesh>
            <planeGeometry args={[0.42, 0.34]} />
            <meshBasicMaterial color="#030712" />
          </mesh>

          {lightLevels.screens > 0.1 && (
            <>
              <Text
                position={[-0.18, 0.14, 0.01]}
                fontSize={0.024}
                color="#38bdf8"
                anchorX="left"
              >
                PROPULSION // ION DRIVE
              </Text>

              {/* Throttle Bar Background */}
              <mesh position={[-0.08, 0.02, 0.005]}>
                <planeGeometry args={[0.18, 0.03]} />
                <meshBasicMaterial color="#1e293b" />
              </mesh>
              {/* Dynamic Throttle Fill Bar */}
              <mesh
                position={[-0.08 - 0.09 * (1 - throttle), 0.02, 0.008]}
                scale={[Math.max(0.01, throttle), 1, 1]}
              >
                <planeGeometry args={[0.18, 0.026]} />
                <meshBasicMaterial color={boost ? '#f59e0b' : '#38bdf8'} />
              </mesh>
              <Text
                position={[0.12, 0.02, 0.01]}
                fontSize={0.022}
                color="#f8fafc"
                anchorX="center"
              >
                {`${Math.round(throttle * 100)}%`}
              </Text>

              {/* Sub-system Status Rows */}
              <Text
                position={[-0.18, -0.04, 0.01]}
                fontSize={0.019}
                color={gearDeployed ? '#10b981' : '#94a3b8'}
                anchorX="left"
              >
                {`LANDING GEAR: ${gearDeployed ? 'DOWN [G]' : 'UP [G]'}`}
              </Text>
              <Text
                position={[-0.18, -0.09, 0.01]}
                fontSize={0.019}
                color="#38bdf8"
                anchorX="left"
              >
                SCANNER: READY [F]
              </Text>

              {/* Sub-system Status Rows */}
              <Text
                position={[-0.18, -0.04, 0.01]}
                fontSize={0.02}
                color="#94a3b8"
                anchorX="left"
              >
                SHIELD HARMONICS: 100%
              </Text>
              <Text
                position={[-0.18, -0.08, 0.01]}
                fontSize={0.02}
                color="#94a3b8"
                anchorX="left"
              >
                CORE TEMP: 412 K (STABLE)
              </Text>
              <Text
                position={[-0.18, -0.12, 0.01]}
                fontSize={0.02}
                color="#10b981"
                anchorX="left"
              >
                ATTITUDE: BALANCED
              </Text>
            </>
          )}
        </group>
      </group>

      {/* ============================================================== */}
      {/* DUAL FLIGHT STICKS & PILOT GLOVES                              */}
      {/* ============================================================== */}
      {/* Port Flight Stick & Pilot Left Hand */}
      <group position={[-0.42, -0.32, -0.65]}>
        <group ref={leftStickRef}>
          {/* Base Gimbal */}
          <mesh position={[0, -0.08, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Stick Shaft */}
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.015, 0.018, 0.16, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Ergonomic Flight Grip */}
          <mesh position={[0, 0.1, -0.01]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[0.04, 0.09, 0.05]} />
            <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.6} />
          </mesh>
          {/* Trigger Button Accent */}
          <mesh position={[0, 0.12, -0.035]}>
            <boxGeometry args={[0.015, 0.025, 0.012]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>

        {/* Pilot Left Forearm & Glove */}
        <group position={[-0.08, -0.12, 0.18]} rotation={[0.45, 0.25, -0.2]}>
          {/* Forearm Suit Sleeve */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.075, 0.32, 16]} />
            <meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.6} />
          </mesh>
          {/* Dark Joint Trim */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.062, 0.065, 0.05, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Starboard Flight Stick & Pilot Right Hand */}
      <group position={[0.42, -0.32, -0.65]}>
        <group ref={rightStickRef}>
          <mesh position={[0, -0.08, 0]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.015, 0.018, 0.16, 12]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.1, -0.01]} rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[0.04, 0.09, 0.05]} />
            <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.12, -0.035]}>
            <boxGeometry args={[0.015, 0.025, 0.012]} />
            <meshBasicMaterial color="#f472b6" />
          </mesh>
        </group>

        {/* Pilot Right Forearm & Glove */}
        <group position={[0.08, -0.12, 0.18]} rotation={[0.45, -0.25, 0.2]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.065, 0.075, 0.32, 16]} />
            <meshStandardMaterial color="#3b82f6" metalness={0.3} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.062, 0.065, 0.05, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
