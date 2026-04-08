import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasRole } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

async function canReadBusinessBadges(userId: string, businessId: string) {
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

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> },
) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  const { businessId } = await context.params;
  if (!isNonEmptyString(businessId)) {
    return apiError('VALIDATION_ERROR', 'businessId invalido', 400);
  }

  const hasAccess = await canReadBusinessBadges(user.id, businessId);
  if (!hasAccess) {
    return apiError('FORBIDDEN', 'No autorizado para consultar insignias', 403);
  }

  const { data, error } = await supabaseAdmin
    .from('business_badges')
    .select('id, business_id, badge_id, status, progress_percent, awarded_at, expires_at, revoked_reason, is_public, updated_at, badge_definitions(code, public_name, description)')
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false });

  if (error) {
    return apiError('INTERNAL_ERROR', error.message, 500);
  }

  return apiOk({
    items: data || [],
  });
}
