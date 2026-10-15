import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Handle parameter is required' }, { status: 400 });
  }

  const profileUrl = `https://www.geeksforgeeks.org/user/${encodeURIComponent(handle)}/`;

  try {
    const res = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      next: { revalidate: 120 }
    });

    const html = await res.text();

    const result = {
      handle,
      totalSolved: 0,
      codingScore: 0,
      breakdown: {
        school: 0,
        basic: 0,
        easy: 0,
        medium: 0,
        hard: 0
      }
    };

    // Strategy 1: Check __NEXT_DATA__
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (nextDataMatch && nextDataMatch[1]) {
      try {
        const nextData = JSON.parse(nextDataMatch[1]);
        const userStats = nextData.props?.pageProps?.userInfo || nextData.props?.pageProps?.userStats;
        if (userStats) {
          result.totalSolved = Number(userStats.total_problems_solved || userStats.totalSolved || 0);
          result.codingScore = Number(userStats.score || userStats.coding_score || 0);
          return NextResponse.json(result);
        }
      } catch (e) {
        // Continue to regex fallback
      }
    }

    // Strategy 2: Regex extraction for solved count & score
    const solvedMatch = html.match(/problems?\s*solved[^\d]*(\d+)/i) || html.match(/"total_problems_solved":\s*(\d+)/);
    if (solvedMatch) {
      result.totalSolved = parseInt(solvedMatch[1], 10);
    }

    const scoreMatch = html.match(/coding\s*score[^\d]*(\d+)/i) || html.match(/"score":\s*(\d+)/);
    if (scoreMatch) {
      result.codingScore = parseInt(scoreMatch[1], 10);
    }

    // Strategy 3: Difficulty breakdown patterns (e.g. "School (10)", "Easy (25)", etc.)
    const schoolMatch = html.match(/school\s*\((\d+)\)/i);
    if (schoolMatch) result.breakdown.school = parseInt(schoolMatch[1], 10);

    const basicMatch = html.match(/basic\s*\((\d+)\)/i);
    if (basicMatch) result.breakdown.basic = parseInt(basicMatch[1], 10);

    const easyMatch = html.match(/easy\s*\((\d+)\)/i);
    if (easyMatch) result.breakdown.easy = parseInt(easyMatch[1], 10);

    const medMatch = html.match(/medium\s*\((\d+)\)/i);
    if (medMatch) result.breakdown.medium = parseInt(medMatch[1], 10);

    const hardMatch = html.match(/hard\s*\((\d+)\)/i);
    if (hardMatch) result.breakdown.hard = parseInt(hardMatch[1], 10);

    if (result.totalSolved === 0 && (result.breakdown.easy > 0 || result.breakdown.medium > 0)) {
      result.totalSolved = result.breakdown.school + result.breakdown.basic + result.breakdown.easy + result.breakdown.medium + result.breakdown.hard;
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Error fetching GFG profile:', err);
    return NextResponse.json({
      handle,
      totalSolved: 0,
      codingScore: 0,
      breakdown: { school: 0, basic: 0, easy: 0, medium: 0, hard: 0 },
      error: 'GFG profile request encountered protection or network issue'
    });
  }
}
