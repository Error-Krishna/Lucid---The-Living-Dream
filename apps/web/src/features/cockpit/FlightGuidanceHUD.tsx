import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { PlanetMetadata } from '@lucid/shared';
import { TacticalPlanetRadar } from './TacticalPlanetRadar.js';
import {
  Compass,
  Crosshair,
  Navigation,
  RotateCcw,
  Shield,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export interface FlightTelemetry {
  headingDeg: number;
  cardinal: string;
  pitchDeg: number;
  rollDeg: number;
  speed: number;
  forwardSpeed: number;
  lateralSpeed: number;
  verticalSpeed: number;
  closingSpeed: number;
  isApproaching: boolean;
  etaSeconds: number | null;
  headingErrorDeg: number;
  pitchErrorDeg: number;
  angularOffsetDeg: number;
  isAligned: boolean;
  targetSector: 'ahead' | 'beside' | 'behind';
  targetScreenPos: { x: number; y: number; onScreen: boolean; isBehind: boolean };
  progradeScreenPos: { x: number; y: number; onScreen: boolean };
}

interface FlightGuidanceHUDProps {
  telemetry: FlightTelemetry;
  targetMeta: PlanetMetadata | null;
  distanceToTarget: number;
  onQuickTurnaround: () => void;
}

export function FlightGuidanceHUD({
  telemetry,
  targetMeta,
  distanceToTarget,
  onQuickTurnaround,
}: FlightGuidanceHUDProps) {
  const flightMode = useUniverseStore((s) => s.flightMode);
  const throttle = useUniverseStore((s) => s.throttle);
  const gearDeployed = useUniverseStore((s) => s.gearDeployed);
  const toggleGear = useUniverseStore((s) => s.toggleGear);
  const headingAssistance = useUniverseStore((s) => s.headingAssistance);
  const toggleHeadingAssistance = useUniverseStore((s) => s.toggleHeadingAssistance);
  const approachAssistance = useUniverseStore((s) => s.approachAssistance);
  const toggleApproachAssistance = useUniverseStore((s) => s.toggleApproachAssistance);
  const landingAssistance = useUniverseStore((s) => s.landingAssistance);
  const toggleLandingAssistance = useUniverseStore((s) => s.toggleLandingAssistance);

  // Authoritative Autopilot & Assistance Level State
  const autopilot = useUniverseStore((s) => s.autopilot);
  const disengageAutopilot = useUniverseStore((s) => s.disengageAutopilot);
  const autopilotPhase = useUniverseStore((s) => s.autopilotPhase);
  const flightAssistanceLevel = useUniverseStore((s) => s.flightAssistanceLevel);
  const setFlightAssistanceLevel = useUniverseStore((s) => s.setFlightAssistanceLevel);

  const {
    headingDeg,
    cardinal,
    pitchDeg,
    rollDeg,
    speed,
    forwardSpeed,
    lateralSpeed,
    verticalSpeed,
    closingSpeed,
    isApproaching,
    etaSeconds,
    headingErrorDeg,
    pitchErrorDeg,
    angularOffsetDeg,
    isAligned,
    targetSector,
    targetScreenPos,
    progradeScreenPos,
  } = telemetry;

  // Steering command text
  const headingSteerText =
    Math.abs(headingErrorDeg) < 3.0
      ? 'ON VECTOR'
      : headingErrorDeg > 0
      ? `STEER RIGHT ${Math.round(headingErrorDeg)}° [D]`
      : `STEER LEFT ${Math.round(Math.abs(headingErrorDeg))}° [A]`;

  const pitchSteerText =
    Math.abs(pitchErrorDeg) < 3.0
      ? 'ON LEVEL'
      : pitchErrorDeg > 0
      ? `PITCH UP ${Math.round(pitchErrorDeg)}° [PULL]`
      : `PITCH DOWN ${Math.round(Math.abs(pitchErrorDeg))}° [PUSH]`;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 select-none overflow-hidden font-mono">
      {/* ============================================================== */}
      {/* 1. TOP NAVIGATION COMPASS RIBBON TAPE                          */}
      {/* ============================================================== */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-[340px] md:w-[460px] h-12 flex flex-col items-center">
        {/* Lubber Line Pip */}
        <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[7px] border-t-cyan-400 z-10" />

        {/* Compass Tape Window */}
        <div className="relative w-full h-8 overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-950/80 backdrop-blur-md px-2 flex items-center shadow-lg">
          <div
            className="absolute flex items-center gap-6 whitespace-nowrap transition-transform duration-75 text-[11px] font-bold"
            style={{
              left: '50%',
              transform: `translateX(-${(headingDeg / 360) * 1080 + 360}px)`,
            }}
          >
            {[0, 1, 2].map((loop) => (
              <React.Fragment key={loop}>
                {[
                  { deg: 0, label: '000 N' },
                  { deg: 45, label: '045 NE' },
                  { deg: 90, label: '090 E' },
                  { deg: 135, label: '135 SE' },
                  { deg: 180, label: '180 S' },
                  { deg: 225, label: '225 SW' },
                  { deg: 270, label: '270 W' },
                  { deg: 315, label: '315 NW' },
                ].map((item) => (
                  <div key={item.deg} className="flex flex-col items-center w-12 text-slate-300">
                    <span
                      className={`text-[10px] ${
                        item.label.includes('N')
                          ? 'text-cyan-400 font-extrabold'
                          : 'text-slate-300'
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="w-[1px] h-2 bg-slate-600 mt-0.5" />
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>

          {/* Target Bearing Needle Marker on Compass Ribbon */}
          {targetMeta && (
            <div
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-75"
              style={{
                left: `${Math.max(8, Math.min(92, 50 + (headingErrorDeg / 180) * 45))}%`,
              }}
            >
              <div
                className="w-2.5 h-2.5 rotate-45 border shadow-sm"
                style={{
                  backgroundColor: targetMeta.visualTheme.accentColor,
                  borderColor: '#fff',
                }}
              />
              <span
                className="text-[8px] font-bold uppercase mt-0.5"
                style={{ color: targetMeta.visualTheme.accentColor }}
              >
                TRG
              </span>
            </div>
          )}
        </div>

        {/* Current Heading & Attitude Readout */}
        <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-cyan-300 tracking-wider">
          <span>HDG {Math.round(headingDeg).toString().padStart(3, '0')}° {cardinal}</span>
          <span>•</span>
          <span>PITCH {pitchDeg >= 0 ? `+${Math.round(pitchDeg)}` : Math.round(pitchDeg)}°</span>
          <span>•</span>
          <span>ROLL {rollDeg >= 0 ? `+${Math.round(rollDeg)}` : Math.round(rollDeg)}°</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. OPTICAL NOSE BORE-SIGHT CROSSHAIR [ + ]                     */}
      {/* ============================================================== */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center opacity-75">
        <div className="relative w-7 h-7 flex items-center justify-center">
          <div className="absolute w-7 h-[1.5px] bg-cyan-400/80" />
          <div className="absolute h-7 w-[1.5px] bg-cyan-400/80" />
          <div className="w-2.5 h-2.5 rounded-full border border-cyan-400/90" />
        </div>
        <span className="text-[8px] text-cyan-300 tracking-wider mt-1 uppercase font-bold">
          NOSE
        </span>
      </div>

      {/* ============================================================== */}
      {/* 3. FLIGHT PATH MARKER / VELOCITY VECTOR (-◯-)                  */}
      {/* ============================================================== */}
      {speed > 1 && progradeScreenPos.onScreen && (
        <div
          className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-75 flex flex-col items-center"
          style={{
            left: `${Math.max(10, Math.min(90, progradeScreenPos.x))}%`,
            top: `${Math.max(12, Math.min(88, progradeScreenPos.y))}%`,
          }}
        >
          <div className="relative flex items-center">
            <div className="w-3.5 h-[2px] bg-emerald-400" />
            <div className="w-4 h-4 rounded-full border-2 border-emerald-400 flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-emerald-300" />
            </div>
            <div className="w-3.5 h-[2px] bg-emerald-400" />
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[2px] h-2 bg-emerald-400" />
          </div>
          <span className="text-[8px] text-emerald-300 font-bold bg-black/60 px-1 py-0.2 rounded mt-0.5">
            VECTOR: {Math.round(speed)} KM/S
          </span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. SCREEN-SPACE TARGET RETICLE & OFF-SCREEN POINTER            */}
      {/* ============================================================== */}
      {targetMeta && (
        <>
          {targetScreenPos.onScreen && !targetScreenPos.isBehind ? (
            /* Target Planet is in front and on windshield view */
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-75 flex flex-col items-center"
              style={{
                left: `${targetScreenPos.x}%`,
                top: `${targetScreenPos.y}%`,
              }}
            >
              <div
                className={`relative w-28 h-28 border-2 rounded-xl flex items-center justify-center ${
                  isAligned
                    ? 'border-emerald-400 shadow-lg shadow-emerald-500/40 animate-pulse'
                    : 'border-dashed border-cyan-400'
                }`}
                style={{
                  borderColor: isAligned ? '#10b981' : targetMeta.visualTheme.accentColor,
                }}
              >
                <Crosshair
                  className="w-7 h-7"
                  style={{
                    color: isAligned ? '#10b981' : targetMeta.visualTheme.accentColor,
                  }}
                />

                <span
                  className="absolute -top-6 text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border border-white/10 bg-slate-950/85 whitespace-nowrap"
                  style={{
                    color: isAligned ? '#10b981' : targetMeta.visualTheme.accentColor,
                  }}
                >
                  {isAligned ? '● VECTOR ALIGNED' : targetMeta.name.toUpperCase()}
                </span>

                <span className="absolute -bottom-6 text-[10px] font-bold text-cyan-300 px-2 py-0.5 rounded border border-white/10 bg-slate-950/85 whitespace-nowrap flex items-center gap-1.5">
                  <span>{Math.round(distanceToTarget)} KM</span>
                  <span>•</span>
                  <span>ERR {Math.round(angularOffsetDeg)}°</span>
                </span>
              </div>
            </div>
          ) : (
            /* Target Planet is off-screen or behind the craft */
            <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 pointer-events-none z-20">
              <div className="glass-panel p-3 rounded-2xl border border-amber-400/80 bg-slate-950/95 shadow-2xl max-w-sm text-center animate-pulse pointer-events-auto">
                <div className="flex items-center justify-center gap-2 mb-1 text-amber-300 text-xs font-bold uppercase">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>
                    {targetSector === 'behind' ? 'TARGET IS BEHIND YOU' : 'TARGET OFF-SCREEN'}
                  </span>
                </div>

                <div className="text-white text-xs font-bold mb-1.5">
                  {targetMeta.name.toUpperCase()} • {Math.round(distanceToTarget)} KM
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold py-1.5 border-y border-slate-800 text-cyan-300">
                  <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                    <div className="text-[8px] text-slate-400">YAW STEER</div>
                    <div className="text-white text-[11px] mt-0.5">{headingSteerText}</div>
                  </div>
                  <div className="bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
                    <div className="text-[8px] text-slate-400">PITCH STEER</div>
                    <div className="text-white text-[11px] mt-0.5">{pitchSteerText}</div>
                  </div>
                </div>

                <button
                  onClick={onQuickTurnaround}
                  className="mt-2 w-full py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-slate-950 font-bold text-[11px] tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-lg"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Align Directly to Target [R]</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* 5. PRIMARY FLIGHT TELEMETRY (Right Side MFD)                   */}
      {/* ============================================================== */}
      <div className="absolute top-28 right-6 hidden md:flex flex-col gap-2.5 w-60 pointer-events-auto">
        {/* Velocities & Drift Box */}
        <div className="glass-panel p-3 rounded-2xl border border-cyan-500/40 bg-slate-950/90 shadow-xl">
          <div className="flex items-center justify-between text-[10px] text-cyan-400 font-bold border-b border-slate-800 pb-1 mb-2">
            <span>FLIGHT VELOCITY</span>
            <span className="text-white">{Math.round(speed)} KM/S</span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Forward Speed:</span>
              <span className="font-bold text-white">{Math.round(forwardSpeed)} km/s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Lateral Drift:</span>
              <span
                className={`font-bold ${
                  Math.abs(lateralSpeed) > 6 ? 'text-amber-300' : 'text-slate-200'
                }`}
              >
                {Math.round(lateralSpeed)} km/s
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Vertical Climb:</span>
              <span className="font-bold text-white">{Math.round(verticalSpeed)} km/s</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-800/80">
              <span className="text-slate-400">Throttle:</span>
              <span className="font-bold text-cyan-300">{Math.round(throttle * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Target Approach Guidance Box */}
        {targetMeta && (
          <div className="glass-panel p-3 rounded-2xl border border-indigo-500/40 bg-slate-950/90 shadow-xl">
            <div className="flex items-center justify-between text-[10px] text-indigo-400 font-bold border-b border-slate-800 pb-1 mb-2">
              <span>TARGET APPROACH</span>
              <span className={isAligned ? 'text-emerald-400' : 'text-amber-400'}>
                {isAligned ? '● ALIGNED' : 'ALIGNING'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="font-bold text-white truncate max-w-[120px]">
                  {targetMeta.name.split('—')[0]}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Distance:</span>
                <span className="font-bold text-cyan-300">{Math.round(distanceToTarget)} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Closing Speed:</span>
                <span
                  className={`font-bold ${
                    isApproaching ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isApproaching
                    ? `+${Math.round(closingSpeed)} km/s`
                    : `${Math.round(closingSpeed)} km/s`}
                </span>
              </div>
              {etaSeconds && (
                <div className="flex justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Estimated Arrival:</span>
                  <span className="font-bold text-white">~{etaSeconds}s</span>
                </div>
              )}
            </div>

            {/* Steering Correction Guidance Strip */}
            <div className="mt-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-bold text-center">
              {isAligned ? (
                <span className="text-emerald-400 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  COURSE LOCKED
                </span>
              ) : (
                <div className="flex flex-col gap-0.5 text-cyan-300">
                  <span>{headingSteerText}</span>
                  <span>{pitchSteerText}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 6. LOWER INSTRUMENTATION DECK (Non-overlapping Flex Layout)    */}
      {/* ============================================================== */}
      <div className="absolute bottom-4 sm:bottom-5 left-3 sm:left-6 right-3 sm:right-6 flex items-end justify-between pointer-events-none z-20">
        {/* LOWER LEFT: Dedicated Tactical Radar & Gyrometer Cluster */}
        <div className="flex items-end gap-3 pointer-events-auto">
          {/* A. Tactical Planet Radar (Always visible, dedicated container) */}
          <TacticalPlanetRadar size={140} />

          {/* B. Gyrometer / Attitude Indicator (Placed side-by-side, NEVER overlaps radar) */}
          <div className="hidden sm:flex glass-panel p-2.5 rounded-2xl border border-cyan-500/40 bg-slate-950/90 shadow-2xl w-40 h-44 flex-col items-center justify-between relative overflow-hidden">
            {/* Header */}
            <div className="w-full flex items-center justify-between text-[8px] text-slate-400 font-bold border-b border-slate-800 pb-1">
              <span className="text-cyan-400">ATTITUDE // GYRO</span>
              <span>{isAligned ? 'ALIGNED' : 'DRIFT'}</span>
            </div>

            {/* Attitude Ball / Pitch Ladder */}
            <div className="relative w-28 h-28 rounded-full border border-slate-700 bg-slate-900/90 overflow-hidden flex items-center justify-center">
              <div
                className="absolute inset-0 flex flex-col items-center justify-center transition-transform duration-75"
                style={{
                  transform: `rotate(${rollDeg}deg) translateY(${pitchDeg * 1.3}px)`,
                }}
              >
                <div className="w-full h-1/2 bg-cyan-950/40 border-b border-cyan-400" />
                <div className="w-full h-1/2 bg-amber-950/30" />

                {[-30, -20, -10, 10, 20, 30].map((step) => (
                  <div
                    key={step}
                    className="absolute w-10 flex items-center justify-between text-[7px] text-cyan-300/70"
                    style={{ top: `calc(50% - ${step * 1.3}px)` }}
                  >
                    <span className="w-2 h-[1px] bg-cyan-400" />
                    <span>{Math.abs(step)}</span>
                    <span className="w-2 h-[1px] bg-cyan-400" />
                  </div>
                ))}
              </div>

              {/* Fixed Aircraft Reticle Symbol */}
              <div className="relative z-10 flex items-center gap-1">
                <div className="w-3.5 h-[2px] bg-amber-400" />
                <div className="w-2 h-2 rounded-full border border-amber-400" />
                <div className="w-3.5 h-[2px] bg-amber-400" />
              </div>
            </div>

            {/* Telemetry Footer */}
            <div className="w-full flex items-center justify-between text-[9px] text-slate-300 font-bold pt-1 border-t border-slate-800">
              <span>P: {Math.round(pitchDeg)}°</span>
              <span className="text-cyan-400">R: {Math.round(rollDeg)}°</span>
              <span>Y: {Math.round(headingDeg)}°</span>
            </div>
          </div>
        </div>

        {/* LOWER CENTER: Autopilot Active Status & Assistance Level Pill */}
        <div className="flex flex-col items-center gap-2 pointer-events-auto">
          {/* Autopilot Status Banner */}
          {autopilot && (
            <div className="glass-panel px-4 py-2 rounded-2xl border border-cyan-400/90 bg-slate-950/95 shadow-2xl flex items-center gap-3 animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <div className="flex flex-col">
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">
                  AUTOPILOT ACTIVE // {autopilotPhase.toUpperCase()}
                </span>
                <span className="text-[9px] text-slate-300">
                  {targetMeta ? `Navigating to ${targetMeta.name.split('—')[0]} (${Math.round(distanceToTarget)} km)` : 'Cruising'}
                </span>
              </div>
              <button
                onClick={() => disengageAutopilot('Manual control restored.')}
                className="px-2.5 py-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-[10px] font-bold tracking-wider uppercase transition-colors ml-2 shadow-md"
                title="Regain full manual control [Space]"
              >
                Take Control [Space]
              </button>
            </div>
          )}

          {/* Three Flight Assistance Levels Selector */}
          <div className="glass-panel p-1 rounded-2xl border border-slate-800 bg-slate-950/85 flex items-center gap-1 text-[10px] font-bold shadow-lg">
            <button
              onClick={() => setFlightAssistanceLevel('manual')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                flightAssistanceLevel === 'manual'
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Full manual spacecraft control"
            >
              MANUAL
            </button>
            <button
              onClick={() => setFlightAssistanceLevel('assisted')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                flightAssistanceLevel === 'assisted'
                  ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Assisted flight: Target alignment & drift damping"
            >
              ASSISTED
            </button>
            <button
              onClick={() => setFlightAssistanceLevel('autopilot')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                flightAssistanceLevel === 'autopilot'
                  ? 'bg-indigo-600/35 text-indigo-200 border border-indigo-400/70 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Autopilot: Autonomous flight toward selected destination"
            >
              AUTOPILOT
            </button>
          </div>
        </div>

        {/* LOWER RIGHT: Assistance Modes Toggle Dock */}
        <div className="hidden lg:flex glass-panel p-2 rounded-2xl border border-slate-800 bg-slate-950/85 flex-col gap-1.5 w-56 pointer-events-auto">
          <div className="text-[8px] text-slate-400 font-bold px-1">
            FLIGHT ASSIST MODES
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => toggleHeadingAssistance()}
              className={`px-2 py-1 rounded-xl border text-[9px] font-bold transition-all text-left flex items-center justify-between ${
                headingAssistance
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>HEADING [Z]</span>
              <span>{headingAssistance ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={() => toggleApproachAssistance()}
              className={`px-2 py-1 rounded-xl border text-[9px] font-bold transition-all text-left flex items-center justify-between ${
                approachAssistance
                  ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>APPROACH [C]</span>
              <span>{approachAssistance ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={() => toggleLandingAssistance()}
              className={`px-2 py-1 rounded-xl border text-[9px] font-bold transition-all text-left flex items-center justify-between ${
                landingAssistance
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>LEVEL [X]</span>
              <span>{landingAssistance ? 'ON' : 'OFF'}</span>
            </button>
            <button
              onClick={() => toggleGear()}
              className={`px-2 py-1 rounded-xl border text-[9px] font-bold transition-all text-left flex items-center justify-between ${
                gearDeployed
                  ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>GEAR [G]</span>
              <span>{gearDeployed ? 'DOWN' : 'UP'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
