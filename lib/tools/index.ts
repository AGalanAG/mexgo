import * as itinerario from './itinerario'
import * as recommend  from './recommend'
// import * as calendar from './calendar'  ← cuando se integre Google Calendar

export const declarations = [
  ...itinerario.declarations,
  ...recommend.declarations,
]

export const handlers: Record<string, (args: never) => unknown> = {
  ...itinerario.handlers,
  ...recommend.handlers,
}
