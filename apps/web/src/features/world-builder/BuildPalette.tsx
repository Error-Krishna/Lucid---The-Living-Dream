import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { useMultiplayer } from '../multiplayer/useMultiplayer.js';
import { ObjectType } from '@lucid/shared';
import {
  Sparkles,
  Gem,
  Sprout,
  Box,
  Layers,
  CircleDot,
  Trash2,
  RotateCcw,
  X,
} from 'lucide-react';

const OBJECT_TYPES: { type: ObjectType; label: string; icon: any }[] = [
  { type: 'dream_beacon', label: 'Dream Beacon', icon: CircleDot },
  { type: 'resonant_crystal', label: 'Resonant Crystal', icon: Gem },
  { type: 'bioluminescent_flora', label: 'Living Flora', icon: Sprout },
  { type: 'geometric_monument', label: 'Geometric Relic', icon: Sparkles },
  { type: 'levitating_platform', label: 'Levitating Step', icon: Layers },
  { type: 'star_monolith', label: 'Star Monolith', icon: Box },
];

const PALETTE_COLORS = [
  { hex: '#818cf8', name: 'Indigo' },
  { hex: '#c084fc', name: 'Lavender' },
  { hex: '#38bdf8', name: 'Cyan' },
  { hex: '#34d399', name: 'Emerald' },
  { hex: '#fb7185', name: 'Rose' },
  { hex: '#f59e0b', name: 'Amber' },
];

export function BuildPalette() {
  const isBuildMode = useUniverseStore((s) => s.isBuildMode);
  const toggleBuildMode = useUniverseStore((s) => s.toggleBuildMode);
  const selectedTool = useUniverseStore((s) => s.selectedTool);
  const setSelectedTool = useUniverseStore((s) => s.setSelectedTool);
  const paletteColor = useUniverseStore((s) => s.paletteColor);
  const setPaletteColor = useUniverseStore((s) => s.setPaletteColor);
  const selectedObject = useUniverseStore((s) => s.selectedObject);
  const removeSelectedObject = useUniverseStore((s) => s.removeSelectedObject);
  const resetCurrentPlanet = useUniverseStore((s) => s.resetCurrentPlanet);
  const connectionMode = useUniverseStore((s) => s.connectionMode);

  const { broadcastObjectDelete } = useMultiplayer();

  if (!isBuildMode) return null;

  const handleDelete = () => {
    if (selectedObject) {
      broadcastObjectDelete(selectedObject.objectId);
      removeSelectedObject();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4 pointer-events-auto">
      <div className="glass-panel rounded-2xl p-4 shadow-2xl border border-indigo-400/30">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-indigo-900/50 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-display text-sm tracking-wider uppercase text-white font-semibold">
              Dream Architect — World Builder
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/40 text-indigo-300">
              {connectionMode === 'connected' ? 'Server Persisted' : 'Local Storage'}
            </span>
          </div>

          <button
            onClick={toggleBuildMode}
            className="p-1.5 rounded-lg hover:bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Object Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
          {OBJECT_TYPES.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedTool === item.type;
            return (
              <button
                key={item.type}
                onClick={() => setSelectedTool(item.type)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-all border ${
                  isSelected
                    ? 'bg-indigo-600/40 border-indigo-400 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900/40 border-indigo-950/60 text-slate-300 hover:border-indigo-400/40 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                <span className="text-[10px] text-center font-medium leading-tight line-clamp-1">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Color Palette & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-indigo-900/40 text-xs">
          {/* Color swatches */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">Aura:</span>
            <div className="flex items-center gap-1.5">
              {PALETTE_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setPaletteColor(c.hex)}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    paletteColor === c.hex
                      ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#030514]'
                      : 'hover:scale-110 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {selectedObject ? (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/70 hover:bg-rose-900/90 border border-rose-500/40 text-rose-200 text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 italic hidden sm:inline">
                Click ground to place
              </span>
            )}

            <button
              onClick={resetCurrentPlanet}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/50 text-slate-300 text-xs transition-colors"
              title="Reset world objects to default seed"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Realm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
