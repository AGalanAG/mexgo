# MexGo - Schema SQL (v2 negocio)
**Los Mossitos · Genius Arena 2026**

Diseno relacional en Supabase PostgreSQL para enfoque Coppel Emprende + insignias publicas.

## 1. Principios
- UUID como PK en tablas de dominio.
- `timestamptz` en UTC.
- Catalogos normalizados para reglas de aprendizaje.
- Auditoria en eventos sensibles (insignias).
- Compatibilidad: se conservan tablas base de turista y auth.

## 2. Enums propuestos
`role_code`
- TURISTA
- ENCARGADO_NEGOCIO
- EMPLEADO_NEGOCIO
- ADMIN
- SUPERADMIN

`business_status`
- DRAFT
- ACTIVE
- SUSPENDED

`learning_audience`
- OWNER
- STAFF
- BOTH

`completion_status`
- PENDING
- PASSED
- FAILED
- VALIDATED

`badge_status`
- IN_PROGRESS
- AWARDED
- EXPIRED
- REVOKED

## 3. Nucleo de identidad (se conserva)
### `users_profile`
Perfil extendido de `auth.users`.

### `roles`
Catalogo de roles.

### `user_roles`
Relacion usuario-rol.

## 4. Dominio negocio
### `business_profiles`
Perfil canonical del negocio.
Campos clave:
- id uuid pk
- owner_user_id uuid fk auth.users(id)
- business_name text not null
- business_description text not null
- category_code text not null
- phone text null
- email text null
- borough text null
- neighborhood text null
- latitude numeric(9,6) null
- longitude numeric(9,6) null
- status business_status not null default 'DRAFT'
- is_public boolean not null default false
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Indices:
- idx_business_profiles_owner
- idx_business_profiles_status
- idx_business_profiles_public

### `business_team_members`
Equipo operativo asociado al negocio.
Campos clave:
- id uuid pk
- business_id uuid fk business_profiles(id)
- user_id uuid null fk auth.users(id)
- full_name text not null
- role_title text not null
- is_owner boolean not null default false
- is_active boolean not null default true
- invited_at timestamptz null
- joined_at timestamptz null
- created_at timestamptz not null default now()

Restriccion:
- unique (business_id, user_id) where user_id is not null

## 5. Dominio aprendizaje
### `learning_sources`
Origen del contenido (institucion/ONG/plataforma).

Campos:
- id uuid pk
- name text not null
- source_type text not null
- base_url text null
- is_active boolean default true

### recommendation_items

- id uuid pk default gen_random_uuid()
- recommendation_id uuid not null references recommendations(id)
- business_profile_id uuid not null references business_profiles(id)
- rank integer not null check (rank between 1 and 6)
- score numeric(8,5) not null
- reasons jsonb not null default '[]'::jsonb
- estimated_walk_minutes integer null
- created_at timestamptz not null default now()

Indices:
- idx_recommendation_items_recommendation (recommendation_id, rank)
- idx_recommendation_items_business (business_profile_id)

### itineraries

- id uuid pk default gen_random_uuid()
- tourist_user_id uuid not null references auth.users(id)
- recommendation_id uuid null references recommendations(id)
- status text not null check (status in ('draft','saved','archived')) default 'draft'
- version integer not null default 1
- itinerary_payload jsonb not null
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Indices:
- idx_itineraries_user (tourist_user_id, updated_at desc)

### itinerary_stops

Paradas normalizadas por dia para render de mapa y recalculo de ruta.

- id uuid pk default gen_random_uuid()
- itinerary_id uuid not null references itineraries(id)
- route_date date not null
- stop_order integer not null check (stop_order >= 1)
- stop_type text not null check (stop_type in ('BUSINESS','POI','MATCH','CUSTOM'))
- business_profile_id uuid null references business_profiles(id)
- label text not null
- start_time time null
- end_time time null
- latitude numeric(9,6) not null
- longitude numeric(9,6) not null
- created_at timestamptz not null default now()

Restricciones:
- unique (itinerary_id, route_date, stop_order)

Indices:
- idx_itinerary_stops_itinerary_day (itinerary_id, route_date, stop_order)

### itinerary_daily_routes

Cache de geometria y resumen de ruta por dia de itinerario.

- id uuid pk default gen_random_uuid()
- itinerary_id uuid not null references itineraries(id)
- route_date date not null
- provider text not null default 'mapbox-directions'
- profile text not null check (profile in ('walking','driving')) default 'walking'
- waypoints jsonb not null default '[]'::jsonb
- route_geometry jsonb not null
- distance_meters integer not null default 0
- duration_seconds integer not null default 0
- is_stale boolean not null default false
- generated_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Restricciones:
- unique (itinerary_id, route_date, profile)

