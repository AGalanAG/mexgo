import type { BusinessProfile, NegocioConScore } from '@/types/types'

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const BETA_OLA_MEXICO = 0.2   // bonus fijo para negocios verificados
const MAX_RESULTS     = 6

// ─── HAVERSINE ────────────────────────────────────────────────────────────────

function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(a))
}

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type SaturacionMap = Record<string, number> // businessId → saturation_score (0–1)

export type EquityInput = {
  negocios: BusinessProfile[]
  saturacion: SaturacionMap
  turistaLat: number
  turistaLng: number
  questionnaire?: Record<string, unknown>
}

// ─── RELEVANCIA ───────────────────────────────────────────────────────────────
// Hoy: score base + keywords del cuestionario vs descripcion del negocio
// Mañana: embeddings o scoring semántico con Gemini

function calcularRelevancia(negocio: BusinessProfile, questionnaire?: Record<string, unknown>): number {
  let base = 0.5

  if (!questionnaire) return base

  const desc = negocio.businessDescription.toLowerCase()

  const prefs = questionnaire.foodPreferences
  if (Array.isArray(prefs)) {
    for (const pref of prefs as string[]) {
      if (desc.includes(pref.toLowerCase())) {
        base += 0.15
        break
      }
    }
  }

  const style = questionnaire.travelStyle as string | undefined
  if (style && desc.includes(style.toLowerCase())) {
    base += 0.1
  }

  return Math.min(base, 1)
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────

export function calcularRecomendaciones({
  negocios,
  saturacion,
  turistaLat,
  turistaLng,
  questionnaire,
}: EquityInput): NegocioConScore[] {
  const scored = negocios
    .filter(n => n.isActive)
    .map(n => {
      const distKm      = distanciaKm(turistaLat, turistaLng, n.latitude, n.longitude)
      const proximidad  = 1 / (1 + distKm)
      const relevancia  = calcularRelevancia(n, questionnaire)
      const beta        = BETA_OLA_MEXICO          // todos los negocios activos son Ola México
      const sat         = saturacion[n.id] ?? 0

      const score = relevancia * proximidad + beta - sat

      const reasons: string[] = []
      if (distKm < 0.5)  reasons.push('muy cerca de ti')
      if (sat < 0.2)     reasons.push('poca afluencia ahora')
      if (relevancia > 0.6) reasons.push('coincide con tus preferencias')
      if (reasons.length === 0) reasons.push('negocio verificado Ola México')

      const estimatedWalkMinutes = Math.round((distKm / 5) * 60) // ~5 km/h

      return { ...n, score, reasons, estimatedWalkMinutes }
    })

  // Ordena por score desc, desempate: menor saturación primero
  scored.sort((a, b) =>
    b.score !== a.score
      ? b.score - a.score
      : (saturacion[a.id] ?? 0) - (saturacion[b.id] ?? 0)
  )

  return scored.slice(0, MAX_RESULTS)
}

// ─── MOCK DE SATURACIÓN ───────────────────────────────────────────────────────
// Eliminar cuando Alan conecte daily_business_saturation a Supabase

export function mockSaturacion(ids: string[]): SaturacionMap {
  return Object.fromEntries(ids.map(id => [id, Math.random() * 0.4]))
}
