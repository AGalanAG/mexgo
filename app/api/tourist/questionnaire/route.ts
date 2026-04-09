import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasRole } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';

interface TouristQuestionnaireBody {
  country?: unknown;
  companions_count?: unknown;
  is_adult?: unknown;
  stay_duration?: unknown;
  city?: unknown;
  borough?: unknown;
  trip_motives?: unknown;
  accessibility_needs?: unknown;
  payload?: unknown;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  const isTourist = await userHasRole(user.id, 'TURISTA');
  if (!isTourist) {
    return apiError('FORBIDDEN', 'El usuario no tiene rol TURISTA', 403);
  }

  let body: TouristQuestionnaireBody;

  try {
    body = (await request.json()) as TouristQuestionnaireBody;
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON invalido', 400);
  }

  if (
    !isNonEmptyString(body.country) ||
    !isNonEmptyString(body.companions_count) ||
    !isNonEmptyString(body.is_adult) ||
    !isNonEmptyString(body.stay_duration) ||
    !isNonEmptyString(body.city) ||
    !isNonEmptyString(body.borough)
  ) {
    return apiError(
      'VALIDATION_ERROR',
      'country, companions_count, is_adult, stay_duration, city y borough son obligatorios',
      400,
    );
  }

  const tripMotives = asStringArray(body.trip_motives);
  if (tripMotives.length < 2 || tripMotives.length > 3) {
    return apiError('VALIDATION_ERROR', 'trip_motives debe tener entre 2 y 3 elementos', 400);
  }

  const payload = typeof body.payload === 'object' && body.payload !== null ? body.payload : {};

  const insertPayload = {
    tourist_user_id: user.id,
    country: body.country.trim(),
    companions_count: body.companions_count.trim(),
    is_adult: body.is_adult.trim(),
    stay_duration: body.stay_duration.trim(),
    city: body.city.trim(),
    borough: body.borough.trim(),
    trip_motives: tripMotives,
    accessibility_needs: asStringArray(body.accessibility_needs),
    payload,
  };

  const { data, error } = await getSupabaseAdmin()
    .from('tourist_questionnaires')
    .insert(insertPayload)
    .select('id, tourist_user_id, created_at, updated_at')
    .single();

  if (error || !data) {
    return apiError('INTERNAL_ERROR', error?.message || 'No fue posible guardar cuestionario', 500);
  }

  return apiOk(
    {
      questionnaireId: data.id,
      touristUserId: data.tourist_user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
    201,
  );
}
