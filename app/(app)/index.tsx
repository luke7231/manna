import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { QuestionCard } from '../../src/features/home/QuestionCard';
import { AnswerStatus } from '../../src/features/home/AnswerStatus';
import { LoadingView } from '../../src/components/LoadingView';
import { EmptyState } from '../../src/components/EmptyState';
import { Button } from '../../src/components/Button';
import { PebblesDisplay } from '../../src/components/PebblesDisplay';
import { colors } from '../../src/lib/constants/colors';
import { getTodayQuestion } from '../../src/lib/supabase/questions';
import { getMyAnswer, getPartnerAnswer } from '../../src/lib/supabase/answers';
import { getPartnerId, addPebbles } from '../../src/lib/supabase/pairing';
import { checkAndAwardAttendance } from '../../src/lib/supabase/profile';
import { formatTodayFull } from '../../src/lib/utils/date';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { useRewardedAd } from '../../src/hooks/useRewardedAd';
import { useGoldStatus } from '../../src/hooks/useGoldStatus';
import { DailyQuestion, Answer } from '../../src/types';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { profile, pair, setPair } = useProfileStore();
  const { isGold } = useGoldStatus();
  const router = useRouter();

  const [dailyQuestion, setDailyQuestion] = useState<DailyQuestion | null>(null);
  const [myAnswer, setMyAnswer] = useState<Answer | null>(null);
  const [partnerAnswer, setPartnerAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isConnected = pair?.status === 'connected';
  const partnerId = pair && user ? getPartnerId(pair, user.id) : null;

  // 리워드 광고 — 시청 완료 시 만나돌 +10
  const { load: loadAd, show: showAd, loaded: adLoaded } = useRewardedAd(
    useCallback(() => {
      if (!pair) return;
      addPebbles(pair.id, 10).then((newBalance) => {
        setPair({ ...pair, pebbles: newBalance });
      });
    }, [pair])
  );

  useEffect(() => {
    loadAd();
  }, []);

  const loadData = useCallback(async () => {
    if (!user) return;

    const dq = await getTodayQuestion();
    setDailyQuestion(dq);

    if (dq) {
      const [mine, partner] = await Promise.all([
        getMyAnswer(user.id, dq.question_id),
        partnerId ? getPartnerAnswer(partnerId, dq.question_id) : null,
      ]);
      setMyAnswer(mine);
      setPartnerAnswer(partner);
    }

    setLoading(false);
  }, [user, partnerId]);

  // 화면 포커스 시 데이터 로드 + 출석 체크
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();

      // 출석 보상 — 연결된 커플이 있을 때만
      if (user && pair?.status === 'connected') {
        checkAndAwardAttendance(user.id, pair.id, addPebbles).then((awarded) => {
          if (awarded > 0) {
            setPair({ ...pair, pebbles: (pair.pebbles ?? 0) + awarded });
          }
        });
      }
    }, [loadData, user, pair])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAnswerPress = () => {
    if (!dailyQuestion) return;
    router.push({
      pathname: '/answer',
      params: {
        questionId: dailyQuestion.question_id,
        questionContent: dailyQuestion.question.content,
      },
    });
  };

  if (loading) return <LoadingView message={t('home.questionLoading')} />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
    >
      {/* Top greeting + 만나돌 잔액 */}
      <View style={styles.greetingRow}>
        <View style={styles.greeting}>
          <Text style={styles.greetingName}>
            {profile?.name ? t('home.greeting', { name: profile.name }) : t('home.greetingDefault')}
          </Text>
          <Text style={styles.todayDate}>{formatTodayFull()}</Text>
        </View>
        {isConnected && (
          <PebblesDisplay amount={pair?.pebbles ?? 0} />
        )}
      </View>

      {/* 리워드 광고 버튼 (연결된 커플만, 골드 아닐 때만) */}
      {isConnected && !isGold && (
        <TouchableOpacity
          style={[styles.adButton, !adLoaded && styles.adButtonDisabled]}
          onPress={showAd}
          disabled={!adLoaded}
          activeOpacity={0.8}
        >
          <Text style={styles.adButtonText}>
            {adLoaded ? t('home.adButton') : t('home.adLoading')}
          </Text>
        </TouchableOpacity>
      )}

      {/* Today's question or empty state */}
      {dailyQuestion ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.todayQuestion')}</Text>
          </View>

          <QuestionCard question={dailyQuestion.question} />

          {/* My answer */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.myAnswer')}</Text>
          </View>
          <AnswerStatus
            label={t('home.myAnswer')}
            answer={myAnswer}
            isMe
            onPress={handleAnswerPress}
          />

          {/* Partner answer */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {profile?.partner_name ? t('home.partnerAnswer', { name: profile.partner_name }) : t('home.partnerAnswerDefault')}
            </Text>
          </View>
          <AnswerStatus
            label={profile?.partner_name ?? t('home.partnerAnswerDefault')}
            answer={partnerAnswer}
            isConnected={isConnected}
            myAnswerExists={!!myAnswer}
          />

          {/* Connect nudge */}
          {!isConnected && (
            <TouchableOpacity
              style={styles.connectNudge}
              onPress={() => router.push('/(app)/pairing')}
              activeOpacity={0.8}
            >
              <Text style={styles.connectNudgeText}>
                {t('home.connectNudge')}
              </Text>
              <Text style={styles.connectNudgeArrow}>→</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <EmptyState
          emoji="☀️"
          title={t('home.noQuestion')}
          description={t('home.noQuestionDesc')}
          action={
            <Button title={t('common.refresh')} variant="secondary" onPress={handleRefresh} />
          }
        />
      )}

      {/* History shortcut */}
      <TouchableOpacity
        style={styles.historyShortcut}
        onPress={() => router.push('/(app)/history')}
        activeOpacity={0.8}
      >
        <Text style={styles.historyShortcutText}>{t('home.historyShortcut')}</Text>
        <Text style={styles.historyShortcutArrow}>→</Text>
      </TouchableOpacity>
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
    gap: 12,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  greeting: {
    gap: 4,
    flex: 1,
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  todayDate: {
    fontSize: 13,
    color: colors.textMuted,
  },
  adButton: {
    backgroundColor: colors.accentLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  adButtonDisabled: {
    opacity: 0.5,
  },
  adButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
  },
  sectionHeader: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  connectNudge: {
    backgroundColor: colors.accentLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  connectNudgeText: {
    flex: 1,
    fontSize: 13,
    color: colors.accent,
    fontWeight: '500',
    lineHeight: 19,
  },
  connectNudgeArrow: {
    fontSize: 16,
    color: colors.accent,
    marginLeft: 8,
  },
  historyShortcut: {
    backgroundColor: colors.cardAlt,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  historyShortcutText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  historyShortcutArrow: {
    fontSize: 16,
    color: colors.textMuted,
  },
});
