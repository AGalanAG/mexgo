import { Type } from '@google/genai'
import type { FunctionDeclaration } from '@google/genai'
import { buscarNegocios } from '@/lib/businesses'
import { calcularRecomendaciones, mockSaturacion } from '@/lib/equity'

type RecomendarArgs = {
  tipo?: string
  lat: number
  lng: number
}

function recomendar({ tipo, lat, lng }: RecomendarArgs) {
  const negocios   = buscarNegocios(tipo ?? '')
  const saturacion = mockSaturacion(negocios.map(n => n.id))

  return calcularRecomendaciones({
    negocios,
    saturacion,
    turistaLat: lat,
    turistaLng: lng,
  })
}

export const declarations: FunctionDeclaration[] = [
  {
    name: 'recomendar_negocios',
    description: 'Recomienda negocios locales usando el algoritmo de equidad de MexGo. Úsala cuando el turista pida sugerencias o no sepa qué hacer. Devuelve los 4-6 negocios más relevantes según proximidad, saturación y perfil.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tipo: {
          type: Type.STRING,
          description: 'Categoría opcional: taquería, café, mercado, artesanías, etc. Si el turista no especifica, omitir.',
        },
        lat: {
          type: Type.NUMBER,
          description: 'Latitud actual del turista.',
        },
        lng: {
          type: Type.NUMBER,
          description: 'Longitud actual del turista.',
        },
      },
      required: ['lat', 'lng'],
    },
  },
]

export const handlers: Record<string, (args: never) => unknown> = {
  recomendar_negocios: (args: RecomendarArgs) => recomendar(args),
}
