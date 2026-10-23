import React, { useState } from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { PLANET_CATALOG, PlanetId } from '@lucid/shared';
import { LandingScene } from './LandingScene.js';
import {
  Compass,
  Sparkles,
  MessageSquare,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  HelpCircle,
  Rocket,
} from 'lucide-react';

export function LandingHero() {
  const enterUniverseView = useUniverseStore((s) => s.enterUniverseView);
  const initiateTravel = useUniverseStore((s) => s.initiateTravel);
  const connectionMode = useUniverseStore((s) => s.connectionMode);
  const soundEnabled = useUniverseStore((s) => s.soundEnabled);
  const setSoundEnabled = useUniverseStore((s) => s.setSoundEnabled);
  const setFeedbackOpen = useUniverseStore((s) => s.setFeedbackOpen);
  const setHelpOpen = useUniverseStore((s) => s.setHelpOpen);

  const [selectedPreview, setSelectedPreview] = useState<PlanetId>('origin');

  const planets = Object.values(PLANET_CATALOG);

  return (
    <div className="relative w-full h-screen overflow-hidden flex flex-col justify-between p-6 md:p-12 z-10">
      {/* 3D Dream Scene */}
      <LandingScene />

      {/* Top Header Bar */}
      <header className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center glow-box-indigo">
            <Sparkles className="w-4 h-4 text-indigo-300" />
          </div>
          <div>
            <span className="font-display tracking-[0.25em] text-sm text-slate-200 uppercase font-semibold">
              LUCID
            </span>
            <span className="block text-[10px] tracking-widest text-indigo-300/70 font-mono">
              THE LIVING DREAM // MVP
            </span>
          </div>
        </div>

        {/* Status & Quick Toggles */}
        <div className="flex items-center gap-3">
          {/* Connection Mode Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-xs">
            <Radio
              className={`w-3.5 h-3.5 ${
                connectionMode === 'connected'
                  ? 'text-emerald-400 animate-pulse'
                  : 'text-amber-400'
              }`}
            />
            <span className="text-slate-300 font-mono">
              {connectionMode === 'connected'
                ? 'Multiplayer Engine Connected'
                : 'Local Demo Mode (Zero-Config)'}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2.5 rounded-full glass-panel hover:border-indigo-400/60 transition-colors text-slate-300 hover:text-white"
            title={soundEnabled ? 'Mute Dream Audio' : 'Enable Dream Audio'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-300" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Help Toggle */}
          <button
            onClick={() => setHelpOpen(true)}
            className="p-2.5 rounded-full glass-panel hover:border-indigo-400/60 transition-colors text-slate-300 hover:text-white"
            title="Controls & Guide"
            aria-label="Controls Guide"
          >
            <HelpCircle className="w-4 h-4 text-slate-300" />
          </button>

          {/* Give Feedback Primary CTA in Header */}
          <button
            onClick={() => setFeedbackOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-400/30 text-indigo-200 text-xs tracking-wider transition-all hover:scale-105 active:scale-95"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-medium">Feedback</span>
          </button>
        </div>
      </header>

      {/* Center Cinematic Hero */}
      <main className="relative z-10 max-w-3xl my-auto text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/20 text-indigo-300 text-xs tracking-widest font-mono mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          PERSISTENT EXPLORATION MULTIVERSE
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display tracking-tight text-white font-bold leading-none mb-3 glow-text-indigo">
          LUCID
        </h1>
        <p className="font-display tracking-[0.3em] text-lg sm:text-2xl text-indigo-200/90 font-light mb-6 uppercase">
          THE LIVING DREAM
        </p>

        <p className="text-slate-300 text-base sm:text-lg max-w-xl font-light leading-relaxed mb-3">
          “A universe shaped by the people who wander through it.”
        </p>
        <p className="text-indigo-300/80 text-xs sm:text-sm italic font-serif mb-8">
          Travel across deep space, land on surreal worlds, discover ancient relics, and shape the living dream.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => enterUniverseView()}
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm tracking-widest uppercase shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border border-indigo-300/30 glow-box-indigo"
          >
            <Rocket className="w-4 h-4 text-cyan-200" />
            <span>Enter the Universe</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('planet-selector-tray');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3.5 rounded-full glass-panel hover:bg-indigo-950/40 text-slate-200 text-sm tracking-wider font-normal transition-all hover:border-indigo-400/60 flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Charted Worlds ({planets.length})</span>
          </button>
        </div>
      </main>

      {/* Bottom Planet Discovery Tray */}
      <footer
        id="planet-selector-tray"
        className="relative z-10 w-full pt-4 border-t border-indigo-900/40"
      >
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="text-slate-400 tracking-wider uppercase font-mono text-[11px]">
            Expedition Destinations:
          </span>
          <span className="text-indigo-300/80 hidden sm:inline text-xs">
            Select a target world to initiate rocket flight sequence
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {planets.map((p) => {
            const isOrigin = p.id === 'origin';
            return (
              <div
                key={p.id}
                onClick={() => initiateTravel(p.id)}
                className={`p-3 rounded-xl transition-all cursor-pointer group glass-panel-subtle hover:glass-panel hover:border-indigo-400/50 hover:-translate-y-1 ${
                  selectedPreview === p.id ? 'border-indigo-400/60 bg-indigo-950/40' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.visualTheme.accentColor }}
                  />
                  {isOrigin && (
                    <span className="text-[9px] uppercase tracking-wider text-indigo-300 font-mono">
                      Hub
                    </span>
                  )}
                </div>
                <h3 className="font-display text-xs text-white group-hover:text-indigo-200 transition-colors line-clamp-1">
                  {p.name.split('—')[0]}
                </h3>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {p.tagline}
                </p>
              </div>
            );
          })}
        </div>
      </footer>
    </div>
  );
}
