import type { ItineraryStop } from '@/types/types'

// Hoy: array en memoria (se resetea al reiniciar el servidor)
// Mañana: reemplaza con queries a Supabase — nada más cambia

const paradas: ItineraryStop[] = []

type AgregarEventoArgs = {
  negocio_id: string
  nombre: string
  dia: string
  hora: string
}

type EditarEventoArgs = {
  id: string
  dia?: string
  hora?: string
  nombre?: string
}

type EliminarEventoArgs = {
  id: string
}

export function agregarEvento(args: AgregarEventoArgs): ItineraryStop {
  const stop: ItineraryStop = {
    id: `stop-${Date.now()}`,
    itineraryId: 'local',
    routeDate: args.dia,
    stopOrder: paradas.length + 1,
    stopType: 'BUSINESS',
    businessProfileId: args.negocio_id,
    label: args.nombre,
    startTime: args.hora,
    latitude: 0,
    longitude: 0,
    createdAt: new Date().toISOString(),
  }
  paradas.push(stop)
  return stop
}

export function editarEvento(args: EditarEventoArgs): ItineraryStop | { error: string } {
  const idx = paradas.findIndex(p => p.id === args.id)
  if (idx === -1) return { error: `No existe parada con id ${args.id}` }

  if (args.dia)    paradas[idx].routeDate  = args.dia
  if (args.hora)   paradas[idx].startTime  = args.hora
  if (args.nombre) paradas[idx].label      = args.nombre

  return paradas[idx]
}

export function eliminarEvento(args: EliminarEventoArgs): { eliminado: boolean; id: string } {
  const idx = paradas.findIndex(p => p.id === args.id)
  if (idx === -1) return { eliminado: false, id: args.id }

  paradas.splice(idx, 1)
  // Recalcula stopOrder
  paradas.forEach((p, i) => { p.stopOrder = i + 1 })

  return { eliminado: true, id: args.id }
}

export function leerItinerario(): ItineraryStop[] {
  return paradas
}
