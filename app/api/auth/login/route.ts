import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { getPrimaryRole, getUserRoleCodes } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase';

interface LoginBody {
  email?: unknown;
  password?: unknown;
}

function getAnonClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  let body: LoginBody;

  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON invalido', 400);
  }

  const { email, password } = body;

  if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
    return apiError('VALIDATION_ERROR', 'email y password son obligatorios', 400);
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return apiError('VALIDATION_ERROR', 'email tiene formato invalido', 400);
  }

  const anonClient = getAnonClient();
  if (!anonClient) {
    return apiError('INTERNAL_ERROR', 'Falta configuracion de Supabase anon key', 500);
  }

  const { data, error } = await anonClient.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data.user || !data.session) {
    return apiError('AUTH_REQUIRED', error?.message || 'Credenciales invalidas', 401);
  }

  const roleCodes = await getUserRoleCodes(data.user.id);
  const primaryRole = getPrimaryRole(roleCodes);

  return apiOk({
    user: {
      id: data.user.id,
      email: data.user.email,
      emailConfirmedAt: data.user.email_confirmed_at,
    },
    session: {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresIn: data.session.expires_in,
      expiresAt: data.session.expires_at,
      tokenType: data.session.token_type,
    },
    roleCodes,
    primaryRole,
  });
}
