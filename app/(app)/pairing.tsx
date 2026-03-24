import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { InviteCodePanel } from '../../src/features/pairing/InviteCodePanel';
import { Card } from '../../src/components/Card';
import { LoadingView } from '../../src/components/LoadingView';
import { colors } from '../../src/lib/constants/colors';
import { getMyInviteCode } from '../../src/lib/supabase/pairing';
import { getUserPair } from '../../src/lib/supabase/pairing';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';

export default function PairingScreen() {
  const { user } = useAuthStore();
  const { profile, pair, setPair, loadProfile } = useProfileStore();

  const [existingCode, setExistingCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    // Reload profile and pair from DB
    await loadProfile(user.id);
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
        <Text style={styles.headerTitle}>연결</Text>
        <Text style={styles.headerSub}>초대 코드로 상대방과 연결해요</Text>
      </View>

      {isConnected ? (
        <Card style={styles.connectedCard} padding={24}>
          <Text style={styles.connectedEmoji}>💑</Text>
          <Text style={styles.connectedTitle}>연결되었어요!</Text>
          <Text style={styles.connectedDesc}>
            {profile?.partner_name
              ? `${profile.partner_name}와(과) 연결되어 있어요.\n이제 서로의 답변을 볼 수 있어요 ✨`
              : '상대방과 연결되어 있어요.\n이제 서로의 답변을 볼 수 있어요 ✨'}
          </Text>
        </Card>
      ) : (
        <InviteCodePanel
          userId={user!.id}
          existingCode={existingCode}
          onConnected={handleConnected}
        />
      )}

      {/* Info card */}
      <Card style={styles.infoCard} padding={16}>
        <Text style={styles.infoTitle}>💡 연결은 어떻게 하나요?</Text>
        <Text style={styles.infoText}>
          {'1. 내 초대 코드를 생성해서 상대방에게 공유하세요\n2. 상대방이 코드를 입력하면 자동으로 연결돼요\n3. 연결 후엔 서로의 답변을 확인할 수 있어요'}
        </Text>
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
