# REFACTORIZING_FRONT.md

Guía de curación del frontend de MexGO para preparar la integración real con Supabase.
Registra los archivos clave, su propósito actual, y los problemas detectados por sección.

---

## Índice de archivos principales

### Páginas (App Router)

| Archivo | Rol | Datos actuales |
|---|---|---|
| `app/[locale]/page.tsx` | Landing + login modal | Estático |
| `app/[locale]/demo/page.tsx` | Acceso demo sin cuenta | `DEMO_TOKEN` hardcoded |
| `app/[locale]/(tourist)/discover/page.tsx` | Directorio de negocios | API real `/api/directory/businesses` |
| `app/[locale]/(tourist)/discover/[id]/page.tsx` | Detalle de negocio | API real `/api/directory/businesses/[id]` |
| `app/[locale]/(tourist)/chat/page.tsx` | Chat IA turista | API `/api/chat` → Gemini |
| `app/[locale]/(tourist)/trips/page.tsx` | Itinerario del turista | **localStorage** (`mexgo_itinerary`) |
| `app/[locale]/(tourist)/profile/page.tsx` | Perfil del turista | API `/api/tourist/profile` |
| `app/[locale]/(tourist)/onboarding/page.tsx` | Cuestionario turista | API `/api/tourist/questionnaire` |
| `app/[locale]/business/dashboard/page.tsx` | Dashboard negocio + IA insight | sessionStorage + API `/api/business/[id]/insight` |
| `app/[locale]/business/learning/page.tsx` | Módulos de aprendizaje | API `/api/learning/modules` + `/api/learning/completions` |
| `app/[locale]/business/recomendaciones/page.tsx` | Cursos recomendados por IA | sessionStorage (`mexgo_insight`) |
| `app/[locale]/business/profile/page.tsx` | Perfil del negocio | API `/api/businesses/me` |
| `app/[locale]/business/support/page.tsx` | Soporte (tickets) | Mock hardcoded |

### Componentes clave

| Archivo | Propósito |
|---|---|
| `components/tourist/ChatUI.tsx` | Interfaz del chat turista |
| `components/business/BusinessChat.tsx` | Chat de negocio (BusinessChat) |
| `components/business/CourseCard.tsx` | Tarjeta de curso/módulo (compartida) |
| `components/business/NavbarBusiness.tsx` | Navbar del área de negocio |
| `components/tourist/Navbar.tsx` | Navbar turista |
| `components/tourist/GlobalLoginModal.tsx` | Modal de login global |

### Librerías internas

| Archivo | Propósito |
|---|---|
| `lib/itinerario.ts` | Estado del itinerario en **memoria del servidor** |
| `lib/gemini.ts` | Cliente Gemini — chat turista + function calling |
| `lib/business-chat.ts` | Cliente Gemini — chat del negocio |
| `lib/business-insight.ts` | Generación de insight IA para negocios |
| `lib/client-auth.ts` | Sesión en cliente (`localStorage`) |
| `lib/auth-helpers.ts` | Verificación de JWT en API routes |
| `lib/demo.ts` | Re-exports de constantes demo + `isDemoMode()` |
| `lib/businesses.ts` | `MOCK_BUSINESSES` — datos de negocios falsos |
| `lib/mockPerfil.ts` | `MOCK_TOURIST_PROFILE` — perfil turista falso |
| `lib/course-recommender.ts` | Ranker determinístico de cursos |
| `lib/equity.ts` | Algoritmo de equity para recomendaciones |

### Tipos

| Archivo | Notas |
|---|---|
| `types/types.ts` | Fuente de verdad de tipos. Ver sección de problemas. |
| `constants/demo-data.ts` | Constantes demo: `DEMO_TOKEN`, `DEMO_USER_ID`, etc. |

---

## Sección 1 — Itinerario: gap crítico

**Archivos:** `lib/itinerario.ts`, `app/api/itinerary/route.ts`, `app/api/itinerary/[id]/route.ts`, `components/tourist/ChatUI.tsx`, `app/[locale]/(tourist)/trips/page.tsx`

### Qué falla

**1.1 Estado servidor es in-memory y efímero**
```ts
// lib/itinerario.ts
const paradasPorUsuario = new Map<string, ItineraryStop[]>()
```
El `Map` vive en memoria del proceso Node.js. Al reiniciar el servidor (o en Vercel, entre invocaciones serverless), **todas las paradas se pierden**. No hay escritura a Supabase.

**1.2 El cliente y el servidor están desincronizados**

`ChatUI.tsx` mantiene el itinerario en `localStorage` (`mexgo_itinerary`) y lo envía en cada request al chat:
```ts
body: JSON.stringify({ ..., itinerario: leerItinerario() })
```
El servidor llama `inicializarParadas(user.id, body.itinerario ?? [])` para sincronizar, pero esto sobrescribe cualquier estado previo. Si el usuario tiene dos pestañas abiertas, hay condición de carrera.

**1.3 `trips/page.tsx` solo lee localStorage**

La página de itinerario **no llama a ninguna API**. Lee directamente `mexgo_itinerary` del localStorage. Si el usuario limpia el storage o cambia de dispositivo, pierde todo.

