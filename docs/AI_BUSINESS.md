# MexGo - Arquitectura IA para el modulo Business
**Los Mossitos · Genius Arena 2026 · Responsable: Fidel**

Diseno completo del sistema de inteligencia Gemini para el dashboard de negocios:
recomendacion de cursos, informe de zona y analisis de turistas.

---

## 1. Vision general

El dashboard de negocio **no muestra datos crudos**. Gemini recibe el contexto del negocio
y los patrones de turistas de su alcaldia, y devuelve un informe interpretado:
alertas, oportunidades, y cursos recomendados en orden de prioridad con su razon.

```
[Supabase: datos del negocio + turistas de su zona]
        ↓
lib/business-insight.ts   ← arma el contexto estructurado
        ↓
Gemini 2.5 Flash          ← analiza y produce JSON estructurado
        ↓
business_insights_cache   ← guarda resultado (TTL 6h)
        ↓
GET /api/business/[id]/insight  ← devuelve cache o regenera
        ↓
/business/dashboard  ← consume y renderiza
```

---

## 2. Archivos del modulo business (mapa completo)

### Frontend (rama Farid / Fidel para IA)

```
app/[locale]/(tourist)/onboarding-business/page.tsx
  └── components/business/QuestionnaireBusiness.tsx   ← formulario 5 pasos, POST /api/requests

app/[locale]/business/
  ├── dashboard/page.tsx    ← PENDIENTE conectar a GET /api/business/[id]/insight
  ├── learning/page.tsx     ← PENDIENTE conectar a GET /api/learning/modules + ranking IA
  └── support/page.tsx      ← estatico, sin cambios

components/business/
  ├── NavbarBusiness.tsx    ← navbar fija, hardcoded avatar pendiente
  ├── QuestionnaireBusiness.tsx
  └── RequestForm.tsx       ← no usado en produccion
```

### Backend IA (rama Fidel)

```
app/api/business/
  └── [businessId]/
      └── insight/
          └── route.ts      ← NUEVO: GET devuelve informe Gemini (con cache)

lib/
  ├── business-insight.ts   ← NUEVO: arma contexto + llama Gemini + guarda cache
  ├── course-recommender.ts ← NUEVO: logica de ranking de cursos por perfil de negocio
  ├── gemini.ts             ← existente, reusar cliente GoogleGenAI
  └── supabase.ts           ← existente, reusar getSupabaseAdmin()

constants/index.ts          ← agregar buildBusinessInsightPrompt()
```

### Backend de datos (rama Alan — coordinacion)

```
app/api/businesses/
  ├── route.ts              ← POST crear negocio
  ├── me/route.ts           ← GET negocio del usuario
  └── [businessId]/
      ├── route.ts          ← PATCH editar negocio
      └── team/route.ts     ← GET/POST equipo

app/api/badges/business/
  └── [businessId]/
      ├── route.ts          ← GET estado insignias
      └── recalculate/route.ts ← POST recalcular

app/api/directory/businesses/
  ├── route.ts              ← GET busqueda publica
  └── [businessId]/route.ts ← GET detalle publico
```

### Base de datos (rama Alan)

```
supabase/migrations/
  ├── 0001_hackathon_identity_rbac.sql
  ├── 0002_business_learning_badges_directory.sql
  ├── 0003_requests_tourist_ops_and_support.sql
  ├── 0004_questionnaire_accessibility_needs.sql
  └── 0005_business_insights_cache.sql   ← NUEVA (ver seccion 4)
```

---

## 3. Datos disponibles para el analisis

### Del negocio (tablas existentes)

| Tabla | Campos utiles para IA |
|-------|-----------------------|
| `business_profiles` | borough, category_code, business_description, is_public, status |
| `business_requests` | sat_status, operation_modes, employees_women_count, employees_men_count, business_start_range, accessibility_needs, adaptation_for_world_cup |
| `learning_completions` | modulos completados, score, status por miembro |
| `business_badges` | estado de insignias y progreso_percent |
| `daily_business_saturation` | visits_count, unique_tourists_count, saturation_score por dia |

### Del turista (tablas existentes, agregadas por borough)

| Tabla | Campos utiles para IA |
|-------|-----------------------|
| `tourist_questionnaires` | country, companions_count, stay_duration, city, borough, trip_motives, accessibility_needs, payload.priority_factor |
| `visits` | event_type (VIEW/CLICK/CHECKIN/PURCHASE), source, local_day — filtrando por businesses en el mismo borough |

