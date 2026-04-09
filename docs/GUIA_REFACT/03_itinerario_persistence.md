# Task 03 — Persistir itinerario en Supabase

**Prioridad:** Alta  
**Depende de:** Tasks 01 y 02 completados  
**Requiere Supabase configurado** (`NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`)

## Contexto

El itinerario actualmente vive en dos lugares desconectados:

- **Servidor:** `lib/itinerario.ts` — un `Map<userId, ItineraryStop[]>` en memoria del proceso. Se pierde al reiniciar.
- **Cliente:** `localStorage('mexgo_itinerary')` — `ChatUI.tsx` lo lee y lo manda al backend en cada mensaje.
- **Trips page:** `app/[locale]/(tourist)/trips/page.tsx` — lee solo el localStorage, nunca llama a la API.

## Schema de Supabase relevante

Tabla `itineraries`:
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
tourist_user_id uuid NOT NULL REFERENCES users(id)
status          text DEFAULT 'draft'  -- 'draft' | 'saved' | 'archived'
version         int  DEFAULT 1
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

Tabla `itinerary_stops`:
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
itinerary_id        uuid NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE
route_date          date NOT NULL
stop_order          int  NOT NULL
stop_type           text NOT NULL DEFAULT 'BUSINESS'
business_profile_id uuid REFERENCES business_profiles(id)
label               text NOT NULL
start_time          time
end_time            time
latitude            float8
longitude           float8
created_at          timestamptz DEFAULT now()
```

## Archivos a leer antes de tocar

1. `lib/itinerario.ts` — lógica actual en memoria
2. `app/api/itinerary/route.ts` — GET y POST actuales
3. `app/api/itinerary/[id]/route.ts` — PATCH y DELETE actuales
4. `components/tourist/ChatUI.tsx` — cómo sincroniza con localStorage
5. `app/[locale]/(tourist)/trips/page.tsx` — cómo lee el itinerario
6. `types/types.ts` — interfaces `Itinerary` e `ItineraryStop`

## Plan de implementación

### Paso 1 — Helper: obtener o crear itinerario del usuario

Crea una función nueva en `lib/itinerario.ts` (o en un archivo nuevo `lib/itinerario-db.ts` si prefieres separar):

```ts
import { getSupabaseAdmin } from '@/lib/supabase'
import type { ItineraryStop } from '@/types/types'

