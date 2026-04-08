# MexGo - Roles
**Los Mossitos · Genius Arena 2026**

## 1. Roles de producto (plataforma)
| Rol | Objetivo | Permisos clave |
|---|---|---|
| Turista | Consumir experiencia turistica | Perfil y acciones turisticas ya existentes |
| EncargadoDelNegocio | Profesionalizar su negocio | Gestion de perfil, equipo, seguimiento de modulos |
| EmpleadoDelNegocio | Capacitarse operativamente | Completar modulos asignados y evidencias |
| Admin | Gobernanza del sistema | Catalogos, validaciones, auditoria |
| SuperAdmin | Operacion tecnica | Soporte, monitoreo, remediacion |

## 2. Responsabilidades del equipo de desarrollo
| Quien | Responsabilidad principal |
|---|---|
| Fidel | Arquitectura, IA, integracion de dominios y estrategia de despliegue |
| Alan | Backend, schema SQL, RBAC y endpoints de negocio |
| Emi | Frontend turista (se mantiene), futura integracion visual de directorio |
| Farid | Frontend negocio/admin cuando se active en UI |
| Xavier | QA de contratos, pruebas end-to-end y validacion funcional |

## 3. Reglas de coordinacion
- No romper endpoints de turista ya integrados.
- Cualquier cambio de contrato requiere actualizar `API.md`.
- Cualquier cambio de datos requiere actualizar `SCHEMA.md` y `TABLAS.md`.
- QA valida primero flujo de negocio antes de habilitar UI adicional.

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-07 | Alan | v2.0 - Se incorpora rol EmpleadoDelNegocio y enfoque operativo de profesionalizacion. |
