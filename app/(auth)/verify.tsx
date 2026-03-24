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

  const handleVerify = async () => {
    const trimmed = code.trim();
    if (trimmed.length !== 6) {
      Alert.alert('오류', '6자리 인증 코드를 입력해주세요.');
      return;
    }
    setLoading(true);
    const { session, error } = await verifyOtp(email, trimmed);
    setLoading(false);

    if (error || !session) {
      Alert.alert('인증 실패', '코드가 올바르지 않거나 만료되었어요. 다시 확인해주세요.');
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
      Alert.alert('오류', '재전송에 실패했어요. 잠시 후 다시 시도해주세요.');
    } else {
      Alert.alert('완료', '인증 코드를 다시 보냈어요 ✉️');
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
          <Text style={styles.backText}>← 돌아가기</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.logo}>✦ Manna</Text>
          <Text style={styles.title}>이메일을 확인해주세요</Text>
          <Text style={styles.subtitle}>
            <Text style={styles.emailBold}>{email}</Text>
            {'\n'}로 6자리 인증 코드를 보냈어요
          </Text>

          <TouchableOpacity onPress={() => inputRef.current?.focus()}>
            <TextInput
              ref={inputRef}
              style={styles.codeInput}
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, ''))}
              placeholder="000000"
              placeholderTextColor={colors.textLight}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
            />
          </TouchableOpacity>

          <Button
            title="확인하기"
            onPress={handleVerify}
            loading={loading}
            disabled={code.length < 6}
            size="lg"
          />

          <View style={styles.resendRow}>
            <Text style={styles.resendText}>코드를 받지 못하셨나요? </Text>
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              <Text style={styles.resendLink}>
                {resending ? '전송 중...' : '다시 보내기'}
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
