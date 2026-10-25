import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import {
  HelpCircle,
  X,
  Keyboard,
  Rocket,
  Compass,
  Sliders,
  Sparkles,
  BookOpen,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { SensitivityPreset } from '../cockpit/flightSensitivityConfig.js';

export function ControlsHelpModal() {
  const isHelpOpen = useUniverseStore((s) => s.isHelpOpen);
  const setHelpOpen = useUniverseStore((s) => s.setHelpOpen);
  const setIntroOpen = useUniverseStore((s) => s.setIntroOpen);
  const restartTutorial = useUniverseStore((s) => s.restartTutorial);
  const flightSensitivity = useUniverseStore((s) => s.flightSensitivity);
  const setFlightSensitivity = useUniverseStore((s) => s.setFlightSensitivity);
  const flightAssistanceLevel = useUniverseStore((s) => s.flightAssistanceLevel);
  const setFlightAssistanceLevel = useUniverseStore((s) => s.setFlightAssistanceLevel);

  if (!isHelpOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 md:p-8 border border-cyan-500/40 relative shadow-2xl bg-slate-950/95 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setHelpOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Close Controls & Guidance"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-300">
            Explorer Flight & Ground Manual
          </span>
        </div>

        <h2 className="font-display text-2xl text-white font-bold mb-4">
          Controls & Flight Guidance
        </h2>

        {/* Quick Launch Actions: Intro & Tutorial */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <button
            onClick={() => {
              setHelpOpen(false);
              setIntroOpen(true);
            }}
            className="p-3 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/40 text-left transition-all flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                LUCID Project Vision & Intro
              </div>
              <div className="text-[10px] text-cyan-300 font-mono">
                View background, mission & purpose
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setHelpOpen(false);
              restartTutorial();
            }}
            className="p-3 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-left transition-all flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Interactive Flight Tutorial
              </div>
              <div className="text-[10px] text-indigo-300 font-mono">
                Restart guided 10-step flight training
              </div>
            </div>
          </button>
        </div>

        {/* Three Flight Assistance Levels */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Rocket className="w-4 h-4 text-indigo-400" />
              <span>Flight Assistance Level</span>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 uppercase">
              Current: {flightAssistanceLevel}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                {
                  id: 'manual',
                  label: 'Mode A: Manual',
                  desc: 'Full pilot authority. No automatic guidance.',
                },
                {
                  id: 'assisted',
                  label: 'Mode B: Assisted',
                  desc: 'Recommended: Target vector assist & lateral drift damping.',
                },
                {
                  id: 'autopilot',
                  label: 'Mode C: Autopilot',
                  desc: 'Autonomous navigation. Immediate manual override on input.',
                },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setFlightAssistanceLevel(item.id)}
                className={`p-2 rounded-xl border text-left transition-all ${
                  flightAssistanceLevel === item.id
                    ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold font-mono">{item.label}</div>
                <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Flight Sensitivity Settings Selector */}
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 mb-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Flight & Mouse Sensitivity Preset</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 uppercase">
              Current: {flightSensitivity}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { id: 'smooth', label: 'Smooth / Low', desc: 'Soft look & fine docking alignment' },
                { id: 'default', label: 'Standard / Balanced', desc: 'Standard responsive cockpit feel' },
                { id: 'agile', label: 'Agile / High', desc: 'Quick response for fast maneuvers' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => setFlightSensitivity(item.id)}
                className={`p-2 rounded-xl border text-left transition-all ${
                  flightSensitivity === item.id
                    ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-sm'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold font-mono">{item.label}</div>
                <div className="text-[9px] text-slate-400 mt-0.5 leading-tight">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {/* Spacecraft Cockpit Flight */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-cyan-500/30">
            <div className="flex items-center gap-2 mb-2 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span>Spacecraft Cockpit Flight & Planet Targeting</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="font-mono text-cyan-300">W / S</span>: Throttle Up / Down (Hold for Takeoff)
              </div>
              <div>
                <span className="font-mono text-cyan-300">A / D / Mouse</span>: Yaw & Pitch Steering (360°)
              </div>
              <div>
                <span className="font-mono text-cyan-300">Q / E</span>: Roll Axis
              </div>
              <div>
                <span className="font-mono text-cyan-300">Shift</span>: Superluminal Boost
              </div>
              <div>
                <span className="font-mono text-cyan-300">R</span>: Quick Turnaround 180° / Target Alignment
              </div>
              <div>
                <span className="font-mono text-cyan-300">F</span>: Sector Scanner Pulse (Discover Worlds)
              </div>
              <div>
                <span className="font-mono text-cyan-300">G</span>: Deploy / Retract Landing Gear
              </div>
              <div>
                <span className="font-mono text-cyan-300">Z / C / X</span>: Heading, Approach & Level Assist
              </div>
              <div>
                <span className="font-mono text-cyan-300">E</span>: Disembark Craft onto Planet Surface
              </div>
              <div>
                <span className="font-mono text-cyan-300">Space</span>: Autopilot / Takeoff Thrust
              </div>
              <div>
                <span className="font-mono text-cyan-300">Tab / T</span>: Cycle Navigation Reference Target
              </div>
              <div>
                <span className="font-mono text-cyan-300">M</span>: Starmap Navigation Atlas
              </div>
              <div>
                <span className="font-mono text-cyan-300">1 - 0</span>: Direct Target World Selection
              </div>
              <div>
                <span className="font-mono text-cyan-300">H</span>: Toggle Flight Tutorial & Guidance
              </div>
            </div>
          </div>

          {/* First-Person Ground Exploration */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <Keyboard className="w-4 h-4 text-indigo-400" />
              <span>First-Person Planetary Surface Exploration</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div>
                <span className="font-mono text-indigo-300">W / A / S / D</span>: Move
              </div>
              <div>
                <span className="font-mono text-indigo-300">Click Screen</span>: Capture Mouse Look
              </div>
              <div>
                <span className="font-mono text-indigo-300">Shift</span>: Sprint
              </div>
              <div>
                <span className="font-mono text-indigo-300">Space</span>: Jump (Planet Gravity)
              </div>
              <div>
                <span className="font-mono text-indigo-300">E</span>: Interact / Observe / Board Ship
              </div>
              <div>
                <span className="font-mono text-indigo-300">B</span>: Dream Architect World Builder
              </div>
              <div>
                <span className="font-mono text-indigo-300">ESC</span>: Release Mouse Cursor
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => setHelpOpen(false)}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-lg shadow-cyan-600/30"
          >
            Acknowledge & Close [ESC]
          </button>
        </div>
      </div>
    </div>
  );
}
