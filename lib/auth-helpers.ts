import type { NextRequest } from 'next/server';

import { getSupabaseAdmin } from '@/lib/supabase';

export type PlatformRoleCode =
  | 'TURISTA'
  | 'ENCARGADO_NEGOCIO'
  | 'EMPLEADO_NEGOCIO'
  | 'ADMIN'
  | 'SUPERADMIN';

const ROLE_PRIORITY: Record<PlatformRoleCode, number> = {
  SUPERADMIN: 0,
  ADMIN: 1,
  ENCARGADO_NEGOCIO: 2,
  EMPLEADO_NEGOCIO: 3,
  TURISTA: 4,
};

export function normalizeRoleCode(value: unknown): PlatformRoleCode | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (
    normalized === 'TURISTA' ||
    normalized === 'ENCARGADO_NEGOCIO' ||
    normalized === 'EMPLEADO_NEGOCIO' ||
    normalized === 'ADMIN' ||
    normalized === 'SUPERADMIN'
  ) {
    return normalized;
  }

  return null;
}

export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    return null;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return null;
  }

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function userHasRole(userId: string, roleCode: string) {
  const { data: roleRows, error: rolesError } = await getSupabaseAdmin()
    .from('roles')
    .select('id')
    .eq('code', roleCode)
    .limit(1);

  if (rolesError || !roleRows || roleRows.length === 0) {
    return false;
  }

  const roleId = roleRows[0].id;

  const { data: userRoleRows, error: userRolesError } = await getSupabaseAdmin()
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

export async function getUserRoleCodes(userId: string): Promise<PlatformRoleCode[]> {
  const { data, error } = await getSupabaseAdmin()
    .from('user_roles')
    .select('roles(code)')
    .eq('user_id', userId);

  if (error || !data) {
    return [];
  }

  const result: PlatformRoleCode[] = [];
  for (const row of data) {
    const roleCode = normalizeRoleCode((row as { roles?: { code?: unknown } | null }).roles?.code);
    if (roleCode) {
      result.push(roleCode);
    }
  }

  result.sort((a, b) => ROLE_PRIORITY[a] - ROLE_PRIORITY[b]);

  return result;
}

export function getPrimaryRole(roleCodes: PlatformRoleCode[]): PlatformRoleCode | null {
  if (roleCodes.length === 0) {
    return null;
  }

  return [...roleCodes].sort((a, b) => ROLE_PRIORITY[a] - ROLE_PRIORITY[b])[0];
}

export async function assignRoleToUser(
  userId: string,
  roleCode: PlatformRoleCode,
  createdBy?: string,
) {
  const { data: roleRows, error: roleError } = await getSupabaseAdmin()
    .from('roles')
    .select('id')
    .eq('code', roleCode)
    .limit(1);

  if (roleError || !roleRows || roleRows.length === 0) {
    return { ok: false as const, error: roleError?.message || `No se encontro rol ${roleCode}` };
  }

  const roleId = roleRows[0].id;

  const { error: userRoleError } = await getSupabaseAdmin().from('user_roles').upsert(
    {
      user_id: userId,
      role_id: roleId,
      created_by: createdBy || userId,
    },
    { onConflict: 'user_id,role_id' },
  );

  if (userRoleError) {
    return { ok: false as const, error: userRoleError.message };
  }

  return { ok: true as const };
}
