import React, { useState } from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { User, X, Check } from 'lucide-react';

const AURA_COLORS = [
  { name: 'Cosmic Indigo', color: '#818cf8', glow: '#6366f1' },
  { name: 'Lavender Mist', color: '#c084fc', glow: '#a855f7' },
  { name: 'Crystal Cyan', color: '#38bdf8', glow: '#0ea5e9' },
  { name: 'Emerald Spore', color: '#34d399', glow: '#10b981' },
  { name: 'Solar Amber', color: '#fbbf24', glow: '#f59e0b' },
  { name: 'Rose Dream', color: '#fb7185', glow: '#f43f5e' },
];

export function ProfileModal() {
  const isProfileOpen = useUniverseStore((s) => s.isProfileOpen);
  const setProfileOpen = useUniverseStore((s) => s.setProfileOpen);
  const userName = useUniverseStore((s) => s.userName);
  const setUserName = useUniverseStore((s) => s.setUserName);
  const avatarConfig = useUniverseStore((s) => s.avatarConfig);
  const setAvatarConfig = useUniverseStore((s) => s.setAvatarConfig);

  const [inputName, setInputName] = useState(userName);

  if (!isProfileOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      setUserName(inputName.trim().slice(0, 24));
    }
    setProfileOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 border border-indigo-400/40 relative">
        <button
          onClick={() => setProfileOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-indigo-400" />
          <span className="font-mono text-xs uppercase tracking-widest text-indigo-300">
            Wanderer Identity
          </span>
        </div>

        <h2 className="font-display text-2xl text-white font-bold mb-4">
          Dream Persona
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              maxLength={24}
              className="w-full rounded-xl bg-slate-900/60 border border-slate-700/60 p-3 text-sm text-white focus:outline-none focus:border-indigo-400 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Aura & Core Glow
            </label>
            <div className="grid grid-cols-3 gap-2">
              {AURA_COLORS.map((a) => {
                const isSelected = avatarConfig.glowColor === a.glow;
                return (
                  <button
                    key={a.name}
                    type="button"
                    onClick={() =>
                      setAvatarConfig({ color: a.color, glowColor: a.glow })
                    }
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-indigo-950/80 border-indigo-400 text-white ring-1 ring-indigo-400'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: a.glow }}
                    />
                    <span className="text-[10px] line-clamp-1">{a.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-indigo-900/40 flex justify-end gap-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wider uppercase transition-all"
            >
              Update Persona
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
