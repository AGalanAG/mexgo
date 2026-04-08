import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasRole } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

interface UpdateBusinessBody {
  businessName?: unknown;
  businessDescription?: unknown;
  categoryCode?: unknown;
  phone?: unknown;
  email?: unknown;
  borough?: unknown;
  neighborhood?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  status?: unknown;
  isPublic?: unknown;
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

const ALLOWED_STATUS = new Set(['DRAFT', 'ACTIVE', 'SUSPENDED']);

export async function PATCH(
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

  const { data: business, error: businessError } = await supabaseAdmin
    .from('business_profiles')
    .select('id, owner_user_id')
    .eq('id', businessId)
    .single();

  if (businessError || !business) {
    return apiError('NOT_FOUND', 'Negocio no encontrado', 404);
  }

  const isAdmin = await userHasRole(user.id, 'ADMIN');
  const isOwner = business.owner_user_id === user.id;

  if (!isAdmin && !isOwner) {
    return apiError('FORBIDDEN', 'No tienes permisos para editar este negocio', 403);
  }

  let body: UpdateBusinessBody;
  try {
    body = (await request.json()) as UpdateBusinessBody;
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON invalido', 400);
  }

  const updateData: Record<string, unknown> = {};

  if (body.businessName !== undefined) {
    if (!isNonEmptyString(body.businessName)) {
      return apiError('VALIDATION_ERROR', 'businessName debe ser texto no vacio', 400);
    }
    updateData.business_name = body.businessName;
  }

  if (body.businessDescription !== undefined) {
    if (!isNonEmptyString(body.businessDescription)) {
      return apiError('VALIDATION_ERROR', 'businessDescription debe ser texto no vacio', 400);
    }
    updateData.business_description = body.businessDescription;
  }

  if (body.categoryCode !== undefined) {
    if (!isNonEmptyString(body.categoryCode)) {
      return apiError('VALIDATION_ERROR', 'categoryCode debe ser texto no vacio', 400);
    }
    updateData.category_code = body.categoryCode;
  }

  if (body.phone !== undefined) {
    updateData.phone = toNullableString(body.phone);
  }

  if (body.email !== undefined) {
    updateData.email = toNullableString(body.email);
  }

  if (body.borough !== undefined) {
    updateData.borough = toNullableString(body.borough);
  }

  if (body.neighborhood !== undefined) {
    updateData.neighborhood = toNullableString(body.neighborhood);
  }

  const latitude = body.latitude !== undefined ? toNullableNumber(body.latitude) : undefined;
  const longitude = body.longitude !== undefined ? toNullableNumber(body.longitude) : undefined;

  if (latitude !== undefined || longitude !== undefined) {
    const nextLat = latitude !== undefined ? latitude : null;
    const nextLng = longitude !== undefined ? longitude : null;

    if ((nextLat === null) !== (nextLng === null)) {
      return apiError('VALIDATION_ERROR', 'latitude y longitude deben enviarse juntos', 400);
    }

    updateData.latitude = nextLat;
    updateData.longitude = nextLng;
  }

  if (body.status !== undefined) {
    if (!isAdmin) {
      return apiError('FORBIDDEN', 'Solo ADMIN puede cambiar status', 403);
    }

    if (!isNonEmptyString(body.status) || !ALLOWED_STATUS.has(body.status)) {
      return apiError('VALIDATION_ERROR', 'status invalido', 400);
    }

    updateData.status = body.status;
  }

  if (body.isPublic !== undefined) {
    if (typeof body.isPublic !== 'boolean') {
      return apiError('VALIDATION_ERROR', 'isPublic debe ser boolean', 400);
    }

    updateData.is_public = body.isPublic;
  }

  if (Object.keys(updateData).length === 0) {
    return apiError('VALIDATION_ERROR', 'No hay campos validos para actualizar', 400);
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from('business_profiles')
    .update(updateData)
    .eq('id', businessId)
    .select('*')
    .single();

  if (updateError || !updated) {
    return apiError('INTERNAL_ERROR', updateError?.message || 'No fue posible actualizar negocio', 500);
  }

  return apiOk({
    businessId: updated.id,
    ownerUserId: updated.owner_user_id,
    businessName: updated.business_name,
    businessDescription: updated.business_description,
    categoryCode: updated.category_code,
    phone: updated.phone,
    email: updated.email,
    borough: updated.borough,
    neighborhood: updated.neighborhood,
    latitude: updated.latitude,
    longitude: updated.longitude,
    status: updated.status,
    isPublic: updated.is_public,
    updatedAt: updated.updated_at,
  });
}
