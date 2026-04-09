import { Type } from '@google/genai'
import type { FunctionDeclaration } from '@google/genai'
import type { TouristProfile } from '@/types/types'
import { MOCK_BUSINESSES } from '@/lib/businesses'
import { calcularRecomendaciones, saturacionEstable } from '@/lib/equity'

// ─── BOROUGH → COORDENADAS ────────────────────────────────────────────────────

const BOROUGH_COORDS: Record<string, [number, number]> = {
  'centro':           [19.4326, -99.1332],
  'cuauhtémoc':       [19.4326, -99.1332],
  'cuauhtemoc':       [19.4326, -99.1332],
  'condesa':          [19.4122, -99.1728],
  'roma':             [19.4175, -99.1614],
  'polanco':          [19.4330, -99.1960],
  'coyoacán':         [19.3467, -99.1617],
  'coyoacan':         [19.3467, -99.1617],
  'xochimilco':       [19.2570, -99.1040],
  'tlalpan':          [19.2970, -99.1650],
  'tepito':           [19.4460, -99.1250],
  'doctores':         [19.4160, -99.1450],
  'santa fe':         [19.3630, -99.2590],
  'pedregal':         [19.3290, -99.1920],
  'iztapalapa':       [19.3570, -99.0740],
  'azcapotzalco':     [19.4860, -99.1850],
  'gustavo':          [19.4780, -99.1120],
}

const DEFAULT_COORDS: [number, number] = [19.4326, -99.1332]

function resolveCoords(zona?: string): [number, number] {
  if (!zona) return DEFAULT_COORDS
  const key = zona.toLowerCase()
  for (const [k, v] of Object.entries(BOROUGH_COORDS)) {
    if (key.includes(k)) return v
  }
  return DEFAULT_COORDS
}

// ─── DECLARACIÓN ─────────────────────────────────────────────────────────────

export const declarations: FunctionDeclaration[] = [
  {
    name: 'recomendar_negocios',
    description: 'Recomienda negocios locales usando el algoritmo de equidad de MexGo. Úsala cuando el turista pida sugerencias o no sepa qué hacer. Devuelve los mejores negocios según los intereses del turista y la afluencia actual.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tipo: {
          type: Type.STRING,
          description: 'Categoría opcional: taquería, café, mercado, artesanías, bar, etc. Omitir si el turista no especifica.',
        },
        zona: {
          type: Type.STRING,
          description: 'Zona o alcaldía del turista si la mencionó: "Coyoacán", "Roma", "Polanco", etc. Omitir si no se sabe.',
        },
      },
      required: [],
    },
  },
]

// ─── HANDLER ─────────────────────────────────────────────────────────────────

export function createRecommendHandlers(perfil?: TouristProfile) {
  return {
    recomendar_negocios: ({ zona }: { tipo?: string; zona?: string }) => {
      const negocios = MOCK_BUSINESSES
      const saturacion = saturacionEstable(negocios.map(n => n.id))
      const zonaResolved = zona ?? perfil?.borough
      const [lat, lng] = resolveCoords(zonaResolved)

      return calcularRecomendaciones({
        negocios,
        saturacion,
        turistaLat: lat,
        turistaLng: lng,
        tripMotives: perfil?.trip_motives,
      })
    },
  }
}
