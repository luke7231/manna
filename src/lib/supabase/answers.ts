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
  answerText: string,
  imageUrl?: string
): Promise<{ data: Answer | null; error: Error | null }> {
  const payload: Record<string, unknown> = {
    user_id: userId,
    question_id: questionId,
    answer_text: answerText,
  };
  if (imageUrl !== undefined) payload.image_url = imageUrl;

  const { data, error } = await supabase
    .from('answers')
    .upsert(payload, { onConflict: 'user_id,question_id' })
    .select()
    .single();

  return { data: data as Answer, error };
}

/**
 * 답변 이미지를 Supabase Storage에 업로드하고 public URL 반환.
 * 버킷 'answer-images'가 Supabase Dashboard에 미리 생성되어 있어야 함.
 */
export async function uploadAnswerImage(
  userId: string,
  questionId: string,
  localUri: string
): Promise<string | null> {
  try {
    const ext = localUri.split('.').pop() ?? 'jpg';
    const path = `${userId}/${questionId}.${ext}`;

    const response = await fetch(localUri);
    const blob = await response.blob();

    const { error } = await supabase.storage
      .from('answer-images')
      .upload(path, blob, { upsert: true, contentType: `image/${ext}` });

    if (error) {
      console.warn('[uploadAnswerImage]', error.message);
      return null;
    }

    const { data } = supabase.storage.from('answer-images').getPublicUrl(path);
    return data.publicUrl;
  } catch (e) {
    console.warn('[uploadAnswerImage] unexpected error', e);
    return null;
  }
}
