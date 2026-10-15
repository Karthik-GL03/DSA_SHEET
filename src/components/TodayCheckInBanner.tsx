'use client';

import React from 'react';
import { Flame, CheckCircle2, AlertTriangle, ArrowRight, Zap, Target } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodayCheckInProps {
  todaySolves: number;
  targetSolves: number;
  currentStreak: number;
  onExploreProblems: () => void;
  onQuickLogSolve: () => void;
}

export const TodayCheckInBanner: React.FC<TodayCheckInProps> = ({
  todaySolves,
  targetSolves,
  currentStreak,
  onExploreProblems,
  onQuickLogSolve,
}) => {
  const isGoalMet = todaySolves >= targetSolves;

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    onQuickLogSolve();
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
      isGoalMet 
        ? 'bg-gradient-to-r from-emerald-950/40 via-dark-900 to-emerald-950/20 border-emerald-500/30 glow-emerald' 
        : 'bg-gradient-to-r from-amber-950/40 via-dark-900 to-amber-950/20 border-amber-500/30 glow-amber'
    }`}>
      {/* Background ambient pattern */}
      <div className="absolute -right-8 -top-8 w-48 h-48 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="flex items-start sm:items-center gap-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            isGoalMet ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            {isGoalMet ? (
              <CheckCircle2 className="w-6 h-6 animate-pulse" />
            ) : (
              <Flame className="w-6 h-6 animate-bounce" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-base text-white">
                {isGoalMet ? "Today's Streak Secured!" : "Protect Your Consistency Streak"}
              </h3>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                isGoalMet ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {todaySolves} / {targetSolves} solved today
              </span>
            </div>
            
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {isGoalMet ? (
                <>Awesome discipline! You maintained your <strong className="text-emerald-300">{currentStreak}-day streak</strong>. Daily notifications will remain dormant until tomorrow.</>
              ) : (
                <>You have <strong className="text-amber-300">{todaySolves} problems logged today</strong>. Solve at least 1 problem before midnight to prevent automated Telegram missed-day alert warnings!</>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={triggerCelebration}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md ${
              isGoalMet
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-dark-950 font-bold'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isGoalMet ? 'Celebrate Solves' : 'Record Solve (+1)'}</span>
          </button>

          <button
            onClick={onExploreProblems}
            className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-700 transition-colors"
          >
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>Pick Next Problem</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>

      </div>
    </div>
  );
};
