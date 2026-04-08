import { createClient } from '@supabase/supabase-js';

// Lazy: se crea solo cuando se llama, no en import-time
// Esto evita el error "supabaseUrl is required" durante el build estático
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase env vars not set');
  return createClient(url, key);
}
