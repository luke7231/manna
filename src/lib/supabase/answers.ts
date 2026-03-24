import { supabase } from './client';
import { Answer } from '../../types';

export async function getMyAnswer(
  userId: string,
  questionId: string
): Promise<Answer | null> {
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single();

  if (error) return null;
  return data as Answer;
}

export async function getPartnerAnswer(
  partnerId: string,
  questionId: string
): Promise<Answer | null> {
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('user_id', partnerId)
    .eq('question_id', questionId)
    .single();

  if (error) return null;
  return data as Answer;
}

export async function upsertAnswer(
  userId: string,
  questionId: string,
  answerText: string
): Promise<{ data: Answer | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('answers')
    .upsert(
      {
        user_id: userId,
        question_id: questionId,
        answer_text: answerText,
      },
      { onConflict: 'user_id,question_id' }
    )
    .select()
    .single();

  return { data: data as Answer, error };
}
