# PASOS_AI_BUSINESS — Guia de implementacion paso a paso
**Agente: Gemini CLI · Responsable humano: Fidel**

Este documento es una guia ejecutable dividida en fases independientes.
Al terminar cada fase, el humano verifica con `npm run build` y decide si continuar.

**Referencias obligatorias antes de empezar:**
- `docs/AI_BUSINESS.md` — arquitectura completa, contratos y prompts
- `docs/SCHEMA.md` — convenciones SQL (UUID PK, timestamptz, idempotencia)
- `docs/BUSINESS.md` — mapa de archivos del modulo business

**Reglas para el agente:**
1. Leer cada archivo existente ANTES de editarlo. Nunca editar a ciegas.
2. No usar `any` en TypeScript. No exponer secretos en variables `NEXT_PUBLIC_`.
3. El frontend nunca importa `lib/gemini.ts` ni `lib/supabase.ts` directamente.
4. Seguir exactamente el patron de respuesta `apiOk` / `apiError` de `lib/api-response.ts`.
5. Cada fase termina con verificacion. Si falla, corregir antes de reportar listo.

---

## FASE 1 — Migracion SQL: tabla `business_insights_cache`

**Independiente de todas las demas fases.**
**Quien ejecuta en Supabase:** Alan (coordinar).
**El agente solo crea el archivo SQL — no lo aplica.**

### Objetivo
Crear la tabla de cache de insights generados por Gemini para no llamar a la IA en cada carga del dashboard.

### Convenciones SQL a seguir (de SCHEMA.md)
- UUID como PK con `gen_random_uuid()`.
- `timestamptz NOT NULL DEFAULT now()` en todos los campos de tiempo.
- Todo idempotente (`IF NOT EXISTS`, `DO $$ ... $$`).
- FK a `public.business_profiles(id)` con `ON DELETE CASCADE`.
- Trigger `set_updated_at` si la tabla tiene `updated_at` (esta no lo necesita — usa `generated_at`).
- Indices para los patrones de query mas comunes.

### Paso 1.1 — Leer migraciones existentes para entender el patron

Leer estos archivos antes de crear cualquier SQL:
```
supabase/migrations/0002_business_learning_badges_directory.sql
supabase/migrations/0003_requests_tourist_ops_and_support.sql
```

### Paso 1.2 — Crear el archivo de migracion

Crear `supabase/migrations/0005_business_insights_cache.sql` con exactamente este contenido:

```sql
-- MexGo Hackathon - Business Insights Cache
-- Scope: cache de informes Gemini por negocio con TTL
-- Depends on: 0002_business_learning_badges_directory.sql

-- Tabla principal de cache
CREATE TABLE IF NOT EXISTS public.business_insights_cache (
  business_id     uuid        PRIMARY KEY
                              REFERENCES public.business_profiles(id)
                              ON DELETE CASCADE,
  insight_payload jsonb       NOT NULL DEFAULT '{}'::jsonb,
  context_hash    text        NOT NULL DEFAULT '',
  generated_at    timestamptz NOT NULL DEFAULT now(),
  is_stale        boolean     NOT NULL DEFAULT false
);

COMMENT ON TABLE public.business_insights_cache IS
  'Cache de informes Gemini por negocio. TTL manejado en aplicacion (6h).';

COMMENT ON COLUMN public.business_insights_cache.context_hash IS
  'Hash MD5 del contexto enviado a Gemini. Detecta si los datos cambiaron.';

COMMENT ON COLUMN public.business_insights_cache.is_stale IS
  'true si el insight debe regenerarse aunque no haya expirado el TTL.';

-- Indice auxiliar para negocios con cache reciente
CREATE INDEX IF NOT EXISTS idx_business_insights_cache_generated_at
  ON public.business_insights_cache (generated_at DESC);

-- Indice de soporte para borrar cache stale en batch
CREATE INDEX IF NOT EXISTS idx_business_insights_cache_stale
  ON public.business_insights_cache (is_stale)
  WHERE is_stale = true;

-- Indice en tourist_questionnaires por borough + created_at
-- (necesario para la query de turistas en la zona del negocio)
CREATE INDEX IF NOT EXISTS idx_tourist_questionnaires_borough_created
  ON public.tourist_questionnaires (borough, created_at DESC)
  WHERE borough IS NOT NULL;
```

