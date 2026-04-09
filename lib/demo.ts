import type { InsightContext } from '@/types/types'
import {
  DEMO_TOKEN,
  DEMO_USER_ID,
  DEMO_BUSINESS_ID,
  DEMO_BUSINESS_NAME,
  DEMO_BOROUGH,
  DEMO_INSIGHT,
} from '@/constants/demo-data'

export { DEMO_TOKEN, DEMO_USER_ID, DEMO_BUSINESS_ID, DEMO_BUSINESS_NAME, DEMO_BOROUGH, DEMO_INSIGHT }

/** true cuando faltan las env vars de Supabase */
export function isDemoMode(): boolean {
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY
}

export function isDemoToken(token: string): boolean {
  return token === DEMO_TOKEN
}

export const DEMO_INSIGHT_CONTEXT: InsightContext = {
  negocio: {
    businessId:                DEMO_BUSINESS_ID,
    nombre:                    DEMO_BUSINESS_NAME,
    descripcion:               'Taquería tradicional mexicana con más de 10 años de experiencia en Coyoacán.',
    categoria:                 'Gastronomía',
    alcaldia:                  DEMO_BOROUGH,
    satStatus:                 'EN_PROCESO',
    operationModes:            ['presencial', 'domicilio'],
    accessibilityNeedsNegocio: [],
    teamSize:                  4,
    businessStartRange:        'MAS_5',
    modulosCompletados: [
      { slug: 'servicio-seguro',  title: 'Servicio Seguro',  category: 'profesional', score: 92, status: 'PASSED' },
      { slug: 'primeros-auxilios', title: 'Primeros Auxilios', category: 'profesional', score: 85, status: 'PASSED' },
    ],
    insigniasActivas:   ['SERVICIO_SEGURO'],
    insigniasPendientes: ['NEGOCIO_FORMAL', 'PAGOS_DIGITALES', 'ACCESIBILIDAD_TOTAL'],
  },
  zona: DEMO_INSIGHT.zona,
  catalogo: {
    modulosDisponibles: [
      { slug: 'atencion-personas-discapacidad', title: 'Atención a Personas con Discapacidad', category: 'profesional', audience: 'BOTH' },
      { slug: 'registro-sat',                  title: 'Formalízate — Registro ante el SAT',    category: 'formaliza',   audience: 'OWNER' },
      { slug: 'lengua-senas-basico',            title: 'Lengua de Señas Mexicana — Nivel Básico', category: 'profesional', audience: 'BOTH' },
      { slug: 'pagos-digitales',               title: 'Pagos Digitales y e-Commerce',          category: 'digitaliza',  audience: 'OWNER' },
      { slug: 'atencion-cliente-turismo',      title: 'Atención al Cliente de Excelencia',     category: 'vende',       audience: 'BOTH' },
    ],
  },
}
