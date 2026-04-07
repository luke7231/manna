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
import { useTranslation } from 'react-i18next';
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

export default function GoldScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  const BENEFITS = [
    { emoji: '🚫', text: t('gold.benefit1') },
    { emoji: '📸', text: t('gold.benefit2') },
    { emoji: '📚', text: t('gold.benefit3') },
    { emoji: '✨', text: t('gold.benefit4') },
    { emoji: '🪨', text: t('gold.benefit5') },
  ];
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
      Alert.alert(t('gold.successTitle'), t('gold.successMsg'), [
        { text: t('common.confirm'), onPress: () => router.back() },
      ]);
    } else {
      Alert.alert(t('gold.purchaseFailed'));
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    const restored = await restorePurchases();
    setRestoring(false);
    if (restored) {
      Alert.alert(t('gold.restoreSuccess'), undefined, [
        { text: t('common.confirm'), onPress: () => router.back() },
      ]);
    } else {
      Alert.alert(t('gold.restoreNone'));
    }
  };

  const formatPrice = (pkg: PurchasesPackage) =>
    pkg.product.priceString;

  const getMonthlyEquiv = (pkg: PurchasesPackage): string | null => {
    if (pkg.product.identifier === PRODUCT_IDS.annual) {
      const monthly = pkg.product.price / 12;
      return Math.round(monthly).toLocaleString();
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
          <Text style={styles.backText}>{`← ${t('common.back')}`}</Text>
        </TouchableOpacity>
        <View style={styles.goldActiveCard}>
          <Text style={styles.goldActiveEmoji}>⭐</Text>
          <Text style={styles.goldActiveTitle}>{t('gold.activeTitle')}</Text>
          {expDate && (
            <Text style={styles.goldActiveExpiry}>{t('gold.activeExpiry', { date: expDate })}</Text>
          )}
        </View>
        <Card padding={20}>
          <Text style={styles.benefitsTitle}>{t('gold.benefitsTitle')}</Text>
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
          <Text style={styles.manageBtnText}>{t('gold.manageBtn')}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 뒤로 */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>{`← ${t('common.back')}`}</Text>
      </TouchableOpacity>

      {/* 헤더 */}
      <View style={styles.heroSection}>
        <Text style={styles.heroEmoji}>⭐</Text>
        <Text style={styles.heroTitle}>{t('gold.title')}</Text>
        <Text style={styles.heroSub}>{t('gold.subtitle')}</Text>
      </View>

      {/* 혜택 목록 */}
      <Card padding={20}>
        <Text style={styles.benefitsTitle}>{t('gold.benefitsTitle')}</Text>
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
          <Text style={styles.plansTitle}>{t('gold.plansTitle')}</Text>
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
                        {isAnnual ? t('gold.annualPlan') : t('gold.monthlyPlan')}
                      </Text>
                      {isAnnual && (
                        <View style={styles.savingBadge}>
                          <Text style={styles.savingText}>{t('gold.saving')}</Text>
                        </View>
                      )}
                    </View>
                    {monthlyEquiv && (
                      <Text style={styles.planMonthly}>{t('gold.monthlyEquiv', { price: monthlyEquiv })}</Text>
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
            {t('gold.noPlans')}
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
            {selectedPkg ? t('gold.startBtn', { price: formatPrice(selectedPkg) }) : t('gold.selectPlan')}
          </Text>
        )}
      </TouchableOpacity>

      {/* 구독 복원 */}
      <TouchableOpacity onPress={handleRestore} disabled={restoring} style={styles.restoreBtn}>
        {restoring ? (
          <ActivityIndicator color={colors.textMuted} size="small" />
        ) : (
          <Text style={styles.restoreText}>{t('gold.restoreBtn')}</Text>
        )}
      </TouchableOpacity>

      {/* 주의 문구 */}
      <Text style={styles.disclaimer}>
        {t('gold.disclaimer')}
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
