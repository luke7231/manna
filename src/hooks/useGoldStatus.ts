import { useProfileStore } from '../stores/profileStore';

/**
 * 현재 유저의 골드 구독 상태를 읽는 훅.
 * 실시간 구독 여부는 RevenueCat webhook → Supabase profiles.is_gold로 관리.
 * 앱 레이어에서는 profile.is_gold 단일 진실 공급원으로 사용.
 */
export function useGoldStatus() {
  const { profile } = useProfileStore();

  const isGold = profile?.is_gold ?? false;
  const expiresAt = profile?.gold_expires_at ?? null;

  return { isGold, expiresAt };
}
