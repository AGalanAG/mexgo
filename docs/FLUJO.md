# MexGo - Flujo funcional y operativo (v2)
**Los Mossitos · Genius Arena 2026**

## 1. Flujo funcional por rol de plataforma
### Turista (sin cambios)
1. Registro/login.
2. Consulta y actualiza perfil.
3. Consume experiencias turisticas existentes.

### Encargado del negocio
1. Crea su perfil de negocio.
2. Registra o invita integrantes del equipo.
3. Asigna y da seguimiento a modulos.
4. Solicita recalculo de insignias.
5. Publica perfil en directorio.

| Quién | Rol | Tecnologías principales |
|-------|-----|------------------------|
| Fidel | Arquitecto, IA, algoritmo, deploy | Gemini API, `lib/equity.ts`, Next.js API Routes, Vercel |
| Alan | Auth, base de datos, backend | Supabase, PostgreSQL, middleware, RBAC |
| Emi | Frontend turista | Tailwind, Mapbox, PWA, localStorage |
| Farid | Frontend admin y negocio | Tailwind, Supabase Auth, Supabase Storage |
| Xavier | QA, datos semilla, polish UI | Postman, Tailwind, datos JSON |
### Empleado del negocio
1. Accede a modulos asignados.
2. Completa contenido y prueba corta.
3. Sube evidencia cuando aplique.

### Admin
1. Gestiona catalogo de modulos e insignias.
2. Valida evidencias pendientes.
3. Audita eventos de insignias y visibilidad.

### SuperAdmin
1. Soporte operativo y datos.
2. Monitoreo de integridad del directorio.

## 2. Flujo de insignias (core)
1. `learning_completions` recibe nuevo resultado validado.
2. Se evalua regla en `badge_requirements`.
3. Se actualiza `business_badges`.
4. Se registra evento en `badge_events`.
5. Se refresca `directory_profiles` para exposicion publica.

## 3. Flujo tecnico de entrega (equipo)
### Orden recomendado
1. Backend: migraciones y endpoints base de negocio.
2. Backend: aprendizaje y recalc de insignias.
3. Backend: endpoint publico de directorio.
4. Frontend negocio (cuando se habilite), sin tocar frontend turista.

### Regla de integracion
- Cualquier cambio a request/response se refleja primero en `API.md`.
- Cualquier cambio a tablas se refleja primero en `SCHEMA.md` y `TABLAS.md`.

lib/
├── gemini.ts                          # Fidel
├── equity.ts                          # Fidel
├── cultural.ts                        # Fidel
├── businesses.ts                      # Fidel (mock) → Alan (Supabase)
├── itinerary.ts                       # Fidel (mock) → Alan (Supabase)
├── maps.ts                            # Fidel
├── supabase.ts                        # Alan
├── supabase-client.ts                 # Alan
└── tools/
    ├── index.ts                       # Fidel
    ├── itinerary.ts                   # Fidel
    └── maps.ts                        # Fidel

components/
├── ui/                                # Xavier (polish)
├── tourist/                           # Emi
├── business/                          # Farid
└── admin/                             # Farid

app/
├── page.tsx                           # Emi
├── auth/                              # Alan
├── (tourist)/                         # Emi
├── (business)/                        # Farid
├── (admin)/                           # Farid
├── (superadmin)/                      # Farid
└── api/
    ├── chat/route.ts                  # Fidel
    ├── recommend/route.ts             # Fidel
    ├── itinerary/                     # Fidel
    ├── businesses/                    # Alan
    ├── requests/                      # Alan
    └── visits/route.ts               # Alan
