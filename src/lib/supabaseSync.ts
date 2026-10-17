import { getSupabase } from './supabase';
import { UserProfile, ProblemNote, SolvedProblem } from './types';

// Sync user profile up to Supabase
export async function syncUserProfileToSupabase(profile: UserProfile, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  try {
    await supabase.from('users').upsert({
      id: userId,
      email: profile.email,
      timezone: profile.timezone || 'UTC',
      telegram_chat_id: profile.telegramChatId || null,
      telegram_notifications_enabled: profile.telegramNotificationsEnabled,
      target_solves_per_day: profile.targetSolvesPerDay,
      current_streak: profile.currentStreak,
      longest_streak: profile.longestStreak,
      last_active_date: profile.lastActiveDate || null,
    }, { onConflict: 'id' });

    // Sync external platform handles
    for (const [platform, handle] of Object.entries(profile.handles)) {
      if (handle) {
        await supabase.from('external_accounts').upsert({
          user_id: userId,
          platform,
          handle,
          last_synced: new Date().toISOString(),
        }, { onConflict: 'user_id,platform' });
      }
    }
  } catch (err) {
    console.warn('Supabase profile sync notice:', err);
  }
}

// Sync a single note to Supabase
export async function syncNoteToSupabase(note: ProblemNote, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  try {
    await supabase.from('notes').upsert({
      user_id: userId,
      problem_slug: note.problemSlug,
      problem_title: note.problemTitle,
      platform: note.platform,
      content: note.content,
      approach_summary: note.approach || null,
      time_complexity: note.timeComplexity || null,
      space_complexity: note.spaceComplexity || null,
      tags: note.tags || [],
      is_favorite: note.isFavorite || false,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,platform,problem_slug' });
  } catch (err) {
    console.warn('Supabase note sync notice:', err);
  }
}

// Delete note from Supabase
export async function deleteNoteFromSupabase(problemSlug: string, userId: string) {
  const supabase = getSupabase();
  if (!supabase || !userId) return;

  try {
    await supabase.from('notes').delete().eq('user_id', userId).eq('problem_slug', problemSlug);
  } catch (err) {
    console.warn('Supabase note delete notice:', err);
  }
}

// Fetch user data from Supabase upon login
export async function fetchUserDataFromSupabase(userId: string): Promise<{
  profile: Partial<UserProfile> | null;
  notes: ProblemNote[];
  solvedSlugs: string[];
}> {
  const supabase = getSupabase();
  if (!supabase || !userId) return { profile: null, notes: [], solvedSlugs: [] };

  try {
    // 1. Fetch user row
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    // 2. Fetch external accounts
    const { data: accountsData } = await supabase
      .from('external_accounts')
      .select('platform, handle')
      .eq('user_id', userId);

    const handles = {
      leetcode: '',
      codeforces: '',
      geeksforgeeks: '',
    };
    if (accountsData) {
      accountsData.forEach((acc: any) => {
        if (acc.platform in handles) {
          (handles as any)[acc.platform] = acc.handle;
        }
      });
    }

    // 3. Fetch notes
    const { data: notesData } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    const notes: ProblemNote[] = (notesData || []).map((n: any) => ({
      id: n.id || `note-${Date.now()}`,
      problemSlug: n.problem_slug,
      problemTitle: n.problem_title,
      platform: n.platform,
      difficulty: 'Medium',
      content: n.content,
      approach: n.approach_summary,
      timeComplexity: n.time_complexity,
      spaceComplexity: n.space_complexity,
      tags: n.tags || [],
      isFavorite: n.is_favorite || false,
      createdAt: n.created_at,
      updatedAt: n.updated_at,
    }));

    // 4. Fetch solves
    const { data: solvesData } = await supabase
      .from('solves')
      .select('problem_slug')
      .eq('user_id', userId);

    const solvedSlugs = (solvesData || []).map((s: any) => s.problem_slug.toLowerCase());

    const profile: Partial<UserProfile> = userData ? {
      email: userData.email,
      timezone: userData.timezone,
      telegramChatId: userData.telegram_chat_id || '',
      telegramNotificationsEnabled: userData.telegram_notifications_enabled || false,
      targetSolvesPerDay: userData.target_solves_per_day || 2,
      currentStreak: userData.current_streak || 0,
      longestStreak: userData.longest_streak || 0,
      lastActiveDate: userData.last_active_date,
      handles,
    } : { handles };

    return { profile, notes, solvedSlugs };
  } catch (err) {
    console.error('Error fetching Supabase user data:', err);
    return { profile: null, notes: [], solvedSlugs: [] };
  }
}
