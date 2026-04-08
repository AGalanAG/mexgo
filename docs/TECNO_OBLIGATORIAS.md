# MexGo - Tecnologias y reglas obligatorias
**Los Mossitos · Genius Arena 2026**

## 1) Entorno
- Node LTS y npm.
- VS Code con ESLint + Prettier.
- Supabase configurado para entorno local/remoto.

## 2) Git
- Prohibido push directo a `main`.
- Commits pequenos y por dominio.
- Pull frecuente para evitar drift de contratos.

## 3) Reglas de arquitectura
- Frontend no accede directo a secretos ni service role.
- Integracion por API Routes (`/api/*`).
- Cambios en backend deben ser incrementales.
- Modulo turista actual no se rompe en esta fase.

## 4) Reglas de documentacion
- Si cambia endpoint: actualizar `API.md`.
- Si cambia tabla o enum: actualizar `SCHEMA.md` y `TABLAS.md`.
- Si cambia decision de alto nivel: actualizar `DOCUMENTO.md` y `ARQUITECTURA.md`.

## 5) Seguridad
- Nunca exponer `SUPABASE_SERVICE_ROLE_KEY` ni `GEMINI_API_KEY` al cliente.
- Revisar validaciones de rol en cada endpoint nuevo.

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-07 | Alan | v2.0 - Reglas obligatorias alineadas al enfoque negocio y cambios incrementales. |
