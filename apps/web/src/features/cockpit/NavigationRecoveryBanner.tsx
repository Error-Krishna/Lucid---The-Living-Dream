import React, { useState, useEffect, useRef } from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { PLANET_CATALOG, PlanetId, getPlanetUniversePosition } from '@lucid/shared';
import { Compass, AlertTriangle, Sparkles, Navigation, X, Crosshair } from 'lucide-react';

interface NavigationRecoveryBannerProps {
  distanceToTarget: number;
  speed: number;
}

export function NavigationRecoveryBanner({ distanceToTarget, speed }: NavigationRecoveryBannerProps) {
  const selectedTargetId = useUniverseStore((s) => s.selectedTargetId);
  const setTargetPlanet = useUniverseStore((s) => s.setTargetPlanet);
  const engageAutopilot = useUniverseStore((s) => s.engageAutopilot);
  const autopilot = useUniverseStore((s) => s.autopilot);
  const flightMode = useUniverseStore((s) => s.flightMode);
  const setMapOpen = useUniverseStore((s) => s.setMapOpen);
  const setHelpOpen = useUniverseStore((s) => s.setHelpOpen);
  const findNearestPlanet = useUniverseStore((s) => s.findNearestPlanet);
  const isIntroOpen = useUniverseStore((s) => s.isIntroOpen);
  const isMapOpen = useUniverseStore((s) => s.isMapOpen);
  const isHelpOpen = useUniverseStore((s) => s.isHelpOpen);

  const isAutopilotHintDismissed = useUniverseStore((s) => s.isAutopilotHintDismissed);
  const dismissAutopilotHint = useUniverseStore((s) => s.dismissAutopilotHint);

  // Recovery state
  const [showLostRecovery, setShowLostRecovery] = useState(false);
  const [showMovingAwayPrompt, setShowMovingAwayPrompt] = useState(false);
  const [dismissedUntil, setDismissedUntil] = useState<number>(0);

  // Sample history to avoid flickering on transient maneuvers
  const distanceSamplesRef = useRef<number[]>([]);
  const lastSampleTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    // Only check during active spaceflight
    if (flightMode !== 'spaceflight' && flightMode !== 'cockpit') {
      setShowLostRecovery(false);
      setShowMovingAwayPrompt(false);
      return;
    }

    if (autopilot || isIntroOpen || isMapOpen || isHelpOpen) {
      setShowLostRecovery(false);
      setShowMovingAwayPrompt(false);
      return;
    }

    const now = Date.now();
    if (now < dismissedUntil) {
      return;
    }

    // Record sample every 1000ms
    if (now - lastSampleTimeRef.current >= 1000) {
      lastSampleTimeRef.current = now;

      if (selectedTargetId) {
        distanceSamplesRef.current.push(distanceToTarget);
        if (distanceSamplesRef.current.length > 5) {
          distanceSamplesRef.current.shift();
        }

        // Check if moving away consistently across 4 consecutive samples
        if (distanceSamplesRef.current.length >= 4) {
          const s = distanceSamplesRef.current;
          const isIncreasing = s[3] > s[2] && s[2] > s[1] && s[1] > s[0];
          const netIncrease = s[3] - s[0];
          if (isIncreasing && netIncrease > 12 && distanceToTarget > 120 && speed > 15) {
            setShowMovingAwayPrompt(true);
          } else if (netIncrease < -5) {
            setShowMovingAwayPrompt(false);
          }
        }
      } else {
        distanceSamplesRef.current = [];
        setShowMovingAwayPrompt(false);
      }

      // Check "Lost in space" condition:
      // Either very far from any planet (> 1800km) or cruising high speed with no target for > 35s
      const nearestId = findNearestPlanet();
      const nearestPos = getPlanetUniversePosition(nearestId);
      const craftPos = useUniverseStore.getState().spacecraftPosition;
      const distToNearest = Math.hypot(
        nearestPos[0] - craftPos[0],
        nearestPos[1] - craftPos[1],
        nearestPos[2] - craftPos[2]
      );

      if (distToNearest > 2200) {
        setShowLostRecovery(true);
      } else if (!selectedTargetId && distToNearest > 900 && speed > 25) {
        setShowLostRecovery(true);
      } else if (distToNearest < 600) {
        setShowLostRecovery(false);
      }
    }
  }, [
    distanceToTarget,
    speed,
    selectedTargetId,
    flightMode,
    autopilot,
    isIntroOpen,
    isMapOpen,
    isHelpOpen,
    dismissedUntil,
    findNearestPlanet,
  ]);

  const handleDismissRecovery = () => {
    setShowLostRecovery(false);
    setShowMovingAwayPrompt(false);
    setDismissedUntil(Date.now() + 60000); // 60s cooldown
  };

  const handleTargetNearestAndAutopilot = () => {
    const nearest = findNearestPlanet();
    setTargetPlanet(nearest);
    engageAutopilot(nearest);
    handleDismissRecovery();
  };

  // 1. First-Time Beginner Autopilot Hint
  if (!isAutopilotHintDismissed && !isIntroOpen && !isMapOpen && !isHelpOpen && flightMode === 'cockpit') {
    return (
      <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto max-w-md w-[92vw] select-none animate-fadeIn">
        <div className="glass-panel p-4 rounded-3xl border border-cyan-500/50 bg-slate-950/95 shadow-2xl backdrop-blur-md">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold font-mono uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>New to Spaceflight?</span>
            </div>
            <button
              onClick={dismissAutopilotHint}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-200 font-sans leading-relaxed mb-3">
            Let autopilot handle the journey while you explore. Choose a planet, engage autopilot, and enjoy the ride. You can take control at any time.
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                dismissAutopilotHint();
                setMapOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold font-mono tracking-wider transition-all shadow-md shadow-cyan-600/30"
            >
              Choose a Destination
            </button>
            <button
              onClick={() => {
                dismissAutopilotHint();
                setHelpOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              Show Flight Controls
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Moving Away From Destination Suggestion
  if (showMovingAwayPrompt && selectedTargetId) {
    const targetName = PLANET_CATALOG[selectedTargetId]?.name || 'destination';
    return (
      <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto max-w-sm w-[90vw] select-none animate-fadeIn">
        <div className="glass-panel p-3.5 rounded-2xl border border-amber-500/60 bg-slate-950/95 shadow-2xl backdrop-blur-md text-center">
          <div className="flex items-center justify-center gap-2 mb-1 text-amber-300 text-xs font-bold font-mono uppercase">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Moving Away from Destination</span>
          </div>

          <p className="text-[11px] text-slate-300 font-sans mb-2.5">
            Distance to {targetName} is increasing. Would you like autopilot to re-align your vector?
          </p>

          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                engageAutopilot(selectedTargetId);
                setShowMovingAwayPrompt(false);
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-mono font-bold transition-all shadow-md"
            >
              Let Autopilot Guide Me
            </button>
            <button
              onClick={handleDismissRecovery}
              className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-[11px] font-mono transition-colors border border-slate-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. "Lost in Space?" Navigation Recovery Panel
  if (showLostRecovery) {
    const nearestId = findNearestPlanet();
    const nearestName = PLANET_CATALOG[nearestId]?.name || 'Nearby Planet';

    return (
      <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto max-w-md w-[92vw] select-none animate-fadeIn">
        <div className="glass-panel p-4 rounded-3xl border border-amber-500/70 bg-slate-950/95 shadow-2xl backdrop-blur-md">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-mono uppercase tracking-wider">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Lost in Space?</span>
            </div>
            <button
              onClick={handleDismissRecovery}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-200 font-sans leading-relaxed mb-3">
            Choose a nearby destination or let autopilot guide you safely back into charted sectors.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <button
              onClick={handleTargetNearestAndAutopilot}
              className="px-3 py-2 rounded-xl bg-cyan-600/90 hover:bg-cyan-500 text-white font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-cyan-900/30 text-[11px]"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Fly to {nearestName}</span>
            </button>

            <button
              onClick={() => {
                handleDismissRecovery();
                setMapOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5 text-[11px]"
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>Choose Destination</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
