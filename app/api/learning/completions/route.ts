import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasAnyRole, userHasRole } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

interface CompletionBody {
  businessId?: unknown;
  memberId?: unknown;
  moduleId?: unknown;
  score?: unknown;
  status?: unknown;
  evidenceUrl?: unknown;
}

const ALLOWED_STATUS = new Set(['PENDING', 'PASSED', 'FAILED', 'VALIDATED']);

async function canReadBusiness(userId: string, businessId: string) {
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

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  const businessId = new URL(request.url).searchParams.get('businessId');
  if (!isNonEmptyString(businessId)) {
    return apiError('VALIDATION_ERROR', 'businessId es obligatorio', 400);
  }

  const hasAccess = await canReadBusiness(user.id, businessId);
  if (!hasAccess) {
    return apiError('FORBIDDEN', 'No autorizado para consultar completitud', 403);
  }

  const { data, error } = await supabaseAdmin
    .from('learning_completions')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    return apiError('INTERNAL_ERROR', error.message, 500);
  }

  return apiOk({
    items: data || [],
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  const hasRole = await userHasAnyRole(user.id, ['ENCARGADO_NEGOCIO', 'ADMIN', 'EMPLEADO_NEGOCIO']);
  if (!hasRole) {
    return apiError('FORBIDDEN', 'Rol no autorizado para registrar completitud', 403);
  }

  let body: CompletionBody;
  try {
    body = (await request.json()) as CompletionBody;
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON invalido', 400);
  }

  if (
    !isNonEmptyString(body.businessId) ||
    !isNonEmptyString(body.memberId) ||
    !isNonEmptyString(body.moduleId)
  ) {
    return apiError('VALIDATION_ERROR', 'businessId, memberId y moduleId son obligatorios', 400);
  }

  const status = isNonEmptyString(body.status) ? body.status : 'PENDING';
  if (!ALLOWED_STATUS.has(status)) {
    return apiError('VALIDATION_ERROR', 'status invalido', 400);
  }

  const score = typeof body.score === 'number' && Number.isFinite(body.score) ? body.score : null;
  if (score !== null && (score < 0 || score > 100)) {
    return apiError('VALIDATION_ERROR', 'score fuera de rango', 400);
  }

  const evidenceUrl = isNonEmptyString(body.evidenceUrl) ? body.evidenceUrl : null;

  const { data, error } = await supabaseAdmin
    .from('learning_completions')
    .insert({
      business_id: body.businessId,
      member_id: body.memberId,
      module_id: body.moduleId,
      attempt_number: 1,
      score,
      status,
      evidence_url: evidenceUrl,
      validated_by: status === 'VALIDATED' ? user.id : null,
      validated_at: status === 'VALIDATED' ? new Date().toISOString() : null,
    })
    .select('*')
    .single();

  if (error || !data) {
    return apiError('INTERNAL_ERROR', error?.message || 'No fue posible registrar completitud', 500);
  }

  return apiOk(data, 201);
}
