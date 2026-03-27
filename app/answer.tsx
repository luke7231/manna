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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { LoadingView } from '../src/components/LoadingView';
import { colors } from '../src/lib/constants/colors';
import { getMyAnswer, upsertAnswer, uploadAnswerImage } from '../src/lib/supabase/answers';
import { getPartnerPushToken } from '../src/lib/supabase/profile';
import { sendAnswerNotification } from '../src/lib/notifications';
import { getPartnerId, addPebbles } from '../src/lib/supabase/pairing';
import { incrementPetAnswers } from '../src/lib/supabase/pet';
import { useAuthStore } from '../src/stores/authStore';
import { useProfileStore } from '../src/stores/profileStore';
import { useGoldStatus } from '../src/hooks/useGoldStatus';

export default function AnswerScreen() {
  const { questionId, questionContent } = useLocalSearchParams<{
    questionId: string;
    questionContent: string;
  }>();
  const { user } = useAuthStore();
  const { profile, pair, setPair, refreshPair } = useProfileStore();
  const { isGold } = useGoldStatus();
  const router = useRouter();

  const [answerText, setAnswerText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
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
      if (existing.image_url) setImageUri(existing.image_url);
      setIsEditing(true);
    }
    setLoading(false);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요해요.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const trimmed = answerText.trim();
    if (trimmed.length === 0) {
      Alert.alert('답변을 입력해주세요');
      return;
    }
    setSaving(true);

    // 이미지 업로드 (골드 + 새 로컬 URI인 경우)
    let uploadedImageUrl: string | undefined;
    if (isGold && imageUri && imageUri.startsWith('file://')) {
      uploadedImageUrl = await uploadAnswerImage(user!.id, questionId, imageUri) ?? undefined;
    } else if (imageUri && !imageUri.startsWith('file://')) {
      uploadedImageUrl = imageUri; // 기존 URL 유지
    }

    const { error } = await upsertAnswer(user!.id, questionId, trimmed, uploadedImageUrl);
    setSaving(false);

    if (error) {
      Alert.alert('오류', '저장 중 문제가 생겼어요. 다시 시도해주세요.');
      return;
    }

    // 신규 작성 시만 (수정 시에는 미적용)
    if (!isEditing && pair && profile) {
      // 만나돌 +5 지급
      addPebbles(pair.id, 5).then((newBalance) => {
        setPair({ ...pair, pebbles: newBalance });
      });

      // 반려몽 답변 수 +1
      incrementPetAnswers(pair.id);

      // 연인에게 푸시 알림 발송
      const partnerId = getPartnerId(pair, user!.id);
      if (partnerId) {
        getPartnerPushToken(partnerId).then((token) => {
          if (token) sendAnswerNotification(token, profile.name);
        });
      }
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

        {/* 사진 첨부 (골드 전용) */}
        {isGold && (
          <View style={styles.imageSection}>
            <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage} activeOpacity={0.7}>
              <Text style={styles.imagePickerText}>
                {imageUri ? '📸 사진 변경' : '📸 사진 첨부 (골드)'}
              </Text>
            </TouchableOpacity>
            {imageUri && (
              <View style={styles.imagePreviewRow}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity onPress={() => setImageUri(null)} style={styles.imageRemoveBtn}>
                  <Text style={styles.imageRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

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
  imageSection: {
    gap: 10,
  },
  imagePickerBtn: {
    backgroundColor: '#FFFDF0',
    borderWidth: 1,
    borderColor: '#F0C040',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B6A00',
  },
  imagePreviewRow: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 120,
    height: 90,
    borderRadius: 10,
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.text,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageRemoveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
