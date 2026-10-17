'use client';

import React, { useState } from 'react';
import { 
  UserProfile, 
  PlatformState, 
  SolvedProblem 
} from '@/lib/types';
import { 
  Code2, 
  ExternalLink, 
  Trophy, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  Flame,
  Radio,
  Zap,
  Globe
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis 
} from 'recharts';
import { LeetCodeIcon, CodeforcesIcon, GeeksforGeeksIcon } from './BrandIcons';

interface DashboardOverviewProps {
  profile: UserProfile;
  platformState: PlatformState;
  solves: SolvedProblem[];
  onOpenSync: () => void;
  onNavigateTab: (tab: string) => void;
  onQuickLoadPreset: (lc: string, cf: string) => void;
  latency: { leetcode: number | null; codeforces: number | null };
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profile,
  platformState,
  solves,
  onOpenSync,
  onNavigateTab,
  onQuickLoadPreset,
  latency
}) => {
  const lc = platformState.leetcode;
  const cf = platformState.codeforces;
  const gfg = platformState.geeksforgeeks;

  const totalLC = lc?.totalSolved || 0;
  const totalCF = cf?.totalSolved || 0;
  const totalGFG = gfg?.totalSolved || 0;
  const aggregateSolves = totalLC + totalCF + totalGFG;

  // Real, exact difficulty aggregate
  const easyCount = (lc?.easySolved || 0) + (gfg?.breakdown?.easy || 0) + (cf?.easySolved || 0);
  const mediumCount = (lc?.mediumSolved || 0) + (gfg?.breakdown?.medium || 0) + (cf?.mediumSolved || 0);
  const hardCount = (lc?.hardSolved || 0) + (gfg?.breakdown?.hard || 0) + (cf?.hardSolved || 0);

  const difficultyData = [
    { name: 'Easy', count: easyCount, color: '#10b981' },
    { name: 'Medium', count: mediumCount, color: '#f59e0b' },
    { name: 'Hard', count: hardCount, color: '#ef4444' },
  ];

  const platformData = [
    { name: 'LeetCode', solves: totalLC, fill: '#f59e0b' },
    { name: 'Codeforces', solves: totalCF, fill: '#3b82f6' },
    { name: 'GeeksforGeeks', solves: totalGFG, fill: '#10b981' },
  ];

  // Combined real-time recent submissions
  const combinedRecent: Array<{
    id: string;
    title: string;
    platform: 'LeetCode' | 'Codeforces';
    timeStr: string;
    url: string;
  }> = [];

  if (lc?.recentSubmissions) {
    lc.recentSubmissions.slice(0, 6).forEach((sub) => {
      combinedRecent.push({
        id: `lc-${sub.id}`,
        title: sub.title,
        platform: 'LeetCode',
        timeStr: new Date(Number(sub.timestamp) * 1000).toLocaleDateString(),
        url: `https://leetcode.com/problems/${sub.titleSlug}/`
      });
    });
  }

  if (cf?.recentSubmissions) {
    cf.recentSubmissions.slice(0, 6).forEach((sub) => {
      combinedRecent.push({
        id: `cf-${sub.id}`,
        title: `${sub.problemIndex}. ${sub.problemName}`,
        platform: 'Codeforces',
        timeStr: new Date(sub.creationTimeSeconds * 1000).toLocaleDateString(),
        url: sub.contestId ? `https://codeforces.com/contest/${sub.contestId}/problem/${sub.problemIndex}` : 'https://codeforces.com'
      });
    });
  }

  const hasAnyHandle = profile.handles.leetcode || profile.handles.codeforces || profile.handles.geeksforgeeks;

  return (
    <div className="space-y-6">
      
      {/* Real-time Status & Quick Switcher Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-dark-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Live Algorithmic Dashboard
              </h1>
              
              {/* Real-Time Pulse Indicator */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>REAL-TIME STREAM ACTIVE</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
              <span>Latency:</span>
              <span className="font-mono text-slate-300">
                LC: {latency.leetcode !== null ? `${latency.leetcode}ms` : 'Connecting...'}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-300">
                CF: {latency.codeforces !== null ? `${latency.codeforces}ms` : 'Connecting...'}
              </span>
              {platformState.lastSyncedAt && (
                <>
                  <span>•</span>
                  <span>Last synced: <strong className="text-slate-200">{platformState.lastSyncedAt}</strong></span>
                </>
              )}
            </div>
          </div>

          {/* Connected Handles or Quick Load */}
          <div className="flex flex-wrap items-center gap-2">
            {profile.handles.leetcode && (
              <div className="px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-800 flex items-center gap-2 text-xs">
                <LeetCodeIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-400 font-mono">LeetCode:</span>
                <span className="text-slate-200 font-medium">{profile.handles.leetcode}</span>
              </div>
            )}

            {profile.handles.codeforces && (
              <div className="px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-800 flex items-center gap-2 text-xs">
                <CodeforcesIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-400 font-mono">Codeforces:</span>
                <span className="text-slate-200 font-medium">{profile.handles.codeforces}</span>
              </div>
            )}

            {profile.handles.geeksforgeeks && (
              <div className="px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-800 flex items-center gap-2 text-xs">
                <GeeksforGeeksIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="text-slate-400 font-mono">GFG:</span>
                <span className="text-slate-200 font-medium">{profile.handles.geeksforgeeks}</span>
              </div>
            )}

            <button
              onClick={onOpenSync}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{hasAnyHandle ? 'Switch / Edit Handles' : 'Connect Your Public Profile'}</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Selector if user wants to test live data immediately */}
        <div className="mt-4 pt-4 border-t border-dark-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            Want to test live extraction right now? Try top public competitive profiles:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuickLoadPreset('neal_wu', 'neal')}
              className="px-2.5 py-1 rounded-lg bg-dark-900 hover:bg-dark-800 text-slate-300 border border-dark-700 text-xs font-mono transition-colors"
            >
              🚀 Neal Wu (LC + CF)
            </button>
            <button
              onClick={() => onQuickLoadPreset('', 'tourist')}
              className="px-2.5 py-1 rounded-lg bg-dark-900 hover:bg-dark-800 text-slate-300 border border-dark-700 text-xs font-mono transition-colors"
            >
              🏆 Gennady / tourist (CF)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Solved Aggregate */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Live Aggregated Solves</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white tracking-tight">{aggregateSolves}</div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold">{easyCount} Easy</span> • 
            <span className="text-amber-400 font-semibold">{mediumCount} Med</span> • 
            <span className="text-rose-400 font-semibold">{hardCount} Hard</span>
          </div>
        </div>

        {/* LeetCode Solves & Rank */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">LeetCode Solved</span>
            <div className="p-2 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <LeetCodeIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 tracking-tight">{totalLC}</div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Global Rank:</span>
            <span className="font-mono text-slate-200">
              {lc?.ranking ? `#${lc.ranking.toLocaleString()}` : (profile.handles.leetcode ? 'Loaded' : 'No Handle')}
            </span>
          </div>
        </div>

        {/* Codeforces Rating */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Codeforces Rating</span>
            <div className="p-2 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CodeforcesIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-blue-400 tracking-tight">
            {cf?.rating || 0}
            <span className="text-xs font-normal text-slate-400 ml-2">({cf?.rank || 'Unrated'})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Max Rating:</span>
            <span className="font-mono text-cyan-300">
              {cf?.maxRating ? `${cf.maxRating} (${cf.maxRank})` : 'N/A'}
            </span>
          </div>
        </div>

        {/* GeeksforGeeks Score */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">GeeksforGeeks Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <GeeksforGeeksIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">{gfg?.codingScore || 0}</div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>GFG Problems Solved:</span>
            <span className="font-mono text-slate-200">{totalGFG}</span>
          </div>
        </div>

      </div>

      {/* Analytics Charts & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Difficulty Breakdown Pie */}
        <div className="glass-panel rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-white">Live Difficulty Breakdown</h3>
              <p className="text-xs text-slate-400">Combined totals from verified accepted solutions</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-slate-300">Easy ({easyCount})</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-slate-300">Med ({mediumCount})</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-slate-300">Hard ({hardCount})</span></div>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Share Bar Chart */}
        <div className="glass-panel rounded-2xl p-6 border border-dark-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-white">Live Solves by Platform</h3>
              <p className="text-xs text-slate-400">Real-time breakdown between LeetCode, Codeforces &amp; GFG</p>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={90} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="solves" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Submissions Activity Feed */}
      <div className="glass-panel rounded-2xl p-6 border border-dark-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Live Accepted Submissions Stream</h3>
              <p className="text-xs text-slate-400">Directly fetched from platform APIs</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('curriculum')}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <span>Cross-reference Curricula</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-dark-800/80">
          {combinedRecent.length > 0 ? (
            combinedRecent.map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between hover:bg-dark-900/40 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1.5 ${
                    sub.platform === 'LeetCode' 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {sub.platform === 'LeetCode' ? <LeetCodeIcon className="w-3 h-3" /> : <CodeforcesIcon className="w-3 h-3" />}
                    <span>{sub.platform}</span>
                  </span>
                  <a 
                    href={sub.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm font-medium text-slate-200 hover:text-indigo-400 flex items-center gap-1.5 group"
                  >
                    <span>{sub.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400" />
                  </a>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                  <span>{sub.timeStr}</span>
                  <span className="text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">Accepted</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              <p>No recent submissions synced yet. Connect your handles above to pull your live submissions!</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
