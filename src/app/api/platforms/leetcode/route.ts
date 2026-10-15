import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username parameter is required' }, { status: 400 });
  }

  try {
    // 1. GraphQL query for profile stats and submission calendar
    const calendarQuery = {
      query: `
        query userProfileDetails($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              ranking
              userAvatar
              realName
            }
            submitStatsGlobal {
              acSubmissionNum {
                difficulty
                count
              }
            }
            userCalendar {
              activeYears
              streak
              totalActiveDays
              submissionCalendar
            }
          }
          recentAcSubmissionList(username: $username, limit: 20) {
            id
            title
            titleSlug
            timestamp
          }
        }
      `,
      variables: { username }
    };

    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': `https://leetcode.com/${username}/`,
      },
      body: JSON.stringify(calendarQuery),
      next: { revalidate: 120 }
    });

    if (!res.ok) {
      throw new Error(`LeetCode GraphQL responded with status ${res.status}`);
    }

    const data = await res.json();

    if (data.errors && (!data.data || !data.data.matchedUser)) {
      return NextResponse.json({ 
        error: data.errors[0]?.message || 'User not found on LeetCode' 
      }, { status: 404 });
    }

    const matchedUser = data.data?.matchedUser;
    const stats = matchedUser?.submitStatsGlobal?.acSubmissionNum || [];
    const calendar = matchedUser?.userCalendar || {};
    const recentSubmissions = data.data?.recentAcSubmissionList || [];

    const allSolves = stats.find((s: any) => s.difficulty === 'All')?.count || 0;
    const easy = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
    const medium = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
    const hard = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;

    let submissionCalendarParsed: Record<string, number> = {};
    if (calendar.submissionCalendar) {
      try {
        submissionCalendarParsed = JSON.parse(calendar.submissionCalendar);
      } catch (err) {
        submissionCalendarParsed = {};
      }
    }

    const profileData = {
      username,
      totalSolved: allSolves,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      ranking: matchedUser?.profile?.ranking || 0,
      streak: calendar.streak || 0,
      totalActiveDays: calendar.totalActiveDays || 0,
      submissionCalendar: submissionCalendarParsed,
      recentSubmissions: recentSubmissions.map((sub: any) => ({
        id: sub.id,
        title: sub.title,
        titleSlug: sub.titleSlug,
        timestamp: sub.timestamp
      }))
    };

    return NextResponse.json(profileData);
  } catch (err: any) {
    console.error('Error in LeetCode API route:', err);
    // Provide a structured graceful fallback if network/WAF temporarily intercepts
    return NextResponse.json({
      error: err.message || 'Failed to fetch LeetCode data',
      fallback: true
    }, { status: 502 });
  }
}
