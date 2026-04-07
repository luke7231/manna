import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';
import { ko, enUS } from 'date-fns/locale';
import i18n from '../i18n';

function getLocale() {
  return i18n.language === 'ko' ? ko : enUS;
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  const locale = getLocale();
  if (i18n.language === 'ko') {
    return format(date, 'yyyy년 M월 d일', { locale });
  }
  return format(date, 'MMMM d, yyyy', { locale });
}

export function formatDateShort(dateString: string): string {
  const date = parseISO(dateString);
  const locale = getLocale();
  if (i18n.language === 'ko') {
    return format(date, 'M월 d일', { locale });
  }
  return format(date, 'MMM d', { locale });
}

export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString);
  const locale = getLocale();
  if (isToday(date)) return i18n.t('common.today');
  if (isYesterday(date)) return i18n.t('common.yesterday');
  const days = differenceInDays(new Date(), date);
  if (days < 7) return i18n.t('common.daysAgo', { count: days });
  return formatDateShort(dateString);
}

export function formatDayOfWeek(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'EEEE', { locale: getLocale() });
}

export function formatTodayFull(): string {
  const locale = getLocale();
  if (i18n.language === 'ko') {
    return format(new Date(), 'yyyy년 M월 d일 EEEE', { locale });
  }
  return format(new Date(), 'EEEE, MMMM d', { locale });
}
