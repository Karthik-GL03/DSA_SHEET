'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

  // Latency telemetry
  const [latency, setLatency] = useState<{ leetcode: number | null; codeforces: number | null }>({
    leetcode: null,
    codeforces: null,
  });

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

  // Solved Slugs Set (purely populated from live API data & user checkboxes)
  const [solvedSlugs, setSolvedSlugs] = useState<Set<string>>(new Set());

  // Notes state
  const [notes, setNotes] = useState<ProblemNote[]>(INITIAL_NOTES);

  // Registered Contests Set
  const [registeredContests, setRegisteredContests] = useState<Set<string>>(new Set());

  // Contests list
  const [contests, setContests] = useState<ContestItem[]>([]);

  // Activity days (last 365 days) - starts clean, populated strictly by real API calendars
  const [activities, setActivities] = useState<DayActivity[]>(() => generateYearActivityData({}));

  // Dynamic streaks computed strictly from genuine activity data
  const { currentStreak, longestStreak, activeDays } = useMemo(() => {
    return calculateStreaks(activities);
  }, [activities]);

  // Keep ref to avoid stale state in auto-refresh timers
  const profileRef = useRef(profile);
  profileRef.current = profile;

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedProfile = getLocalStorage<UserProfile>('dsa_tracker_profile', DEFAULT_PROFILE);
    setProfile(savedProfile);

    const savedNotes = getLocalStorage<ProblemNote[]>('dsa_tracker_notes', INITIAL_NOTES);
    setNotes(savedNotes);

    const savedSlugs = getLocalStorage<string[]>('dsa_tracker_solved_slugs', []);
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

    // If handles exist, run live sync immediately
    if (savedProfile.handles.leetcode || savedProfile.handles.codeforces || savedProfile.handles.geeksforgeeks) {
      handleSync(savedProfile.handles);
    } else {
      // Default to live preset so the dashboard is interactive out-of-the-box
      handleQuickLoadPreset('neal_wu', 'neal');
    }
  }, []);

  // Set up 60-second real-time auto-sync polling
  useEffect(() => {
    const interval = setInterval(() => {
      const currentHandles = profileRef.current.handles;
      if (currentHandles.leetcode || currentHandles.codeforces || currentHandles.geeksforgeeks) {
        handleSync(currentHandles, true);
      }
    }, 60000);

    return () => clearInterval(interval);
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

  // Real-time Sync execution handler
  const handleSync = useCallback(async (
    handles: { leetcode: string; codeforces: string; geeksforgeeks: string },
    isBackground = false
  ) => {
    if (!isBackground) {
      setPlatformState(prev => ({ ...prev, isSyncing: true, syncErrors: {} }));
    }

    const errors: Record<string, string> = {};
    let lcData = null;
    let cfData = null;
    let gfgData = null;
    const newSlugs = new Set(solvedSlugs);
    let mergedCalendar: Record<string, number> = {};

    // 1. Sync LeetCode in Real Time
    if (handles.leetcode) {
      const tStart = performance.now();
      try {
        const res = await fetch(`/api/platforms/leetcode?username=${encodeURIComponent(handles.leetcode)}`);
        const tEnd = performance.now();
        setLatency(prev => ({ ...prev, leetcode: Math.round(tEnd - tStart) }));

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

    // 2. Sync Codeforces in Real Time
    if (handles.codeforces) {
      const tStart = performance.now();
      try {
        const res = await fetch(`/api/platforms/codeforces?handle=${encodeURIComponent(handles.codeforces)}`);
        const tEnd = performance.now();
        setLatency(prev => ({ ...prev, codeforces: Math.round(tEnd - tStart) }));

        const data = await res.json();
        if (res.ok && !data.error) {
          cfData = data;
          if (data.submissionCalendar) {
            // Merge Codeforces calendar
            for (const [day, count] of Object.entries(data.submissionCalendar)) {
              mergedCalendar[day] = (mergedCalendar[day] || 0) + (count as number);
            }
          }
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

    // 3. Sync GeeksforGeeks in Real Time
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

    // Update heatmap activities strictly from real merged calendar
    if (Object.keys(mergedCalendar).length > 0) {
      const generated = generateYearActivityData(mergedCalendar);
      setActivities(generated);
      const computed = calculateStreaks(generated);
      updateProfile({
        ...profileRef.current,
        handles,
        currentStreak: computed.currentStreak,
        longestStreak: computed.longestStreak,
      });
    }

    updateSolvedSlugs(newSlugs);

    setPlatformState(prev => ({
      leetcode: lcData || prev.leetcode,
      codeforces: cfData || prev.codeforces,
      geeksforgeeks: gfgData || prev.geeksforgeeks,
      lastSyncedAt: new Date().toLocaleTimeString(),
      isSyncing: false,
      syncErrors: errors,
    }));
  }, [solvedSlugs]);

  // Quick preset loader (e.g. Neal Wu or Tourist)
  const handleQuickLoadPreset = (lc: string, cf: string) => {
    const updated = {
      ...profile,
      name: cf ? `${cf}` : (lc || 'Competitor'),
      handles: {
        leetcode: lc,
        codeforces: cf,
        geeksforgeeks: '',
      }
    };
    updateProfile(updated);
    handleSync(updated.handles);
  };

  // Toggle problem solve status manually
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

  // Add / remove / update friends
  const handleAddFriend = (friend: FriendProfile) => {
    const updated = [...profile.friends, friend];
    updateProfile({ ...profile, friends: updated });
  };

  const handleRemoveFriend = (id: string) => {
    const updated = profile.friends.filter(f => f.id !== id);
    updateProfile({ ...profile, friends: updated });
  };

  const handleUpdateFriend = (id: string, partial: Partial<FriendProfile>) => {
    const updated = profile.friends.map(f => f.id === id ? { ...f, ...partial } : f);
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
              onQuickLoadPreset={handleQuickLoadPreset}
              latency={latency}
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
            onUpdateFriend={handleUpdateFriend}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-dark-800 bg-dark-900/60 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">AlgoPulse Tracker</span>
            <span>—</span>
            <span>Live Real-Time Multi-Platform DSA Tracker</span>
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
