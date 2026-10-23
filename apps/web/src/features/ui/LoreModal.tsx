import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { Sparkles, X, BookOpen } from 'lucide-react';

export function LoreModal() {
  const activeLandmark = useUniverseStore((s) => s.activeLandmark);
  const closeLandmarkModal = useUniverseStore((s) => s.closeLandmarkModal);

  if (!activeLandmark) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 md:p-8 border border-indigo-400/40 relative text-center">
        <button
          onClick={closeLandmarkModal}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mb-4 glow-box-indigo">
          <BookOpen className="w-6 h-6 text-indigo-300" />
        </div>

        <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-300">
          Landmark Inscription Unlocked
        </span>

        <h2 className="font-display text-2xl text-white font-bold mt-1 mb-4">
          {activeLandmark.name}
        </h2>

        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 mb-6">
          <p className="text-sm text-slate-200 italic font-serif leading-relaxed">
            “{activeLandmark.lore}”
          </p>
        </div>

        <button
          onClick={closeLandmarkModal}
          className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wider uppercase transition-all"
        >
          Close Inscription
        </button>
      </div>
    </div>
  );
}
