import { NextRequest, NextResponse } from 'next/server'
import { MOCK_BUSINESSES } from '@/lib/businesses'
import { calcularRecomendaciones, saturacionEstable } from '@/lib/equity'
import type { NegocioConScore } from '@/types/types'

// POST /api/recommend
// Recibe perfil del turista + coords → devuelve 4-6 negocios rankeados por equity

type RecommendRequest = {
  location?: { lat: number; lng: number }
  lat?: number
  lng?: number
  tripMotives?: string[]
}

type RecommendResponse = {
  ok: boolean
  data: NegocioConScore[]
}

export async function POST(req: NextRequest) {
  let body: RecommendRequest
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const lat = body.location?.lat ?? body.lat ?? 19.4326
  const lng = body.location?.lng ?? body.lng ?? -99.1332

  const negocios = MOCK_BUSINESSES
  const saturacion = saturacionEstable(negocios.map(n => n.id))

  const data = calcularRecomendaciones({
    negocios,
    saturacion,
    turistaLat: lat,
    turistaLng: lng,
    tripMotives: body.tripMotives,
  })

  return NextResponse.json<RecommendResponse>({ ok: true, data })
}
