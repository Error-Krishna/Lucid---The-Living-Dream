import React, { useEffect } from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { PLANET_CATALOG, PlanetId, getPlanetUniversePosition } from '@lucid/shared';
import { Compass, X, Crosshair, Radar, Radio, Shield } from 'lucide-react';

export function UniverseMapModal() {
  const isMapOpen = useUniverseStore((s) => s.isMapOpen);
  const setMapOpen = useUniverseStore((s) => s.setMapOpen);
  const toggleMap = useUniverseStore((s) => s.toggleMap);
  const activePlanet = useUniverseStore((s) => s.activePlanet);
  const selectedTargetId = useUniverseStore((s) => s.selectedTargetId);
  const setTargetPlanet = useUniverseStore((s) => s.setTargetPlanet);
  const spacecraftPosition = useUniverseStore((s) => s.spacecraftPosition);
  const discoveredPlanets = useUniverseStore((s) => s.discoveredPlanets);
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

  if (!isMapOpen) return null;

  const planets = Object.values(PLANET_CATALOG);
  const discoveredCount = Object.keys(discoveredPlanets).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="glass-panel w-full max-w-5xl rounded-3xl p-6 md:p-8 max-h-[92vh] overflow-y-auto border border-cyan-500/40 relative shadow-2xl bg-slate-950/95">
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

          {/* Scanner Pulse Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => pulseScanner()}
              disabled={isScanning}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-mono font-semibold transition-all ${
                isScanning
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 animate-pulse'
                  : 'bg-slate-900 hover:bg-cyan-950 border-cyan-500/50 text-cyan-200 hover:scale-105'
              }`}
            >
              <Radar className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanner Active...' : 'Pulse Sector Scanner [F]'}</span>
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="mb-6 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono flex items-center justify-between">
          <span>
            ℹ <strong className="text-cyan-300">Manual Navigation:</strong> Selecting a planet sets the cockpit HUD target vector. Steer manually toward the reticle in space to discover and land.
          </span>
        </div>

        {/* 10 Planets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {planets.map((p) => {
            const isDiscovered = !!discoveredPlanets[p.id];
            const isCurrent = viewMode === 'world' && p.id === activePlanet;
            const isTargeted = selectedTargetId === p.id;
            const planetPos = getPlanetUniversePosition(p.id);
            const dist = Math.round(
              Math.hypot(
                planetPos[0] - spacecraftPosition[0],
                planetPos[1] - spacecraftPosition[1],
                planetPos[2] - spacecraftPosition[2]
              )
            );

            return (
              <div
                key={p.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isTargeted
                    ? 'bg-slate-900/95 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-950/60'
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
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{
                          backgroundColor: isDiscovered ? p.visualTheme.accentColor : '#64748b',
                        }}
                      />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        {isDiscovered ? p.category : 'Unscanned Sector'}
                      </span>
                    </div>

                    {isTargeted && (
                      <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-600 flex items-center gap-1">
                        <Crosshair className="w-2.5 h-2.5" />
                        Target Locked
                      </span>
                    )}
                    {isCurrent && (
                      <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-300 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-600">
                        Current Surface
                      </span>
                    )}
                  </div>

                  <h3 className="font-display text-base text-white font-semibold mb-0.5">
                    {isDiscovered ? p.name : 'Unknown Anomaly'}
                  </h3>
                  <p className="text-[11px] text-cyan-200/80 mb-2 font-medium line-clamp-1">
                    {isDiscovered ? p.tagline : 'Signal detected on deep spectrum'}
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-2.5 line-clamp-2">
                    {isDiscovered
                      ? p.narrative?.fictionalDescription || p.description
                      : 'Deploy sector scanner [F] or approach within sensor radius to decipher planetary atmosphere and composition.'}
                  </p>

                  {/* Planet Narrative & Project Vision */}
                  {isDiscovered && p.narrative && (
                    <div className="mb-3 p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] space-y-1">
                      <div className="text-cyan-300 font-bold tracking-wider uppercase text-[9px]">
                        LUCID Vision:
                      </div>
                      <p className="text-slate-300 leading-tight">
                        {p.narrative.projectVision}
                      </p>
                      <div className="text-emerald-400 font-mono text-[9px] pt-1 border-t border-slate-800">
                        Activity: {p.narrative.suggestedActivity}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-cyan-400 font-mono font-semibold">
                      {dist} KM
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      Coord: [{Math.round(planetPos[0])}, {Math.round(planetPos[2])}]
                    </span>
                  </div>

                  {/* Lock Target Reference Button */}
                  <button
                    onClick={() => {
                      setTargetPlanet(p.id);
                      setMapOpen(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 ${
                      isTargeted
                        ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/70 shadow-sm'
                        : 'bg-slate-800 hover:bg-cyan-900/60 text-slate-200 hover:text-white border border-slate-700/60 hover:border-cyan-500/50'
                    }`}
                    title={`Lock ${p.name} as celestial flight navigation reference`}
                  >
                    <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{isTargeted ? 'Locked' : 'Lock Nav Target'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
