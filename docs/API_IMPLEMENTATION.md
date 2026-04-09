# Documentación de la API - MexGo
**Estado del Proyecto: MVP (Abril 2026)**

Esta documentación divide las rutas entre las que están **totalmente operativas** (conectadas a Supabase), las que están en **modo demo/híbrido** y las que están **planteadas o depreciadas**.

---

## 1. Endpoints de Experiencia Turista

### `POST /api/recommend`
*   **Estado:** Operativo.
*   **Función:** Recibe coordenadas (`lat`, `lng`) y opcionalmente el cuestionario del turista. Devuelve una lista de 4 a 6 negocios rankeados por el algoritmo de equidad.
*   **Lógica:** Prioriza negocios con menor saturación reciente para equilibrar el flujo turístico.

### `POST /api/chat`
*   **Estado:** Operativo (Integración Gemini).
*   **Función:** Procesa mensajes de texto. Sincroniza el itinerario en memoria antes de responder.
*   **Capacidades:** Puede agregar, editar o eliminar eventos del itinerario y recomendar negocios mediante herramientas de IA (function calling).

### `GET /api/directory/businesses`
*   **Estado:** Operativo (Supabase).
*   **Función:** Buscador público de negocios con soporte para:
    *   Paginación (`page`, `pageSize`).
    *   Búsqueda por texto (`q`).
    *   Filtros por categoría y ubicación.

### `GET | POST /api/itinerary`
*   **Estado:** Operativo.
*   **Función:** Gestión persistente de las paradas del viaje. Soporta la creación de paradas tipo `BUSINESS`, `POI` (punto de interés) o `CUSTOM`.

---

## 2. Endpoints de Negocio (B2B)

### `GET /api/business/[businessId]/insight`
*   **Estado:** Híbrido (Real + Demo).
*   **Función:** Genera un análisis estratégico del negocio usando Gemini.
*   **Lógica de Cache:** Si existe un informe generado hace menos de 6 horas en `business_insights_cache`, lo devuelve instantáneamente. Si no, invoca a Gemini Pro.

### `GET /api/learning/modules`
*   **Estado:** Operativo.
*   **Función:** Devuelve el catálogo de cursos de capacitación (Fundación Coppel, etc.).

### `POST /api/learning/completions`
*   **Estado:** Operativo.
*   **Función:** Registra el progreso de un negocio en un módulo educativo. Actualiza la tabla `business_learning_progress`.

### `GET /api/businesses/me`
*   **Estado:** Operativo.
*   **Función:** Recupera los negocios asociados al usuario autenticado.

---

## 3. Rutas en Transición y Planteadas

### `POST /api/requests` (Onboarding)
*   **Estado:** En transición.
*   **Cambio:** Anteriormente requería revisión manual. Ahora el sistema está configurado para **aprobación automática** (`status: ACTIVE` por defecto), pero la ruta conserva los campos extendidos de registro socioeconómico.

### `ANY /api/badges/...`
*   **Estado:** **DEPRECIADO**.
*   **Razón:** El sistema de insignias físicas fue eliminado de la base de datos (Migración 0006). Las rutas aún existen como archivos pero fallarán al intentar escribir en tablas inexistentes. Se recomienda usar `business_learning_progress` en su lugar.

### `POST /api/business/[id]/chat`
*   **Estado:** **PLANTEADO / PAUSADO**.
*   **Razón:** Las tablas de chat y soporte fueron eliminadas en la migración 0007 para simplificar el MVP. Actualmente, la comunicación sugerida es vía los enlaces de contacto (WhatsApp) proporcionados en el perfil del negocio.

---

## 4. Autenticación

### `/api/auth/login` | `/api/auth/register` | `/api/auth/me`
*   **Estado:** Operativo.
*   **Motor:** Supabase Auth (GoTrue). Utiliza cookies y tokens Bearer para la gestión de sesiones.