**1.4 `itineraryId` ficticio**

Cada `ItineraryStop` creada en `agregarEvento()` tiene `itineraryId: 'local'`. Las tablas `itineraries` e `itinerary_stops` de Supabase requieren un UUID real.

### Qué hacer cuando llegue Supabase

- `GET /api/itinerary` debe hacer `SELECT * FROM itinerary_stops WHERE itinerary_id = (SELECT id FROM itineraries WHERE tourist_user_id = $userId LIMIT 1)`
- `POST /api/itinerary` debe insertar en `itinerary_stops`
- `trips/page.tsx` debe dejar de leer localStorage y llamar a `GET /api/itinerary` con el Bearer token
- `ChatUI.tsx` puede seguir pasando el itinerario local como contexto de Gemini, pero las mutaciones deben persistirse vía API, no solo en localStorage

---

## Sección 2 — TouristProfile: interfaces desalineadas

**Archivos:** `types/types.ts`, `lib/mockPerfil.ts`, `app/[locale]/(tourist)/profile/page.tsx`

### Qué falla

**2.1 Dos formas distintas del mismo concepto**

En `types/types.ts` hay una interfaz `TouristProfile` orientada al chat de Gemini:
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

Pero `demo/page.tsx` y `profile/page.tsx` guardan en localStorage un objeto con forma distinta:
```ts
localStorage.setItem('mexgo_tourist_profile', JSON.stringify({
  fullName: DEMO_TOURIST_NAME,
  countryOfOrigin: 'MX',
  accessibilityNeeds: [],
  travelMotives: ['gastronomy', 'cultural'],
}))
```

`ChatUI.tsx` lee ese localStorage y lo pasa como `perfil` al backend, pero el tipo `TouristProfile` no tiene `fullName` ni `travelMotives`. Gemini recibe un objeto diferente al esperado.

**2.2 `mockPerfil.ts` tiene forma snake_case pero el storage es camelCase**

`MOCK_TOURIST_PROFILE` en `lib/mockPerfil.ts` usa la forma del tipo Gemini. El storage usa camelCase. Son formatos incompatibles.

### Qué hacer

Definir **un solo tipo** para el perfil turista almacenado, que luego se mapea al `TouristProfile` que espera Gemini. Separar claramente:
- `TouristStoredProfile` — lo que va a localStorage / DB
- `TouristProfile` (Gemini) — lo que se envía al modelo

---

## Sección 3 — Demo mode: inconsistencias

**Archivos:** `app/[locale]/demo/page.tsx`, `lib/demo.ts`, `lib/auth-helpers.ts`, `app/api/*/route.ts`

### Qué falla

**3.1 Demo turista no pone cookie de rol**

`entrarComoNegocio()` pone la cookie `mexgo_primary_role=ENCARGADO_NEGOCIO` para que `proxy.ts` proteja las rutas `/business/*`. Pero `entrarComoTurista()` **no pone ninguna cookie**:
```ts
function entrarComoTurista() {
  saveSession({ ..., primaryRole: 'TURISTA' })
  // ← falta: document.cookie = `mexgo_primary_role=TURISTA; ...`
  router.push('/discover')
}
```
Si `proxy.ts` revisa la cookie para rutas turistas, el demo fallará silenciosamente.

**3.2 `isDemoMode()` verifica env vars, no el token**

```ts
export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY
}
```
Esto activa el modo demo **automáticamente en producción si faltan las env vars**, sin que el usuario haya elegido el demo. Las rutas API deberían revisar `isDemoToken(token)` explícitamente, no el entorno.

**3.3 No todas las API routes tienen bypass demo**

- `/api/businesses/me` ✅ tiene bypass demo
- `/api/tourist/profile` ✅ tiene bypass demo (perfil page)
- `/api/chat` ❌ no tiene bypass — el chat turista falla en demo si Supabase no está
- `/api/itinerary` ❌ no tiene bypass
- `/api/learning/modules` ❌ no tiene bypass

### Qué hacer

Agregar `if (isDemoToken(token)) { return mockData }` en rutas que el demo turista necesita. O crear un middleware de bypass demo centralizado.

---

## Sección 4 — Chat turista: múltiples fuentes de verdad

**Archivos:** `components/tourist/ChatUI.tsx`, `app/api/chat/route.ts`, `lib/gemini.ts`

### Qué falla

**4.1 Historial de chat en localStorage**

```ts
const CHAT_LS_KEY = 'mexgo_chat_history'
```
El historial de mensajes se persiste en localStorage. La tabla `chat_sessions` y `chat_messages` de Supabase existen pero nunca se usan.

**4.2 El cliente envía el historial completo en cada request**

El `historial` crece sin límite y se envía completo al backend en cada mensaje. Con conversaciones largas esto puede exceder el límite del contexto de Gemini o el tamaño del request.

**4.3 `negociosRecomendados` en la respuesta no se muestra**

`ChatResponse` incluye `negociosRecomendados?: NegocioConScore[]` y Gemini puede devolverlos, pero `ChatUI.tsx` no renderiza tarjetas de negocio — el campo se ignora completamente en el frontend.

