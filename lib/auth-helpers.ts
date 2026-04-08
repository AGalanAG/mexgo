import type { NextRequest } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase';

export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function userHasRole(userId: string, roleCode: string) {
  const { data: roleRows, error: rolesError } = await supabaseAdmin
    .from('roles')
    .select('id')
    .eq('code', roleCode)
    .limit(1);

  if (rolesError || !roleRows || roleRows.length === 0) {
    return false;
  }

  const roleId = roleRows[0].id;

  const { data: userRoleRows, error: userRolesError } = await supabaseAdmin
    .from('user_roles')
    .select('user_id')
    .eq('user_id', userId)
    .eq('role_id', roleId)
    .limit(1);

  if (userRolesError) {
    return false;
  }

  return Boolean(userRoleRows && userRoleRows.length > 0);
}

export async function userHasAnyRole(userId: string, roleCodes: string[]) {
  for (const roleCode of roleCodes) {
    const hasRole = await userHasRole(userId, roleCode);
    if (hasRole) {
      return true;
    }
  }

  return false;
}
