import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasAnyRole } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';

interface CreateBusinessBody {
  businessName?: unknown;
  businessDescription?: unknown;
  categoryCode?: unknown;
  phone?: unknown;
  email?: unknown;
  borough?: unknown;
  neighborhood?: unknown;
  latitude?: unknown;
  longitude?: unknown;
}

function toNullableString(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return isNonEmptyString(value) ? value : null;
}

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  return null;
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  const hasRole = await userHasAnyRole(user.id, ['ENCARGADO_NEGOCIO']);
  if (!hasRole) {
    return apiError('FORBIDDEN', 'Rol no autorizado para crear negocio', 403);
  }

  let body: CreateBusinessBody;

  try {
    body = (await request.json()) as CreateBusinessBody;
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON invalido', 400);
  }

  if (
    !isNonEmptyString(body.businessName) ||
    !isNonEmptyString(body.businessDescription) ||
    !isNonEmptyString(body.categoryCode)
  ) {
    return apiError(
      'VALIDATION_ERROR',
      'businessName, businessDescription y categoryCode son obligatorios',
      400,
    );
  }

  const latitude = toNullableNumber(body.latitude);
  const longitude = toNullableNumber(body.longitude);

  if ((latitude === null) !== (longitude === null)) {
    return apiError('VALIDATION_ERROR', 'latitude y longitude deben enviarse juntos', 400);
  }

  const insertPayload = {
    owner_user_id: user.id,
    business_name: body.businessName,
    business_description: body.businessDescription,
    category_code: body.categoryCode,
    phone: toNullableString(body.phone),
    email: toNullableString(body.email),
    borough: toNullableString(body.borough),
    neighborhood: toNullableString(body.neighborhood),
    latitude,
    longitude,
    status: 'ACTIVE',
    is_public: true,
  };

  const { data, error } = await getSupabaseAdmin()
    .from('business_profiles')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error || !data) {
    return apiError('INTERNAL_ERROR', error?.message || 'No fue posible crear negocio', 500);
  }

  const { error: directoryUpsertError } = await getSupabaseAdmin()
    .from('directory_profiles')
    .upsert(
      {
        business_id: data.id,
        public_name: data.business_name,
        short_description: data.business_description,
        categories: [data.category_code],
        city: data.neighborhood,
        state: data.borough,
        public_score: 0,
      },
      { onConflict: 'business_id' },
    );

  if (directoryUpsertError) {
    return apiError('INTERNAL_ERROR', directoryUpsertError.message, 500);
  }

  return apiOk(
    {
      businessId: data.id,
      ownerUserId: data.owner_user_id,
      businessName: data.business_name,
      status: data.status,
      isPublic: data.is_public,
      createdAt: data.created_at,
    },
    201,
  );
}
