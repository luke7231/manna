import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { HistoryItem } from '../../src/features/history/HistoryItem';
import { LoadingView } from '../../src/components/LoadingView';
import { EmptyState } from '../../src/components/EmptyState';
import { GoldBadge } from '../../src/components/GoldBadge';
import { colors } from '../../src/lib/constants/colors';
import {
  getHistoryQuestions,
  getAnswersForQuestions,
  getPartnerAnswersForQuestions,
} from '../../src/lib/supabase/questions';
import { getPartnerId } from '../../src/lib/supabase/pairing';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { useGoldStatus } from '../../src/hooks/useGoldStatus';
import { DailyQuestion, Answer, HistoryItem as HistoryItemType } from '../../src/types';

const FREE_HISTORY_LIMIT = 30; // 무료: 최근 30개

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const { profile, pair } = useProfileStore();
  const { isGold } = useGoldStatus();
  const router = useRouter();

  const [items, setItems] = useState<HistoryItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isConnected = pair?.status === 'connected';
  const partnerId = pair && user ? getPartnerId(pair, user.id) : null;

  const loadHistory = useCallback(async () => {
    if (!user) return;

    // 골드: 무제한, 무료: 최근 30개
    const limit = isGold ? 0 : FREE_HISTORY_LIMIT; // 0 = no limit in query
    const dailyQuestions: DailyQuestion[] = await getHistoryQuestions(isGold ? 9999 : FREE_HISTORY_LIMIT);
    if (dailyQuestions.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const questionIds = dailyQuestions.map((dq) => dq.question_id);

    const [myAnswers, partnerAnswers] = await Promise.all([
      getAnswersForQuestions(questionIds, user.id),
      partnerId ? getPartnerAnswersForQuestions(questionIds, partnerId) : [],
    ]);

    const myAnswerMap: Record<string, Answer> = {};
    myAnswers.forEach((a) => { myAnswerMap[a.question_id] = a; });

    const partnerAnswerMap: Record<string, Answer> = {};
    partnerAnswers.forEach((a) => { partnerAnswerMap[a.question_id] = a; });

    const historyItems: HistoryItemType[] = dailyQuestions.map((dq) => ({
      dailyQuestion: dq,
      myAnswer: myAnswerMap[dq.question_id] ?? null,
      partnerAnswer: partnerAnswerMap[dq.question_id] ?? null,
    }));

    setItems(historyItems);
    setLoading(false);
  }, [user, partnerId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadHistory();
    }, [loadHistory])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  if (loading) return <LoadingView message="히스토리를 불러오고 있어요..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>히스토리</Text>
          {isGold && <GoldBadge size="sm" />}
        </View>
        <Text style={styles.headerSub}>
          {isGold ? '전체 기록을 볼 수 있어요' : `최근 ${FREE_HISTORY_LIMIT}일 기록을 볼 수 있어요`}
        </Text>
        {!isGold && (
          <TouchableOpacity onPress={() => router.push('/(app)/gold')} style={styles.goldNudge}>
            <Text style={styles.goldNudgeText}>⭐ 골드로 히스토리 무제한 보기 →</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.dailyQuestion.id}
        renderItem={({ item }) => (
          <HistoryItem
            item={item}
            isConnected={isConnected}
            partnerName={profile?.partner_name ?? undefined}
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <EmptyState
            emoji="📭"
            title="아직 질문이 없어요"
            description="매일 새로운 질문이 추가돼요"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  goldNudge: {
    marginTop: 4,
  },
  goldNudgeText: {
    fontSize: 13,
    color: '#8B6A00',
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
