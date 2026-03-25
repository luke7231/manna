import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

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
        title: '오늘의 질문이 도착했어요 💌',
        body: '지금 바로 오늘의 질문에 답변해보세요',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch {
    // 스케줄 실패해도 앱 흐름에 영향 없음
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
        title: '💌 오늘의 답변',
        body: `${senderName}이(가) 오늘의 질문에 답변했어요`,
        sound: 'default',
      }),
    });
  } catch {
    // fire-and-forget: 알림 전송 실패해도 앱 흐름에 영향 없음
  }
}
