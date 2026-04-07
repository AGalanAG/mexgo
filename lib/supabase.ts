import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente servidor con service role (solo uso en API routes o Server Components)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
