import { supabase } from './client';
import { Pair, PairInvite } from '../../types';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude ambiguous I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function getUserPair(userId: string): Promise<Pair | null> {
  const { data, error } = await supabase
    .from('pairs')
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('status', 'connected')
    .maybeSingle();

  if (error) return null;
  return data as Pair | null;
}

export async function getPendingPair(userId: string): Promise<Pair | null> {
  const { data } = await supabase
    .from('pairs')
    .select('*')
    .eq('user1_id', userId)
    .eq('status', 'pending')
    .maybeSingle();

  return data as Pair | null;
}

export async function generateInviteCode(userId: string): Promise<{
  code: string | null;
  error: Error | null;
}> {
  // Check if user already has a pending pair invite
  const existingPair = await getPendingPair(userId);

  let pairId: string;

  if (existingPair) {
    pairId = existingPair.id;
    // Delete old invite and create new one
    await supabase.from('pair_invites').delete().eq('pair_id', pairId);
  } else {
    // Create new pair
    const { data: pair, error: pairError } = await supabase
      .from('pairs')
      .insert({ user1_id: userId, status: 'pending' })
      .select()
      .single();

    if (pairError || !pair) return { code: null, error: pairError };
    pairId = pair.id;
  }

  const code = generateCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // expires in 7 days

  const { error: inviteError } = await supabase.from('pair_invites').insert({
    pair_id: pairId,
    code,
    created_by: userId,
    expires_at: expiresAt.toISOString(),
  });

  if (inviteError) return { code: null, error: inviteError };
  return { code, error: null };
}

export async function getMyInviteCode(userId: string): Promise<string | null> {
  const pendingPair = await getPendingPair(userId);
  if (!pendingPair) return null;

  const { data } = await supabase
    .from('pair_invites')
    .select('*')
    .eq('pair_id', pendingPair.id)
    .is('used_at', null)
    .maybeSingle();

  return data?.code ?? null;
}

export async function connectWithCode(
  userId: string,
  code: string
): Promise<{ success: boolean; error: string | null }> {
  // Find the invite
  const { data: invite, error: findError } = await supabase
    .from('pair_invites')
    .select('*')
    .eq('code', code.toUpperCase())
    .is('used_at', null)
    .maybeSingle();

  if (findError || !invite) {
    return { success: false, error: '유효하지 않은 코드입니다.' };
  }

  // Check not self-connecting
  if (invite.created_by === userId) {
    return { success: false, error: '자신의 코드로는 연결할 수 없어요.' };
  }

  // Check expiry
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
    return { success: false, error: '만료된 코드입니다.' };
  }

  // Check user is not already connected
  const existingPair = await getUserPair(userId);
  if (existingPair) {
    return { success: false, error: '이미 연결된 상태입니다.' };
  }

  // Update pair: set user2_id and status = connected
  const { error: pairError } = await supabase
    .from('pairs')
    .update({ user2_id: userId, status: 'connected' })
    .eq('id', invite.pair_id);

  if (pairError) return { success: false, error: '연결 중 오류가 발생했습니다.' };

  // Mark invite as used
  await supabase
    .from('pair_invites')
    .update({ used_at: new Date().toISOString() })
    .eq('id', invite.id);

  return { success: true, error: null };
}

export function getPartnerId(pair: Pair, myUserId: string): string | null {
  if (pair.user1_id === myUserId) return pair.user2_id;
  return pair.user1_id;
}

/**
 * 만나돌 원자적 증감 — 두 사람이 동시에 호출해도 안전
 * @returns 업데이트 후 새 잔액
 */
export async function addPebbles(pairId: string, amount: number): Promise<number> {
  const { data } = await supabase.rpc('add_pebbles', {
    p_pair_id: pairId,
    p_amount: amount,
  });
  return (data as number) ?? 0;
}

export async function updateNotificationTime(
  pairId: string,
  hour: number,
  minute: number
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('pairs')
    .update({ notification_hour: hour, notification_minute: minute })
    .eq('id', pairId);
  return { error };
}
