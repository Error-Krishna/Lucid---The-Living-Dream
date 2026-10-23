import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { PLANET_CATALOG } from '@lucid/shared';
import { Rocket, ShieldCheck, Sparkles } from 'lucide-react';

export function FlightSequenceOverlay() {
  const landingFeedback = useUniverseStore((s) => s.landingFeedback);
  const takeoffState = useUniverseStore((s) => s.takeoffState);
  const flightMode = useUniverseStore((s) => s.flightMode);
  const activePlanet = useUniverseStore((s) => s.activePlanet);

  const planet = PLANET_CATALOG[activePlanet];

  // We do NOT block the screen with full-screen text cards during flight.
  // Instead, show concise, non-blocking telemetry notifications at the top of the windshield.
  if (landingFeedback) {
    const isError = landingFeedback.includes('⚠') || landingFeedback.includes('ABORTED');
    return (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none max-w-lg w-full px-4">
        <div
          className={`glass-panel px-5 py-2.5 rounded-2xl border text-center shadow-xl backdrop-blur-md flex items-center justify-center gap-3 ${
            isError
              ? 'bg-rose-950/80 border-rose-500/60 text-rose-200'
              : 'bg-emerald-950/80 border-emerald-500/60 text-emerald-200'
          }`}
        >
          {isError ? (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-ping" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          )}
          <span className="font-mono text-xs font-semibold tracking-wide">
            {landingFeedback}
          </span>
        </div>
      </div>
    );
  }

  if (takeoffState === 'liftoff') {
    return (
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none max-w-md w-full px-4">
        <div className="glass-panel px-5 py-2.5 rounded-2xl border border-cyan-500/60 bg-cyan-950/80 text-cyan-200 text-center shadow-xl backdrop-blur-md flex items-center justify-center gap-2 animate-pulse">
          <Rocket className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span className="font-mono text-xs font-semibold tracking-wider uppercase">
            VERTICAL LIFTOFF // RETRACT GEAR [G] & PITCH UP
          </span>
        </div>
      </div>
    );
  }

  return null;
}