### Verificacion de Fase 1

El agente no puede ejecutar SQL. Reportar al humano:
- [ ] Archivo `supabase/migrations/0005_business_insights_cache.sql` creado.
- [ ] Coordinar con Alan para aplicar en Supabase dashboard o via CLI.

### STOP — Fase 1 completa

Avisar al humano: "Fase 1 lista. El archivo SQL esta en `supabase/migrations/0005_business_insights_cache.sql`. Coordinar con Alan para aplicarlo. Cuando este aplicado, decirme para continuar con Fase 2."

---

## FASE 2 — Tipos TypeScript

**Independiente. Solo requiere que Fase 1 haya sido revisada (no necesita estar aplicada).**

### Objetivo
Agregar las interfaces necesarias para el sistema de insights a `types/types.ts`
sin romper ningun tipo existente.

### Paso 2.1 — Leer el archivo completo

Leer `types/types.ts` completo antes de cualquier edicion.

### Paso 2.2 — Agregar al FINAL del archivo (despues de la ultima linea existente)

```typescript
// ─── BUSINESS INSIGHT (IA) ───────────────────────────────────────────────────

/** Un modulo del catalogo usado para armar el contexto del insight */
export interface ModuloCatalogo {
  slug: string
  title: string
  category: string
  audience: 'OWNER' | 'STAFF' | 'BOTH'
}

/** Resumen de un modulo completado por el negocio */
export interface CompletionSummary {
  slug: string
  title: string
  category: string
  score: number | null
  status: 'PENDING' | 'PASSED' | 'FAILED' | 'VALIDATED'
}

/** Datos del negocio pre-procesados para el contexto de Gemini */
export interface InsightNegocio {
  businessId: string
  nombre: string
  descripcion: string
  categoria: string
  alcaldia: string
  satStatus: string
  operationModes: string[]
  accessibilityNeedsNegocio: string[]
  teamSize: number
  businessStartRange: string
  modulosCompletados: CompletionSummary[]
  insigniasActivas: string[]
  insigniasPendientes: string[]
}

/** Agregado de datos de turistas en la alcaldia del negocio */
export interface InsightZona {
  alcaldia: string
  totalTuristasRegistrados: number
  paisesTop: string[]
  motivosTop: string[]
  accessibilityBreakdown: Record<string, number>
  estadiaPromedio: string
  promedioSaturacionZona: number
  diasMasActivos: string[]
}

/** Contexto completo enviado a Gemini para generar el informe */
export interface InsightContext {
  negocio: InsightNegocio
  zona: InsightZona
  catalogo: {
    modulosDisponibles: ModuloCatalogo[]
  }
}

/** Un curso recomendado por Gemini con su razon y prioridad */
export interface CourseRecommendation {
  slug: string
  titulo: string
  categoria: string
  razon: string
  prioridad: 'alta' | 'media' | 'baja'
  impacto_insignia: string | null
}

/** Informe completo generado por Gemini — shape que devuelve el endpoint */
export interface BusinessInsight {
  resumen: string
  zona: InsightZona
  negocio: {
    modulos_completados: number
    modulos_totales: number
    progreso_pct: number
    insignias_activas: string[]
    insignias_pendientes: string[]
  }
  alertas: string[]
  oportunidades: string[]
  cursos_recomendados: CourseRecommendation[]
}

/** Forma del modulo rankeado por el ranker deterministico */
export interface ModuloRankeado extends ModuloCatalogo {
  score: number
  razones: string[]
}
```

### Verificacion de Fase 2

```bash
npx tsc --noEmit
```

