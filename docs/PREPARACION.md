# MexGo - Preparacion por rol (v2)
**Los Mossitos · Genius Arena 2026**

Objetivo de preparacion: acelerar implementacion del modulo negocio sin tocar flujo turista actual.

## Fidel (arquitectura e IA)
- Mantener patron BFF en API Routes.
- Definir estrategia de recalc de insignias.
- Revisar integraciones externas para aprendizaje (fuentes de contenido).

Mini proyecto:
- Servicio interno que reciba completitud de modulo y devuelva estado de insignias candidatas.

## Alan (backend y datos)
- Diseñar migraciones aditivas para schema v2.
- Implementar endpoints de negocio, learning, badges y directory.
- Garantizar RBAC por rol y auditoria de eventos de insignias.

Mini proyecto:
- Pipeline funcional: crear negocio -> registrar completitud -> recalcular insignia -> exponer en directorio.

## Emi (frontend turista + futura integracion)
- Mantener estable experiencia turista actual.
- Preparar componentes reutilizables para mostrar insignias cuando se habilite UI de negocio/directorio.

Mini proyecto:
- Card reutilizable de insignias publicas consumiendo un endpoint mock.

## Farid (frontend negocio/admin)
- Preparar vistas de gestion de equipo y progreso de modulos.
- Construir panel de insignias por negocio para usuario encargado.

Mini proyecto:
- Dashboard basico con tres tabs: equipo, aprendizaje, insignias.

## Xavier (QA)
- Validar contratos `API.md` vs implementacion real.
- Probar reglas de autorizacion por rol.
- Verificar consistencia de insignias en directorio.

Mini proyecto:
- Suite Postman de flujo extremo a extremo de negocio.

## Checklist comun
- `npm run dev`
- `npx tsc --noEmit`
- `npm run build`
- Sin romper endpoints de turista existentes.

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-07 | Alan | v2.0 - Preparacion enfocada a modulo negocio con continuidad turista. |
