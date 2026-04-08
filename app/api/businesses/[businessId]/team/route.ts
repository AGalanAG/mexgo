import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasRole } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';

interface TeamMemberBody {
  fullName?: unknown;
  roleTitle?: unknown;
  userId?: unknown;
  isOwner?: unknown;
}

async function canManageBusiness(userId: string, businessId: string) {
  const isAdmin = await userHasRole(userId, 'ADMIN');
  if (isAdmin) {
    return true;
  }

  const { data, error } = await getSupabaseAdmin()
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

  const hasAccess = await canManageBusiness(user.id, businessId);
  if (!hasAccess) {
    return apiError('FORBIDDEN', 'No autorizado para consultar equipo', 403);
  }

  const { data, error } = await getSupabaseAdmin()
    .from('business_team_members')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    return apiError('INTERNAL_ERROR', error.message, 500);
  }

  return apiOk({
    items: (data || []).map((member) => ({
      id: member.id,
      businessId: member.business_id,
      userId: member.user_id,
      fullName: member.full_name,
      roleTitle: member.role_title,
      isOwner: member.is_owner,
      isActive: member.is_active,
      invitedAt: member.invited_at,
      joinedAt: member.joined_at,
      createdAt: member.created_at,
    })),
  });
}

export async function POST(
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

  const hasAccess = await canManageBusiness(user.id, businessId);
  if (!hasAccess) {
    return apiError('FORBIDDEN', 'No autorizado para agregar miembros', 403);
  }

  let body: TeamMemberBody;
  try {
    body = (await request.json()) as TeamMemberBody;
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON invalido', 400);
  }

  if (!isNonEmptyString(body.fullName) || !isNonEmptyString(body.roleTitle)) {
    return apiError('VALIDATION_ERROR', 'fullName y roleTitle son obligatorios', 400);
  }

  const userId = isNonEmptyString(body.userId) ? body.userId : null;
  const isOwner = typeof body.isOwner === 'boolean' ? body.isOwner : false;
  const joinedAt = userId ? new Date().toISOString() : null;

  const { data, error } = await getSupabaseAdmin()
    .from('business_team_members')
    .insert({
      business_id: businessId,
      user_id: userId,
      full_name: body.fullName,
      role_title: body.roleTitle,
      is_owner: isOwner,
      is_active: true,
      invited_at: joinedAt,
      joined_at: joinedAt,
    })
    .select('*')
    .single();

  if (error || !data) {
    return apiError('INTERNAL_ERROR', error?.message || 'No fue posible agregar miembro', 500);
  }

  return apiOk(
    {
      id: data.id,
      businessId: data.business_id,
      userId: data.user_id,
      fullName: data.full_name,
      roleTitle: data.role_title,
      isOwner: data.is_owner,
      isActive: data.is_active,
      invitedAt: data.invited_at,
      joinedAt: data.joined_at,
      createdAt: data.created_at,
    },
    201,
  );
}
