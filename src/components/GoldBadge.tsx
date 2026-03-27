import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../lib/constants/colors';

interface GoldBadgeProps {
  size?: 'sm' | 'md';
}

export function GoldBadge({ size = 'md' }: GoldBadgeProps) {
  return (
    <View style={[styles.badge, size === 'sm' && styles.badgeSm]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm]}>⭐ 골드</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: '#FFF3CD',
    borderWidth: 1,
    borderColor: '#F0C040',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B6A00',
  },
  textSm: {
    fontSize: 11,
  },
});
