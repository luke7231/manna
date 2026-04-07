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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [myCode, setMyCode] = useState<string | null>(existingCode ?? null);
  const [inputCode, setInputCode] = useState('');
  const [generatingCode, setGeneratingCode] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    const { code, error } = await generateInviteCode(userId);
    setGeneratingCode(false);
    if (error || !code) {
      Alert.alert(t('common.error'));
      return;
    }
    setMyCode(code);
  };

  const handleShareCode = async () => {
    if (!myCode) return;
    await Share.share({
      message: `Connect with me on Manna 💌\n\nInvite code: ${myCode}\n\nDownload: manna://`,
    });
  };

  const handleConnect = async () => {
    const trimmed = inputCode.trim().toUpperCase();
    if (trimmed.length !== 6) {
      Alert.alert(t('common.error'));
      return;
    }
    setConnecting(true);
    const { success, error } = await connectWithCode(userId, trimmed);
    setConnecting(false);
    if (!success) {
      const msg = error === 'code_not_found'
        ? t('pairing.codeNotFound')
        : error === 'already_connected'
          ? t('pairing.alreadyConnected')
          : t('pairing.connectError');
      Alert.alert(t('pairing.connectError'), msg);
      return;
    }
    Alert.alert(t('pairing.connectedTitle'), t('pairing.connectedDesc'), [
      { text: t('common.confirm'), onPress: onConnected },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* My invite code section */}
      <Card style={styles.section} padding={20}>
        <Text style={styles.sectionTitle}>{t('pairing.codeLabel')}</Text>
        <Text style={styles.sectionDesc}>{t('pairing.codeDesc')}</Text>
        {myCode ? (
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{myCode}</Text>
          </View>
        ) : null}
        <View style={styles.buttonRow}>
          <Button
            title={myCode ? t('pairing.newCodeBtn') : t('pairing.generateBtn')}
            variant={myCode ? 'secondary' : 'primary'}
            onPress={handleGenerateCode}
            loading={generatingCode}
            style={styles.flex}
          />
          {myCode && (
            <Button
              title={t('pairing.shareBtn')}
              variant="primary"
              onPress={handleShareCode}
              style={styles.flex}
            />
          )}
        </View>
      </Card>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t('common.or')}</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Enter partner's code section */}
      <Card style={styles.section} padding={20}>
        <Text style={styles.sectionTitle}>{t('pairing.enterCodeLabel')}</Text>
        <Text style={styles.sectionDesc}>{t('pairing.enterCodeDesc')}</Text>
        <TextInput
          style={styles.codeInput}
          value={inputCode}
          onChangeText={(text) => setInputCode(text.toUpperCase())}
          placeholder={t('pairing.enterCodePlaceholder')}
          placeholderTextColor={colors.textLight}
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Button
          title={t('pairing.connectBtn')}
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
