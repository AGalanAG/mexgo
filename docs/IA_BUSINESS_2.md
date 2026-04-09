# IA_BUSINESS_2 — Chat Conversacional para Propietarios de Negocio
**MexGo · Los Mossitos · Genius Arena 2026**

> Segunda capa de IA del dashboard business.
> La Fase 1 (`IA_BUSINESS.md`) entrega un informe estático JSON cada 6 horas.
> Esta fase entrega un **asistente conversacional** que conoce el negocio en tiempo real
> y responde preguntas libres del dueño o encargado.

---

## 1. Por qué impresiona más en demo

| Fase 1 — Informe estático | Fase 2 — Chat conversacional |
|---|---|
| Gemini genera JSON una sola vez | Gemini responde preguntas en tiempo real |
| El dueño lee, no interactúa | El dueño pregunta: "¿Qué hago con mis alertas?" |
| Útil, pero pasivo | Útil **y** sorprendente para el jurado |
| Sin diferenciador visual | Floating chat button → UX distintiva |

---

## 2. Arquitectura de alto nivel

```
[BusinessChat.tsx]
    │  POST { mensaje, historial }
    ▼
[/api/business/[businessId]/chat]   ← route.ts
    │  1. getAuthenticatedUser()
    │  2. ownership check
    │  3. buildInsightContext(businessId)     ← reutiliza lib/business-insight.ts
    │  4. lee cache de insight si existe      ← business_insights_cache
    │  5. buildBusinessChatSystemPrompt(ctx, cachedInsight)
    │  6. businessChat(systemPrompt, historial, mensaje)
    ▼
[lib/business-chat.ts]
    │  GoogleGenAI.getGenerativeModel(GEMINI_MODEL)
    │  model.startChat({ history, systemInstruction })
    │  chat.sendMessage(mensaje)
    ▼
  respuesta texto plano (no JSON)
    ▼
[BusinessChat.tsx] renderiza burbuja de respuesta
```

> **Sin function calling.** El chat es texto libre — Gemini recibe el contexto
> completo del negocio en el `systemInstruction` y responde como consultor.
> Más simple y más rápido que el loop `while(true)` del chat turista.

---

## 3. Contratos de API

### `POST /api/business/[businessId]/chat`

**Autenticación:** Bearer JWT (Supabase)
**Roles requeridos:** `ENCARGADO_NEGOCIO` o `ADMIN`
**Restricción adicional:** el `businessId` debe pertenecerle al usuario autenticado

**Request body:**
```typescript
interface BusinessChatRequest {
  mensaje: string;                  // pregunta del usuario (max 500 chars)
  historial: ChatMessagePayload[];  // últimos N turnos (vacío en primer mensaje)
}

interface ChatMessagePayload {
  role: 'user' | 'model';
  content: string;
}
```

**Response 200 OK:**
```typescript
interface BusinessChatResponse {
  respuesta: string;         // texto de Gemini (markdown permitido)
  historial_actualizado: ChatMessagePayload[];  // historial con este turno añadido
}
```

**Errores:**
```typescript
// 400 — mensaje vacío o demasiado largo
{ "error": "INVALID_REQUEST", "message": "mensaje requerido (max 500 chars)" }

// 401 — sin token
{ "error": "UNAUTHORIZED", "message": "..." }

// 403 — el negocio no pertenece al usuario
{ "error": "FORBIDDEN", "message": "No tienes acceso a este negocio" }

// 404 — negocio no encontrado
{ "error": "NOT_FOUND", "message": "Negocio no encontrado" }

// 429 — rate limit (opcional, hackathon: omitir)
// 500 — Gemini falló
{ "error": "AI_ERROR", "message": "No se pudo generar respuesta" }
```

---

## 4. System prompt del chat

**Función:** `buildBusinessChatSystemPrompt(ctx: InsightContext, insight: BusinessInsight | null): string`
**Archivo:** `constants/index.ts` (añadir junto a `buildBusinessInsightPrompt`)

### Estructura del prompt

