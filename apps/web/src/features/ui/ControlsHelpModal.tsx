import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { HelpCircle, X, Keyboard, Rocket, Compass } from 'lucide-react';

export function ControlsHelpModal() {
  const isHelpOpen = useUniverseStore((s) => s.isHelpOpen);
  const setHelpOpen = useUniverseStore((s) => s.setHelpOpen);

  if (!isHelpOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 md:p-8 border border-cyan-500/40 relative shadow-2xl bg-slate-950/95 max-h-[92vh] overflow-y-auto">
        <button
          onClick={() => setHelpOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1.5">
          <HelpCircle className="w-5 h-5 text-cyan-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-300">
            Explorer Flight & Ground Manual
          </span>
        </div>

        <h2 className="font-display text-2xl text-white font-bold mb-4">
          Controls & Multiverse Navigation
        </h2>

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
                <span className="font-mono text-cyan-300">A / D / Mouse</span>: Yaw & Pitch Steering
              </div>
              <div>
                <span className="font-mono text-cyan-300">Q / E</span>: Roll Axis
              </div>
              <div>
                <span className="font-mono text-cyan-300">Shift</span>: Superluminal Boost
              </div>
              <div>
                <span className="font-mono text-cyan-300">F</span>: Sector Scanner Pulse (Discover Worlds)
              </div>
              <div>
                <span className="font-mono text-cyan-300">G</span>: Deploy / Retract Landing Gear
              </div>
              <div>
                <span className="font-mono text-cyan-300">X</span>: Landing Assistance Mode
              </div>
              <div>
                <span className="font-mono text-cyan-300">E</span>: Disembark Craft onto Planet Surface
              </div>
              <div>
                <span className="font-mono text-cyan-300">Space</span>: Autopilot Vector / Takeoff Thrust
              </div>
              <div>
                <span className="font-mono text-cyan-300">Tab / T</span>: Cycle Navigation Reference Target
              </div>
              <div>
                <span className="font-mono text-cyan-300">M</span>: Starmap Navigation Atlas
              </div>
              <div>
                <span className="font-mono text-cyan-300">1 - 0</span>: Select Target World Reference
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
                <span className="font-mono text-indigo-300">M</span>: Starmap / Fast Travel
              </div>
              <div>
                <span className="font-mono text-indigo-300">ESC</span>: Release Mouse Cursor
              </div>
            </div>
          </div>

          {/* Planetary Realms Reference */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>10 Charted Planetary Realms</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              [1] Origin • [2] Candyverse • [3] Pixel Realm • [4] Nature Prime • [5] Glassia • [6] The Abyss • [7] Zephyr • [8] Ignis • [9] Astraea • [0] Chronos
            </p>
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