Debe pasar sin errores. Si hay conflictos de nombres con tipos existentes, renombrar
los nuevos (ej. `BusinessInsightReport` en lugar de `BusinessInsight`).

### STOP — Fase 2 completa

Avisar al humano: "Fase 2 lista. Tipos agregados en `types/types.ts`. Ejecutar `npx tsc --noEmit` y confirmar que pasa. Luego decirme para continuar con Fase 3."

---

## FASE 3 — Ranker deterministico: `lib/course-recommender.ts`

**Independiente. Requiere Fase 2 completada.**
**No usa Gemini. Es el fallback y pre-filtro.**

### Objetivo
Implementar un ranker local que, dado el contexto del negocio y turistas de su zona,
produce una lista ordenada de modulos recomendados con razon explicita.
Se usa como fallback si Gemini falla y como pre-filtro para reducir el catalogo.

### Paso 3.1 — Leer referencias antes de crear

Leer:
- `lib/equity.ts` — ver el patron de scoring numerico que ya existe en el proyecto
- `types/types.ts` — verificar que los tipos de Fase 2 esten disponibles

### Paso 3.2 — Crear `lib/course-recommender.ts`

```typescript
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
```

### Verificacion de Fase 3

```bash
npx tsc --noEmit
```

### STOP — Fase 3 completa

Avisar al humano: "Fase 3 lista. Ranker deterministico en `lib/course-recommender.ts`. Ejecutar `npx tsc --noEmit` y confirmar. Luego decirme para continuar con Fase 4."

---

## FASE 4 — Prompt de Gemini en `constants/index.ts`

**Independiente. Requiere Fase 2 completada.**

### Objetivo
Agregar `buildBusinessInsightPrompt(ctx)` a `constants/index.ts` sin romper
`buildSystemPrompt` ni las constantes existentes.

### Paso 4.1 — Leer el archivo completo

Leer `constants/index.ts` completo.

### Paso 4.2 — Agregar el import necesario al inicio del archivo

Si `InsightContext` no esta importado, agregar este import al inicio, junto al import de `TouristProfile`:

```typescript
import type { TouristProfile, InsightContext } from '@/types/types'
```

> Si ya existe el import de `TouristProfile`, solo agregar `InsightContext` a la misma linea.

### Paso 4.3 — Agregar la funcion al FINAL del archivo

```typescript
// ─── PROMPT PARA INFORME DE NEGOCIO (IA) ─────────────────────────────────────

export function buildBusinessInsightPrompt(ctx: InsightContext): string {
  const acc = ctx.zona.accessibilityBreakdown
  const accLineas = Object.entries(acc)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `  · ${k}: ${v}%`)
    .join('\n')

  const modulosCompletadosTexto = ctx.negocio.modulosCompletados.length > 0
    ? ctx.negocio.modulosCompletados.map(m => `  · ${m.title} (score: ${m.score ?? 'N/A'})`).join('\n')
    : '  · Ninguno aun'

  const insigniasActivasTexto = ctx.negocio.insigniasActivas.length > 0
    ? ctx.negocio.insigniasActivas.join(', ')
    : 'Ninguna'

  const insigniasPendientesTexto = ctx.negocio.insigniasPendientes.length > 0
    ? ctx.negocio.insigniasPendientes.join(', ')
    : 'Ninguna pendiente'

  const catalogoTexto = ctx.catalogo.modulosDisponibles
    .map(m => `  · [${m.slug}] ${m.title} — categoria: ${m.category}`)
    .join('\n')

  return `Eres el motor de inteligencia de MexGo Negocios. Analiza el contexto de un negocio
registrado en la plataforma Coppel Emprende y genera un informe de recomendacion personalizado.

