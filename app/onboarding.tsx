import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { colors } from '../src/lib/constants/colors';
import { completeOnboarding } from '../src/lib/supabase/profile';
import { useAuthStore } from '../src/stores/authStore';
import { useProfileStore } from '../src/stores/profileStore';

type RelationshipType = 'some' | 'couple' | 'self';

const RELATIONSHIP_OPTIONS: { value: RelationshipType; label: string; desc: string }[] = [
  { value: 'some', label: '썸 타는 중 💘', desc: '설레는 관계의 시작' },
  { value: 'couple', label: '연인 사이 💑', desc: '함께 성장하는 우리' },
  { value: 'self', label: '혼자서 🌱', desc: '나 자신을 위한 질문' },
];

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType | null>(null);
  const [partnerName, setPartnerName] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user } = useAuthStore();
  const { setProfile } = useProfileStore();

  const handleNextStep = () => {
    if (step === 1) {
      const trimmed = name.trim();
      if (trimmed.length < 1) {
        setNameError('이름을 입력해주세요.');
        return;
      }
      setNameError('');
      setStep(2);
    } else if (step === 2) {
      if (!relationship) {
        Alert.alert('관계 선택', '관계 유형을 선택해주세요.');
        return;
      }
      if (relationship === 'self') {
        handleComplete();
      } else {
        setStep(3);
      }
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await completeOnboarding(
      user.id,
      name.trim(),
      relationship!,
      partnerName.trim() || undefined
    );
    setLoading(false);

    if (error || !data) {
      Alert.alert('오류', '저장 중 문제가 생겼어요. 다시 시도해주세요.');
      return;
    }

    setProfile(data);
    router.replace('/(app)');
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          <Text style={styles.stepLabel}>1 / 3</Text>
          <Text style={styles.title}>안녕하세요! 👋</Text>
          <Text style={styles.subtitle}>앱에서 사용할 이름을 알려주세요</Text>
          <Input
            label="내 이름"
            value={name}
            onChangeText={(t) => { setName(t); setNameError(''); }}
            placeholder="이름 또는 닉네임"
            autoFocus
            error={nameError}
          />
          <Button title="다음" onPress={handleNextStep} size="lg" disabled={name.trim().length === 0} />
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <Text style={styles.stepLabel}>2 / 3</Text>
          <Text style={styles.title}>지금 어떤 관계인가요?</Text>
          <Text style={styles.subtitle}>상황에 맞는 것을 골라주세요</Text>
          <View style={styles.optionList}>
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionCard,
                  relationship === opt.value && styles.optionCardSelected,
                ]}
                onPress={() => setRelationship(opt.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionLabel, relationship === opt.value && styles.optionLabelSelected]}>
                  {opt.label}
                </Text>
                <Text style={styles.optionDesc}>{opt.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            title={relationship === 'self' ? '완료' : '다음'}
            onPress={handleNextStep}
            size="lg"
            loading={loading}
            disabled={!relationship}
          />
        </>
      );
    }

    // Step 3 — partner name (optional)
    return (
      <>
        <Text style={styles.stepLabel}>3 / 3</Text>
        <Text style={styles.title}>상대방 이름은요?</Text>
        <Text style={styles.subtitle}>입력하지 않아도 괜찮아요 (나중에 변경 가능)</Text>
        <Input
          label="상대방 이름 (선택)"
          value={partnerName}
          onChangeText={setPartnerName}
          placeholder="상대방 이름 또는 닉네임"
        />
        <Button
          title="시작하기 ✨"
          onPress={handleComplete}
          size="lg"
          loading={loading}
        />
      </>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.logo}>✦ Manna</Text>
        <View style={styles.form}>{renderStep()}</View>
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
    paddingHorizontal: 28,
    paddingTop: 70,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    gap: 16,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 4,
    lineHeight: 21,
  },
  optionList: {
    gap: 10,
  },
  optionCard: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    backgroundColor: colors.card,
    gap: 2,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  optionLabelSelected: {
    color: colors.primary,
  },
  optionDesc: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