### Cruce clave: accesibilidad

El campo `accessibility_needs` existe en **ambos lados**:
- `tourist_questionnaires.accessibility_needs` — lo que el turista necesita
- `business_requests.accessibility_needs` — lo que el negocio ya contempla

Gemini puede cruzarlos y decir:
> "El 34% de turistas en Coyoacan declaran baja vision. Tu negocio no tiene modulos de accesibilidad completados."

---

## 4. Nueva tabla: `business_insights_cache`

Evita llamar a Gemini en cada carga de dashboard. Cache con TTL de 6 horas.

```sql
-- 0005_business_insights_cache.sql

CREATE TABLE IF NOT EXISTS public.business_insights_cache (
  business_id     uuid PRIMARY KEY REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  insight_payload jsonb       NOT NULL DEFAULT '{}'::jsonb,
  context_hash    text        NOT NULL DEFAULT '',  -- hash del contexto, detecta cambios
  generated_at    timestamptz NOT NULL DEFAULT now(),
  is_stale        boolean     NOT NULL DEFAULT false
);
```

**Logica de invalidacion:**
- Stale si `generated_at < now() - interval '6 hours'`.
- Stale si cambian `learning_completions` del negocio (trigger opcional, por ahora TTL es suficiente).
- El endpoint siempre devuelve aunque sea stale — regenera en background si es posible.

---

## 5. Contrato JSON del endpoint

### Request

```
GET /api/business/{businessId}/insight
Authorization: Bearer <jwt>
```

No recibe body. El endpoint mismo recopila todos los datos necesarios de Supabase.

### Response — cache hit (200)

```json
{
  "ok": true,
  "data": {
    "cached": true,
    "generatedAt": "2026-04-08T10:00:00Z",
    "isStale": false,
    "insight": { ... }
  }
}
```

### Response — insight regenerado (200)

```json
{
  "ok": true,
  "data": {
    "cached": false,
    "generatedAt": "2026-04-08T16:32:11Z",
    "isStale": false,
    "insight": {
      "resumen": "Tu negocio en Coyoacan opera en una zona de alta afluencia turistica...",
      "zona": {
        "alcaldia": "Coyoacán",
        "turistas_este_mes": 320,
        "paises_top": ["EUA", "Canadá", "Francia"],
        "motivos_top": ["gastronomy", "cultural", "sports"],
        "accessibility_breakdown": {
          "none": 58,
          "mobility": 18,
          "low_vision": 12,
          "deaf": 9,
          "other": 3
        },
        "estadia_promedio": "4-7 dias",
        "tendencia_saturacion": "alta los fines de semana"
      },
      "negocio": {
        "modulos_completados": 2,
        "modulos_totales": 11,
        "progreso_pct": 18,
        "insignias_activas": ["SERVICIO_SEGURO"],
        "insignias_pendientes": ["NEGOCIO_FORMAL", "PAGOS_DIGITALES"]
      },
      "alertas": [
        "El 39% de turistas en tu zona tienen necesidades de accesibilidad — completa modulos de inclusion",
        "Tu negocio aun no aparece en el directorio publico — activa is_public para mayor visibilidad",
        "Insignia NEGOCIO_FORMAL pendiente — requiere completar modulo de formalizacion SAT"
      ],
      "oportunidades": [
        "Los turistas de tu zona priorizan gastronomia — potencial alto para tu categoria",
        "Alta afluencia de grupos familiares — considera modulos de atencion familiar"
      ],
      "cursos_recomendados": [
        {
          "slug": "atencion-personas-discapacidad",
          "titulo": "Atencion a Personas con Discapacidad",
          "categoria": "profesional",
          "razon": "El 39% de turistas en Coyoacan tienen necesidades de accesibilidad",
          "prioridad": "alta",
          "impacto_insignia": "SERVICIO_SEGURO"
        },
        {
          "slug": "registro-sat",
          "titulo": "Formalizate — Registro ante el SAT",
          "categoria": "formaliza",
          "razon": "Tu negocio no esta dado de alta ante el SAT — requisito para insignia NEGOCIO_FORMAL",
          "prioridad": "alta",
          "impacto_insignia": "NEGOCIO_FORMAL"
        },
        {
          "slug": "lengua-senas-basico",
          "titulo": "Lengua de Senas Mexicana — Nivel Basico",
          "categoria": "profesional",
          "razon": "9% de turistas en tu zona son sordos — diferenciador clave de servicio",
          "prioridad": "media",
          "impacto_insignia": null
        },
        {
          "slug": "pagos-digitales",
          "titulo": "Pagos Digitales y e-Commerce",
          "categoria": "digitaliza",
          "razon": "Turistas internacionales prefieren pago sin efectivo — necesario para insignia PAGOS_DIGITALES",
          "prioridad": "media",
          "impacto_insignia": "PAGOS_DIGITALES"
        },
        {
          "slug": "atencion-cliente-turismo",
          "titulo": "Atencion al Cliente de Excelencia",
          "categoria": "vende",
          "razon": "Tu zona recibe principalmente turistas de EUA — servicio en ingles basico recomendado",
          "prioridad": "media",
          "impacto_insignia": null
        }
      ]
    }
  }
}
```

