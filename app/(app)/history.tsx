import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { HistoryItem } from '../../src/features/history/HistoryItem';
import { LoadingView } from '../../src/components/LoadingView';
import { EmptyState } from '../../src/components/EmptyState';
import { colors } from '../../src/lib/constants/colors';
import {
  getHistoryQuestions,
  getAnswersForQuestions,
  getPartnerAnswersForQuestions,
} from '../../src/lib/supabase/questions';
import { getPartnerId } from '../../src/lib/supabase/pairing';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { DailyQuestion, Answer, HistoryItem as HistoryItemType } from '../../src/types';

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const { profile, pair } = useProfileStore();

  const [items, setItems] = useState<HistoryItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isConnected = pair?.status === 'connected';
  const partnerId = pair && user ? getPartnerId(pair, user.id) : null;

  const loadHistory = useCallback(async () => {
    if (!user) return;

    const dailyQuestions: DailyQuestion[] = await getHistoryQuestions(30);
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
        <Text style={styles.headerTitle}>히스토리</Text>
        <Text style={styles.headerSub}>지난 질문과 답변을 돌아봐요</Text>
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});
