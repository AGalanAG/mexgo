# MexGo - Stack (vigente)
**Los Mossitos · Genius Arena 2026**

## Stack confirmado
| Capa | Tecnologia |
|---|---|
| Framework | Next.js (App Router) |
| Backend BFF | Next.js API Routes |
| Base de datos | Supabase PostgreSQL |
| Auth | Supabase Auth |
| IA | Gemini 2.5 Flash |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind CSS |

## Lineamientos
- Backend incremental: extender rutas y tablas actuales.
- Modulo turista se conserva en esta fase.
- Nuevos dominios: business, learning, badges, directory.
- Sin exponer secretos en variables `NEXT_PUBLIC_`.

## Variables de entorno clave
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-07 | Alan | v2.0 - Stack documentado para extension de negocio sin romper turista. |
