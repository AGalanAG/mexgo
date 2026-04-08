import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/gemini'
import type { ChatRequest, ChatResponse } from '@/types/types'

// POST /api/chat
// El frontend manda el mensaje del turista, este route lo pasa a Gemini
// y devuelve la respuesta. El frontend nunca toca Gemini directo.

export async function POST(req: NextRequest) {
  const body = await req.json() as ChatRequest

  const { respuesta, eventoAgregado, eventoEditado, eventoEliminado, negociosRecomendados } = await chat(body.mensaje, body.historial ?? [], body.perfil)

  return NextResponse.json<ChatResponse>({ respuesta, eventoAgregado, eventoEditado, eventoEliminado, negociosRecomendados })
}
