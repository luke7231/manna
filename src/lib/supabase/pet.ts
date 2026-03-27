import { supabase } from './client';
import { Pet } from '../../types';

export async function getOrCreatePet(pairId: string): Promise<Pet | null> {
  // 있으면 가져오고, 없으면 생성
  const { data: existing } = await supabase
    .from('pets')
    .select('*')
    .eq('pair_id', pairId)
    .single();

  if (existing) return existing as Pet;

  const { data: created } = await supabase
    .from('pets')
    .insert({ pair_id: pairId })
    .select()
    .single();

  return created as Pet | null;
}

/**
 * 답변 저장 시 호출 — total_answers 원자적 +1
 * @returns 업데이트 후 total_answers
 */
export async function incrementPetAnswers(pairId: string): Promise<number> {
  const { data } = await supabase.rpc('increment_pet_answers', {
    p_pair_id: pairId,
  });
  return (data as number) ?? 0;
}

export async function renamePet(pairId: string, name: string): Promise<void> {
  await supabase.from('pets').update({ name }).eq('pair_id', pairId);
}
