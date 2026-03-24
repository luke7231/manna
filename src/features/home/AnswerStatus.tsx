import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../../components/Card';
import { colors } from '../../lib/constants/colors';
import { Answer } from '../../types';

interface AnswerStatusProps {
  label: string;
  answer: Answer | null;
  isMe?: boolean;
  isConnected?: boolean;
  myAnswerExists?: boolean;
  onPress?: () => void;
}

export function AnswerStatus({
  label,
  answer,
  isMe = false,
  isConnected = false,
  myAnswerExists = false,
  onPress,
}: AnswerStatusProps) {
  const renderContent = () => {
    if (isMe) {
      if (answer) {
        return (
          <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <Text style={styles.answerText} numberOfLines={3}>
              {answer.answer_text}
            </Text>
            <Text style={styles.editHint}>탭하여 수정하기</Text>
          </TouchableOpacity>
        );
      }
      return (
        <TouchableOpacity
          style={styles.writeButton}
          onPress={onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.writeButtonText}>✏️ 오늘의 답변 작성하기</Text>
        </TouchableOpacity>
      );
    }

    // Partner view
    if (!isConnected) {
      return (
        <Text style={styles.notConnected}>
          상대방과 연결되면{'\n'}답변을 확인할 수 있어요 💌
        </Text>
      );
    }
    if (!myAnswerExists) {
      return (
        <Text style={styles.notConnected}>
          내 답변을 먼저 작성해야{'\n'}상대방 답변을 볼 수 있어요 🔒
        </Text>
      );
    }
    if (!answer) {
      return <Text style={styles.noAnswer}>아직 답변하지 않았어요</Text>;
    }
    return <Text style={styles.answerText}>{answer.answer_text}</Text>;
  };

  return (
    <Card style={styles.card} padding={18}>
      <Text style={styles.label}>{label}</Text>
      {renderContent()}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  answerText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 23,
  },
  editHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  writeButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  writeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  notConnected: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    paddingVertical: 8,
  },
  noAnswer: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
