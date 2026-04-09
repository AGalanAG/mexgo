import { Type } from '@google/genai'
import type { FunctionDeclaration } from '@google/genai'
import { buscarNegocios } from '@/lib/businesses'
import { agregarEvento, editarEvento, eliminarEvento, leerItinerario } from '@/lib/itinerario'

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
    name: 'editar_evento',
    description: 'Edita una parada del itinerario. Úsala cuando el turista quiera cambiar el día, hora o nombre de una parada existente. Primero llama leer_itinerario para obtener el id correcto.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        id:     { type: Type.STRING, description: 'ID de la parada a editar.' },
        dia:    { type: Type.STRING, description: 'Nueva fecha, formato YYYY-MM-DD. Opcional.' },
        hora:   { type: Type.STRING, description: 'Nueva hora, formato HH:MM. Opcional.' },
        nombre: { type: Type.STRING, description: 'Nuevo nombre o etiqueta. Opcional.' },
      },
      required: ['id'],
    },
  },
  {
    name: 'eliminar_evento',
    description: 'Elimina una parada del itinerario. Úsala cuando el turista quiera quitar un lugar de su plan. Primero llama leer_itinerario para obtener el id correcto.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: 'ID de la parada a eliminar.' },
      },
      required: ['id'],
    },
  },
  {
    name: 'leer_itinerario',
    description: 'Lee el itinerario actual del turista con todos los ids. Úsala para confirmar cambios o cuando el turista quiera ver su plan.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },
]

export function createItinerarioHandlers(userId: string): Record<string, (args: never) => unknown> {
  return {
    buscar_negocios: ({ tipo }: { tipo: string }) => buscarNegocios(tipo),
    agregar_evento:  (args: { negocio_id: string; nombre: string; dia: string; hora: string }) => agregarEvento(userId, args),
    editar_evento:   (args: { id: string; dia?: string; hora?: string; nombre?: string }) => editarEvento(userId, args),
    eliminar_evento: (args: { id: string }) => eliminarEvento(userId, args),
    leer_itinerario: () => leerItinerario(userId),
  }
}
