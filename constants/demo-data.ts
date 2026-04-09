import type { BusinessInsight, InsightContext, ItineraryStop, NegocioConScore } from '@/types/types'
import { MOCK_BUSINESSES } from '@/lib/businesses'

/** Recomendaciones mock listas para guardar en localStorage en modo demo */
export const DEMO_RECOMMENDATIONS: NegocioConScore[] = MOCK_BUSINESSES.map((b, i) => ({
  ...b,
  score: 0.9 - i * 0.1,
  reasons: ['negocio verificado Ola México'],
  estimatedWalkMinutes: 5 + i * 3,
}))

export const DEMO_TOKEN       = 'mexgo-demo'
export const DEMO_USER_ID     = 'demo-user-00000000-0001'
export const DEMO_BUSINESS_ID = 'demo-biz-00000000-0001'
export const DEMO_BUSINESS_NAME = 'Tacos El Pastorcito'
export const DEMO_BOROUGH       = 'Coyoacán'
export const DEMO_TOURIST_NAME  = 'Viajero Demo'

export const DEMO_INSIGHT: BusinessInsight = {
  resumen:
    'Tu negocio en Coyoacán opera en una de las zonas turísticas más activas de CDMX. El 39% de los turistas en tu zona reportan necesidades de accesibilidad, y los principales visitantes provienen de EUA, Canadá y Francia con interés en gastronomía y cultura local.',
  zona: {
    alcaldia: 'Coyoacán',
    totalTuristasRegistrados: 320,
    paisesTop: ['EUA', 'Canadá', 'Francia'],
    motivosTop: ['gastronomy', 'cultural', 'sports'],
    accessibilityBreakdown: {
      ninguna:     58,
      movilidad:   18,
      baja_vision: 12,
      sordera:      9,
      otra:         3,
    },
    estadiaPromedio: '4-7 días',
    promedioSaturacionZona: 0.72,
    diasMasActivos: ['Sábado', 'Domingo', 'Viernes'],
  },
  negocio: {
    modulos_completados: 2,
    modulos_totales:     11,
    progreso_pct:        18,
    insignias_activas:   ['SERVICIO_SEGURO'],
    insignias_pendientes: ['NEGOCIO_FORMAL', 'PAGOS_DIGITALES', 'ACCESIBILIDAD_TOTAL'],
  },
  alertas: [
    'El 39% de turistas en tu zona tienen necesidades de accesibilidad — completa módulos de inclusión',
    'Tu negocio aún no aparece en el directorio público — activa visibilidad para mayor alcance',
    'Insignia NEGOCIO_FORMAL pendiente — requiere completar el módulo de formalización SAT',
    'Alta afluencia de turistas internacionales que prefieren pago sin efectivo',
  ],
  oportunidades: [
    'Los turistas de tu zona priorizan gastronomía — tu categoría tiene potencial alto este trimestre',
    'Alta presencia de turistas de EUA — servicio básico en inglés puede aumentar ventas un 20%',
    'Grupos familiares son el segmento dominante — considera paquetes y menús familiares',
  ],
  cursos_recomendados: [
    {
      slug:             'atencion-personas-discapacidad',
      titulo:           'Atención a Personas con Discapacidad',
      categoria:        'profesional',
      razon:            'El 39% de turistas en Coyoacán tienen necesidades de accesibilidad — diferenciador clave de servicio',
      prioridad:        'alta',
      impacto_insignia: 'ACCESIBILIDAD_TOTAL',
    },
    {
      slug:             'registro-sat',
      titulo:           'Formalízate — Registro ante el SAT',
      categoria:        'formaliza',
      razon:            'Tu negocio no está dado de alta ante el SAT — requisito para insignia NEGOCIO_FORMAL',
      prioridad:        'alta',
      impacto_insignia: 'NEGOCIO_FORMAL',
    },
    {
      slug:             'lengua-senas-basico',
      titulo:           'Lengua de Señas Mexicana — Nivel Básico',
      categoria:        'profesional',
      razon:            '9% de turistas en tu zona son sordos — diferenciador clave de atención al cliente',
      prioridad:        'media',
      impacto_insignia: null,
    },
    {
      slug:             'pagos-digitales',
      titulo:           'Pagos Digitales y e-Commerce',
      categoria:        'digitaliza',
      razon:            'Turistas internacionales prefieren pago sin efectivo — necesario para insignia PAGOS_DIGITALES',
      prioridad:        'media',
      impacto_insignia: 'PAGOS_DIGITALES',
    },
    {
      slug:             'atencion-cliente-turismo',
      titulo:           'Atención al Cliente de Excelencia',
      categoria:        'vende',
      razon:            'Tu zona recibe principalmente turistas de EUA — inglés básico puede aumentar conversión',
      prioridad:        'media',
      impacto_insignia: null,
    },
  ],
}

