import * as itinerario from './itinerario'
// import * as mapbox   from './mapbox'    ← cuando Emi lo agregue
// import * as calendar from './calendar'  ← cuando se integre Google Calendar

export const declarations = [
  ...itinerario.declarations,
]

export const handlers: Record<string, (args: never) => unknown> = {
  ...itinerario.handlers,
}
