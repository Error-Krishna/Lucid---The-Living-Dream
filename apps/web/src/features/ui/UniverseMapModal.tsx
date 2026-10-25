import React, { useEffect, useMemo } from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { PLANET_CATALOG, PlanetId, getPlanetUniversePosition } from '@lucid/shared';
import {
  Compass,
  X,
  Crosshair,
  Radar,
  Radio,
  Shield,
  Navigation,
  Sparkles,
  MapPin,
  CheckCircle,
} from 'lucide-react';

export function UniverseMapModal() {
  const isMapOpen = useUniverseStore((s) => s.isMapOpen);
  const setMapOpen = useUniverseStore((s) => s.setMapOpen);
  const toggleMap = useUniverseStore((s) => s.toggleMap);
  const activePlanet = useUniverseStore((s) => s.activePlanet);
  const selectedTargetId = useUniverseStore((s) => s.selectedTargetId);
  const setTargetPlanet = useUniverseStore((s) => s.setTargetPlanet);
  const engageAutopilot = useUniverseStore((s) => s.engageAutopilot);
  const startGuidedExploration = useUniverseStore((s) => s.startGuidedExploration);
  const guidedExplorationState = useUniverseStore((s) => s.guidedExplorationState);
  const suggestNextGuidedPlanet = useUniverseStore((s) => s.suggestNextGuidedPlanet);
  const spacecraftPosition = useUniverseStore((s) => s.spacecraftPosition);
  const discoveredPlanets = useUniverseStore((s) => s.discoveredPlanets);
  const visitedPlanets = useUniverseStore((s) => s.visitedPlanets);
  const pulseScanner = useUniverseStore((s) => s.pulseScanner);
  const isScanning = useUniverseStore((s) => s.isScanning);
  const viewMode = useUniverseStore((s) => s.viewMode);

  // Global Key Listener for 'M' (Starmap) and 'Escape' (Close)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.code === 'KeyM') {
        toggleMap();
      } else if (e.code === 'Escape' && isMapOpen) {
        setMapOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMapOpen, toggleMap, setMapOpen]);

  const planets = Object.values(PLANET_CATALOG);
  const discoveredCount = Object.keys(discoveredPlanets).length;
  const nextSuggestedId = useMemo(() => suggestNextGuidedPlanet(), [suggestNextGuidedPlanet]);

  if (!isMapOpen) return null;

  const handleAutopilotTo = (pid: PlanetId) => {
    setTargetPlanet(pid);
    engageAutopilot(pid);
    setMapOpen(false);
  };

  const handleStartGuided = () => {
    startGuidedExploration(nextSuggestedId || 'origin');
    setMapOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-5xl rounded-3xl p-6 md:p-8 max-h-[92vh] overflow-y-auto border border-cyan-500/40 relative shadow-2xl bg-slate-950/95 font-sans">
        {/* Close Button */}
        <button
          onClick={() => setMapOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Close Navigation Atlas [ESC]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-5 h-5 text-cyan-400 animate-spin-slow" />
              <span className="font-mono text-xs uppercase tracking-widest text-cyan-300">
                Deep Space Navigation Computer // Starmap Atlas
              </span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-white font-bold tracking-wide">
              Charted Planetary Atlas
            </h2>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Craft Pos: [{Math.round(spacecraftPosition[0])}, {Math.round(spacecraftPosition[1])}, {Math.round(spacecraftPosition[2])}] • Discovered: {discoveredCount}/10 Worlds
            </p>
          </div>

          {/* Action Buttons: Scanner & Guided Exploration */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleStartGuided}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-mono font-bold tracking-wider transition-all shadow-md shadow-indigo-900/40"
              title="Let the spacecraft guide you from destination to destination"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>
                {guidedExplorationState !== 'idle' ? 'Resume Guided Tour' : 'Start Guided Exploration'}
              </span>
            </button>

            <button
              onClick={() => pulseScanner()}
              disabled={isScanning}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono font-semibold transition-all ${
                isScanning
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                  : 'bg-slate-900 hover:bg-cyan-950 border-cyan-500/50 text-cyan-200 hover:scale-105'
              }`}
            >
              <Radar className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning Sector...' : 'Scanner Pulse [F]'}</span>
            </button>
          </div>
        </div>

        {/* Guided Exploration info banner */}
        <div className="mb-5 px-4 py-2.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 text-xs text-indigo-200 font-sans flex flex-wrap items-center justify-between gap-2">
          <span>
            ✨ <strong className="text-white font-mono">Assisted & Guided Flight:</strong> Choose <strong>Engage Autopilot</strong> on any destination to fly hands-free. Autopilot manages cruise speed, aligns vector, and prepares final approach. You can take manual control at any time.
          </span>
        </div>

        {/* 10 Planets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {planets.map((p) => {
            const isDiscovered = !!discoveredPlanets[p.id];
            const isVisited = !!visitedPlanets[p.id];
            const isCurrent = viewMode === 'world' && p.id === activePlanet;
            const isTargeted = selectedTargetId === p.id;
            const isSuggested = nextSuggestedId === p.id && !isVisited && !isCurrent;
            const planetPos = getPlanetUniversePosition(p.id);
            const dist = Math.round(
              Math.hypot(
                planetPos[0] - spacecraftPosition[0],
                planetPos[1] - spacecraftPosition[1],
                planetPos[2] - spacecraftPosition[2]
              )
            );

            // In LUCID, all charted planets in the catalog support orbital flight & landing pads
            const supportsLanding = true;

            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                  isTargeted
                    ? 'bg-slate-900/95 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-950/60'
                    : isSuggested
                    ? 'bg-slate-900/90 border-indigo-500/70 shadow-md shadow-indigo-950/50'
                    : isCurrent
                    ? 'bg-slate-900/70 border-emerald-500/60'
                    : isDiscovered
                    ? 'bg-slate-950/70 border-slate-800 hover:border-slate-600'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-sm shrink-0"
                        style={{
                          backgroundColor: isDiscovered ? p.visualTheme.accentColor : '#64748b',
                        }}
                      />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 truncate">
                        {isDiscovered ? p.category : 'Unscanned Sector'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {isTargeted && (
                        <span className="text-[8px] font-mono uppercase tracking-wider text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-600 flex items-center gap-1">
                          <Crosshair className="w-2.5 h-2.5" />
                          Locked
                        </span>
                      )}
                      {isSuggested && (
                        <span className="text-[8px] font-mono uppercase tracking-wider text-amber-300 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-600">
                          Suggested
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-[8px] font-mono uppercase tracking-wider text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-600">
                          Current
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-display text-base text-white font-semibold mb-0.5 flex items-center justify-between">
                    <span>{isDiscovered ? p.name : 'Unknown Anomaly'}</span>
                    {isVisited && (
                      <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-0.5" title="Explored">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        Visited
                      </span>
                    )}
                  </h3>

                  <p className="text-[11px] text-cyan-200/80 mb-2 font-medium line-clamp-1">
                    {isDiscovered ? p.tagline : 'Signal detected on deep spectrum'}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5 line-clamp-2">
                    {isDiscovered
                      ? p.narrative?.fictionalDescription || p.description
                      : 'Deploy sector scanner [F] or approach within sensor radius to decipher atmosphere.'}
                  </p>

                  {/* Capabilities Badges */}
                  <div className="flex items-center gap-1.5 mb-2.5 text-[9px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      Reachable
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-400">
                      Pad Landing
                    </span>
                  </div>

                  {/* Planet Narrative & Project Vision */}
                  {isDiscovered && p.narrative && (
                    <div className="mb-3 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] space-y-1">
                      <div className="text-cyan-300 font-bold tracking-wider uppercase text-[8px]">
                        LUCID Vision:
                      </div>
                      <p className="text-slate-300 leading-tight text-[10px]">
                        {p.narrative.projectVision}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 mt-auto">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-cyan-400 font-mono font-semibold">
                      {dist} KM
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      Coord: [{Math.round(planetPos[0])}, {Math.round(planetPos[2])}]
                    </span>
                  </div>

                  {/* Dual Action Buttons: Lock Target & Autopilot */}
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                    <button
                      onClick={() => {
                        setTargetPlanet(p.id);
                        setMapOpen(false);
                      }}
                      className={`py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
                        isTargeted
                          ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/70 shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                      }`}
                      title={`Lock ${p.name} as celestial flight navigation reference`}
                    >
                      <Crosshair className="w-3 h-3 text-cyan-400" />
                      <span>{isTargeted ? 'Locked' : 'Target'}</span>
                    </button>

                    <button
                      onClick={() => handleAutopilotTo(p.id)}
                      className="py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold transition-all flex items-center justify-center gap-1 shadow-sm shadow-indigo-900/40"
                      title={`Engage autopilot to fly directly toward ${p.name}`}
                    >
                      <Navigation className="w-3 h-3 text-cyan-200" />
                      <span>Autopilot</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
