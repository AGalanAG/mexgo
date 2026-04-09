import { NextRequest } from 'next/server';

import { getAuthenticatedUser, userHasAnyRole } from '@/lib/auth-helpers';
import { apiError, apiOk } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return apiError('AUTH_REQUIRED', 'Token Bearer requerido', 401);
  }

  const hasRole = await userHasAnyRole(user.id, ['ENCARGADO_NEGOCIO', 'EMPLEADO_NEGOCIO']);
  if (!hasRole) {
    return apiError('FORBIDDEN', 'Rol no autorizado para consultar perfil de negocio', 403);
  }

  const supabase = getSupabaseAdmin();

  const ownedBusinessResult = await supabase
    .from('business_profiles')
    .select('*')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ownedBusinessResult.error) {
    return apiError('INTERNAL_ERROR', ownedBusinessResult.error.message, 500);
  }

  let businessProfile = ownedBusinessResult.data;
  let businessSource: 'owner' | 'team_member' | 'none' = businessProfile ? 'owner' : 'none';

  if (!businessProfile) {
    const teamMembershipResult = await supabase
      .from('business_team_members')
      .select('business_id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (teamMembershipResult.error) {
      return apiError('INTERNAL_ERROR', teamMembershipResult.error.message, 500);
    }

    const teamBusinessId = teamMembershipResult.data?.business_id;
    if (teamBusinessId) {
      const teamBusinessProfileResult = await supabase
        .from('business_profiles')
        .select('*')
        .eq('id', teamBusinessId)
        .limit(1)
        .maybeSingle();

      if (teamBusinessProfileResult.error) {
        return apiError('INTERNAL_ERROR', teamBusinessProfileResult.error.message, 500);
      }

      businessProfile = teamBusinessProfileResult.data;
      businessSource = businessProfile ? 'team_member' : 'none';
    }
  }

  const requestsByOwnerResult = await supabase
    .from('business_requests')
    .select('*')
    .eq('owner_user_id', user.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (requestsByOwnerResult.error) {
    return apiError('INTERNAL_ERROR', requestsByOwnerResult.error.message, 500);
  }

  const requestData = requestsByOwnerResult.data;

  return apiOk({
    ownerUserId: user.id,
    request: requestData,
    businessProfile,
    source: businessSource,
    hasData: Boolean(requestData || businessProfile),
  });
}