export const DEMO_ITINERARY_STOPS: ItineraryStop[] = [
  {
    id: 'demo-stop-001',
    itineraryId: 'demo-itinerary-001',
    routeDate: '2026-06-14',
    stopOrder: 1,
    stopType: 'BUSINESS',
    businessProfileId: 'neg-001',
    label: 'Tacos El Güero',
    startTime: '09:00',
    latitude: 19.4326,
    longitude: -99.1332,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-stop-002',
    itineraryId: 'demo-itinerary-001',
    routeDate: '2026-06-14',
    stopOrder: 2,
    stopType: 'BUSINESS',
    businessProfileId: 'neg-002',
    label: 'Café Quinto',
    startTime: '11:30',
    latitude: 19.4122,
    longitude: -99.1728,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-stop-003',
    itineraryId: 'demo-itinerary-001',
    routeDate: '2026-06-14',
    stopOrder: 3,
    stopType: 'BUSINESS',
    businessProfileId: 'neg-004',
    label: 'Casa de Artesanías Coyoacán',
    startTime: '15:00',
    latitude: 19.3467,
    longitude: -99.1617,
    createdAt: new Date().toISOString(),
  },
]

export const DEMO_CHAT_HISTORY = {
  historial: [
    { role: 'user' as const, text: '¿Qué me recomiendas para desayunar en el Centro?' },
    { role: 'model' as const, text: '¡Perfecto! Para desayunar en el Centro Histórico, te recomiendo Tacos El Güero — un clásico desde 1978 con carnitas, suadero y pastor. ¿Lo agrego a tu itinerario del 14 de junio?' },
    { role: 'user' as const, text: 'Sí, agrégalo a las 9am' },
    { role: 'model' as const, text: '✅ ¡Listo! Agregué "Tacos El Güero" a tu itinerario el 14 de junio a las 9:00. También hay un café de especialidad increíble cerca, en la Condesa — ¿quieres que te cuente más?' },
  ],
  mensajes: [
    { role: 'user' as const, text: '¿Qué me recomiendas para desayunar en el Centro?' },
    { role: 'model' as const, text: '¡Perfecto! Para desayunar en el Centro Histórico, te recomiendo Tacos El Güero — un clásico desde 1978 con carnitas, suadero y pastor. ¿Lo agrego a tu itinerario del 14 de junio?' },
    { role: 'user' as const, text: 'Sí, agrégalo a las 9am' },
    {
      role: 'model' as const,
      text: '✅ ¡Listo! Agregué "Tacos El Güero" a tu itinerario el 14 de junio a las 9:00. También hay un café de especialidad increíble cerca, en la Condesa — ¿quieres que te cuente más?',
      eventoAgregado: {
        id: 'demo-stop-001',
        itineraryId: 'demo-itinerary-001',
        routeDate: '2026-06-14',
        stopOrder: 1,
        stopType: 'BUSINESS' as const,
        businessProfileId: 'neg-001',
        label: 'Tacos El Güero',
        startTime: '09:00',
        latitude: 19.4326,
        longitude: -99.1332,
        createdAt: new Date().toISOString(),
      },
    },
  ],
}

export const DEMO_INSIGHT_CONTEXT: InsightContext = {
  negocio: {
    businessId: DEMO_BUSINESS_ID,
    nombre: DEMO_BUSINESS_NAME,
    descripcion: 'Tacos tradicionales al pastor con 20 años de historia.',
    categoria: 'GASTRONOMIA',
    alcaldia: DEMO_BOROUGH,
    satStatus: 'REGISTRADO',
    operationModes: ['PRESENCIAL'],
    accessibilityNeedsNegocio: [],
    teamSize: 5,
    businessStartRange: '5-10 AÑOS',
    modulosCompletados: [],
    insigniasActivas: ['SERVICIO_SEGURO'],
    insigniasPendientes: ['NEGOCIO_FORMAL', 'PAGOS_DIGITALES'],
  },
  zona: {
    alcaldia: DEMO_BOROUGH,
    totalTuristasRegistrados: 320,
    paisesTop: ['EUA', 'Canadá', 'Francia'],
    motivosTop: ['gastronomy', 'cultural'],
    accessibilityBreakdown: {
      movilidad: 18,
      baja_vision: 12,
    },
    estadiaPromedio: '4-7 días',
    promedioSaturacionZona: 0.72,
    diasMasActivos: ['Sábado', 'Domingo'],
  },
  catalogo: {
    modulosDisponibles: [
      { slug: 'atencion-personas-discapacidad', title: 'Atención a Personas con Discapacidad', category: 'profesional', audience: 'BOTH' },
      { slug: 'registro-sat', title: 'Formalízate — Registro ante el SAT', category: 'formaliza', audience: 'OWNER' },
    ]
  }
}
