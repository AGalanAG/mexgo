import { NextRequest } from 'next/server'
import { getAuthenticatedUser, userHasRole } from '@/lib/auth-helpers'
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response'
import { getSupabaseAdmin } from '@/lib/supabase'
import { buildInsightContext, geminiGenerateInsight } from '@/lib/business-insight'
import { DEMO_USER_ID, DEMO_BUSINESS_ID, DEMO_INSIGHT, isDemoMode } from '@/lib/demo'

const CACHE_TTL_MS = 6 * 60 * 60 * 1000  // 6 horas

async function canReadInsight(userId: string, businessId: string): Promise<boolean> {
  const isAdmin = await userHasRole(userId, 'ADMIN')
  if (isAdmin) return true

  const { data, error } = await getSupabaseAdmin()
    .from('business_profiles')
    .select('id')
    .eq('id', businessId)
    .eq('owner_user_id', userId)
    .limit(1)

  return !error && Boolean(data && data.length > 0)
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> },
) {
  // 1. Autenticacion
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401)
  }

  const { businessId } = await context.params
  if (!isNonEmptyString(businessId)) {
    return apiError('VALIDATION_ERROR', 'businessId invalido', 400)
  }

  // 2. Demo mode: devolver insight mock sin Supabase
  if (isDemoMode() || user.id === DEMO_USER_ID || businessId === DEMO_BUSINESS_ID) {
    return apiOk({
      cached:      true,
      generatedAt: new Date().toISOString(),
      isStale:     false,
      insight:     DEMO_INSIGHT,
    })
  }

  // 3. Autorizacion
  const hasAccess = await canReadInsight(user.id, businessId)
  if (!hasAccess) {
    return apiError('FORBIDDEN', 'No autorizado para consultar este insight', 403)
  }

  const supabase = getSupabaseAdmin()

  // 3. Revisar cache
  const { data: cached } = await supabase
    .from('business_insights_cache')
    .select('insight_payload, generated_at, is_stale')
    .eq('business_id', businessId)
    .maybeSingle()

  if (cached) {
    const age = Date.now() - new Date(cached.generated_at).getTime()
    if (age < CACHE_TTL_MS && !cached.is_stale) {
      return apiOk({
        cached: true,
        generatedAt: cached.generated_at,
        isStale: false,
        insight: cached.insight_payload,
      })
    }
  }

  // 4. Generar nuevo insight
  let ctx
  try {
    ctx = await buildInsightContext(businessId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al recopilar contexto'
    return apiError('INTERNAL_ERROR', msg, 500)
  }

  let insight
  try {
    insight = await geminiGenerateInsight(ctx)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al generar insight con Gemini'
    // Si falla Gemini pero hay cache stale, devolver el cache con advertencia
    if (cached) {
      return apiOk({
        cached: true,
        generatedAt: cached.generated_at,
        isStale: true,
        insight: cached.insight_payload,
        warning: 'Insight desactualizado — Gemini no disponible temporalmente',
      })
    }
    return apiError('INTERNAL_ERROR', msg, 500)
  }

  // 5. Guardar en cache
  const generatedAt = new Date().toISOString()
  await supabase
    .from('business_insights_cache')
    .upsert(
      {
        business_id: businessId,
        insight_payload: insight,
        generated_at: generatedAt,
        is_stale: false,
      },
      { onConflict: 'business_id' },
    )

  return apiOk({
    cached: false,
    generatedAt,
    isStale: false,
    insight,
  })
}