```
Eres MexGo Advisor, un consultor de negocios local especializado en Ciudad de México.
Conoces a fondo el negocio "{nombre}" y su situación actual.
Responde en español, de forma concisa y accionable. Máximo 3 párrafos por respuesta.
No inventes datos que no aparezcan en el contexto.

=== PERFIL DEL NEGOCIO ===
Nombre: {business_name}
Categoría: {category_code}
Alcaldía: {borough}
Estatus SAT: {sat_status}
Descripción: {description}

=== SOLICITUDES DE TURISTAS RECIENTES (zona {borough}) ===
Total últimos 30 días: {N}
Necesidades de accesibilidad frecuentes: {lista}
Motivos de visita más comunes: {lista}

=== SATURACIÓN EN LA ZONA ===
Negocios similares en {borough}: {count}

=== INSIGNIAS DEL NEGOCIO ===
Insignias obtenidas: {lista}
Insignias pendientes: {lista}

=== INFORME IA MÁS RECIENTE (resumen) ===
{insight.resumen | "Sin informe generado todavía"}
Alertas: {lista}
Oportunidades: {lista}
```

> El contexto se construye una sola vez por request usando `buildInsightContext()` ya implementado.
> Si el cache de insight existe (Fase 1), se añade `resumen` y `alertas` al prompt — gratis, sin llamada extra a Gemini.

---

## 5. Archivos a crear / modificar

### Nuevos (3 archivos)

```
lib/business-chat.ts
app/api/business/[businessId]/chat/route.ts
components/business/BusinessChat.tsx
```

### Modificar (1 archivo)

```
constants/index.ts   ← añadir buildBusinessChatSystemPrompt()
```

---

## 6. `lib/business-chat.ts` — contrato

```typescript
import { GoogleGenAI } from '@google/genai';
import { GEMINI_MODEL } from '@/constants';
import type { ChatMessagePayload } from '@/types/types';

export async function businessChat(
  systemPrompt: string,
  historial: ChatMessagePayload[],
  mensaje: string
): Promise<string>
```

**Implementación:**
```typescript
export async function businessChat(
  systemPrompt: string,
  historial: ChatMessagePayload[],
  mensaje: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  const model = ai.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: systemPrompt,
  });

  // Mapear historial al formato de Gemini
  const history = historial.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const chat = model.startChat({ history });
  const result = await chat.sendMessage(mensaje);
  return result.response.text();
}
```

> Sin `while(true)`, sin function calling, sin `responseMimeType: 'application/json'`.
> La respuesta es texto libre (markdown).

---

## 7. `app/api/business/[businessId]/chat/route.ts` — contrato

```typescript
export async function POST(
  req: Request,
  { params }: { params: { businessId: string } }
): Promise<Response>
```

**Flujo:**
1. `getAuthenticatedUser()` → 401 si no hay sesión
2. Validar `businessId` en `business_profiles` donde `owner_user_id = userId` → 403/404
3. Parsear body → validar `mensaje` (non-empty, ≤500) → 400 si falla
4. `buildInsightContext(businessId)` (paralelo con step 5)
5. Leer `business_insights_cache` para ese `businessId` (opcional, enriquece prompt)
6. `buildBusinessChatSystemPrompt(ctx, cachedInsight)`
7. `businessChat(systemPrompt, historial, mensaje)`
8. Devolver `apiOk({ respuesta, historial_actualizado })`

**Manejo de errores:**
- Si `buildInsightContext` falla: usar contexto mínimo (solo datos de `business_profiles`) y continuar
- Si `businessChat` falla: `apiError('AI_ERROR', ..., 500)`

---

## 8. `components/business/BusinessChat.tsx` — UI

### UX: Floating button → Drawer lateral

```
[Dashboard page]
    │
    └── <BusinessChat businessId={id} />
            │
            ├── Estado cerrado: botón flotante azul "💬 Consultar a MexGo AI"
            │                   (fixed, bottom-right)
            │
            └── Estado abierto: panel lateral derecho (slide-in, 400px)
                    ├── Header: "MexGo Advisor" + botón cerrar
                    ├── Área de mensajes (scroll)
                    │     ├── Burbuja usuario (derecha, azul)
                    │     └── Burbuja Gemini (izquierda, gris, markdown)
                    ├── Input text + botón "Enviar"
                    └── Loading state: "MexGo está pensando..."
```

### Props
```typescript
interface BusinessChatProps {
  businessId: string;
}
```