━━━ NEGOCIO ━━━
Nombre: ${ctx.negocio.nombre}
Descripcion: ${ctx.negocio.descripcion}
Categoria: ${ctx.negocio.categoria}
Alcaldia: ${ctx.negocio.alcaldia}
Estatus SAT: ${ctx.negocio.satStatus}
Formas de operacion: ${ctx.negocio.operationModes.join(', ') || 'No especificadas'}
Tamano del equipo: ${ctx.negocio.teamSize} personas
Antiguedad: ${ctx.negocio.businessStartRange}
Accesibilidad contemplada por el negocio: ${ctx.negocio.accessibilityNeedsNegocio.join(', ') || 'Ninguna'}

Modulos completados:
${modulosCompletadosTexto}

Insignias activas: ${insigniasActivasTexto}
Insignias pendientes: ${insigniasPendientesTexto}

━━━ TURISTAS EN ${ctx.zona.alcaldia.toUpperCase()} (ultimos 30 dias) ━━━
Total turistas registrados en la zona: ${ctx.zona.totalTuristasRegistrados}
Paises principales: ${ctx.zona.paisesTop.join(', ') || 'Datos insuficientes'}
Motivos de viaje mas frecuentes: ${ctx.zona.motivosTop.join(', ') || 'Datos insuficientes'}
Estadia promedio: ${ctx.zona.estadiaPromedio}
Saturacion promedio de la zona: ${ctx.zona.promedioSaturacionZona.toFixed(2)} (0=baja, 1=alta)

Necesidades de accesibilidad de turistas:
${accLineas || '  · Sin datos suficientes aun'}

━━━ CATALOGO DE MODULOS DISPONIBLES ━━━
${catalogoTexto}

━━━ INSTRUCCIONES ━━━
1. Escribe un "resumen" de 2-3 oraciones que interprete la situacion del negocio en su zona.
2. Lista hasta 4 "alertas" concretas: brechas entre lo que el negocio ofrece y lo que los turistas necesitan.
3. Lista hasta 3 "oportunidades" que el negocio deberia aprovechar dado su perfil de turistas.
4. Selecciona y ordena hasta 5 "cursos_recomendados" del catalogo con:
   - "slug" exacto del catalogo
   - "titulo" legible
   - "categoria" del modulo
   - "razon" especifica (minimo 10 palabras, menciona datos reales del contexto)
   - "prioridad": "alta", "media" o "baja"
   - "impacto_insignia": codigo de insignia pendiente que desbloquea, o null

RESPONDE UNICAMENTE con un JSON valido. Sin texto antes ni despues del JSON.
Estructura exacta requerida:
{
  "resumen": "string",
  "alertas": ["string"],
  "oportunidades": ["string"],
  "cursos_recomendados": [
    {
      "slug": "string",
      "titulo": "string",
      "categoria": "string",
      "razon": "string",
      "prioridad": "alta|media|baja",
      "impacto_insignia": "CODIGO|null"
    }
  ]
}
`
}
```

### Verificacion de Fase 4

```bash
npx tsc --noEmit
```

### STOP — Fase 4 completa

Avisar al humano: "Fase 4 lista. Prompt Gemini agregado en `constants/index.ts`. Ejecutar `npx tsc --noEmit`. Luego decirme para continuar con Fase 5."

---

## FASE 5 — Core de IA: `lib/business-insight.ts`

**Requiere Fases 2, 3 y 4 completadas.**
**Esta es la funcion mas critica — leer con cuidado antes de implementar.**

### Objetivo
Implementar `buildInsightContext()` (queries a Supabase) y `geminiGenerateInsight()`
(llamada a Gemini y parseo del JSON). Estas dos funciones son las que el route handler usa.

### Paso 5.1 — Leer estas referencias antes de escribir una sola linea

```
lib/supabase.ts              ← como se obtiene el cliente admin
lib/gemini.ts                ← como se instancia GoogleGenAI
lib/equity.ts                ← patron de funciones puras en lib/
constants/index.ts           ← GEMINI_MODEL y buildBusinessInsightPrompt
```

### Paso 5.2 — Crear `lib/business-insight.ts`

