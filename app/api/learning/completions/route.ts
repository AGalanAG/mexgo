import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasAnyRole } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';
import { DEMO_USER_ID } from '@/constants/demo-data';

interface CompletionBody {
  businessId?: unknown;
  moduleId?: unknown;
  score?: unknown;
  status?: unknown;
  evidenceUrl?: unknown;
  progressPercent?: unknown;
}

const ALLOWED_STATUS = new Set(['PENDING', 'PASSED', 'FAILED', 'VALIDATED']);

async function canReadBusiness(userId: string, businessId: string) {
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

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  if (user.id === DEMO_USER_ID) {
    return apiOk({ items: [] });
  }

  const businessId = new URL(request.url).searchParams.get('businessId');
  if (!isNonEmptyString(businessId)) {
    return apiError('VALIDATION_ERROR', 'businessId es obligatorio', 400);
  }

  const hasAccess = await canReadBusiness(user.id, businessId);
  if (!hasAccess) {
    return apiError('FORBIDDEN', 'No autorizado para consultar completitud', 403);
  }

  const { data, error } = await getSupabaseAdmin()
    .from('business_learning_progress')
    .select('business_id, module_id, progress_percent, status, attempts_count, best_score, last_score, last_attempt_at, completed_at, updated_at, learning_modules(id, slug, title, description, category, estimated_minutes, pass_score)')
    .eq('business_id', businessId)
    .order('updated_at', { ascending: false });

  if (error) {
    return apiError('INTERNAL_ERROR', error.message, 500);
  }

  const items = data || [];
  const totalModules = items.length;
  const completedModules = items.filter((row) => row.status === 'PASSED' || row.status === 'VALIDATED').length;
  const overallProgress =
    totalModules === 0
      ? 0
      : Number(
          (items.reduce((acc, row) => acc + Number(row.progress_percent ?? 0), 0) / totalModules).toFixed(2),
        );

  return apiOk({
    summary: {
      totalModules,
      completedModules,
      overallProgress,
    },
    items,
  });
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  if (user.id === DEMO_USER_ID) {
    return apiOk({ ok: true, message: 'Simulado en demo' });
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

  if (!isNonEmptyString(body.businessId) || !isNonEmptyString(body.moduleId)) {
    return apiError('VALIDATION_ERROR', 'businessId y moduleId son obligatorios', 400);
  }

  const hasAccess = await canReadBusiness(user.id, body.businessId);
  if (!hasAccess) {
    return apiError('FORBIDDEN', 'No autorizado para registrar avance en este negocio', 403);
  }

  const status = isNonEmptyString(body.status) ? body.status : 'PENDING';
  if (!ALLOWED_STATUS.has(status)) {
    return apiError('VALIDATION_ERROR', 'status invalido', 400);
  }

  const score = typeof body.score === 'number' && Number.isFinite(body.score) ? body.score : null;
  if (score !== null && (score < 0 || score > 100)) {
    return apiError('VALIDATION_ERROR', 'score fuera de rango', 400);
  }

  const progressPercentRaw =
    typeof body.progressPercent === 'number' && Number.isFinite(body.progressPercent)
      ? body.progressPercent
      : null;

  if (progressPercentRaw !== null && (progressPercentRaw < 0 || progressPercentRaw > 100)) {
    return apiError('VALIDATION_ERROR', 'progressPercent fuera de rango', 400);
  }

  const evidenceUrl = isNonEmptyString(body.evidenceUrl) ? body.evidenceUrl : null;

  const moduleLookup = await getSupabaseAdmin()
    .from('learning_modules')
    .select('id, pass_score')
    .eq('id', body.moduleId)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  if (moduleLookup.error) {
    return apiError('INTERNAL_ERROR', moduleLookup.error.message, 500);
  }

  if (!moduleLookup.data) {
    return apiError('NOT_FOUND', 'Modulo no encontrado o inactivo', 404);
  }

  const passScore = Number(moduleLookup.data.pass_score ?? 70);
  const computedStatus =
    isNonEmptyString(body.status)
      ? status
      : score === null
        ? 'PENDING'
        : score >= passScore
          ? 'PASSED'
          : 'FAILED';

  const attemptCountResult = await getSupabaseAdmin()
    .from('learning_completions')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', body.businessId)
    .eq('module_id', body.moduleId);

  if (attemptCountResult.error) {
    return apiError('INTERNAL_ERROR', attemptCountResult.error.message, 500);
  }

  const nextAttemptNumber = (attemptCountResult.count ?? 0) + 1;

  const { data, error } = await getSupabaseAdmin()
    .from('learning_completions')
    .insert({
      business_id: body.businessId,
      module_id: body.moduleId,
      attempt_number: nextAttemptNumber,
      score,
      status: computedStatus,
      evidence_url: evidenceUrl,
      validated_by: computedStatus === 'VALIDATED' ? user.id : null,
      validated_at: computedStatus === 'VALIDATED' ? new Date().toISOString() : null,
      recorded_by_user_id: user.id,
    })
    .select('*')
    .single();

  if (error || !data) {
    return apiError('INTERNAL_ERROR', error?.message || 'No fue posible registrar completitud', 500);
  }

  const progressPercent =
    progressPercentRaw !== null
      ? progressPercentRaw
      : computedStatus === 'PASSED' || computedStatus === 'VALIDATED'
        ? 100
        : score ?? 0;

  const existingProgress = await getSupabaseAdmin()
    .from('business_learning_progress')
    .select('progress_percent, attempts_count, best_score')
    .eq('business_id', body.businessId)
    .eq('module_id', body.moduleId)
    .limit(1)
    .maybeSingle();

  if (existingProgress.error) {
    return apiError('INTERNAL_ERROR', existingProgress.error.message, 500);
  }

  const prevProgress = Number(existingProgress.data?.progress_percent ?? 0);
  const prevAttempts = Number(existingProgress.data?.attempts_count ?? 0);
  const prevBestScore =
    typeof existingProgress.data?.best_score === 'number' ? existingProgress.data.best_score : null;
  const newBestScore =
    score === null
      ? prevBestScore
      : prevBestScore === null
        ? score
        : Math.max(prevBestScore, score);

  const { error: progressUpsertError } = await getSupabaseAdmin()
    .from('business_learning_progress')
    .upsert(
      {
        business_id: body.businessId,
        module_id: body.moduleId,
        progress_percent: Math.max(prevProgress, progressPercent),
        status: computedStatus,
        attempts_count: prevAttempts + 1,
        best_score: newBestScore,
        last_score: score,
        last_attempt_at: new Date().toISOString(),
        completed_at:
          computedStatus === 'PASSED' || computedStatus === 'VALIDATED'
            ? new Date().toISOString()
            : null,
      },
      { onConflict: 'business_id,module_id' },
    );

  if (progressUpsertError) {
    return apiError('INTERNAL_ERROR', progressUpsertError.message, 500);
  }

  return apiOk(data, 201);
}
