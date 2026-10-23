import React, { useState, useRef } from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { Sparkles, ArrowUp, Compass } from 'lucide-react';

interface MobileControlsProps {
  onVirtualMove: (dx: number, dz: number) => void;
  onVirtualJump: () => void;
}

export function MobileControls({ onVirtualMove, onVirtualJump }: MobileControlsProps) {
  const isBuildMode = useUniverseStore((s) => s.isBuildMode);
  const toggleBuildMode = useUniverseStore((s) => s.toggleBuildMode);
  const contextPrompt = useUniverseStore((s) => s.contextPrompt);
  const nearbyPortal = useUniverseStore((s) => s.nearbyPortal);
  const travelToPlanet = useUniverseStore((s) => s.travelToPlanet);
  const triggerLandmarkInteraction = useUniverseStore((s) => s.triggerLandmarkInteraction);

  const [touchActive, setTouchActive] = useState(false);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    setTouchActive(true);
    setKnobPos({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchActive) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;

    const maxDist = 45;
    const dist = Math.hypot(dx, dy);
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);

    const kx = Math.cos(angle) * clampedDist;
    const ky = Math.sin(angle) * clampedDist;

    setKnobPos({ x: kx, y: ky });
    onVirtualMove(kx / maxDist, ky / maxDist);
  };

  const handleTouchEnd = () => {
    setTouchActive(false);
    setKnobPos({ x: 0, y: 0 });
    onVirtualMove(0, 0);
  };

  const handleInteract = () => {
    if (nearbyPortal) {
      travelToPlanet(nearbyPortal);
    } else if (contextPrompt) {
      triggerLandmarkInteraction();
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-30 md:hidden flex flex-col justify-between p-4">
      <div />

      {/* Bottom Touch Controls Row */}
      <div className="flex items-end justify-between w-full">
        {/* Virtual Joystick */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-28 h-28 rounded-full bg-slate-900/60 backdrop-blur-md border border-indigo-500/30 flex items-center justify-center pointer-events-auto touch-none relative"
        >
          <div
            className="w-12 h-12 rounded-full bg-indigo-500/50 border border-indigo-400 absolute transition-transform"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          {contextPrompt && (
            <button
              onClick={handleInteract}
              className="px-4 py-3 rounded-full bg-indigo-600 border border-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/40 animate-bounce"
            >
              Interact
            </button>
          )}

          <div className="flex items-center gap-3">
            {/* Build Button */}
            <button
              onClick={toggleBuildMode}
              className={`w-13 h-13 p-3.5 rounded-full border flex items-center justify-center transition-all ${
                isBuildMode
                  ? 'bg-indigo-600 border-indigo-300 text-white'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300'
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </button>

            {/* Jump Button */}
            <button
              onClick={onVirtualJump}
              className="w-14 h-14 p-4 rounded-full bg-indigo-600/90 border border-indigo-400/50 text-white flex items-center justify-center shadow-lg active:scale-90"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
