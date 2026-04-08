import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasAnyRole } from '@/lib/auth-helpers';
import { apiError, apiOk } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  const hasRole = await userHasAnyRole(user.id, ['ENCARGADO_NEGOCIO', 'ADMIN']);
  if (!hasRole) {
    return apiError('FORBIDDEN', 'Rol no autorizado para consultar negocio', 403);
  }

  const { data, error } = await supabaseAdmin
    .from('business_profiles')
    .select('*')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return apiError('INTERNAL_ERROR', error.message, 500);
  }

  if (!data) {
    return apiError('NOT_FOUND', 'No se encontro negocio para el usuario autenticado', 404);
  }

  return apiOk({
    businessId: data.id,
    ownerUserId: data.owner_user_id,
    businessName: data.business_name,
    businessDescription: data.business_description,
    categoryCode: data.category_code,
    phone: data.phone,
    email: data.email,
    borough: data.borough,
    neighborhood: data.neighborhood,
    latitude: data.latitude,
    longitude: data.longitude,
    status: data.status,
    isPublic: data.is_public,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });
}
