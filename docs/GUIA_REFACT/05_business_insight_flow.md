# Task 05 — Resolver fragilidad del sessionStorage de insight

**Prioridad:** Media  
**Sin dependencias**  
**No requiere Supabase**

## Contexto

El flujo actual entre las páginas de negocio:

```
dashboard/page.tsx
  → genera insight via POST /api/business/[id]/insight
  → guarda en sessionStorage('mexgo_insight')
  → enlaza a /learning y /recomendaciones

learning/page.tsx
  → lee sessionStorage('mexgo_insight') para topCursos

recomendaciones/page.tsx
  → lee sessionStorage('mexgo_insight') para cursos recomendados
```

**Problema:** si el usuario abre `/recomendaciones` directamente (sin pasar por dashboard), `sessionStorage` está vacío. La página queda en loading infinito o vacía sin mostrar error.

## Archivos a leer antes de tocar

1. `app/[locale]/business/dashboard/page.tsx` — donde se genera y guarda el insight
2. `app/[locale]/business/recomendaciones/page.tsx` — donde se consume
3. `app/[locale]/business/learning/page.tsx` — donde también se consume
4. `types/types.ts` — interfaces `BusinessInsight` y `CourseRecommendation`
5. `constants/demo-data.ts` — `DEMO_INSIGHT` disponible como fallback

## Solución — Refetch automático si sessionStorage está vacío

### Patrón a aplicar en `recomendaciones/page.tsx`

Cuando no hay insight en sessionStorage, la página debe pedirlo directamente a la API en lugar de quedarse vacía.

Lee el archivo actual y localiza el `useEffect` que lee `sessionStorage`. Modifícalo siguiendo este patrón:

```ts
import { getStoredAccessToken } from '@/lib/client-auth'
import type { BusinessInsight } from '@/types/types'

// En el componente:
const [insight, setInsight] = useState<BusinessInsight | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(false)

useEffect(() => {
  // Intentar leer del sessionStorage primero (fast path)
  const cached = sessionStorage.getItem('mexgo_insight')
  if (cached) {
    try {
      setInsight(JSON.parse(cached) as BusinessInsight)
      setLoading(false)
      return
    } catch { /* ignorar */ }
  }

  // Fallback: pedir el insight a la API
  const token = getStoredAccessToken()
  if (!token) {
    setError(true)
    setLoading(false)
    return
  }

  // Primero obtener el businessId del usuario
  fetch('/api/businesses/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => r.json())
    .then(async (bizResult) => {
      if (!bizResult.ok) throw new Error('No se pudo obtener negocio')
      const businessId = bizResult.data.businessId as string

      const res = await fetch(`/api/business/${businessId}/insight`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
      })
      const result = await res.json()
      if (!result.ok) throw new Error('No se pudo generar insight')

      sessionStorage.setItem('mexgo_insight', JSON.stringify(result.data))
      setInsight(result.data as BusinessInsight)
    })
    .catch(() => setError(true))
    .finally(() => setLoading(false))
}, [])
```

> **Nota:** `POST /api/business/[businessId]/insight` puede tardar varios segundos porque llama a Gemini. Muestra un spinner durante `loading === true`.

### Estado de error

Cuando `error === true`, muestra un mensaje claro en lugar de pantalla vacía:

```tsx
if (error) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <p className="text-gray-500 text-sm font-medium text-center">
        No se pudo cargar el análisis. Ve al{' '}
        <a href="/business/dashboard" className="text-[var(--primary)] font-bold hover:underline">
          Dashboard
        </a>{' '}
        para generarlo.
      </p>
    </div>
  )
}
```

### Aplicar el mismo patrón en `learning/page.tsx`

`learning/page.tsx` también lee `sessionStorage('mexgo_insight')` para `topCursos`. Aplica el mismo patrón de fallback solo para esa parte. La sección de módulos de aprendizaje tiene su propia API (`/api/learning/modules`) y no depende del sessionStorage — no la toques.

El fallback en learning es más simple porque `topCursos` es opcional (si está vacío, simplemente no muestra la sección de "Cursos recomendados por IA"):

```ts
useEffect(() => {
  const cached = sessionStorage.getItem('mexgo_insight')
  if (!cached) return // OK: sección simplemente no aparece

  try {
    const parsed = JSON.parse(cached) as BusinessInsight
    setTopCursos(parsed.cursos_recomendados ?? [])
  } catch { /* ignore */ }
}, [])
```

## Estado de loading

Para el spinner, usa el mismo patrón del dashboard:

```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-[var(--primary)]/30 border-t-[var(--primary)] rounded-full animate-spin" />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Generando análisis...
        </p>
      </div>
    </div>
  )
}
```

## Lo que NO hacer

- No cambies la lógica del dashboard para que no guarde en sessionStorage — esa parte está bien y sirve como caché
- No uses `localStorage` para el insight — `sessionStorage` es intencional (se limpia al cerrar el tab, forzando refresh de datos)
- No hagas el fetch del insight en un `layout.tsx` compartido — mantén la carga por página
- No elimines el check de `sessionStorage` como fast path — es importante para no llamar a Gemini en cada render

## Verificación

1. Navegar a `/business/recomendaciones` directamente sin pasar por dashboard → debe mostrar spinner → luego cargar el insight
2. Navegar a `/business/dashboard` → generar insight → navegar a `/business/recomendaciones` → debe cargar instantáneamente desde sessionStorage
3. `npm run build` sin errores