---

## 6. Contexto que se le envia a Gemini

`lib/business-insight.ts` construye este objeto antes de llamar a Gemini.
Gemini recibe esto como parte del system prompt + user message.

```typescript
// InsightContext — lo que se arma con queries a Supabase
interface InsightContext {
  negocio: {
    businessId: string
    nombre: string
    descripcion: string
    categoria: string
    alcaldia: string
    satStatus: string                  // de business_requests
    operationModes: string[]
    accessibilityNeedsNegocio: string[] // lo que el negocio ya contempla
    teamSize: number
    businessStartRange: string
    modulosCompletados: CompletionSummary[]
    insigniasActivas: string[]
    insigniasPendientes: string[]
  }
  zona: {
    alcaldia: string
    // Agregado de tourist_questionnaires WHERE borough = negocio.borough
    totalTuristasRegistrados: number
    paisesTop: string[]                // top 3-5 por frecuencia
    motivosTop: string[]               // top 3 trip_motives
    accessibilityBreakdown: Record<string, number>  // % por necesidad
    estadiaPromedio: string
    // Agregado de daily_business_saturation de negocios en el mismo borough
    promedioSaturacionZona: number
    diasMasActivos: string[]
  }
  catalogo: {
    modulosDisponibles: ModuloCatalogo[] // id, slug, titulo, categoria, audience
  }
}
```

---

## 7. Prompt de Gemini para el informe

Se agrega en `constants/index.ts` como `buildBusinessInsightPrompt(ctx: InsightContext)`.

```typescript
export function buildBusinessInsightPrompt(ctx: InsightContext): string {
  return `
Eres el motor de inteligencia de MexGo Negocios. Tu tarea es analizar el contexto de un negocio
registrado en la plataforma Coppel Emprende y generar un informe de recomendacion personalizado.

NEGOCIO:
- Nombre: ${ctx.negocio.nombre}
- Descripcion: ${ctx.negocio.descripcion}
- Categoria: ${ctx.negocio.categoria}
- Alcaldia: ${ctx.negocio.alcaldia}
- Estatus SAT: ${ctx.negocio.satStatus}
- Formas de venta: ${ctx.negocio.operationModes.join(', ')}
- Modulos completados: ${ctx.negocio.modulosCompletados.length}
- Insignias activas: ${ctx.negocio.insigniasActivas.join(', ') || 'ninguna'}
- Insignias pendientes: ${ctx.negocio.insigniasPendientes.join(', ')}
- Accesibilidad contemplada por el negocio: ${ctx.negocio.accessibilityNeedsNegocio.join(', ') || 'ninguna'}

DATOS DE TURISTAS EN ${ctx.zona.alcaldia.toUpperCase()} (ultimos 30 dias):
- Total turistas registrados: ${ctx.zona.totalTuristasRegistrados}
- Paises principales: ${ctx.zona.paisesTop.join(', ')}
- Motivos de viaje: ${ctx.zona.motivosTop.join(', ')}
- Necesidades de accesibilidad:
${Object.entries(ctx.zona.accessibilityBreakdown)
  .map(([k, v]) => `  · ${k}: ${v}%`).join('\n')}
- Estadia promedio: ${ctx.zona.estadiaPromedio}
- Saturacion promedio de zona: ${ctx.zona.promedioSaturacionZona} (0=baja, 1=alta)

MODULOS DISPONIBLES EN EL CATALOGO:
${ctx.catalogo.modulosDisponibles.map(m => `- [${m.slug}] ${m.titulo} (${m.categoria})`).join('\n')}

