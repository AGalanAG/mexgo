import { Type } from '@google/genai'
import type { FunctionDeclaration } from '@google/genai'
import { agregarEventosLote, editarEventosLote, eliminarEventosLote, leerItinerario } from '@/lib/itinerario'

export const declarations: FunctionDeclaration[] = [
  {
    name: 'agregar_eventos_lote',
    description: 'Agrega una o varias paradas al itinerario. Úsala siempre que el turista quiera agregar lugares, ya sea uno solo o un día completo.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        eventos: {
          type: Type.ARRAY,
          description: 'Lista de eventos a agregar en orden cronológico.',
          items: {
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
      },
      required: ['eventos'],
    },
  },
  {
    name: 'editar_eventos_lote',
    description: 'Edita una o varias paradas del itinerario. Primero llama leer_itinerario para obtener los ids correctos.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        ediciones: {
          type: Type.ARRAY,
          description: 'Lista de ediciones a aplicar.',
          items: {
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
      },
      required: ['ediciones'],
    },
  },
  {
    name: 'eliminar_eventos_lote',
    description: 'Elimina una o varias paradas del itinerario. Primero llama leer_itinerario para obtener los ids correctos.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        ids: {
          type: Type.ARRAY,
          description: 'Lista de IDs de paradas a eliminar.',
          items: { type: Type.STRING },
        },
      },
      required: ['ids'],
    },
  },
  {
    name: 'leer_itinerario',
    description: 'Lee el itinerario actual del turista con todos los ids. Úsala antes de editar o eliminar, o cuando el turista quiera ver su plan.',
    parameters: {
      type: Type.OBJECT,
      properties: {},
      required: [],
    },
  },
]

export function createItinerarioHandlers(userId: string): Record<string, (args: never) => unknown> {
  return {
    agregar_eventos_lote: (args: { eventos: { negocio_id: string; nombre: string; dia: string; hora: string }[] }) => agregarEventosLote(userId, args),
    editar_eventos_lote:  (args: { ediciones: { id: string; dia?: string; hora?: string; nombre?: string }[] }) => editarEventosLote(userId, args),
    eliminar_eventos_lote:(args: { ids: string[] }) => eliminarEventosLote(userId, args),
    leer_itinerario:      () => leerItinerario(userId).map(({ id, label, routeDate, startTime }) => ({ id, label, routeDate, startTime })),
  }
}
