export type RoleCode = 'TURISTA' | 'ENCARGADO_NEGOCIO' | 'ADMIN' | 'SUPERADMIN';

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  languageCode: string;
  countryOfOrigin: string;
  emailVerified: boolean;
}

export interface BusinessProfile {
  id: string;
  businessName: string;
  description: string;
  borough: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  coverImageUrl?: string;
  contactPhone?: string;
}

export interface ItineraryStop {
  id: string;
  itineraryId: string;
  routeDate: string;
  stopOrder: number;
  stopType: 'BUSINESS' | 'POI' | 'MATCH' | 'CUSTOM';
  businessProfileId?: string;
  label: string;
  startTime?: string;
  endTime?: string;
  latitude: number;
  longitude: number;
}
