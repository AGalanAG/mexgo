# MexGo - Modulo Business
**Los Mossitos · Genius Arena 2026**

Guia operativa del modulo de negocio: rutas, componentes, APIs y estado actual de implementacion.

---

## 1. Vision general

El modulo business permite a un `EncargadoDelNegocio`:
1. Registrar su negocio via formulario de solicitud (5 pasos).
2. Ver su dashboard con progreso de capacitacion e insignias.
3. Completar modulos de aprendizaje por categoria.
4. Contactar soporte.

El negocio existe en dos dimensiones:
- **Privada** → gestionada por el encargado (`/business/*`).
- **Publica** → expuesta en directorio (`/api/directory/businesses`), solo lectura, sin auth.

---

## 2. Rutas de pagina (frontend)

| Ruta | Archivo | Estado |
|------|---------|--------|
| `/(tourist)/onboarding-business` | `app/[locale]/(tourist)/onboarding-business/page.tsx` | Funcional — contiene `QuestionnaireBusiness` |
| `/business/dashboard` | `app/[locale]/business/dashboard/page.tsx` | Funcional con datos **mock** |
| `/business/learning` | `app/[locale]/business/learning/page.tsx` | Funcional con datos **mock** |
| `/business/support` | `app/[locale]/business/support/page.tsx` | Funcional (FAQ + canales de contacto estaticos) |

> La ruta de onboarding vive dentro del grupo `(tourist)` porque se accede antes de tener un perfil de negocio activo.

---

## 3. Componentes

### `components/business/NavbarBusiness.tsx`
Navbar fija para todas las vistas `/business/*`.
- Links: Dashboard, Aprendizaje, Soporte.
- Selector de idioma (ES / EN) via `next-intl`.
- Dropdown de perfil con "Cerrar sesion".
- Mobile: bottom nav con iconos.
- El avatar muestra la inicial `"T"` — **hardcodeado**, pendiente conectar con usuario real.

### `components/business/QuestionnaireBusiness.tsx`
Formulario de solicitud de alta de negocio. 5 pasos lineales, con validacion por paso antes de avanzar.

**Campos por paso:**

| Paso | Titulo | Campos |
|------|--------|--------|
| 1 | Datos del Propietario | nombre_completo, edad, genero, accessibility_needs (multiselect), correo_electronico, whatsapp |
| 2 | Ubicacion y Sede | alcaldia (catalogo), colonia_y_maps (texto + URL opcional), sede_previa (HUB AZTECA / MIDE) |
| 3 | Tu Negocio | mujeres_empleadas, hombres_empleados, nombre_negocio, descripcion_negocio (max 150 chars), antiguedad (rangos), tiempo_continuo, horarios |
| 4 | Operacion y Legal | formas_operacion (multiselect), otra_forma_venta, sat_status, redes_sociales |
| 5 | Proyeccion y Capacitacion | adaptacion_mundial, uso_apoyo, sede_presencial (HUB AZTECA / MIDE) |

**Logica de submit:**
- Lee el access token de `getStoredAccessToken()` (lib/client-auth).
- Hace `POST /api/requests` con el payload completo.
- En exito → redirige a `/business/dashboard`.
- En error → `alert()` con el mensaje del servidor.

**Catalogo de opciones (constantes en el componente):**
- `ALCALDIAS`: 16 alcaldias de CDMX + "Otro".
- `FORMAS_OPERACION`: 5 opciones de modalidad de venta.
- `SAT_STATUS`: 5 opciones de estatus fiscal.
- `SEDES_CAPACITACION`: HUB AZTECA (Coyoacan) y MIDE (Centro Historico).
- `ACCESSIBILITY_NEEDS_OPTIONS`: 8 opciones (none, deaf, mute, deaf_mute, low_vision, blindness, mobility, other).

### `components/business/RequestForm.tsx`
Segun FLUJO.md es el componente alternativo para el formulario de alta. Existe en el repo pero no esta en uso activo en las rutas actuales — `QuestionnaireBusiness` es el que se renderiza en produccion.

