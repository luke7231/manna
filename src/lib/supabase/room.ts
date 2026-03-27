import { supabase } from './client';
import { Room } from '../../types';

export async function getOrCreateRoom(pairId: string): Promise<Room | null> {
  const { data: existing } = await supabase
    .from('rooms')
    .select('*')
    .eq('pair_id', pairId)
    .single();

  if (existing) return existing as Room;

  const { data: created } = await supabase
    .from('rooms')
    .insert({ pair_id: pairId })
    .select()
    .single();

  return created as Room | null;
}

export async function updateRoomTheme(pairId: string, themeItemId: string): Promise<void> {
  await supabase
    .from('rooms')
    .update({ theme_item_id: themeItemId, updated_at: new Date().toISOString() })
    .eq('pair_id', pairId);
}

export async function updateRoomFurniture(
  pairId: string,
  furniture: { item_id: string; slot: number }[]
): Promise<void> {
  await supabase
    .from('rooms')
    .update({ furniture, updated_at: new Date().toISOString() })
    .eq('pair_id', pairId);
}
