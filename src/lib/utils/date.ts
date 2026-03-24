import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'yyyy년 M월 d일', { locale: ko });
}

export function formatDateShort(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'M월 d일', { locale: ko });
}

export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString);
  if (isToday(date)) return '오늘';
  if (isYesterday(date)) return '어제';
  const days = differenceInDays(new Date(), date);
  if (days < 7) return `${days}일 전`;
  return format(date, 'M월 d일', { locale: ko });
}

export function formatDayOfWeek(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, 'EEEE', { locale: ko });
}

export function formatTodayFull(): string {
  return format(new Date(), 'yyyy년 M월 d일 EEEE', { locale: ko });
}
