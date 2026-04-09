import { NextRequest, NextResponse } from 'next/server'
import { editarEvento, eliminarEvento, getOrCreateItinerary } from '@/lib/itinerario'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { apiError } from '@/lib/api-response'
import { DEMO_USER_ID } from '@/constants/demo-data'
import { getSupabaseAdmin } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

// PATCH /api/itinerary/[id]
// Edita una parada existente (día, hora o nombre)

type EditStopRequest = {
  dia?: string
  hora?: string
  nombre?: string
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getAuthenticatedUser(req)
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401)
  }

  const { id } = await params
  const body = await req.json() as EditStopRequest

  // Demo bypass
  if (user.id === DEMO_USER_ID) {
    const resultado = editarEvento(user.id, { id, ...body })
    if ('error' in resultado) {
      return NextResponse.json({ ok: false, error: resultado.error }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: resultado })
  }

  try {
    const itineraryId = await getOrCreateItinerary(user.id)
    const { data, error } = await getSupabaseAdmin()
      .from('itinerary_stops')
      .update({
        route_date: body.dia,
        start_time: body.hora,
        label:      body.nombre,
      })
      .eq('id', id)
      .eq('itinerary_id', itineraryId) // Seguridad: verificar propiedad
      .select('*')
      .single()

    if (error) return apiError('INTERNAL_ERROR', error.message, 500)
    if (!data) return apiError('NOT_FOUND', 'Parada no encontrada', 404)

    return NextResponse.json({ ok: true, data })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al editar parada'
    return apiError('INTERNAL_ERROR', msg, 500)
  }
}

// DELETE /api/itinerary/[id]
// Elimina una parada del itinerario

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getAuthenticatedUser(_req)
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401)
  }

  const { id } = await params

  // Demo bypass
  if (user.id === DEMO_USER_ID) {
    const resultado = eliminarEvento(user.id, { id })
    if (!resultado.eliminado) {
      return NextResponse.json({ ok: false, error: `No existe parada con id ${id}` }, { status: 404 })
    }
    return NextResponse.json({ ok: true, data: resultado })
  }

  try {
    const itineraryId = await getOrCreateItinerary(user.id)
    const { error } = await getSupabaseAdmin()
      .from('itinerary_stops')
      .delete()
      .eq('id', id)
      .eq('itinerary_id', itineraryId)

    if (error) return apiError('INTERNAL_ERROR', error.message, 500)

    return NextResponse.json({ ok: true, data: { id, eliminado: true } })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al eliminar parada'
    return apiError('INTERNAL_ERROR', msg, 500)
  }
}
