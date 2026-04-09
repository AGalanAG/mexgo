# Task 01 — Unificar TouristProfile

**Prioridad:** Alta  
**Sin dependencias**  
**No requiere Supabase**

## Problema

Hay dos representaciones incompatibles del perfil turista en el proyecto:

**Forma A — Gemini (`types/types.ts` línea ~210):**
```ts
export interface TouristProfile {
  country: string
  companions_count: string
  is_adult: string
  stay_duration: string
  city: string
  borough: string
  trip_motives: string[]
  accessibility_needs: string[]
  priority_factor: string
}
```

**Forma B — Lo que realmente se guarda en localStorage y DB:**
```ts
// Esto es lo que escribe demo/page.tsx y profile/page.tsx
{
  fullName: string
  countryOfOrigin: string
  accessibilityNeeds: string[]
  travelMotives: string[]
}
```

`ChatUI.tsx` lee la Forma B del localStorage y la manda al backend como `perfil`. El backend la tipea como `TouristProfile` (Forma A). Gemini recibe campos undefined.

## Archivos a leer antes de tocar

1. `types/types.ts` — ver sección "CHAT / GEMINI" (~línea 204)
2. `lib/mockPerfil.ts` — ver la forma actual de `MOCK_TOURIST_PROFILE`
3. `components/tourist/ChatUI.tsx` — ver función `leerPerfil()` (~línea 24)
4. `app/[locale]/demo/page.tsx` — ver `entrarComoTurista()` (~línea 13)
5. `app/[locale]/(tourist)/onboarding/page.tsx` — ver qué guarda en localStorage

## Qué hacer

### Paso 1 — Agregar `TouristStoredProfile` en `types/types.ts`

Añade este tipo **después** de `TouristProfile` existente. No elimines `TouristProfile`.

```ts
/** Forma persistida en localStorage y en la tabla tourist_profiles de Supabase */
export interface TouristStoredProfile {
  fullName: string
  countryOfOrigin: string
  accessibilityNeeds: string[]
  travelMotives: string[]
  borough?: string
  stayDuration?: string
  companionsCount?: number
}
```

### Paso 2 — Agregar función mapper en `types/types.ts`

Agrega esta función exportada justo debajo del tipo:

```ts
/** Convierte TouristStoredProfile al formato que espera Gemini */
export function toGeminiProfile(p: TouristStoredProfile): TouristProfile {
  return {
    country:            p.countryOfOrigin,
    companions_count:   String(p.companionsCount ?? 1),
    is_adult:           'true',
    stay_duration:      p.stayDuration ?? '2-3 días',
    city:               'CDMX',
    borough:            p.borough ?? 'Centro Histórico',
    trip_motives:       p.travelMotives,
    accessibility_needs: p.accessibilityNeeds,
    priority_factor:    'gastronomia',
  }
}
```

### Paso 3 — Actualizar `lib/mockPerfil.ts`

Reemplaza `MOCK_TOURIST_PROFILE` para que use `TouristStoredProfile`:

```ts
import type { TouristStoredProfile } from '@/types/types'

export const MOCK_TOURIST_PROFILE: TouristStoredProfile = {
  fullName:           'Viajero Demo',
  countryOfOrigin:    'MX',
  accessibilityNeeds: [],
  travelMotives:      ['gastronomy', 'cultural'],
  borough:            'Centro Histórico',
  stayDuration:       '2-3 días',
  companionsCount:    1,
}
```

### Paso 4 — Actualizar `components/tourist/ChatUI.tsx`

Cambia la función `leerPerfil()` para que devuelva el tipo correcto:

```ts
// Cambiar la importación en la parte superior:
import type { ChatMessagePayload, ChatResponse, ItineraryStop, TouristStoredProfile } from '@/types/types'
import { toGeminiProfile } from '@/types/types'
import { MOCK_TOURIST_PROFILE } from '@/lib/mockPerfil'

// Cambiar la función leerPerfil:
function leerPerfil(): TouristStoredProfile {
  try {
    const stored = localStorage.getItem('mexgo_tourist_profile')
    if (stored) return JSON.parse(stored) as TouristStoredProfile
  } catch { /* ignore */ }
  return MOCK_TOURIST_PROFILE
}
```

Y en `enviarMensaje()`, donde se construye el body del fetch, aplica el mapper:

```ts
body: JSON.stringify({
  mensaje,
  historial,
  perfil: toGeminiProfile(leerPerfil()),   // ← aplica el mapper aquí
  itinerario: leerItinerario(),
}),
```

### Paso 5 — Verificar `app/api/tourist/questionnaire/route.ts`

Lee ese archivo. Si guarda el perfil en Supabase o lo transforma, asegúrate de que use `TouristStoredProfile` como tipo para lo que guarda, no `TouristProfile`.

## Lo que NO hacer

- No elimines `TouristProfile` de `types/types.ts` — Gemini lo necesita
- No cambies la interfaz `ChatRequest` en `types/types.ts` — solo cambia qué se pasa como valor
- No toques `app/api/chat/route.ts` — el backend ya recibe `perfil` como `unknown` y lo pasa a Gemini directamente

## Verificación

Después de los cambios, haz `npm run build`. No debe haber errores de TypeScript relacionados con `TouristProfile` o `perfil`.
