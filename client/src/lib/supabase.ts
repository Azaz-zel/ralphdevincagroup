import { createClient } from '@supabase/supabase-js';

// Only Auth is used from the browser. The publishable key cannot read the tables:
// row level security is on with no policies, so all data goes through the NestJS API.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? 'https://ayjebvdjojpkdirgwvpz.supabase.co',
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_RBQmh9egJ8qwCZj9dBRiZw_ZQsqL9jn',
);
