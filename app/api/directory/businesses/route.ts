import { NextRequest } from 'next/server';

import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';
import { MOCK_BUSINESSES } from '@/lib/businesses';
import { isDemoMode } from '@/lib/demo';

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

export async function GET(request: NextRequest) {
  // Demo/local fallback cuando Supabase no está configurado
  if (isDemoMode()) {
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

  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const q = searchParams.get('q');
  const badge = searchParams.get('badge');
  const category = searchParams.get('category');
  const city = searchParams.get('city');

  const page = parsePositiveInt(searchParams.get('page'), 1);
  const pageSize = Math.min(parsePositiveInt(searchParams.get('pageSize'), 20), 100);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = getSupabaseAdmin()
    .from('directory_profiles')
    .select('*', { count: 'exact' })
    .order('public_score', { ascending: false })
    .range(from, to);

  if (isNonEmptyString(q)) {
    query = query.ilike('public_name', `%${q}%`);
  }

  if (isNonEmptyString(city)) {
    query = query.eq('city', city);
  }

  if (isNonEmptyString(category)) {
    query = query.contains('categories', [category]);
  }

  if (isNonEmptyString(badge)) {
    query = query.contains('badge_codes', [badge]);
  }

  const { data, error, count } = await query;

  if (error) {
    return apiError('INTERNAL_ERROR', error.message, 500);
  }

  if (!data || data.length === 0) {
    let fallbackQuery = getSupabaseAdmin()
      .from('business_profiles')
      .select('id, business_name, business_description, borough, neighborhood, latitude, longitude, created_at', {
        count: 'exact',
      })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (isNonEmptyString(q)) {
      fallbackQuery = fallbackQuery.or(
        `business_name.ilike.%${q}%,business_description.ilike.%${q}%`,
      );
    }

    if (isNonEmptyString(city)) {
      fallbackQuery = fallbackQuery.or(`borough.ilike.%${city}%,neighborhood.ilike.%${city}%`);
    }

    const {
      data: fallbackBusinesses,
      error: fallbackError,
      count: fallbackCount,
    } = await fallbackQuery;

    if (fallbackError) {
      return apiError('INTERNAL_ERROR', fallbackError.message, 500);
    }

    const fallbackItems = (fallbackBusinesses || []).map((business) => ({
      businessId: business.id,
      publicName: business.business_name,
      shortDescription: business.business_description,
      categories: [],
      badgeCodes: [],
      city: business.neighborhood,
      state: business.borough,
      publicScore: 0,
      businessName: business.business_name,
      businessDescription: business.business_description,
      borough: business.borough,
      neighborhood: business.neighborhood,
      latitude: business.latitude,
      longitude: business.longitude,
      operationDaysHours: null,
      coverImageUrl: null,
    }));

    return apiOk({
      items: fallbackItems,
      pagination: {
        page,
        pageSize,
        total: fallbackCount ?? 0,
      },
    });
  }

  const businessIds = (data || []).map((item) => item.business_id);

  let businessById = new Map<string, {
    id: string;
    business_name: string;
    business_description: string;
    borough: string | null;
    neighborhood: string | null;
    latitude: number | null;
    longitude: number | null;
  }>();

  if (businessIds.length > 0) {
    const { data: businessRows, error: businessError } = await getSupabaseAdmin()
      .from('business_profiles')
      .select('id, business_name, business_description, borough, neighborhood, latitude, longitude')
      .in('id', businessIds);

    if (businessError) {
      return apiError('INTERNAL_ERROR', businessError.message, 500);
    }

    businessById = new Map((businessRows || []).map((row) => [row.id, row]));
  }

  const items = (data || []).map((item) => {
    const business = businessById.get(item.business_id);

    return {
      businessId: item.business_id,
      publicName: item.public_name,
      shortDescription: item.short_description,
      categories: item.categories || [],
      badgeCodes: item.badge_codes || [],
      city: item.city,
      state: item.state,
      publicScore: Number(item.public_score ?? 0),
      businessName: business?.business_name ?? item.public_name,
      businessDescription: business?.business_description ?? item.short_description,
      borough: business?.borough ?? null,
      neighborhood: business?.neighborhood ?? null,
      latitude: business?.latitude ?? null,
      longitude: business?.longitude ?? null,
      operationDaysHours: null,
      coverImageUrl: null,
    };
  });

  return apiOk({
    items,
    pagination: {
      page,
      pageSize,
      total: count ?? 0,
    },
  });
}
