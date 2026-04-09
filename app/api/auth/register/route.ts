import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { assignRoleToUser, normalizeRoleCode } from '@/lib/auth-helpers';
import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { getSupabaseAdmin, getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase';

interface RegisterBody {
  email?: unknown;
  password?: unknown;
  fullName?: unknown;
  language?: unknown;
  countryOfOrigin?: unknown;
  roleCode?: unknown;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getAnonClient() {
  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

async function cleanupAuthUser(userId: string) {
  const { error } = await getSupabaseAdmin().auth.admin.deleteUser(userId);
  return { ok: !error, error };
}

export async function POST(request: NextRequest) {
  let body: RegisterBody;

  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON invalido', 400);
  }

  const { email, password, fullName, language, countryOfOrigin, roleCode } = body;

  const normalizedRoleCode = normalizeRoleCode(roleCode ?? 'TURISTA');

  if (!isNonEmptyString(email) || !isNonEmptyString(password) || !isNonEmptyString(fullName)) {
    return apiError(
      'VALIDATION_ERROR',
      'email, password y fullName son obligatorios',
      400,
    );
  }

  if (!normalizedRoleCode) {
    return apiError(
      'VALIDATION_ERROR',
      'roleCode invalido. Valores permitidos: TURISTA, ENCARGADO_NEGOCIO, EMPLEADO_NEGOCIO',
      400,
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return apiError('VALIDATION_ERROR', 'email tiene formato invalido', 400);
  }

  const resolvedLanguage = isNonEmptyString(language) ? language.trim() : 'es';
  const resolvedCountryOfOrigin = isNonEmptyString(countryOfOrigin) ? countryOfOrigin.trim() : 'MX';

  if (normalizedRoleCode === 'TURISTA') {
    if (!isNonEmptyString(language) || !isNonEmptyString(countryOfOrigin)) {
      return apiError(
        'VALIDATION_ERROR',
        'language y countryOfOrigin son obligatorios para rol TURISTA',
        400,
      );
    }
  }

  const anonClient = getAnonClient();
  if (!anonClient) {
    return apiError('INTERNAL_ERROR', 'Falta configuracion de Supabase anon key', 500);
  }

  const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (signUpError || !signUpData.user) {
    const isConflict = signUpError?.message.toLowerCase().includes('already');
    const isRateLimited = signUpError?.message.toLowerCase().includes('rate limit');
    return apiError(
      isRateLimited ? 'RATE_LIMITED' : isConflict ? 'CONFLICT' : 'INTERNAL_ERROR',
      signUpError?.message || 'No fue posible registrar el usuario',
      isRateLimited ? 429 : isConflict ? 409 : 500,
    );
  }

  const userId = signUpData.user.id;

  const { data: adminUserData, error: adminUserError } =
    await getSupabaseAdmin().auth.admin.getUserById(userId);

  if (adminUserError || !adminUserData.user) {
    await cleanupAuthUser(userId);
    return apiError(
      'INTERNAL_ERROR',
      'El usuario no existe en auth.users del proyecto configurado en service role. Revisa que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY pertenezcan al mismo proyecto.',
      500,
    );
  }

  const { error: profileError } = await getSupabaseAdmin().from('users_profile').upsert({
    id: userId,
    full_name: fullName,
    language_code: resolvedLanguage,
    country_of_origin: resolvedCountryOfOrigin,
    email_verified: false,
  });

  if (profileError) {
    await cleanupAuthUser(userId);
    return apiError('INTERNAL_ERROR', profileError.message, 500);
  }

  const roleAssignment = await assignRoleToUser(userId, normalizedRoleCode, userId);
  if (!roleAssignment.ok) {
    await cleanupAuthUser(userId);
    return apiError('INTERNAL_ERROR', roleAssignment.error, 500);
  }

  return apiOk(
    {
      userId,
      roleCode: normalizedRoleCode,
      emailVerificationSent: true,
    },
    201,
  );
}
