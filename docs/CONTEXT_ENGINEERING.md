# MexGo - Context Engineering
**Los Mossitos · Genius Arena 2026**

Guia para trabajar con IA en este repo sin romper decisiones tecnicas.

## 1. Contexto minimo para cualquier sesion
Pegar esto al iniciar:

```text
Proyecto: MexGo (Coppel Emprende).
Objetivo actual: profesionalizacion visible del negocio via insignias publicas y directorio.
Regla de continuidad: el modulo turista actual se conserva.
Stack: Next.js App Router + API Routes, Supabase, TypeScript, Gemini.
Patron: monolito modular con mentalidad BFF.
Backend: cambios incrementales, no reescritura.
Docs fuente: DOCUMENTO.md, ARQUITECTURA.md, API.md, SCHEMA.md.
```

## 2. Contexto por dominio
### business
```text
Dominio: perfiles de negocio y equipo operativo.
Tablas clave: business_profiles, business_team_members.
```

### learning
```text
Dominio: catalogo de modulos y completitud.
Tablas clave: learning_modules, learning_completions.
```

### badges
```text
Dominio: reglas y otorgamiento de insignias.
Tablas clave: badge_definitions, badge_requirements, business_badges.
```

### directory
```text
Dominio: exposicion publica del negocio.
Tablas clave: directory_profiles, directory_events.
```

### tourist
```text
Dominio estable. No cambiar contratos existentes en esta fase.
Rutas vigentes: /api/auth/register, /api/auth/oauth/start, /api/tourist/profile.
```

## 3. Que pedirle a la IA
Si:
- Actualizar docs de contrato cuando cambia un endpoint.
- Proponer migraciones aditivas sin borrar tablas activas.
- Generar validaciones RBAC por rol.
- Revisar consistencia entre schema y API.

No:
- Redisenar arquitectura completa.
- Romper endpoints actuales de turista.
- Mover logica de negocio al cliente.

## 4. Reglas para salida de IA
- Responder con cambios concretos.
- Mantener estilo corto y verificable.
- Si cambia API o schema, actualizar docs correspondientes.
- Incluir fecha y autor en seccion de cambios.

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-07 | Alan | v2.0 - Context engineering alineado a negocio, insignias y directorio. |
