import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import {
  Sparkles,
  Rocket,
  Compass,
  ArrowRight,
  BookOpen,
  X,
  Globe2,
  Users,
} from 'lucide-react';

interface FirstVisitIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTutorial: () => void;
}

export function FirstVisitIntroModal({
  isOpen,
  onClose,
  onStartTutorial,
}: FirstVisitIntroModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-2xl rounded-3xl border border-cyan-500/40 bg-slate-950/95 p-6 md:p-8 shadow-2xl max-h-[92vh] overflow-y-auto text-slate-100">
        {/* Subtle Close button for returning visitors */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Close Introduction"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center glow-box-indigo">
            <Sparkles className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold tracking-wider text-white">
              LUCID
            </h1>
            <div className="font-mono text-xs uppercase tracking-widest text-cyan-400">
              The Living Dream
            </div>
          </div>
        </div>

        {/* Tagline */}
        <blockquote className="border-l-2 border-cyan-400 pl-3 my-3 text-sm md:text-base italic text-cyan-200/90 font-sans">
          “An evolving universe waiting to be explored.”
        </blockquote>

        {/* Narrative Description */}
        <p className="text-xs md:text-sm text-slate-300 leading-relaxed mb-5">
          LUCID is an early prototype exploring what a shared, persistent virtual universe could become — a place where people can travel between worlds, discover environments, meet other explorers, and gradually shape their surroundings.
        </p>

        {/* 3 Pillars Breakdown */}
        <div className="space-y-3 mb-6">
          {/* Section 1: What you're experiencing */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0 mt-0.5">
              <Rocket className="w-4 h-4 text-indigo-300" />
            </div>
            <div>
              <div className="font-display text-xs font-bold text-white uppercase tracking-wider mb-1">
                What you’re experiencing
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                This prototype explores the foundations of LUCID: spacecraft navigation, planetary exploration, immersive environments, and the beginnings of a connected universe.
              </p>
            </div>
          </div>

          {/* Section 2: Where we're going */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shrink-0 mt-0.5">
              <Globe2 className="w-4 h-4 text-purple-300" />
            </div>
            <div>
              <div className="font-display text-xs font-bold text-white uppercase tracking-wider mb-1">
                Where we’re going
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our long-term vision is to build a living universe of interconnected worlds, meaningful discoveries, shared experiences, and persistent changes shaped by the people who explore it.
              </p>
            </div>
          </div>

          {/* Section 3: Your mission */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex gap-3.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <div className="font-display text-xs font-bold text-cyan-200 uppercase tracking-wider mb-1">
                Your mission
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Explore the universe. Learn to pilot your spacecraft. Visit different worlds. Tell us what feels magical, what feels confusing, and what you would want to experience next.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-mono text-xs md:text-sm font-bold tracking-wider shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            <span>ENTER THE UNIVERSE</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onStartTutorial}
            className="py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-400/60 text-slate-200 hover:text-white font-mono text-xs md:text-sm tracking-wider flex items-center justify-center gap-2 transition-all"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>HOW TO PLAY</span>
          </button>
        </div>
      </div>
    </div>
  );
}
