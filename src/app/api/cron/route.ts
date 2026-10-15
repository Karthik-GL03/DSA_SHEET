import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return handleCron(request);
}

export async function POST(request: NextRequest) {
  return handleCron(request);
}

async function handleCron(request: NextRequest) {
  // Check authorization header or query secret
  const authHeader = request.headers.get('Authorization');
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get('secret');

  const expectedSecret = process.env.CRON_SECRET || 'dsa_tracker_cron_secret';
  const providedSecret = authHeader?.replace('Bearer ', '') || secretParam;

  if (process.env.NODE_ENV === 'production' && providedSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
  }

  const syncResults = {
    executedAt: new Date().toISOString(),
    status: 'success',
    checkedUsers: 1,
    notificationsDispatched: [] as string[]
  };

  // If a Telegram chat ID and bot token are configured, send a daily reminder summary
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (botToken && chatId) {
    try {
      const message = `
🤖 *Unified DSA Tracker — Automated Daily Audit*
━━━━━━━━━━━━━━━━━━
⏰ Time: ${new Date().toLocaleTimeString()}
🔥 Consistency check triggered via GitHub Actions Cron.

Remember to log your solves today to protect your streak!
Keep solving: [LeetCode](https://leetcode.com) | [Codeforces](https://codeforces.com)
`;
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });
      syncResults.notificationsDispatched.push(`Telegram notification sent to ${chatId}`);
    } catch (e: any) {
      console.error('Cron telegram dispatch error:', e);
    }
  }

  return NextResponse.json(syncResults);
}
