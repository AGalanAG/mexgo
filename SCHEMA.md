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

### `badge_events`
Auditoria de otorgamiento/revocacion.
Campos:
- id uuid pk
- business_badge_id uuid fk business_badges(id)
- event_type text not null
- actor_user_id uuid null fk auth.users(id)
- payload jsonb not null default '{}'
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

## 8. Compatibilidad con turista
Tablas y flujos de turista actuales se mantienen sin ruptura.
Cualquier evolucion del modulo turista debe ser aditiva.

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-07 | Alan | v2.0 - Schema orientado a equipo, aprendizaje, insignias y directorio publico. |
