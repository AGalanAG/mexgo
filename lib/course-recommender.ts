import type { InsightContext, ModuloCatalogo, ModuloRankeado } from '@/types/types'

// ─── PESOS DEL SCORING ────────────────────────────────────────────────────────
// Ajustar si se quiere cambiar prioridades sin tocar la logica

const W = {
  insigniaPendiente:      40,  // el modulo desbloquea una insignia que falta
  satNoFormalizado:       35,  // negocio sin registro SAT + modulo de formalizacion
  accesibilidadAlta:      30,  // >25% turistas con necesidad de accesibilidad en zona
  accesibilidadMedia:     20,  // 10-25% turistas con necesidad de accesibilidad
  motivoCoincidie:        20,  // motivo top de turistas coincide con categoria del modulo
  paisExtranjeroIngles:   15,  // mayoria turistas extranjeros + modulo en ingles/atencion
  movilidadZona:          25,  // >10% turistas con movilidad reducida
  sorderaZona:            20,  // >5% turistas sordos
} as const

// Mapa de motivos de turista a categorias de modulo relevantes
const MOTIVE_TO_CATEGORY: Record<string, string[]> = {
  gastronomy:  ['vende', 'profesional', 'digitaliza'],
  cultural:    ['profesional', 'vende'],
  sports:      ['profesional', 'vende'],
  relaxation:  ['profesional', 'vende'],
  historical:  ['profesional'],
  nightlife:   ['vende', 'digitaliza'],
}

// Slugs de modulos que tienen impacto directo en insignias conocidas
const SLUG_TO_INSIGNIA: Record<string, string> = {
  'registro-sat':                   'NEGOCIO_FORMAL',
  'obligaciones-fiscales-basicas':  'NEGOCIO_FORMAL',
  'pagos-digitales':                'PAGOS_DIGITALES',
  'crea-tu-tienda-en-linea':        'PAGOS_DIGITALES',
  'atencion-personas-discapacidad': 'SERVICIO_SEGURO',
  'tecnicas-de-ventas-exitosas':    'SERVICIO_SEGURO',
  'atencion-al-cliente':            'SERVICIO_SEGURO',
}

// ─── FUNCION PRINCIPAL ────────────────────────────────────────────────────────

/**
 * Rankea los modulos del catalogo segun el perfil del negocio y su zona.
 * Excluye modulos ya completados con PASSED.
 * Devuelve hasta 5 modulos ordenados por score descendente.
 */
export function rankCoursesByProfile(
  modulos: ModuloCatalogo[],
  ctx: InsightContext,
): ModuloRankeado[] {
  const slugsCompletados = new Set(
    ctx.negocio.modulosCompletados
      .filter(c => c.status === 'PASSED')
      .map(c => c.slug),
  )

  const acc = ctx.zona.accessibilityBreakdown

  const ranked = modulos
    .filter(m => !slugsCompletados.has(m.slug))
    .map((modulo): ModuloRankeado => {
      let score = 0
      const razones: string[] = []

      // Insignia pendiente
      const insignia = SLUG_TO_INSIGNIA[modulo.slug]
      if (insignia && ctx.negocio.insigniasPendientes.includes(insignia)) {
        score += W.insigniaPendiente
        razones.push(`Desbloquea insignia pendiente: ${insignia}`)
      }

      // SAT no formalizado
      const satNoFormal = !['FORMAL_REGISTRADO', 'EN_PROCESO'].includes(ctx.negocio.satStatus)
      if (satNoFormal && modulo.category === 'formaliza') {
        score += W.satNoFormalizado
        razones.push('Tu negocio no esta formalizado ante el SAT')
      }

      // Accesibilidad en zona — sordera
      const pctSordo = (acc['deaf'] ?? 0) + (acc['deaf_mute'] ?? 0)
      if (pctSordo > 5 && (modulo.slug.includes('senas') || modulo.slug.includes('discapacidad'))) {
        score += W.sorderaZona
        razones.push(`${pctSordo}% de turistas en tu zona son sordos o sordomudos`)
      }

      // Accesibilidad en zona — movilidad
      const pctMovilidad = acc['mobility'] ?? 0
      if (pctMovilidad > 10 && modulo.slug.includes('discapacidad')) {
        score += W.movilidadZona
        razones.push(`${pctMovilidad}% de turistas tienen movilidad reducida`)
      }

      // Accesibilidad general alta
      const pctAccTotal = Object.entries(acc)
        .filter(([k]) => k !== 'none')
        .reduce((s, [, v]) => s + v, 0)
      if (pctAccTotal > 25 && modulo.category === 'profesional') {
        score += W.accesibilidadAlta
        razones.push(`${pctAccTotal}% de turistas en tu zona tienen necesidades de accesibilidad`)
      } else if (pctAccTotal > 10 && modulo.category === 'profesional') {
        score += W.accesibilidadMedia
        razones.push(`${pctAccTotal}% de turistas en tu zona tienen necesidades de accesibilidad`)
      }

      // Motivos de turistas coinciden con categoria del modulo
      for (const motivo of ctx.zona.motivosTop) {
        const cats = MOTIVE_TO_CATEGORY[motivo] ?? []
        if (cats.includes(modulo.category)) {
          score += W.motivoCoincidie
          razones.push(`Turistas en tu zona priorizan: ${motivo}`)
          break
        }
      }

      // Turistas internacionales + modulo de atencion/ventas
      const paisesExtranjeros = ctx.zona.paisesTop.filter(p => p !== 'Mexico' && p !== 'MX')
      if (paisesExtranjeros.length >= 2 && ['vende', 'profesional'].includes(modulo.category)) {
        score += W.paisExtranjeroIngles
        razones.push(`Alta afluencia de turistas de ${paisesExtranjeros.slice(0, 2).join(' y ')}`)
      }

      return { ...modulo, score, razones }
    })

  ranked.sort((a, b) =>
    b.score !== a.score ? b.score - a.score : a.slug.localeCompare(b.slug),
  )

  return ranked.slice(0, 5)
}
