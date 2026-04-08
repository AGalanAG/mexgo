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

`Pendiente` -> `En revision` -> (`Aprobado` o `Rechazado`)

Reglas:
- Al abrir una solicitud pendiente, cambia a `En revision` y se bloquea para otros admins.
- Si se rechaza con comentarios y el negocio corrige, vuelve a `Pendiente`.
- Toda transición debe registrar auditoría y disparar correo transaccional.

## Distribución general
| Quién | Rol principal | Tecnologías clave |
|---|---|---|
| Fidel | Arquitecto / IA / Algoritmo | Next.js API Routes, Gemini, AWS |
| Emi | Frontend Turista | Tailwind, Mapbox, PWA Cache |
| Farid | Frontend Admin | Tailwind, Supabase Auth, Supabase Storage |
| Alan | Backend / BD | Supabase, PostgreSQL, Next.js API |
| Xavier | QA Global / Integrador | Postman, UI Polish, E2E, Datos de Impacto |

## Fidel
**Responsabilidad:** Arquitectura, algoritmo `lib/equity.ts` (verificar su implementación) , Gemini, despliegue AWS (para producción, no para pruebas).
**Preparación:**
- Crear repositorio del proyecto.
- Determinar el funcionamiento de la generación de itinerarios
- Conectar a Gemini Flash para devolver itinerarios en JSON estructurado.
- Desplegar API funcional en AWS (capa gratuita).

## Emi
**Responsabilidad:** Flujo del turista, mapas, tarjetas, modo offline.
**Preparación:**
- Panel turistas 
- Integracion de multiples mapas y rutas (Mapbox y Google Routes, places y Maps) con tarjetas deslizables.


## Farid
**Responsabilidad:** Panel admin y super admin, negocio, autenticación, gestión de imágenes.
**Preparación:**
- Crear flujo de `/login` con Supabase Auth.
- Crear flujo /register
- Crear flujo admin y super admin
- Crear flujo de negocio
- Implementar subida de archivos a Supabase Storage y renderizado de respuesta.
- Diseñar dashboard administrativo básico para gestión de negocios.

## Alan
**Responsabilidad:** Infraestructura de BD, esquema SQL, auth/RBAC, endpoints, workflow de solicitudes y notificaciones.
**Preparación:**
- Definir esquema SQL relacional en Supabase con tablas de `users`, `roles`, `tourist_profiles`, `business_requests`, `business_profiles`, `request_reviews`, `audit_logs`.
- Implementar auth para Turista con email/password y OAuth (Google/Apple), incluyendo verificación de correo.
- Persistir onboarding de Turista con `idioma` y `pais_origen` como campos obligatorios.
- Construir endpoints para cuestionario, generación/regeneración de itinerario, edición de itinerario y exportación PDF.
- Implementar flujo de solicitud de negocio con 21 campos, estados (`Pendiente`, `En revision`, `Rechazado`, `Aprobado`) y bloqueo de concurrencia cuando un Admin toma revisión.
- Crear endpoints de revisión para Admin con retroalimentación obligatoria al rechazar.
- Configurar correos transaccionales: recibido de solicitud, solicitud con observaciones, solicitud aprobada, verificación de cuenta.
- Configurar `Supabase Realtime` solo donde aporte valor operativo (cambios de estado y panel admin).

### Campos obligatorios de la solicitud de negocio

El formulario de Encargado Del Negocio debe contemplar estos 21 campos:

1. Nombre completo (como identificación oficial)
2. Edad
3. Género
4. Correo electrónico
5. WhatsApp de contacto
6. Alcaldía
7. Colonia y, opcionalmente, link de Google Maps + sede sugerida para capacitación
8. Número de mujeres y hombres empleados
9. Nombre del negocio
10. Descripción del negocio (máximo 150 caracteres)
11. Antigüedad inicial del negocio (rangos)
12. Tiempo operando de forma continua
13. Días y horarios de operación
14. Formas de operación/venta (selección múltiple)
15. Otra forma de venta (texto)
16. Estatus ante SAT
17. Redes sociales del negocio
18. Cómo adaptaría e impulsaría su negocio para Mundial 2026
19. En qué usaría el apoyo económico
20. Sede preferida para capacitación presencial
21. Dudas o comentarios adicionales

