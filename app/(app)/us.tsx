import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { PetDisplay } from '../../src/features/pet/PetDisplay';
import { PebblesDisplay } from '../../src/components/PebblesDisplay';
import { Card } from '../../src/components/Card';
import { LoadingView } from '../../src/components/LoadingView';
import { colors } from '../../src/lib/constants/colors';
import { getOrCreatePet } from '../../src/lib/supabase/pet';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { Pet } from '../../src/types';

export default function UsScreen() {
  const { user } = useAuthStore();
  const { pair } = useProfileStore();

  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isConnected = pair?.status === 'connected';

  const loadData = useCallback(async () => {
    if (!pair || pair.status !== 'connected') {
      setLoading(false);
      return;
    }
    const p = await getOrCreatePet(pair.id);
    setPet(p);
    setLoading(false);
  }, [pair]);

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

  if (loading) return <LoadingView />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>우리</Text>
        <Text style={styles.headerSub}>함께 키워가는 공간이에요</Text>
      </View>

      {!isConnected ? (
        /* 연결 전 안내 */
        <Card style={styles.emptyCard} padding={24}>
          <Text style={styles.emptyEmoji}>🥚</Text>
          <Text style={styles.emptyTitle}>연결 후 반려몽이 태어나요</Text>
          <Text style={styles.emptyDesc}>
            연결 탭에서 상대방과 연결하면{'\n'}반려몽이 알에서 깨어나요!
          </Text>
        </Card>
      ) : (
        <>
          {/* 만나돌 잔액 */}
          <View style={styles.pebblesRow}>
            <Text style={styles.pebblesLabel}>우리의 만나돌</Text>
            <PebblesDisplay amount={pair?.pebbles ?? 0} />
          </View>

          {/* 반려몽 */}
          {pet && (
            <Card style={styles.petCard} padding={24}>
              <PetDisplay pet={pet} />
            </Card>
          )}

          {/* 방꾸미기 — Phase 3 */}
          <Card style={styles.comingSoonCard} padding={20}>
            <Text style={styles.comingSoonTitle}>🏠 방꾸미기</Text>
            <Text style={styles.comingSoonDesc}>
              만나돌로 방을 꾸미는 기능이 곧 열려요!
            </Text>
          </Card>
        </>
      )}
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
    gap: 16,
  },
  header: {
    gap: 4,
    marginBottom: 4,
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
  pebblesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  pebblesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  petCard: {
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  comingSoonCard: {
    gap: 8,
    backgroundColor: colors.cardAlt,
  },
  comingSoonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  comingSoonDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
