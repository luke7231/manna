import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { LoadingView } from '../src/components/LoadingView';
import { colors } from '../src/lib/constants/colors';
import { getMyAnswer, upsertAnswer } from '../src/lib/supabase/answers';
import { useAuthStore } from '../src/stores/authStore';

export default function AnswerScreen() {
  const { questionId, questionContent } = useLocalSearchParams<{
    questionId: string;
    questionContent: string;
  }>();
  const { user } = useAuthStore();
  const router = useRouter();

  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user || !questionId) return;
    loadExistingAnswer();
  }, [user, questionId]);

  const loadExistingAnswer = async () => {
    setLoading(true);
    const existing = await getMyAnswer(user!.id, questionId);
    if (existing) {
      setAnswerText(existing.answer_text);
      setIsEditing(true);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    const trimmed = answerText.trim();
    if (trimmed.length === 0) {
      Alert.alert('답변을 입력해주세요');
      return;
    }
    setSaving(true);
    const { error } = await upsertAnswer(user!.id, questionId, trimmed);
    setSaving(false);

    if (error) {
      Alert.alert('오류', '저장 중 문제가 생겼어요. 다시 시도해주세요.');
      return;
    }

    router.back();
  };

  if (loading) return <LoadingView />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditing ? '답변 수정' : '오늘의 답변'}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Question */}
        <Card style={styles.questionCard} padding={20}>
          <Text style={styles.questionLabel}>오늘의 질문</Text>
          <Text style={styles.questionText}>{questionContent}</Text>
        </Card>

        {/* Answer input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>
            {isEditing ? '답변 수정하기' : '내 답변 쓰기'}
          </Text>
          <TextInput
            style={styles.textInput}
            value={answerText}
            onChangeText={setAnswerText}
            placeholder="솔직하고 진심 어린 답변을 써보세요 ✍️"
            placeholderTextColor={colors.textLight}
            multiline
            textAlignVertical="top"
            autoFocus
          />
          <Text style={styles.charCount}>{answerText.length}자</Text>
        </View>

        <Button
          title={isEditing ? '수정 완료' : '저장하기'}
          onPress={handleSave}
          loading={saving}
          disabled={answerText.trim().length === 0}
          size="lg"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 40 : 20,
  },
  cancelText: {
    fontSize: 15,
    color: colors.textMuted,
    width: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  questionCard: {
    gap: 8,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 27,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  textInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    lineHeight: 25,
    minHeight: 180,
  },
  charCount: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'right',
  },
});
