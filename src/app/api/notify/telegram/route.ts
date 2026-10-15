import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { botToken, chatId, message, type } = body;

    const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
    const chat = chatId || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chat) {
      return NextResponse.json({
        error: 'Telegram Bot Token and Chat ID are required. Configure them in settings or environment variables.'
      }, { status: 400 });
    }

    if (!message) {
      return NextResponse.json({ error: 'Message text is required' }, { status: 400 });
    }

    const telegramEndpoint = `https://api.telegram.org/bot${token}/sendMessage`;

    const res = await fetch(telegramEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      })
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      return NextResponse.json({
        error: data.description || 'Failed to send Telegram message',
        details: data
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      messageId: data.result?.message_id,
      timestamp: new Date().toISOString(),
      type: type || 'custom'
    });
  } catch (err: any) {
    console.error('Error dispatching Telegram alert:', err);
    return NextResponse.json({ error: err.message || 'Server error sending Telegram notification' }, { status: 500 });
  }
}
