import { 
  UserProfile, 
  SolvedProblem, 
  DayActivity, 
  ProblemNote, 
  PlatformState, 
  LeetCodeProfileData, 
  CodeforcesProfileData, 
  GFGProfileData,
  ContestItem
} from './types';
import striverData from '@/data/curricula/striver-a2z.json';
import neetcodeData from '@/data/curricula/neetcode-150.json';

const STORAGE_KEYS = {
  USER_PROFILE: 'dsa_tracker_profile',
  SOLVED_PROBLEMS: 'dsa_tracker_solves',
  NOTES: 'dsa_tracker_notes',
  PLATFORM_DATA: 'dsa_tracker_platforms',
  REGISTERED_CONTESTS: 'dsa_tracker_registered_contests',
  CURRICULUM_PROGRESS: 'dsa_tracker_curriculum_progress',
};

// Default clean profile for real-time tracking
export const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_local_live',
  name: 'Competitive Coder',
  email: 'coder@dsa.dev',
  handles: {
    leetcode: '',
    codeforces: '',
    geeksforgeeks: '',
  },
  telegramChatId: '',
  telegramBotToken: '',
  telegramNotificationsEnabled: false,
  targetSolvesPerDay: 2,
  currentStreak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  notificationSettings: {
    missedDayAlert: true,
    streakAlert: true,
    contestAlert: true,
    weeklySummary: true,
  },
  friends: [
    {
      id: 'fr-1',
      name: 'Gennady (tourist)',
      handles: { leetcode: '', codeforces: 'tourist', geeksforgeeks: '' },
      totalSolved: 1420,
      streak: 5,
      cfRating: 3840
    },
    {
      id: 'fr-2',
      name: 'Neal Wu',
      handles: { leetcode: 'neal_wu', codeforces: 'neal', geeksforgeeks: '' },
      totalSolved: 980,
      streak: 8,
      cfRating: 2950
    }
  ]
};

// Initial notes for learning reference
export const INITIAL_NOTES: ProblemNote[] = [
  {
    id: 'note-1',
    problemSlug: 'trapping-rain-water',
    problemTitle: 'Trapping Rain Water',
    platform: 'leetcode',
    difficulty: 'Hard',
    content: 'Classic two-pointer approach keeping track of maxLeft and maxRight. Move pointer pointing to smaller maximum wall inwards because that wall is the bottleneck.',
    approach: 'Two Pointers converging from left and right.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    tags: ['Two-Pointers', 'Dynamic-Programming', 'Must-Revise'],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Helper to get from LocalStorage safely in Next.js (client side)
export function getLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

// Helper to set to LocalStorage safely
export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
}

// Generate last 365 days activity map strictly from genuine submission timestamps
export function generateYearActivityData(submissionCalendar: Record<string, number> = {}): DayActivity[] {
  const dateCounts: Record<string, number> = {};

  for (const [tsStr, count] of Object.entries(submissionCalendar)) {
    const tsNum = Number(tsStr);
    if (!isNaN(tsNum) && count > 0) {
      const ms = tsNum > 1e11 ? tsNum : tsNum * 1000;
      const d = new Date(ms);
      const dateKey = d.toISOString().split('T')[0];
      dateCounts[dateKey] = (dateCounts[dateKey] || 0) + count;
    }
  }

  const days: DayActivity[] = [];
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = dateCounts[dateStr] || 0;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count > 0 && count <= 2) level = 1;
    else if (count > 2 && count <= 4) level = 2;
    else if (count > 4 && count <= 7) level = 3;
    else if (count > 7) level = 4;

    days.push({
      date: dateStr,
      count,
      level,
    });
  }

  return days;
}

// Calculate streaks in real time from activity days
export function calculateStreaks(activities: DayActivity[]): { currentStreak: number; longestStreak: number; activeDays: number } {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let activeDays = 0;

  for (let i = 0; i < activities.length; i++) {
    if (activities[i].count > 0) {
      activeDays++;
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  const lastIndex = activities.length - 1;
  if (lastIndex >= 0) {
    if (activities[lastIndex].count > 0) {
      for (let i = lastIndex; i >= 0; i--) {
        if (activities[i].count > 0) currentStreak++;
        else break;
      }
    } else if (lastIndex > 0 && activities[lastIndex - 1].count > 0) {
      for (let i = lastIndex - 1; i >= 0; i--) {
        if (activities[i].count > 0) currentStreak++;
        else break;
      }
    }
  }

  return { currentStreak, longestStreak, activeDays };
}

// Cross-reference solved problem slugs with Striver and NeetCode curricula
export function matchSolvedCurriculum(solvedSlugs: Set<string>) {
  // 1. NeetCode 150 matching
  const neetcodeCategories = (neetcodeData as any[]).map(cat => {
    let catSolved = 0;
    const problems = cat.problems.map((prob: any) => {
      const isSolved = solvedSlugs.has(prob.leetcodeSlug?.toLowerCase()) || 
                       solvedSlugs.has(prob.title.toLowerCase().replace(/[^a-z0-9]/g, '-'));
      if (isSolved) catSolved++;
      return {
        ...prob,
        isSolved
      };
    });

    return {
      category: cat.category,
      total: problems.length,
      solved: catSolved,
      percent: Math.round((catSolved / problems.length) * 100),
      problems
    };
  });

  // 2. Striver A2Z matching
  const striverSteps = (striverData as any[]).map(step => {
    let stepSolved = 0;
    let stepTotal = 0;

    const substeps = step.substeps.map((sub: any) => {
      let subSolved = 0;
      const problems = sub.problems.map((prob: any) => {
        stepTotal++;
        const isSolved = (prob.leetcodeSlug && solvedSlugs.has(prob.leetcodeSlug.toLowerCase())) ||
                         (prob.gfgSlug && solvedSlugs.has(prob.gfgSlug.toLowerCase())) ||
                         solvedSlugs.has(prob.title.toLowerCase().replace(/[^a-z0-9]/g, '-'));
        if (isSolved) {
          stepSolved++;
          subSolved++;
        }
        return {
          ...prob,
          isSolved
        };
      });

      return {
        title: sub.title,
        problems,
        total: problems.length,
        solved: subSolved,
        percent: Math.round((subSolved / problems.length) * 100)
      };
    });

    return {
      step: step.step,
      title: step.title,
      substeps,
      total: stepTotal,
      solved: stepSolved,
      percent: stepTotal > 0 ? Math.round((stepSolved / stepTotal) * 100) : 0
    };
  });

  // 3. Identify Weak Topics (completion rate < 40%)
  const weakTopics: Array<{ name: string; framework: string; percent: number; solved: number; total: number }> = [];

  neetcodeCategories.forEach(cat => {
    if (cat.percent < 40) {
      weakTopics.push({
        name: cat.category,
        framework: 'NeetCode 150',
        percent: cat.percent,
        solved: cat.solved,
        total: cat.total
      });
    }
  });

  striverSteps.forEach(step => {
    if (step.percent < 40) {
      weakTopics.push({
        name: step.title,
        framework: 'Striver A2Z',
        percent: step.percent,
        solved: step.solved,
        total: step.total
      });
    }
  });

  return {
    neetcodeCategories,
    striverSteps,
    weakTopics: weakTopics.sort((a, b) => a.percent - b.percent)
  };
}
