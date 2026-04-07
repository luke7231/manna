import { supabase } from './client';
import { Profile } from '../../types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function upsertProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Profile | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates })
    .select()
    .single();

  return { data: data as Profile, error };
}

export async function savePushToken(userId: string, token: string): Promise<void> {
  await supabase.from('profiles').update({ push_token: token }).eq('id', userId);
}

export async function getPartnerPushToken(partnerId: string): Promise<string | null> {
  const { data } = await supabase
    .from('profiles')
    .select('push_token')
    .eq('id', partnerId)
    .single();
  return data?.push_token ?? null;
}

/**
 * 출석 체크 — 오늘 아직 출석 보상을 받지 않은 경우에만 지급
 * @returns 지급된 만나돌 수 (0이면 이미 오늘 수령 완료)
 */
export async function checkAndAwardAttendance(
  userId: string,
  pairId: string,
  addPebblesFn: (pairId: string, amount: number) => Promise<number>
): Promise<number> {
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

  const { data: profile } = await supabase
    .from('profiles')
    .select('attendance_date')
    .eq('id', userId)
    .single();

  if (profile?.attendance_date === today) return 0; // 이미 오늘 수령

  // 출석 날짜 업데이트 + 만나돌 지급
  await supabase.from('profiles').update({ attendance_date: today }).eq('id', userId);
  await addPebblesFn(pairId, 3);
  return 3;
}

export async function completeOnboarding(
  userId: string,
  name: string,
  relationship_type: 'couple',
  partner_name?: string
): Promise<{ data: Profile | null; error: Error | null }> {
  return upsertProfile(userId, {
    name,
    relationship_type,
    partner_name: partner_name || null,
    onboarding_completed: true,
  });
}
