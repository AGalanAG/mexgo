import { NextRequest, NextResponse } from 'next/server'
import { buscarNegocios } from '@/lib/businesses'
import { calcularRecomendaciones, mockSaturacion } from '@/lib/equity'
import type { NegocioConScore } from '@/types/types'

// POST /api/recommend
// Recibe perfil del turista + coords → devuelve 4-6 negocios rankeados por equity

type RecommendRequest = {
  location: {
    lat: number
    lng: number
  }
  questionnaire?: Record<string, unknown>
  tipo?: string
}

type RecommendResponse = {
  ok: boolean
  data: NegocioConScore[]
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    body = {};
  }

  // Extraer con fallbacks (soporta {location: {lat, lng}} o {lat, lng} directo)
  const location = body.location || { 
    lat: body.lat || 19.4326, 
    lng: body.lng || -99.1332 
  };
  const questionnaire = body.questionnaire;
  const tipo = body.tipo;

  const negocios = buscarNegocios(tipo ?? '');
  const saturacion = mockSaturacion(negocios.map(n => n.id));

  const data = calcularRecomendaciones({
    negocios,
    saturacion,
    turistaLat: location.lat,
    turistaLng: location.lng,
    questionnaire,
  });

  return NextResponse.json({ ok: true, data });
}
