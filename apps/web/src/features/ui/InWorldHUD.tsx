import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { PLANET_CATALOG } from '@lucid/shared';
import {
  Compass,
  Sparkles,
  Volume2,
  VolumeX,
  Radio,
  LogOut,
  HelpCircle,
  MessageSquare,
  User,
  MessagesSquare,
  CheckCircle2,
  Rocket,
} from 'lucide-react';

interface InWorldHUDProps {
  playerPosition: [number, number, number];
}

export function InWorldHUD({ playerPosition }: InWorldHUDProps) {
  const activePlanet = useUniverseStore((s) => s.activePlanet);
  const connectionMode = useUniverseStore((s) => s.connectionMode);
  const exitToLanding = useUniverseStore((s) => s.exitToLanding);
  const openFinishExploration = useUniverseStore((s) => s.openFinishExploration);
  const boardRocket = useUniverseStore((s) => s.boardRocket);
  const isNearRocket = useUniverseStore((s) => s.isNearRocket);
  const soundEnabled = useUniverseStore((s) => s.soundEnabled);
  const setSoundEnabled = useUniverseStore((s) => s.setSoundEnabled);
  const toggleMap = useUniverseStore((s) => s.toggleMap);
  const isBuildMode = useUniverseStore((s) => s.isBuildMode);
  const toggleBuildMode = useUniverseStore((s) => s.toggleBuildMode);
  const setHelpOpen = useUniverseStore((s) => s.setHelpOpen);
  const setProfileOpen = useUniverseStore((s) => s.setProfileOpen);
  const isChatOpen = useUniverseStore((s) => s.isChatOpen);
  const setChatOpen = useUniverseStore((s) => s.setChatOpen);
  const contextPrompt = useUniverseStore((s) => s.contextPrompt);
  const nearbyPortal = useUniverseStore((s) => s.nearbyPortal);
  const travelToPlanet = useUniverseStore((s) => s.travelToPlanet);
  const triggerLandmarkInteraction = useUniverseStore((s) => s.triggerLandmarkInteraction);

  const planetMeta = PLANET_CATALOG[activePlanet];

  const handlePromptClick = () => {
    if (isNearRocket || contextPrompt?.toLowerCase().includes('rocket')) {
      boardRocket();
    } else if (nearbyPortal) {
      travelToPlanet(nearbyPortal);
    } else if (contextPrompt) {
      triggerLandmarkInteraction();
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 md:p-6">
      {/* Top Bar */}
      <header className="flex items-start justify-between w-full pointer-events-auto">
        {/* Planet Info */}
        <div className="glass-panel px-4 py-2.5 rounded-2xl flex flex-col max-w-sm">
          <div className="flex items-center gap-2 mb-0.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: planetMeta?.visualTheme.accentColor || '#6366f1' }}
            />
            <h2 className="font-display text-sm md:text-base text-white font-semibold">
              {planetMeta?.name}
            </h2>
          </div>
          <p className="text-[11px] text-slate-300 font-light line-clamp-1">
            {planetMeta?.tagline}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
            <span>
              X: {playerPosition[0].toFixed(1)} Z: {playerPosition[2].toFixed(1)}
            </span>
            <span>•</span>
            <span
              className={
                connectionMode === 'connected' ? 'text-emerald-400' : 'text-amber-400'
              }
            >
              {connectionMode === 'connected' ? 'Multiplayer Online' : 'Local Demo Mode'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-xl glass-panel hover:border-indigo-400/60 text-slate-300 hover:text-white transition-colors"
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Chat toggle */}
          <button
            onClick={() => setChatOpen(!isChatOpen)}
            className="p-2.5 rounded-xl glass-panel hover:border-indigo-400/60 text-slate-300 hover:text-white transition-colors"
            title="Dream Whispers / Chat"
          >
            <MessagesSquare className="w-4 h-4" />
          </button>

          {/* Profile / Avatar customization */}
          <button
            onClick={() => setProfileOpen(true)}
            className="p-2.5 rounded-xl glass-panel hover:border-indigo-400/60 text-slate-300 hover:text-white transition-colors"
            title="Avatar Persona"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Starmap / Multiverse Navigation Button */}
          <button
            onClick={toggleMap}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-panel hover:bg-cyan-950/60 hover:border-cyan-400 text-cyan-200 text-xs font-mono transition-all border border-cyan-500/40 shadow-sm"
            title="Open Multiverse Starmap & Navigate to other planets [M]"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span className="hidden sm:inline">Starmap [M]</span>
          </button>

          {/* Help toggle */}
          <button
            onClick={() => setHelpOpen(true)}
            className="p-2.5 rounded-xl glass-panel hover:border-indigo-400/60 text-slate-300 hover:text-white transition-colors"
            title="Controls & Navigation Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Return to Rocket / Spacecraft Button */}
          <button
            onClick={boardRocket}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-panel hover:bg-indigo-900/50 hover:border-indigo-400/60 text-indigo-200 text-xs font-medium transition-all"
            title="Return to Spacecraft and Launch to Deep Space"
          >
            <Rocket className="w-3.5 h-3.5 text-indigo-300" />
            <span className="hidden sm:inline">Return to Rocket [E]</span>
          </button>

          {/* Finish Exploration / Survey CTA */}
          <button
            onClick={openFinishExploration}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-md shadow-emerald-600/30 hover:scale-105 active:scale-95"
            title="Finish Exploration and Share Feedback"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Finish Exploration</span>
          </button>

          {/* Return to Sanctuary */}
          <button
            onClick={exitToLanding}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-panel hover:bg-rose-950/30 text-slate-300 hover:text-rose-300 hover:border-rose-500/40 text-xs transition-colors"
            title="Wake Up / Return to Sanctuary"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wake Up</span>
          </button>
        </div>
      </header>

      {/* First-Person Center Crosshair Reticle & Context Action */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {contextPrompt ? (
          <div className="pointer-events-auto transform -translate-y-4 animate-bounce">
            <button
              onClick={handlePromptClick}
              className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-3 border border-pink-400/80 shadow-2xl shadow-pink-950/60 hover:scale-105 active:scale-95 transition-all bg-slate-900/85 backdrop-blur-md"
            >
              <div className="px-2 py-0.5 rounded bg-pink-500/30 border border-pink-400/60 text-[10px] font-mono text-pink-200 uppercase font-bold">
                E
              </div>
              <Sparkles className="w-4 h-4 text-pink-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-display text-sm tracking-wide text-white font-medium">
                {contextPrompt}
              </span>
            </button>
          </div>
        ) : (
          <div className="relative flex items-center justify-center opacity-45 pointer-events-none">
            {/* Subtle center dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-sm shadow-cyan-400" />
            {/* Thin crosshair ticks */}
            <div className="absolute w-4 h-[1px] bg-cyan-200/50" />
            <div className="absolute h-4 w-[1px] bg-cyan-200/50" />
          </div>
        )}
      </div>

      {/* Bottom Bar: Control Hints & Build Mode Shortcut */}
      <footer className="flex flex-col sm:flex-row items-center justify-between w-full pointer-events-auto gap-3 pb-1">
        {/* First-person exploration controls hint */}
        <div className="glass-panel px-3.5 py-1.5 rounded-xl text-[11px] font-mono text-slate-300/80 hidden md:flex items-center gap-2">
          <span>Click screen to look</span>
          <span>•</span>
          <span>WASD Move</span>
          <span>•</span>
          <span>Shift Sprint</span>
          <span>•</span>
          <span>Space Jump</span>
          <span>•</span>
          <span>E Interact</span>
          <span>•</span>
          <span className="text-cyan-300 font-bold">M Starmap / Fast Travel</span>
        </div>

        {/* Build Mode Shortcut */}
        <div className="mx-auto sm:mx-0">
          <button
            onClick={toggleBuildMode}
            className={`px-5 py-2 rounded-full flex items-center gap-2 text-xs font-medium tracking-wider uppercase transition-all shadow-lg ${
              isBuildMode
                ? 'bg-indigo-600 text-white border border-indigo-300 glow-box-indigo'
                : 'glass-panel text-slate-200 hover:border-indigo-400/50 hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>{isBuildMode ? 'Exit Build Mode [B]' : 'Build & Create [B]'}</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
