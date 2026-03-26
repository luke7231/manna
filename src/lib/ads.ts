import { Platform } from 'react-native';

/**
 * 광고 유닛 ID
 * 현재는 Google 공식 테스트 ID 사용.
 * 릴리즈 전 실제 AdMob 계정 ID로 교체 필요.
 */
export const AD_UNIT_IDS = {
  banner: Platform.select({
    ios: 'ca-app-pub-3940256099942544/2934735716',
    android: 'ca-app-pub-3940256099942544/6300978111',
  }) as string,
  rewarded: Platform.select({
    ios: 'ca-app-pub-3940256099942544/1712485313',
    android: 'ca-app-pub-3940256099942544/5224354917',
  }) as string,
};

/**
 * 광고 활성화 플래그.
 * 추후 유료 플랜(광고 제거) 도입 시 사용자 구매 상태에 따라 false로 전환.
 */
export const ADS_ENABLED = true;
