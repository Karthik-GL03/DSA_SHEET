'use client';

import React from 'react';
import { 
  Flame, 
  RefreshCw, 
  Bell, 
  Code2, 
  BookOpen, 
  Trophy, 
  FileText, 
  Users, 
  BarChart3, 
  Layers
} from 'lucide-react';
import { UserProfile } from '@/lib/types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: UserProfile;
  onOpenSync: () => void;
  onOpenNotifications: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  onOpenSync,
  onOpenNotifications,
  isSyncing
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'curriculum', label: 'Curricula (A2Z & NeetCode)', icon: BookOpen },
    { id: 'contests', label: 'Contest Radar', icon: Trophy },
    { id: 'notes', label: 'Revision Vault', icon: FileText },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-dark-800 bg-dark-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-dark-950 rounded-[10px] flex items-center justify-center">
                <Code2 className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  AlgoPulse
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Unified DSA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Automated Pedagogy & Streak Engine</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Streak Badge */}
          <div className="flex items-center gap-3">
            
            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-xs glow-amber">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse fill-amber-400" />
              <span>{profile.currentStreak} Days</span>
            </div>

            {/* Sync Platforms Button */}
            <button
              onClick={onOpenSync}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSyncing 
                  ? 'bg-dark-800 text-indigo-400 border border-indigo-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
              }`}
              title="Sync LeetCode, Codeforces, GFG"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
            </button>

            {/* Telegram Notification Settings */}
            <button
              onClick={onOpenNotifications}
              className={`p-2 rounded-lg text-xs font-medium border transition-colors ${
                profile.telegramChatId 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
                  : 'bg-dark-800 border-dark-700 text-slate-400 hover:text-white'
              }`}
              title="Telegram Alerts & Automation Setup"
            >
              <Bell className="w-4 h-4" />
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex items-center justify-around border-t border-dark-800/60 bg-dark-900/90 px-2 py-2 overflow-x-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] ${
                isActive ? 'text-indigo-400 font-semibold' : 'text-slate-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
