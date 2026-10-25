import React from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export function NavigationToastBanner() {
  const navigationToast = useUniverseStore((s) => s.navigationToast);
  const clearNavigationToast = useUniverseStore((s) => s.clearNavigationToast);

  if (!navigationToast) return null;

  const { message, type = 'info', actionLabel, onAction } = navigationToast;

  const typeStyles = {
    info: 'border-cyan-500/50 bg-slate-950/95 text-cyan-200',
    success: 'border-emerald-500/50 bg-slate-950/95 text-emerald-200',
    warning: 'border-amber-500/50 bg-slate-950/95 text-amber-200',
    error: 'border-rose-500/50 bg-slate-950/95 text-rose-200',
  }[type];

  const Icon = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
  }[type];

  return (
    <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto max-w-md w-[92vw] select-none animate-fadeIn">
      <div
        className={`glass-panel px-4 py-2.5 rounded-2xl border shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md ${typeStyles}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon className="w-4 h-4 shrink-0" />
          <span className="text-xs font-mono font-medium leading-tight truncate">{message}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actionLabel && onAction && (
            <button
              onClick={() => {
                onAction();
                clearNavigationToast();
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-100 text-[10px] font-mono font-bold uppercase tracking-wider transition-all"
            >
              {actionLabel}
            </button>
          )}

          <button
            onClick={clearNavigationToast}
            className="p-1 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Dismiss notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
