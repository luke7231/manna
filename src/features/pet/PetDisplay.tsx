import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Pet, PET_STAGES, getPetStage } from '../../types';
import { colors } from '../../lib/constants/colors';

interface PetDisplayProps {
  pet: Pet;
  onRename?: () => void;
}

export function PetDisplay({ pet, onRename }: PetDisplayProps) {
  const stageIndex = getPetStage(pet.total_answers);
  const current = PET_STAGES[stageIndex];
  const isMaxStage = stageIndex === PET_STAGES.length - 1;

  // 현재 단계 내 진행률
  const stageStart = stageIndex === 0 ? 0 : PET_STAGES[stageIndex - 1].next ?? 0;
  const stageEnd = current.next ?? pet.total_answers;
  const stageProgress = pet.total_answers - stageStart;
  const stageTotal = isMaxStage ? 1 : stageEnd - stageStart;
  const progressRatio = isMaxStage ? 1 : Math.min(stageProgress / stageTotal, 1);

  return (
    <View style={styles.container}>
      {/* 반려몽 이모지 */}
      <Text style={styles.petEmoji}>{current.emoji}</Text>

      {/* 이름 + 단계 */}
      <TouchableOpacity onPress={onRename} disabled={!onRename}>
        <Text style={styles.petName}>{pet.name} {onRename ? '✏️' : ''}</Text>
      </TouchableOpacity>
      <Text style={styles.stageLabel}>{current.label} 단계</Text>

      {/* 성장 진행 바 */}
      {isMaxStage ? (
        <View style={styles.maxStageRow}>
          <Text style={styles.maxStageText}>완전히 성장했어요 🎉</Text>
        </View>
      ) : (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {stageProgress} / {stageTotal} 답변 → {PET_STAGES[stageIndex + 1]?.label}
          </Text>
        </View>
      )}

      {/* 총 답변 수 */}
      <Text style={styles.totalAnswers}>총 {pet.total_answers}개의 답변으로 함께 자라고 있어요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  petEmoji: {
    fontSize: 80,
    lineHeight: 90,
  },
  petName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  stageLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: 'hidden',
  },
  progressSection: {
    width: '100%',
    gap: 6,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  maxStageRow: {
    marginTop: 4,
  },
  maxStageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent,
  },
  totalAnswers: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
});
