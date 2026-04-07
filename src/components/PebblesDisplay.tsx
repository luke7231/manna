import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../lib/constants/colors';

interface PebblesDisplayProps {
  amount: number;
}

export function PebblesDisplay({ amount }: PebblesDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🪨</Text>
      <Text style={styles.amount}>{amount.toLocaleString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  emoji: {
    fontSize: 13,
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});
