import { NextRequest, NextResponse } from 'next/server'
import { agregarEvento, leerItinerario, inicializarParadas, getOrCreateItinerary } from '@/lib/itinerario'
import type { ItineraryStop } from '@/types/types'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { apiError, apiOk } from '@/lib/api-response'
import { DEMO_USER_ID, DEMO_ITINERARY_STOPS } from '@/constants/demo-data'
import { getSupabaseAdmin } from '@/lib/supabase'

// GET /api/itinerary
// Devuelve el itinerario completo del turista

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401)
  }

  // Demo bypass — seed con datos de ejemplo si el Map está vacío (ej. tras reinicio del servidor)
  if (user.id === DEMO_USER_ID) {
    let paradas = leerItinerario(user.id)
    if (paradas.length === 0) {
      inicializarParadas(user.id, DEMO_ITINERARY_STOPS)
      paradas = leerItinerario(user.id)
    }
    return NextResponse.json({ ok: true, data: paradas })
  }

  try {
    const itineraryId = await getOrCreateItinerary(user.id)
    const { data, error } = await getSupabaseAdmin()
      .from('itinerary_stops')
      .select('*')
      .eq('itinerary_id', itineraryId)
      .order('stop_order', { ascending: true })

    if (error) return apiError('INTERNAL_ERROR', error.message, 500)

    // Mapear a ItineraryStop
    const stops: ItineraryStop[] = (data ?? []).map(row => ({
      id:                row.id,
      itineraryId:       row.itinerary_id,
      routeDate:         row.route_date,
      stopOrder:         row.stop_order,
      stopType:          row.stop_type,
      businessProfileId: row.business_profile_id ?? undefined,
      label:             row.label,
      startTime:         row.start_time ?? undefined,
      endTime:           row.end_time ?? undefined,
      latitude:          Number(row.latitude) ?? 19.4326,
      longitude:         Number(row.longitude) ?? -99.1332,
      createdAt:         row.created_at,
    }))

    return apiOk(stops)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al obtener itinerario'
    return apiError('INTERNAL_ERROR', msg, 500)
  }
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

  // Demo bypass
  if (user.id === DEMO_USER_ID) {
    const stop = agregarEvento(user.id, body)
    return NextResponse.json({ ok: true, data: stop }, { status: 201 })
  }

  try {
    const itineraryId = await getOrCreateItinerary(user.id)
    const supabase = getSupabaseAdmin()

    // Obtener el stop_order siguiente
    const { count } = await supabase
      .from('itinerary_stops')
      .select('id', { count: 'exact', head: true })
      .eq('itinerary_id', itineraryId)

    const { data, error } = await supabase
      .from('itinerary_stops')
      .insert({
        itinerary_id:        itineraryId,
        route_date:          body.dia,
        stop_order:          (count ?? 0) + 1,
        stop_type:           'BUSINESS',
        business_profile_id: body.negocio_id || null,
        label:               body.nombre,
        start_time:          body.hora || null,
        latitude:            19.4326, // Default CDMX
        longitude:           -99.1332,
      })
      .select('*')
      .single()

    if (error) return apiError('INTERNAL_ERROR', error.message, 500)

    const stop: ItineraryStop = {
      id:                data.id,
      itineraryId:       data.itinerary_id,
      routeDate:         data.route_date,
      stopOrder:         data.stop_order,
      stopType:          data.stop_type,
      businessProfileId: data.business_profile_id ?? undefined,
      label:             data.label,
      startTime:         data.start_time ?? undefined,
      latitude:          Number(data.latitude),
      longitude:         Number(data.longitude),
      createdAt:         data.created_at,
    }

    return NextResponse.json({ ok: true, data: stop }, { status: 201 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al agregar parada'
    return apiError('INTERNAL_ERROR', msg, 500)
  }
}
