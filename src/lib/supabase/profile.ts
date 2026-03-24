import { supabase } from './client';
import { Profile } from '../../types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function upsertProfile(
  userId: string,
  updates: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Profile | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates })
    .select()
    .single();

  return { data: data as Profile, error };
}

export async function completeOnboarding(
  userId: string,
  name: string,
  relationship_type: 'some' | 'couple' | 'self',
  partner_name?: string
): Promise<{ data: Profile | null; error: Error | null }> {
  return upsertProfile(userId, {
    name,
    relationship_type,
    partner_name: partner_name || null,
    onboarding_completed: true,
  });
}
