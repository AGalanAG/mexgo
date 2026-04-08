import { NextRequest, NextResponse } from 'next/server'
import { agregarEvento, leerItinerario } from '@/lib/itinerario'
import type { ItineraryStop } from '@/types/types'

// GET /api/itinerary
// Devuelve el itinerario completo del turista

export async function GET() {
  const paradas = leerItinerario()
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
  const body = await req.json() as AddStopRequest

  const stop: ItineraryStop = agregarEvento(body)

  return NextResponse.json({ ok: true, data: stop }, { status: 201 })
}
