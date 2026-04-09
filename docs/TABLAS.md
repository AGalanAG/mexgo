# MexGo - Tablas del schema (resumen)
**Los Mossitos · Genius Arena 2026**

## Enums
| Enum | Valores |
|---|---|
| role_code | TURISTA, ENCARGADO_NEGOCIO, EMPLEADO_NEGOCIO, ADMIN, SUPERADMIN |
| business_status | DRAFT, ACTIVE, SUSPENDED |
| learning_audience | OWNER, STAFF, BOTH |
| completion_status | PENDING, PASSED, FAILED, VALIDATED |
| badge_status | IN_PROGRESS, AWARDED, EXPIRED, REVOKED |

## Identidad y RBAC
### users_profile
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | FK auth.users |
| full_name | text | obligatorio |
| avatar_url | text | opcional |
| language_code | text | obligatorio |
| country_of_origin | text | obligatorio |
| email_verified | boolean | default false |

### roles
| Columna | Tipo | Notas |
|---|---|---|
| id | smallserial PK | |
| code | role_code | unique |
| description | text | |

### user_roles
| Columna | Tipo | Notas |
|---|---|---|
| user_id | uuid | FK auth.users |
| role_id | smallint | FK roles |
| created_at | timestamptz | default now |

## Negocio
### business_profiles
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| owner_user_id | uuid | FK auth.users |
| business_name | text | |
| business_description | text | |
| category_code | text | |
| status | business_status | default DRAFT |
| is_public | boolean | default false |
| latitude | numeric(9,6) | opcional |
| longitude | numeric(9,6) | opcional |
| created_at | timestamptz | default now |
| updated_at | timestamptz | default now |

### business_team_members
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| business_id | uuid | FK business_profiles |
| user_id | uuid | FK auth.users, opcional |
| full_name | text | |
| role_title | text | |
| is_owner | boolean | default false |
| is_active | boolean | default true |

## Aprendizaje
### learning_sources
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| name | text | |
| source_type | text | ONG, institucion, plataforma |
| base_url | text | opcional |
| is_active | boolean | default true |

### learning_modules
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| source_id | uuid | FK learning_sources |
| slug | text | unique |
| title | text | |
| audience | learning_audience | OWNER/STAFF/BOTH |
| estimated_minutes | integer | |
| pass_score | integer | default 70 |
| is_active | boolean | default true |

### learning_completions
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| business_id | uuid | FK business_profiles |
| member_id | uuid | FK business_team_members |
| module_id | uuid | FK learning_modules |
| score | integer | opcional |
| status | completion_status | |
| evidence_url | text | opcional |
| validated_by | uuid | FK auth.users, opcional |
| validated_at | timestamptz | opcional |

## Insignias
### badge_definitions
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| code | text | unique |
| public_name | text | |
| description | text | |
| is_active | boolean | default true |

### badge_requirements
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| badge_id | uuid | FK badge_definitions |
| requirement_type | text | module_set, staff_coverage, etc |
| requirement_payload | jsonb | reglas parametrizadas |
| is_active | boolean | default true |

### business_badges
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| business_id | uuid | FK business_profiles |
| badge_id | uuid | FK badge_definitions |
| status | badge_status | |
| progress_percent | numeric(5,2) | default 0 |
| awarded_at | timestamptz | opcional |
| is_public | boolean | default true |

### badge_events
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| business_badge_id | uuid | FK business_badges |
| event_type | text | award/revoke/recalculate |
| actor_user_id | uuid | FK auth.users, opcional |
| payload | jsonb | detalle |
| created_at | timestamptz | default now |

## Directorio publico
### directory_profiles
| Columna | Tipo | Notas |
|---|---|---|
| business_id | uuid PK | FK business_profiles |
| public_name | text | |
| short_description | text | |
| categories | text[] | |
| badge_codes | text[] | |
| public_score | numeric(8,5) | ranking |
| updated_at | timestamptz | |

> Trigger en `visits` actualiza esta tabla en cada inserción.

---

## Transiciones de estado — solicitudes

| Desde | Acción | Hacia | Quién |
|-------|--------|-------|-------|
| PENDIENTE | claim | EN_REVISION | Admin |
| EN_REVISION | approve | APROBADO | Admin (mismo que hizo claim) |
| EN_REVISION | reject | RECHAZADO | Admin (mismo que hizo claim) |
| EN_REVISION | release | PENDIENTE | Admin o SuperAdmin |
| RECHAZADO | resubmit | PENDIENTE | EncargadoDelNegocio |
| PENDIENTE | — | APROBADO | ✗ No permitido |
| RECHAZADO | — | APROBADO | ✗ No permitido |
| APROBADO | — | PENDIENTE | ✗ No permitido |

---

## RLS por tabla

| Tabla | Turista | EncargadoDelNegocio | Admin | SuperAdmin |
|-------|---------|---------------------|-------|------------|
| users_profile | solo su fila | solo su fila | solo su fila | solo su fila |
| business_requests | no | solo las suyas | todas | todas |
| business_profiles | lectura pública | edición limitada de la suya | todas | todas |
| itineraries / stops | CRUD solo los suyos | no | lectura soporte | lectura soporte |
| visits | inserta solo para sí | no | lectura agregada | lectura agregada |
| chat_sessions / messages | CRUD solo las suyas | no | no | no |
| audit_logs | no | no | lectura | lectura |
| technical_tickets | no | no | crear | CRUD |

---

## Cambios

| Fecha | Quién | Qué |
|-------|-------|-----|
| 2026-04-06 | Fidel | v1.0 — visualización en tablas de todo SCHEMA.md |
### directory_events
| Columna | Tipo | Notas |
|---|---|---|
| id | uuid PK | |
| business_id | uuid | FK business_profiles |
| event_type | text | view/click/contact |
| source | text | web/app/share |
| occurred_at | timestamptz | |

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-07 | Alan | v2.0 - Vista tabular alineada al nuevo schema de negocio. |
