import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/lib/constants/colors';
import { verifyOtp, sendOtp } from '../../src/lib/supabase/auth';
import { useAuthStore } from '../../src/stores/authStore';

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();
  const { setSession } = useAuthStore();
  const { t } = useTranslation();

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      Alert.alert(t('auth.otpError'));
      return;
    }
    setLoading(true);
    const { session, error } = await verifyOtp(email, trimmed);
    setLoading(false);

    if (error || !session) {
      Alert.alert(t('auth.otpError'));
      return;
    }

    setSession(session);
    // Navigation will be handled by the auth guard in _layout.tsx
  };

  const handleResend = async () => {
    setResending(true);
    const { error } = await sendOtp(email);
    setResending(false);
    if (error) {
      Alert.alert(t('auth.sendError'));
    } else {
      Alert.alert(t('auth.otpSent'));
      setCode('');
    }
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← {t('common.back')}</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.logo}>✦ Manna</Text>
          <Text style={styles.title}>{t('auth.verifyTitle')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.verifySubtitle', { email })}
          </Text>

          <TouchableOpacity onPress={() => inputRef.current?.focus()}>
            <TextInput
              ref={inputRef}
              style={styles.codeInput}
              value={code}
              onChangeText={(text) => setCode(text.replace(/\D/g, ''))}
              placeholder="000000"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
            />
          </TouchableOpacity>

          <Button
            title={t('auth.verifyBtn')}
            onPress={handleVerify}
            loading={loading}
            disabled={code.length < 6}
            size="lg"
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>코드를 받지 못하셨나요? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text style={styles.resendLink}>
                {resending ? t('auth.sendingOtp') : t('auth.resend')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 32,
  },
  backText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    gap: 20,
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emailBold: {
    fontWeight: '600',
    color: colors.text,
  },
  codeInput: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 8,
    width: 240,
    textAlign: 'center',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  resendLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
});
