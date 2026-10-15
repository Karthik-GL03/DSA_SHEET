'use client';

import React, { useState } from 'react';
import { DayActivity } from '@/lib/types';
import { Calendar, Flame, Award, Zap } from 'lucide-react';

interface HeatmapProps {
  activities: DayActivity[];
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

export const ActivityHeatmap: React.FC<HeatmapProps> = ({
  activities,
  currentStreak,
  longestStreak,
  totalActiveDays
}) => {
  const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);

  // Group into weeks of 7 days
  const weeks: DayActivity[][] = [];
  let currentWeek: DayActivity[] = [];

  activities.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === activities.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const totalSolves = activities.reduce((acc, curr) => acc + curr.count, 0);
  const consistencyRate = Math.round((totalActiveDays / (activities.length || 365)) * 100);

  // Months label calculation
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-dark-800">
      
      {/* Header with Title and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-dark-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white">Daily Problem-Solving Heatmap</h2>
            <p className="text-xs text-slate-400">Aggregated real-time solves across LeetCode, Codeforces & GFG (Past 365 Days)</p>
          </div>
        </div>

        {/* Hover Info Tooltip preview */}
        <div className="h-6 flex items-center text-xs font-mono">
          {hoveredDay ? (
            <span className="text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-500/30">
              📅 {hoveredDay.date}: <strong className="text-emerald-400">{hoveredDay.count} solves</strong>
            </span>
          ) : (
            <span className="text-slate-400">Hover over any square to view daily volume</span>
          )}
        </div>
      </div>

      {/* Streaks Metric Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="bg-dark-900/60 rounded-xl p-3 border border-dark-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Current Streak</div>
            <div className="text-lg font-bold text-white">{currentStreak} <span className="text-xs text-amber-400">days</span></div>
          </div>
        </div>

        <div className="bg-dark-900/60 rounded-xl p-3 border border-dark-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Longest Streak</div>
            <div className="text-lg font-bold text-white">{longestStreak} <span className="text-xs text-purple-400">days</span></div>
          </div>
        </div>

        <div className="bg-dark-900/60 rounded-xl p-3 border border-dark-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Active Days</div>
            <div className="text-lg font-bold text-white">{totalActiveDays} <span className="text-xs text-slate-400">/ 365</span></div>
          </div>
        </div>

        <div className="bg-dark-900/60 rounded-xl p-3 border border-dark-800/80 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-400 font-medium">Yearly Solves</div>
            <div className="text-lg font-bold text-white">{totalSolves} <span className="text-xs text-cyan-400">({consistencyRate}%)</span></div>
          </div>
        </div>
      </div>

      {/* The 52-week Heatmap Grid */}
      <div className="overflow-x-auto pb-2 pt-1">
        <div className="min-w-[760px]">
          {/* Day rows (Mon, Wed, Fri labels) */}
          <div className="flex gap-1">
            <div className="flex flex-col justify-between text-[9px] font-mono text-slate-400 pr-1 py-1 h-[98px]">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Weeks */}
            <div className="flex gap-1.5 flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-1.5">
                  {week.map((day, dIdx) => {
                    let levelClass = 'heat-level-0';
                    if (day.level === 1) levelClass = 'heat-level-1';
                    else if (day.level === 2) levelClass = 'heat-level-2';
                    else if (day.level === 3) levelClass = 'heat-level-3';
                    else if (day.level === 4) levelClass = 'heat-level-4';

                    return (
                      <div
                        key={dIdx}
                        onMouseEnter={() => setHoveredDay(day)}
                        onMouseLeave={() => setHoveredDay(null)}
                        className={`w-3 h-3 rounded-[3px] transition-transform cursor-pointer hover:scale-125 ${levelClass}`}
                        title={`${day.date}: ${day.count} solves`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-4 mt-2 border-t border-dark-800/60">
            <span className="text-[11px] text-slate-400 font-mono">365-day rolling timeline</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px]">Less</span>
              <div className="w-2.5 h-2.5 rounded-[2px] heat-level-0" />
              <div className="w-2.5 h-2.5 rounded-[2px] heat-level-1" />
              <div className="w-2.5 h-2.5 rounded-[2px] heat-level-2" />
              <div className="w-2.5 h-2.5 rounded-[2px] heat-level-3" />
              <div className="w-2.5 h-2.5 rounded-[2px] heat-level-4" />
              <span className="text-[11px]">More</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
