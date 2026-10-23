import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { PLANET_CATALOG } from '@lucid/shared';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  Radio,
  LogOut,
  HelpCircle,
  CheckCircle2,
  Rocket,
} from 'lucide-react';

export function UniverseHUD() {
  const visitedPlanets = useUniverseStore((s) => s.visitedPlanets);
  const connectionMode = useUniverseStore((s) => s.connectionMode);
  const soundEnabled = useUniverseStore((s) => s.soundEnabled);
  const setSoundEnabled = useUniverseStore((s) => s.setSoundEnabled);
  const exitToLanding = useUniverseStore((s) => s.exitToLanding);
  const openFinishExploration = useUniverseStore((s) => s.openFinishExploration);
  const setHelpOpen = useUniverseStore((s) => s.setHelpOpen);

  const totalPlanets = Object.keys(PLANET_CATALOG).length;
  const visitedCount = Object.keys(visitedPlanets).length;

  return (
    <header className="fixed top-6 inset-x-6 z-20 flex items-center justify-between pointer-events-none">
      {/* Brand & Universe Telemetry */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center glow-box-indigo">
          <Sparkles className="w-4 h-4 text-indigo-300" />
        </div>
        <div className="glass-panel px-4 py-2 rounded-2xl flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-display tracking-[0.2em] text-xs font-bold text-white uppercase">
              LUCID UNIVERSE
            </span>
            <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
              {visitedCount} / {totalPlanets} Worlds Charted
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
            <Rocket className="w-3 h-3 text-indigo-400" />
            LUCID-01 Spacecraft // Deep Space Nav Active
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* Connection Mode Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-xs">
          <Radio
            className={`w-3.5 h-3.5 ${
              connectionMode === 'connected'
                ? 'text-emerald-400 animate-pulse'
                : 'text-amber-400'
            }`}
          />
          <span className="text-slate-300 font-mono text-[11px]">
            {connectionMode === 'connected' ? 'Multiplayer Online' : 'Local Demo'}
          </span>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2.5 rounded-xl glass-panel hover:border-indigo-400/60 text-slate-300 hover:text-white transition-colors"
          title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-indigo-300" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Controls Help */}
        <button
          onClick={() => setHelpOpen(true)}
          className="p-2.5 rounded-xl glass-panel hover:border-indigo-400/60 text-slate-300 hover:text-white transition-colors"
          title="Controls Guide"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Finish Exploration / Required Feedback CTA */}
        <button
          onClick={openFinishExploration}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md shadow-emerald-600/30 hover:scale-105 active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Finish Exploration</span>
        </button>

        {/* Sanctuary Exit */}
        <button
          onClick={exitToLanding}
          className="p-2.5 rounded-xl glass-panel hover:bg-rose-950/30 text-slate-400 hover:text-rose-300 transition-colors"
          title="Return to Sanctuary"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
