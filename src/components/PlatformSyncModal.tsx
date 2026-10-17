'use client';

import React, { useState } from 'react';
import { UserProfile, PlatformState } from '@/lib/types';
import { 
  X, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  Trophy, 
  TrendingUp, 
  ShieldCheck,
  Server
} from 'lucide-react';
import { LeetCodeIcon, CodeforcesIcon, GeeksforGeeksIcon } from './BrandIcons';

interface PlatformSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  platformState: PlatformState;
  onSaveHandles: (handles: { leetcode: string; codeforces: string; geeksforgeeks: string }) => void;
  onTriggerSync: (handles: { leetcode: string; codeforces: string; geeksforgeeks: string }) => Promise<void>;
}

export const PlatformSyncModal: React.FC<PlatformSyncModalProps> = ({
  isOpen,
  onClose,
  profile,
  platformState,
  onSaveHandles,
  onTriggerSync
}) => {
  const [lcHandle, setLcHandle] = useState(profile.handles.leetcode);
  const [cfHandle, setCfHandle] = useState(profile.handles.codeforces);
  const [gfgHandle, setGfgHandle] = useState(profile.handles.geeksforgeeks);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newHandles = {
      leetcode: lcHandle.trim(),
      codeforces: cfHandle.trim(),
      geeksforgeeks: gfgHandle.trim()
    };
    onSaveHandles(newHandles);
    await onTriggerSync(newHandles);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-dark-700 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Coding Platforms Synchronization</h3>
              <p className="text-xs text-slate-400">Configure your public handles to auto-aggregate solves</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSyncSubmit} className="space-y-4">
          
          {/* LeetCode Input */}
          <div className="p-4 rounded-xl bg-dark-900/80 border border-dark-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <LeetCodeIcon className="w-4 h-4" />
                <label className="text-xs font-bold text-white uppercase tracking-wider">LeetCode</label>
              </div>
              <span className="text-[10px] font-mono text-slate-400">GraphQL Server Proxy</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={lcHandle}
                onChange={(e) => setLcHandle(e.target.value)}
                placeholder="Enter LeetCode username (e.g. neal_wu)"
                className="flex-1 px-3 py-2 rounded-xl bg-dark-950 border border-dark-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            {platformState.leetcode && (
              <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified: {platformState.leetcode.totalSolved} solved • Global rank #{platformState.leetcode.ranking.toLocaleString()}</span>
              </div>
            )}
            {platformState.syncErrors?.leetcode && (
              <div className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{platformState.syncErrors.leetcode}</span>
              </div>
            )}
          </div>

          {/* Codeforces Input */}
          <div className="p-4 rounded-xl bg-dark-900/80 border border-dark-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CodeforcesIcon className="w-4 h-4" />
                <label className="text-xs font-bold text-white uppercase tracking-wider">Codeforces</label>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Official REST API (1 req/2s)</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={cfHandle}
                onChange={(e) => setCfHandle(e.target.value)}
                placeholder="Enter Codeforces handle (e.g. tourist, neal)"
                className="flex-1 px-3 py-2 rounded-xl bg-dark-950 border border-dark-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            {platformState.codeforces && (
              <div className="mt-2 text-[11px] text-blue-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Rating: {platformState.codeforces.rating} ({platformState.codeforces.rank}) • {platformState.codeforces.totalSolved} solves</span>
              </div>
            )}
            {platformState.syncErrors?.codeforces && (
              <div className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{platformState.syncErrors.codeforces}</span>
              </div>
            )}
          </div>

          {/* GeeksforGeeks Input */}
          <div className="p-4 rounded-xl bg-dark-900/80 border border-dark-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <GeeksforGeeksIcon className="w-4 h-4" />
                <label className="text-xs font-bold text-white uppercase tracking-wider">GeeksforGeeks</label>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Cloudflare-Resilient Scraper</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={gfgHandle}
                onChange={(e) => setGfgHandle(e.target.value)}
                placeholder="Enter GFG handle"
                className="flex-1 px-3 py-2 rounded-xl bg-dark-950 border border-dark-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            {platformState.geeksforgeeks && (
              <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Coding Score: {platformState.geeksforgeeks.codingScore} • Solved: {platformState.geeksforgeeks.totalSolved}</span>
              </div>
            )}
          </div>

          {/* Sync status info */}
          <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero credentials stored: Data is extracted only from public profile endpoints.</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-dark-800 text-slate-300 text-xs font-medium hover:bg-dark-700"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSubmitting || platformState.isSyncing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting || platformState.isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSubmitting || platformState.isSyncing ? 'Fetching Platform Data...' : 'Save & Sync All'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
