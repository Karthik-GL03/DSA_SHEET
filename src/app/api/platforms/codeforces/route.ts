import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle parameter is required' }, { status: 400 });
  }

  try {
    // 1. Fetch user.info
    const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 120 }
    });
    const infoData = await infoRes.json();

    if (infoData.status !== 'OK' || !infoData.result?.length) {
      return NextResponse.json({ error: infoData.comment || 'Codeforces handle not found' }, { status: 404 });
    }

    const userInfo = infoData.result[0];

    // 2. Fetch submissions to calculate unique solved problems and daily streaks
    const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(handle)}&from=1&count=1000`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 120 }
    });
    const statusData = await statusRes.json();

    const uniqueSolves = new Set<string>();
    const recentSubmissions: any[] = [];

    if (statusData.status === 'OK' && Array.isArray(statusData.result)) {
      for (const sub of statusData.result) {
        if (sub.verdict === 'OK' && sub.problem) {
          const problemKey = `${sub.problem.contestId}-${sub.problem.index}`;
          uniqueSolves.add(problemKey);

          if (recentSubmissions.length < 20) {
            recentSubmissions.push({
              id: sub.id,
              contestId: sub.problem.contestId,
              problemName: sub.problem.name,
              problemIndex: sub.problem.index,
              verdict: sub.verdict,
              creationTimeSeconds: sub.creationTimeSeconds,
              tags: sub.problem.tags || []
            });
          }
        }
      }
    }

    // 3. Fetch user rating history
    let ratingHistory: any[] = [];
    try {
      const ratingRes = await fetch(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(handle)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 300 }
      });
      const ratingData = await ratingRes.json();
      if (ratingData.status === 'OK' && Array.isArray(ratingData.result)) {
        ratingHistory = ratingData.result.slice(-15).map((r: any) => ({
          contestId: r.contestId,
          contestName: r.contestName,
          rank: r.rank,
          ratingUpdateTimeSeconds: r.ratingUpdateTimeSeconds,
          oldRating: r.oldRating,
          newRating: r.newRating
        }));
      }
    } catch (e) {
      // Non-critical if rating history fails
    }

    const result = {
      handle: userInfo.handle,
      rating: userInfo.rating || 0,
      maxRating: userInfo.maxRating || 0,
      rank: userInfo.rank || 'unrated',
      maxRank: userInfo.maxRank || 'unrated',
      totalSolved: uniqueSolves.size,
      contribution: userInfo.contribution || 0,
      recentSubmissions,
      ratingHistory
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error fetching Codeforces data:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch Codeforces data' }, { status: 500 });
  }
}
