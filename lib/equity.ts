import type { BusinessProfile, NegocioConScore } from '@/types/types'

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

const BETA_OLA_MEXICO = 0.2
const MAX_RESULTS     = 6

// ─── KEYWORDS POR MOTIVO DE VIAJE ────────────────────────────────────────────

const MOTIVE_KEYWORDS: Record<string, string[]> = {
  gastronomy: ['taco', 'café', 'cafe', 'comida', 'cocina', 'mercado', 'mezcal', 'antojito', 'taquería', 'carnitas', 'pan', 'botana'],
  cultural:   ['artesanía', 'artesania', 'museo', 'arte', 'talavera', 'histórico', 'historico', 'colonial', 'tradicional'],
  nightlife:  ['bar', 'mezcal', 'coctel', 'noche'],
  nature:     ['parque', 'jardín', 'jardin', 'xochimilco', 'canal'],
  shopping:   ['artesanía', 'artesania', 'mercado', 'joyería', 'joyeria', 'plata', 'talavera'],
}

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

export type SaturacionMap = Record<string, number>

export type EquityInput = {
  negocios: BusinessProfile[]
  saturacion: SaturacionMap
  turistaLat: number
  turistaLng: number
  tripMotives?: string[]
}

// ─── RELEVANCIA ───────────────────────────────────────────────────────────────

function calcularRelevancia(negocio: BusinessProfile, tripMotives?: string[]): number {
  if (!tripMotives || tripMotives.length === 0) return 0.5

  const desc = (negocio.businessDescription + ' ' + negocio.businessName).toLowerCase()
  let bonus = 0

  for (const motive of tripMotives) {
    const keywords = MOTIVE_KEYWORDS[motive.toLowerCase()] ?? [motive.toLowerCase()]
    if (keywords.some(kw => desc.includes(kw))) {
      bonus += 0.2
    }
  }

  return Math.min(0.5 + bonus, 1)
}

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────

export function calcularRecomendaciones({
  negocios,
  saturacion,
  turistaLat,
  turistaLng,
  tripMotives,
}: EquityInput): NegocioConScore[] {
  const scored = negocios
    .filter(n => n.isActive)
    .map(n => {
      const distKm     = distanciaKm(turistaLat, turistaLng, n.latitude, n.longitude)
      const proximidad = 1 / (1 + distKm)
      const relevancia = calcularRelevancia(n, tripMotives)
      const sat        = saturacion[n.id] ?? 0

      const score = relevancia * proximidad + BETA_OLA_MEXICO - sat

      const reasons: string[] = []
      if (distKm < 0.5)      reasons.push('muy cerca de ti')
      if (sat < 0.2)         reasons.push('poca afluencia ahora')
      if (relevancia > 0.6)  reasons.push('coincide con tus intereses')
      if (reasons.length === 0) reasons.push('negocio verificado Ola México')

      return { ...n, score, reasons, estimatedWalkMinutes: Math.round((distKm / 5) * 60) }
    })

  scored.sort((a, b) =>
    b.score !== a.score
      ? b.score - a.score
      : (saturacion[a.id] ?? 0) - (saturacion[b.id] ?? 0)
  )

  return scored.slice(0, MAX_RESULTS)
}

// ─── SATURACIÓN ESTABLE ───────────────────────────────────────────────────────
// Determinista por ID — no cambia entre requests hasta conectar daily_business_saturation

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0xffff
  return h
}

export function saturacionEstable(ids: string[]): SaturacionMap {
  return Object.fromEntries(ids.map(id => [id, (hashId(id) % 40) / 100]))
}
