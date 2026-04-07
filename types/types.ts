// ─── ENUMS ────────────────────────────────────────────────────────────────────

export type RoleCode =
  | 'TURISTA'
  | 'ENCARGADO_NEGOCIO'
  | 'ADMIN'
  | 'SUPERADMIN'

export type StatusBusinessRequest =
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'RECHAZADO'
  | 'APROBADO'

export type TrainingCampus = 'HUB_AZTECA' | 'MIDE'

export type BusinessStartRange = 'MENOS_1_ANO' | 'A1_A3' | 'A3_A5' | 'MAS_5'

export type SatStatus =
  | 'FORMAL_REGISTRADO'
  | 'EN_PROCESO'
  | 'NO_PERO_INTERESA'
  | 'TAL_VEZ'
  | 'NO_NO_INTERESA'

export type VisitEventType =
  | 'VIEW'
  | 'CLICK_DIRECTIONS'
  | 'CHECKIN'
  | 'PURCHASE_CONFIRMED'

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'

export type StopType = 'BUSINESS' | 'POI' | 'MATCH' | 'CUSTOM'

export type ItineraryStatus = 'draft' | 'saved' | 'archived'

// ─── USUARIOS Y RBAC ──────────────────────────────────────────────────────────

export interface UserProfile {
  id: string
  fullName: string
  avatarUrl?: string
  languageCode: string
  countryOfOrigin: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

// ─── NEGOCIOS ─────────────────────────────────────────────────────────────────

export interface BusinessProfile {
  id: string
  businessRequestId: string
  ownerUserId: string
  businessName: string
  businessDescription: string
  boroughCode: string
  neighborhood: string
  googleMapsUrl?: string
  latitude: number
  longitude: number
  geocodedAt?: string
  locationSource: string
  operationDaysHours: string
  socialLinks: string[]
  coverImageUrl?: string
  contactPhone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BusinessRequest {
  id: string
  ownerUserId?: string
  ownerFullName: string
  ownerAge: number
  ownerGender: string
  ownerEmail: string
  ownerWhatsapp: string
  boroughCode: string
  neighborhood: string
  googleMapsUrl?: string
  latitude?: number
  longitude?: number
  geocodeSource?: string
  geocodeConfidence?: number
  trainingCampusHint?: TrainingCampus
  employeesWomenCount: number
  employeesMenCount: number
  businessName: string
  businessDescription: string
  businessStartRange: BusinessStartRange
  continuousOperationTime: string
  operationDaysHours: string
  operationModes: string[]
  operationModesOther?: string
  satStatus: SatStatus
  socialLinks: string[]
  adaptationForWorldCup: string
  supportUsage: string
  trainingCampusPreference: TrainingCampus
  additionalComments?: string
  status: StatusBusinessRequest
  currentLockAdminUserId?: string
  lockAcquiredAt?: string
  lockExpiresAt?: string
  submittedAt: string
  updatedAt: string
}

// ─── ITINERARIO ───────────────────────────────────────────────────────────────

export interface Itinerary {
  id: string
  touristUserId: string
  recommendationId?: string
  status: ItineraryStatus
  version: number
  itineraryPayload: unknown
  createdAt: string
  updatedAt: string
}

export interface ItineraryStop {
  id: string
  itineraryId: string
  routeDate: string
  stopOrder: number
  stopType: StopType
  businessProfileId?: string
  label: string
  startTime?: string
  endTime?: string
  latitude: number
  longitude: number
  createdAt: string
}

// ─── RECOMENDACIONES ──────────────────────────────────────────────────────────

export interface Recommendation {
  id: string
  touristUserId: string
  questionnaireId?: string
  contextPayload: unknown
  createdAt: string
}

export interface RecommendationItem {
  id: string
  recommendationId: string
  businessProfileId: string
  rank: number
  score: number
  reasons: string[]
  estimatedWalkMinutes?: number
  createdAt: string
}

// ─── VISITAS ──────────────────────────────────────────────────────────────────

export interface Visit {
  id: string
  touristUserId: string
  businessProfileId: string
  recommendationId?: string
  itineraryId?: string
  source: 'itinerary' | 'map' | 'card'
  eventType: VisitEventType
  occurredAt: string
  localDay: string
  lat?: number
  lng?: number
  countedForEquity: boolean
  dedupeKey: string
  createdAt: string
}

// ─── CHAT / GEMINI ────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

export interface ChatRequest {
  mensaje: string
  historial?: ChatMessage[]
}

export interface ChatResponse {
  respuesta: string
  eventoAgregado?: ItineraryStop
}