### Catálogos sugeridos para backend (normalización)

Alcaldías permitidas en catálogo principal:
- Alvaro Obregon
- Azcapotzalco
- Benito Juarez
- Coyoacan
- Cuajimalpa
- Cuauhtemoc
- Gustavo A. Madero
- Iztapalapa
- Magdalena Contreras
- Miguel Hidalgo
- Milpa Alta
- Tlahuac
- Tlalpan
- Venustiano Carranza
- Xochimilco
- Otro

Rangos de inicio de negocio (campo 11):
- Menos de un ano
- 1-3 anos
- 3-5 anos
- Mas de 5 anos

Formas de operacion/venta (campo 14, multiselect):
- Cuento con local o espacio
- Realizo ventas a domicilio por app o por mi cuenta
- Vendo en bazares, eventos o tianguis
- Vendo a otros negocios o distribuidores
- Realizo venta ambulante o en via publica
- Otro

Estatus SAT (campo 16):
- Si, es formal y esta registrado
- Estoy en proceso de registrarlo
- No esta registrado pero me interesa
- Tal vez
- No y no me interesa

Sede de capacitacion presencial (campo 20):
- HUB AZTECA (Coyoacan)
- MIDE (Centro Historico)

### Validaciones backend minimas

- Campo 10: maximo 150 caracteres.
- Campo 7: aceptar texto libre + URL opcional de Google Maps.
- Campos 8 y 12: numericos no negativos.
- Campo 14: al menos una opcion seleccionada.
- Rechazo de solicitud: comentario de retroalimentacion obligatorio.
- Aprobacion de solicitud: generar habilitacion de cuenta para EncargadoDelNegocio.

## Xavier 
**Responsabilidad:** Calidad integral, pruebas, UX/UI (mockups) y documentación .
**Funciones clave:**
- **Vigilancia de Contratos:** Validar que el Backend (Alan) y los Frontends coincidan exactamente con lo definido en `API.md`.
- **QA End-to-End:** Probar el flujo completo como si fuera un turista real (QR -> Itinerario -> Offline) detectando errores de lógica.
- **Pulido UI/UX:** Intervenir en el código para ajustar márgenes, tipografías y colores de marca, asegurando que la app se vea "pixel-perfect".
- Generación de documento para la pagina genius arena
**Preparación:**
- Script generador de 50 negocios verosímiles con coordenadas y sello "Ola México".
- Dominar Postman para estresar los endpoints del backend.
- Repaso intensivo de Tailwind CSS para realizar ajustes visuales rápidos sin romper la estructura.

## 6. Reporte de Errores y QA (Flujo con Xavier)
- ✗ Prohibido enviar mensajes al chat diciendo "no funciona", "se rompió" o "tira error" sin contexto.
- → Formato obligatorio para reportar un bug a Xavier:
    1. **Dónde:** Ruta exacta, vista o endpoint (ej. `/api/recomendar` o vista móvil del mapa).
    2. **Pasos:** Qué hiciste exactamente antes de que fallara (1. Entré a X, 2. Toqué Y).
    3. **Qué esperabas vs. Qué pasó:** "Debía mostrar 4 tarjetas, pero mostró un error 500".
    4. **Evidencia:** Captura de pantalla o el log exacto de la terminal pegado.
- → Regla de Triage (Clasificación): 
    - Si el bug rompe el *Golden Path* (el flujo de la demostración a los jueces): **Prioridad Máxima**, el desarrollo se frena hasta arreglarlo.
    - Si es un botón secundario o un margen mal alineado: Se anota en la lista de "Deuda Técnica / Post-Hackathon" y el desarrollo sigue.

---
## 3. Reglas de coordinacion
- No romper endpoints de turista ya integrados.
- Cualquier cambio de contrato requiere actualizar `API.md`.
- Cualquier cambio de datos requiere actualizar `SCHEMA.md` y `TABLAS.md`.
- QA valida primero flujo de negocio antes de habilitar UI adicional.

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-07 | Alan | v2.0 - Se incorpora rol EmpleadoDelNegocio y enfoque operativo de profesionalizacion. |
