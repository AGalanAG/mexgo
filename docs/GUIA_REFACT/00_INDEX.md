# GUIA_REFACT — Índice

Guías de refactorización para agentes. Cada archivo es autónomo y ejecutable.
Lee este índice primero para elegir el task correcto.

## Stack del proyecto

- **Framework:** Next.js 15, App Router, TypeScript estricto
- **Estilos:** Tailwind CSS + CSS vars en `globals.css` (`var(--primary)`, `var(--accent)`, etc.)
- **DB:** Supabase (PostgreSQL) — cliente admin en `lib/supabase.ts` via `getSupabaseAdmin()`
- **AI:** Google Gemini via `lib/gemini.ts` y `lib/business-insight.ts`
- **Auth:** JWT Bearer token verificado en API routes via `getAuthenticatedUser(req)` de `lib/auth-helpers.ts`
- **Sesión cliente:** localStorage via `lib/client-auth.ts` (`saveSession`, `getStoredAccessToken`, `clearSession`)
- **Respuestas API:** siempre usar `apiOk(data)` y `apiError(code, msg, status)` de `lib/api-response.ts`

## Convenciones obligatorias

```ts
// API route — estructura base
import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth-helpers'
import { apiOk, apiError } from '@/lib/api-response'
import { DEMO_USER_ID } from '@/constants/demo-data'

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401)

  // Demo bypass — SIEMPRE antes de tocar Supabase
  if (user.id === DEMO_USER_ID) {
    return apiOk(MOCK_DATA)
  }

  // Lógica real con Supabase...
}
```

```ts
// Supabase — siempre usar getSupabaseAdmin(), nunca crear cliente propio
import { getSupabaseAdmin } from '@/lib/supabase'
const { data, error } = await getSupabaseAdmin()
  .from('tabla')
  .select('*')
  .eq('column', value)
```

```ts
// Tipos — importar siempre desde @/types/types
import type { ItineraryStop, ChatResponse } from '@/types/types'
// Nunca redefinir interfaces que ya existen en types/types.ts
```

```ts
// Constantes demo — importar desde @/constants/demo-data
import { DEMO_TOKEN, DEMO_USER_ID, DEMO_BUSINESS_ID } from '@/constants/demo-data'
// Nunca hardcodear strings de demo directamente
```

## Variables CSS disponibles

```css
var(--primary)        /* azul principal */
var(--dark-blue)      /* azul oscuro hover */
var(--accent)         /* verde */
var(--secondary)      /* amarillo/dorado */
var(--coppel-blue)    /* azul Coppel */
var(--coppel-yellow)  /* amarillo Coppel */
var(--background)     /* fondo general */
```

## Archivos que NO debes modificar sin aviso

- `lib/supabase.ts` — cliente Supabase, no tocar
- `lib/auth-helpers.ts` — verificación JWT, no tocar
- `lib/api-response.ts` — helpers de respuesta, no tocar
- `middleware.ts` / `proxy.ts` — protección de rutas, no tocar
- `types/types.ts` — solo agregar, nunca eliminar tipos existentes

## Tasks disponibles

| Archivo | Tarea | Prioridad | Depende de |
|---|---|---|---|
| `01_tipos_tourist_profile.md` | Unificar tipos TouristProfile | Alta | — |
| `02_demo_mode.md` | Corregir gaps del modo demo | Alta | `01` |
| `03_itinerario_persistence.md` | Persistir itinerario en Supabase | Alta | `01`, `02` |
| `04_chat_ui.md` | Pulir ChatUI: estilos + negociosRecomendados | Media | — |
| `05_business_insight_flow.md` | Resolver fragilidad del sessionStorage de insight | Media | — |
| `06_chat_historial.md` | Limitar crecimiento del historial de chat | Baja | — |

**Orden recomendado de ejecución:** 01 → 02 → 04 → 05 → 03 → 06

El task 03 requiere que Supabase esté configurado (`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`). Los demás se pueden ejecutar sin DB.
