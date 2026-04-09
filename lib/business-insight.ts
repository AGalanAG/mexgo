import { GoogleGenAI } from '@google/genai'
import { getSupabaseAdmin } from '@/lib/supabase'
import { GEMINI_MODEL, buildBusinessInsightPrompt } from '@/constants'
import type {
  InsightContext,
  InsightNegocio,
  InsightZona,
  ModuloCatalogo,
  CompletionSummary,
  BusinessInsight,
} from '@/types/types'

// ─── CLIENTE GEMINI ───────────────────────────────────────────────────────────

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

// ─── HELPERS INTERNOS ─────────────────────────────────────────────────────────

function topN<T extends string>(items: T[], n: number): T[] {
  const freq: Record<string, number> = {}
  for (const item of items) {
    freq[item] = (freq[item] ?? 0) + 1
  }
  return (Object.entries(freq) as [T, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k)
}

function accessibilityPercents(
  rows: { accessibility_needs: string[] | null }[],
): Record<string, number> {
  if (rows.length === 0) return {}
  const freq: Record<string, number> = {}
  for (const row of rows) {
    for (const need of row.accessibility_needs ?? []) {
      if (need !== 'none') freq[need] = (freq[need] ?? 0) + 1
    }
  }
  const result: Record<string, number> = {}
  for (const [k, v] of Object.entries(freq)) {
    result[k] = Math.round((v / rows.length) * 100)
  }
  return result
}

function mostCommonStay(rows: { stay_duration: string | null }[]): string {
  const valid = rows.map(r => r.stay_duration).filter(Boolean) as string[]
  if (valid.length === 0) return 'Datos insuficientes'
  return topN(valid, 1)[0] ?? 'Datos insuficientes'
}

// ─── CONSTRUCCION DEL CONTEXTO ────────────────────────────────────────────────

export async function buildInsightContext(businessId: string): Promise<InsightContext> {
  const supabase = getSupabaseAdmin()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  // ── 1) Perfil del negocio ──────────────────────────────────────────────────
  const { data: business, error: bizError } = await supabase
    .from('business_profiles')
    .select('id, business_name, business_description, category_code, borough, owner_user_id, status')
    .eq('id', businessId)
    .single()

  if (bizError || !business) {
    throw new Error(`Negocio no encontrado: ${bizError?.message ?? businessId}`)
  }

  // ── 2) Solicitud original (sat_status, operation_modes, accessibility) ────
  const { data: bizRequest } = await supabase
    .from('business_requests')
    .select('sat_status, operation_modes, accessibility_needs, business_start_range, employees_women_count, employees_men_count')
    .eq('owner_user_id', business.owner_user_id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // ── 3) Modulos completados ─────────────────────────────────────────────────
  const { data: completionsRaw } = await supabase
    .from('learning_completions')
    .select('status, score, learning_modules(slug, title, category)')
    .eq('business_id', businessId)

  const modulosCompletados: CompletionSummary[] = (completionsRaw ?? [])
    .filter(c => c.learning_modules)
    .map(c => {
      const m = c.learning_modules as unknown as { slug: string; title: string; category: string }
      return {
        slug: m.slug,
        title: m.title,
        category: m.category,
        score: c.score,
        status: c.status as CompletionSummary['status'],
      }
    })

  // ── 4) Insignias del negocio ───────────────────────────────────────────────
  const { data: badgesRaw } = await supabase
    .from('business_badges')
    .select('status, badge_definitions(code)')
    .eq('business_id', businessId)

  const insigniasActivas: string[] = []
  const insigniasPendientes: string[] = []
  for (const b of badgesRaw ?? []) {
    const code = (b.badge_definitions as unknown as { code?: string } | null)?.code
    if (!code) continue
    if (b.status === 'AWARDED') insigniasActivas.push(code)
    else insigniasPendientes.push(code)
  }

  // ── 5) Turistas en la misma alcaldia (ultimos 30 dias) ────────────────────
  const { data: turistasRaw } = await supabase
    .from('tourist_questionnaires')
    .select('country, trip_motives, accessibility_needs, stay_duration')
    .eq('borough', business.borough ?? '')
    .gte('created_at', thirtyDaysAgo)

  const turistas = (turistasRaw as { country: string | null, trip_motives: string[] | null, accessibility_needs: string[] | null, stay_duration: string | null }[]) ?? []

  const allPaises = turistas.map(t => t.country).filter(Boolean) as string[]
  const allMotivos = turistas.flatMap(t => t.trip_motives ?? [])

  // ── 6) Saturacion de negocios en la misma alcaldia ────────────────────────
  const { data: satRaw } = await supabase
    .from('daily_business_saturation')
    .select('saturation_score, business_profile_id')
    .gte('day', thirtyDaysAgo.slice(0, 10))

  // Filtrar los que pertenecen al mismo borough (necesitamos un join indirecto)
  const { data: businessesEnZona } = await supabase
    .from('business_profiles')
    .select('id')
    .eq('borough', business.borough ?? '')
    .eq('status', 'ACTIVE')

  const idsEnZona = new Set((businessesEnZona ?? []).map(b => b.id))
  const satScores = (satRaw ?? [])
    .filter(s => idsEnZona.has(s.business_profile_id))
    .map(s => Number(s.saturation_score))

  const promedioSaturacion = satScores.length > 0
    ? satScores.reduce((a, b) => a + b, 0) / satScores.length
    : 0

  // ── 7) Catalogo de modulos activos (para OWNER o BOTH) ────────────────────
  const { data: modulosRaw } = await supabase
    .from('learning_modules')
    .select('slug, title, category, audience')
    .eq('is_active', true)
    .in('audience', ['OWNER', 'BOTH'])

  const modulosDisponibles: ModuloCatalogo[] = (modulosRaw ?? []).map(m => ({
    slug: m.slug,
    title: m.title,
    category: m.category,
    audience: m.audience as ModuloCatalogo['audience'],
  }))

  // ── Armar el contexto ─────────────────────────────────────────────────────
  const negocio: InsightNegocio = {
    businessId: business.id,
    nombre: business.business_name,
    descripcion: business.business_description,
    categoria: business.category_code,
    alcaldia: business.borough ?? 'No especificada',
    satStatus: bizRequest?.sat_status ?? 'DESCONOCIDO',
    operationModes: bizRequest?.operation_modes ?? [],
    accessibilityNeedsNegocio: bizRequest?.accessibility_needs ?? [],
    teamSize: (bizRequest?.employees_women_count ?? 0) + (bizRequest?.employees_men_count ?? 0),
    businessStartRange: bizRequest?.business_start_range ?? 'DESCONOCIDO',
    modulosCompletados,
    insigniasActivas,
    insigniasPendientes,
  }

  const zona: InsightZona = {
    alcaldia: business.borough ?? 'No especificada',
    totalTuristasRegistrados: turistas.length,
    paisesTop: topN(allPaises, 5),
    motivosTop: topN(allMotivos, 3),
    accessibilityBreakdown: accessibilityPercents(turistas),
    estadiaPromedio: mostCommonStay(turistas),
    promedioSaturacionZona: promedioSaturacion,
    diasMasActivos: [],  // placeholder — expandir con daily_business_saturation por dia_semana si se necesita
  }

  return {
    negocio,
    zona,
    catalogo: { modulosDisponibles },
  }
}

// ─── LLAMADA A GEMINI ─────────────────────────────────────────────────────────

/**
 * Llama a Gemini con el contexto del negocio y devuelve el insight parseado.
 * Lanza error si la respuesta no es JSON valido o le faltan campos obligatorios.
 */
export async function geminiGenerateInsight(ctx: InsightContext): Promise<BusinessInsight> {
  const prompt = buildBusinessInsightPrompt(ctx)

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      responseMimeType: 'application/json',
    },
  })

  const raw = response.text ?? ''

  let parsed: Record<string, unknown>
  try {
    // Limpiar posibles backticks si Gemini los incluye pese a responseMimeType
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
    parsed = JSON.parse(cleaned)
  } catch {
    throw new Error(`Gemini devolvio JSON invalido: ${raw.slice(0, 200)}`)
  }

  // Validar campos minimos obligatorios
  if (
    typeof parsed.resumen !== 'string' ||
    !Array.isArray(parsed.alertas) ||
    !Array.isArray(parsed.cursos_recomendados)
  ) {
    throw new Error(`Shape de insight incompleto: ${JSON.stringify(parsed).slice(0, 200)}`)
  }

  // Completar el insight con datos ya calculados (no los reinventa Gemini)
  const insight: BusinessInsight = {
    resumen: parsed.resumen as string,
    zona: ctx.zona,
    negocio: {
      modulos_completados: ctx.negocio.modulosCompletados.filter(m => m.status === 'PASSED').length,
      modulos_totales: ctx.catalogo.modulosDisponibles.length,
      progreso_pct: ctx.catalogo.modulosDisponibles.length > 0
        ? Math.round(
            ctx.negocio.modulosCompletados.filter(m => m.status === 'PASSED').length /
            ctx.catalogo.modulosDisponibles.length * 100,
          )
        : 0,
      insignias_activas: ctx.negocio.insigniasActivas,
      insignias_pendientes: ctx.negocio.insigniasPendientes,
    },
    alertas: (parsed.alertas as unknown[]).filter((a): a is string => typeof a === 'string'),
    oportunidades: Array.isArray(parsed.oportunidades)
      ? (parsed.oportunidades as unknown[]).filter((o): o is string => typeof o === 'string')
      : [],
    cursos_recomendados: Array.isArray(parsed.cursos_recomendados)
      ? (parsed.cursos_recomendados as unknown[]).filter(
          (c): c is { slug: string; titulo: string; categoria: string; razon: string; prioridad: 'alta' | 'media' | 'baja'; impacto_insignia: string | null } =>
            typeof c === 'object' && c !== null &&
            typeof (c as Record<string, unknown>).slug === 'string',
        )
      : [],
  }

  return insight
}
