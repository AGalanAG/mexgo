import * as itinerario from './itinerario'
import * as recommend  from './recommend'
// import * as calendar from './calendar'  ← cuando se integre Google Calendar

export const declarations = [
  ...itinerario.declarations,
  ...recommend.declarations,
]

export function createItinerarioHandlers(userId: string) {
  return itinerario.createItinerarioHandlers(userId)
}

export function createHandlers(userId: string): Record<string, (args: never) => unknown> {
  return {
    ...itinerario.createItinerarioHandlers(userId),
    ...recommend.handlers,
  }
}
