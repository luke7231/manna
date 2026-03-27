import { supabase } from './client';
import { ShopItem } from '../../types';

export async function getShopItems(): Promise<ShopItem[]> {
  const { data } = await supabase
    .from('shop_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return (data as ShopItem[]) ?? [];
}

export async function getMyItems(pairId: string): Promise<string[]> {
  const { data } = await supabase
    .from('pair_items')
    .select('item_id')
    .eq('pair_id', pairId);
  return (data ?? []).map((r: { item_id: string }) => r.item_id);
}

export async function purchaseItem(
  pairId: string,
  itemId: string
): Promise<{ balance: number } | { error: string }> {
  const { data, error } = await supabase.rpc('purchase_item', {
    p_pair_id: pairId,
    p_item_id: itemId,
  });

  if (error) {
    if (error.message.includes('insufficient_pebbles')) return { error: 'insufficient_pebbles' };
    if (error.message.includes('item_not_found')) return { error: 'item_not_found' };
    return { error: error.message };
  }

  return { balance: (data as { balance: number }).balance };
}