**4.4 Estilo ChatUI no coincide con BusinessChat**

`ChatUI.tsx` tiene estilos más simples que `BusinessChat.tsx`. Se intentó unificar pero un linter hook revirtió los cambios. Pendiente de re-aplicar manualmente.

---

## Sección 5 — Business dashboard/learning: sessionStorage frágil

**Archivos:** `app/[locale]/business/dashboard/page.tsx`, `app/[locale]/business/learning/page.tsx`, `app/[locale]/business/recomendaciones/page.tsx`

### Qué falla

**5.1 `insight` viaja por sessionStorage entre páginas**

El dashboard genera el insight y lo guarda en `sessionStorage`:
```ts
sessionStorage.setItem('mexgo_insight', JSON.stringify(data))
```
`learning/page.tsx` y `recomendaciones/page.tsx` lo leen de ahí. Si el usuario abre `recomendaciones` directamente (sin pasar por dashboard), no hay insight y la página queda vacía sin error claro.

**5.2 `learning/page.tsx` carga módulos de la API pero también usa sessionStorage**

Hay dos fuentes de datos en la misma página: la API real (`/api/learning/modules`) y el sessionStorage (para `topCursos` del insight). El código mezcla ambos estados sin una estrategia clara de prioridad.

**5.3 Módulos de aprendizaje no tienen datos seed**

La tabla `learning_modules` en Supabase no tiene datos sembrados. `/api/learning/modules` devuelve vacío en cualquier instancia real, por lo que `businessLearningModules` siempre será `[]`.

---

## Sección 6 — Tipos: campos Gemini marcados como temporales

**Archivo:** `types/types.ts`

### Qué falla (según nota en memoria)

Los tipos usados por Gemini function calling (`ChatMessagePayload`, `ItineraryStop` como retorno de función, etc.) fueron definidos orientados al BFF, no al schema de Supabase. Cuando se integre Supabase real:

- `ItineraryStop.itineraryId` será un UUID real, no `'local'`
- `ChatMessage.content` es `string` pero `ChatMessagePayload.text` también es `string` — dos tipos para el mismo concepto
- `TouristProfile` (Gemini) y el objeto guardado en localStorage son distintos (ver Sección 2)

---

## Sección 7 — Directorio y discover: buen estado relativo

**Archivos:** `app/[locale]/(tourist)/discover/page.tsx`, `app/api/directory/businesses/route.ts`

### Estado actual

Esta sección está **mejor alineada** que el resto:
- `discover/page.tsx` llama a `/api/directory/businesses` (sin auth)
- La respuesta se guarda en `localStorage('mexgo_recommendations')` como caché
- `discover/[id]/page.tsx` llama a `/api/directory/businesses/[businessId]`

### Problema menor

El botón "Ver más" en `discover/page.tsx` tiene `onClick` pero no hace nada — falta implementar paginación o carga incremental.

La ruta `/api/recommend` existe pero `discover/page.tsx` no la usa. El directorio público y las recomendaciones personalizadas son dos endpoints distintos que el frontend trata igual.

---

## Sección 8 — Support/tickets: completamente mock

**Archivo:** `app/[locale]/business/support/page.tsx`

### Estado

La página tiene datos de tickets hardcoded. Alan eliminó las tablas de tickets del schema en su commit `feat/alan-backend`. No hay endpoint de tickets ni tabla en DB. Esta sección es decorativa hasta nuevo aviso.

---

## Resumen de prioridades de refactorización

| Prioridad | Sección | Impacto |
|---|---|---|
| 🔴 **Alta** | Itinerario (Sec. 1) | El chat turista pierde datos en cada deploy |
| 🔴 **Alta** | Demo turista cookie (Sec. 3.1) | Puede romper navegación en demo |
| 🔴 **Alta** | TouristProfile desalineado (Sec. 2) | Gemini recibe perfil en formato incorrecto |
| 🟡 **Media** | Chat historial ilimitado (Sec. 4.2) | Puede fallar con conversaciones largas |
| 🟡 **Media** | sessionStorage insight (Sec. 5.1) | UX rota al navegar directamente a recomendaciones |
| 🟡 **Media** | Demo bypasses faltantes (Sec. 3.3) | Chat y trips rompen en demo |
| 🟢 **Baja** | ChatUI styling (Sec. 4.4) | Visual inconsistente vs BusinessChat |
| 🟢 **Baja** | `negociosRecomendados` sin renderizar (Sec. 4.3) | Feature incompleta |
| 🟢 **Baja** | Learning sin seed data (Sec. 5.3) | Página vacía hasta que haya datos |

---

## Convención para agregar bypasses demo

Patrón estándar ya usado en `/api/businesses/me`:

```ts
// Al inicio del handler, después de getAuthenticatedUser:
if (user.id === DEMO_USER_ID) {
  return apiOk(MOCK_DATA_AQUI)
}
```

Para rutas que aún no lo tienen: `chat`, `itinerary`, `learning/modules`, `learning/completions`.
