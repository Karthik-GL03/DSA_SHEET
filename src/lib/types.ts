export type PlatformName = 'leetcode' | 'codeforces' | 'geeksforgeeks';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  handles: {
    leetcode: string;
    codeforces: string;
    geeksforgeeks: string;
  };
  telegramChatId: string;
  telegramBotToken?: string;
  telegramNotificationsEnabled: boolean;
  targetSolvesPerDay: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  notificationSettings: {
    missedDayAlert: boolean;
    streakAlert: boolean;
    contestAlert: boolean;
    weeklySummary: boolean;
  };
  friends: FriendProfile[];
}

export interface FriendProfile {
  id: string;
  name: string;
  handles: {
    leetcode: string;
    codeforces: string;
    geeksforgeeks: string;
  };
  totalSolved: number;
  streak: number;
  cfRating?: number;
}

export interface SolvedProblem {
  id: string;
  platform: PlatformName;
  slug: string;
  title: string;
  difficulty: Difficulty;
  solvedAt: string; // ISO date
  timestamp: number;
  url?: string;
  language?: string;
}

export interface DayActivity {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface LeetCodeProfileData {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
  streak: number;
  totalActiveDays: number;
  submissionCalendar: Record<string, number>; // timestamp -> count
  recentSubmissions: Array<{
    id: string;
    title: string;
    titleSlug: string;
    timestamp: string;
  }>;
}

export interface CodeforcesProfileData {
  handle: string;
  rating: number;
  maxRating: number;
  rank: string;
  maxRank: string;
  totalSolved: number;
  contribution: number;
  recentSubmissions: Array<{
    id: number;
    contestId?: number;
    problemName: string;
    problemIndex: string;
    verdict: string;
    creationTimeSeconds: number;
    tags: string[];
  }>;
  ratingHistory: Array<{
    contestId: number;
    contestName: string;
    rank: number;
    ratingUpdateTimeSeconds: number;
    oldRating: number;
    newRating: number;
  }>;
}

export interface GFGProfileData {
  handle: string;
  totalSolved: number;
  codingScore: number;
  breakdown: {
    school: number;
    basic: number;
    easy: number;
    medium: number;
    hard: number;
  };
}

export interface PlatformState {
  leetcode: LeetCodeProfileData | null;
  codeforces: CodeforcesProfileData | null;
  geeksforgeeks: GFGProfileData | null;
  lastSyncedAt: string | null;
  isSyncing: boolean;
  syncErrors: Record<string, string>;
}

export interface CurriculumProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  leetcodeSlug?: string;
  gfgSlug?: string;
  url?: string;
  pattern?: string;
  step?: number;
  stepTitle?: string;
  substep?: string;
  isSolved?: boolean;
}

export interface CurriculumCategory {
  category: string;
  step?: number;
  problems: CurriculumProblem[];
}

export interface ContestItem {
  id: string;
  platform: 'Codeforces' | 'LeetCode' | 'CodeChef' | 'AtCoder';
  name: string;
  startTime: string; // ISO date
  endTime: string;
  durationSeconds: number;
  url: string;
  isRegistered?: boolean;
}

export interface ProblemNote {
  id: string;
  problemSlug: string;
  problemTitle: string;
  platform: PlatformName;
  difficulty: Difficulty;
  content: string;
  approach?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}