---

## 4. APIs de negocio (implementadas)

### `POST /api/businesses`
Crea un perfil de negocio nuevo.

- **Auth:** Bearer JWT — rol `ENCARGADO_NEGOCIO` o `ADMIN`.
- **Body obligatorio:** `businessName`, `businessDescription`, `categoryCode`.
- **Body opcional:** `phone`, `email`, `borough`, `neighborhood`, `latitude`, `longitude`.
- **Regla:** `latitude` y `longitude` deben enviarse juntos o ningun.
- **Estado inicial:** `status: DRAFT`, `isPublic: false`.
- **Response 201:**
```json
{
  "businessId": "uuid",
  "ownerUserId": "uuid",
  "businessName": "...",
  "status": "DRAFT",
  "isPublic": false,
  "createdAt": "..."
}
```

---

### `GET /api/businesses/me`
Devuelve el negocio del usuario autenticado (el mas reciente).

- **Auth:** Bearer JWT — rol `ENCARGADO_NEGOCIO` o `ADMIN`.
- **Response 200:** todos los campos de `business_profiles`.
- **Response 404:** si el usuario no tiene ningun negocio.

---

### `PATCH /api/businesses/{businessId}`
Actualiza campos del perfil de negocio. Todos los campos son opcionales (partial update real).

- **Auth:** Bearer JWT — propietario del negocio o `ADMIN`.
- **Campos editables por el propietario:** `businessName`, `businessDescription`, `categoryCode`, `phone`, `email`, `borough`, `neighborhood`, `latitude`/`longitude`, `isPublic`.
- **Campo exclusivo de ADMIN:** `status` (valores: `DRAFT`, `ACTIVE`, `SUSPENDED`).
- **Regla:** si no hay ningun campo valido en el body, responde `VALIDATION_ERROR`.

---

### `GET /api/businesses/{businessId}/team`
Lista miembros del equipo del negocio.

- **Auth:** propietario o `ADMIN`.
- **Response:** `{ items: TeamMember[] }`.

### `POST /api/businesses/{businessId}/team`
Agrega un miembro al equipo.

- **Auth:** propietario o `ADMIN`.
- **Body obligatorio:** `fullName`, `roleTitle`.
- **Body opcional:** `userId` (null si aun no tiene cuenta), `isOwner` (boolean, default false).
- Si `userId` esta presente → `joinedAt` se setea automaticamente al momento del insert.

---

### `GET /api/badges/business/{businessId}`
Estado de insignias del negocio. Incluye join con `badge_definitions` para traer `code`, `public_name`, `description`.

- **Auth:** propietario o `ADMIN`.
- **Response:** `{ items: BusinessBadge[] }` ordenado por `updated_at DESC`.

### `POST /api/badges/business/{businessId}/recalculate`
Recalcula/inicializa insignias del negocio contra el catalogo activo.

- **Auth:** rol `ENCARGADO_NEGOCIO` o `ADMIN`, y ser propietario.
- **Logica actual:** hace upsert de todas las `badge_definitions` activas con `status: IN_PROGRESS` y `progress_percent: 0`. Es un placeholder — la logica de evaluacion real de reglas esta pendiente.
- **Response:** `{ businessId, recalculatedAt, items: [] }`.

---

### `GET /api/directory/businesses`
Busqueda publica de negocios. **Sin autenticacion.**

- **Query params:**
  - `q` — busqueda por nombre (ilike).
  - `badge` — filtro por codigo de insignia (array contains).
  - `category` — filtro por categoria (array contains).
  - `city` — filtro exacto por ciudad.
  - `page` (default 1), `pageSize` (default 20, max 100).
- **Fuente:** tabla `directory_profiles` (proyeccion publica).
- **Orden:** `public_score DESC`.
- **Response:**
```json
{
  "items": [...],
  "pagination": { "page": 1, "pageSize": 20, "total": 0 }
}
```

### `GET /api/directory/businesses/{businessId}`
Detalle publico de un negocio. **Sin autenticacion.**

