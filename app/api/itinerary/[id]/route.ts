import { NextRequest, NextResponse } from 'next/server'
import { editarEvento, eliminarEvento } from '@/lib/itinerario'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { apiError } from '@/lib/api-response'

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

  const resultado = editarEvento(user.id, { id, ...body })

  if ('error' in resultado) {
    return NextResponse.json({ ok: false, error: resultado.error }, { status: 404 })
  }

  return NextResponse.json({ ok: true, data: resultado })
}

// DELETE /api/itinerary/[id]
// Elimina una parada del itinerario

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await getAuthenticatedUser(_req)
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401)
  }

  const { id } = await params

  const resultado = eliminarEvento(user.id, { id })

  if (!resultado.eliminado) {
    return NextResponse.json({ ok: false, error: `No existe parada con id ${id}` }, { status: 404 })
  }

  return NextResponse.json({ ok: true, data: resultado })
}
