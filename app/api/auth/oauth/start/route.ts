import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';

interface OAuthStartBody {
  provider?: unknown;
  redirectTo?: unknown;
}

type OAuthProvider = 'google' | 'apple';

function isValidProvider(value: unknown): value is OAuthProvider {
  return value === 'google' || value === 'apple';
}

function getAnonClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function POST(request: NextRequest) {
  let body: OAuthStartBody;

  try {
    body = (await request.json()) as OAuthStartBody;
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON invalido', 400);
  }

  const { provider, redirectTo } = body;

  if (!isValidProvider(provider) || !isNonEmptyString(redirectTo)) {
    return apiError('VALIDATION_ERROR', 'provider y redirectTo son obligatorios', 400);
  }

  const anonClient = getAnonClient();
  if (!anonClient) {
    return apiError('INTERNAL_ERROR', 'Falta configuracion de Supabase anon key', 500);
  }

  const { data, error } = await anonClient.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });

  if (error || !data.url) {
    return apiError('INTERNAL_ERROR', error?.message || 'No fue posible iniciar OAuth', 500);
  }

  return apiOk({ authUrl: data.url });
}
