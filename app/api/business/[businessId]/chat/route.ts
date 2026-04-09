import { NextRequest } from 'next/server'
import { getAuthenticatedUser, userHasRole } from '@/lib/auth-helpers'
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response'
import { getSupabaseAdmin } from '@/lib/supabase'
import { buildInsightContext } from '@/lib/business-insight'
import { buildBusinessChatSystemPrompt } from '@/constants'
import { businessChat } from '@/lib/business-chat'
import { DEMO_USER_ID, DEMO_BUSINESS_ID, DEMO_INSIGHT_CONTEXT, DEMO_INSIGHT, isDemoMode } from '@/lib/demo'
import type { ChatMessagePayload, BusinessInsight } from '@/types/types'

const MAX_MENSAJE_LEN = 500

async function canAccessBusiness(userId: string, businessId: string): Promise<boolean> {
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

export async function POST(
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

  // 2. Autorizacion
  const hasAccess = await canAccessBusiness(user.id, businessId)
  if (!hasAccess) {
    return apiError('FORBIDDEN', 'No tienes acceso a este negocio', 403)
  }

  // 3. Parsear body
  let body: { mensaje: string; historial?: ChatMessagePayload[] }
  try {
    body = await request.json()
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON invalido', 400)
  }

  const { mensaje, historial = [] } = body

  if (!isNonEmptyString(mensaje)) {
    return apiError('VALIDATION_ERROR', 'mensaje requerido', 400)
  }
  if (mensaje.length > MAX_MENSAJE_LEN) {
    return apiError('VALIDATION_ERROR', `mensaje demasiado largo (max ${MAX_MENSAJE_LEN} chars)`, 400)
  }

  // 4. Demo mode: usar contexto mock, Gemini sigue funcionando sin Supabase
  if (isDemoMode() || user.id === DEMO_USER_ID || businessId === DEMO_BUSINESS_ID) {
    const systemPrompt = buildBusinessChatSystemPrompt(DEMO_INSIGHT_CONTEXT, DEMO_INSIGHT)
    let respuesta: string
    try {
      respuesta = await businessChat(systemPrompt, historial, mensaje)
    } catch {
      return apiError('INTERNAL_ERROR', 'No se pudo generar respuesta de IA', 500)
    }
    const historial_actualizado: ChatMessagePayload[] = [
      ...historial,
      { role: 'user', text: mensaje },
      { role: 'model', text: respuesta },
    ]
    return apiOk({ respuesta, historial_actualizado })
  }

  // 5. Contexto del negocio + cache del insight (en paralelo)
  let ctx
  let cachedInsight: BusinessInsight | null = null

  try {
    const [ctxResult, cacheResult] = await Promise.all([
      buildInsightContext(businessId),
      getSupabaseAdmin()
        .from('business_insights_cache')
        .select('insight_payload')
        .eq('business_id', businessId)
        .maybeSingle(),
    ])
    ctx = ctxResult
    cachedInsight = (cacheResult.data?.insight_payload as BusinessInsight) ?? null
  } catch {
    // Si falla buildInsightContext, no podemos continuar
    return apiError('INTERNAL_ERROR', 'Error al recopilar contexto del negocio', 500)
  }

  // 5. System prompt
  const systemPrompt = buildBusinessChatSystemPrompt(ctx, cachedInsight)

  // 6. Llamar a Gemini
  let respuesta: string
  try {
    respuesta = await businessChat(systemPrompt, historial, mensaje)
  } catch {
    return apiError('INTERNAL_ERROR', 'No se pudo generar respuesta de IA', 500)
  }

  // 7. Construir historial actualizado
  const historial_actualizado: ChatMessagePayload[] = [
    ...historial,
    { role: 'user', text: mensaje },
    { role: 'model', text: respuesta },
  ]

  return apiOk({ respuesta, historial_actualizado })
}
