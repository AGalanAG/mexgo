import type { BusinessProfile } from '@/types/types'

// Hoy: mock data
// Mañana: reemplaza el cuerpo con query a Supabase — nada más cambia

export function buscarNegocios(_tipo: string): BusinessProfile[] {
  return [
    {
      id: 'neg-001',
      businessRequestId: 'req-001',
      ownerUserId: 'usr-001',
      businessName: 'Tacos El Güero',
      businessDescription: 'Taquería tradicional del centro',
      boroughCode: 'CUAUHTEMOC',
      neighborhood: 'Centro Histórico',
      latitude: 19.4326,
      longitude: -99.1332,
      locationSource: 'mock',
      operationDaysHours: 'Lun-Dom 8:00-22:00',
      socialLinks: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'neg-002',
      businessRequestId: 'req-002',
      ownerUserId: 'usr-002',
      businessName: 'Taquería La Familia',
      businessDescription: 'La mejor taquería del barrio desde 1990',
      boroughCode: 'CUAUHTEMOC',
      neighborhood: 'Doctores',
      latitude: 19.4198,
      longitude: -99.1467,
      locationSource: 'mock',
      operationDaysHours: 'Lun-Sab 9:00-21:00',
      socialLinks: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
}