### Estado interno
```typescript
const [open, setOpen] = useState(false);
const [historial, setHistorial] = useState<ChatMessagePayload[]>([]);
const [input, setInput] = useState('');
const [loading, setLoading] = useState(false);
```

### `handleSend()`
```typescript
async function handleSend() {
  if (!input.trim() || loading) return;
  const userMsg = input.trim();
  setInput('');
  setLoading(true);

  // optimistic update
  const optimistic = [...historial, { role: 'user', content: userMsg }];
  setHistorial(optimistic);

  const res = await fetch(`/api/business/${businessId}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mensaje: userMsg, historial }),
  });
  const data = await res.json();
  setHistorial(data.historial_actualizado);
  setLoading(false);
}
```

### Persistencia del historial
- **sessionStorage**: `mxg_chat_{businessId}` — se carga al montar el componente.
- Se actualiza después de cada turno exitoso.
- Se limpia al cerrar sesión (Supabase `signOut`).

### Preguntas de ejemplo (chips en estado inicial)
```
"¿Cuál es mi alerta más urgente?"
"¿Qué curso me conviene tomar primero?"
"¿Cómo puedo mejorar mis ventas esta semana?"
"¿Qué turistas visitan mi zona?"
```
Mostrar chips solo cuando `historial.length === 0`. Click → autoenviar.

---

## 9. Tipos TypeScript necesarios

Verificar que `types/types.ts` ya tenga (fueron añadidos en Fase 2):
- `ChatMessagePayload` — si no existe, añadir:
  ```typescript
  export interface ChatMessagePayload {
    role: 'user' | 'model';
    content: string;
  }
  ```
- `BusinessInsight` — ya existe (Fase 2)
- `InsightContext` — ya existe (Fase 2)

---

## 10. Integración con dashboard

En `app/[locale]/business/dashboard/page.tsx`:

```tsx
import BusinessChat from '@/components/business/BusinessChat';

// al final del JSX, antes del cierre del layout:
<BusinessChat businessId={businessId} />
```

El componente es autónomo — no rompe el layout existente (posición `fixed`).

---

## 11. Sin nuevas tablas SQL

Para el hackathon, el historial de chat vive en **sessionStorage del cliente**.
No se persiste en base de datos.

Ventajas:
- Cero migración nueva
- Cero riesgo de regresión en Supabase
- Suficiente para demo en vivo (la sesión del jurado no expira durante la demo)

Si post-hackathon se quisiera persistir:
```sql
CREATE TABLE business_chat_history (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES business_profiles(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id),
  historial   jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at  timestamptz DEFAULT now()
);
```

---

## 12. Orden de implementación (PASOS_AI_BUSINESS_2.md)

```
FASE A — buildBusinessChatSystemPrompt en constants/index.ts
FASE B — lib/business-chat.ts
FASE C — app/api/business/[businessId]/chat/route.ts
FASE D — components/business/BusinessChat.tsx
FASE E — Integrar BusinessChat en dashboard/page.tsx
```

Cada fase es independiente. La verificación final es:
```bash
npx tsc --noEmit   # sin errores de tipos
npm run build      # build limpio
```
Luego prueba manual: abrir dashboard → click en botón de chat → preguntar "¿cuál es mi alerta más urgente?" → ver respuesta de Gemini.

---

## 13. Talking points para la demo

> Para que el presentador sepa qué decir al jurado durante la demo.

1. **"El negocio no solo recibe un reporte — puede preguntarle a la IA"**
   → Click en el botón flotante del dashboard.

2. **"Pregúntale: ¿qué debería hacer hoy para mejorar mis ventas?"**
   → Gemini responde con datos reales de turistas de la alcaldía.

3. **"Sabe cuántos turistas con silla de ruedas visitaron la zona este mes"**
   → Destaca el cruce de accesibilidad entre turistas y negocios — diferenciador de MexGo.

4. **"Sabe qué insignias le faltan y puede explicar cómo obtenerlas"**
   → Conecta la gamificación de MexGo con la IA de negocio.

5. **"Todo en tiempo real, sin recargar la página"**
   → Slide-in drawer animado, sin navegación.

---

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-08 | Fidel (IA) | v1.0 — Arquitectura completa del chat conversacional para negocios |
