import { NextRequest } from 'next/server';

import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ businessId: string }> },
) {
  const { businessId } = await context.params;

  if (!isNonEmptyString(businessId)) {
    return apiError('VALIDATION_ERROR', 'businessId invalido', 400);
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('directory_profiles')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle();

  if (profileError) {
    return apiError('INTERNAL_ERROR', profileError.message, 500);
  }

  if (!profile) {
    return apiError('NOT_FOUND', 'Perfil publico no encontrado', 404);
  }

  const { data: events, error: eventsError } = await supabaseAdmin
    .from('directory_events')
    .select('event_type, source, occurred_at')
    .eq('business_id', businessId)
    .order('occurred_at', { ascending: false })
    .limit(20);

  if (eventsError) {
    return apiError('INTERNAL_ERROR', eventsError.message, 500);
  }

  return apiOk({
    profile,
    recentEvents: events || [],
  });
}
