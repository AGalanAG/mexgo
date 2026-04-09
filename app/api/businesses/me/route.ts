import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasAnyRole } from '@/lib/auth-helpers';
import { apiError, apiOk } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';
import { DEMO_USER_ID, DEMO_BUSINESS_ID, DEMO_BUSINESS_NAME, DEMO_BOROUGH } from '@/lib/demo';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  // Demo mode: return mock business without Supabase
  if (user.id === DEMO_USER_ID) {
    return apiOk({
      businessId:          DEMO_BUSINESS_ID,
      ownerUserId:         DEMO_USER_ID,
      businessName:        DEMO_BUSINESS_NAME,
      businessDescription: 'Taquería tradicional mexicana con más de 10 años de experiencia.',
      categoryCode:        'gastronomia',
      phone:               null,
      email:               'demo@mexgo.mx',
      borough:             DEMO_BOROUGH,
      neighborhood:        'Del Carmen',
      latitude:            19.3503,
      longitude:           -99.1614,
      status:              'ACTIVO',
      isPublic:            false,
      createdAt:           new Date().toISOString(),
      updatedAt:           new Date().toISOString(),
    });
  }

  const hasRole = await userHasAnyRole(user.id, ['ENCARGADO_NEGOCIO']);
  if (!hasRole) {
    return apiError('FORBIDDEN', 'Rol no autorizado para consultar negocio', 403);
  }

  const { data, error } = await getSupabaseAdmin()
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
