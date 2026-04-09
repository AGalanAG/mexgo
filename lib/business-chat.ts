import { GoogleGenAI } from '@google/genai'
import type { Content } from '@google/genai'
import { GEMINI_MODEL } from '@/constants'
import type { ChatMessagePayload } from '@/types/types'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function businessChat(
  systemPrompt: string,
  historial: ChatMessagePayload[],
  mensaje: string,
): Promise<string> {
  const contents: Content[] = [
    ...historial.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
    { role: 'user', parts: [{ text: mensaje }] },
  ]

  const config = { systemInstruction: systemPrompt }

  const respuesta = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents,
    config,
  })

  return respuesta.text ?? ''
}
