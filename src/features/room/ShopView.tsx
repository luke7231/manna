import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../lib/constants/colors';
import { ShopItem, Room } from '../../types';
import { getShopItems, getMyItems, purchaseItem } from '../../lib/supabase/shop';
import { updateRoomTheme, updateRoomFurniture } from '../../lib/supabase/room';
import { renamePet } from '../../lib/supabase/pet';
import { useProfileStore } from '../../stores/profileStore';
import { useGoldStatus } from '../../hooks/useGoldStatus';

type Tab = 'theme' | 'furniture' | 'pet_name';

interface ShopViewProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: Tab;
  pairId: string;
  room: Room | null;
  onRoomUpdated: (room: Room) => void;
  onItemsPurchased: (itemIds: string[]) => void;
  petId: string | null;
  onPetRenamed: (name: string) => void;
}

export function ShopView({
  visible,
  onClose,
  initialTab = 'theme',
  pairId,
  room,
  onRoomUpdated,
  onItemsPurchased,
  petId,
  onPetRenamed,
}: ShopViewProps) {
  const { pair, setPair } = useProfileStore();
  const { isGold } = useGoldStatus();
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [myItems, setMyItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [renameItemId, setRenameItemId] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
      loadShop();
    }
  }, [visible, initialTab]);

  const loadShop = async () => {
    setLoading(true);
    const [items, owned] = await Promise.all([getShopItems(), getMyItems(pairId)]);
    setShopItems(items);
    setMyItems(owned);
    setLoading(false);
  };

  const handleBuy = async (item: ShopItem) => {
    if (!pair) return;

    // 이름 변경권: 구매 전 이름 입력
    if (item.category === 'pet_name') {
      setRenameItemId(item.id);
      setRenameInput('');
      setShowRenameInput(true);
      return;
    }

    setBuying(item.id);
    const result = await purchaseItem(pairId, item.id);
    setBuying(null);

    if ('error' in result) {
      const msg =
        result.error === 'insufficient_pebbles'
          ? '만나돌이 부족해요 🪨'
          : '구매 중 오류가 발생했어요';
      Alert.alert('구매 실패', msg);
      return;
    }

    const newMyItems = [...myItems, item.id];
    setMyItems(newMyItems);
    onItemsPurchased(newMyItems);
    setPair({ ...pair, pebbles: result.balance });
  };

  const handleEquipTheme = async (item: ShopItem) => {
    if (!room) return;
    await updateRoomTheme(pairId, item.id);
    onRoomUpdated({ ...room, theme_item_id: item.id });
  };

  const handleEquipFurniture = async (item: ShopItem) => {
    if (!room) return;
    const current = room.furniture ?? [];
    const alreadyEquipped = current.find((f) => f.item_id === item.id);
    if (alreadyEquipped) {
      // 이미 배치된 경우 제거
      const updated = current.filter((f) => f.item_id !== item.id);
      await updateRoomFurniture(pairId, updated);
      onRoomUpdated({ ...room, furniture: updated });
    } else if (current.length < 6) {
      const updated = [...current, { item_id: item.id, slot: current.length + 1 }];
      await updateRoomFurniture(pairId, updated);
      onRoomUpdated({ ...room, furniture: updated });
    } else {
      Alert.alert('슬롯 부족', '가구 슬롯이 가득 찼어요. 기존 가구를 먼저 제거해주세요.');
    }
  };

  const handleConfirmRename = async () => {
    const trimmed = renameInput.trim();
    if (!trimmed) {
      Alert.alert('이름을 입력해주세요');
      return;
    }
    if (!renameItemId || !pair) return;

    setBuying(renameItemId);
    const result = await purchaseItem(pairId, renameItemId);
    setBuying(null);

    if ('error' in result) {
      const msg =
        result.error === 'insufficient_pebbles'
          ? '만나돌이 부족해요 🪨'
          : '구매 중 오류가 발생했어요';
      Alert.alert('구매 실패', msg);
      setShowRenameInput(false);
      return;
    }

    if (petId) await renamePet(pairId, trimmed);
    onPetRenamed(trimmed);
    setPair({ ...pair, pebbles: result.balance });
    const newMyItems = [...myItems, renameItemId];
    setMyItems(newMyItems);
    onItemsPurchased(newMyItems);
    setShowRenameInput(false);
    Alert.alert('완료', `반려몽 이름이 "${trimmed}"(으)로 바뀌었어요!`);
  };

  const filtered = shopItems.filter((i) => i.category === activeTab);

  const isGoldLocked = (item: ShopItem): boolean =>
    item.is_gold_only && !isGold;

  const getButtonLabel = (item: ShopItem): string => {
    if (isGoldLocked(item)) return '⭐ 골드 전용';
    const owned = myItems.includes(item.id);
    if (!owned) return item.price === 0 ? '무료 받기' : `🪨 ${item.price}`;
    if (item.category === 'theme') {
      return room?.theme_item_id === item.id ? '✓ 적용 중' : '장착';
    }
    if (item.category === 'furniture') {
      return room?.furniture?.find((f) => f.item_id === item.id) ? '✓ 배치 중' : '배치';
    }
    return '보유 중';
  };

  const isEquipped = (item: ShopItem): boolean => {
    if (item.category === 'theme') return room?.theme_item_id === item.id;
    if (item.category === 'furniture') return !!room?.furniture?.find((f) => f.item_id === item.id);
    return false;
  };

  const TAB_LABELS: Record<Tab, string> = {
    theme: '테마',
    furniture: '가구',
    pet_name: '이름변경',
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>상점 🛍️</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceText}>🪨 {pair?.pebbles ?? 0}</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>닫기</Text>
          </TouchableOpacity>
        </View>

        {/* 탭 */}
        <View style={styles.tabs}>
          {(['theme', 'furniture', 'pet_name'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {TAB_LABELS[tab]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 이름 변경 입력 */}
        {showRenameInput && (
          <View style={styles.renameBox}>
            <Text style={styles.renameLabel}>새 이름을 입력해주세요</Text>
            <TextInput
              style={styles.renameInput}
              value={renameInput}
              onChangeText={setRenameInput}
              placeholder="반려몽 이름"
              placeholderTextColor={colors.textLight}
              maxLength={10}
              autoFocus
            />
            <View style={styles.renameActions}>
              <TouchableOpacity style={styles.renameCancelBtn} onPress={() => setShowRenameInput(false)}>
                <Text style={styles.renameCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.renameConfirmBtn} onPress={handleConfirmRename}>
                <Text style={styles.renameConfirmText}>변경하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 아이템 목록 */}
        {loading ? (
          <ActivityIndicator style={styles.loader} color={colors.primary} />
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {filtered.map((item) => {
              const owned = myItems.includes(item.id);
              const equipped = isEquipped(item);
              const isBuying = buying === item.id;
              const locked = isGoldLocked(item);
              const label = getButtonLabel(item);

              return (
                <View key={item.id} style={[styles.itemCard, equipped && styles.itemCardEquipped, locked && styles.itemCardLocked]}>
                  <Text style={[styles.itemEmoji, locked && styles.itemEmojiLocked]}>{item.emoji}</Text>
                  <View style={styles.itemInfo}>
                    <View style={styles.itemNameRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.is_gold_only && <Text style={styles.goldOnlyTag}>⭐</Text>}
                    </View>
                    {item.description && (
                      <Text style={styles.itemDesc}>{item.description}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      locked && styles.actionBtnLocked,
                      owned && !equipped && styles.actionBtnOwned,
                      equipped && styles.actionBtnEquipped,
                    ]}
                    disabled={locked || equipped || isBuying || (item.category === 'pet_name' && owned)}
                    onPress={() => {
                      if (locked) return;
                      if (!owned) {
                        handleBuy(item);
                      } else if (item.category === 'theme') {
                        handleEquipTheme(item);
                      } else if (item.category === 'furniture') {
                        handleEquipFurniture(item);
                      }
                    }}
                  >
                    {isBuying ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={[styles.actionBtnText, (owned || equipped) && styles.actionBtnTextDark]}>
                        {label}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  balanceRow: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 12,
  },
  balanceText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  closeBtn: {
    paddingHorizontal: 4,
  },
  closeBtnText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
    marginBottom: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: '#fff',
  },
  renameBox: {
    margin: 16,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  renameLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  renameInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  renameActions: {
    flexDirection: 'row',
    gap: 10,
  },
  renameCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  renameCancelText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  renameConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  renameConfirmText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '700',
  },
  loader: {
    marginTop: 60,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  itemCardEquipped: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  itemCardLocked: {
    opacity: 0.65,
    backgroundColor: colors.cardAlt,
  },
  itemEmoji: {
    fontSize: 32,
    width: 40,
    textAlign: 'center',
  },
  itemEmojiLocked: {
    opacity: 0.5,
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  goldOnlyTag: {
    fontSize: 13,
  },
  itemDesc: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 72,
    alignItems: 'center',
  },
  actionBtnOwned: {
    backgroundColor: colors.border,
  },
  actionBtnEquipped: {
    backgroundColor: colors.primaryLight,
  },
  actionBtnLocked: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#F0C040',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  actionBtnTextDark: {
    color: colors.text,
  },
});
