import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../lib/constants/colors';
import { Room, ShopItem } from '../../types';

// 테마별 배경 스타일
const THEME_STYLES: Record<string, { bg: string; label: string }> = {
  '00000000-0000-0000-0010-000000000001': { bg: '#FFF9F0', label: '기본 방 🏠' },
  '00000000-0000-0000-0010-000000000002': { bg: '#EDF5E9', label: '숲속 오두막 🌲' },
  '00000000-0000-0000-0010-000000000003': { bg: '#E8F4FB', label: '바다 뷰 🌊' },
  '00000000-0000-0000-0010-000000000004': { bg: '#F0EDF8', label: '별빛 다락방 ✨' },
};

const DEFAULT_THEME = { bg: '#FFF9F0', label: '기본 방 🏠' };

interface RoomViewProps {
  room: Room | null;
  shopItems: ShopItem[];
  onOpenShop: (tab: 'theme' | 'furniture') => void;
}

export function RoomView({ room, shopItems, onOpenShop }: RoomViewProps) {
  const themeStyle = room?.theme_item_id
    ? THEME_STYLES[room.theme_item_id] ?? DEFAULT_THEME
    : DEFAULT_THEME;

  const furnitureMap = Object.fromEntries(shopItems.map((i) => [i.id, i]));

  // 6슬롯 배열 구성
  const slots: (ShopItem | null)[] = Array(6).fill(null);
  (room?.furniture ?? []).forEach(({ item_id, slot }) => {
    const idx = slot - 1;
    if (idx >= 0 && idx < 6) slots[idx] = furnitureMap[item_id] ?? null;
  });

  return (
    <View style={styles.container}>
      {/* 방 제목 + 버튼 */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>우리의 방</Text>
        <TouchableOpacity style={styles.themeBtn} onPress={() => onOpenShop('theme')}>
          <Text style={styles.themeBtnText}>{themeStyle.label}</Text>
        </TouchableOpacity>
      </View>

      {/* 방 내부 */}
      <View style={[styles.room, { backgroundColor: themeStyle.bg }]}>
        <View style={styles.furnitureGrid}>
          {slots.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={styles.slot}
              onPress={() => onOpenShop('furniture')}
              activeOpacity={0.7}
            >
              {item ? (
                <Text style={styles.slotEmoji}>{item.emoji}</Text>
              ) : (
                <Text style={styles.slotPlus}>+</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 가구 변경 버튼 */}
      <TouchableOpacity style={styles.furnitureBtn} onPress={() => onOpenShop('furniture')}>
        <Text style={styles.furnitureBtnText}>🛋️ 가구 변경</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  themeBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  themeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  room: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  furnitureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  slot: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.08)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotEmoji: {
    fontSize: 32,
  },
  slotPlus: {
    fontSize: 24,
    color: colors.textLight,
    fontWeight: '300',
  },
  furnitureBtn: {
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
  },
  furnitureBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
