import { create } from 'zustand';
import { Profile, Pair } from '../types';
import { getProfile } from '../lib/supabase/profile';
import { getUserPair } from '../lib/supabase/pairing';

interface ProfileState {
  profile: Profile | null;
  pair: Pair | null;
  initialized: boolean;
  loading: boolean;

  loadProfile: (userId: string) => Promise<void>;
  setProfile: (profile: Profile) => void;
  setPair: (pair: Pair | null) => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  pair: null,
  initialized: false,
  loading: false,

  loadProfile: async (userId: string) => {
    set({ loading: true });
    const [profile, pair] = await Promise.all([
      getProfile(userId),
      getUserPair(userId),
    ]);
    set({ profile, pair, initialized: true, loading: false });
  },

  setProfile: (profile) => set({ profile }),

  setPair: (pair) => set({ pair }),

  reset: () => set({ profile: null, pair: null, initialized: false }),
}));
