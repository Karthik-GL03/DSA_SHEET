'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { 
  getSupabase, 
  isSupabaseConfigured, 
  saveCustomSupabaseConfig, 
  getStoredSupabaseConfig 
} from '@/lib/supabase';
import { 
  X, 
  User, 
  Target, 
  Globe, 
  Database, 
  ShieldCheck, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  Key
} from 'lucide-react';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onSignOut: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces',
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onSignOut
}) => {
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio || 'Mastering Data Structures & Algorithms with consistency');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || AVATAR_PRESETS[0]);
  const [targetSolves, setTargetSolves] = useState(profile.targetSolvesPerDay);
  const [timezone, setTimezone] = useState(profile.timezone || 'Asia/Kolkata');

  // Supabase connection credentials
  const currentDbConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentDbConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentDbConfig.key);
  const [dbStatusMsg, setDbStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: name.trim(),
      bio: bio.trim(),
      avatarUrl,
      targetSolvesPerDay: Number(targetSolves),
      timezone,
    });
    onClose();
  };

  const handleConnectSupabase = async () => {
    setDbStatusMsg(null);
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      saveCustomSupabaseConfig('', '');
      setDbStatusMsg({ text: 'Reverted to local-only storage mode.', isError: false });
      return;
    }

    try {
      const client = saveCustomSupabaseConfig(supabaseUrl.trim(), supabaseAnonKey.trim());
      if (client) {
        // Quick ping to check validity
        const { error } = await client.from('users').select('count', { count: 'exact', head: true });
        if (error && error.code !== 'PGRST116') {
          // It connected even if table is empty or head query
        }
        setDbStatusMsg({ text: 'Supabase PostgreSQL connected and verified!', isError: false });
      }
    } catch (err: any) {
      setDbStatusMsg({ text: `Connection error: ${err.message || 'Invalid keys'}`, isError: true });
    }
  };

  const isCloudConnected = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-dark-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">User Profile &amp; Cloud Sync</h3>
              <p className="text-xs text-slate-400">Manage account credentials, goals, and database connections</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-5">
          
          {/* Avatar & Basic Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-dark-900/60 border border-dark-800">
            <img
              src={avatarUrl}
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md shrink-0"
            />
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-300 mb-1">Pick Avatar Preset</label>
              <div className="flex items-center gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-transform hover:scale-110 ${
                      avatarUrl === preset ? 'border-indigo-400 scale-105' : 'border-dark-700 opacity-60'
                    }`}
                  >
                    <img src={preset} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Full Name & Bio */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name / Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-dark-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Role / Coding Goal</label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Targeting FAANG & Striver A2Z completion"
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-dark-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Goal & Timezone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Daily Target Solves</label>
              <select
                value={targetSolves}
                onChange={(e) => setTargetSolves(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-dark-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>1 Problem / day (Casual)</option>
                <option value={2}>2 Problems / day (Consistent)</option>
                <option value={3}>3 Problems / day (Aggressive)</option>
                <option value={5}>5 Problems / day (Intensive Prep)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Local Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-dark-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los Angeles (PST/PDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
              </select>
            </div>
          </div>

          {/* Supabase PostgreSQL Cloud Sync Section */}
          <div className="p-4 rounded-xl bg-dark-900/80 border border-dark-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Supabase Cloud Persistence
                </span>
              </div>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                isCloudConnected ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-dark-800 text-slate-400'
              }`}>
                {isCloudConnected ? '● Cloud Connected' : 'Local Browser Mode'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Connect your free Supabase project to sync solves, notes, and consistency streaks in real time across your laptop and mobile device.
            </p>

            <div className="space-y-2">
              <div>
                <label className="block text-[11px] font-mono text-slate-400">Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-1.5 rounded-lg bg-dark-950 border border-dark-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400">anon / public key</label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                  className="w-full px-3 py-1.5 rounded-lg bg-dark-950 border border-dark-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleConnectSupabase}
                className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-indigo-300 border border-dark-700 text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Test &amp; Update Database Keys</span>
              </button>

              {dbStatusMsg && (
                <div className={`mt-2 text-xs flex items-center gap-1.5 ${
                  dbStatusMsg.isError ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {dbStatusMsg.isError ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{dbStatusMsg.text}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-dark-800">
            <button
              type="button"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-dark-800 text-slate-300 text-xs font-medium hover:bg-dark-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all"
              >
                Save Profile Details
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
