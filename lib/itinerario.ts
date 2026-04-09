import type { ItineraryStop } from '@/types/types'
import { MOCK_BUSINESSES } from '@/lib/businesses'
import { getSupabaseAdmin } from '@/lib/supabase'

/** Obtiene el itinerario activo del turista, o crea uno nuevo si no existe */
export async function getOrCreateItinerary(userId: string): Promise<string> {
  const supabase = getSupabaseAdmin()

  const { data: existing } = await supabase
    .from('itineraries')
    .select('id')
    .eq('tourist_user_id', userId)
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) return existing.id

  const { data: created, error } = await supabase
    .from('itineraries')
    .insert({ tourist_user_id: userId, status: 'draft' })
    .select('id')
    .single()

  if (error || !created) throw new Error('No se pudo crear itinerario')
  return created.id
}

// Estado en memoria segmentado por usuario para evitar mezclar itinerarios entre sesiones.
const paradasPorUsuario = new Map<string, ItineraryStop[]>()

function obtenerParadasUsuario(userId: string): ItineraryStop[] {
  const existing = paradasPorUsuario.get(userId)
  if (existing) {
    return existing
  }

  const created: ItineraryStop[] = []
  paradasPorUsuario.set(userId, created)
  return created
}

// Llamado desde /api/chat antes de invocar Gemini para sincronizar el estado del cliente
export function inicializarParadas(userId: string, stops: ItineraryStop[]): void {
  const paradas = obtenerParadasUsuario(userId)
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

export function agregarEvento(userId: string, args: AgregarEventoArgs): ItineraryStop {
  const paradas = obtenerParadasUsuario(userId)
  const negocio = MOCK_BUSINESSES.find(b => b.id === args.negocio_id)
  const stop: ItineraryStop = {
    id: `stop-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

export function editarEvento(userId: string, args: EditarEventoArgs): ItineraryStop | { error: string } {
  const paradas = obtenerParadasUsuario(userId)
  const idx = paradas.findIndex(p => p.id === args.id)
  if (idx === -1) return { error: `No existe parada con id ${args.id}` }

  if (args.dia)    paradas[idx].routeDate  = args.dia
  if (args.hora)   paradas[idx].startTime  = args.hora
  if (args.nombre) paradas[idx].label      = args.nombre

  return paradas[idx]
}

export function eliminarEvento(userId: string, args: EliminarEventoArgs): { eliminado: boolean; id: string; label?: string } {
  const paradas = obtenerParadasUsuario(userId)
  const idx = paradas.findIndex(p => p.id === args.id)
  if (idx === -1) return { eliminado: false, id: args.id }

  const label = paradas[idx].label
  paradas.splice(idx, 1)
  paradas.forEach((p, i) => { p.stopOrder = i + 1 })

  return { eliminado: true, id: args.id, label }
}

export function leerItinerario(userId: string): ItineraryStop[] {
  return obtenerParadasUsuario(userId)
}

export function agregarEventosLote(userId: string, args: { eventos: AgregarEventoArgs[] }): ItineraryStop[] {
  return args.eventos.map(e => agregarEvento(userId, e))
}

export function editarEventosLote(userId: string, args: { ediciones: EditarEventoArgs[] }): (ItineraryStop | { error: string })[] {
  return args.ediciones.map(e => editarEvento(userId, e))
}

export function eliminarEventosLote(userId: string, args: { ids: string[] }): { eliminado: boolean; id: string; label?: string }[] {
  return args.ids.map(id => eliminarEvento(userId, { id }))
}
