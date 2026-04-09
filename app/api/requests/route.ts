import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasAnyRole } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';

interface BusinessRequestBody {
  owner_full_name?: unknown;
  owner_age?: unknown;
  owner_gender?: unknown;
  owner_email?: unknown;
  owner_whatsapp?: unknown;
  borough_code?: unknown;
  neighborhood?: unknown;
  google_maps_url?: unknown;
  operation_days_hours?: unknown;
  business_name?: unknown;
  business_description?: unknown;
  business_start_range?: unknown;
  continuous_operation_time?: unknown;
  operation_modes?: unknown;
  operation_modes_other?: unknown;
  employees_women_count?: unknown;
  employees_men_count?: unknown;
  sat_status?: unknown;
  social_links?: unknown;
  accessibility_needs?: unknown;
  adaptation_for_world_cup?: unknown;
  support_usage?: unknown;
  training_campus_preference?: unknown;
  additional_comments?: unknown;
}

function toStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function toOwnerAge(value: unknown) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  const age = Math.trunc(numeric);
  return age >= 18 && age <= 120 ? age : null;
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  const hasRole = await userHasAnyRole(user.id, ['ENCARGADO_NEGOCIO']);
  if (!hasRole) {
    return apiError('FORBIDDEN', 'Rol no autorizado para registrar negocio', 403);
  }

  let body: BusinessRequestBody;
  try {
    body = (await request.json()) as BusinessRequestBody;
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON invalido', 400);
  }

  if (
    !isNonEmptyString(body.owner_full_name) ||
    !isNonEmptyString(body.owner_gender) ||
    !isNonEmptyString(body.owner_email) ||
    !isNonEmptyString(body.owner_whatsapp) ||
    !isNonEmptyString(body.borough_code) ||
    !isNonEmptyString(body.neighborhood) ||
    !isNonEmptyString(body.operation_days_hours) ||
    !isNonEmptyString(body.business_name) ||
    !isNonEmptyString(body.business_description) ||
    !isNonEmptyString(body.business_start_range) ||
    !isNonEmptyString(body.continuous_operation_time) ||
    !isNonEmptyString(body.sat_status) ||
    !isNonEmptyString(body.adaptation_for_world_cup) ||
    !isNonEmptyString(body.support_usage) ||
    !isNonEmptyString(body.training_campus_preference)
  ) {
    return apiError('VALIDATION_ERROR', 'Faltan campos obligatorios en la solicitud', 400);
  }

  const ownerAge = toOwnerAge(body.owner_age);
  if (ownerAge === null) {
    return apiError('VALIDATION_ERROR', 'owner_age debe estar entre 18 y 120', 400);
  }

  const existingBusiness = await getSupabaseAdmin()
    .from('business_profiles')
    .select('id')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingBusiness.error) {
    return apiError('INTERNAL_ERROR', existingBusiness.error.message, 500);
  }

  if (existingBusiness.data) {
    return apiError('CONFLICT', 'El usuario ya tiene un negocio registrado', 409);
  }

  const operationModes = toStringArray(body.operation_modes);
  const inferredCategoryCode = operationModes.length > 0 ? operationModes[0] : 'GENERAL';

  const insertPayload = {
    owner_user_id: user.id,
    business_name: body.business_name.trim(),
    business_description: body.business_description.trim(),
    category_code: inferredCategoryCode,
    phone: body.owner_whatsapp.trim(),
    email: body.owner_email.trim(),
    borough: body.borough_code.trim(),
    neighborhood: body.neighborhood.trim(),
    latitude: null,
    longitude: null,
    status: 'ACTIVE',
    is_public: true,
  };

  const { data, error } = await getSupabaseAdmin()
    .from('business_profiles')
    .insert(insertPayload)
    .select('id, status, created_at')
    .single();

  if (error || !data) {
    return apiError(
      'INTERNAL_ERROR',
      error?.message || 'No fue posible registrar el negocio',
      500,
    );
  }

  const { error: directoryUpsertError } = await getSupabaseAdmin()
    .from('directory_profiles')
    .upsert(
      {
        business_id: data.id,
        public_name: body.business_name.trim(),
        short_description: body.business_description.trim(),
        categories: [inferredCategoryCode],
        city: body.neighborhood.trim(),
        state: body.borough_code.trim(),
        public_score: 0,
      },
      { onConflict: 'business_id' },
    );

  if (directoryUpsertError) {
    return apiError('INTERNAL_ERROR', directoryUpsertError.message, 500);
  }

  return apiOk(
    {
      requestId: data.id,
      businessId: data.id,
      status: data.status,
      submittedAt: data.created_at,
    },
    201,
  );
}
