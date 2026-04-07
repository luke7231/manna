import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import i18n from './i18n';

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    (Constants as any).easConfig?.projectId;

  try {
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token;
  } catch {
    return null;
  }
}

const DAILY_NOTIF_ID = 'daily-question';

export async function scheduleDailyQuestionNotification(
  hour: number,
  minute: number
): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_NOTIF_ID).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_NOTIF_ID,
      content: {
        title: i18n.t('notifications.dailyTitle'),
        body: i18n.t('notifications.dailyBody'),
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch {
    // schedule failure doesn't affect app flow
  }
}

export async function cancelDailyNotification(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DAILY_NOTIF_ID).catch(() => {});
}

export async function sendAnswerNotification(
  pushToken: string,
  senderName: string
): Promise<void> {
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: pushToken,
        title: i18n.t('notifications.answerTitle'),
        body: i18n.t('notifications.answerBody', { name: senderName }),
        sound: 'default',
      }),
    });
  } catch {
    // fire-and-forget
  }
}
