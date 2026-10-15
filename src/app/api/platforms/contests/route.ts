import { NextResponse } from 'next/server';
import { ContestItem } from '@/lib/types';

export async function GET() {
  const contests: ContestItem[] = [];

  try {
    // 1. Fetch Codeforces contests
    const cfRes = await fetch('https://codeforces.com/api/contest.list?gym=false', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 600 }
    });
    const cfData = await cfRes.json();

    if (cfData.status === 'OK' && Array.isArray(cfData.result)) {
      const upcoming = cfData.result
        .filter((c: any) => c.phase === 'BEFORE')
        .sort((a: any, b: any) => a.startTimeSeconds - b.startTimeSeconds)
        .slice(0, 8);

      for (const c of upcoming) {
        const start = new Date(c.startTimeSeconds * 1000);
        const end = new Date((c.startTimeSeconds + c.durationSeconds) * 1000);
        contests.push({
          id: `cf-${c.id}`,
          platform: 'Codeforces',
          name: c.name,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          durationSeconds: c.durationSeconds,
          url: `https://codeforces.com/contest/${c.id}`
        });
      }
    }
  } catch (err) {
    console.warn('Could not fetch Codeforces contests, using fallback schedules:', err);
  }

  // 2. Add LeetCode Weekly and Biweekly predictable contest schedule
  // LeetCode Weekly: Every Sunday 02:30 UTC
  // LeetCode Biweekly: Every alternate Saturday 14:30 UTC
  const now = new Date();
  
  // Calculate next Sunday 02:30 UTC
  const nextSunday = new Date(now);
  nextSunday.setUTCDate(now.getUTCDate() + ((7 - now.getUTCDay()) % 7 || 7));
  nextSunday.setUTCHours(2, 30, 0, 0);

  // Calculate next Saturday 14:30 UTC
  const nextSaturday = new Date(now);
  const daysUntilSat = (6 - now.getUTCDay() + 7) % 7 || 7;
  nextSaturday.setUTCDate(now.getUTCDate() + daysUntilSat);
  nextSaturday.setUTCHours(14, 30, 0, 0);

  // LeetCode Weekly
  contests.push({
    id: `lc-weekly-${nextSunday.getTime()}`,
    platform: 'LeetCode',
    name: 'LeetCode Weekly Contest',
    startTime: nextSunday.toISOString(),
    endTime: new Date(nextSunday.getTime() + 90 * 60 * 1000).toISOString(),
    durationSeconds: 5400,
    url: 'https://leetcode.com/contest/'
  });

  // LeetCode Biweekly
  contests.push({
    id: `lc-biweekly-${nextSaturday.getTime()}`,
    platform: 'LeetCode',
    name: 'LeetCode Biweekly Contest',
    startTime: nextSaturday.toISOString(),
    endTime: new Date(nextSaturday.getTime() + 90 * 60 * 1000).toISOString(),
    durationSeconds: 5400,
    url: 'https://leetcode.com/contest/'
  });

  // Sort all contests chronologically
  contests.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return NextResponse.json(contests);
}
