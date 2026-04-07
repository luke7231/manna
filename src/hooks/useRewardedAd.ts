import { useState, useEffect, useRef } from 'react';
import {
  RewardedAd,
  RewardedAdEventType,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { ADS_ENABLED, AD_UNIT_IDS } from '../lib/ads';

/**
 * 리워드 광고 훅
 *
 * 사용법:
 *   const { load, show, loaded, showing } = useRewardedAd(() => {
 *     // 광고 시청 완료 후 지급할 리워드 로직 (현재 TBD)
 *   });
 *
 *   // 화면 진입 시 미리 로드
 *   useEffect(() => { load(); }, []);
 *
 *   // 버튼 클릭 시
 *   <Button title="30초 광고 보고 리워드 받기" onPress={show} disabled={!loaded} />
 */
export function useRewardedAd(onRewarded: () => void) {
  const [loaded, setLoaded] = useState(false);
  const [showing, setShowing] = useState(false);
  const adRef = useRef<RewardedAd | null>(null);

  const createAd = () => {
    if (!ADS_ENABLED) return;
    const ad = RewardedAd.createForAdRequest(AD_UNIT_IDS.rewarded, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        onRewarded();
      }
    );

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setShowing(false);
      setLoaded(false);
      // 다음 시청을 위해 자동 재로드
      ad.load();
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, () => {
      setLoaded(false);
      setShowing(false);
    });

    adRef.current = ad;

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  };

  useEffect(() => {
    const cleanup = createAd();
    return cleanup;
  }, []);

  const load = () => {
    if (!ADS_ENABLED || !adRef.current) return;
    adRef.current.load();
  };

  const show = async () => {
    if (!loaded || showing || !adRef.current) return;
    setShowing(true);
    await adRef.current.show();
  };

  return { load, show, loaded, showing };
}
