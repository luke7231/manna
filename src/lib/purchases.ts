/**
 * RevenueCat 래퍼
 * SDK: react-native-purchases
 *
 * 초기화 흐름:
 *   1. app/_layout.tsx에서 Purchases.configure() 호출
 *   2. 로그인 시 Purchases.logIn(userId) 호출
 *   3. 로그아웃 시 Purchases.logOut() 호출
 *
 * 상품 ID (App Store Connect / Google Play Console에서 동일하게 등록 필요):
 *   - monthly: "manna_gold_monthly"  → 월 9,900원
 *   - annual:  "manna_gold_annual"   → 연 79,000원
 */

import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';

// ─── RevenueCat API Key ──────────────────────────────────────────────────────
// TODO: 실제 키로 교체 (RevenueCat Dashboard > Project > API Keys)
const RC_API_KEY = Platform.select({
  ios: 'appl_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  android: 'goog_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
})!;

export const ENTITLEMENT_ID = 'manna_gold';

export const PRODUCT_IDS = {
  monthly: 'manna_gold_monthly',
  annual: 'manna_gold_annual',
} as const;

// ─── 초기화 ──────────────────────────────────────────────────────────────────
export async function configurePurchases(): Promise<void> {
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey: RC_API_KEY });
}

// ─── 유저 연결 (로그인 후 호출) ───────────────────────────────────────────────
export async function loginPurchases(userId: string): Promise<void> {
  try {
    await Purchases.logIn(userId);
  } catch (e) {
    console.warn('[Purchases] logIn error', e);
  }
}

// ─── 유저 해제 (로그아웃 후 호출) ────────────────────────────────────────────
export async function logoutPurchases(): Promise<void> {
  try {
    await Purchases.logOut();
  } catch (e) {
    console.warn('[Purchases] logOut error', e);
  }
}

// ─── 현재 골드 상태 확인 (앱 포그라운드 진입 시 사용) ──────────────────────────
export async function checkGoldStatus(): Promise<boolean> {
  try {
    const info: CustomerInfo = await Purchases.getCustomerInfo();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

// ─── 상품 목록 가져오기 ────────────────────────────────────────────────────────
export async function getOffering(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (e) {
    console.warn('[Purchases] getOfferings error', e);
    return null;
  }
}

// ─── 구매 ────────────────────────────────────────────────────────────────────
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<{ success: boolean; customerInfo?: CustomerInfo; cancelled?: boolean }> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { success: true, customerInfo };
  } catch (e: any) {
    if (e.userCancelled) return { success: false, cancelled: true };
    console.warn('[Purchases] purchasePackage error', e);
    return { success: false };
  }
}

// ─── 구독 복원 ────────────────────────────────────────────────────────────────
export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    return info.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch (e) {
    console.warn('[Purchases] restorePurchases error', e);
    return false;
  }
}