INSTRUCCIONES:
1. Genera un "resumen" de 2-3 oraciones que interprete la situacion del negocio en su zona.
2. Lista "alertas" concretas (max 4) sobre brechas entre lo que el negocio ofrece y lo que los turistas necesitan.
3. Lista "oportunidades" (max 3) que el negocio deberia aprovechar dado su perfil de turistas.
4. Selecciona y ordena "cursos_recomendados" del catalogo (max 5) con prioridad alta/media/baja y una razon especifica para cada uno.
5. Si un curso impacta directamente una insignia pendiente, indicalo en "impacto_insignia".

RESPONDE UNICAMENTE con un JSON valido que siga exactamente esta estructura:
{
  "resumen": "...",
  "zona": { ... },  // datos ya calculados que puedes incluir como referencia
  "negocio": { ... },
  "alertas": ["...", "..."],
  "oportunidades": ["...", "..."],
  "cursos_recomendados": [
    {
      "slug": "...",
      "titulo": "...",
      "categoria": "...",
      "razon": "...",
      "prioridad": "alta|media|baja",
      "impacto_insignia": "CODIGO_INSIGNIA | null"
    }
  ]
}
`
}
```

---

## 8. Flujo del endpoint `GET /api/business/[businessId]/insight`

```typescript
// Pseudocodigo del route handler

export async function GET(req, { params }) {
  // 1. Autenticar — solo el propietario o ADMIN
  const user = await getAuthenticatedUser(req)
  const { businessId } = await params

  // 2. Verificar propiedad (igual que en /api/businesses/[id])

  // 3. Revisar cache
  const cached = await supabase
    .from('business_insights_cache')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle()

  const ahora = Date.now()
  const cacheAge = cached?.generated_at
    ? ahora - new Date(cached.generated_at).getTime()
    : Infinity
  const TTL_MS = 6 * 60 * 60 * 1000  // 6 horas

  if (cached && cacheAge < TTL_MS && !cached.is_stale) {
    return apiOk({ cached: true, generatedAt: cached.generated_at, insight: cached.insight_payload })
  }

  // 4. Recopilar contexto (queries paralelas a Supabase)
  const ctx = await buildInsightContext(businessId)  // lib/business-insight.ts

  // 5. Llamar a Gemini
  const prompt = buildBusinessInsightPrompt(ctx)
  const raw = await geminiGenerateJSON(prompt)        // lib/business-insight.ts
  const insight = JSON.parse(raw)

  // 6. Guardar cache
  await supabase.from('business_insights_cache').upsert({
    business_id: businessId,
    insight_payload: insight,
    generated_at: new Date().toISOString(),
    is_stale: false,
  })

  return apiOk({ cached: false, generatedAt: new Date().toISOString(), insight })
}
```

---

## 9. Funcion `buildInsightContext` en `lib/business-insight.ts`

Las queries que necesita hacer, en paralelo con `Promise.all`:

```typescript
// Query 1: perfil del negocio
const business = await supabase
  .from('business_profiles')
  .select('*')
  .eq('id', businessId)
  .single()

// Query 2: solicitud original (para sat_status, operation_modes, accessibility_needs)
const request = await supabase
  .from('business_requests')
  .select('sat_status, operation_modes, accessibility_needs, business_start_range, employees_women_count, employees_men_count')
  .eq('owner_user_id', business.owner_user_id)
  .order('submitted_at', { ascending: false })
  .limit(1)
  .maybeSingle()

// Query 3: modulos completados del negocio
const completions = await supabase
  .from('learning_completions')
  .select('module_id, status, score, learning_modules(slug, title, category)')
  .eq('business_id', businessId)
  .eq('status', 'PASSED')

// Query 4: insignias del negocio
const badges = await supabase
  .from('business_badges')
  .select('status, badge_definitions(code, public_name)')
  .eq('business_id', businessId)

// Query 5: turistas en la misma alcaldia (ultimos 30 dias)
const turistas = await supabase
  .from('tourist_questionnaires')
  .select('country, trip_motives, accessibility_needs, stay_duration')
  .eq('borough', business.borough)
  .gte('created_at', thirtyDaysAgo)

// Query 6: catalogo de modulos activos
const modulos = await supabase
  .from('learning_modules')
  .select('slug, title, category, audience')
  .eq('is_active', true)
  .in('audience', ['OWNER', 'BOTH'])
```

---

## 10. Funcion `lib/course-recommender.ts`

Alternativa mas ligera a llamar a Gemini: si el contexto es simple, un ranker deterministico local.
Puede usarse como fallback si Gemini falla, o para pre-filtrar antes de enviarle el contexto.

