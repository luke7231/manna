import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '../locales/en';
import ko from '../locales/ko';

export const SUPPORTED_LANGUAGES = ['en', 'ko'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

const LANG_STORAGE_KEY = 'manna_language';

function getDeviceLanguage(): SupportedLanguage {
  const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'en';
  return deviceLang === 'ko' ? 'ko' : 'en';
}

export async function initI18n(): Promise<void> {
  const saved = await AsyncStorage.getItem(LANG_STORAGE_KEY).catch(() => null);
  const lang: SupportedLanguage =
    saved && SUPPORTED_LANGUAGES.includes(saved as SupportedLanguage)
      ? (saved as SupportedLanguage)
      : getDeviceLanguage();

  await i18next.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
    },
    lng: lang,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v3',
  });
}

export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  await AsyncStorage.setItem(LANG_STORAGE_KEY, lang);
  await i18next.changeLanguage(lang);
}

export function getCurrentLanguage(): SupportedLanguage {
  return (i18next.language as SupportedLanguage) ?? 'en';
}

export default i18next;
