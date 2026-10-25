import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { PLANET_CATALOG, PlanetId } from '@lucid/shared';
import { Compass, Footprints, ArrowRight, Pause, X, MapPin } from 'lucide-react';

export function GuidedExplorationOverlay() {
  const guidedExplorationState = useUniverseStore((s) => s.guidedExplorationState);
  const setGuidedExplorationState = useUniverseStore((s) => s.setGuidedExplorationState);
  const activePlanet = useUniverseStore((s) => s.activePlanet);
  const selectedTargetId = useUniverseStore((s) => s.selectedTargetId);
  const suggestNextGuidedPlanet = useUniverseStore((s) => s.suggestNextGuidedPlanet);
  const startGuidedExploration = useUniverseStore((s) => s.startGuidedExploration);
  const stopGuidedExploration = useUniverseStore((s) => s.stopGuidedExploration);
  const disembarkCraft = useUniverseStore((s) => s.disembarkCraft);
  const flightMode = useUniverseStore((s) => s.flightMode);

  // Only display when awaiting exploration or suggesting next destination
  if (
    guidedExplorationState !== 'awaiting-exploration' &&
    guidedExplorationState !== 'suggesting-next-destination'
  ) {
    return null;
  }

  const currentPlanetMeta = PLANET_CATALOG[activePlanet] || PLANET_CATALOG[selectedTargetId || 'origin'];
  const nextPlanetId = suggestNextGuidedPlanet();
  const nextPlanetMeta = nextPlanetId ? PLANET_CATALOG[nextPlanetId] : null;

  const handleExplore = () => {
    if (flightMode === 'landed') {
      disembarkCraft();
    }
  };

  const handleContinueNext = () => {
    if (nextPlanetId) {
      startGuidedExploration(nextPlanetId);
    } else {
      setGuidedExplorationState('completed');
    }
  };

  const handleStayHere = () => {
    setGuidedExplorationState('paused');
  };

  return (
    <div className="absolute top-44 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto max-w-md w-[92vw] select-none animate-fadeIn">
      <div className="glass-panel p-4 rounded-3xl border border-indigo-500/60 bg-slate-950/95 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold font-mono uppercase tracking-wider">
            <Compass className="w-4 h-4 text-indigo-400 animate-spin-slow" />
            <span>Guided Exploration</span>
          </div>
          <button
            onClick={stopGuidedExploration}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Stop Guided Exploration"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-3">
          <div className="text-sm font-display font-bold text-white flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Destination Reached: {currentPlanetMeta?.name}</span>
          </div>
          <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
            {currentPlanetMeta?.narrative?.fictionalDescription || currentPlanetMeta?.description}
          </p>
          {currentPlanetMeta?.narrative?.suggestedActivity && (
            <div className="mt-1.5 text-[10px] text-emerald-400 font-mono">
              Suggested: {currentPlanetMeta.narrative.suggestedActivity}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          {flightMode === 'landed' ? (
            <button
              onClick={handleExplore}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 text-[11px]"
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>Explore on Foot [E]</span>
            </button>
          ) : (
            <button
              onClick={handleStayHere}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 text-[11px]"
            >
              <Pause className="w-3.5 h-3.5 text-cyan-400" />
              <span>Stay & Orbit</span>
            </button>
          )}

          <button
            onClick={handleContinueNext}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-900/40 text-[11px]"
          >
            <span>{nextPlanetMeta ? `Fly to ${nextPlanetMeta.name.split('—')[0]}` : 'Finish Tour'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
