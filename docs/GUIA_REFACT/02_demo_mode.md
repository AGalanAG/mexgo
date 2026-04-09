# Task 02 — Corregir gaps del modo demo

**Prioridad:** Alta  
**Depende de:** Task 01 completado  
**No requiere Supabase**

## Contexto

El modo demo usa `DEMO_TOKEN = 'mexgo-demo'` y `DEMO_USER_ID = 'demo-user-00000000-0001'`.
Hay tres bugs distintos:

1. **Demo turista no pone cookie de rol** → puede romper el middleware
2. **`isDemoMode()` activa demo por env vars** → peligroso en producción
3. **Varias API routes no tienen bypass demo** → chat y trips rompen en demo

## Archivos a leer antes de tocar

1. `app/[locale]/demo/page.tsx`
2. `lib/demo.ts`
3. `app/api/chat/route.ts`
4. `app/api/itinerary/route.ts`
5. `app/api/learning/modules/route.ts`
6. `app/api/learning/completions/route.ts`
7. `constants/demo-data.ts`

## Bug 1 — Demo turista sin cookie de rol

### Archivo: `app/[locale]/demo/page.tsx`

La función `entrarComoNegocio()` ya pone la cookie correctamente:
```ts
document.cookie = `mexgo_primary_role=ENCARGADO_NEGOCIO; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`
```

`entrarComoTurista()` no pone ninguna cookie. Agrega esta línea **antes** del `router.push`:

```ts
function entrarComoTurista() {
  setLoading(true)
  saveSession({ ... })
  localStorage.setItem('mexgo_tourist_profile', JSON.stringify({ ... }))

  // Agregar esta línea:
  document.cookie = `mexgo_primary_role=TURISTA; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax`

  router.push('/discover')
}
```

## Bug 2 — `isDemoMode()` depende de env vars

### Archivo: `lib/demo.ts`

La función actual es:
```ts
export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY
}
```

Esto activa demo automáticamente cuando Supabase no está configurado. Reemplázala:

```ts
/** true solo cuando el token del request es el DEMO_TOKEN */
export function isDemoToken(token: string): boolean {
  return token === DEMO_TOKEN
}

/**
 * @deprecated Usar isDemoToken(token) en lugar de isDemoMode().
 * isDemoMode() activa demo globalmente por env vars, lo que puede enmascarar
 * errores de configuración en producción.
 */
export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY
}
```

No elimines `isDemoMode()` — puede estar siendo usada en otros lugares. Solo añade el JSDoc de deprecación.

## Bug 3 — API routes sin bypass demo

Para cada ruta listada abajo, agrega el bypass **justo después** de verificar `getAuthenticatedUser`, antes de cualquier lógica de Supabase.

### Patrón estándar del bypass

```ts
import { DEMO_USER_ID } from '@/constants/demo-data'

// Dentro del handler, después del check de auth:
if (user.id === DEMO_USER_ID) {
  return apiOk(MOCK_DATA_ESPECIFICO)
}
```

### `app/api/chat/route.ts`

El chat ya funciona con Gemini sin Supabase porque `lib/gemini.ts` no requiere DB. El problema es que `inicializarParadas` usa el Map en memoria que se pierde entre deploys. En demo, esto es aceptable — **no necesita bypass**, solo verificar que el import de `DEMO_USER_ID` no cause un error si Supabase está ausente. Revisar y confirmar que el route compila sin Supabase.

### `app/api/itinerary/route.ts`

El itinerario también usa el Map en memoria (`lib/itinerario.ts`), no Supabase. No necesita bypass por ahora — funciona en demo porque no toca DB.

### `app/api/learning/modules/route.ts`

Lee este archivo. Si hace query a Supabase directamente y no tiene bypass, agrega:

```ts
import { DEMO_USER_ID } from '@/constants/demo-data'
// datos mock para learning en demo:
const DEMO_MODULES = [
  { id: 'mod-1', slug: 'atencion-personas-discapacidad', title: 'Atención a Personas con Discapacidad', category: 'profesional', audience: 'BOTH', isActive: true },
  { id: 'mod-2', slug: 'registro-sat', title: 'Formalízate — Registro ante el SAT', category: 'formaliza', audience: 'OWNER', isActive: true },
  { id: 'mod-3', slug: 'pagos-digitales', title: 'Pagos Digitales y e-Commerce', category: 'digitaliza', audience: 'OWNER', isActive: true },
]

// En el handler, después de getAuthenticatedUser:
if (user.id === DEMO_USER_ID) {
  return apiOk(DEMO_MODULES)
}
```

### `app/api/learning/completions/route.ts`

Lee este archivo. Si hace query a Supabase y no tiene bypass:

```ts
if (user.id === DEMO_USER_ID) {
  return apiOk([]) // demo sin completions previas
}
```

## Lo que NO hacer

- No muevas los datos mock de demo a un archivo separado nuevo — agrégalos inline en la route o en `constants/demo-data.ts`
- No uses `isDemoMode()` para los bypasses — usa `user.id === DEMO_USER_ID`
- No pongas el bypass después de una query a Supabase — siempre antes

## Verificación

1. `npm run build` sin errores
2. Ir a `/es/demo` → "Entrar como turista" → navegar a `/discover`, `/trips`, `/profile` sin errores de consola
3. Ir a `/es/demo` → "Entrar como negocio" → navegar a `/business/dashboard`, `/business/learning` sin errores
