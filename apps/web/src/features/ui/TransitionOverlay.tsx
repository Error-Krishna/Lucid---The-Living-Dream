import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { Sparkles } from 'lucide-react';

export function TransitionOverlay() {
  const isTransitioning = useUniverseStore((s) => s.isTransitioning);
  const transitionMessage = useUniverseStore((s) => s.transitionMessage);

  if (!isTransitioning) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-pulse">
      <div className="glass-panel px-6 py-2.5 rounded-2xl border border-indigo-400/50 bg-slate-950/80 shadow-2xl flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-indigo-300 animate-spin" />
        <span className="font-display text-sm text-white font-semibold tracking-wide">
          {transitionMessage || 'Aligning Reality Telemetry...'}
        </span>
      </div>
    </div>
  );
}
