import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasRole } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

interface TouristProfilePatchBody {
  fullName?: unknown;
  language?: unknown;
  countryOfOrigin?: unknown;
  avatarUrl?: unknown;
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  const isTourist = await userHasRole(user.id, 'TURISTA');
  if (!isTourist) {
    return apiError('FORBIDDEN', 'El usuario no tiene rol TURISTA', 403);
  }

  const { data: profile, error } = await supabaseAdmin
    .from('users_profile')
    .select('id, full_name, avatar_url, language_code, country_of_origin, email_verified')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return apiError('NOT_FOUND', 'Perfil no encontrado', 404);
  }

  return apiOk({
    userId: profile.id,
    fullName: profile.full_name,
    email: user.email || null,
    language: profile.language_code,
    countryOfOrigin: profile.country_of_origin,
    avatarUrl: profile.avatar_url,
    emailVerified: profile.email_verified,
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  const isTourist = await userHasRole(user.id, 'TURISTA');
  if (!isTourist) {
    return apiError('FORBIDDEN', 'El usuario no tiene rol TURISTA', 403);
  }

  let body: TouristProfilePatchBody;

  try {
    body = (await request.json()) as TouristProfilePatchBody;
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON invalido', 400);
  }

  const updateData: Record<string, string> = {};

  if (body.fullName !== undefined) {
    if (!isNonEmptyString(body.fullName)) {
      return apiError('VALIDATION_ERROR', 'fullName debe ser texto no vacio', 400);
    }
    updateData.full_name = body.fullName;
  }

  if (body.language !== undefined) {
    if (!isNonEmptyString(body.language)) {
      return apiError('VALIDATION_ERROR', 'language debe ser texto no vacio', 400);
    }
    updateData.language_code = body.language;
  }

  if (body.countryOfOrigin !== undefined) {
    if (!isNonEmptyString(body.countryOfOrigin)) {
      return apiError('VALIDATION_ERROR', 'countryOfOrigin debe ser texto no vacio', 400);
    }
    updateData.country_of_origin = body.countryOfOrigin;
  }

  if (body.avatarUrl !== undefined) {
    if (!isNonEmptyString(body.avatarUrl)) {
      return apiError('VALIDATION_ERROR', 'avatarUrl debe ser texto no vacio', 400);
    }
    updateData.avatar_url = body.avatarUrl;
  }

  if (Object.keys(updateData).length === 0) {
    return apiError('VALIDATION_ERROR', 'No hay campos validos para actualizar', 400);
  }

  const { data: updatedProfile, error } = await supabaseAdmin
    .from('users_profile')
    .update(updateData)
    .eq('id', user.id)
    .select('id, full_name, avatar_url, language_code, country_of_origin, email_verified')
    .single();

  if (error || !updatedProfile) {
    return apiError('INTERNAL_ERROR', error?.message || 'No fue posible actualizar perfil', 500);
  }

  return apiOk({
    userId: updatedProfile.id,
    fullName: updatedProfile.full_name,
    email: user.email || null,
    language: updatedProfile.language_code,
    countryOfOrigin: updatedProfile.country_of_origin,
    avatarUrl: updatedProfile.avatar_url,
    emailVerified: updatedProfile.email_verified,
  });
}
