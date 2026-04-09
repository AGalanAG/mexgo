import { NextRequest } from 'next/server';

import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';
import { MOCK_BUSINESSES } from '@/lib/businesses';
import { isDemoMode, isDemoToken } from '@/lib/demo';

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function mockResponse() {
  const mockItems = MOCK_BUSINESSES.map(b => ({
    businessId:          b.id,
    publicName:          b.businessName,
    shortDescription:    b.businessDescription,
    categories:          [],
    badgeCodes:          [],
    city:                b.neighborhood,
    state:               b.boroughCode,
    publicScore:         80,
    businessName:        b.businessName,
    businessDescription: b.businessDescription,
    borough:             b.boroughCode,
    neighborhood:        b.neighborhood,
    latitude:            b.latitude,
    longitude:           b.longitude,
    operationDaysHours:  b.operationDaysHours,
    coverImageUrl:       b.coverImageUrl ?? null,
  }));
  return apiOk({ items: mockItems, pagination: { page: 1, pageSize: mockItems.length, total: mockItems.length } });
}

export async function GET(request: NextRequest) {
  // Demo token en el header → siempre mocks, independiente de Supabase
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : null;
  if (token && isDemoToken(token)) return mockResponse();

  // Sin Supabase configurado → mocks
  if (isDemoMode()) return mockResponse();

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const city = searchParams.get('city');

  const page = parsePositiveInt(searchParams.get('page'), 1);
  const pageSize = Math.min(parsePositiveInt(searchParams.get('pageSize'), 20), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {

  // Fuente principal: negocios activos. El directorio aporta metadatos publicos,
  // pero la paginacion estable se hace aqui para evitar errores por rango vacio.
  let businessesQuery = getSupabaseAdmin()
    .from('business_profiles')
    .select('id, business_name, business_description, borough, neighborhood, latitude, longitude, created_at', {
      count: 'exact',
    })
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .range(from, to);

  if (isNonEmptyString(q)) {
    businessesQuery = businessesQuery.ilike('business_name', `%${q}%`);
  }

  if (isNonEmptyString(city)) {
    businessesQuery = businessesQuery.or(`borough.ilike.%${city}%,neighborhood.ilike.%${city}%`);
  }

  const {
    data: businessRows,
    error: businessesError,
    count: businessesCount,
  } = await businessesQuery;

  const businessesOutOfRange = Boolean(
    businessesError?.message?.includes('Requested range not satisfiable')
  );

  if (businessesError && !businessesOutOfRange) {
    return apiError('INTERNAL_ERROR', businessesError.message, 500);
  }

  const businesses = businessesOutOfRange ? [] : (businessRows || []);
  const businessIds = businesses.map((b) => b.id);

  let directoryByBusinessId = new Map<string, {
    business_id: string;
    public_name: string;
    short_description: string;
    categories: string[] | null;
    city: string | null;
    state: string | null;
    public_score: number | null;
  }>();

  if (businessIds.length > 0) {
    let directoryQuery = getSupabaseAdmin()
      .from('directory_profiles')
      .select('business_id, public_name, short_description, categories, city, state, public_score')
      .in('business_id', businessIds);

    if (isNonEmptyString(category)) {
      directoryQuery = directoryQuery.contains('categories', [category]);
    }

    const { data: directoryRows, error: directoryError } = await directoryQuery;

    if (directoryError) {
      return apiError('INTERNAL_ERROR', directoryError.message, 500);
    }

    directoryByBusinessId = new Map((directoryRows || []).map((row) => [row.business_id, row]));
  }

  const items = businesses
    .filter((business) => {
      if (!isNonEmptyString(category)) {
        return true;
      }

      return directoryByBusinessId.has(business.id);
    })
    .map((business) => {
      const directory = directoryByBusinessId.get(business.id);

      return {
      businessId: business.id,
      publicName: directory?.public_name ?? business.business_name,
      shortDescription: directory?.short_description ?? business.business_description,
      categories: directory?.categories || [],
      city: directory?.city ?? business.neighborhood,
      state: directory?.state ?? business.borough,
      publicScore: Number(directory?.public_score ?? 0),
      businessName: business.business_name,
      businessDescription: business.business_description,
      borough: business.borough,
      neighborhood: business.neighborhood,
      latitude: business.latitude,
      longitude: business.longitude,
      operationDaysHours: null,
      coverImageUrl: null,
      };
    });

  const total = businessesOutOfRange ? 0 : (businessesCount ?? 0);

    return apiOk({
      items,
      pagination: {
        page,
        pageSize,
        total,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    // Algunas combinaciones de paginacion en PostgREST pueden lanzar este error;
    // para Discover debe comportarse como "sin resultados".
    if (message.includes('Requested range not satisfiable')) {
      return apiOk({
        items: [],
        pagination: {
          page,
          pageSize,
          total: 0,
        },
      });
    }

    return apiError('INTERNAL_ERROR', message, 500);
  }
}
