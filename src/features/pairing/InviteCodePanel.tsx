import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Share,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { colors } from '../../lib/constants/colors';
import { generateInviteCode, connectWithCode } from '../../lib/supabase/pairing';

interface InviteCodePanelProps {
  userId: string;
  existingCode?: string | null;
  onConnected: () => void;
}

export function InviteCodePanel({ userId, existingCode, onConnected }: InviteCodePanelProps) {
  const [myCode, setMyCode] = useState<string | null>(existingCode ?? null);
  const [inputCode, setInputCode] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    const { code, error } = await generateInviteCode(userId);
    setGeneratingCode(false);
    if (error || !code) {
      Alert.alert('오류', '코드 생성에 실패했어요. 다시 시도해주세요.');
      return;
    }
    setMyCode(code);
  };

  const handleShareCode = async () => {
    if (!myCode) return;
    await Share.share({
      message: `Manna 앱에서 나와 연결하려면 이 코드를 입력해줘 💌\n\n초대 코드: ${myCode}\n\n앱 다운로드: manna://`,
    });
  };

  const handleConnect = async () => {
    const trimmed = inputCode.trim().toUpperCase();
    if (trimmed.length !== 6) {
      Alert.alert('오류', '6자리 코드를 입력해주세요.');
      return;
    }
    setConnecting(true);
    const { success, error } = await connectWithCode(userId, trimmed);
    setConnecting(false);
    if (!success) {
      Alert.alert('연결 실패', error ?? '알 수 없는 오류가 발생했어요.');
      return;
    }
    Alert.alert('연결 완료! 🎉', '상대방과 연결되었어요. 이제 서로의 답변을 볼 수 있어요.', [
      { text: '확인', onPress: onConnected },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* My invite code section */}
      <Card style={styles.section} padding={20}>
        <Text style={styles.sectionTitle}>내 초대 코드</Text>
        <Text style={styles.sectionDesc}>
          코드를 상대방에게 공유하면{'\n'}연결을 시작할 수 있어요
        </Text>
        {myCode ? (
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{myCode}</Text>
          </View>
        ) : null}
        <View style={styles.buttonRow}>
          <Button
            title={myCode ? '새 코드 생성' : '코드 생성하기'}
            variant={myCode ? 'secondary' : 'primary'}
            onPress={handleGenerateCode}
            loading={generatingCode}
            style={styles.flex}
          />
          {myCode && (
            <Button
              title="공유"
              variant="primary"
              onPress={handleShareCode}
              style={styles.flex}
            />
          )}
        </View>
      </Card>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>또는</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Enter partner's code section */}
      <Card style={styles.section} padding={20}>
        <Text style={styles.sectionTitle}>코드 입력</Text>
        <Text style={styles.sectionDesc}>상대방의 초대 코드 6자리를 입력해주세요</Text>
        <TextInput
          style={styles.codeInput}
          value={inputCode}
          onChangeText={(t) => setInputCode(t.toUpperCase())}
          placeholder="예: AB3K9P"
          placeholderTextColor={colors.textLight}
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Button
          title="연결하기"
          onPress={handleConnect}
          loading={connecting}
          disabled={inputCode.trim().length < 6}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 0,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  sectionDesc: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  codeBox: {
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  codeText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 4,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  codeInput: {
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 4,
    textAlign: 'center',
  },
});
