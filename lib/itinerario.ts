import type { ItineraryStop } from '@/types/types'
import { MOCK_BUSINESSES } from '@/lib/businesses'

// Array en memoria por request — se inicializa desde el cliente via inicializarParadas()
const paradas: ItineraryStop[] = []

// Llamado desde /api/chat antes de invocar Gemini para sincronizar el estado del cliente
export function inicializarParadas(stops: ItineraryStop[]): void {
  paradas.length = 0
  paradas.push(...stops)
}

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
  const negocio = MOCK_BUSINESSES.find(b => b.id === args.negocio_id)
  const stop: ItineraryStop = {
    id: `stop-${Date.now()}`,
    itineraryId: 'local',
    routeDate: args.dia,
    stopOrder: paradas.length + 1,
    stopType: 'BUSINESS',
    businessProfileId: args.negocio_id,
    label: args.nombre,
    startTime: args.hora,
    latitude: negocio?.latitude ?? 19.4326,
    longitude: negocio?.longitude ?? -99.1332,
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

export function eliminarEvento(args: EliminarEventoArgs): { eliminado: boolean; id: string; label?: string } {
  const idx = paradas.findIndex(p => p.id === args.id)
  if (idx === -1) return { eliminado: false, id: args.id }

  const label = paradas[idx].label
  paradas.splice(idx, 1)
  paradas.forEach((p, i) => { p.stopOrder = i + 1 })

  return { eliminado: true, id: args.id, label }
}

export function leerItinerario(): ItineraryStop[] {
  return paradas
}
