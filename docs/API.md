# MexGo - API (v2 negocio)
**Los Mossitos · Genius Arena 2026**

Contratos API para mantener turismo estable y extender negocio con cambios minimos.

## 1. Convenciones
- Base path: `/api`
- Formato: JSON UTF-8
- Auth: Bearer JWT Supabase
- Respuesta estandar: `apiOk` / `apiError`
- Roles: TURISTA, ENCARGADO_NEGOCIO, EMPLEADO_NEGOCIO, ADMIN, SUPERADMIN

### Error codes
- AUTH_REQUIRED
- FORBIDDEN
- VALIDATION_ERROR
- NOT_FOUND
- CONFLICT
- INTERNAL_ERROR

## 2. Endpoints actuales (se mantienen)
### POST /api/auth/register
Registro de usuario con perfil inicial.

Body base:
```json
{
  "email": "persona@correo.com",
  "password": "secreto123",
  "fullName": "Nombre Apellido",
  "roleCode": "TURISTA"
}
```

Reglas:
- `roleCode` permitido: `TURISTA`, `ENCARGADO_NEGOCIO`, `EMPLEADO_NEGOCIO`, `ADMIN`
- Si `roleCode = TURISTA`, tambien son obligatorios `language` y `countryOfOrigin`
- Si `roleCode = ADMIN`, se requiere `adminRegistrationToken` y variable `AUTH_ADMIN_REGISTRATION_TOKEN`

### POST /api/auth/login
Login con email/password para todos los roles.

Body:
```json
{
  "email": "persona@correo.com",
  "password": "secreto123"
}
```

Response incluye `session.accessToken`, `roleCodes` y `primaryRole`.

### GET /api/auth/me
Devuelve usuario autenticado, perfil y roles.

Auth: `Authorization: Bearer <accessToken>`

### POST /api/auth/oauth/start
Inicio OAuth (google/apple).

### GET /api/tourist/profile
Lectura de perfil turista autenticado.

### PATCH /api/tourist/profile
Actualizacion parcial de perfil turista.

> Nota: estos contratos no se rompen en esta fase.

## 3. Nuevos endpoints incrementales de negocio
### POST /api/businesses
Crea perfil de negocio para usuario autenticado.

Auth: ENCARGADO_NEGOCIO o ADMIN

Body:
```json
{
  "businessName": "Cafe Centro",
  "businessDescription": "Cafeteria de barrio",
  "categoryCode": "CAFETERIA",
  "phone": "+525500000000",
  "email": "hola@cafecentro.mx",
  "borough": "Cuauhtemoc",
  "neighborhood": "Centro",
  "latitude": 19.4326,
  "longitude": -99.1332
}
```

### GET /api/businesses/me
Devuelve negocio asociado al usuario autenticado.

### PATCH /api/businesses/{businessId}
Actualiza campos del perfil de negocio.

### POST /api/businesses/{businessId}/team
Agrega miembro al equipo.

Body:
```json
{
  "fullName": "Maria Perez",
  "roleTitle": "Mesera",
  "userId": null
}
```

### GET /api/businesses/{businessId}/team
Lista miembros del equipo del negocio.

## 4. Endpoints de aprendizaje
### GET /api/learning/modules
Lista modulos activos con filtros.

Query opcional:
- `audience=OWNER|STAFF|BOTH`
- `category=servicio|finanzas|formalizacion`

### POST /api/learning/completions
Registra resultado de completitud.

Body:
```json
{
  "businessId": "uuid",
  "memberId": "uuid",
  "moduleId": "uuid",
  "score": 85,
  "status": "PASSED",
  "evidenceUrl": "https://..."
}
```

### GET /api/learning/completions?businessId={id}
Consulta historial de completitud del negocio.

## 5. Endpoints de insignias
### GET /api/badges/catalog
Catalogo de insignias disponibles.

### GET /api/badges/business/{businessId}
Estado de insignias por negocio.

### POST /api/badges/business/{businessId}/recalculate
Recalcula progreso y otorgamiento de insignias.

Roles: ENCARGADO_NEGOCIO, ADMIN

## 6. Endpoints de directorio publico
### GET /api/directory/businesses
Busqueda publica de negocios.

Query:
- `q`: texto libre
- `badge`: codigo de insignia
- `category`: categoria negocio
- `city`: ciudad
- `page`, `pageSize`

Response:
```json
{
  "ok": true,
  "data": {
    "items": [
      {
        "businessId": "uuid",
        "publicName": "Cafe Centro",
        "shortDescription": "Cafe de especialidad",
        "badgeCodes": ["NEGOCIO_FORMAL", "SERVICIO_SEGURO"],
        "publicScore": 0.87
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 1
    }
  }
}
```

### GET /api/directory/businesses/{businessId}
Detalle publico del negocio.

## 7. Estrategia de despliegue
- Fase 1: publicar endpoints de negocio y directorio en paralelo al backend existente.
- Fase 2: conectar UI de negocio sin tocar UX turista.
- Fase 3: activar recalc automatico de insignias por evento de completitud.

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-07 | Alan | v2.0 - Contratos API ampliados para aprendizaje, insignias y directorio publico. |
