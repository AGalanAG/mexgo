import { NextRequest } from 'next/server';

import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

const ALLOWED_AUDIENCE = new Set(['OWNER', 'STAFF', 'BOTH']);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const audience = searchParams.get('audience');
  const category = searchParams.get('category');

  let query = supabaseAdmin
    .from('learning_modules')
    .select('id, source_id, slug, title, description, audience, category, estimated_minutes, pass_score, is_active, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (audience !== null) {
    if (!ALLOWED_AUDIENCE.has(audience)) {
      return apiError('VALIDATION_ERROR', 'audience invalido', 400);
    }

    query = query.eq('audience', audience);
  }

  if (category !== null) {
    if (!isNonEmptyString(category)) {
      return apiError('VALIDATION_ERROR', 'category invalida', 400);
    }

    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    return apiError('INTERNAL_ERROR', error.message, 500);
  }

  return apiOk({
    items: data || [],
  });
}
