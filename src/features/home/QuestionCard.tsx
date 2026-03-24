import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../../components/Card';
import { colors } from '../../lib/constants/colors';
import { Question } from '../../types';

const CATEGORY_LABELS: Record<Question['category'], string> = {
  faith: '신앙',
  love: '사랑',
  values: '가치관',
  daily: '일상',
};

const CATEGORY_COLORS: Record<Question['category'], { bg: string; text: string }> = {
  faith: { bg: colors.faithLight, text: colors.faith },
  love: { bg: colors.loveLight, text: colors.love },
  values: { bg: colors.valuesLight, text: colors.values },
  daily: { bg: colors.dailyLight, text: colors.daily },
};

interface QuestionCardProps {
  question: Question;
  dateLabel?: string;
}

export function QuestionCard({ question, dateLabel }: QuestionCardProps) {
  const categoryStyle = CATEGORY_COLORS[question.category];

  return (
    <Card style={styles.card} padding={24}>
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: categoryStyle.bg }]}>
          <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
            {CATEGORY_LABELS[question.category]}
          </Text>
        </View>
        {dateLabel && <Text style={styles.dateLabel}>{dateLabel}</Text>}
      </View>
      <Text style={styles.content}>{question.content}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  content: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 30,
  },
});
