import React, { useState } from 'react';
import { PlanetMetadata, PlanetId, PLANET_CATALOG } from '@lucid/shared';
import { FlightTelemetry } from './FlightGuidanceHUD.js';
import {
  Compass,
  Crosshair,
  Shield,
  Rocket,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ContextualGuidanceBannerProps {
  telemetry: FlightTelemetry;
  targetMeta: PlanetMetadata | null;
  flightMode: string;
  radarAltitude: number;
  activePlanet: PlanetId;
  gearDeployed: boolean;
}

export function ContextualGuidanceBanner({
  telemetry,
  targetMeta,
  flightMode,
  radarAltitude,
  activePlanet,
  gearDeployed,
}: ContextualGuidanceBannerProps) {
  const [collapsed, setCollapsed] = useState(false);

  let guidanceText = '';
  let badge = 'PILOT ADVISORY';
  let badgeColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';

  if (flightMode === 'landed') {
    badge = 'TOUCHDOWN SECURED';
    badgeColor = 'text-emerald-400 border-emerald-500/50 bg-emerald-950/60';
    guidanceText = `Touchdown confirmed on ${
      PLANET_CATALOG[activePlanet]?.name || 'the world surface'
    }. Press [E] to disembark & explore on foot, or [W / Space] to take off.`;
  } else if (radarAltitude < 45) {
    badge = 'DESCENT // TOUCHDOWN IMMINENT';
    badgeColor = 'text-amber-400 border-amber-500/50 bg-amber-950/60';
    if (!gearDeployed) {
      guidanceText = 'CRITICAL: Deploy landing gear [G] before surface contact.';
    } else if (Math.abs(telemetry.verticalSpeed) > 14) {
      guidanceText = `High descent rate (${Math.round(
        Math.abs(telemetry.verticalSpeed)
      )} m/s > 14 m/s). Throttle up [W] or pull pitch up to brake.`;
    } else {
      guidanceText = 'Descent profile is safe. Keep nose level [X] and guide craft onto the pad.';
    }
  } else if (flightMode === 'atmospheric_entry') {
    badge = 'ATMOSPHERIC ENTRY';
    badgeColor = 'text-orange-400 border-orange-500/50 bg-orange-950/60';
    guidanceText = `Entering atmosphere of ${
      targetMeta?.name || 'planet'
    }. Aerodynamic drag will reduce speed; toggle Level Assist [X] for stability.`;
  } else if (targetMeta) {
    if (telemetry.isAligned) {
      badge = 'VECTOR LOCKED';
      badgeColor = 'text-emerald-400 border-emerald-500/50 bg-emerald-950/60';
      guidanceText = `Course locked on ${targetMeta.name}. Closing speed: ${Math.round(
        telemetry.closingSpeed
      )} km/s. Press [Shift] for boost.`;
    } else {
      badge = 'NAVIGATION GUIDANCE';
      badgeColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40';
      guidanceText = `Target set: ${targetMeta.name}. Align nose crosshair [+] with target marker to lock vector (or press [R] to auto-align).`;
    }
  } else {
    badge = 'DEEP SPACE EXPLORATION';
    badgeColor = 'text-indigo-400 border-indigo-500/40 bg-indigo-950/40';
    guidanceText = 'Press [Tab] to cycle discovered worlds, or [M] to open the 10-planet Starmap Atlas.';
  }

  return (
    <div className="absolute top-36 left-1/2 transform -translate-x-1/2 z-30 pointer-events-auto max-w-lg w-[90vw] md:w-auto select-none">
      <div className="glass-panel px-3.5 py-1.5 rounded-2xl border border-slate-700/60 bg-slate-950/85 shadow-lg backdrop-blur-md flex items-center gap-2.5">
        <span
          className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-lg border ${badgeColor} shrink-0`}
        >
          {badge}
        </span>

        {!collapsed && (
          <span className="text-[11px] font-sans text-slate-200 line-clamp-1">
            {guidanceText}
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-auto"
          title={collapsed ? 'Expand Advisory' : 'Minimize Advisory'}
        >
          {collapsed ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
