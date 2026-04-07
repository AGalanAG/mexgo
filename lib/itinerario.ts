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

export function leerItinerario(): ItineraryStop[] {
  return paradas
}
