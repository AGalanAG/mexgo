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

  const body = await req.json() as ChatRequest

  // Sincroniza el itinerario del cliente antes de que Gemini lo lea/modifique
  inicializarParadas(user.id, body.itinerario ?? [])

  const { respuesta, eventosAgregados, eventosEditados, eventosEliminados, negociosRecomendados } = await chat(
    user.id,
    body.mensaje,
    body.historial ?? [],
    body.perfil,
  )

  return NextResponse.json<ChatResponse>({ respuesta, eventosAgregados, eventosEditados, eventosEliminados, negociosRecomendados })
}
