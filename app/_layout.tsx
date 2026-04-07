import 'react-native-url-polyfill/auto';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/authStore';
import { useProfileStore } from '../src/stores/profileStore';
import { LoadingView } from '../src/components/LoadingView';
import { registerForPushNotifications, scheduleDailyQuestionNotification } from '../src/lib/notifications';
import { savePushToken } from '../src/lib/supabase/profile';
import MobileAds from 'react-native-google-mobile-ads';
import { configurePurchases, loginPurchases, logoutPurchases } from '../src/lib/purchases';
import { initI18n } from '../src/lib/i18n';

function AuthGuard() {
  const { session, initialized: authInitialized, initialize } = useAuthStore();
  const { profile, pair, initialized: profileInitialized, loadProfile, reset } = useProfileStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize auth once on mount
  useEffect(() => {
    initialize();
  }, []);

  // Load profile whenever session changes
  useEffect(() => {
    if (!authInitialized) return;
    if (session?.user) {
      loadProfile(session.user.id);
    } else {
      reset();
    }
  }, [session, authInitialized]);

  // Register push token once onboarding is complete
  useEffect(() => {
    if (!session?.user || !profile?.onboarding_completed) return;
    registerForPushNotifications().then((token) => {
      if (token && token !== profile.push_token) {
        savePushToken(session.user.id, token);
      }
    });
  }, [profile?.onboarding_completed, profile?.push_token]);

  // RevenueCat 유저 연결/해제
  useEffect(() => {
    if (session?.user) {
      loginPurchases(session.user.id);
    } else {
      logoutPurchases();
    }
  }, [session?.user?.id]);

  // Schedule daily question notification when pair is connected
  useEffect(() => {
    if (pair?.status !== 'connected') return;
    scheduleDailyQuestionNotification(
      pair.notification_hour ?? 9,
      pair.notification_minute ?? 0
    );
  }, [pair?.status, pair?.notification_hour, pair?.notification_minute]);

  // Handle routing based on auth + profile state
  useEffect(() => {
    if (!authInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }

    // Session exists — wait for profile to load before redirecting
    if (!profileInitialized) return;

    if (!profile?.onboarding_completed) {
      if (!inOnboarding) router.replace('/onboarding');
    } else {
      if (inAuthGroup || inOnboarding) router.replace('/(app)');
    }
  }, [session, authInitialized, profile, profileInitialized, segments]);

  return null;
}

export default function RootLayout() {
  const { initialized } = useAuthStore();
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n().then(() => setI18nReady(true));
    MobileAds().initialize();
    configurePurchases();
  }, []);

  if (!initialized || !i18nReady) {
    return <LoadingView />;
  }

  return (
    <>
      <StatusBar style="dark" />
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="answer"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
