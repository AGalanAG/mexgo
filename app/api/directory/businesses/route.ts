import { NextRequest } from 'next/server';

import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const badge = searchParams.get('badge');
  const category = searchParams.get('category');
  const city = searchParams.get('city');

  const page = parsePositiveInt(searchParams.get('page'), 1);
  const pageSize = Math.min(parsePositiveInt(searchParams.get('pageSize'), 20), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('directory_profiles')
    .select('*', { count: 'exact' })
    .order('public_score', { ascending: false })
    .range(from, to);

  if (isNonEmptyString(q)) {
    query = query.ilike('public_name', `%${q}%`);
  }

  if (isNonEmptyString(city)) {
    query = query.eq('city', city);
  }

  if (isNonEmptyString(category)) {
    query = query.contains('categories', [category]);
  }

  if (isNonEmptyString(badge)) {
    query = query.contains('badge_codes', [badge]);
  }

  const { data, error, count } = await query;

  if (error) {
    return apiError('INTERNAL_ERROR', error.message, 500);
  }

  return apiOk({
    items: data || [],
    pagination: {
      page,
      pageSize,
      total: count ?? 0,
    },
  });
}
