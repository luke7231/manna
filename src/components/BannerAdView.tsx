import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { ADS_ENABLED, AD_UNIT_IDS } from '../lib/ads';
import { colors } from '../lib/constants/colors';

export function BannerAdView() {
  if (!ADS_ENABLED) return null;

  return (
    <View style={{ alignItems: 'center', backgroundColor: colors.card }}>
      <BannerAd
        unitId={AD_UNIT_IDS.banner}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={() => {
          // 광고 로드 실패 시 조용히 처리 — 빈 View가 렌더됨
        }}
      />
    </View>
  );
}