- **Response:** `{ profile, recentEvents }` donde `recentEvents` son los ultimos 20 eventos de `directory_events`.
- Si no existe en `directory_profiles` → 404.

---

## 5. Solicitud de alta (`/api/requests`)

El formulario `QuestionnaireBusiness` **no** llama a `/api/businesses` — llama a `POST /api/requests` con el cuestionario completo. Este endpoint es de Alan (rama `feat/alan-backend`).

**Payload que envia el componente:**
```typescript
{
  owner_full_name, owner_age, owner_gender,
  owner_email, owner_whatsapp,
  borough_code, neighborhood, google_maps_url,
  operation_days_hours,
  business_name, business_description,
  business_start_range, continuous_operation_time,
  operation_modes: string[],
  operation_modes_other,
  employees_women_count, employees_men_count,
  sat_status,
  social_links: string[],          // parseado de texto separado por comas/saltos
  accessibility_needs: string[],
  adaptation_for_world_cup,
  support_usage,
  training_campus_preference,
  additional_comments,             // incluye sede_previa
}
```

---

## 6. Estado actual: mock vs real

| Seccion | Estado |
|---------|--------|
| Formulario de solicitud (`QuestionnaireBusiness`) | **Real** — POST a `/api/requests` con JWT |
| Dashboard (`/business/dashboard`) | **Mock** — datos hardcodeados en `MOCK` y `MODULOS_PREVIEW` |
| Modulos de aprendizaje (`/business/learning`) | **Mock** — 60 cursos generados desde constantes locales |
| Soporte (`/business/support`) | **Estatico** — FAQ y canales hardcodeados |
| APIs `/api/businesses/*` | **Implementadas** en backend, pendiente conectar con UI |
| APIs `/api/badges/*` | **Implementadas** en backend, logica de reglas pendiente |
| Directorio `/api/directory/*` | **Implementado** en backend, no hay UI todavia |
| Avatar/nombre en NavbarBusiness | **Hardcodeado** (`"T"`, `"Mi negocio"`) |

---

## 7. Pendientes de integracion (frontend)

1. **Dashboard**: reemplazar `MOCK` con llamada a `GET /api/businesses/me`.
2. **Dashboard**: reemplazar `MODULOS_PREVIEW` con datos reales de `GET /api/learning/completions?businessId=...`.
3. **Dashboard**: conectar insignias via `GET /api/badges/business/{id}`.
4. **NavbarBusiness**: leer nombre del negocio y avatar del usuario autenticado.
5. **Learning**: conectar modulos con `GET /api/learning/modules`.
6. **Learning**: registrar completitud con `POST /api/learning/completions`.

---

## 8. Flujo completo del encargado

```
1. Entra a /(tourist)/onboarding-business
2. Completa QuestionnaireBusiness (5 pasos)
   → POST /api/requests con JWT
3. Recibe confirmacion y va a /business/dashboard
4. Dashboard muestra progreso de modulos e insignias
   → pendiente: datos reales via API
5. Va a /business/learning
   → elige categoria → ve cursos → completa modulo
   → POST /api/learning/completions
6. Solicita recalculo de insignias
   → POST /api/badges/business/{id}/recalculate
7. Con insignias activas, negocio aparece en directorio publico
   → GET /api/directory/businesses
```

---

## 9. Convenciones importantes

- El componente `QuestionnaireBusiness` es un Client Component (`'use client'`).
- El hook de auth en el frontend usa `getStoredAccessToken()` de `lib/client-auth`.
- `NavbarBusiness` es independiente de `HomeNavbar` (turista) — no mezclar.
- Las rutas `/business/*` deben protegerse con RBAC en `middleware.ts` — verificar que solo `ENCARGADO_NEGOCIO` y `ADMIN` accedan.
- El formulario no valida campos en servidor antes de `POST /api/requests` — la validacion backend es la fuente de verdad.

---

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-08 | Fidel (IA) | v1.0 — Documento generado desde lectura del codigo real. |
