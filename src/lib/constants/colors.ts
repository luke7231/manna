export const colors = {
  // Backgrounds
  background: '#FAFAF8',
  card: '#FFFFFF',
  cardAlt: '#F5F3EF',

  // Primary (muted sage green — growth, faith, nature)
  primary: '#6B8F71',
  primaryLight: '#E8F0E9',
  primaryDark: '#4E6B54',

  // Accent (warm amber — warmth, love)
  accent: '#C4956A',
  accentLight: '#F5EAD9',

  // Text
  text: '#2C2C2C',
  textMuted: '#8A8A8A',
  textLight: '#BBBBBB',

  // Border
  border: '#E8E4DF',
  borderLight: '#F0EDE8',

  // Status
  error: '#D9534F',
  errorLight: '#FDF0EF',
  success: '#5A9E6F',

  // Category colors
  faith: '#7B9EA9',
  faithLight: '#EDF3F5',
  love: '#C4956A',
  loveLight: '#F5EAD9',
  values: '#9B8EA9',
  valuesLight: '#F0EDF5',
  daily: '#8FA98C',
  dailyLight: '#EDF2EC',

  // White / gray scale
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray900: '#111827',
} as const;

export type ColorKey = keyof typeof colors;
