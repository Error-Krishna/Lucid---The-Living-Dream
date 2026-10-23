import React from 'react';
import { useUniverseStore } from '../stores/useUniverseStore.js';
import { LandingHero } from '../features/landing/LandingHero.js';
import { UniverseView } from '../features/universe/UniverseView.js';
import { WorldScene } from '../features/world/WorldScene.js';
import { CockpitFlightScene } from '../features/cockpit/CockpitFlightScene.js';
import { FlightSequenceOverlay } from '../features/spacecraft/FlightSequenceOverlay.js';
import { FeedbackModal } from '../features/feedback/FeedbackModal.js';
import { ControlsHelpModal } from '../features/ui/ControlsHelpModal.js';
import { UniverseMapModal } from '../features/ui/UniverseMapModal.js';
import { TransitionOverlay } from '../features/ui/TransitionOverlay.js';
import { Sparkles } from 'lucide-react';

export function App() {
  const viewMode = useUniverseStore((s) => s.viewMode);
  const activeDiscovery = useUniverseStore((s) => s.activeDiscoveryNotice);
  const dismissDiscovery = useUniverseStore((s) => s.dismissDiscoveryNotice);

  return (
    <div className="w-full h-screen bg-[#030514] text-slate-100 select-none overflow-hidden relative font-sans">
      {(viewMode === 'cockpit' || viewMode === 'landing') && <CockpitFlightScene />}
      {viewMode === 'universe' && <UniverseView />}
      {viewMode === 'world' && <WorldScene />}

      {/* Discovery Notification Toast */}
      {activeDiscovery && (
        <div
          onClick={dismissDiscovery}
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 cursor-pointer animate-bounce"
        >
          <div className="glass-panel px-6 py-3.5 rounded-2xl border border-pink-400/60 bg-slate-900/90 shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-400/50 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-pink-300" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-widest text-pink-300 uppercase">
                {`NEW DISCOVERY // ${activeDiscovery.category.toUpperCase()}`}
              </div>
              <div className="font-display text-sm font-bold text-white">
                {activeDiscovery.title}
              </div>
              <div className="text-xs text-slate-300 font-mono">
                {activeDiscovery.description}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flight sequence overlay active during warp cruise, landing, boarding, taking off */}
      <FlightSequenceOverlay />

      {/* Global Modals accessible from any view */}
      <FeedbackModal />
      <ControlsHelpModal />
      <UniverseMapModal />
      <TransitionOverlay />
    </div>
  );
}
export default App;
