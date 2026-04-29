import { createClient } from '@supabase/supabase-js';

const url  = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon);

export type CampRow = {
  id: string;
  name: string;
  address: string;
  bio: string;
  vibe_tags: string[];
  pin_hash: string;
  flag_image_url?: string;
  created_at: string;
};