Indices:
- idx_itinerary_daily_routes_itinerary (itinerary_id, route_date)

---

## 7. Visitas para algoritmo de equidad

### visits

Registro de visitas/acciones usadas para saturacion y senales de conversion.

- id uuid pk default gen_random_uuid()
- tourist_user_id uuid not null references auth.users(id)
- business_profile_id uuid not null references business_profiles(id)
- recommendation_id uuid null references recommendations(id)
- itinerary_id uuid null references itineraries(id)
- source text not null check (source in ('itinerary','map','card'))
- event_type visit_event_type not null
- occurred_at timestamptz not null
- local_day date not null
- lat numeric(9,6) null
- lng numeric(9,6) null
- counted_for_equity boolean not null default true
- dedupe_key text not null
- created_at timestamptz not null default now()

Reglas:
- dedupe_key unique para evitar duplicados por reintento.
- local_day derivado de occurred_at en zona America/Mexico_City.

Indices:
- uq_visits_dedupe_key unique (dedupe_key)
- idx_visits_business_day (business_profile_id, local_day)
- idx_visits_business_occurred (business_profile_id, occurred_at desc)
- idx_visits_tourist_day (tourist_user_id, local_day)

### daily_business_saturation

Tabla agregada para consultas rapidas del algoritmo.

- business_profile_id uuid not null references business_profiles(id)
- day date not null
- visits_count integer not null default 0
- unique_tourists_count integer not null default 0
- last_referred_at timestamptz null
- saturation_score numeric(8,5) not null default 0
- updated_at timestamptz not null default now()
- primary key (business_profile_id, day)

Indices:
- idx_daily_saturation_day (day, saturation_score desc)

Mantenimiento:
- Trigger en visits actualiza agregados en insercion.

---

## 8. Chat e historial

### chat_sessions

Una sesión por turista. Agrupa todos los mensajes de una conversación activa.

- id uuid pk default gen_random_uuid()
- tourist_user_id uuid not null references auth.users(id)
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()

Indices:
- idx_chat_sessions_user (tourist_user_id, updated_at desc)

### chat_messages

Mensajes individuales de una sesión de chat.

- id uuid pk default gen_random_uuid()
- session_id uuid not null references chat_sessions(id) on delete cascade
- role text not null check (role in ('user', 'model'))
- content text not null
- created_at timestamptz not null default now()

Indices:
- idx_chat_messages_session (session_id, created_at asc)

RLS:
- Turista lee y escribe solo sus propias sesiones y mensajes.

---

## 10. Tickets tecnicos

### technical_tickets

- id uuid pk default gen_random_uuid()
### `learning_modules`
Catalogo de modulos disponibles.
Campos clave:
- id uuid pk
- source_id uuid fk learning_sources(id)
- slug text unique not null
- title text not null
- description text not null
- audience learning_audience not null
- category text not null
- estimated_minutes integer not null
- pass_score integer not null default 70
- is_active boolean not null default true
- created_at timestamptz not null default now()

### `learning_completions`
Resultado por miembro y modulo.
Campos clave:
- id uuid pk
- business_id uuid fk business_profiles(id)
- member_id uuid fk business_team_members(id)
- module_id uuid fk learning_modules(id)
- attempt_number integer not null default 1
- score integer null
- status completion_status not null default 'PENDING'
- evidence_url text null
- validated_by uuid null fk auth.users(id)
- validated_at timestamptz null
- created_at timestamptz not null default now()

Indices:
- idx_learning_completions_business
- idx_learning_completions_member
- idx_learning_completions_module

## 6. Dominio insignias
### `badge_definitions`
Definicion de insignias publicas.
Campos:
- id uuid pk
- code text unique not null
- public_name text not null
- description text not null
- icon_key text null
- is_active boolean default true
- created_at timestamptz default now()

### `badge_requirements`
Reglas de elegibilidad por insignia.
Campos:
- id uuid pk
- badge_id uuid fk badge_definitions(id)
- requirement_type text not null
- requirement_payload jsonb not null
- is_active boolean default true

Ejemplo payload:
- `{ "type": "module_set", "modules": ["servicio-seguro", "pagos-digitales"] }`
- `{ "type": "staff_coverage", "minPercent": 100 }`

### `business_badges`
Estado de insignias por negocio.
Campos:
- id uuid pk
- business_id uuid fk business_profiles(id)
- badge_id uuid fk badge_definitions(id)
- status badge_status not null default 'IN_PROGRESS'
- progress_percent numeric(5,2) not null default 0
- awarded_at timestamptz null
- expires_at timestamptz null
- revoked_reason text null
- is_public boolean not null default true
- updated_at timestamptz not null default now()

Restriccion:
- unique (business_id, badge_id)

<<<<<<< HEAD:docs/SCHEMA.md
---

