import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Input } from '../src/components/Input';
import { Button } from '../src/components/Button';
import { colors } from '../src/lib/constants/colors';
import { completeOnboarding } from '../src/lib/supabase/profile';
import { useAuthStore } from '../src/stores/authStore';
import { useProfileStore } from '../src/stores/profileStore';

export default function OnboardingScreen() {
  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user } = useAuthStore();
  const { setProfile } = useProfileStore();
  const { t } = useTranslation();

  const handleNextStep = () => {
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      setNameError(t('onboarding.nameRequired'));
      return;
    }
    setNameError('');
    setStep(2);
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await completeOnboarding(
      user.id,
      name.trim(),
      'couple',
      partnerName.trim() || undefined
    );
    setLoading(false);

    if (error || !data) {
      Alert.alert(t('common.error'));
      return;
    }

    setProfile(data);
    router.replace('/(app)');
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          <Text style={styles.stepLabel}>1 / 2</Text>
          <Text style={styles.title}>{t('onboarding.step1Title')}</Text>
          <Text style={styles.subtitle}>{t('onboarding.step1Subtitle')}</Text>
          <Input
            label={t('onboarding.nameLabel')}
            value={name}
            onChangeText={(text) => { setName(text); setNameError(''); }}
            placeholder={t('onboarding.namePlaceholder')}
            autoFocus
            error={nameError}
          />
          <Button
            title={t('common.next')}
            onPress={handleNextStep}
            size="lg"
            disabled={name.trim().length === 0}
          />
        </>
      );
    }

    // Step 2 — partner name (optional)
    return (
      <>
        <Text style={styles.stepLabel}>2 / 2</Text>
        <Text style={styles.title}>{t('onboarding.step2Title')}</Text>
        <Text style={styles.subtitle}>{t('onboarding.step2Subtitle')}</Text>
        <Input
          label={t('onboarding.partnerLabel')}
          value={partnerName}
          onChangeText={setPartnerName}
          placeholder={t('onboarding.partnerPlaceholder')}
        />
        <Button
          title={t('onboarding.startBtn')}
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
});
