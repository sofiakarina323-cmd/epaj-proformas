import { createClient } from '@supabase/supabase-js';

// Cliente con service_role para operaciones server-side (Storage, bypass RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