```

---

## Ramas de trabajo

Nadie pushea directo a `main`. Cada integrante trabaja sobre su rama fija.

```
main                          ← solo Fidel mergea aquí
├── feat/fidel-ia             ← Fidel
├── feat/alan-backend         ← Alan
├── feat/emi-frontend         ← Emi
├── feat/farid-admin          ← Farid
└── feat/xavier-qa-ui         ← Xavier
```

### Qué debe subir cada quien en su rama

- Fidel en `feat/fidel-ia`: arquitectura, IA, algoritmo y APIs de IA (`constants/index.ts`, `lib/gemini.ts`, `lib/equity.ts`, `lib/cultural.ts`, `lib/tools/*`, `app/api/chat/route.ts`, `app/api/recommend/route.ts`, `app/api/itinerary/route.ts`, `next.config.ts`).
- Alan en `feat/alan-backend`: auth, base de datos y endpoints de negocio (`middleware.ts`, `lib/supabase.ts`, `lib/supabase-client.ts`, `app/auth/callback/route.ts`, `app/api/businesses/*`, `app/api/requests/*`, `app/api/visits/route.ts`, `supabase/migrations/*`).
- Emi en `feat/emi-frontend`: flujo del turista y experiencia móvil/offline (`hooks/useItinerary.ts`, `hooks/useGeolocation.ts`, `hooks/useAuth.ts`, `components/tourist/*`, `app/(tourist)/*`, `app/page.tsx`).
- Farid en `feat/farid-admin`: login/registro, panel admin, panel de negocio y superadmin (`app/auth/login/page.tsx`, `app/auth/register/page.tsx`, `components/business/*`, `components/admin/*`, `app/(business)/*`, `app/(admin)/*`, `app/(superadmin)/*`).
- Xavier en `feat/xavier-qa-ui`: QA, tipos compartidos, datos semilla y polish visual (`types/types.ts`, `components/ui/*`, `seed/negocios.json`, ajustes visuales acordados).

Regla: cada quien sube solo cambios de su área y si necesita tocar archivos de otra persona, lo avisa antes en el equipo para evitar choques de merge.

---

## Flujo diario de trabajo

### Antes de empezar a codear

```bash
git pull origin main          # siempre primero
git checkout feat/tu-rama     # usa siempre la rama fija de tu rol
```

### Antes de subir cambios — obligatorio en este orden

```bash
npm run dev                   # ¿funciona en el browser?
npx tsc --noEmit              # ¿TypeScript sin errores?
npm run build                 # ¿build de producción limpio?
```

Si cualquiera de los tres falla — **no subes**. Lo arreglas primero.

```bash
git add archivo1.ts archivo2.tsx    # agrega solo tus archivos, nunca git add .
git commit -m "feat: descripción clara de qué hiciste"
git push origin feat/tu-rama
```

### Flujo de merge a main

```
1. Tú subes tu rama fija (feat/tu-rama)
2. Xavier revisa en la preview URL de Vercel
   → prueba el flujo completo como usuario real
   → da observaciones o da el visto bueno
   → si pule UI: corre npm run build antes de avisar
3. Xavier le avisa a Fidel: "feat/mi-rama lista para merge"
4. Fidel corre npm run build local con la rama
5. Si pasa → merge a main → Vercel despliega automático
```

---

## Orden de importancia y dependencias

### 1. Alan — el cuello de botella crítico

Sin schema y sin datos reales, nadie puede conectar nada.
**Lo primero que hace Alan:** levantar Supabase, aplicar migraciones, publicar endpoints base.
Nadie empieza a codear contra un endpoint que Alan no haya documentado en `API.md`.

### 2. Xavier — desbloquea dos momentos distintos

**Momento 1 — Datos semilla** (día 1, mañana):
Sin datos de negocios verosímiles, el algoritmo de equidad no tiene qué mostrar.
Xavier genera el JSON de 50 negocios antes de que Fidel conecte `lib/equity.ts` a Supabase.

**Momento 2 — QA y polish** (día 2):
Revisa cada rama antes del merge. Es el filtro entre el código y `main`.

### 3. Fidel, Emi, Farid — trabajan en paralelo

Son independientes entre sí siempre que los contratos de API estén definidos.
Fidel trabaja con mocks hasta que Alan tenga los endpoints listos.
Emi y Farid trabajan con datos hardcodeados hasta que Fidel tenga los API routes.

---

## Archivos por persona

### Fidel

| Archivo | Qué hace |
|---------|----------|
| `constants/index.ts` | Modelo de Gemini y constantes globales — si cambia el modelo, solo aquí |
| `lib/gemini.ts` | Cliente Gemini + ciclo `while` de function calling |
| `lib/equity.ts` | Algoritmo de equidad: `score = (relevancia × proximidad) + β - saturación` |
| `lib/cultural.ts` | Parámetros culturales por país: precio accesible, tolerancia de caminata, preferencias |
| `lib/businesses.ts` | `buscarNegocios()` — mock hoy, Supabase cuando Alan esté listo |
| `lib/itinerary.ts` | `agregarEvento()`, `leerItinerario()` — mock hoy, Supabase después |
| `lib/tools/index.ts` | Junta declarations y handlers de todos los dominios para Gemini |
| `lib/tools/itinerary.ts` | Tool declarations + handlers: buscar_negocios, agregar_evento, leer_itinerario |
| `lib/tools/maps.ts` | Tool declarations + handlers: buscar_ruta, geocodificar |
| `app/api/chat/route.ts` | BFF del chat — recibe mensaje, llama Gemini, devuelve respuesta |
| `app/api/recommend/route.ts` | BFF de recomendaciones — aplica cultural + equity → 4-6 tarjetas |
| `app/api/itinerary/route.ts` | BFF de itinerario — genera y edita itinerario con Gemini |
| `next.config.ts` | Configuración de Next.js y PWA |
| `.env.local` / `.env.example` | Variables de entorno del servidor — nunca en git |

### Alan

| Archivo | Qué hace |
|---------|----------|
| `middleware.ts` | RBAC — lee el JWT de Supabase y redirige al grupo correcto por rol |
| `lib/supabase.ts` | Cliente Supabase con service role — solo en servidor |
| `lib/supabase-client.ts` | Cliente Supabase para el browser — solo para auth |
| `app/auth/callback/route.ts` | Callback de OAuth Google — Supabase lo llama tras autenticación |
| `app/api/businesses/` | GET negocios con filtros, GET detalle, PATCH edición por encargado |
| `app/api/requests/` | POST nueva solicitud, GET lista admin, claim/approve/reject/release |
| `app/api/visits/route.ts` | POST visita — alimenta `daily_business_saturation` para el algoritmo |
| `supabase/migrations/` | Migraciones SQL — schema completo, enums, índices, RLS, triggers |

### Emi

| Archivo | Qué hace |
|---------|----------|
| `hooks/useItinerary.ts` | Sincroniza itinerario con localStorage — funciona offline |
| `hooks/useGeolocation.ts` | Captura lat/lng del browser con `navigator.geolocation` |
| `hooks/useAuth.ts` | Lee sesión activa de Supabase en el cliente |
| `components/tourist/BusinessCard.tsx` | Tarjeta deslizable con foto, nombre, distancia y sello Ola México |
| `components/tourist/BusinessMap.tsx` | Mapa con pins de negocios recomendados |
| `components/tourist/Questionnaire.tsx` | Flujo conversacional de onboarding del turista |
| `components/tourist/ItineraryView.tsx` | Vista de eventos del itinerario por día |
| `app/(tourist)/onboarding/page.tsx` | Cuestionario + pregunta de boleto de partido |
| `app/(tourist)/map/page.tsx` | Mapa + tarjetas deslizables con recomendaciones |
| `app/(tourist)/itinerary/page.tsx` | Itinerario completo + descarga PDF |
| `app/(tourist)/profile/page.tsx` | Editar idioma, país y preferencias del turista |
| `app/page.tsx` | Pantalla de bienvenida — entrada por QR, sin login requerido |

### Farid

| Archivo | Qué hace |
|---------|----------|
| `app/auth/login/page.tsx` | Login con Google OAuth + email/password |
| `app/auth/register/page.tsx` | Registro para EncargadoDelNegocio |
| `components/business/RequestForm.tsx` | Formulario de alta de negocio (21 campos) |
| `components/admin/RequestCard.tsx` | Card de solicitud pendiente con estado y última acción |
| `components/admin/ReviewForm.tsx` | Formulario para aprobar o rechazar con comentario obligatorio |
| `app/(business)/request/page.tsx` | Formulario completo de solicitud de negocio |
| `app/(business)/profile/page.tsx` | Perfil del negocio aprobado — edición limitada |
| `app/(admin)/requests/page.tsx` | Lista de solicitudes filtrable por estado |
| `app/(admin)/requests/[id]/page.tsx` | Vista de revisión — claim, aprobar o rechazar |
| `app/(superadmin)/tickets/page.tsx` | Gestión de tickets técnicos |
| `app/(superadmin)/monitoring/page.tsx` | Saturación en tiempo real y audit logs |

### Xavier

| Archivo | Qué hace |
|---------|----------|
| `types/types.ts` | Tipos TypeScript compartidos por todo el proyecto |
| `components/ui/` | Componentes compartidos: Button, Card, Input, Badge |
| `seed/negocios.json` | 50 negocios verosímiles con coords, fotos y sello Ola México |

---
## 4. Ramas sugeridas
- `feat/business-profile-api`
- `feat/learning-completions-api`
- `feat/badges-engine-api`
- `feat/public-directory-api`

## Cambios
| Fecha | Quien | Que |
|---|---|---|
| 2026-04-07 | Alan | v2.0 - Flujos actualizados a enfoque negocio y pipeline de insignias. |