```typescript
export function rankCoursesByProfile(
  modulos: ModuloCatalogo[],
  ctx: InsightContext
): ModuloRankeado[] {
  return modulos
    .map(modulo => {
      let score = 0
      const razones: string[] = []

      // Penaliza modulos ya completados
      const yaCompletado = ctx.negocio.modulosCompletados.find(c => c.slug === modulo.slug)
      if (yaCompletado) return null

      // Boost si la accesibilidad de turistas no esta cubierta por el negocio
      const accessGap = ctx.zona.accessibilityBreakdown
      if (modulo.categoria === 'profesional' && accessGap['deaf'] > 5) {
        score += 30
        razones.push(`${accessGap['deaf']}% de turistas son sordos en tu zona`)
      }
      if (modulo.categoria === 'profesional' && accessGap['mobility'] > 10) {
        score += 25
        razones.push(`${accessGap['mobility']}% de turistas tienen movilidad reducida`)
      }

      // Boost si el modulo desbloquea una insignia pendiente
      const insigniaPendiente = ctx.negocio.insigniasPendientes.find(
        ins => modulo.slug.includes(ins.toLowerCase())
      )
      if (insigniaPendiente) {
        score += 40
        razones.push(`Desbloquea insignia ${insigniaPendiente}`)
      }

      // Boost por SAT si no esta formalizado
      if (modulo.categoria === 'formaliza' && ctx.negocio.satStatus !== 'FORMAL_REGISTRADO') {
        score += 35
        razones.push('Tu negocio no esta formalizado ante el SAT')
      }

      // Boost por paises de turistas
      if (ctx.zona.paisesTop.includes('EUA') && modulo.slug.includes('ingles')) {
        score += 20
        razones.push('Alta presencia de turistas de EUA en tu zona')
      }

      return { ...modulo, score, razones }
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score)
    .slice(0, 5) as ModuloRankeado[]
}
```

---

## 11. Integracion con el dashboard (pendiente Farid/Fidel)

En `app/[locale]/business/dashboard/page.tsx`:

```typescript
// Reemplazar el const MOCK = { ... } con:

const [insight, setInsight] = useState<BusinessInsight | null>(null)

useEffect(() => {
  const token = getStoredAccessToken()
  if (!token || !businessId) return

  fetch(`/api/business/${businessId}/insight`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(res => { if (res.ok) setInsight(res.data.insight) })
}, [businessId])
```

El dashboard renderiza:
- `insight.zona` → estadisticas de la alcaldia
- `insight.cursos_recomendados` → lista ordenada con razones
- `insight.alertas` → tarjetas de advertencia
- `insight.oportunidades` → banner o seccion de contexto
- `insight.negocio.progreso_pct` → barra de progreso

---

## 12. Resumen de archivos nuevos a crear

| Archivo | Tipo | Rama | Depende de |
|---------|------|------|-----------|
| `app/api/business/[businessId]/insight/route.ts` | API Route | Fidel | lib/business-insight.ts |
| `lib/business-insight.ts` | Lib | Fidel | supabase.ts, gemini.ts, constants |
| `lib/course-recommender.ts` | Lib | Fidel | types/types.ts |
| `constants/index.ts` (agregar funcion) | Constantes | Fidel | types/types.ts |
| `supabase/migrations/0005_business_insights_cache.sql` | SQL | Alan | 0002 |

### Archivos existentes que se modifican

| Archivo | Cambio | Rama |
|---------|--------|------|
| `app/[locale]/business/dashboard/page.tsx` | Reemplazar MOCK con fetch real | Farid + Fidel |
| `app/[locale]/business/learning/page.tsx` | Usar cursos_recomendados del insight | Farid + Fidel |
| `types/types.ts` | Agregar interfaces BusinessInsight, InsightContext, ModuloRankeado | Xavier (tipos) |

---

## 13. Orden de implementacion sugerido

```
1. Alan aplica migration 0005 (tabla cache)
2. Fidel implementa lib/business-insight.ts (buildInsightContext)
3. Fidel implementa constants → buildBusinessInsightPrompt
4. Fidel implementa route GET /api/business/[id]/insight
5. Fidel prueba el endpoint con Postman (sin UI)
6. Xavier agrega interfaces en types/types.ts
7. Farid conecta dashboard/page.tsx y learning/page.tsx
```

---

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-08 | Fidel (IA) | v1.0 — Arquitectura IA business: contratos, tablas, prompts y archivos. |
