import { NextRequest, NextResponse } from 'next/server'
import { agregarEvento, leerItinerario } from '@/lib/itinerario'
import type { ItineraryStop } from '@/types/types'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { apiError } from '@/lib/api-response'

// GET /api/itinerary
// Devuelve el itinerario completo del turista

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401)
  }

  const paradas = leerItinerario(user.id)
  return NextResponse.json({ ok: true, data: paradas })
}

// POST /api/itinerary
// Agrega una parada al itinerario

type AddStopRequest = {
  negocio_id: string
  nombre: string
  dia: string
  hora: string
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401)
  }

  const body = await req.json() as AddStopRequest

  const stop: ItineraryStop = agregarEvento(user.id, body)

  return NextResponse.json({ ok: true, data: stop }, { status: 201 })
}
