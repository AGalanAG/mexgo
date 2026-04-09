import type { TouristProfile } from '@/types/types'
import * as itinerario from './itinerario'
import { declarations as recommendDeclarations, createRecommendHandlers } from './recommend'

export const declarations = [
  ...itinerario.declarations,
  ...recommendDeclarations,
]

export function createHandlers(userId: string, perfil?: TouristProfile): Record<string, (args: never) => unknown> {
  return {
    ...itinerario.createItinerarioHandlers(userId),
    ...createRecommendHandlers(perfil),
  }
}
