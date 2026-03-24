import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

/**
 * SecureStore adapter for Supabase auth session persistence.
 * Handles chunking for values larger than SecureStore's 2048-byte limit.
 */
const CHUNK_SIZE = 1800; // stay safely under 2048 byte limit

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      const chunksKey = `${key}_chunks`;
      const numChunksStr = await SecureStore.getItemAsync(chunksKey);

      if (numChunksStr) {
        const numChunks = parseInt(numChunksStr, 10);
        const chunks: string[] = [];
        for (let i = 0; i < numChunks; i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk_${i}`);
          if (chunk) chunks.push(chunk);
        }
        return chunks.join('');
      }

      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      if (value.length <= CHUNK_SIZE) {
        await SecureStore.setItemAsync(key, value);
        return;
      }

      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += CHUNK_SIZE) {
        chunks.push(value.slice(i, i + CHUNK_SIZE));
      }

      await SecureStore.setItemAsync(`${key}_chunks`, String(chunks.length));
      for (let i = 0; i < chunks.length; i++) {
        await SecureStore.setItemAsync(`${key}_chunk_${i}`, chunks[i]);
      }
    } catch (error) {
      console.error('SecureStore setItem error:', error);
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      const chunksKey = `${key}_chunks`;
      const numChunksStr = await SecureStore.getItemAsync(chunksKey);

      if (numChunksStr) {
        const numChunks = parseInt(numChunksStr, 10);
        for (let i = 0; i < numChunks; i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk_${i}`);
        }
        await SecureStore.deleteItemAsync(chunksKey);
      }

      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStore removeItem error:', error);
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
