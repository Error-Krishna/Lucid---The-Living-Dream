import React, { useState } from 'react';
import { useUniverseStore } from '../../stores/useUniverseStore.js';
import { persistence } from '../../lib/persistence.js';
import {
  FeedbackExperience,
  FeedbackPrimaryInterest,
  FeedbackDecision,
  FeedbackSubmission,
} from '@lucid/shared';
import {
  CheckCircle,
  Download,
  X,
  MessageSquare,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const EXPERIENCE_OPTIONS: { value: FeedbackExperience; label: string; icon: string }[] = [
  { value: 'Amazing', label: 'Amazing', icon: '✨' },
  { value: 'Good', label: 'Good', icon: '⭐' },
  { value: 'Okay', label: 'Okay', icon: '👌' },
  { value: 'Not for me', label: 'Not for me', icon: '👋' },
];

const INTEREST_OPTIONS: FeedbackPrimaryInterest[] = [
  'Exploring the planets',
  'The visuals and atmosphere',
  'Moving around and interacting with the world',
  'The idea of a shared, persistent universe',
  'I did not find it interesting yet',
];

export function FeedbackModal() {
  const isFeedbackOpen = useUniverseStore((s) => s.isFeedbackOpen);
  const isFinishExplorationOpen = useUniverseStore((s) => s.isFinishExplorationOpen);
  const setFeedbackOpen = useUniverseStore((s) => s.setFeedbackOpen);
  const closeFinishExploration = useUniverseStore((s) => s.closeFinishExploration);

  const [experience, setExperience] = useState<FeedbackExperience | null>(null);
  const [primaryInterest, setPrimaryInterest] = useState<FeedbackPrimaryInterest | null>(null);
  const [decision, setDecision] = useState<FeedbackDecision | null>(null);
  const [improvements, setImprovements] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    isRemote: boolean;
    id?: string;
  } | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isModalVisible = isFeedbackOpen || isFinishExplorationOpen;

  if (!isModalVisible) return null;

  const handleClose = () => {
    setFeedbackOpen(false);
    closeFinishExploration();
    setSubmissionResult(null);
    setSubmissionError(null);
    setValidationError(null);
  };

  const isFormValid = experience !== null && primaryInterest !== null && decision !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setSubmissionError(null);

    // Validate required questions
    const missing: string[] = [];
    if (!experience) missing.push('Question 1: Overall experience');
    if (!primaryInterest) missing.push('Question 2: Most interesting aspect');
    if (!decision) missing.push('Question 3: Continue building recommendation');

    if (missing.length > 0) {
      setValidationError(`Please answer all required questions: ${missing.join(', ')}`);
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const submission: Omit<FeedbackSubmission, 'id' | 'submittedAt'> = {
        experienceRating: experience!,
        primaryInterest: primaryInterest!,
        decision: decision!,
        improvements: improvements.trim(),
        rating:
          experience === 'Amazing'
            ? 5
            : experience === 'Good'
              ? 4
              : experience === 'Okay'
                ? 3
                : 1,
        interest: primaryInterest!,
        prototypeVersion: '1.1.0-space-mvp',
      };

      const res = await persistence.submitFeedback(submission as any);

      if (res.success && res.isRemote) {
        setSubmissionResult({
          success: true,
          isRemote: true,
          id: res.id,
        });
      } else {
        setSubmissionError(
          res.error || 'Server rejected submission. Please verify your connection and try again.'
        );
      }
    } catch (err: any) {
      setSubmissionError(
        err?.message || 'Network error while transmitting feedback. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportJson = () => {
    const drafts = persistence.getLocalFeedbackDrafts();
    const currentData = {
      currentSubmission: {
        experience,
        primaryInterest,
        decision,
        improvements: improvements.trim(),
      },
      savedDrafts: drafts,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(currentData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lucid-feedback-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto pointer-events-auto">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-6 md:p-8 my-8 shadow-2xl border border-indigo-400/40 relative">
        {/* Dismiss Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Close Feedback"
        >
          <X className="w-5 h-5" />
        </button>

        {submissionResult ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>

            <h3 className="font-display text-2xl text-white font-semibold mb-2">
              Thank You for Shaping LUCID
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
              Your feedback was securely saved directly to the database.
              {submissionResult.id && (
                <>
                  {' '}
                  Reference ID: <span className="font-mono text-cyan-300 font-semibold">{submissionResult.id}</span>.
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 text-xs font-semibold tracking-wider uppercase transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Export Copy (JSON)</span>
              </button>

              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold tracking-wide transition-all shadow-lg shadow-indigo-600/30"
              >
                Return to Exploration
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">
                  Evaluative Review
                </span>
              </div>
              <h2 className="font-display text-2xl md:text-3xl text-white font-bold">
                Finish Exploration & Feedback
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Three quick questions to determine whether to build LUCID into a full product.
              </p>
            </div>

            {/* Validation Banner */}
            {validationError && (
              <div className="p-3.5 rounded-2xl bg-amber-950/70 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Server Error Banner */}
            {submissionError && (
              <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-rose-300 mb-0.5">Submission Failed</div>
                  <div>{submissionError}</div>
                </div>
              </div>
            )}

            {/* Required Question 1 */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                1. How was your experience? <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setExperience(opt.value);
                      setValidationError(null);
                    }}
                    className={`py-3 px-3 rounded-2xl text-xs font-medium transition-all border flex flex-col items-center justify-center gap-1 ${
                      experience === opt.value
                        ? 'bg-indigo-600/50 border-indigo-400 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                        : 'bg-slate-900/40 border-slate-700/60 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-base">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Required Question 2 */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                2. What interested you most? <span className="text-rose-400">*</span>
              </label>
              <div className="space-y-1.5">
                {INTEREST_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setPrimaryInterest(opt);
                      setValidationError(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border flex items-center justify-between ${
                      primaryInterest === opt
                        ? 'bg-indigo-950/70 border-indigo-400 text-white ring-1 ring-indigo-400'
                        : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <span>{opt}</span>
                    {primaryInterest === opt && (
                      <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Required Question 3 — The Decisive Question */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border-2 border-indigo-400/40 glow-box-indigo">
              <label className="block font-display text-sm md:text-base text-center text-white font-bold mb-3">
                3. Should I continue building LUCID into a full project?{' '}
                <span className="text-rose-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDecision('YES');
                    setValidationError(null);
                  }}
                  className={`py-3.5 px-4 rounded-xl font-display text-xs uppercase tracking-wider font-bold transition-all border ${
                    decision === 'YES'
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                      : 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200 hover:bg-emerald-900/60'
                  }`}
                >
                  YES — Keep Building
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDecision('NO');
                    setValidationError(null);
                  }}
                  className={`py-3.5 px-4 rounded-xl font-display text-xs uppercase tracking-wider font-bold transition-all border ${
                    decision === 'NO'
                      ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400'
                      : 'bg-rose-950/40 border-rose-700/60 text-rose-200 hover:bg-rose-900/60'
                  }`}
                >
                  NO — Rethink the Idea
                </button>
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Any one thing you would improve? <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                value={improvements}
                onChange={(e) => setImprovements(e.target.value)}
                maxLength={2000}
                rows={2}
                placeholder="Controls, rocket travel, planet variety, building tools, atmosphere..."
                className="w-full rounded-xl bg-slate-900/60 border border-slate-700/60 p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-indigo-900/50">
              <button
                type="button"
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                title="Backup draft to computer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Draft</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-full font-semibold text-xs tracking-widest uppercase transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 cursor-wait'
                    : isFormValid
                      ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white hover:scale-105 active:scale-95 shadow-indigo-500/30 cursor-pointer'
                      : 'bg-indigo-700/60 hover:bg-indigo-600 text-white shadow-md cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Transmitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Feedback</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
