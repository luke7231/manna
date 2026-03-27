import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../src/components/Card';
import { GoldBadge } from '../../src/components/GoldBadge';
import { colors } from '../../src/lib/constants/colors';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { useGoldStatus } from '../../src/hooks/useGoldStatus';


function SettingRow({
  label,
  value,
  onPress,
  destructive = false,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.settingLabel, destructive && styles.destructiveLabel]}>
        {label}
      </Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {onPress && !destructive && <Text style={styles.settingArrow}>›</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { signOut } = useAuthStore();
  const { profile } = useProfileStore();
  const { isGold, expiresAt } = useGoldStatus();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          await signOut();
          setSigningOut(false);
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      {/* 만나골드 섹션 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>구독</Text>
        {isGold ? (
          <TouchableOpacity
            style={styles.goldActiveCard}
            onPress={() => router.push('/(app)/gold')}
            activeOpacity={0.8}
          >
            <View style={styles.goldActiveLeft}>
              <Text style={styles.goldActiveEmoji}>⭐</Text>
              <View style={styles.goldActiveInfo}>
                <View style={styles.goldActiveTitleRow}>
                  <Text style={styles.goldActiveTitle}>만나골드 이용 중</Text>
                  <GoldBadge size="sm" />
                </View>
                {expiresAt && (
                  <Text style={styles.goldActiveExpiry}>
                    갱신일: {new Date(expiresAt).toLocaleDateString('ko-KR')}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.goldPromoCard}
            onPress={() => router.push('/(app)/gold')}
            activeOpacity={0.8}
          >
            <Text style={styles.goldPromoEmoji}>⭐</Text>
            <View style={styles.goldPromoInfo}>
              <Text style={styles.goldPromoTitle}>만나골드 시작하기</Text>
              <Text style={styles.goldPromoDesc}>광고 제거 · 사진 첨부 · 히스토리 무제한</Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Profile section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>프로필</Text>
        <Card padding={0} style={styles.sectionCard}>
          <SettingRow label="내 이름" value={profile?.name ?? '-'} />
          {profile?.partner_name && (
            <>
              <View style={styles.rowDivider} />
              <SettingRow label="상대방 이름" value={profile.partner_name} />
            </>
          )}
        </Card>
      </View>

      {/* App info section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>앱 정보</Text>
        <Card padding={0} style={styles.sectionCard}>
          <SettingRow label="버전" value="1.0.0" />
          <View style={styles.rowDivider} />
          <SettingRow label="만든 곳" value="Manna Team" />
        </Card>
      </View>

      {/* Account section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>계정</Text>
        <Card padding={0} style={styles.sectionCard}>
          <SettingRow
            label={signingOut ? '로그아웃 중...' : '로그아웃'}
            onPress={signingOut ? undefined : handleSignOut}
            destructive
          />
        </Card>
      </View>

      <Text style={styles.footer}>
        Manna — 신앙 안에서 더 깊은 대화를 ✦
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
    gap: 24,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: 4,
  },
  sectionCard: {
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  destructiveLabel: {
    color: colors.error,
  },
  settingValue: {
    fontSize: 14,
    color: colors.textMuted,
    marginRight: 4,
  },
  settingArrow: {
    fontSize: 18,
    color: colors.textMuted,
  },
  rowDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 16,
  },
  footer: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 8,
  },
  goldActiveCard: {
    backgroundColor: '#FFFDF0',
    borderWidth: 1.5,
    borderColor: '#F0C040',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldActiveLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goldActiveEmoji: {
    fontSize: 28,
  },
  goldActiveInfo: {
    gap: 3,
  },
  goldActiveTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goldActiveTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#8B6A00',
  },
  goldActiveExpiry: {
    fontSize: 12,
    color: colors.textMuted,
  },
  goldPromoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goldPromoEmoji: {
    fontSize: 28,
  },
  goldPromoInfo: {
    flex: 1,
    gap: 3,
  },
  goldPromoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  goldPromoDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
