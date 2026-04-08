import { NextRequest, NextResponse } from 'next/server'
import { chat } from '@/lib/gemini'
import { inicializarParadas } from '@/lib/itinerario'
import type { ChatRequest, ChatResponse } from '@/types/types'

export async function POST(req: NextRequest) {
  const body = await req.json() as ChatRequest

  // Sincroniza el itinerario del cliente antes de que Gemini lo lea/modifique
  inicializarParadas(body.itinerario ?? [])

  const { respuesta, eventoAgregado, eventoEditado, eventoEliminado, negociosRecomendados } = await chat(body.mensaje, body.historial ?? [], body.perfil)

  return NextResponse.json<ChatResponse>({ respuesta, eventoAgregado, eventoEditado, eventoEliminado, negociosRecomendados })
}
