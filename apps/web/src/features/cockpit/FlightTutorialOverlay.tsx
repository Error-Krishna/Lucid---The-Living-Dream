import React, { useEffect, useState, useRef } from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import {
  Rocket,
  Compass,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  MousePointer,
  HelpCircle,
  Shield,
  ArrowRight,
  Eye,
  Sliders,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export function FlightTutorialOverlay() {
  const isTutorialVisible = useUniverseStore((s) => s.isTutorialVisible);
  const setIsTutorialVisible = useUniverseStore((s) => s.setIsTutorialVisible);
  const flightTutorialStep = useUniverseStore((s) => s.flightTutorialStep);
  const setFlightTutorialStep = useUniverseStore((s) => s.setFlightTutorialStep);
  const setHelpOpen = useUniverseStore((s) => s.setHelpOpen);

  const spacecraftVelocity = useUniverseStore((s) => s.spacecraftVelocity);
  const spacecraftOrientation = useUniverseStore((s) => s.spacecraftOrientation);
  const selectedTargetId = useUniverseStore((s) => s.selectedTargetId);
  const gearDeployed = useUniverseStore((s) => s.gearDeployed);

  // Auto-progression event observers
  const initialYaw = useRef<number | null>(null);
  const maxSpeedSeen = useRef(0);
  const [autoCompleteDone, setAutoCompleteDone] = useState(false);

  const currentSpeed = Math.hypot(
    spacecraftVelocity[0],
    spacecraftVelocity[1],
    spacecraftVelocity[2]
  );

  // Monitor conditions per step to provide helpful auto-checkmarks
  useEffect(() => {
    setAutoCompleteDone(false);

    if (flightTutorialStep === 1) {
      // Step 2: Look around (yaw change)
      if (initialYaw.current === null) {
        initialYaw.current = spacecraftOrientation.yaw;
      }
    } else if (flightTutorialStep === 2) {
      // Step 3: Accelerate
      maxSpeedSeen.current = Math.max(maxSpeedSeen.current, currentSpeed);
    }
  }, [flightTutorialStep]);

  useEffect(() => {
    if (flightTutorialStep === 1 && initialYaw.current !== null) {
      if (Math.abs(spacecraftOrientation.yaw - initialYaw.current) > 0.25) {
        setAutoCompleteDone(true);
      }
    } else if (flightTutorialStep === 2) {
      if (currentSpeed > 6.0) {
        setAutoCompleteDone(true);
      }
    } else if (flightTutorialStep === 3) {
      if (currentSpeed < 8.0 && maxSpeedSeen.current > 5.0) {
        setAutoCompleteDone(true);
      }
    } else if (flightTutorialStep === 4) {
      if (Math.abs(spacecraftOrientation.roll) > 0.1 || Math.abs(spacecraftOrientation.yaw) > 0.2) {
        setAutoCompleteDone(true);
      }
    } else if (flightTutorialStep === 6) {
      if (selectedTargetId !== null) {
        setAutoCompleteDone(true);
      }
    } else if (flightTutorialStep === 8) {
      if (gearDeployed) {
        setAutoCompleteDone(true);
      }
    }
  }, [currentSpeed, spacecraftOrientation, selectedTargetId, gearDeployed, flightTutorialStep]);

  if (!isTutorialVisible) return null;

  const steps = [
    // Step 1
    {
      title: 'Step 1: Welcome aboard',
      heading: 'Welcome aboard, explorer.',
      body: 'You are in control of your spacecraft. This training will introduce the essential controls for moving, steering, navigating, and landing in a living universe.',
      badge: 'FLIGHT COMPUTER ONLINE',
      actionLabel: 'BEGIN TRAINING',
      hint: 'Mouse controls cockpit look angle. Keyboard handles thrust and orientation.',
    },
    // Step 2
    {
      title: 'Step 2: Look around',
      heading: 'Look Around & Mouse Steering',
      body: 'Click and drag your mouse to pan your view across the cosmic canopy. The crosshair points directly along your ship’s forward nose vector.',
      badge: 'MOUSE LOOK / SENSORS',
      actionLabel: autoCompleteDone ? 'LOOK COMPLETED — NEXT' : 'I’ve Got It — Next',
      hint: 'Move mouse left/right to inspect surroundings.',
    },
    // Step 3
    {
      title: 'Step 3: Accelerate',
      heading: 'Forward Thrust & Acceleration',
      body: 'Apply thrust by pressing [W] or [Up Arrow]. Your speed builds gradually over time rather than jumping instantaneously. Notice the starlight streaks stretch as your velocity builds.',
      badge: 'PRIMARY THRUSTER [W]',
      actionLabel: autoCompleteDone ? 'ACCELERATION ACHIEVED — NEXT' : 'Thrust Applied — Next',
      hint: 'Hold [W] to increase throttle. Notice the speed indicator on your HUD.',
    },
    // Step 4
    {
      title: 'Step 4: Release thrust & decelerate',
      heading: 'Momentum & Deceleration',
      body: 'In space, momentum carries your spacecraft forward even when thrust is released. To actively decelerate, press [S] to engage reverse thrusters and bring your velocity down.',
      badge: 'REVERSE BRAKING [S]',
      actionLabel: 'Deceleration Understood — Next',
      hint: 'Releasing [W] preserves velocity. Press [S] to reduce speed.',
    },
    // Step 5
    {
      title: 'Step 5: Steer',
      heading: 'Yaw & Roll Attitude Controls',
      body: 'Steer left or right using [A] / [D]. To bank on the roll axis, use [Q] or [E]. Remember: rotating the ship changes where you face, while your velocity vector follows your new thrust angle.',
      badge: 'ATTITUDE STEERING [A / D / Q / E]',
      actionLabel: 'Steering Understood — Next',
      hint: '[A/D] turns yaw continuously. [R] turns 180° towards target.',
    },
    // Step 6
    {
      title: 'Step 6: Understand the cockpit',
      heading: 'Essential Flight Instruments',
      body: 'Key instruments at a glance: Speed (top-left & center), Heading ribbon (top compass), Target distance & closing speed (right card), and Radar altitude (active near planet surfaces).',
      badge: 'INSTRUMENT HIERARCHY',
      actionLabel: 'Telemetry Verified — Next',
      hint: 'Primary telemetry is always visible; secondary assist systems are toggled via [Z], [C], [X].',
    },
    // Step 7
    {
      title: 'Step 7: Discover a destination',
      heading: 'Starmap & Navigation Targets',
      body: 'Press [Tab] or [M] to open the 10-planet Starmap and choose a world. Selecting a destination marks it for navigation — it does not teleport you or automatically fly there.',
      badge: 'STARMAP ATLAS [M] / CYCLE [TAB]',
      actionLabel: selectedTargetId ? 'TARGET LOCKED — NEXT' : 'Target Selected — Next',
      hint: 'Press [Tab] to cycle discovered worlds. Turn nose crosshair [+] toward target reticle.',
    },
    // Step 8
    {
      title: 'Step 8: Approach a planet',
      heading: 'Orbital Approach & Speed Management',
      body: 'As you close distance with your destination, manage your approach speed. Keep velocity below 70 km/s before entering the atmosphere to avoid severe thermal buffeting.',
      badge: 'APPROACH CORRIDOR [C]',
      actionLabel: 'Approach Understood — Next',
      hint: 'Toggle Approach Assist [C] to dampen lateral drift and regulate closing speed.',
    },
    // Step 9
    {
      title: 'Step 9: Landing and exploration',
      heading: 'Landing Gear & Touchdown',
      body: 'Deploy landing gear with [G]. Maintain descent speed below 14 m/s. Once landed on the pad, press [E] to disembark and explore the living planet on foot. Press [W] to take off again.',
      badge: 'GEAR [G] & DISEMBARK [E]',
      actionLabel: gearDeployed ? 'GEAR DEPLOYED — NEXT' : 'Landing Validated — Next',
      hint: 'Gear must be deployed [G] and descent speed under 14 m/s for safe touchdown.',
    },
    // Step 10
    {
      title: 'Step 10: Completion',
      heading: 'You’re cleared for exploration.',
      body: 'You now know the basics of piloting your spacecraft. The rest of the universe is yours to discover. Travel between worlds, investigate monuments, and shape the living dream.',
      badge: 'PILOT CERTIFIED',
      actionLabel: 'START EXPLORING',
      hint: 'Press [H] anytime to reopen controls or restart this tutorial.',
    },
  ];

  const current = steps[flightTutorialStep] || steps[0];

  const handleNext = () => {
    if (flightTutorialStep < steps.length - 1) {
      setFlightTutorialStep(flightTutorialStep + 1);
    } else {
      // Completed!
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('lucid_tutorial_completed_v1', 'true');
        }
      } catch {
        // Fallback for private browsing
      }
      setIsTutorialVisible(false);
    }
  };

  const handlePrev = () => {
    if (flightTutorialStep > 0) {
      setFlightTutorialStep(flightTutorialStep - 1);
    }
  };

  const handleSkip = () => {
    setIsTutorialVisible(false);
  };

  return (
    <div className="absolute top-20 left-6 z-40 max-w-sm pointer-events-auto select-none">
      <div className="glass-panel p-4 md:p-5 rounded-3xl border border-cyan-500/50 bg-slate-950/95 shadow-2xl backdrop-blur-md">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
              <Rocket className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <span className="font-mono text-[10px] tracking-widest text-cyan-400 font-bold uppercase">
              {current.badge}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400">
              {flightTutorialStep + 1} / {steps.length}
            </span>
            <button
              onClick={handleSkip}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Close Tutorial"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step Title & Heading */}
        <div className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider mb-0.5">
          {current.title}
        </div>
        <h3 className="font-display text-sm md:text-base font-bold text-white mb-2">
          {current.heading}
        </h3>

        {/* Body Description */}
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {current.body}
        </p>

        {/* Contextual Hint */}
        <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800 text-[10px] text-cyan-200/90 leading-tight mb-4 flex items-start gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
          <span>{current.hint}</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono text-xs font-bold tracking-wider shadow-md shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] mb-2.5"
        >
          <span>{current.actionLabel}</span>
          {autoCompleteDone && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
          {!autoCompleteDone && <ArrowRight className="w-3.5 h-3.5" />}
        </button>

        {/* Bottom Navigation controls */}
        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80 font-mono">
          <button
            disabled={flightTutorialStep === 0}
            onClick={handlePrev}
            className="flex items-center gap-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            onClick={() => {
              setHelpOpen(true);
            }}
            className="text-slate-400 hover:text-cyan-300 transition-colors"
          >
            Review Controls
          </button>

          <button
            onClick={handleSkip}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            Skip Tutorial
          </button>
        </div>
      </div>
    </div>
  );
}
