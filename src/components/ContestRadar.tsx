'use client';

import React, { useState, useEffect } from 'react';
import { ContestItem, CodeforcesProfileData } from '@/lib/types';
import { Trophy, ExternalLink, Bell, Clock, Calendar, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { CodeforcesIcon, LeetCodeIcon, CodeChefIcon } from './BrandIcons';

interface ContestRadarProps {
  contests: ContestItem[];
  cfProfile: CodeforcesProfileData | null;
  registeredContests: Set<string>;
  onToggleRegister: (contestId: string) => void;
}

export const ContestRadar: React.FC<ContestRadarProps> = ({
  contests,
  cfProfile,
  registeredContests,
  onToggleRegister,
}) => {
  // Simple countdown helper
  const getRemainingTime = (isoString: string) => {
    const diff = new Date(isoString).getTime() - Date.now();
    if (diff <= 0) return 'Live Now / Concluded';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    const remMinutes = Math.floor((diff / (1000 * 60)) % 60);

    if (days > 0) return `Starts in ${days}d ${remHours}h`;
    return `Starts in ${remHours}h ${remMinutes}m`;
  };

  const ratingHistoryData = cfProfile?.ratingHistory?.map((r) => ({
    name: r.contestName.length > 20 ? r.contestName.substring(0, 20) + '...' : r.contestName,
    rating: r.newRating,
    rank: r.rank,
    date: new Date(r.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
  })) || [];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-dark-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Competitive Contest Radar</h2>
              <p className="text-xs text-slate-400">
                Track upcoming contests across Codeforces, LeetCode & CodeChef with automated Telegram reminders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Auto-synced via Codeforces official REST API</span>
          </div>
        </div>
      </div>

      {/* Codeforces Rating Progression Chart */}
      {ratingHistoryData.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <div>
                <h3 className="font-bold text-base text-white">Contest Rating Trajectory (Codeforces)</h3>
                <p className="text-xs text-slate-400">Historical rating fluctuations from rated rounds</p>
              </div>
            </div>
            <div className="text-xs font-mono text-cyan-400 font-bold bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-500/20">
              Current: {cfProfile?.rating} ({cfProfile?.rank})
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ratingHistoryData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={['dataMin - 100', 'dataMax + 100']} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#38bdf8" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#0284c7' }} 
                  activeDot={{ r: 6, fill: '#38bdf8' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Upcoming Contests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contests.map((c) => {
          const isRegistered = registeredContests.has(c.id);
          const platformColor = 
            c.platform === 'Codeforces' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
            c.platform === 'LeetCode' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
            'bg-purple-500/10 text-purple-400 border-purple-500/20';

          return (
            <div 
              key={c.id} 
              className={`glass-panel rounded-2xl p-5 border transition-all ${
                isRegistered ? 'border-indigo-500/40 bg-indigo-950/15' : 'border-dark-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border flex items-center gap-1.5 ${platformColor}`}>
                  {c.platform === 'Codeforces' && <CodeforcesIcon className="w-3 h-3" />}
                  {c.platform === 'LeetCode' && <LeetCodeIcon className="w-3 h-3" />}
                  {c.platform === 'CodeChef' && <CodeChefIcon className="w-3 h-3" />}
                  <span>{c.platform}</span>
                </span>

                <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-300 bg-dark-900 px-2 py-0.5 rounded-lg border border-dark-800">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{getRemainingTime(c.startTime)}</span>
                </div>
              </div>

              <h4 className="font-bold text-base text-white mt-3 line-clamp-1">{c.name}</h4>

              <div className="mt-3 space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(c.startTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Duration: {Math.round(c.durationSeconds / 60)} minutes</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-dark-800/80">
                <button
                  onClick={() => onToggleRegister(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isRegistered
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-dark-800 hover:bg-dark-700 text-slate-300 border border-dark-700'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>{isRegistered ? 'Reminder Active' : 'Set Reminder'}</span>
                </button>

                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  <span>Go to Contest</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
