# Estructura base de datos - MexGo


---

## 1. Eje de Identidad y Acceso (Auth)
Gestiona quién entra a la plataforma y qué puede hacer.

| Tabla | Función en la Aplicación |
| :--- | :--- |
| `users_profile` | **Perfil de Usuario:** Almacena datos personales (nombre, país, idioma). Se usa para personalizar la interfaz y el idioma de las respuestas de la IA. |
| `roles` | **Catálogo de Permisos:** Define si el usuario es `TURISTA`, `ENCARGADO_NEGOCIO` o `EMPLEADO_NEGOCIO`. *Nota: Los roles ADMIN fueron deshabilitados.* |
| `user_roles` | **Asignación de Roles:** Vincula a los usuarios de Auth con sus permisos específicos. |

---

## 2. Ecosistema de Negocios (Onboarding y Gestión)
Permite a los comercios locales unirse a la red de MexGo.

| Tabla | Función en la Aplicación |
| :--- | :--- |
| `business_profiles` | **Ficha Técnica del Negocio:** Contiene la información que ve el turista (nombre, descripción, geolocalización). Es la tabla principal para el mapa y el buscador. |
| `business_requests` | **Expediente de Registro:** Almacena datos socioeconómicos detallados recopilados durante el registro (estatus SAT, número de empleados, horarios). Estos datos son críticos para que el **Gemini Insight Engine** genere consejos de mejora. |
| `business_team_members` | **Gestión de Personal:** Permite que el dueño del negocio invite a empleados para que realicen los cursos de capacitación. |
| `business_insights_cache` | **Cerebro del Negocio:** Guarda los informes generados por la IA de Google (Gemini). Incluye alertas de mercado y recomendaciones de cursos basadas en la zona y el perfil del negocio. |

---

## 3. Experiencia del Turista (Personalización y Viaje)
Transforma las preferencias del usuario en planes accionables.

| Tabla | Función en la Aplicación |
| :--- | :--- |
| `tourist_questionnaires` | **Onboarding del Turista:** Guarda los intereses y necesidades de accesibilidad del viajero. Es el "input" principal para el motor de recomendaciones. |
| `recommendations` | **Historial de Sugerencias:** Registra cada set de negocios recomendados por la IA para un usuario en un momento dado. |
| `recommendation_items` | **Detalle de Recomendación:** Almacena los negocios específicos sugeridos, su ranking (1-6) y las razones personalizadas por las que se recomiendan. |
| `itineraries` | **Planes de Viaje:** Cabecera de los itinerarios guardados por el usuario. |
| `itinerary_stops` | **Agenda Diaria:** Lista cronológica de lugares a visitar cada día, incluyendo horarios y tipo de parada (Negocio MexGo o Punto de Interés). |
| `itinerary_daily_routes` | **Optimización de Ruta:** Cache de las rutas generadas por Mapbox. Guarda la geometría del camino y tiempos estimados de traslado para no recalcular innecesariamente. |

---

## 4. Capacitación y Progreso (Learning)
El brazo educativo para fortalecer a los micro-negocios.

| Tabla | Función en la Aplicación |
| :--- | :--- |
| `learning_sources` | **Proveedores de Contenido:** Identifica si un curso viene de Fundación Coppel, Protección Civil, etc. |
| `learning_modules` | **Catálogo Educativo:** Lista de cursos disponibles, su duración estimada y puntaje mínimo para aprobar. |
| `business_learning_progress`| **Tablero de Control:** Muestra al dueño del negocio qué cursos ha completado su equipo y cuál es su puntuación más alta. Se usa para motivar la mejora continua. |
| `learning_completions` | **Libro de Calificaciones:** Registro detallado de cada intento de examen, permitiendo auditoría de qué empleado realizó qué capacitación. |

---

## 5. Motor de Equidad y Métricas
Asegura que todos los negocios tengan visibilidad y evita la saturación.

| Tabla | Función en la Aplicación |
| :--- | :--- |
| `visits` | **Sensor de Actividad:** Registra cada interacción real (ver en mapa, click en "cómo llegar", check-in). Es la materia prima para el algoritmo de equidad. |
| `daily_business_saturation` | **Semáforo de Carga:** Calcula diariamente qué tan "lleno" o "visible" ha estado un negocio. Si un negocio tiene mucha saturación, el algoritmo lo prioriza menos en futuras recomendaciones para dar oportunidad a otros. |
| `directory_profiles` | **Vista de Lectura Rápida:** Una tabla optimizada que combina datos de negocio y reputación para que la página de "Descubrir" cargue instantáneamente. |

---

## 6. Estado de Simplificación (Legacy)
Tablas que pueden aparecer en el código pero cuyas funciones han sido migradas o pausadas:
*   **Insignias (`badges`)**: Eliminadas físicamente. La lógica de "reconocimiento" ahora se maneja vía `business_learning_progress`.
*   **Chat y Soporte**: Las tablas de mensajería interna y tickets fueron removidas para simplificar el MVP, moviendo la comunicación hacia canales externos (WhatsApp registrado en `business_requests`).
*   **Aprobación Manual**: El flujo de `business_request_reviews` fue eliminado. Los negocios ahora pasan a `ACTIVE` automáticamente tras completar su perfil.