/** Obtiene el itinerario activo del turista, o crea uno nuevo si no existe */
async function getOrCreateItinerary(userId: string): Promise<string> {
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
```

### Paso 2 — Actualizar `GET /api/itinerary`

```ts
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401)

  if (user.id === DEMO_USER_ID) {
    return apiOk(leerItinerario(user.id)) // mantener comportamiento demo en memoria
  }

  const itineraryId = await getOrCreateItinerary(user.id)
  const { data, error } = await getSupabaseAdmin()
    .from('itinerary_stops')
    .select('*')
    .eq('itinerary_id', itineraryId)
    .order('stop_order', { ascending: true })

  if (error) return apiError('INTERNAL_ERROR', error.message, 500)

  // Mapear a ItineraryStop
  const stops: ItineraryStop[] = (data ?? []).map(row => ({
    id:                row.id,
    itineraryId:       row.itinerary_id,
    routeDate:         row.route_date,
    stopOrder:         row.stop_order,
    stopType:          row.stop_type,
    businessProfileId: row.business_profile_id ?? undefined,
    label:             row.label,
    startTime:         row.start_time ?? undefined,
    endTime:           row.end_time ?? undefined,
    latitude:          row.latitude ?? 19.4326,
    longitude:         row.longitude ?? -99.1332,
    createdAt:         row.created_at,
  }))

  return apiOk(stops)
}
```

### Paso 3 — Actualizar `POST /api/itinerary`

```ts
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401)

  if (user.id === DEMO_USER_ID) {
    const body = await req.json() as AddStopRequest
    const stop = agregarEvento(user.id, body)
    return NextResponse.json({ ok: true, data: stop }, { status: 201 })
  }

  const body = await req.json() as AddStopRequest
  const itineraryId = await getOrCreateItinerary(user.id)

  // Obtener el stop_order siguiente
  const { count } = await getSupabaseAdmin()
    .from('itinerary_stops')
    .select('id', { count: 'exact', head: true })
    .eq('itinerary_id', itineraryId)

  const { data, error } = await getSupabaseAdmin()
    .from('itinerary_stops')
    .insert({
      itinerary_id:        itineraryId,
      route_date:          body.dia,
      stop_order:          (count ?? 0) + 1,
      stop_type:           'BUSINESS',
      business_profile_id: body.negocio_id || null,
      label:               body.nombre,
      start_time:          body.hora || null,
    })
    .select('*')
    .single()

  if (error) return apiError('INTERNAL_ERROR', error.message, 500)

  const stop: ItineraryStop = {
    id:                data.id,
    itineraryId:       data.itinerary_id,
    routeDate:         data.route_date,
    stopOrder:         data.stop_order,
    stopType:          data.stop_type,
    businessProfileId: data.business_profile_id ?? undefined,
    label:             data.label,
    startTime:         data.start_time ?? undefined,
    latitude:          19.4326,
    longitude:         -99.1332,
    createdAt:         data.created_at,
  }

  return NextResponse.json({ ok: true, data: stop }, { status: 201 })
}
```

### Paso 4 — Actualizar `trips/page.tsx`

La página actualmente solo lee localStorage. Cámbiala para que llame a `GET /api/itinerary`:

```ts
// Dentro del useEffect de carga:
useEffect(() => {
  const token = getStoredAccessToken()
  if (!token) return

  fetch('/api/itinerary', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => r.json())
    .then(result => {
      if (result.ok) {
        setParadas(result.data as ItineraryStop[])
        // Sincronizar localStorage para que ChatUI también lo vea
        localStorage.setItem('mexgo_itinerary', JSON.stringify(result.data))
      }
    })
    .catch(() => {
      // Fallback a localStorage
      try {
        const raw = localStorage.getItem('mexgo_itinerary')
        if (raw) setParadas(JSON.parse(raw) as ItineraryStop[])
      } catch { /* ignore */ }
    })
}, [])
```

Necesitas importar `getStoredAccessToken` de `@/lib/client-auth` y el tipo `ItineraryStop` de `@/types/types`.

### Paso 5 — Actualizar PATCH y DELETE en `app/api/itinerary/[id]/route.ts`

Lee el archivo actual. Aplica el mismo patrón: demo → in-memory, real → Supabase update/delete.

Para PATCH:
```ts
await getSupabaseAdmin()
  .from('itinerary_stops')
  .update({ route_date: args.dia, start_time: args.hora, label: args.nombre })
  .eq('id', stopId)
  .eq('itinerary_id', itineraryId) // seguridad: verificar ownership
```

Para DELETE:
```ts
await getSupabaseAdmin()
  .from('itinerary_stops')
  .delete()
  .eq('id', stopId)
```

## Lo que NO hacer

- No elimines `lib/itinerario.ts` — el demo lo sigue usando
- No cambies la interfaz `ItineraryStop` en `types/types.ts`
- No toques `lib/gemini.ts` — el chat puede seguir usando el Map en memoria como contexto de Gemini, la persistencia es responsabilidad de la API
- No uses `fetch` dentro de `lib/itinerario.ts` — ese archivo es server-side puro

## Verificación

1. `npm run build` sin errores
2. Con Supabase configurado: crear parada desde el chat → ir a `/trips` → la parada aparece → recargar página → la parada persiste
3. Demo mode: crear parada desde chat → ir a `/trips` → la parada aparece (puede perderse al recargar, eso es aceptable en demo)
