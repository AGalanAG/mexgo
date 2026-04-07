import { Type } from '@google/genai'
import type { FunctionDeclaration } from '@google/genai'
import { buscarNegocios } from '@/lib/businesses'
import { agregarEvento, leerItinerario } from '@/lib/itinerario'

export const declarations: FunctionDeclaration[] = [
  {
    name: 'buscar_negocios',
    description: 'Busca negocios locales verificados. Úsala cuando el turista pregunte por lugares para comer, comprar o visitar.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tipo: {
          type: Type.STRING,
          description: 'Categoría: taquería, café, artesanías, mercado, etc.',
        },
      },
      required: ['tipo'],
    },
  },
  {
    name: 'agregar_evento',
    description: 'Agrega un negocio al itinerario del turista. Úsala cuando el turista confirme que quiere visitar un lugar en una fecha y hora específica.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        negocio_id: { type: Type.STRING, description: 'ID del negocio.' },
        nombre:     { type: Type.STRING, description: 'Nombre del negocio.' },
        dia:        { type: Type.STRING, description: 'Fecha de la visita, formato YYYY-MM-DD.' },
        hora:       { type: Type.STRING, description: 'Hora de la visita, formato HH:MM.' },
      },
      required: ['negocio_id', 'nombre', 'dia', 'hora'],
    },
  },
  {
    name: 'leer_itinerario',
    description: 'Lee el itinerario actual del turista. Úsala para confirmar que un evento fue agregado correctamente.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },
]

export const handlers: Record<string, (args: never) => unknown> = {
  buscar_negocios: ({ tipo }: { tipo: string }) => buscarNegocios(tipo),
  agregar_evento:  (args: { negocio_id: string; nombre: string; dia: string; hora: string }) => agregarEvento(args),
  leer_itinerario: () => leerItinerario(),
}
