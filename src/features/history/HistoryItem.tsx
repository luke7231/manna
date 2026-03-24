import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../components/Card';
import { colors } from '../../lib/constants/colors';
import { HistoryItem as HistoryItemType } from '../../types';
import { formatDateShort, formatDayOfWeek } from '../../lib/utils/date';

const CATEGORY_COLORS = {
  faith: colors.faith,
  love: colors.love,
  values: colors.values,
  daily: colors.daily,
};

interface HistoryItemProps {
  item: HistoryItemType;
  isConnected: boolean;
  partnerName?: string;
}

export function HistoryItem({ item, isConnected, partnerName }: HistoryItemProps) {
  const [expanded, setExpanded] = useState(false);
  const { dailyQuestion, myAnswer, partnerAnswer } = item;
  const { question } = dailyQuestion;

  const categoryColor = CATEGORY_COLORS[question.category];
  const dateLabel = formatDateShort(dailyQuestion.question_date);
  const dayLabel = formatDayOfWeek(dailyQuestion.question_date);

  return (
    <Card style={styles.card} padding={18}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={styles.dateSection}>
            <Text style={styles.date}>{dateLabel}</Text>
            <Text style={styles.day}>{dayLabel}</Text>
          </View>
          <View style={[styles.dot, { backgroundColor: categoryColor }]} />
        </View>

        <Text style={styles.question} numberOfLines={expanded ? undefined : 2}>
          {question.content}
        </Text>

        {myAnswer ? (
          <View style={styles.myAnswerPreview}>
            <Text style={styles.myAnswerText} numberOfLines={expanded ? undefined : 2}>
              {myAnswer.answer_text}
            </Text>
          </View>
        ) : (
          <Text style={styles.noAnswerText}>답변을 작성하지 않았어요</Text>
        )}
      </TouchableOpacity>

      {expanded && isConnected && (
        <View style={styles.partnerSection}>
          <View style={styles.divider} />
          <Text style={styles.partnerLabel}>{partnerName ?? '상대방'}</Text>
          {partnerAnswer ? (
            <Text style={styles.partnerAnswerText}>{partnerAnswer.answer_text}</Text>
          ) : (
            <Text style={styles.noAnswerText}>아직 답변하지 않았어요</Text>
          )}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  day: {
    fontSize: 12,
    color: colors.textLight,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  question: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
  myAnswerPreview: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  myAnswerText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
  noAnswerText: {
    fontSize: 13,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  partnerSection: {
    gap: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  partnerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  partnerAnswerText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },
});
