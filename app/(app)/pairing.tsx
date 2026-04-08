import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { InviteCodePanel } from '../../src/features/pairing/InviteCodePanel';
import { Card } from '../../src/components/Card';
import { LoadingView } from '../../src/components/LoadingView';
import { colors } from '../../src/lib/constants/colors';
import { getMyInviteCode, getUserPair, updateNotificationTime } from '../../src/lib/supabase/pairing';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { scheduleDailyQuestionNotification } from '../../src/lib/notifications';

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 ~ 22

function formatHour(hour: number, t: ReturnType<typeof useTranslation>['t']): string {
  if (hour < 12) return t('pairing.amTime', { h: hour });
  if (hour === 12) return t('pairing.noon');
  return t('pairing.pmTime', { h: hour - 12 });
}

export default function PairingScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { profile, pair, setPair, loadProfile } = useProfileStore();

  const [existingCode, setExistingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingTime, setUpdatingTime] = useState(false);

  const isConnected = pair?.status === 'connected';

  const loadData = useCallback(async () => {
    if (!user) return;
    const [currentPair, code] = await Promise.all([
      getUserPair(user.id),
      getMyInviteCode(user.id),
    ]);
    setPair(currentPair);
    setExistingCode(code);
    setLoading(false);
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleConnected = async () => {
    if (!user) return;
    await loadProfile(user.id);
  };

  const handleTimeChange = async (hour: number) => {
    if (!pair || updatingTime) return;
    setUpdatingTime(true);
    await updateNotificationTime(pair.id, hour, 0);
    setPair({ ...pair, notification_hour: hour, notification_minute: 0 });
    await scheduleDailyQuestionNotification(hour, 0);
    setUpdatingTime(false);
  };

  if (loading) return <LoadingView />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('pairing.title')}</Text>
        <Text style={styles.headerSub}>{t('pairing.subtitle')}</Text>
      </View>

      {isConnected ? (
        <>
          <Card style={styles.connectedCard} padding={24}>
            <Text style={styles.connectedEmoji}>💑</Text>
            <Text style={styles.connectedTitle}>{t('pairing.connectedTitle')}</Text>
            <Text style={styles.connectedDesc}>
              {profile?.partner_name
                ? t('pairing.connectedWith', { name: profile.partner_name })
                : t('pairing.connectedPartner')}
            </Text>
          </Card>

          {/* 알림 시간 선택 */}
          <Card style={styles.notifCard} padding={20}>
            <Text style={styles.notifTitle}>{t('pairing.notificationTitle')}</Text>
            <Text style={styles.notifDesc}>
              {t('pairing.notificationDesc')}
            </Text>
            <Text style={styles.currentTime}>
              {formatHour(pair?.notification_hour ?? 9, t)}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourList}
            >
              {HOURS.map((hour) => {
                const selected = (pair?.notification_hour ?? 9) === hour;
                return (
                  <TouchableOpacity
                    key={hour}
                    style={[styles.hourChip, selected && styles.hourChipSelected]}
                    onPress={() => handleTimeChange(hour)}
                    disabled={updatingTime}
                  >
                    <Text style={[styles.hourChipText, selected && styles.hourChipTextSelected]}>
                      {formatHour(hour, t)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Card>
        </>
      ) : (
        <InviteCodePanel
          userId={user!.id}
          existingCode={existingCode}
          onConnected={handleConnected}
        />
      )}

      {/* Info card */}
      <Card style={styles.infoCard} padding={16}>
        <Text style={styles.infoTitle}>{t('pairing.howToTitle')}</Text>
        <Text style={styles.infoText}>{t('pairing.howToDesc')}</Text>
      </Card>
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
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerSub: {
    fontSize: 13,
    color: colors.textMuted,
  },
  connectedCard: {
    alignItems: 'center',
    gap: 10,
  },
  connectedEmoji: {
    fontSize: 48,
  },
  connectedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  connectedDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  notifCard: {
    gap: 12,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  notifDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  currentTime: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  hourList: {
    gap: 8,
    paddingVertical: 4,
  },
  hourChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hourChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hourChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  hourChipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  infoCard: {
    gap: 10,
    backgroundColor: colors.cardAlt,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  infoText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 21,
  },
});
