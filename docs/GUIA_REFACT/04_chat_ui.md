# Task 04 — Pulir ChatUI: estilos + negociosRecomendados

**Prioridad:** Media  
**Sin dependencias**  
**No requiere Supabase**

## Contexto

`components/tourist/ChatUI.tsx` tiene dos issues independientes:

1. **Estilos** no coinciden con `components/business/BusinessChat.tsx` — inconsistencia visual
2. **`negociosRecomendados`** llega en la respuesta de Gemini pero nunca se renderiza

## Archivos a leer antes de tocar

1. `components/tourist/ChatUI.tsx` — estado actual
2. `components/business/BusinessChat.tsx` — referencia visual a igualar
3. `types/types.ts` — interfaces `ChatResponse` y `NegocioConScore`

---

## Parte A — Estilos

### Qué cambiar en `ChatUI.tsx`

Inspecciona `BusinessChat.tsx` y aplica los mismos patrones visuales. Puntos específicos:

**Header:** el de `BusinessChat` usa gradiente oscuro y tiene ícono del bot con fondo translúcido.
Reemplaza el `<div className="px-7 py-5 ...">` del header por el mismo patrón:

```tsx
<div className="px-6 py-4 flex items-center gap-3 shrink-0"
  style={{ background: 'linear-gradient(135deg, var(--dark-blue) 0%, var(--primary) 100%)' }}
>
  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 backdrop-blur-sm">
    <SmartToyIcon sx={{ fontSize: 22 }} className="text-white" />
  </div>
  <div>
    <h2 className="font-black text-white text-sm leading-tight">MexGo Asistente</h2>
    <p className="text-white/50 text-[11px] font-medium">Tu guía turístico con IA</p>
  </div>
  <div className="ml-auto flex items-center gap-2">
    {mensajes.length > 0 && (
      <button onClick={limpiarChat} title="Limpiar chat"
        className="text-white/30 hover:text-red-400 text-xs font-bold transition-colors">
        Limpiar
      </button>
    )}
  </div>
</div>
```

**Burbujas de mensajes:** añade `font-medium` a los mensajes del modelo, y sombra sutil. El usuario mantiene `bg-[var(--primary)]`:

```tsx
className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
  m.role === 'user'
    ? 'bg-[var(--primary)] text-white rounded-br-sm font-medium'
    : m.error
    ? 'bg-red-50 text-red-600 border border-red-200 rounded-bl-sm'
    : 'bg-white border border-gray-100 text-gray-700 rounded-bl-sm shadow-sm font-medium'
}`}
```

**Input area:** añade un borde superior más limpio:

```tsx
<div className="px-4 py-3 border-t border-gray-100/80 bg-white flex gap-2 shrink-0">
```

**Suggestion pills:** estilo más limpio con `border-[var(--primary)]/20`:

```tsx
className="text-left text-xs font-semibold text-[var(--primary)] bg-[var(--primary)]/5 border border-[var(--primary)]/20 rounded-xl px-3 py-2.5 hover:bg-[var(--primary)]/10 transition-colors"
```

---

## Parte B — Renderizar `negociosRecomendados`

### Qué hace Gemini

Cuando el turista pregunta por lugares, Gemini puede devolver:
```ts
ChatResponse.negociosRecomendados?: NegocioConScore[]
```

`NegocioConScore` extiende `BusinessProfile` con `score`, `reasons`, y `estimatedWalkMinutes`.

### Cambios en `ChatUI.tsx`

**1. Agregar `negociosRecomendados` al tipo `RichMessage`:**

```ts
type RichMessage = ChatMessagePayload & {
  eventoAgregado?:   ItineraryStop
  eventoEditado?:    ItineraryStop
  eventoEliminado?:  { id: string; label?: string; eliminado: boolean }
  negociosRecomendados?: import('@/types/types').NegocioConScore[]
  error?: boolean
}
```

**2. Capturar el campo al recibir la respuesta:**

En `enviarMensaje()`, donde se construye `msgModelo`:

```ts
const msgModelo: RichMessage = {
  role:                 'model',
  text:                 data.respuesta,
  eventoAgregado:       data.eventoAgregado,
  eventoEditado:        data.eventoEditado,
  eventoEliminado:      data.eventoEliminado,
  negociosRecomendados: data.negociosRecomendados,  // ← agregar esta línea
}
```

**3. Renderizar las tarjetas después de la burbuja del modelo:**

Agrega esto justo después del bloque `{/* Card evento eliminado */}`:

```tsx
{/* Tarjetas de negocios recomendados */}
{m.negociosRecomendados && m.negociosRecomendados.length > 0 && (
  <div className="w-full max-w-sm space-y-2">
    {m.negociosRecomendados.slice(0, 3).map((negocio) => (
      <Link
        key={negocio.id}
        href={`/discover/${negocio.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 hover:shadow-md hover:border-[var(--primary)]/30 transition-all group shadow-sm"
      >
        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center shrink-0 text-lg">
          🏪
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[var(--primary)] truncate">{negocio.businessName}</p>
          <p className="text-xs text-gray-400 truncate">{negocio.neighborhood}, {negocio.boroughCode}</p>
          {negocio.estimatedWalkMinutes && (
            <p className="text-[10px] text-gray-400 font-medium">🚶 {negocio.estimatedWalkMinutes} min</p>
          )}
        </div>
        <span className="text-[var(--primary)] text-xs font-bold shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          Ver →
        </span>
      </Link>
    ))}
  </div>
)}
```

> Solo muestra máximo 3 negocios con `.slice(0, 3)`. Si Gemini devuelve más, no los renderices todos o la UI se llena.

## Lo que NO hacer

- No uses colores hardcoded como `#1e3a8a` — usa siempre `var(--primary)`, `var(--dark-blue)`, etc.
- No importes `NegocioConScore` directamente en el tipo inline — usa `import('@/types/types').NegocioConScore` o agrégalo al import del top del archivo
- No cambies la lógica de sincronización del itinerario (`sincronizarItinerario`) — solo cambia lo visual y la captura del campo

## Verificación

1. `npm run build` sin errores TypeScript
2. Abrir el chat turista — el header debe verse con gradiente oscuro
3. Escribir "recomiéndame taquerías en Coyoacán" — si Gemini devuelve negocios, deben aparecer tarjetas azules debajo de la respuesta
