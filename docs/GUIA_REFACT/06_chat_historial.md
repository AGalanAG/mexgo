# Task 06 — Limitar crecimiento del historial de chat

**Prioridad:** Baja  
**Sin dependencias**  
**No requiere Supabase**

## Contexto

`ChatUI.tsx` mantiene el historial completo de la conversación en memoria y lo envía en cada request:

```ts
body: JSON.stringify({
  mensaje,
  historial,    // ← crece sin límite
  perfil: ...,
  itinerario: ...,
})
```

Con conversaciones largas esto puede:
- Exceder el límite de contexto de Gemini Flash (~1M tokens, en la práctica el request HTTP se vuelve muy pesado)
- Aumentar el tiempo de respuesta
- Hacer que el localStorage exceda 5MB

## Archivo a modificar

`components/tourist/ChatUI.tsx`

## Solución — Ventana deslizante de historial

Aplica una ventana de los últimos N mensajes antes de enviar. El historial completo se sigue guardando en localStorage para mostrar en la UI, pero solo se envía la cola reciente a la API.

### Constante

Agrega cerca de las otras constantes al top del archivo:

```ts
const MAX_HISTORIAL_API = 20  // máximo de mensajes que se envían a Gemini (10 turnos)
```

### En `enviarMensaje()`

Localiza donde se construye el `body` del fetch. Cambia `historial` por una ventana:

```ts
// Antes:
body: JSON.stringify({
  mensaje,
  historial,
  perfil: toGeminiProfile(leerPerfil()),
  itinerario: leerItinerario(),
})

// Después:
const historialReciente = historial.slice(-MAX_HISTORIAL_API)

body: JSON.stringify({
  mensaje,
  historial: historialReciente,
  perfil: toGeminiProfile(leerPerfil()),
  itinerario: leerItinerario(),
})
```

> `.slice(-20)` devuelve los últimos 20 elementos sin mutar el array original.

### Limitar lo que se guarda en localStorage

El `historial` que se persiste en localStorage puede seguir siendo completo (para mostrar todos los mensajes en la UI). Pero si quieres limitar el tamaño del localStorage también:

```ts
// En el setMensajes callback donde se hace localStorage.setItem:
const historialParaGuardar = nuevoHistorialFinal.slice(-100) // últimos 100 mensajes
localStorage.setItem(CHAT_LS_KEY, JSON.stringify({
  historial: historialParaGuardar,
  mensajes: nuevos.slice(-100),
}))
```

> 100 mensajes es suficiente para UX; 20 es suficiente para contexto de Gemini.

## Lo que NO hacer

- No cambies `nuevoHistorialFinal` — ese es el historial completo para el estado de React y localStorage
- No truncas `mensajes` (los que se renderizan) — el usuario debe ver toda la conversación
- No cambies nada en `app/api/chat/route.ts` — el backend ya acepta un array de cualquier tamaño
- No pongas el `slice` en el estado de React `historial` — solo en el payload del fetch

## Verificación

1. `npm run build` sin errores
2. Tener una conversación de más de 10 mensajes — la UI debe mostrarlos todos
3. Verificar en DevTools > Network que el payload del request a `/api/chat` no tiene más de `MAX_HISTORIAL_API` mensajes en `historial`
