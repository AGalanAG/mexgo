# MexGo - Documento raiz
**Los Mossitos · Genius Arena 2026 · Fundacion Coppel**

## Estado actual
Este documento oficializa el cambio de enfoque: se mantiene la experiencia turista ya definida y se prioriza el modulo de negocio para profesionalizacion visible.

## Contexto del reto
Coppel Emprende es una plataforma gratuita de capacitacion para MiPyMEs. El nuevo objetivo de MexGo es extender ese valor a todo el equipo del negocio (duenos y empleados) y convertir la capacitacion en una senal publica de confianza para atraer clientes y conexiones B2B.

## Tesis del producto
El aprendizaje no debe quedarse dentro del negocio.
Debe mostrarse publicamente como reputacion verificable.

## Alcance funcional v2
### Se conserva sin cambios de producto
- Flujo turista ya existente.
- Registro y perfil turista.
- Base de endpoints actuales en `app/api/auth/*` y `app/api/tourist/profile`.

### Nuevo foco principal
- Registro y gestion del negocio con equipo de trabajo.
- Catalogo de modulos de aprendizaje (contenido externo curado).
- Evidencia de completitud (quiz corto y/o validacion).
- Motor de insignias publicas por negocio.
- Directorio publico para atraccion de clientes y descubrimiento B2B.

## Principios tecnicos
- Sin cambios en frontend actual del turista.
- Backend incremental: extender, no reescribir.
- Reusar RBAC y estructura API Route existente.
- Mantener contratos estables donde ya hay consumo.

## Modulos de dominio vigentes
- `tourist` (estable)
- `business` (alta y perfil)
- `learning` (modulos y completitud)
- `badges` (reglas y asignacion)
- `directory` (perfil publico y busqueda)

## Documentos de referencia
- Arquitectura: `ARQUITECTURA.md`
- Contratos API: `API.md`
- Base de datos: `SCHEMA.md` y `TABLAS.md`
- Flujo de trabajo: `FLUJO.md`
- Vision y narrativa de producto: `PROPUESTAS.md`

## Decisiones cerradas
- -> Patrón tecnico se mantiene: monolito modular + BFF en Next.js.
- -> Turista no se toca en esta fase.
- -> Nuevo KPI principal: negocios con insignias publicas activas.
- -> El backend se modifica por extension de dominios, no por reemplazo.
- -> El directorio publico sera la superficie principal de atraccion.

## Pendientes inmediatos
- ? Definir reglas exactas de otorgamiento por insignia (version 1).
- ? Definir moderacion de evidencia y anti-fraude basico.
- ? Cerrar campos del perfil publico del negocio para lanzamiento.

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-07 | Alan | v2.0 - Cambio de enfoque a negocio, insignias y directorio publico. |
