import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors } from '../../lib/constants/colors';
import { Room, ShopItem } from '../../types';
import i18n from '../../lib/i18n';

const THEME_BG: Record<string, string> = {
  '00000000-0000-0000-0010-000000000001': '#FFF9F0',
  '00000000-0000-0000-0010-000000000002': '#EDF5E9',
  '00000000-0000-0000-0010-000000000003': '#E8F4FB',
  '00000000-0000-0000-0010-000000000004': '#F0EDF8',
  '00000000-0000-0000-0010-000000000005': '#FFFDE7',
  '00000000-0000-0000-0010-000000000006': '#F3E5F5',
};
const DEFAULT_BG = '#FFF9F0';

interface RoomViewProps {
  room: Room | null;
  shopItems: ShopItem[];
  onOpenShop: (tab: 'theme' | 'furniture') => void;
}

export function RoomView({ room, shopItems, onOpenShop }: RoomViewProps) {
  const { t } = useTranslation();

  const themeBg = room?.theme_item_id
    ? (THEME_BG[room.theme_item_id] ?? DEFAULT_BG)
    : DEFAULT_BG;

  const themeItem = room?.theme_item_id
    ? shopItems.find((i) => i.id === room.theme_item_id)
    : null;
  const themeName = themeItem
    ? `${i18n.language === 'ko' ? themeItem.name : (themeItem.en_name ?? themeItem.name)} ${themeItem.emoji ?? ''}`
    : t('room.themeDefault');

  const furnitureMap = Object.fromEntries(shopItems.map((i) => [i.id, i]));

  const slots: (ShopItem | null)[] = Array(6).fill(null);
  (room?.furniture ?? []).forEach(({ item_id, slot }) => {
    const idx = slot - 1;
    if (idx >= 0 && idx < 6) slots[idx] = furnitureMap[item_id] ?? null;
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t('room.title')}</Text>
        <TouchableOpacity style={styles.themeBtn} onPress={() => onOpenShop('theme')}>
          <Text style={styles.themeBtnText}>{themeName}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.room, { backgroundColor: themeBg }]}>
        <View style={styles.furnitureGrid}>
          {slots.map((item, idx) => (
            <TouchableOpacity
              key={idx}
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

      <TouchableOpacity style={styles.furnitureBtn} onPress={() => onOpenShop('furniture')}>
        <Text style={styles.furnitureBtnText}>{t('room.furnitureBtn')}</Text>
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
