# PASOS_AI_BUSINESS_2 — Chat Conversacional para Propietarios
**MexGo · Los Mossitos · Genius Arena 2026**

> Guía ejecutable para Gemini CLI.
> Arquitectura en `IA_BUSINESS_2.md`. Convenciones en `PRACTICES.md`.
> Lee ambos antes de empezar.

---

## Antes de comenzar

Archivos de referencia obligatoria — léelos antes de cada fase:

| Archivo | Por qué |
|---|---|
| `lib/gemini.ts` | Cómo se instancia `GoogleGenAI` en este proyecto |
| `lib/business-insight.ts` | `buildInsightContext()` que reutilizarás |
| `app/api/business/[businessId]/insight/route.ts` | Patrón de auth + ownership que debes replicar |
| `lib/auth-helpers.ts` | `getAuthenticatedUser()`, `userHasAnyRole()` |
| `lib/api-response.ts` | `apiOk()`, `apiError()` |
| `constants/index.ts` | Dónde añadir `buildBusinessChatSystemPrompt()` |
| `types/types.ts` | Tipos existentes — no dupliques |

---

## FASE A — System prompt del chat

**Archivo a modificar:** `constants/index.ts`

Añade la función `buildBusinessChatSystemPrompt(ctx: InsightContext, insight: BusinessInsight | null): string` al final del archivo, junto a `buildBusinessInsightPrompt`.

**Qué debe incluir el prompt:**
- Rol del asistente: consultor de negocios local, Ciudad de México, respuestas concisas (máx 3 párrafos)
- Sección PERFIL DEL NEGOCIO: `business_name`, `category_code`, `borough`, `sat_status`, `description`
- Sección TURISTAS EN LA ZONA: total, `accessibility_needs` frecuentes, motivos de visita
- Sección SATURACIÓN: conteo de negocios similares en la alcaldía
- Sección INSIGNIAS: obtenidas vs pendientes
- Sección INFORME IA (si `insight !== null`): `resumen`, `alertas`, `oportunidades` — en texto plano, no JSON

**Regla:** si un campo del contexto está vacío o `null`, el prompt debe decir "Sin datos disponibles" en esa sección — nunca omitir la sección.

**Verificación:** `npx tsc --noEmit` sin errores nuevos.

---

## FASE B — lib/business-chat.ts

**Archivo a crear:** `lib/business-chat.ts`

**Qué hace:** recibe `systemPrompt`, `historial: ChatMessagePayload[]` y `mensaje: string` → devuelve `Promise<string>` con la respuesta de Gemini.

**Patrón a seguir:** instanciación igual que `lib/gemini.ts` (`GoogleGenAI`, `GEMINI_MODEL` de constants).

**Diferencia clave vs `lib/gemini.ts`:** aquí usas `model.startChat({ history, systemInstruction })` y un solo `chat.sendMessage(mensaje)`. Sin loop, sin function calling, sin `responseMimeType`.

El `history` que pasas a `startChat` es el `historial` mapeado al formato de Gemini: `{ role, parts: [{ text }] }`.

**Verificación:** `npx tsc --noEmit` sin errores nuevos.

---

## FASE C — API Route

**Archivo a crear:** `app/api/business/[businessId]/chat/route.ts`

**Exporta:** `POST` handler.

**Flujo exacto:**
1. Auth con `getAuthenticatedUser()` → 401 si falla
2. Verificar que `business_profiles` donde `id = businessId` AND `owner_user_id = userId` exista → 403/404 según corresponda
3. Parsear body: `{ mensaje: string, historial: ChatMessagePayload[] }` → validar que `mensaje` sea string no vacío, máx 500 chars → 400 si falla
4. En paralelo (`Promise.all`): llamar `buildInsightContext(businessId)` y leer `business_insights_cache` para ese `businessId`
5. Construir `buildBusinessChatSystemPrompt(ctx, cachedInsight)`
6. Llamar `businessChat(systemPrompt, historial, mensaje)`
7. Devolver `apiOk({ respuesta, historial_actualizado })` donde `historial_actualizado` es `[...historial, { role: 'user', content: mensaje }, { role: 'model', content: respuesta }]`

**Manejo de error en step 4:** si `buildInsightContext` lanza, captura la excepción, usa un contexto mínimo (solo los datos de `business_profiles` ya obtenidos en step 2) y continúa — no falles el request por esto.

**Manejo de error en step 6:** si `businessChat` lanza, devuelve `apiError('AI_ERROR', 'No se pudo generar respuesta', 500)`.

**Verificación:** `npx tsc --noEmit` + `npm run build` sin errores.

---

## FASE D — Componente BusinessChat

**Archivo a crear:** `components/business/BusinessChat.tsx`

**Props:** `{ businessId: string }`

**Comportamiento:**
- Estado cerrado: botón flotante fijo `bottom-6 right-6`, estilo primario del proyecto
- Estado abierto: panel lateral derecho, ancho fijo (~380-400px), alto completo de pantalla, con animación slide-in
- El panel tiene: header con título + botón cerrar, área de mensajes scrolleable, input + botón enviar
- Burbujas: usuario a la derecha (color primario), Gemini a la izquierda (gris neutro)
- Estado de carga: texto "MexGo está pensando..." mientras espera respuesta

**Chips de inicio:** cuando `historial.length === 0`, mostrar 4 chips de pregunta rápida (ver `IA_BUSINESS_2.md` sección 8). Click en chip → envía ese mensaje automáticamente.

**Persistencia:** al montar, leer `sessionStorage.getItem('mxg_chat_' + businessId)` y parsear como `ChatMessagePayload[]`. Después de cada turno exitoso, guardar el historial actualizado en la misma key.

**Fetch:** `POST /api/business/${businessId}/chat` con `{ mensaje, historial }`. Usa el historial *antes* del optimistic update — el backend devuelve `historial_actualizado` que incluye los dos nuevos turnos.

**Optimistic update:** agregar el mensaje del usuario a la UI antes de recibir la respuesta. Reemplazar con `historial_actualizado` cuando llegue la respuesta.

**Verificación:** `npx tsc --noEmit` sin errores. No uses `any`.

---

## FASE E — Integración en dashboard

**Archivo a modificar:** `app/[locale]/business/dashboard/page.tsx`

Importa `BusinessChat` y añádelo al final del JSX del componente, antes del cierre del layout principal. Pásale el `businessId` que ya usa la página para fetch del insight.

El componente es `position: fixed` — no afecta el flujo del layout.

**Verificación final:**
```bash
npx tsc --noEmit
npm run build
```

Prueba manual: abrir dashboard → botón flotante visible → click → panel abre → chip "¿Cuál es mi alerta más urgente?" → Gemini responde → cerrar → reabrir → historial persiste.

---

## STOP points

Detente y reporta si encuentras:

- `ChatMessagePayload` no existe en `types/types.ts` → añádelo tú mismo, no continúes sin él
- `buildInsightContext` devuelve un tipo que no encaja con `InsightContext` → revisa `types/types.ts` y alinea
- El build falla por algo en `.next/` → ignora, son artefactos pre-existentes de `[locale]`
- Cualquier `as any` que hayas escrito → reemplázalo antes de continuar a la siguiente fase

---

## Convenciones del proyecto (no negociables)

1. Sin `any` — usar interfaces de `types/types.ts`
2. Auth siempre con `getAuthenticatedUser()` de `lib/auth-helpers.ts`
3. Respuestas API siempre con `apiOk()` / `apiError()` de `lib/api-response.ts`
4. Variables de entorno solo en server-side — nunca `NEXT_PUBLIC_` para claves de IA
5. Estilos con Tailwind v4 — no CSS inline
