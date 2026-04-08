import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { apiError, apiOk, isNonEmptyString } from '@/lib/api-response';
import { supabaseAdmin } from '@/lib/supabase';

interface RegisterBody {
  email?: unknown;
  password?: unknown;
  fullName?: unknown;
  language?: unknown;
  countryOfOrigin?: unknown;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  let body: RegisterBody;

  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return apiError('VALIDATION_ERROR', 'Body JSON invalido', 400);
  }

  const { email, password, fullName, language, countryOfOrigin } = body;

  if (
    !isNonEmptyString(email) ||
    !isNonEmptyString(password) ||
    !isNonEmptyString(fullName) ||
    !isNonEmptyString(language) ||
    !isNonEmptyString(countryOfOrigin)
  ) {
    return apiError(
      'VALIDATION_ERROR',
      'email, password, fullName, language y countryOfOrigin son obligatorios',
      400,
    );
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    return apiError('VALIDATION_ERROR', 'email tiene formato invalido', 400);
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
    await supabaseAdmin.auth.admin.getUserById(userId);

  if (adminUserError || !adminUserData.user) {
    return apiError(
      'INTERNAL_ERROR',
      'El usuario no existe en auth.users del proyecto configurado en service role. Revisa que NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY pertenezcan al mismo proyecto.',
      500,
    );
  }

  const { error: profileError } = await supabaseAdmin.from('users_profile').upsert({
    id: userId,
    full_name: fullName,
    language_code: language,
    country_of_origin: countryOfOrigin,
    email_verified: false,
  });

  if (profileError) {
    return apiError('INTERNAL_ERROR', profileError.message, 500);
  }

  const { data: roleRows, error: roleError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('code', 'TURISTA')
    .limit(1);

  if (roleError || !roleRows || roleRows.length === 0) {
    return apiError('INTERNAL_ERROR', 'No se encontro rol TURISTA', 500);
  }

  const turistaRoleId = roleRows[0].id;

  const { error: userRoleError } = await supabaseAdmin.from('user_roles').upsert(
    {
      user_id: userId,
      role_id: turistaRoleId,
      created_by: userId,
    },
    { onConflict: 'user_id,role_id' },
  );

  if (userRoleError) {
    return apiError('INTERNAL_ERROR', userRoleError.message, 500);
  }

  return apiOk(
    {
      userId,
      emailVerificationSent: true,
    },
    201,
  );
}
