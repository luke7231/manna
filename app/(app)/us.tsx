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
import { PetDisplay } from '../../src/features/pet/PetDisplay';
import { RoomView } from '../../src/features/room/RoomView';
import { ShopView } from '../../src/features/room/ShopView';
import { PebblesDisplay } from '../../src/components/PebblesDisplay';
import { Card } from '../../src/components/Card';
import { LoadingView } from '../../src/components/LoadingView';
import { colors } from '../../src/lib/constants/colors';
import { getOrCreatePet } from '../../src/lib/supabase/pet';
import { getOrCreateRoom } from '../../src/lib/supabase/room';
import { getShopItems, getMyItems } from '../../src/lib/supabase/shop';
import { useAuthStore } from '../../src/stores/authStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { Pet, Room, ShopItem } from '../../src/types';

type ShopTab = 'theme' | 'furniture' | 'pet_name';

export default function UsScreen() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { pair } = useProfileStore();

  const [pet, setPet] = useState<Pet | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [myItems, setMyItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shopVisible, setShopVisible] = useState(false);
  const [shopTab, setShopTab] = useState<ShopTab>('theme');

  const isConnected = pair?.status === 'connected';

  const loadData = useCallback(async () => {
    if (!pair || pair.status !== 'connected') {
      setLoading(false);
      return;
    }
    const [p, r, items, owned] = await Promise.all([
      getOrCreatePet(pair.id),
      getOrCreateRoom(pair.id),
      getShopItems(),
      getMyItems(pair.id),
    ]);
    setPet(p);
    setRoom(r);
    setShopItems(items);
    setMyItems(owned);
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

  const openShop = (tab: ShopTab) => {
    setShopTab(tab);
    setShopVisible(true);
  };

  if (loading) return <LoadingView />;

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{t('tabs.together')}</Text>
            <Text style={styles.headerSub}>{t('us.headerSub')}</Text>
          </View>
          {isConnected && (
            <TouchableOpacity style={styles.shopBtn} onPress={() => openShop('theme')}>
              <Text style={styles.shopBtnText}>{t('shop.title')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isConnected ? (
          /* 연결 전 안내 */
          <Card style={styles.emptyCard} padding={24}>
            <Text style={styles.emptyEmoji}>🥚</Text>
            <Text style={styles.emptyTitle}>{t('spirit.connectFirst')}</Text>
            <Text style={styles.emptyDesc}>{t('us.connectDesc')}</Text>
          </Card>
        ) : (
          <>
            {/* 만나돌 잔액 */}
            <View style={styles.pebblesRow}>
              <Text style={styles.pebblesLabel}>{t('pebbles.ourPebbles')}</Text>
              <PebblesDisplay amount={pair?.pebbles ?? 0} />
            </View>

            {/* 반려몽 */}
            {pet && (
              <Card style={styles.petCard} padding={24}>
                <PetDisplay
                  pet={pet}
                  onRename={() => openShop('pet_name')}
                />
              </Card>
            )}

            {/* 방꾸미기 */}
            <Card padding={16}>
              <RoomView
                room={room}
                shopItems={shopItems}
                onOpenShop={openShop}
              />
            </Card>
          </>
        )}
      </ScrollView>

      {/* 상점 모달 */}
      {isConnected && pair && (
        <ShopView
          visible={shopVisible}
          onClose={() => setShopVisible(false)}
          initialTab={shopTab}
          pairId={pair.id}
          room={room}
          onRoomUpdated={setRoom}
          onItemsPurchased={setMyItems}
          petId={pet?.id ?? null}
          onPetRenamed={(name) => {
            if (pet) setPet({ ...pet, name });
          }}
        />
      )}
    </>
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
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
    marginTop: 2,
  },
  shopBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 4,
  },
  shopBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
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
});
