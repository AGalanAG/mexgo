import { NextRequest } from 'next/server';

import { getAuthenticatedUser, getPrimaryRole, getUserRoleCodes } from '@/lib/auth-helpers';
import { apiError, apiOk } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  const roleCodes = await getUserRoleCodes(user.id);
  const primaryRole = getPrimaryRole(roleCodes);

  const { data: profile } = await getSupabaseAdmin()
    .from('users_profile')
    .select('full_name, avatar_url, language_code, country_of_origin, email_verified')
    .eq('id', user.id)
    .maybeSingle();

  return apiOk({
    user: {
      id: user.id,
      email: user.email,
      emailConfirmedAt: user.email_confirmed_at,
    },
    profile: profile
      ? {
          fullName: profile.full_name,
          avatarUrl: profile.avatar_url,
          languageCode: profile.language_code,
          countryOfOrigin: profile.country_of_origin,
          emailVerified: profile.email_verified,
        }
      : null,
    roleCodes,
    primaryRole,
  });
}
