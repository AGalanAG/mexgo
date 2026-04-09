import { NextRequest } from 'next/server';

import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';
import { DEMO_USER_ID } from '@/constants/demo-data';

const ALLOWED_AUDIENCE = new Set(['OWNER', 'STAFF', 'BOTH']);

// datos mock para learning en demo:
const DEMO_MODULES = [
  { id: 'mod-1', slug: 'atencion-personas-discapacidad', title: 'Atención a Personas con Discapacidad', category: 'profesional', audience: 'BOTH', isActive: true },
  { id: 'mod-2', slug: 'registro-sat', title: 'Formalízate — Registro ante el SAT', category: 'formaliza', audience: 'OWNER', isActive: true },
  { id: 'mod-3', slug: 'pagos-digitales', title: 'Pagos Digitales y e-Commerce', category: 'digitaliza', audience: 'OWNER', isActive: true },
];

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  // Demo bypass
  if (user.id === DEMO_USER_ID) {
    return apiOk({
      items: DEMO_MODULES,
    });
  }

  const { searchParams } = new URL(request.url);
  const audience = searchParams.get('audience');
  const category = searchParams.get('category');

  let query = getSupabaseAdmin()
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
