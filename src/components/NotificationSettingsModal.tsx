'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { 
  X, 
  Bell, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Bot, 
  Clock, 
  Flame, 
  Trophy, 
  Calendar,
  ExternalLink,
  Shield,
  Check
} from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveNotificationSettings: (settings: {
    telegramBotToken: string;
    telegramChatId: string;
    telegramNotificationsEnabled: boolean;
    notificationSettings: UserProfile['notificationSettings'];
  }) => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveNotificationSettings,
}) => {
  const [botToken, setBotToken] = useState(profile.telegramBotToken || '');
  const [chatId, setChatId] = useState(profile.telegramChatId || '');
  const [enabled, setEnabled] = useState(profile.telegramNotificationsEnabled);
  const [rules, setRules] = useState(profile.notificationSettings);

  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [testError, setTestError] = useState('');

  if (!isOpen) return null;

  const handleTestAlert = async () => {
    if (!botToken || !chatId) {
      setTestStatus('error');
      setTestError('Please provide both Telegram Bot Token and Chat ID to send a test message.');
      return;
    }

    setTestStatus('sending');
    setTestError('');

    try {
      const res = await fetch('/api/notify/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: botToken.trim(),
          chatId: chatId.trim(),
          message: `🔥 *AlgoPulse DSA Tracker Test Alert*\n\n✅ Telegram push notification integration verified successfully!\n\nYour streak accountability alerts and contest reminders are armed and active.`,
          type: 'test'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Telegram API returned an error');
      }

      setTestStatus('success');
    } catch (err: any) {
      setTestStatus('error');
      setTestError(err.message || 'Failed to send Telegram message');
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNotificationSettings({
      telegramBotToken: botToken.trim(),
      telegramChatId: chatId.trim(),
      telegramNotificationsEnabled: enabled,
      notificationSettings: rules
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-xl rounded-2xl border border-dark-700 p-6 shadow-2xl overflow-y-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Automated Notification & Telegram Alerts</h3>
              <p className="text-xs text-slate-400">Streak defense, missed-day alerts, and contest countdowns</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          
          {/* Quick Telegram Bot Setup Steps */}
          <div className="p-4 rounded-xl bg-dark-900/90 border border-dark-800 text-xs space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span>🚀 2-Minute Telegram Bot Setup (100% Free):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 leading-relaxed text-[11px]">
              <li>Open Telegram and search for <strong className="text-indigo-300">@BotFather</strong>.</li>
              <li>Send <code className="bg-dark-950 px-1 py-0.5 rounded text-cyan-300">/newbot</code>, choose a name, and copy the <strong>HTTP API Token</strong>.</li>
              <li>Start your bot, then message <strong className="text-indigo-300">@userinfobot</strong> to view your numeric <strong>Chat ID</strong>.</li>
              <li>Paste both credentials below and press <strong>&quot;Send Test Notification&quot;</strong>.</li>
            </ol>
          </div>

          {/* Bot Token & Chat ID Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Telegram Bot Token</label>
              <input
                type="text"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                placeholder="e.g. 7123456789:ABCdefGhIJKlmNoPQRstuVWXyz"
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-dark-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Telegram User / Group Chat ID</label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="e.g. 987654321"
                className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-dark-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Test Notification Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleTestAlert}
              disabled={testStatus === 'sending'}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Send className={`w-3.5 h-3.5 ${testStatus === 'sending' ? 'animate-bounce' : ''}`} />
              <span>{testStatus === 'sending' ? 'Sending Test Message...' : 'Send Test Notification'}</span>
            </button>

            {testStatus === 'success' && (
              <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Test message delivered to your Telegram! Check your phone.</span>
              </div>
            )}

            {testStatus === 'error' && (
              <div className="mt-2 text-[11px] text-rose-400 flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{testError}</span>
              </div>
            )}
          </div>

          {/* Notification Rules Configuration */}
          <div className="p-4 rounded-xl bg-dark-900/60 border border-dark-800 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Automated Notification Rules</h4>
            
            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Daily Streak Warning (if 0 solves by 10:00 PM)</span>
              </div>
              <input
                type="checkbox"
                checked={rules.missedDayAlert}
                onChange={(e) => setRules({ ...rules, missedDayAlert: e.target.checked })}
                className="rounded bg-dark-950 border-dark-700 text-indigo-600 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span>Streak Milestone Celebration (7, 30, 100 days)</span>
              </div>
              <input
                type="checkbox"
                checked={rules.streakAlert}
                onChange={(e) => setRules({ ...rules, streakAlert: e.target.checked })}
                className="rounded bg-dark-950 border-dark-700 text-indigo-600 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-blue-400" />
                <span>Contest Alert (24h &amp; 2h prior to Codeforces/LeetCode round)</span>
              </div>
              <input
                type="checkbox"
                checked={rules.contestAlert}
                onChange={(e) => setRules({ ...rules, contestAlert: e.target.checked })}
                className="rounded bg-dark-950 border-dark-700 text-indigo-600 focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Weekly Performance Digest (Every Monday 8:00 AM)</span>
              </div>
              <input
                type="checkbox"
                checked={rules.weeklySummary}
                onChange={(e) => setRules({ ...rules, weeklySummary: e.target.checked })}
                className="rounded bg-dark-950 border-dark-700 text-indigo-600 focus:ring-0"
              />
            </label>
          </div>

          {/* GitHub Actions Schedule Reference */}
          <div className="p-3.5 rounded-xl bg-dark-950 border border-dark-800 text-[11px] text-slate-400">
            <span className="text-indigo-300 font-semibold">GitHub Actions Serverless Cron:</span>
            <p className="mt-1">
              Workflow file <code className="text-slate-200">.github/workflows/daily-streak-sync.yml</code> runs daily at <code className="text-cyan-300">18:30 UTC</code> to audit streaks and send alerts at zero server cost.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-dark-800 text-slate-300 text-xs font-medium hover:bg-dark-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              Save Notification Settings
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
