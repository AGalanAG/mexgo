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
  adaptation_for_world_cup?: unknown;
  support_usage?: unknown;
  training_campus_preference?: unknown;
  additional_comments?: unknown;
}

function toOptionalString(value: unknown) {
  if (!isNonEmptyString(value)) {
    return null;
  }

  return value.trim();
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

function toNonNegativeInt(value: unknown, fallback = 0) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return fallback;
  }

  return Math.trunc(numeric);
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

  const hasRole = await userHasAnyRole(user.id, ['ENCARGADO_NEGOCIO', 'ADMIN']);
  if (!hasRole) {
    return apiError('FORBIDDEN', 'Rol no autorizado para crear solicitud', 403);
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

  const insertPayload = {
    owner_user_id: user.id,
    owner_full_name: body.owner_full_name.trim(),
    owner_age: ownerAge,
    owner_gender: body.owner_gender.trim(),
    owner_email: body.owner_email.trim(),
    owner_whatsapp: body.owner_whatsapp.trim(),
    borough_code: body.borough_code.trim(),
    neighborhood: body.neighborhood.trim(),
    google_maps_url: toOptionalString(body.google_maps_url),
    operation_days_hours: body.operation_days_hours.trim(),
    business_name: body.business_name.trim(),
    business_description: body.business_description.trim(),
    business_start_range: body.business_start_range.trim(),
    continuous_operation_time: body.continuous_operation_time.trim(),
    operation_modes: toStringArray(body.operation_modes),
    operation_modes_other: toOptionalString(body.operation_modes_other),
    employees_women_count: toNonNegativeInt(body.employees_women_count),
    employees_men_count: toNonNegativeInt(body.employees_men_count),
    sat_status: body.sat_status.trim(),
    social_links: toStringArray(body.social_links),
    adaptation_for_world_cup: body.adaptation_for_world_cup.trim(),
    support_usage: body.support_usage.trim(),
    training_campus_preference: body.training_campus_preference.trim(),
    additional_comments: toOptionalString(body.additional_comments),
    status: 'PENDIENTE',
  };

  const { data, error } = await getSupabaseAdmin()
    .from('business_requests')
    .insert(insertPayload)
    .select('id, status, submitted_at')
    .single();

  if (error || !data) {
    const isUniqueViolation = error?.code === '23505';
    return apiError(
      isUniqueViolation ? 'CONFLICT' : 'INTERNAL_ERROR',
      isUniqueViolation
        ? 'Ya existe una solicitud activa para este usuario'
        : error?.message || 'No fue posible crear solicitud',
      isUniqueViolation ? 409 : 500,
    );
  }

  return apiOk(
    {
      requestId: data.id,
      status: data.status,
      submittedAt: data.submitted_at,
    },
    201,
  );
}
