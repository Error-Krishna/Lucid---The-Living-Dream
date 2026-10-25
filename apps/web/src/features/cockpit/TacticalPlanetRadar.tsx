import React, { useState, useMemo } from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { PLANET_CATALOG, PlanetId, getPlanetUniversePosition } from '@lucid/shared';
import { Radar, Crosshair, ChevronRight } from 'lucide-react';

interface TacticalPlanetRadarProps {
  className?: string;
  size?: number; // Base display size in pixels
}

export function TacticalPlanetRadar({ className = '', size = 184 }: TacticalPlanetRadarProps) {
  const spacecraftPosition = useUniverseStore((s) => s.spacecraftPosition);
  const spacecraftOrientation = useUniverseStore((s) => s.spacecraftOrientation);
  const selectedTargetId = useUniverseStore((s) => s.selectedTargetId);
  const setTargetPlanet = useUniverseStore((s) => s.setTargetPlanet);
  const discoveredPlanets = useUniverseStore((s) => s.discoveredPlanets);
  const isScanning = useUniverseStore((s) => s.isScanning);

  // Radar range toggle: 600km, 1800km, 3000km
  const [rangeScale, setRangeScale] = useState<600 | 1800 | 3000>(1800);

  const radarRadius = size * 0.38; // Usable radius inside circle
  const center = size / 2;
  const yaw = spacecraftOrientation.yaw || 0;

  // Project all 10 planets into radar coordinates
  const radarObjects = useMemo(() => {
    const planetIds = Object.keys(PLANET_CATALOG) as PlanetId[];

    return planetIds.map((pid) => {
      const p = PLANET_CATALOG[pid];
      const pPos = getPlanetUniversePosition(pid);
      const isDiscovered = !!discoveredPlanets[pid];
      const isTarget = selectedTargetId === pid;

      const dx = pPos[0] - spacecraftPosition[0];
      const dy = pPos[1] - spacecraftPosition[1];
      const dz = pPos[2] - spacecraftPosition[2];
      const totalDist = Math.hypot(dx, dy, dz);

      // Rotate by ship's yaw so top is craft forward (-Z in world space)
      // forward axis = -Z, right axis = +X
      const forwardDist = -dx * Math.sin(yaw) - dz * Math.cos(yaw);
      const rightDist = dx * Math.cos(yaw) - dz * Math.sin(yaw);

      const horizDist = Math.hypot(forwardDist, rightDist);
      const isClamped = horizDist > rangeScale;

      const scale = isClamped ? radarRadius / Math.max(1, horizDist) : (horizDist / rangeScale) * (radarRadius / horizDist || 0);
      const rx = center + rightDist * (isClamped ? scale : (radarRadius / rangeScale));
      const ry = center - forwardDist * (isClamped ? scale : (radarRadius / rangeScale));

      // Bearing angle in degrees relative to craft nose (0 = straight ahead)
      const relAngleDeg = ((Math.atan2(rightDist, forwardDist) * 180) / Math.PI + 360) % 360;

      return {
        id: pid,
        name: p.name,
        color: p.visualTheme.accentColor,
        isDiscovered,
        isTarget,
        totalDist: Math.round(totalDist),
        rx,
        ry,
        isClamped,
        relAngleDeg,
      };
    });
  }, [spacecraftPosition, yaw, rangeScale, selectedTargetId, discoveredPlanets, center, radarRadius]);

  const targetObj = radarObjects.find((o) => o.isTarget);

  const cycleRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (rangeScale === 600) setRangeScale(1800);
    else if (rangeScale === 1800) setRangeScale(3000);
    else setRangeScale(600);
  };

  return (
    <div
      className={`glass-panel p-2.5 rounded-2xl border border-cyan-500/40 bg-slate-950/90 shadow-2xl flex flex-col justify-between select-none font-mono ${className}`}
      style={{ width: size + 20, minWidth: size + 20 }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between text-[9px] font-bold text-slate-300 pb-1 mb-1 border-b border-slate-800">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <Radar className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-300' : ''}`} />
          <span className="tracking-wider">TACTICAL RADAR</span>
        </div>
        <button
          onClick={cycleRange}
          className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-[8px] font-mono transition-colors"
          title="Cycle radar range scale"
        >
          {rangeScale}K
        </button>
      </div>

      {/* Circular Radar Scope */}
      <div className="relative flex items-center justify-center overflow-hidden mx-auto" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            {/* Radar Sweep Radial Gradient */}
            <linearGradient id="radarSweepGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Background circle */}
          <circle cx={center} cy={center} r={radarRadius + 2} fill="#020617" stroke="#1e293b" strokeWidth="1.5" />

          {/* Concentric Range Rings */}
          <circle cx={center} cy={center} r={radarRadius * 0.33} fill="none" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
          <circle cx={center} cy={center} r={radarRadius * 0.66} fill="none" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
          <circle cx={center} cy={center} r={radarRadius} fill="none" stroke="#0284c7" strokeWidth="1.2" opacity="0.75" />

          {/* Crosshairs */}
          <line x1={center - radarRadius} y1={center} x2={center + radarRadius} y2={center} stroke="#0ea5e9" strokeWidth="0.6" opacity="0.3" />
          <line x1={center} y1={center - radarRadius} x2={center} y2={center + radarRadius} stroke="#0ea5e9" strokeWidth="0.6" opacity="0.3" />

          {/* Rotating Radar Sweep Wedge */}
          <g transform={`rotate(${((Date.now() / 25) % 360)}, ${center}, ${center})`}>
            <path
              d={`M ${center} ${center} L ${center} ${center - radarRadius} A ${radarRadius} ${radarRadius} 0 0 1 ${
                center + radarRadius * Math.sin(Math.PI / 4)
              } ${center - radarRadius * Math.cos(Math.PI / 4)} Z`}
              fill="url(#radarSweepGrad)"
              opacity={isScanning ? 0.75 : 0.35}
            />
          </g>

          {/* Center Spacecraft Marker (Forward Pointer) */}
          <polygon
            points={`${center},${center - 6} ${center - 4.5},${center + 5} ${center},${center + 2.5} ${center + 4.5},${center + 5}`}
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth="0.6"
          />

          {/* Dynamic Planet Blips */}
          {radarObjects.map((obj) => (
            <g
              key={obj.id}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => setTargetPlanet(obj.id)}
            >
              {/* Target Highlight Pulsing Ring */}
              {obj.isTarget && (
                <>
                  <circle cx={obj.rx} cy={obj.ry} r="7.5" fill="none" stroke={obj.color} strokeWidth="1.2" className="animate-ping" opacity="0.7" />
                  <rect
                    x={obj.rx - 5.5}
                    y={obj.ry - 5.5}
                    width="11"
                    height="11"
                    fill="none"
                    stroke={obj.color}
                    strokeWidth="1.2"
                    transform={`rotate(45, ${obj.rx}, ${obj.ry})`}
                  />
                </>
              )}

              {/* Planet Dot */}
              <circle
                cx={obj.rx}
                cy={obj.ry}
                r={obj.isTarget ? 3.5 : obj.isDiscovered ? 2.5 : 2}
                fill={obj.isDiscovered ? obj.color : '#64748b'}
                stroke="#ffffff"
                strokeWidth={obj.isTarget ? '1' : '0.5'}
                opacity={obj.isClamped ? 0.65 : 1}
              />

              {/* Clamped Perimeter Indicator Pip */}
              {obj.isClamped && (
                <circle cx={obj.rx} cy={obj.ry} r="1.5" fill="#f59e0b" />
              )}
            </g>
          ))}
        </svg>

        {/* Cardinal Heading Reference Markers on Scope Edge */}
        <span className="absolute top-1 text-[7px] text-cyan-400 font-extrabold tracking-widest pointer-events-none">▲ FWD</span>
      </div>

      {/* Footer Info Box */}
      <div className="mt-1 pt-1 border-t border-slate-800 text-[9px] flex items-center justify-between">
        {targetObj ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: targetObj.color }} />
              <span className="font-bold text-white truncate max-w-[100px]">{targetObj.name.split('—')[0]}</span>
            </div>
            <span className="text-cyan-300 font-bold ml-1">{targetObj.totalDist}KM</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[8px] truncate">CLICK BLIP OR [TAB] TO TARGET</span>
        )}
      </div>
    </div>
  );
}