```typescript
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
  rows: { accessibility_needs: string[] }[],
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
      const m = c.learning_modules as { slug: string; title: string; category: string }
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
    const code = (b.badge_definitions as { code?: string } | null)?.code
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

  const turistas = turistasRaw ?? []

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
```

### Verificacion de Fase 5

```bash
npx tsc --noEmit
```

Si hay errores de tipos en los selects de Supabase (columnas no reconocidas), verificar
que la migracion 0005 fue aplicada y que los nombres de columna coinciden con el schema.

### STOP — Fase 5 completa

Avisar al humano: "Fase 5 lista. Core IA en `lib/business-insight.ts`. Ejecutar `npx tsc --noEmit`. Luego decirme para continuar con Fase 6."

---

## FASE 6 — API Route: `GET /api/business/[businessId]/insight`

**Requiere Fase 5 completada y Fase 1 aplicada en Supabase.**

### Objetivo
Crear el route handler que sirve el insight del negocio al dashboard.
Devuelve desde cache si es reciente (< 6h). Si no, llama a Gemini, guarda cache y devuelve.

### Paso 6.1 — Leer referencias antes de escribir

```
app/api/businesses/[businessId]/route.ts   ← patron de autenticacion + ownership check
lib/api-response.ts                        ← apiOk, apiError
lib/auth-helpers.ts                        ← getAuthenticatedUser, userHasRole
```

### Paso 6.2 — Crear la carpeta y el archivo

Ruta del archivo: `app/api/business/[businessId]/insight/route.ts`

> Nota: la ruta es `/api/business/` (singular) para separar visualmente los endpoints IA
> de los de CRUD que estan en `/api/businesses/` (plural).

```typescript
import { NextRequest } from 'next/server'
import { getAuthenticatedUser, userHasRole } from '@/lib/auth-helpers'
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response'
import { getSupabaseAdmin } from '@/lib/supabase'
import { buildInsightContext, geminiGenerateInsight } from '@/lib/business-insight'

const CACHE_TTL_MS = 6 * 60 * 60 * 1000  // 6 horas

async function canReadInsight(userId: string, businessId: string): Promise<boolean> {
  const isAdmin = await userHasRole(userId, 'ADMIN')
  if (isAdmin) return true

  const { data, error } = await getSupabaseAdmin()
    .from('business_profiles')
    .select('id')
    .eq('id', businessId)
    .eq('owner_user_id', userId)
    .limit(1)

  return !error && Boolean(data && data.length > 0)
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ businessId: string }> },
) {
  // 1. Autenticacion
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401)
  }

  const { businessId } = await context.params
  if (!isNonEmptyString(businessId)) {
    return apiError('VALIDATION_ERROR', 'businessId invalido', 400)
  }

  // 2. Autorizacion
  const hasAccess = await canReadInsight(user.id, businessId)
  if (!hasAccess) {
    return apiError('FORBIDDEN', 'No autorizado para consultar este insight', 403)
  }

  const supabase = getSupabaseAdmin()

  // 3. Revisar cache
  const { data: cached } = await supabase
    .from('business_insights_cache')
    .select('insight_payload, generated_at, is_stale')
    .eq('business_id', businessId)
    .maybeSingle()

  if (cached) {
    const age = Date.now() - new Date(cached.generated_at).getTime()
    if (age < CACHE_TTL_MS && !cached.is_stale) {
      return apiOk({
        cached: true,
        generatedAt: cached.generated_at,
        isStale: false,
        insight: cached.insight_payload,
      })
    }
  }

  // 4. Generar nuevo insight
  let ctx
  try {
    ctx = await buildInsightContext(businessId)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al recopilar contexto'
    return apiError('INTERNAL_ERROR', msg, 500)
  }

  let insight
  try {
    insight = await geminiGenerateInsight(ctx)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al generar insight con Gemini'
    // Si falla Gemini pero hay cache stale, devolver el cache con advertencia
    if (cached) {
      return apiOk({
        cached: true,
        generatedAt: cached.generated_at,
        isStale: true,
        insight: cached.insight_payload,
        warning: 'Insight desactualizado — Gemini no disponible temporalmente',
      })
    }
    return apiError('INTERNAL_ERROR', msg, 500)
  }

  // 5. Guardar en cache
  const generatedAt = new Date().toISOString()
  await supabase
    .from('business_insights_cache')
    .upsert(
      {
        business_id: businessId,
        insight_payload: insight,
        generated_at: generatedAt,
        is_stale: false,
      },
      { onConflict: 'business_id' },
    )

  return apiOk({
    cached: false,
    generatedAt,
    isStale: false,
    insight,
  })
}
```

