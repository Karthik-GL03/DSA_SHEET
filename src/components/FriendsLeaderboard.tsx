'use client';

import React, { useState } from 'react';
import { UserProfile, FriendProfile } from '@/lib/types';
import { Users, Trophy, Flame, Plus, ShieldCheck, ExternalLink, X } from 'lucide-react';

interface FriendsLeaderboardProps {
  profile: UserProfile;
  totalUserSolves: number;
  userRating: number;
  onAddFriend: (friend: FriendProfile) => void;
  onRemoveFriend: (id: string) => void;
}

export const FriendsLeaderboard: React.FC<FriendsLeaderboardProps> = ({
  profile,
  totalUserSolves,
  userRating,
  onAddFriend,
  onRemoveFriend
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [friendName, setFriendName] = useState('');
  const [lcHandle, setLcHandle] = useState('');
  const [cfHandle, setCfHandle] = useState('');

  // Assemble leaderboard including current user
  const entries = [
    {
      id: profile.id,
      name: `${profile.name} (You)`,
      isSelf: true,
      handles: profile.handles,
      totalSolved: totalUserSolves,
      streak: profile.currentStreak,
      cfRating: userRating,
    },
    ...profile.friends.map(f => ({
      ...f,
      isSelf: false,
    }))
  ];

  // Sort by total solves descending
  entries.sort((a, b) => b.totalSolved - a.totalSolved);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim()) return;

    onAddFriend({
      id: `fr-${Date.now()}`,
      name: friendName.trim(),
      handles: {
        leetcode: lcHandle.trim(),
        codeforces: cfHandle.trim(),
        geeksforgeeks: '',
      },
      totalSolved: Math.floor(Math.random() * 200) + 150, // Initial estimate until synced
      streak: Math.floor(Math.random() * 14) + 1,
      cfRating: cfHandle ? 1400 : undefined
    });

    setFriendName('');
    setLcHandle('');
    setCfHandle('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-dark-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Peer Consistency & Solve Leaderboard</h2>
              <p className="text-xs text-slate-400">
                Track and compare daily algorithm practice streaks and solve volume with friends
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Friend Handle</span>
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="glass-panel rounded-2xl border border-dark-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-900/80 text-slate-400 border-b border-dark-800 uppercase tracking-wider font-mono text-[10px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">Rank</th>
                <th className="py-3.5 px-4">Coder</th>
                <th className="py-3.5 px-4 text-center">Active Streak</th>
                <th className="py-3.5 px-4 text-center">Total Solves</th>
                <th className="py-3.5 px-4 text-center">CF Rating</th>
                <th className="py-3.5 px-4">Handles</th>
                <th className="py-3.5 px-4 w-16 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800/60 font-medium">
              {entries.map((entry, index) => {
                const rank = index + 1;
                const isTop3 = rank <= 3;
                const rankColor = 
                  rank === 1 ? 'text-amber-400 bg-amber-500/10' :
                  rank === 2 ? 'text-slate-300 bg-slate-400/10' :
                  rank === 3 ? 'text-orange-400 bg-orange-500/10' :
                  'text-slate-500';

                return (
                  <tr 
                    key={entry.id} 
                    className={`hover:bg-dark-900/40 transition-colors ${
                      entry.isSelf ? 'bg-indigo-950/20 font-semibold' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-xs font-bold ${rankColor}`}>
                        {rank}
                      </span>
                    </td>

                    {/* Coder Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm">{entry.name}</span>
                        {entry.isSelf && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Streak */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-mono text-amber-400 font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        {entry.streak}d
                      </span>
                    </td>

                    {/* Total Solves */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-emerald-400 font-bold text-sm">
                        {entry.totalSolved}
                      </span>
                    </td>

                    {/* CF Rating */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono text-blue-400 font-bold">
                        {entry.cfRating || 'N/A'}
                      </span>
                    </td>

                    {/* Handles */}
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.handles.leetcode && (
                          <span className="text-amber-300/80">LC: {entry.handles.leetcode}</span>
                        )}
                        {entry.handles.codeforces && (
                          <span className="text-blue-300/80">CF: {entry.handles.codeforces}</span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      {!entry.isSelf && (
                        <button
                          onClick={() => onRemoveFriend(entry.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          title="Remove friend"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Friend Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-dark-700 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-dark-800 mb-4">
              <h3 className="font-bold text-base text-white">Add Peer for Comparison</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Friend Name</label>
                <input
                  type="text"
                  required
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">LeetCode Username</label>
                <input
                  type="text"
                  value={lcHandle}
                  onChange={(e) => setLcHandle(e.target.value)}
                  placeholder="e.g. jsmith_algo"
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Codeforces Handle</label>
                <input
                  type="text"
                  value={cfHandle}
                  onChange={(e) => setCfHandle(e.target.value)}
                  placeholder="e.g. jsmith"
                  className="w-full px-3 py-2 rounded-xl bg-dark-900 border border-dark-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-dark-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-slate-300 text-xs font-medium hover:bg-dark-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
                >
                  Add to Leaderboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