## 11. Auditoria

### audit_logs

- id uuid pk default gen_random_uuid()
- entity_type text not null
- entity_id uuid not null
- action text not null
- actor_user_id uuid null references auth.users(id)
- before_data jsonb null
- after_data jsonb null
- metadata jsonb not null default '{}'::jsonb
=======
### `badge_events`
Auditoria de otorgamiento/revocacion.
Campos:
- id uuid pk
- business_badge_id uuid fk business_badges(id)
- event_type text not null
- actor_user_id uuid null fk auth.users(id)
- payload jsonb not null default '{}'
>>>>>>> origin/feat/alan-backend:SCHEMA.md
- created_at timestamptz not null default now()

## 7. Directorio publico
### `directory_profiles`
Proyeccion publica del negocio para busqueda.
Campos:
- business_id uuid pk fk business_profiles(id)
- public_name text not null
- short_description text not null
- categories text[] not null default '{}'
- badge_codes text[] not null default '{}'
- city text null
- state text null
- public_score numeric(8,5) not null default 0
- updated_at timestamptz not null default now()

### `directory_events`
Eventos anonimos de interaccion (visita/click contacto).
Campos:
- id uuid pk
- business_id uuid fk business_profiles(id)
- event_type text not null
- source text not null
- occurred_at timestamptz not null default now()

<<<<<<< HEAD:docs/SCHEMA.md
## 12. Reglas de transicion de estado (solicitudes)

Permitidas:
- Pendiente -> En revision (claim)
- En revision -> Aprobado (approve)
- En revision -> Rechazado (reject)
- En revision -> Pendiente (release)
- Rechazado -> Pendiente (resubmit)

No permitidas:
- Pendiente -> Aprobado directo
- Rechazado -> Aprobado directo
- Aprobado -> Pendiente

Control de concurrencia:
- Claim usa update condicional por status y lock nulo/no vigente.
- Si 0 rows affected, responder conflicto (resource_locked).

---

## 13. RLS (resumen operativo)

- users_profile: usuario ve y edita su fila.
- business_requests:
  - EncargadoDelNegocio ve/edita solo sus solicitudes permitidas por estado.
  - Admin ve todas.
  - SuperAdmin ve todas.
- business_profiles:
  - Publico: lectura de campos publicados.
  - EncargadoDelNegocio: edicion limitada de su negocio.
- itinerary_stops e itinerary_daily_routes:
  - Turista: CRUD solo de sus itinerarios.
  - Admin/SuperAdmin: solo lectura para soporte.
- visits:
  - Turista inserta solo para si mismo.
  - Admin/SuperAdmin lectura agregada.
- audit_logs: solo Admin/SuperAdmin lectura.

Implementacion recomendada:
- helper SQL has_role(auth.uid(), 'ADMIN').
- vistas seguras para panel admin.

---

## 14. SQL operativo minimo (pseudobase)

1. Crear enums.
2. Crear catalogos base.
3. Crear tablas nucleo (users_profile, roles, user_roles).
4. Crear business_requests + reviews + profiles.
5. Crear cuestionario/recomendaciones/itinerarios.
6. Crear itinerary_stops + itinerary_daily_routes.
7. Crear visits + daily_business_saturation + trigger de agregacion.
8. Crear chat_sessions + chat_messages.
9. Crear tickets y audit_logs.
9. Aplicar indices.
10. Aplicar politicas RLS.
11. Seed de roles y catalogos.

---

## 15. Pendientes menores antes de cierre final

- Confirmar si social_links sera text[] o jsonb estructurado por red.
- Confirmar si owner_age se conservara completo o solo rango por privacidad.
- Definir retencion de visits crudas y politica de archivado.
- Definir umbral exacto de saturation_score para lib/equity.ts.
- Definir estrategia de geocoding fallback cuando no haya coordenadas confiables.

---
=======
## 8. Compatibilidad con turista
Tablas y flujos de turista actuales se mantienen sin ruptura.
Cualquier evolucion del modulo turista debe ser aditiva.
>>>>>>> origin/feat/alan-backend:SCHEMA.md

## Cambios
| Fecha | Quien | Que |
|---|---|---|
<<<<<<< HEAD:docs/SCHEMA.md
| 2026-04-06 | Alan | v1.0 — modelo de datos, estados y visitas para algoritmo de equidad. |
| 2026-04-06 | Alan | v1.1 — soporte de coordenadas y rutas de mapa por dia de itinerario. |
| 2026-04-07 | Fidel | v1.2 — tablas chat_sessions y chat_messages para historial de conversacion. |
=======
| 2026-04-07 | Alan | v2.0 - Schema orientado a equipo, aprendizaje, insignias y directorio publico. |
>>>>>>> origin/feat/alan-backend:SCHEMA.md