### Verificacion de Fase 6

```bash
npx tsc --noEmit
npm run build
```

Ambos deben pasar sin errores. Si `npm run build` falla por tipos generados de Supabase,
verificar que los nombres de columna en los selects coinciden con el schema aplicado.

### STOP — Fase 6 completa

Avisar al humano: "Fase 6 lista. Endpoint en `app/api/business/[businessId]/insight/route.ts`. Ejecutar `npm run build`. Si pasa, puedes probar el endpoint con Postman: `GET /api/business/{id}/insight` con Bearer token de un ENCARGADO_NEGOCIO. Luego decirme para continuar con Fase 7."

---

## FASE 7 — Conectar el dashboard

**Requiere Fase 6 funcionando y verificada con Postman.**
**Coordinar con Farid — esta fase modifica archivos de su area.**

### Objetivo
Reemplazar los datos mock del dashboard con llamadas reales al endpoint de insight.
Hacer lo minimo necesario — no redisenar el UI, solo conectar los datos.

### Paso 7.1 — Leer el archivo completo antes de editar

Leer `app/[locale]/business/dashboard/page.tsx` completo.

### Paso 7.2 — Agregar el hook de fetch al componente

Localizar la linea que dice `const MOCK = {` y las constantes `MODULOS_PREVIEW`.

Agregar estos imports al inicio del archivo (si no existen):

```typescript
import { useState, useEffect } from 'react'
import { getStoredAccessToken } from '@/lib/client-auth'
import type { BusinessInsight } from '@/types/types'
```

Agregar dentro del componente `BusinessDashboardPage`, antes del `return`:

```typescript
const [insight, setInsight] = useState<BusinessInsight | null>(null)
const [insightLoading, setInsightLoading] = useState(true)

// businessId debe venir del usuario autenticado
// Por ahora usar el valor hardcodeado de desarrollo hasta que useAuth este conectado
// TODO: reemplazar 'BUSINESS_ID_PLACEHOLDER' con el id real del negocio del usuario
const businessId = 'BUSINESS_ID_PLACEHOLDER'

useEffect(() => {
  const token = getStoredAccessToken()
  if (!token || businessId === 'BUSINESS_ID_PLACEHOLDER') {
    setInsightLoading(false)
    return
  }

  fetch(`/api/business/${businessId}/insight`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => r.json())
    .then(res => {
      if (res.ok && res.data?.insight) {
        setInsight(res.data.insight)
      }
    })
    .catch(() => {
      // silencioso — el UI muestra mock si falla
    })
    .finally(() => setInsightLoading(false))
}, [businessId])
```

Reemplazar los valores mock en el JSX por los del insight cuando este disponible:

```typescript
// En lugar de:
const { modulos_completados: done, modulos_total: total } = MOCK
const progress = Math.round((done / total) * 100)

// Usar:
const done    = insight?.negocio.modulos_completados ?? MOCK.modulos_completados
const total   = insight?.negocio.modulos_totales     ?? MOCK.modulos_total
const progress = insight?.negocio.progreso_pct       ?? Math.round((done / total) * 100)
```

Para las alertas y oportunidades, agregar una seccion nueva en el JSX (despues del bloque de modulos):

