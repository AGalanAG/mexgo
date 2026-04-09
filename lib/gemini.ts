import { GoogleGenAI } from '@google/genai'
import type { Content } from '@google/genai'
import type { ChatMessagePayload, ItineraryStop, NegocioConScore, TouristProfile } from '@/types/types'
import { GEMINI_MODEL, buildSystemPrompt } from '@/constants'
import { createHandlers, declarations } from '@/lib/tools'

// ─── CLIENTE ──────────────────────────────────────────────────────────────────

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────

type ChatResult = {
  respuesta: string
  eventoAgregado?: ItineraryStop
  eventoEditado?: ItineraryStop
  eventoEliminado?: { id: string; label?: string; eliminado: boolean }
  negociosRecomendados?: NegocioConScore[]
}

export async function chat(
  userId: string,
  mensaje: string,
  historial: ChatMessagePayload[] = [],
  perfil?: TouristProfile,
): Promise<ChatResult> {

  const handlers = createHandlers(userId)

  const contents: Content[] = [
    ...historial.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: mensaje }] },
  ]

  const config = {
    tools: [{ functionDeclarations: declarations }],
    systemInstruction: buildSystemPrompt(perfil),
  }

  let eventoAgregado: ItineraryStop | undefined
  let eventoEditado: ItineraryStop | undefined
  let eventoEliminado: { id: string; label?: string; eliminado: boolean } | undefined
  let negociosRecomendados: NegocioConScore[] | undefined

  while (true) {
    const respuesta = await ai.models.generateContent({ model: GEMINI_MODEL, contents, config })

    if (respuesta.functionCalls && respuesta.functionCalls.length > 0) {
      if (respuesta.candidates?.[0].content) {
        contents.push(respuesta.candidates[0].content)
      }

      const resultados = respuesta.functionCalls.map(fc => {
        const name = fc.name ?? ''
        const fn = handlers[name]
        const resultado = fn ? fn(fc.args as never) : { error: `Función ${name} no existe` }

        if (name === 'agregar_evento') eventoAgregado = resultado as ItineraryStop
        if (name === 'editar_evento' && (resultado as ItineraryStop).id) eventoEditado = resultado as ItineraryStop
        if (name === 'eliminar_evento') eventoEliminado = resultado as { id: string; label?: string; eliminado: boolean }
        if (name === 'buscar_negocios' || name === 'recomendar_negocios') {
          negociosRecomendados = resultado as NegocioConScore[]
        }

        return { id: fc.id, name, response: { result: resultado } }
      })

      contents.push({
        role: 'user' as const,
        parts: resultados.map(r => ({ functionResponse: r })),
      })

    } else {
      return { respuesta: respuesta.text ?? '', eventoAgregado, eventoEditado, eventoEliminado, negociosRecomendados }
    }
  }
}
