import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { PLANET_CATALOG } from '@lucid/shared';
import { Rocket, X, Compass, Globe, Sparkles, Navigation } from 'lucide-react';

export function SpacecraftTacticalPanel() {
  const selectedDestination = useUniverseStore((s) => s.selectedDestination);
  const clearDestination = useUniverseStore((s) => s.clearDestination);
  const initiateTravel = useUniverseStore((s) => s.initiateTravel);
  const visitedPlanets = useUniverseStore((s) => s.visitedPlanets);

  if (!selectedDestination) return null;

  const planet = PLANET_CATALOG[selectedDestination];
  if (!planet) return null;

  const isVisited = Boolean(visitedPlanets[selectedDestination]);

  return (
    <div className="fixed bottom-8 right-8 z-30 w-full max-w-md pointer-events-auto">
      <div className="glass-panel rounded-3xl p-6 border border-indigo-400/40 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={clearDestination}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Dismiss Target Lock"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Spacecraft Target Header */}
        <div className="flex items-center gap-2 mb-2">
          <Navigation className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono tracking-widest text-cyan-300 uppercase font-semibold">
            Target Acquired // Spacecraft Nav
          </span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-2xl text-white font-bold">
            {planet.name}
          </h2>
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: planet.visualTheme.accentColor }}
          />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-950/80 border border-indigo-800/60 text-indigo-300">
            {planet.category}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border ${
              isVisited
                ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300'
                : 'bg-amber-950/80 border-amber-800/60 text-amber-300'
            }`}
          >
            {isVisited ? 'Visited Realm' : 'Unexplored Destination'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          {planet.description}
        </p>

        {/* Tactical Telemetry Box */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-900/50 border border-indigo-950/80 mb-5 text-[11px]">
          <div>
            <span className="text-slate-500 font-mono block text-[9px] uppercase">
              Distance
            </span>
            <span className="text-slate-200 font-mono font-medium">
              {planet.distanceLightYears > 0
                ? `${planet.distanceLightYears.toFixed(2)} Light Years`
                : 'Anchored Nexus'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 font-mono block text-[9px] uppercase">
              Surface Gravity
            </span>
            <span className="text-slate-200 font-mono font-medium">
              {planet.rules.gravity} m/s²
            </span>
          </div>
        </div>

        {/* Primary Travel Action */}
        <button
          onClick={() => initiateTravel(planet.id)}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold text-xs tracking-widest uppercase transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2.5 glow-box-indigo hover:scale-[1.02] active:scale-[0.98]"
        >
          <Rocket className="w-4 h-4 text-cyan-200" />
          <span>Initiate Interplanetary Travel</span>
        </button>
      </div>
    </div>
  );
}
