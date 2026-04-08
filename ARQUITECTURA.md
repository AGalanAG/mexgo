# MexGo - Arquitectura (v2 negocio)
**Los Mossitos · Genius Arena 2026**

## Decision principal
Se mantiene la arquitectura elegida:
**monolito modular con mentalidad BFF usando Next.js API Routes**.

No se rediseña frontend turista.
Se extiende backend por dominios nuevos de negocio.

## Dominios del sistema
- `tourist`: estable, sin cambios funcionales en esta fase.
- `business`: perfil del negocio y administracion basica.
- `learning`: catalogo de modulos, asignacion y completitud.
- `badges`: reglas, evaluacion y otorgamiento de insignias.
- `directory`: perfil publico y descubrimiento.

## Componentes actuales y extension
### Ya existente
- `app/api/auth/register/route.ts`
- `app/api/auth/oauth/start/route.ts`
- `app/api/tourist/profile/route.ts`
- `lib/supabase.ts`, `lib/auth-helpers.ts`, `lib/api-response.ts`

### Nuevos grupos API (incrementales)
- `app/api/businesses/*`
- `app/api/learning/*`
- `app/api/badges/*`
- `app/api/directory/*` (publico)

## Principios de implementacion
- Reusar autenticacion y RBAC existente.
- Mantener respuesta estandar `apiOk` / `apiError`.
- Evitar migraciones destructivas.
- Introducir tablas nuevas y relaciones explicitas.
- Preservar compatibilidad con rutas actuales de turista.

## Flujo de datos de negocio
1. Negocio se registra y crea perfil.
2. Dueno invita empleados o registra miembros operativos.
3. Miembro completa modulo y prueba.
4. Se guarda completitud validada.
5. Motor de reglas evalua insignias elegibles.
6. Insignias activas se publican en directorio.

## Arquitectura logica (capas)
- UI actual (sin cambios de turista)
- API Routes (BFF)
- Servicios de dominio en `lib/` (business/learning/badges/directory)
- Supabase PostgreSQL (estado transaccional)

## Estrategia de cambios minimos en backend
1. No tocar contratos existentes de turista.
2. Agregar tablas de negocio y aprendizaje sin romper las actuales.
3. Implementar endpoints nuevos por dominio con control RBAC.
4. Exponer solo un endpoint publico de directorio para lectura.

## Seguridad y control
- Claims + tabla `user_roles` para autorizacion.
- Escritura restringida por propiedad de negocio.
- Auditoria en otorgamiento/revocacion de insignias.
- Directorio publico solo lectura y sin datos personales sensibles.

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-07 | Alan | v2.0 - Arquitectura adaptada a foco negocio con cambios incrementales de backend. |
