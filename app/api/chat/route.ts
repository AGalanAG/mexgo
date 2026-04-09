import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/gemini'
import { inicializarParadas } from '@/lib/itinerario'
import type { ChatRequest, ChatResponse } from '@/types/types'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { apiError } from '@/lib/api-response'

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401)
  }

  let body: ChatRequest
  try {
    body = await req.json() as ChatRequest
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON inválido', 400)
  }

  // Sincroniza el itinerario del cliente antes de que Gemini lo lea/modifique
  inicializarParadas(user.id, body.itinerario ?? [])

  try {
    const { respuesta, eventosAgregados, eventosEditados, eventosEliminados, negociosRecomendados } = await chat(
      user.id,
      body.mensaje,
      body.historial ?? [],
      body.perfil,
    )
    return NextResponse.json<ChatResponse>({ respuesta, eventosAgregados, eventosEditados, eventosEliminados, negociosRecomendados })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al procesar el mensaje'
    return apiError('INTERNAL_ERROR', msg, 500)
  }
}