```typescript
{insight?.alertas && insight.alertas.length > 0 && (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3">
    <h2 className="font-black text-gray-900 text-base">Alertas de tu zona</h2>
    {insight.alertas.map((alerta, i) => (
      <div key={i} className="flex gap-3 text-sm text-gray-600 bg-yellow-50 rounded-xl px-4 py-3 border border-yellow-100">
        <span className="shrink-0 font-bold text-yellow-600">!</span>
        {alerta}
      </div>
    ))}
  </div>
)}

{insight?.oportunidades && insight.oportunidades.length > 0 && (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3">
    <h2 className="font-black text-gray-900 text-base">Oportunidades en tu zona</h2>
    {insight.oportunidades.map((op, i) => (
      <div key={i} className="flex gap-3 text-sm text-gray-600 bg-green-50 rounded-xl px-4 py-3 border border-green-100">
        <span className="shrink-0 font-bold text-green-600">→</span>
        {op}
      </div>
    ))}
  </div>
)}
```

### Paso 7.3 — Conectar la pagina de learning

Leer `app/[locale]/business/learning/page.tsx` completo.

Si `insight` esta disponible y tiene `cursos_recomendados`, mostrar una seccion de
"Recomendados para ti" encima del grid de categorias. El cambio es aditivo — no tocar
las categorias ni los cursos existentes.

Agregar en `LearningPage` antes del grid de categorias:

```typescript
// Leer insight del localStorage para evitar otro fetch
// (el dashboard ya lo guarda si quieres, o hacer el fetch aqui tambien)
const [topCursos, setTopCursos] = useState<{ slug: string; titulo: string; razon: string; prioridad: string }[]>([])

useEffect(() => {
  // Intentar leer desde sessionStorage si el dashboard ya lo cargo
  const cached = sessionStorage.getItem('mexgo_business_insight')
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as { cursos_recomendados?: typeof topCursos }
      if (parsed.cursos_recomendados) setTopCursos(parsed.cursos_recomendados.slice(0, 3))
    } catch { /* silencioso */ }
  }
}, [])
```

> Nota: para un hackathon es suficiente usar sessionStorage como puente entre paginas.
> En produccion se usaria un estado global (Zustand, Context, o SWR con cache compartido).

### Verificacion de Fase 7

```bash
npx tsc --noEmit
npm run build
```

Navegar a `/business/dashboard` en el browser con un usuario autenticado como `ENCARGADO_NEGOCIO`.
Verificar en Network tab que se hace la llamada a `/api/business/[id]/insight`.

### STOP — Fase 7 completa

Avisar al humano: "Fase 7 lista. Dashboard conectado. Ejecutar `npm run build` y probar en browser. El TODO pendiente es reemplazar `BUSINESS_ID_PLACEHOLDER` con el id real del negocio del usuario autenticado — esto requiere coordinar con el hook `useAuth` de Emi o Alan."

---

## Resumen de fases y dependencias

```
FASE 1 (SQL)        ─────────────────────────────── independiente
FASE 2 (Tipos)      ─────────────────────────────── independiente
FASE 3 (Ranker)     ── requiere Fase 2
FASE 4 (Prompt)     ── requiere Fase 2
FASE 5 (Core IA)    ── requiere Fases 2 + 3 + 4
FASE 6 (Route)      ── requiere Fase 5 + Fase 1 aplicada
FASE 7 (Dashboard)  ── requiere Fase 6 verificada con Postman
```

**Orden optimo para ejecutar en paralelo:**
- Arrancar Fase 1 y Fase 2 al mismo tiempo.
- Cuando Fase 2 este lista, arrancar Fases 3 y 4 en paralelo.
- Cuando 3 y 4 esten listas, arrancar Fase 5.
- Cuando 5 y 1 esten listas, arrancar Fase 6.
- Cuando 6 este verificada, arrancar Fase 7.

---

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-08 | Fidel (IA) | v1.0 — Guia ejecutable de 7 fases para implementacion IA business. |
