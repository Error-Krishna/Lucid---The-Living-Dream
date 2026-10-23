import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { CockpitInterior } from './CockpitInterior.js';
import { FlightGuidanceHUD, FlightTelemetry } from './FlightGuidanceHUD.js';
import { soundEngine } from '../../lib/sound.js';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import {
  PLANET_CATALOG,
  PlanetId,
  PlanetMetadata,
  getPlanetUniversePosition,
} from '@lucid/shared';
import {
  Compass,
  Rocket,
  Volume2,
  VolumeX,
  Crosshair,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Radar,
  Shield,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

const PLANET_IDS = Object.keys(PLANET_CATALOG) as PlanetId[];

function getCardinal(deg: number): string {
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return cardinals[index];
}

const DEFAULT_TELEMETRY: FlightTelemetry = {
  headingDeg: 0,
  cardinal: 'N',
  pitchDeg: 0,
  rollDeg: 0,
  speed: 0,
  forwardSpeed: 0,
  lateralSpeed: 0,
  verticalSpeed: 0,
  closingSpeed: 0,
  isApproaching: false,
  etaSeconds: null,
  headingErrorDeg: 0,
  pitchErrorDeg: 0,
  angularOffsetDeg: 0,
  isAligned: false,
  targetSector: 'ahead',
  targetScreenPos: { x: 50, y: 50, onScreen: true, isBehind: false },
  progradeScreenPos: { x: 50, y: 50, onScreen: true },
};

export function CockpitFlightScene() {
  const selectedTargetId = useUniverseStore((s) => s.selectedTargetId);
  const setTargetPlanet = useUniverseStore((s) => s.setTargetPlanet);
  const cycleTargetPlanet = useUniverseStore((s) => s.cycleTargetPlanet);
  const enterUniverseView = useUniverseStore((s) => s.enterUniverseView);
  const toggleMap = useUniverseStore((s) => s.toggleMap);
  const openFeedback = useUniverseStore((s) => s.openFinishExploration);

  const spacecraftPosition = useUniverseStore((s) => s.spacecraftPosition);
  const spacecraftVelocity = useUniverseStore((s) => s.spacecraftVelocity);
  const setSpacecraftPhysics = useUniverseStore((s) => s.setSpacecraftPhysics);
  const flightMode = useUniverseStore((s) => s.flightMode);
  const setFlightMode = useUniverseStore((s) => s.setFlightMode);
  const landingState = useUniverseStore((s) => s.landingState);
  const takeoffState = useUniverseStore((s) => s.takeoffState);
  const gearDeployed = useUniverseStore((s) => s.gearDeployed);
  const toggleGear = useUniverseStore((s) => s.toggleGear);
  const landingAssistance = useUniverseStore((s) => s.landingAssistance);
  const toggleLandingAssistance = useUniverseStore((s) => s.toggleLandingAssistance);
  const headingAssistance = useUniverseStore((s) => s.headingAssistance);
  const toggleHeadingAssistance = useUniverseStore((s) => s.toggleHeadingAssistance);
  const approachAssistance = useUniverseStore((s) => s.approachAssistance);
  const toggleApproachAssistance = useUniverseStore((s) => s.toggleApproachAssistance);
  const isTutorialVisible = useUniverseStore((s) => s.isTutorialVisible);
  const setIsTutorialVisible = useUniverseStore((s) => s.setIsTutorialVisible);
  const isScanning = useUniverseStore((s) => s.isScanning);
  const pulseScanner = useUniverseStore((s) => s.pulseScanner);
  const discoveredPlanets = useUniverseStore((s) => s.discoveredPlanets);
  const throttle = useUniverseStore((s) => s.throttle);
  const setThrottle = useUniverseStore((s) => s.setThrottle);
  const radarAltitude = useUniverseStore((s) => s.radarAltitude);
  const setRadarAltitude = useUniverseStore((s) => s.setRadarAltitude);
  const landingFeedback = useUniverseStore((s) => s.landingFeedback);
  const attemptLanding = useUniverseStore((s) => s.attemptLanding);
  const disembarkCraft = useUniverseStore((s) => s.disembarkCraft);
  const initiateTakeoff = useUniverseStore((s) => s.initiateTakeoff);
  const activePlanet = useUniverseStore((s) => s.activePlanet);

  // Flight settings & state
  const [awakeningStage, setAwakeningStage] = useState<
    'dark' | 'electrical' | 'lighting' | 'displays' | 'ready'
  >('ready');
  const [boost, setBoost] = useState(false);
  const [autopilot, setAutopilot] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.getIsMuted());
  const [showControlsHelp, setShowControlsHelp] = useState(true);

  // Full 6DOF Flight Telemetry & Guidance State
  const [telemetry, setTelemetry] = useState<FlightTelemetry>(DEFAULT_TELEMETRY);

  // Steering Euler angles: yaw has 360-degree freedom!
  const steeringRef = useRef({ pitch: 0, yaw: 0, roll: 0 });
  const keysRef = useRef<Record<string, boolean>>({});
  const isMouseDownRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });

  // Cockpit interior group ref to attach to camera
  const cockpitGroupRef = useRef<THREE.Group>(null);

  // Speed telemetry
  const speed = Math.round(
    Math.hypot(spacecraftVelocity[0], spacecraftVelocity[1], spacecraftVelocity[2])
  );

  // Active target planet metadata
  const targetMeta = selectedTargetId ? PLANET_CATALOG[selectedTargetId] : null;

  // Calculate Euclidean distance to active target reference
  const distanceToTarget = useMemo(() => {
    if (!selectedTargetId) return 0;
    const [tx, ty, tz] = getPlanetUniversePosition(selectedTargetId);
    return Math.hypot(
      tx - spacecraftPosition[0],
      ty - spacecraftPosition[1],
      tz - spacecraftPosition[2]
    );
  }, [selectedTargetId, spacecraftPosition]);

  // Turn around 180° or align directly with target
  const handleQuickTurnaround = useCallback(() => {
    soundEngine.playTargetLocked();
    if (selectedTargetId) {
      const [tx, ty, tz] = getPlanetUniversePosition(selectedTargetId);
      const dx = tx - spacecraftPosition[0];
      const dy = ty - spacecraftPosition[1];
      const dz = tz - spacecraftPosition[2];

      const desiredYaw = Math.atan2(dx, -dz);
      const horizDist = Math.hypot(dx, dz);
      const desiredPitch = -Math.atan2(dy, Math.max(1, horizDist));

      steeringRef.current.yaw = desiredYaw;
      steeringRef.current.pitch = Math.max(-1.45, Math.min(1.45, desiredPitch));
      steeringRef.current.roll = 0;
    } else {
      // 180-degree turnaround flip
      steeringRef.current.yaw += Math.PI;
      steeringRef.current.roll = 0;
    }
  }, [selectedTargetId, spacecraftPosition]);

  // Handle target navigation reference cycling (NEVER teleports)
  const handleCycleTarget = useCallback(
    (direction: 1 | -1 = 1) => {
      cycleTargetPlanet(direction);
    },
    [cycleTargetPlanet]
  );

  // Keyboard Event Listeners for Spaceflight Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keysRef.current[e.code] = true;

      // Throttle controls
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        if (flightMode === 'landed') {
          initiateTakeoff();
        } else {
          setThrottle(Math.min(1.0, throttle + 0.1));
        }
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        setThrottle(Math.max(0.0, throttle - 0.1));
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setBoost(true);
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleQuickTurnaround();
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (flightMode === 'landed') {
          initiateTakeoff();
        } else {
          setAutopilot((prev) => {
            const next = !prev;
            if (next) soundEngine.playTargetLocked();
            else soundEngine.playUIBeep('low');
            return next;
          });
        }
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        pulseScanner();
      } else if (e.code === 'KeyG') {
        e.preventDefault();
        toggleGear();
      } else if (e.code === 'KeyZ') {
        e.preventDefault();
        toggleHeadingAssistance();
      } else if (e.code === 'KeyC') {
        e.preventDefault();
        toggleApproachAssistance();
      } else if (e.code === 'KeyX') {
        e.preventDefault();
        toggleLandingAssistance();
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        if (flightMode === 'landed') {
          disembarkCraft();
        }
      } else if (e.code === 'Tab' || e.code === 'KeyT') {
        e.preventDefault();
        handleCycleTarget(e.shiftKey ? -1 : 1);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMap();
      } else if (e.code === 'KeyU') {
        e.preventDefault();
        enterUniverseView();
      } else if (e.code === 'KeyH') {
        setShowControlsHelp((prev) => !prev);
        setIsTutorialVisible(!isTutorialVisible);
      } else {
        // Direct number keys 1-0 for setting target navigation reference (never teleports)
        const numberMap: Record<string, PlanetId> = {
          Digit1: 'origin',
          Digit2: 'candyverse',
          Digit3: 'pixel',
          Digit4: 'nature',
          Digit5: 'glassia',
          Digit6: 'abyss',
          Digit7: 'zephyr',
          Digit8: 'ignis',
          Digit9: 'astraea',
          Digit0: 'chronos',
        };
        if (numberMap[e.code]) {
          setTargetPlanet(numberMap[e.code]);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setBoost(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest('button') || (e.target as HTMLElement)?.closest('.glass-panel')) {
        return;
      }
      soundEngine.ensureContext();
      if (e.button === 0) {
        isMouseDownRef.current = true;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isMouseDownRef.current && flightMode !== 'landed') {
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        lastMousePosRef.current = { x: e.clientX, y: e.clientY };

        // Continuous full 360-degree yaw steering (no clamping)
        steeringRef.current.yaw -= dx * 0.0035;
        // Pitch clamping within -83° to +83°
        steeringRef.current.pitch = Math.max(
          -1.45,
          Math.min(1.45, steeringRef.current.pitch + dy * 0.0035)
        );
      }
    };

    const handleMouseUp = () => {
      isMouseDownRef.current = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    flightMode,
    throttle,
    setThrottle,
    pulseScanner,
    toggleGear,
    toggleHeadingAssistance,
    toggleApproachAssistance,
    toggleLandingAssistance,
    setIsTutorialVisible,
    isTutorialVisible,
    disembarkCraft,
    initiateTakeoff,
    handleCycleTarget,
    toggleMap,
    enterUniverseView,
    setTargetPlanet,
    handleQuickTurnaround,
  ]);

  const toggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none">
      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0, 0], fov: 62 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
      >
        {/* Deep Starfield Outside Windshield */}
        <Stars radius={200} depth={100} count={4500} factor={4.0} saturation={0.9} fade />
        <color attach="background" args={['#02040c']} />
        <directionalLight position={[40, 20, -50]} intensity={1.5} color="#fff" />
        <ambientLight intensity={0.25} />

        {/* Continuous 3D Spacecraft Physics & Atmospheric Controller */}
        <PhysicalFlightController
          steering={steeringRef.current}
          keys={keysRef.current}
          throttle={throttle}
          boost={boost}
          autopilot={autopilot}
          cockpitGroupRef={cockpitGroupRef}
          setTelemetry={setTelemetry}
        />

        {/* 3D Celestial Bodies rendered at true physical coordinates */}
        <AllPlanetsInSpace />

        {/* Expanding Holographic 3D Scanner Wave */}
        {isScanning && <ScannerPulseWave />}

        {/* First-Person Cockpit Interior Mesh (attached to vehicle orientation) */}
        <group ref={cockpitGroupRef}>
          <CockpitInterior
            throttle={throttle}
            speed={speed}
            boost={boost}
            autopilot={autopilot}
            distanceToTarget={distanceToTarget}
            targetName={targetMeta?.name || 'UNLOCKED'}
            targetAccentColor={targetMeta?.visualTheme.accentColor || '#38bdf8'}
            awakeningStage={awakeningStage}
            steering={steeringRef.current}
            gearDeployed={gearDeployed}
            radarAltitude={radarAltitude}
            flightMode={flightMode}
            discoveredPlanets={discoveredPlanets}
            spacecraftPosition={spacecraftPosition}
            targetPlanetId={selectedTargetId}
          />
        </group>
      </Canvas>

      {/* ============================================================== */}
      {/* HUD & COCKPIT FLIGHT INTERFACE                                */}
      {/* ============================================================== */}

      {/* Top Header Control Bar */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between pointer-events-none z-30">
        {/* Left Status Telemetry */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900/85 border border-cyan-500/40 flex items-center justify-center glow-box-indigo">
            <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
          </div>
          <div>
            <div className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">
              LUCID-01 // COCKPIT MANUAL FLIGHT
            </div>
            <div className="font-display text-sm text-slate-100 font-semibold tracking-wide flex items-center gap-2">
              <span>
                {flightMode === 'landed'
                  ? `TOUCHDOWN // ${PLANET_CATALOG[activePlanet]?.name}`
                  : flightMode === 'descent'
                  ? `DESCENT // ALT: ${Math.round(radarAltitude)}M`
                  : flightMode === 'atmospheric_entry'
                  ? `ATMOSPHERIC ENTRY // SPEED: ${speed} KM/S`
                  : `SPACEFLIGHT // SPEED: ${speed} KM/S`}
              </span>
              {gearDeployed && (
                <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-500/60 text-[9px] font-mono text-emerald-300">
                  GEAR DOWN
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center Target Navigation Selector */}
        <div className="pointer-events-auto hidden md:flex items-center gap-2 glass-panel px-3 py-1.5 rounded-2xl border border-cyan-500/40 bg-slate-950/85 shadow-lg">
          <button
            onClick={() => handleCycleTarget(-1)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Previous Discovered World [Shift+Tab / T]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: targetMeta ? targetMeta.visualTheme.accentColor : '#64748b',
              }}
            />
            <span className="text-xs font-mono font-bold tracking-wide text-white uppercase">
              {targetMeta ? targetMeta.name : 'NO NAV TARGET'}
            </span>
            {targetMeta && (
              <span className="text-[10px] font-mono text-cyan-400 font-semibold ml-1">
                {Math.round(distanceToTarget)} KM
              </span>
            )}
          </div>

          <button
            onClick={() => handleCycleTarget(1)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Next Discovered World [Tab]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-1" />

          {/* Quick 180° Turnaround / Align Target Button */}
          <button
            onClick={handleQuickTurnaround}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 text-amber-200 text-[11px] font-mono transition-all hover:scale-105"
            title="Turn Around 180° / Align Heading with Target [R]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Turn 180° [R]</span>
          </button>

          {/* Scanner Pulse Button */}
          <button
            onClick={() => pulseScanner()}
            disabled={isScanning}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
              isScanning
                ? 'bg-cyan-500/30 border border-cyan-400 text-cyan-200 animate-pulse'
                : 'bg-slate-900 hover:bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:scale-105'
            }`}
            title="Pulse Long-Range Scanner [F]"
          >
            <Radar className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>Scan [F]</span>
          </button>

          {/* Gear Toggle Button */}
          <button
            onClick={() => toggleGear()}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all border ${
              gearDeployed
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-200'
                : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Toggle Landing Gear [G]"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Gear [G]</span>
          </button>

          {/* Starmap Atlas */}
          <button
            onClick={toggleMap}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-[11px] font-mono transition-all hover:scale-105"
            title="Open 10-Planet Navigation Atlas [M]"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Atlas [M]</span>
          </button>
        </div>

        {/* Right Audio & Feedback Controls */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => setShowControlsHelp((s) => !s)}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Toggle Controls Guide [H]"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-300 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <button
            onClick={openFeedback}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-xs font-mono tracking-wider transition-colors"
          >
            Finish Exploration
          </button>
        </div>
      </div>

      {/* Atmospheric Entry Turbulence Glow Effect */}
      {flightMode === 'atmospheric_entry' && (
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-orange-900/25 via-transparent to-amber-900/20 animate-pulse" />
      )}

      {/* Flight Guidance HUD: Compass Ribbon, Attitude Ball, Nose Crosshair, Velocity Marker, Reticle & Assistance */}
      <FlightGuidanceHUD
        telemetry={telemetry}
        targetMeta={targetMeta}
        distanceToTarget={distanceToTarget}
        onQuickTurnaround={handleQuickTurnaround}
      />

      {/* Landed / Grounded Action Prompt */}
      {flightMode === 'landed' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto text-center">
          <div className="glass-panel p-6 rounded-3xl border border-emerald-400/60 bg-slate-950/90 shadow-2xl max-w-md mx-4 animate-bounce">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-300" />
            </div>
            <h3 className="font-display text-lg text-white font-bold mb-1">
              TOUCHDOWN CONFIRMED
            </h3>
            <p className="text-xs text-slate-300 font-mono mb-4">
              Landed at {PLANET_CATALOG[activePlanet]?.name}. The spacecraft is secured on the landing pad.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => disembarkCraft()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-mono text-xs font-bold tracking-wider shadow-lg shadow-emerald-500/30 transition-all"
              >
                [E] DISEMBARK & EXPLORE ON FOOT
              </button>
              <button
                onClick={() => initiateTakeoff()}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs tracking-wider transition-colors"
              >
                [W / Space] Fire Thrusters for Takeoff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Guide Pill */}
      {showControlsHelp && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none max-w-[95vw]">
          <div className="glass-panel px-5 py-2.5 rounded-2xl border border-slate-700/60 text-slate-300 text-xs font-mono flex flex-wrap items-center justify-center gap-4 shadow-2xl backdrop-blur-md">
            <span><strong className="text-cyan-400">W/S</strong> Throttle</span>
            <span><strong className="text-cyan-400">A/D / Mouse</strong> Steer (360°)</span>
            <span><strong className="text-cyan-400">R</strong> Turn 180° / Align</span>
            <span><strong className="text-cyan-400">Z</strong> Heading Assist</span>
            <span><strong className="text-cyan-400">C</strong> Approach Assist</span>
            <span><strong className="text-cyan-400">X</strong> Level Assist</span>
            <span><strong className="text-cyan-400">G</strong> Gear ({gearDeployed ? 'DOWN' : 'UP'})</span>
            <span><strong className="text-cyan-400">Tab / T</strong> Target</span>
            <span><strong className="text-cyan-400">H</strong> Tutorial</span>
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------------------
// Continuous 3D Spacecraft Physics & Atmospheric Controller
// -------------------------------------------------------------------
function PhysicalFlightController({
  steering,
  keys,
  throttle,
  boost,
  autopilot,
  cockpitGroupRef,
  setTelemetry,
}: {
  steering: { pitch: number; yaw: number; roll: number };
  keys: Record<string, boolean>;
  throttle: number;
  boost: boolean;
  autopilot: boolean;
  cockpitGroupRef: React.RefObject<THREE.Group>;
  setTelemetry: React.Dispatch<React.SetStateAction<FlightTelemetry>>;
}) {
  const { camera } = useThree();
  const spacecraftPosition = useUniverseStore((s) => s.spacecraftPosition);
  const spacecraftVelocity = useUniverseStore((s) => s.spacecraftVelocity);
  const setSpacecraftPhysics = useUniverseStore((s) => s.setSpacecraftPhysics);
  const selectedTargetId = useUniverseStore((s) => s.selectedTargetId);
  const flightMode = useUniverseStore((s) => s.flightMode);
  const setFlightMode = useUniverseStore((s) => s.setFlightMode);
  const gearDeployed = useUniverseStore((s) => s.gearDeployed);
  const setRadarAltitude = useUniverseStore((s) => s.setRadarAltitude);
  const attemptLanding = useUniverseStore((s) => s.attemptLanding);
  const landingAssistance = useUniverseStore((s) => s.landingAssistance);
  const headingAssistance = useUniverseStore((s) => s.headingAssistance);
  const approachAssistance = useUniverseStore((s) => s.approachAssistance);
  const takeoffState = useUniverseStore((s) => s.takeoffState);

  // Position and velocity vectors
  const posRef = useRef(new THREE.Vector3(...spacecraftPosition));
  const velRef = useRef(new THREE.Vector3(...spacecraftVelocity));
  const lastSoundUpdateTime = useRef(0);
  const lastWarningSoundTime = useRef(0);
  const lastTelemetryUpdateTime = useRef(0);

  // Sync position if changed externally
  useEffect(() => {
    posRef.current.set(...spacecraftPosition);
  }, [spacecraftPosition]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);

    // If landed, hold grounded position
    if (flightMode === 'landed') {
      velRef.current.set(0, 0, 0);
      return;
    }

    // Steering keyboard inputs: Continuous 360-degree yaw freedom!
    const turnRate = 1.8;
    if (keys['KeyA'] || keys['ArrowLeft']) {
      steering.yaw += turnRate * dt; // Turn left continuously
      steering.roll = THREE.MathUtils.lerp(steering.roll, -0.35, dt * 5); // Bank left
    } else if (keys['KeyD'] || keys['ArrowRight']) {
      steering.yaw -= turnRate * dt; // Turn right continuously
      steering.roll = THREE.MathUtils.lerp(steering.roll, 0.35, dt * 5); // Bank right
    } else {
      // In space, yaw maintains heading! Roll gently returns to level
      steering.roll = THREE.MathUtils.lerp(steering.roll, 0, dt * 4);
    }

    if (keys['KeyQ']) {
      steering.roll = Math.max(-0.6, steering.roll - 1.2 * dt);
    } else if (keys['KeyE']) {
      steering.roll = Math.min(0.6, steering.roll + 1.2 * dt);
    }

    // Heading assistance or Autopilot orientation towards selected target
    if ((headingAssistance || autopilot) && selectedTargetId) {
      const isActivelySteering =
        keys['KeyA'] || keys['KeyD'] || keys['ArrowLeft'] || keys['ArrowRight'];
      if (!isActivelySteering) {
        const [tx, ty, tz] = getPlanetUniversePosition(selectedTargetId);
        const targetVec = new THREE.Vector3(
          tx - posRef.current.x,
          ty - posRef.current.y,
          tz - posRef.current.z
        );

        const desiredYaw = Math.atan2(targetVec.x, -targetVec.z);
        const horizDist = Math.hypot(targetVec.x, targetVec.z);
        const desiredPitch = -Math.atan2(targetVec.y, Math.max(1, horizDist));

        // Shortest angular turn difference so craft doesn't spin wildly
        let diffYaw = desiredYaw - steering.yaw;
        while (diffYaw < -Math.PI) diffYaw += Math.PI * 2;
        while (diffYaw > Math.PI) diffYaw -= Math.PI * 2;

        const assistRate = autopilot ? 2.5 : 1.4;
        steering.yaw += diffYaw * Math.min(1.0, assistRate * dt);
        steering.pitch = THREE.MathUtils.lerp(
          steering.pitch,
          Math.max(-1.45, Math.min(1.45, desiredPitch)),
          dt * assistRate
        );
      }
    }

    // Orient camera to craft heading
    camera.rotation.order = 'YXZ';
    camera.rotation.set(steering.pitch, steering.yaw, steering.roll);

    // Lock cockpit interior mesh to camera so it stays fixed in front of windshield
    if (cockpitGroupRef.current) {
      cockpitGroupRef.current.position.copy(camera.position);
      cockpitGroupRef.current.rotation.copy(camera.rotation);
    }

    // Camera world vectors
    const forwardVec = new THREE.Vector3();
    camera.getWorldDirection(forwardVec);
    forwardVec.normalize();

    const rightVec = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).normalize();
    const upVec = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

    // Thrust calculation
    const baseThrust = throttle * 90;
    const boostMult = boost ? 2.4 : 1.0;
    const totalThrust = baseThrust * boostMult;

    // Apply thrust along forward heading
    const accel = forwardVec.clone().multiplyScalar(totalThrust * dt);
    velRef.current.add(accel);

    // Approach Assistance: dampen lateral drift relative to approach corridor & regulate speed
    if (approachAssistance && selectedTargetId) {
      const [tx, ty, tz] = getPlanetUniversePosition(selectedTargetId);
      const toTargetVec = new THREE.Vector3(
        tx - posRef.current.x,
        ty - posRef.current.y,
        tz - posRef.current.z
      );
      const dTarget = toTargetVec.length();
      if (dTarget > 1) {
        const uTarget = toTargetVec.clone().normalize();
        const colinearSpeed = velRef.current.dot(uTarget);
        const colinearVel = uTarget.clone().multiplyScalar(colinearSpeed);
        const lateralDrift = velRef.current.clone().sub(colinearVel);
        velRef.current.sub(lateralDrift.multiplyScalar(Math.min(1.0, 0.45 * dt)));

        // Speed corridor regulation in proximity (< 250km)
        if (dTarget < 250 && dTarget > 40) {
          const corridorMaxSpeed = Math.max(35, (dTarget / 250) * 85);
          if (velRef.current.length() > corridorMaxSpeed) {
            velRef.current.multiplyScalar(Math.max(0.5, 1 - 0.5 * dt));
          }
        }
      }
    }

    // Liftoff vertical thrust when initiating takeoff
    if (takeoffState === 'liftoff') {
      velRef.current.y += 45 * dt;
    }

    // Find closest planet to compute atmospheric entry & radar altitude
    let closestPlanetId: PlanetId = 'origin';
    let minDistance = Infinity;

    PLANET_IDS.forEach((pid) => {
      const pPos = getPlanetUniversePosition(pid);
      const d = Math.hypot(
        pPos[0] - posRef.current.x,
        pPos[1] - posRef.current.y,
        pPos[2] - posRef.current.z
      );
      if (d < minDistance) {
        minDistance = d;
        closestPlanetId = pid;
      }
    });

    const planetMeta = PLANET_CATALOG[closestPlanetId];
    const planetVisualRadius = (planetMeta?.radius || 3) * 12; // ~36 units
    const altitudeAbovePlanet = Math.max(0, minDistance - planetVisualRadius);
    setRadarAltitude(altitudeAbovePlanet * 2.5); // Scaled to meters for display

    // Atmospheric Drag & Rumble
    let drag = 0.08;
    if (altitudeAbovePlanet < 120) {
      // Inside planetary atmosphere corridor
      const atmoDensity = Math.max(0, 1 - altitudeAbovePlanet / 120);
      drag = 0.15 + atmoDensity * 0.45; // Aerodynamic drag dampens velocity
      soundEngine.setAtmosphericRumble(atmoDensity * (velRef.current.length() / 80));

      if (altitudeAbovePlanet < 35) {
        if (flightMode !== 'descent') setFlightMode('descent');

        // Landing Assistance Auto-Leveling
        if (landingAssistance) {
          steering.pitch = THREE.MathUtils.lerp(steering.pitch, 0, dt * 3);
          steering.roll = THREE.MathUtils.lerp(steering.roll, 0, dt * 3);
        }

        // GPWS Ground Proximity Warning alarm if descending too rapidly near ground
        const descentSpeed = -velRef.current.y;
        if (descentSpeed > 14 && altitudeAbovePlanet < 25) {
          const now = performance.now();
          if (now - lastWarningSoundTime.current > 600) {
            lastWarningSoundTime.current = now;
            soundEngine.playProximityWarning();
          }
        }

        // Touchdown evaluation when altitude hits surface
        if (altitudeAbovePlanet <= 2.0) {
          const horizSpeed = Math.hypot(velRef.current.x, velRef.current.z);
          const success = attemptLanding(closestPlanetId, velRef.current.y, horizSpeed);

          if (success) {
            velRef.current.set(0, 0, 0);
          } else {
            // Bounce up safely so craft remains recoverable
            velRef.current.y = 22;
          }
        }
      } else {
        if (flightMode !== 'atmospheric_entry') setFlightMode('atmospheric_entry');
      }
    } else {
      if (flightMode !== 'spaceflight' && flightMode !== 'cockpit') {
        setFlightMode('spaceflight');
        soundEngine.setAtmosphericRumble(0);
      }
    }

    // Space / atmospheric friction damping
    velRef.current.multiplyScalar(Math.max(0, 1 - drag * dt));

    // Update position: pos += vel * dt
    posRef.current.add(velRef.current.clone().multiplyScalar(dt));

    // Update store state
    setSpacecraftPhysics(
      [posRef.current.x, posRef.current.y, posRef.current.z],
      [velRef.current.x, velRef.current.y, velRef.current.z],
      steering
    );

    // Audio thrust update (throttled)
    const nowMs = performance.now();
    if (nowMs - lastSoundUpdateTime.current > 120) {
      lastSoundUpdateTime.current = nowMs;
      soundEngine.setEngineThrust(throttle, boost);
    }

    // Guidance telemetry computation (throttled to ~30Hz for silky UI performance)
    if (nowMs - lastTelemetryUpdateTime.current > 33) {
      lastTelemetryUpdateTime.current = nowMs;

      // Compass Heading & Pitch & Roll
      let headingDeg = (Math.atan2(forwardVec.x, -forwardVec.z) * 180) / Math.PI;
      headingDeg = ((headingDeg % 360) + 360) % 360;
      const cardinal = getCardinal(headingDeg);
      const pitchDeg = (Math.asin(Math.max(-1, Math.min(1, forwardVec.y))) * 180) / Math.PI;
      const rollDeg = (steering.roll * 180) / Math.PI;

      // Velocities
      const curSpeed = velRef.current.length();
      const fwdSpeed = velRef.current.dot(forwardVec);
      const latSpeed = velRef.current.dot(rightVec);
      const vertSpeed = velRef.current.dot(upVec);

      // Prograde Velocity Vector Projection
      let progradeScreenX = 50;
      let progradeScreenY = 50;
      let progradeOnScreen = false;
      if (curSpeed > 0.8) {
        const progradeDir = velRef.current.clone().normalize();
        const isFwdMotion = forwardVec.dot(progradeDir) > 0.05;
        if (isFwdMotion) {
          const pPoint = posRef.current.clone().add(progradeDir.multiplyScalar(60));
          const pProj = pPoint.project(camera);
          if (pProj.z < 1) {
            progradeScreenX = (pProj.x * 0.5 + 0.5) * 100;
            progradeScreenY = (-pProj.y * 0.5 + 0.5) * 100;
            progradeOnScreen =
              progradeScreenX >= 3 &&
              progradeScreenX <= 97 &&
              progradeScreenY >= 5 &&
              progradeScreenY <= 95;
          }
        }
      }

      // Target Planet Telemetry
      let headingErrorDeg = 0;
      let pitchErrorDeg = 0;
      let angularOffsetDeg = 0;
      let isAligned = false;
      let targetSector: 'ahead' | 'beside' | 'behind' = 'ahead';
      let targetScreenX = 50;
      let targetScreenY = 50;
      let targetOnScreen = false;
      let isTargetBehind = false;
      let closingSpeed = 0;
      let isApproaching = false;
      let etaSeconds: number | null = null;

      if (selectedTargetId) {
        const [tx, ty, tz] = getPlanetUniversePosition(selectedTargetId);
        const relTarget = new THREE.Vector3(
          tx - posRef.current.x,
          ty - posRef.current.y,
          tz - posRef.current.z
        );
        const distTarget = relTarget.length();
        if (distTarget > 0.001) {
          const uTarget = relTarget.clone().normalize();

          // Local coordinate errors
          const rFwd = relTarget.dot(forwardVec);
          const rRight = relTarget.dot(rightVec);
          const rUp = relTarget.dot(upVec);

          headingErrorDeg = (Math.atan2(rRight, rFwd) * 180) / Math.PI;
          const horizDist = Math.hypot(rFwd, rRight);
          pitchErrorDeg = (Math.atan2(rUp, Math.max(1, horizDist)) * 180) / Math.PI;

          const dotFwd = Math.max(-1, Math.min(1, forwardVec.dot(uTarget)));
          angularOffsetDeg = Math.round((Math.acos(dotFwd) * 180) / Math.PI);
          isAligned = angularOffsetDeg <= 4;

          if (angularOffsetDeg > 105) targetSector = 'behind';
          else if (angularOffsetDeg > 40) targetSector = 'beside';
          else targetSector = 'ahead';

          // Screen projection
          const tPoint = posRef.current.clone().add(uTarget.clone().multiplyScalar(60));
          const tProj = tPoint.project(camera);
          isTargetBehind = tProj.z > 1 || dotFwd <= 0.1;
          targetScreenX = (tProj.x * 0.5 + 0.5) * 100;
          targetScreenY = (-tProj.y * 0.5 + 0.5) * 100;
          targetOnScreen =
            !isTargetBehind &&
            targetScreenX >= 3 &&
            targetScreenX <= 97 &&
            targetScreenY >= 5 &&
            targetScreenY <= 95;

          closingSpeed = velRef.current.dot(uTarget);
          isApproaching = closingSpeed > 1;
          etaSeconds =
            isApproaching && closingSpeed > 0.5 ? Math.round(distTarget / closingSpeed) : null;
        }
      }

      setTelemetry({
        headingDeg: Math.round(headingDeg),
        cardinal,
        pitchDeg: Math.round(pitchDeg),
        rollDeg: Math.round(rollDeg),
        speed: Math.round(curSpeed),
        forwardSpeed: Math.round(fwdSpeed),
        lateralSpeed: Math.round(latSpeed),
        verticalSpeed: Math.round(vertSpeed),
        closingSpeed: Math.round(closingSpeed),
        isApproaching,
        etaSeconds,
        headingErrorDeg: Math.round(headingErrorDeg * 10) / 10,
        pitchErrorDeg: Math.round(pitchErrorDeg * 10) / 10,
        angularOffsetDeg,
        isAligned,
        targetSector,
        targetScreenPos: {
          x: Math.round(targetScreenX * 10) / 10,
          y: Math.round(targetScreenY * 10) / 10,
          onScreen: targetOnScreen,
          isBehind: isTargetBehind,
        },
        progradeScreenPos: {
          x: Math.round(progradeScreenX * 10) / 10,
          y: Math.round(progradeScreenY * 10) / 10,
          onScreen: progradeOnScreen,
        },
      });
    }
  });

  return null;
}

// -------------------------------------------------------------------
// 3D Celestial Bodies rendered at true physical coordinates
// -------------------------------------------------------------------
function AllPlanetsInSpace() {
  const spacecraftPosition = useUniverseStore((s) => s.spacecraftPosition);
  const discoveredPlanets = useUniverseStore((s) => s.discoveredPlanets);
  const selectedTargetId = useUniverseStore((s) => s.selectedTargetId);

  return (
    <group>
      {PLANET_IDS.map((pid) => {
        const meta = PLANET_CATALOG[pid];
        const [px, py, pz] = getPlanetUniversePosition(pid);

        // Position relative to the spacecraft: (planetPos - craftPos)
        const relX = px - spacecraftPosition[0];
        const relY = py - spacecraftPosition[1];
        const relZ = pz - spacecraftPosition[2];

        const isTarget = selectedTargetId === pid;
        const isDiscovered = !!discoveredPlanets[pid];
        const planetScale = (meta.radius || 3) * 12;

        return (
          <SinglePlanetGlobe
            key={pid}
            meta={meta}
            position={[relX, relY, relZ]}
            scale={planetScale}
            isTarget={isTarget}
            isDiscovered={isDiscovered}
          />
        );
      })}
    </group>
  );
}

function SinglePlanetGlobe({
  meta,
  position,
  scale,
  isTarget,
  isDiscovered,
}: {
  meta: PlanetMetadata;
  position: [number, number, number];
  scale: number;
  isTarget: boolean;
  isDiscovered: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.05;
    }
  });

  const dist = Math.hypot(position[0], position[1], position[2]);
  if (dist > 8000) return null;

  const color = isDiscovered ? meta.visualTheme.accentColor : '#64748b';

  return (
    <group position={position} ref={groupRef}>
      {/* Planetary Sphere Body */}
      <mesh scale={[scale, scale, scale]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isTarget ? 0.45 : 0.25}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>

      {/* Planetary Rings */}
      {meta.hasRings && isDiscovered && (
        <mesh ref={ringRef} rotation={[1.1, 0.4, 0]} scale={[scale, scale, scale]}>
          <ringGeometry args={[1.5, 2.3, 48]} />
          <meshBasicMaterial
            color={meta.ringColor || meta.visualTheme.accentColor}
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Atmospheric Rim Glow */}
      <mesh scale={[scale * 1.08, scale * 1.08, scale * 1.08]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.25}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------------
// Expanding Holographic 3D Scanner Wave
// -------------------------------------------------------------------
function ScannerPulseWave() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.scale.addScalar(delta * 45);
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      if (mat && mat.opacity > 0.01) {
        mat.opacity -= delta * 0.4;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[5, 32, 32]} />
      <meshBasicMaterial color="#38bdf8" transparent opacity={0.65} wireframe />
    </mesh>
  );
}
