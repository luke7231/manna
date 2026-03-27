import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { colors } from '../../src/lib/constants/colors';
import { GoldBadge } from '../../src/components/GoldBadge';
import { Card } from '../../src/components/Card';
import { useGoldStatus } from '../../src/hooks/useGoldStatus';
import {
  getOffering,
  purchasePackage,
  restorePurchases,
  PRODUCT_IDS,
} from '../../src/lib/purchases';

const BENEFITS = [
  { emoji: '🚫', text: '광고 없는 깔끔한 앱' },
  { emoji: '📸', text: '답변에 사진 첨부' },
  { emoji: '📚', text: '히스토리 무제한 조회' },
  { emoji: '✨', text: '프리미엄 방꾸미기 아이템' },
  { emoji: '🪨', text: '가입 즉시 만나돌 500개 지급' },
];

export default function GoldScreen() {
  const router = useRouter();
  const { isGold, expiresAt } = useGoldStatus();

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<PurchasesPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadOffering();
  }, []);

  const loadOffering = async () => {
    const off = await getOffering();
    setOffering(off);
    // 기본 선택: 연간 플랜 (할인 강조)
    if (off) {
      const annual = off.availablePackages.find(
        (p) => p.product.identifier === PRODUCT_IDS.annual
      );
      setSelectedPkg(annual ?? off.availablePackages[0] ?? null);
    }
    setLoading(false);
  };

  const handlePurchase = async () => {
    if (!selectedPkg) return;
    setPurchasing(true);
    const result = await purchasePackage(selectedPkg);
    setPurchasing(false);

    if (result.cancelled) return;
    if (result.success) {
      Alert.alert('🎉 만나골드 시작!', '만나돌 500개가 지급되었어요.\n프리미엄 혜택을 즐겨보세요!', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('구매 실패', '다시 시도해주세요.');
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const restored = await restorePurchases();
    setRestoring(false);
    if (restored) {
      Alert.alert('복원 완료', '골드 구독이 복원되었어요!', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } else {
      Alert.alert('구독 없음', '복원할 구독 내역이 없어요.');
    }
  };

  const formatPrice = (pkg: PurchasesPackage) =>
    pkg.product.priceString;

  const getMonthlyEquiv = (pkg: PurchasesPackage) => {
    // 연간 플랜이면 월 환산 표시
    if (pkg.product.identifier === PRODUCT_IDS.annual) {
      const monthly = pkg.product.price / 12;
      return `월 ${Math.round(monthly).toLocaleString()}원`;
    }
    return null;
  };

  // 이미 골드인 경우
  if (isGold) {
    const expDate = expiresAt
      ? new Date(expiresAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })
      : null;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로</Text>
        </TouchableOpacity>
        <View style={styles.goldActiveCard}>
          <Text style={styles.goldActiveEmoji}>⭐</Text>
          <Text style={styles.goldActiveTitle}>만나골드 이용 중</Text>
          {expDate && (
            <Text style={styles.goldActiveExpiry}>다음 갱신일: {expDate}</Text>
          )}
        </View>
        <Card padding={20}>
          <Text style={styles.benefitsTitle}>현재 혜택</Text>
          <View style={styles.benefitsList}>
            {BENEFITS.map((b) => (
              <View key={b.text} style={styles.benefitRow}>
                <Text style={styles.benefitEmoji}>{b.emoji}</Text>
                <Text style={styles.benefitText}>{b.text}</Text>
              </View>
            ))}
          </View>
        </Card>
        <TouchableOpacity style={styles.manageBtn}>
          <Text style={styles.manageBtnText}>구독 관리 (App Store / Play Store)</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 뒤로 */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← 뒤로</Text>
      </TouchableOpacity>

      {/* 헤더 */}
      <View style={styles.heroSection}>
        <Text style={styles.heroEmoji}>⭐</Text>
        <Text style={styles.heroTitle}>만나골드</Text>
        <Text style={styles.heroSub}>더 깊은 연결을 위한 프리미엄</Text>
      </View>

      {/* 혜택 목록 */}
      <Card padding={20}>
        <Text style={styles.benefitsTitle}>골드 혜택</Text>
        <View style={styles.benefitsList}>
          {BENEFITS.map((b) => (
            <View key={b.text} style={styles.benefitRow}>
              <Text style={styles.benefitEmoji}>{b.emoji}</Text>
              <Text style={styles.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* 플랜 선택 */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
      ) : offering ? (
        <View style={styles.plansSection}>
          <Text style={styles.plansTitle}>플랜 선택</Text>
          {offering.availablePackages.map((pkg) => {
            const isSelected = selectedPkg?.identifier === pkg.identifier;
            const monthlyEquiv = getMonthlyEquiv(pkg);
            const isAnnual = pkg.product.identifier === PRODUCT_IDS.annual;
            return (
              <TouchableOpacity
                key={pkg.identifier}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                onPress={() => setSelectedPkg(pkg)}
                activeOpacity={0.8}
              >
                <View style={styles.planLeft}>
                  <View style={styles.planRadio}>
                    {isSelected && <View style={styles.planRadioInner} />}
                  </View>
                  <View style={styles.planInfo}>
                    <View style={styles.planNameRow}>
                      <Text style={styles.planName}>
                        {isAnnual ? '연간 플랜' : '월간 플랜'}
                      </Text>
                      {isAnnual && (
                        <View style={styles.savingBadge}>
                          <Text style={styles.savingText}>33% 할인</Text>
                        </View>
                      )}
                    </View>
                    {monthlyEquiv && (
                      <Text style={styles.planMonthly}>{monthlyEquiv} 환산</Text>
                    )}
                  </View>
                </View>
                <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                  {formatPrice(pkg)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : (
        <Card padding={20}>
          <Text style={{ color: colors.textMuted, textAlign: 'center' }}>
            상품 정보를 불러오지 못했어요.{'\n'}인터넷 연결을 확인해주세요.
          </Text>
        </Card>
      )}

      {/* 구매 버튼 */}
      <TouchableOpacity
        style={[styles.purchaseBtn, (!selectedPkg || purchasing) && styles.purchaseBtnDisabled]}
        onPress={handlePurchase}
        disabled={!selectedPkg || purchasing}
        activeOpacity={0.85}
      >
        {purchasing ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.purchaseBtnText}>
            {selectedPkg ? `${formatPrice(selectedPkg)} 시작하기` : '플랜을 선택해주세요'}
          </Text>
        )}
      </TouchableOpacity>

      {/* 구독 복원 */}
      <TouchableOpacity onPress={handleRestore} disabled={restoring} style={styles.restoreBtn}>
        {restoring ? (
          <ActivityIndicator color={colors.textMuted} size="small" />
        ) : (
          <Text style={styles.restoreText}>이미 구독 중이라면 구독 복원</Text>
        )}
      </TouchableOpacity>

      {/* 주의 문구 */}
      <Text style={styles.disclaimer}>
        구독은 현재 결제 기간 종료 24시간 이전에 취소하지 않으면 자동으로 갱신됩니다.
        구독 관리 및 취소는 App Store / Google Play에서 할 수 있어요.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 60,
    gap: 20,
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  heroSection: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  heroEmoji: {
    fontSize: 56,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#8B6A00',
  },
  heroSub: {
    fontSize: 15,
    color: colors.textMuted,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 14,
    letterSpacing: 0.3,
  },
  benefitsList: {
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitEmoji: {
    fontSize: 22,
    width: 30,
  },
  benefitText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  plansSection: {
    gap: 10,
  },
  plansTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.3,
    paddingHorizontal: 4,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  planCardSelected: {
    borderColor: '#F0C040',
    backgroundColor: '#FFFDF0',
  },
  planLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  planRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#F0C040',
  },
  planInfo: {
    gap: 3,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  savingBadge: {
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  savingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8B6A00',
  },
  planMonthly: {
    fontSize: 12,
    color: colors.textMuted,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMuted,
  },
  planPriceSelected: {
    color: '#8B6A00',
  },
  purchaseBtn: {
    backgroundColor: '#F0C040',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  purchaseBtnDisabled: {
    opacity: 0.5,
  },
  purchaseBtnText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#5A4000',
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  restoreText: {
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  disclaimer: {
    fontSize: 11,
    color: colors.textLight,
    lineHeight: 17,
    textAlign: 'center',
  },
  // 이미 골드인 경우
  goldActiveCard: {
    backgroundColor: '#FFFDF0',
    borderWidth: 1.5,
    borderColor: '#F0C040',
    borderRadius: 20,
    alignItems: 'center',
    padding: 28,
    gap: 8,
  },
  goldActiveEmoji: {
    fontSize: 48,
  },
  goldActiveTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#8B6A00',
  },
  goldActiveExpiry: {
    fontSize: 13,
    color: colors.textMuted,
  },
  manageBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  manageBtnText: {
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
