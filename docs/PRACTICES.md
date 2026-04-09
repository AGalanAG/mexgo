# PRACTICES — Errores y convenciones del agente
**MexGo · Los Mossitos · Genius Arena 2026**

Registro vivo de errores cometidos por el agente durante la implementacion,
convenciones que no estaban documentadas y correcciones aplicadas.
Se actualiza al terminar cada fase de `PASOS_AI_BUSINESS.md`.

---

## Formato de entrada

```
### FASE X — [nombre]
**Estado:** OK / ERROR CORREGIDO / PENDIENTE
**Archivos revisados:** lista
**Errores encontrados:** descripcion
**Correccion aplicada:** que se hizo
**Convencion aprendida:** regla para futuras fases
```

---

## FASE 1 — Migracion SQL `0005_business_insights_cache`

**Estado:** ERROR CORREGIDO

**Archivos revisados:**
- `supabase/migrations/0005_business_insights_cache.sql` ← creado por el agente
- `supabase/validation/` ← NO revisado por el agente inicialmente

**Errores encontrados:**

**Error #1 — Smoke test faltante**
El agente creó `supabase/migrations/0005_business_insights_cache.sql` correctamente
pero no creó el archivo de smoke test correspondiente en `supabase/validation/`.

Patron que el agente no detectó:
```
supabase/migrations/0001_*.sql  →  supabase/validation/0001_*_smoke_test.sql
supabase/migrations/0002_*.sql  →  supabase/validation/0002_*_smoke_test.sql
supabase/migrations/0003_*.sql  →  supabase/validation/0003_*_smoke_test.sql
supabase/migrations/0004_*.sql  →  supabase/validation/0004_*_smoke_test.sql
supabase/migrations/0005_*.sql  →  supabase/validation/0005_*_smoke_test.sql  ← faltaba
```

**Correccion aplicada:**
El humano (Fidel) creó `supabase/validation/0005_business_insights_cache_smoke_test.sql`.
El agente aprendió a crear siempre el smoke test espejo en `supabase/validation/`.

---

## FASE 2 — Tipos TypeScript

**Estado:** OK

**Archivos revisados:**
- `types/types.ts`

**Correccion aplicada:**
Tipos para `BusinessInsight`, `InsightContext`, `ModuloCatalogo`, etc., agregados al final del archivo.
Verificación con `npx tsc --noEmit`. (Los errores en `.next` se ignoran por ser pre-existentes de la estructura `[locale]`).

---

## FASE 3 — Ranker deterministico

**Estado:** OK

**Archivos revisados:**
- `lib/course-recommender.ts` ← creado
- `lib/equity.ts` ← referencia

**Correccion aplicada:**
Implementado scoring local basado en insignias pendientes, estatus SAT, accesibilidad y motivos de turistas.

---

## FASE 5 — Core IA `lib/business-insight.ts`

**Estado:** OK

**Archivos revisados:**
- `lib/business-insight.ts` ← creado
- `lib/supabase.ts` ← referencia
- `lib/gemini.ts` ← referencia

**Correccion aplicada:**
Implementado `buildInsightContext` para recopilar datos de 7 fuentes paralelas de Supabase y `geminiGenerateInsight` para interactuar con Gemini 2.5 Flash.

---

## FASE 4 — Prompt Gemini

**Estado:** OK

**Archivos revisados:**
- `constants/index.ts`

**Correccion aplicada:**
Agregada función `buildBusinessInsightPrompt` con contexto estructurado del negocio y su zona.

---

## FASE 6 — API Route

**Estado:** OK

**Archivos revisados:**
- `app/api/business/[businessId]/insight/route.ts` ← creado

**Correccion aplicada:**
Implementado GET con soporte de TTL (6h), invalidación de cache y manejo de errores (gracious fallback a stale cache si Gemini falla).

---

## FASE 7 — Dashboard

**Estado:** OK

**Archivos revisados:**
- `app/[locale]/business/dashboard/page.tsx`
- `app/[locale]/business/learning/page.tsx`

**Errores encontrados:**
Uso de `as any` en `learning/page.tsx`.

**Correccion aplicada:**
Reemplazado MOCK con fetch real a `/api/businesses/me` y luego `/api/business/[id]/insight`.
Fix de tipos en `Course` interface para evitar `any`.
Agregada persistencia en `sessionStorage` para sincronizar insights entre Dashboard y Learning.

---

## Convenciones Aprendidas

1. **Smoke test obligatorio:** Cada migración SQL debe tener su archivo de validación en `supabase/validation/`.
2. **Sin 'any':** Prohibido usar `any` en TypeScript. Usar interfaces o tipos de `types/types.ts`.
3. **Persistencia local:** Usar `sessionStorage` para puentear datos IA entre páginas si no hay estado global (Zustand/Redux).

---

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-08 | Fidel (IA) | v1.1 — Fases 2-7 completadas y documentadas. Fix de tipos en Learning. |
