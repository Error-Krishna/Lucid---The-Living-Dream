import React, { useState, useEffect } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetMetadata } from '@lucid/shared';
import { Sparkles, Lightbulb, Target, X } from 'lucide-react';

interface FloatingPlanetDiscoveryTextProps {
  meta: PlanetMetadata;
  position: [number, number, number];
  isTarget: boolean;
  distance: number;
}

export function FloatingPlanetDiscoveryText({
  meta,
  position,
  isTarget,
  distance,
}: FloatingPlanetDiscoveryTextProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissal when target changes
  useEffect(() => {
    setIsDismissed(false);
  }, [meta.id]);

  // Only display when within discovery / approach range (between 35 and 1800 units)
  // and when the planet is targeted or in close vicinity
  const isVisible =
    !isDismissed &&
    ((isTarget && distance < 1800 && distance > 30) || (distance < 500 && distance > 25));
  const narrative = meta.narrative;

  if (!isVisible || !narrative) return null;

  // Gentle distance-based opacity
  // Near 40-200: max opacity. 200-1800: gentle fade.
  const opacity = THREE.MathUtils.clamp(
    1.0 - (distance - 150) / 1500,
    0.3,
    1.0
  );

  return (
    <group position={position}>
      <Html
        center
        distanceFactor={Math.min(160, Math.max(45, distance * 0.15))}
        zIndexRange={[100, 0]}
        style={{
          opacity,
          transition: 'opacity 0.3s ease-out',
        }}
      >
        {/* Screen-space offset so card stays to the upper-right of the planetary body */}
        <div className="translate-x-14 -translate-y-12 pointer-events-auto w-80 p-4 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-cyan-500/40 text-slate-100 shadow-2xl select-none">
          {/* Header & Theme with Dismiss Button */}
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: meta.visualTheme.accentColor }}
            />
            <span className="font-display text-xs font-bold text-white uppercase tracking-wider">
              {meta.name}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 ml-auto uppercase mr-1">
              {Math.round(distance)} KM
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDismissed(true);
              }}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Dismiss Planet Advisory"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[10px] font-mono text-indigo-300 mb-2 italic">
            Theme: {narrative.theme}
          </div>

          {/* Fictional Description */}
          <p className="text-xs text-slate-200 leading-relaxed mb-2.5 border-l-2 border-cyan-400/60 pl-2">
            “{narrative.fictionalDescription}”
          </p>

          {/* Project Vision Note */}
          <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300 leading-relaxed mb-2">
            <div className="flex items-center gap-1 font-bold text-cyan-300 uppercase tracking-widest text-[9px] mb-0.5">
              <Lightbulb className="w-3 h-3 text-cyan-400" />
              <span>Project Vision</span>
            </div>
            {narrative.projectVision}
          </div>

          {/* Exploration Guidance */}
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-300 font-mono">
            <Target className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>{narrative.suggestedActivity}</span>
          </div>
        </div>
      </Html>
    </group>
  );
}
