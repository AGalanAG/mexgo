import { GoogleGenAI } from '@google/genai'
import type { Content } from '@google/genai'
import type { ChatMessagePayload, ItineraryStop } from '@/types/types'
import { GEMINI_MODEL, SYSTEM_PROMPT } from '@/constants'
import { declarations, handlers } from '@/lib/tools'

// ─── CLIENTE ──────────────────────────────────────────────────────────────────

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────

type ChatResult = {
  respuesta: string
  eventoAgregado?: ItineraryStop
}

export async function chat(mensaje: string, historial: ChatMessagePayload[] = []): Promise<ChatResult> {

  const contents: Content[] = [
    ...historial.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: mensaje }] },
  ]

  const config = {
    tools: [{ functionDeclarations: declarations }],
    systemInstruction: SYSTEM_PROMPT,
  }

  let eventoAgregado: ItineraryStop | undefined

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

        return { id: fc.id, name, response: { result: resultado } }
      })

      contents.push({
        role: 'user' as const,
        parts: resultados.map(r => ({ functionResponse: r })),
      })

    } else {
      return { respuesta: respuesta.text ?? '', eventoAgregado }
    }
  }
}
