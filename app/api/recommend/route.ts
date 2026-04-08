import { NextRequest, NextResponse } from 'next/server'
import { buscarNegocios } from '@/lib/businesses'
import { calcularRecomendaciones, mockSaturacion } from '@/lib/equity'
import type { NegocioConScore } from '@/types/types'

// POST /api/recommend
// Recibe perfil del turista + coords → devuelve 4-6 negocios rankeados por equity

type RecommendRequest = {
  location: {
    lat: number
    lng: number
  }
  questionnaire?: Record<string, unknown>
  tipo?: string
}

type RecommendResponse = {
  ok: boolean
  data: NegocioConScore[]
}

export async function POST(req: NextRequest) {
  const body = await req.json() as RecommendRequest

  const { location, questionnaire, tipo } = body

  const negocios   = buscarNegocios(tipo ?? '')
  const saturacion = mockSaturacion(negocios.map(n => n.id))

  const data = calcularRecomendaciones({
    negocios,
    saturacion,
    turistaLat: location.lat,
    turistaLng: location.lng,
    questionnaire,
  })

  return NextResponse.json<RecommendResponse>({ ok: true, data })
}
