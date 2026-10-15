'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { TodayCheckInBanner } from '@/components/TodayCheckInBanner';
import { ActivityHeatmap } from '@/components/ActivityHeatmap';
import { DashboardOverview } from '@/components/DashboardOverview';
import { CurriculumTracker } from '@/components/CurriculumTracker';
import { WeakTopicsAnalysis } from '@/components/WeakTopicsAnalysis';
import { ContestRadar } from '@/components/ContestRadar';
import { NotesVault } from '@/components/NotesVault';
import { FriendsLeaderboard } from '@/components/FriendsLeaderboard';
import { PlatformSyncModal } from '@/components/PlatformSyncModal';
import { NotificationSettingsModal } from '@/components/NotificationSettingsModal';

import { 
  UserProfile, 
  PlatformState, 
  ProblemNote, 
  ContestItem, 
  CurriculumProblem, 
  FriendProfile, 
  DayActivity 
} from '@/lib/types';
import { 
  DEFAULT_PROFILE, 
  INITIAL_NOTES, 
  getLocalStorage, 
  setLocalStorage, 
  generateYearActivityData, 
  calculateStreaks, 
  matchSolvedCurriculum 
} from '@/lib/storage';

import striverData from '@/data/curricula/striver-a2z.json';
import neetcodeData from '@/data/curricula/neetcode-150.json';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);
  const [activeNoteToEdit, setActiveNoteToEdit] = useState<ProblemNote | null>(null);

  // User Profile State
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Platform Sync State
  const [platformState, setPlatformState] = useState<PlatformState>({
    leetcode: null,
    codeforces: null,
    geeksforgeeks: null,
    lastSyncedAt: null,
    isSyncing: false,
    syncErrors: {},
  });

  // Solved Slugs Set
  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set([
    'two-sum',
    'valid-anagram',
    'contains-duplicate',
    'binary-search',
    'reverse-linked-list',
    'valid-parentheses',
    'maximum-subarray',
    'climbing-stairs',
    'best-time-to-buy-and-sell-stock',
    'invert-binary-tree',
    'single-number',
    'merge-two-sorted-lists',
    'search-a-2d-matrix',
    'koko-eating-bananas',
    '3sum'
  ]));

  // Notes state
  const [notes, setNotes] = useState<ProblemNote[]>(INITIAL_NOTES);

  // Registered Contests Set
  const [registeredContests, setRegisteredContests] = useState<Set<string>>(new Set());

  // Contests list
  const [contests, setContests] = useState<ContestItem[]>([]);

  // Activity days (last 365 days)
  const [activities, setActivities] = useState<DayActivity[]>(() => {
    // Generate initial realistic sample distribution
    const sampleCalendar: Record<string, number> = {};
    const now = Math.floor(Date.now() / 1000);
    // Add solves on recent days
    for (let i = 0; i < 45; i++) {
      if (Math.random() > 0.25) {
        sampleCalendar[(now - i * 86400).toString()] = Math.floor(Math.random() * 4) + 1;
      }
    }
    return generateYearActivityData(sampleCalendar);
  });

  // Streak calculations
  const { currentStreak, longestStreak, activeDays } = useMemo(() => {
    return calculateStreaks(activities);
  }, [activities]);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedProfile = getLocalStorage<UserProfile>('dsa_tracker_profile', DEFAULT_PROFILE);
    setProfile(savedProfile);

    const savedNotes = getLocalStorage<ProblemNote[]>('dsa_tracker_notes', INITIAL_NOTES);
    setNotes(savedNotes);

    const savedSlugs = getLocalStorage<string[]>('dsa_tracker_solved_slugs', Array.from(solvedSlugs));
    setSolvedSlugs(new Set(savedSlugs));

    const savedRegistered = getLocalStorage<string[]>('dsa_tracker_registered_contests', []);
    setRegisteredContests(new Set(savedRegistered));

    // Fetch upcoming contests
    fetch('/api/platforms/contests')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setContests(data);
      })
      .catch(err => console.error('Error fetching contests:', err));

    // Initial platform sync with default or stored handles
    handleSync(savedProfile.handles);
  }, []);

  // Save changes to localStorage
  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setLocalStorage('dsa_tracker_profile', newProfile);
  };

  const updateNotes = (newNotes: ProblemNote[]) => {
    setNotes(newNotes);
    setLocalStorage('dsa_tracker_notes', newNotes);
  };

  const updateSolvedSlugs = (newSlugs: Set<string>) => {
    setSolvedSlugs(newSlugs);
    setLocalStorage('dsa_tracker_solved_slugs', Array.from(newSlugs));
  };

  // Sync execution handler
  const handleSync = useCallback(async (handles: { leetcode: string; codeforces: string; geeksforgeeks: string }) => {
    setPlatformState(prev => ({ ...prev, isSyncing: true, syncErrors: {} }));
    const errors: Record<string, string> = {};

    let lcData = null;
    let cfData = null;
    let gfgData = null;
    const newSlugs = new Set(solvedSlugs);
    let mergedCalendar: Record<string, number> = {};

    // 1. Sync LeetCode
    if (handles.leetcode) {
      try {
        const res = await fetch(`/api/platforms/leetcode?username=${encodeURIComponent(handles.leetcode)}`);
        const data = await res.json();
        if (res.ok && !data.error) {
          lcData = data;
          if (data.submissionCalendar) {
            mergedCalendar = { ...mergedCalendar, ...data.submissionCalendar };
          }
          if (Array.isArray(data.recentSubmissions)) {
            data.recentSubmissions.forEach((s: any) => {
              if (s.titleSlug) newSlugs.add(s.titleSlug.toLowerCase());
            });
          }
        } else {
          errors.leetcode = data.error || 'Failed to fetch LeetCode profile';
        }
      } catch (e: any) {
        errors.leetcode = e.message || 'LeetCode network error';
      }
    }

    // 2. Sync Codeforces
    if (handles.codeforces) {
      try {
        const res = await fetch(`/api/platforms/codeforces?handle=${encodeURIComponent(handles.codeforces)}`);
        const data = await res.json();
        if (res.ok && !data.error) {
          cfData = data;
          if (Array.isArray(data.recentSubmissions)) {
            data.recentSubmissions.forEach((s: any) => {
              const cfSlug = s.problemName?.toLowerCase().replace(/[^a-z0-9]/g, '-');
              if (cfSlug) newSlugs.add(cfSlug);
            });
          }
        } else {
          errors.codeforces = data.error || 'Failed to fetch Codeforces profile';
        }
      } catch (e: any) {
        errors.codeforces = e.message || 'Codeforces network error';
      }
    }

    // 3. Sync GeeksforGeeks
    if (handles.geeksforgeeks) {
      try {
        const res = await fetch(`/api/platforms/gfg?handle=${encodeURIComponent(handles.geeksforgeeks)}`);
        const data = await res.json();
        if (res.ok && !data.error) {
          gfgData = data;
        } else {
          errors.geeksforgeeks = data.error || 'Failed to parse GFG profile';
        }
      } catch (e: any) {
        errors.geeksforgeeks = e.message || 'GFG network error';
      }
    }

    // Update heatmap activities if calendar is available
    if (Object.keys(mergedCalendar).length > 0) {
      const generated = generateYearActivityData(mergedCalendar);
      setActivities(generated);
    }

    updateSolvedSlugs(newSlugs);

    setPlatformState({
      leetcode: lcData || platformState.leetcode,
      codeforces: cfData || platformState.codeforces,
      geeksforgeeks: gfgData || platformState.geeksforgeeks,
      lastSyncedAt: new Date().toLocaleTimeString(),
      isSyncing: false,
      syncErrors: errors,
    });
  }, [solvedSlugs, platformState.leetcode, platformState.codeforces, platformState.geeksforgeeks]);

  // Toggle problem solve status manually or via checkbox
  const handleToggleSolve = (slug: string, solved: boolean) => {
    const nextSlugs = new Set(solvedSlugs);
    if (solved) {
      nextSlugs.add(slug.toLowerCase());
    } else {
      nextSlugs.delete(slug.toLowerCase());
    }
    updateSolvedSlugs(nextSlugs);
  };

  // Quick Solve record today
  const handleQuickLogSolve = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setActivities(prev => {
      const updated = [...prev];
      const todayIdx = updated.findIndex(d => d.date === todayStr);
      if (todayIdx !== -1) {
        const newCount = updated[todayIdx].count + 1;
        const newLevel = newCount > 7 ? 4 : newCount > 4 ? 3 : newCount > 2 ? 2 : 1;
        updated[todayIdx] = {
          ...updated[todayIdx],
          count: newCount,
          level: newLevel as any,
        };
      }
      return updated;
    });

    // Update profile streak
    updateProfile({
      ...profile,
      currentStreak: profile.currentStreak + 1,
      longestStreak: Math.max(profile.longestStreak, profile.currentStreak + 1),
      lastActiveDate: todayStr,
    });
  };

  // Note management
  const handleSaveNote = (note: ProblemNote) => {
    const existingIdx = notes.findIndex(n => n.id === note.id);
    let nextNotes: ProblemNote[];
    if (existingIdx !== -1) {
      nextNotes = [...notes];
      nextNotes[existingIdx] = note;
    } else {
      nextNotes = [note, ...notes];
    }
    updateNotes(nextNotes);
  };

  const handleDeleteNote = (id: string) => {
    const nextNotes = notes.filter(n => n.id !== id);
    updateNotes(nextNotes);
  };

  const handleOpenNoteForProblem = (problem: CurriculumProblem) => {
    setActiveNoteToEdit({
      id: `note-${Date.now()}`,
      problemTitle: problem.title,
      problemSlug: problem.leetcodeSlug || problem.gfgSlug || problem.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      platform: 'leetcode',
      difficulty: problem.difficulty,
      approach: problem.pattern || '',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)',
      tags: [problem.pattern || 'Curriculum-Problem', 'Must-Revise'],
      content: '',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setActiveTab('notes');
  };

  // Contest reminder toggle
  const handleToggleRegisterContest = (contestId: string) => {
    const nextSet = new Set(registeredContests);
    if (nextSet.has(contestId)) {
      nextSet.delete(contestId);
    } else {
      nextSet.add(contestId);
      // If Telegram is enabled, send instant reminder confirmation
      if (profile.telegramNotificationsEnabled && profile.telegramBotToken && profile.telegramChatId) {
        fetch('/api/notify/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botToken: profile.telegramBotToken,
            chatId: profile.telegramChatId,
            message: `🏆 *Contest Reminder Set*\n\nYou have registered reminder for contest \`${contestId}\`. You will receive alerts 24h & 2h before start time!`,
            type: 'contest_alert'
          })
        }).catch(err => console.error('Failed to send contest reminder Telegram message:', err));
      }
    }
    setRegisteredContests(nextSet);
    setLocalStorage('dsa_tracker_registered_contests', Array.from(nextSet));
  };

  // Add / remove friends
  const handleAddFriend = (friend: FriendProfile) => {
    const updated = [...profile.friends, friend];
    updateProfile({ ...profile, friends: updated });
  };

  const handleRemoveFriend = (id: string) => {
    const updated = profile.friends.filter(f => f.id !== id);
    updateProfile({ ...profile, friends: updated });
  };

  // Match solved problems with curricula & weak topics
  const { neetcodeCategories, striverSteps, weakTopics } = useMemo(() => {
    return matchSolvedCurriculum(solvedSlugs);
  }, [solvedSlugs]);

  // Today's solve count
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySolves = activities.find(d => d.date === todayStr)?.count || 0;

  // Aggregate user solves
  const totalUserSolves = (platformState.leetcode?.totalSolved || 0) + 
                          (platformState.codeforces?.totalSolved || 0) + 
                          (platformState.geeksforgeeks?.totalSolved || 0);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        onOpenSync={() => setIsSyncModalOpen(true)}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        isSyncing={platformState.isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Today's Streak Banner & Call-to-action */}
        <TodayCheckInBanner
          todaySolves={todaySolves}
          targetSolves={profile.targetSolvesPerDay}
          currentStreak={profile.currentStreak}
          onExploreProblems={() => setActiveTab('curriculum')}
          onQuickLogSolve={handleQuickLogSolve}
        />

        {/* 365-day Activity Heatmap */}
        <ActivityHeatmap
          activities={activities}
          currentStreak={profile.currentStreak}
          longestStreak={profile.longestStreak}
          totalActiveDays={activeDays}
        />

        {/* TAB 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <DashboardOverview
              profile={profile}
              platformState={platformState}
              solves={[]}
              onOpenSync={() => setIsSyncModalOpen(true)}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />

            {/* Weak Topics Section on Dashboard */}
            <WeakTopicsAnalysis
              weakTopics={weakTopics}
              onSelectTopic={(topicName) => {
                setActiveTab('curriculum');
              }}
            />
          </div>
        )}

        {/* TAB 2: Curriculum Tracker */}
        {activeTab === 'curriculum' && (
          <div className="space-y-8">
            <CurriculumTracker
              neetcodeData={neetcodeData}
              striverData={striverData}
              solvedSlugs={solvedSlugs}
              onToggleSolve={handleToggleSolve}
              onOpenNoteModal={handleOpenNoteForProblem}
            />

            <WeakTopicsAnalysis
              weakTopics={weakTopics}
              onSelectTopic={() => {}}
            />
          </div>
        )}

        {/* TAB 3: Contest Radar */}
        {activeTab === 'contests' && (
          <ContestRadar
            contests={contests}
            cfProfile={platformState.codeforces}
            registeredContests={registeredContests}
            onToggleRegister={handleToggleRegisterContest}
          />
        )}

        {/* TAB 4: Revision Notes Vault */}
        {activeTab === 'notes' && (
          <NotesVault
            notes={notes}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            activeNoteToEdit={activeNoteToEdit}
            setActiveNoteToEdit={setActiveNoteToEdit}
          />
        )}

        {/* TAB 5: Friends Leaderboard */}
        {activeTab === 'leaderboard' && (
          <FriendsLeaderboard
            profile={profile}
            totalUserSolves={totalUserSolves}
            userRating={platformState.codeforces?.rating || 1540}
            onAddFriend={handleAddFriend}
            onRemoveFriend={handleRemoveFriend}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 bg-dark-900/60 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">AlgoPulse Tracker</span>
            <span>—</span>
            <span>Zero-Cost Unified DSA Pedagogy &amp; Automation Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>LeetCode GraphQL</span>
            <span>•</span>
            <span>Codeforces REST</span>
            <span>•</span>
            <span>GFG TLS Scraper</span>
            <span>•</span>
            <span>Telegram Bot API</span>
          </div>
        </div>
      </footer>

      {/* Platform Handles Sync Modal */}
      <PlatformSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        profile={profile}
        platformState={platformState}
        onSaveHandles={(handles) => {
          updateProfile({ ...profile, handles });
        }}
        onTriggerSync={handleSync}
      />

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        profile={profile}
        onSaveNotificationSettings={(settings) => {
          updateProfile({
            ...profile,
            telegramBotToken: settings.telegramBotToken,
            telegramChatId: settings.telegramChatId,
            telegramNotificationsEnabled: settings.telegramNotificationsEnabled,
            notificationSettings: settings.notificationSettings,
          });
        }}
      />

    </div>
  );
}
