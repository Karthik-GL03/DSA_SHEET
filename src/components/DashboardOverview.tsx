'use client';

import React from 'react';
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
  ArrowUpRight
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

interface DashboardOverviewProps {
  profile: UserProfile;
  platformState: PlatformState;
  solves: SolvedProblem[];
  onOpenSync: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profile,
  platformState,
  solves,
  onOpenSync,
  onNavigateTab
}) => {
  const lc = platformState.leetcode;
  const cf = platformState.codeforces;
  const gfg = platformState.geeksforgeeks;

  const totalLC = lc?.totalSolved || 0;
  const totalCF = cf?.totalSolved || 0;
  const totalGFG = gfg?.totalSolved || 0;
  const aggregateSolves = totalLC + totalCF + totalGFG;

  // Difficulty aggregate
  const easyCount = (lc?.easySolved || 0) + (gfg?.breakdown?.easy || 0) + Math.round(totalCF * 0.4);
  const mediumCount = (lc?.mediumSolved || 0) + (gfg?.breakdown?.medium || 0) + Math.round(totalCF * 0.45);
  const hardCount = (lc?.hardSolved || 0) + (gfg?.breakdown?.hard || 0) + Math.round(totalCF * 0.15);

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

  // Combined recent submissions from LC & CF
  const combinedRecent: Array<{
    id: string;
    title: string;
    platform: 'LeetCode' | 'Codeforces';
    timeStr: string;
    url: string;
  }> = [];

  if (lc?.recentSubmissions) {
    lc.recentSubmissions.slice(0, 5).forEach((sub) => {
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
    cf.recentSubmissions.slice(0, 5).forEach((sub) => {
      combinedRecent.push({
        id: `cf-${sub.id}`,
        title: `${sub.problemIndex}. ${sub.problemName}`,
        platform: 'Codeforces',
        timeStr: new Date(sub.creationTimeSeconds * 1000).toLocaleDateString(),
        url: sub.contestId ? `https://codeforces.com/contest/${sub.contestId}/problem/${sub.problemIndex}` : 'https://codeforces.com'
      });
    });
  }

  return (
    <div className="space-y-6">
      
      {/* Top Profile Summary & Handles Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-dark-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Welcome back, <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">{profile.name}</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Tracker Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Centralized dashboard tracking algorithm consistency, problem sheets completion, and rating trajectory.
            </p>
          </div>

          {/* Connected Handles Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-800 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-slate-400 font-mono">LC:</span>
              <span className="text-slate-200 font-medium">{profile.handles.leetcode || 'Not Linked'}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-800 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-slate-400 font-mono">CF:</span>
              <span className="text-slate-200 font-medium">{profile.handles.codeforces || 'Not Linked'}</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-dark-900 border border-dark-800 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-400 font-mono">GFG:</span>
              <span className="text-slate-200 font-medium">{profile.handles.geeksforgeeks || 'Not Linked'}</span>
            </div>

            <button
              onClick={onOpenSync}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-colors"
            >
              Configure Handles
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Solved Aggregate */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Aggregated Solves</span>
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
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Code2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 tracking-tight">{totalLC}</div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Global Rank:</span>
            <span className="font-mono text-slate-200">#{lc?.ranking ? lc.ranking.toLocaleString() : 'N/A'}</span>
          </div>
        </div>

        {/* Codeforces Rating */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Codeforces Rating</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-blue-400 tracking-tight">
            {cf?.rating || 0}
            <span className="text-xs font-normal text-slate-400 ml-2">({cf?.rank || 'Unrated'})</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Max Rating:</span>
            <span className="font-mono text-cyan-300">{cf?.maxRating || 0} ({cf?.maxRank || 'N/A'})</span>
          </div>
        </div>

        {/* GeeksforGeeks Score */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-dark-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">GeeksforGeeks Score</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
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
              <h3 className="font-bold text-base text-white">Difficulty Breakdown</h3>
              <p className="text-xs text-slate-400">Distribution across all combined solves</p>
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
              <h3 className="font-bold text-base text-white">Solves by Platform</h3>
              <p className="text-xs text-slate-400">Volume distribution across competitive platforms</p>
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
              <h3 className="font-bold text-base text-white">Recent Accepted Submissions</h3>
              <p className="text-xs text-slate-400">Live solved problems queried from official APIs</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('curriculum')}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <span>Match with Curricula</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-dark-800/80">
          {combinedRecent.length > 0 ? (
            combinedRecent.map((sub) => (
              <div key={sub.id} className="py-3 flex items-center justify-between hover:bg-dark-900/40 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    sub.platform === 'LeetCode' 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {sub.platform}
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
              <p>No recent submissions synced yet. Click &quot;Configure Handles&quot; or &quot;Sync Data&quot; to fetch your real solves.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
