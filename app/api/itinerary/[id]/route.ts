import { NextRequest, NextResponse } from 'next/server'
import { editarEvento, eliminarEvento } from '@/lib/itinerario'

type Params = { params: Promise<{ id: string }> }

// PATCH /api/itinerary/[id]
// Edita una parada existente (día, hora o nombre)

type EditStopRequest = {
  dia?: string
  hora?: string
  nombre?: string
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json() as EditStopRequest

  const resultado = editarEvento({ id, ...body })

  if ('error' in resultado) {
    return NextResponse.json({ ok: false, error: resultado.error }, { status: 404 })
  }

  return NextResponse.json({ ok: true, data: resultado })
}

// DELETE /api/itinerary/[id]
// Elimina una parada del itinerario

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params

  const resultado = eliminarEvento({ id })

  if (!resultado.eliminado) {
    return NextResponse.json({ ok: false, error: `No existe parada con id ${id}` }, { status: 404 })
  }

  return NextResponse.json({ ok: true, data: resultado })
}
