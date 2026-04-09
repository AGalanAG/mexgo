import type { BusinessInsight } from '@/types/types'

export const DEMO_TOKEN       = 'mexgo-demo'
export const DEMO_USER_ID     = 'demo-user-00000000-0001'
export const DEMO_BUSINESS_ID = 'demo-biz-00000000-0001'
export const DEMO_BUSINESS_NAME = 'Tacos El Pastorcito'
export const DEMO_BOROUGH       = 'Coyoacán'

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
