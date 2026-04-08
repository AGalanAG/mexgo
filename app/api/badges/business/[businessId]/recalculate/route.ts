import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasAnyRole, userHasRole } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

async function canMutateBusinessBadges(userId: string, businessId: string) {
  const isAdmin = await userHasRole(userId, 'ADMIN');
  if (isAdmin) {
    return true;
  }

  const { data, error } = await supabaseAdmin
    .from('business_profiles')
    .select('id')
    .eq('id', businessId)
    .eq('owner_user_id', userId)
    .limit(1);

  if (error) {
    return false;
  }

  return Boolean(data && data.length > 0);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> },
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  const hasRole = await userHasAnyRole(user.id, ['ENCARGADO_NEGOCIO', 'ADMIN']);
  if (!hasRole) {
    return apiError('FORBIDDEN', 'Rol no autorizado para recalcular insignias', 403);
  }

  const { businessId } = await context.params;
  if (!isNonEmptyString(businessId)) {
    return apiError('VALIDATION_ERROR', 'businessId invalido', 400);
  }

  const hasAccess = await canMutateBusinessBadges(user.id, businessId);
  if (!hasAccess) {
    return apiError('FORBIDDEN', 'No autorizado para recalcular insignias de este negocio', 403);
  }

  const { data: badges, error: badgesError } = await supabaseAdmin
    .from('badge_definitions')
    .select('id, code')
    .eq('is_active', true);

  if (badgesError) {
    return apiError('INTERNAL_ERROR', badgesError.message, 500);
  }

  const now = new Date().toISOString();
  const upserts = (badges || []).map((badge) => ({
    business_id: businessId,
    badge_id: badge.id,
    status: 'IN_PROGRESS',
    progress_percent: 0,
    is_public: true,
    updated_at: now,
  }));

  if (upserts.length > 0) {
    const { error: upsertError } = await supabaseAdmin
      .from('business_badges')
      .upsert(upserts, { onConflict: 'business_id,badge_id' });

    if (upsertError) {
      return apiError('INTERNAL_ERROR', upsertError.message, 500);
    }
  }

  const { data: refreshed, error: refreshedError } = await supabaseAdmin
    .from('business_badges')
    .select('id, business_id, badge_id, status, progress_percent, awarded_at, is_public, updated_at')
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false });

  if (refreshedError) {
    return apiError('INTERNAL_ERROR', refreshedError.message, 500);
  }

  return apiOk({
    businessId,
    recalculatedAt: now,
    items: refreshed || [],
  });
}
