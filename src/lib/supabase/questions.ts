import { supabase } from './client';
import { DailyQuestion, Answer } from '../../types';
import { getTodayString } from '../utils/date';

export async function getTodayQuestion(): Promise<DailyQuestion | null> {
  const today = getTodayString();

  const { data, error } = await supabase
    .from('daily_questions')
    .select('*, question:questions(*)')
    .eq('question_date', today)
    .single();

  if (error) return null;
  return data as DailyQuestion;
}

export async function getHistoryQuestions(limit = 30): Promise<DailyQuestion[]> {
  const today = getTodayString();

  const { data, error } = await supabase
    .from('daily_questions')
    .select('*, question:questions(*)')
    .lte('question_date', today)
    .order('question_date', { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data as DailyQuestion[]) ?? [];
}

export async function getAnswersForQuestions(
  questionIds: string[],
  userId: string
): Promise<Answer[]> {
  if (questionIds.length === 0) return [];

  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('user_id', userId)
    .in('question_id', questionIds);

  if (error) return [];
  return (data as Answer[]) ?? [];
}

export async function getPartnerAnswersForQuestions(
  questionIds: string[],
  partnerId: string
): Promise<Answer[]> {
  if (questionIds.length === 0) return [];

  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('user_id', partnerId)
    .in('question_id', questionIds);

  if (error) return [];
  return (data as Answer[]) ?? [];
}
