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
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { colors } from '../../src/lib/constants/colors';
import { sendOtp } from '../../src/lib/supabase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const router = useRouter();

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSendOtp = async () => {
    const trimmed = email.trim();
    if (!validateEmail(trimmed)) {
      setEmailError('올바른 이메일 주소를 입력해주세요.');
      return;
    }
    setEmailError('');
    setLoading(true);
    const { error } = await sendOtp(trimmed);
    setLoading(false);

    if (error) {
      Alert.alert('오류', '이메일 전송에 실패했어요. 잠시 후 다시 시도해주세요.');
      return;
    }

    router.push({ pathname: '/(auth)/verify', params: { email: trimmed } });
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
        <View style={styles.header}>
          <Text style={styles.logo}>✦ Manna</Text>
          <Text style={styles.tagline}>
            매일 하나의 질문으로{'\n'}더 깊은 대화를 시작해요
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>시작하기</Text>
          <Text style={styles.subtitle}>
            이메일로 인증 코드를 보내드릴게요
          </Text>

          <Input
            label="이메일"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (emailError) setEmailError('');
            }}
            placeholder="hello@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            error={emailError}
          />

          <Button
            title="인증 코드 받기"
            onPress={handleSendOtp}
            loading={loading}
            disabled={email.trim().length === 0}
            size="lg"
          />

          <Text style={styles.notice}>
            처음 오셨나요? 이메일만 입력하면 바로 가입돼요 🙌
          </Text>
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
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 48,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 16,
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
  },
  notice: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
