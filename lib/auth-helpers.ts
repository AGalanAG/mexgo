import type { NextRequest } from 'next/server';
import type { User } from '@supabase/supabase-js';

import { getSupabaseAdmin } from '@/lib/supabase';
import { isDemoToken, DEMO_USER_ID } from '@/lib/demo';

export type PlatformRoleCode =
  | 'TURISTA'
  | 'ENCARGADO_NEGOCIO'
  | 'EMPLEADO_NEGOCIO';

const ROLE_PRIORITY: Record<PlatformRoleCode, number> = {
  ENCARGADO_NEGOCIO: 0,
  EMPLEADO_NEGOCIO: 1,
  TURISTA: 2,
};

const ROLE_DESCRIPTIONS: Record<PlatformRoleCode, string> = {
  TURISTA: 'Usuario turista de la plataforma',
  ENCARGADO_NEGOCIO: 'Encargado de negocio registrado',
  EMPLEADO_NEGOCIO: 'Empleado operativo de negocio',
};

export function normalizeRoleCode(value: unknown): PlatformRoleCode | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  if (
    normalized === 'TURISTA' ||
    normalized === 'ENCARGADO_NEGOCIO' ||
    normalized === 'EMPLEADO_NEGOCIO'
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

  // Demo mode: bypass Supabase
  if (isDemoToken(token)) {
    return {
      id:             DEMO_USER_ID,
      email:          'demo@mexgo.mx',
      app_metadata:   {},
      user_metadata:  {},
      aud:            'authenticated',
      created_at:     new Date().toISOString(),
    } as User;
  }

  const { data, error } = await getSupabaseAdmin().auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function userHasRole(userId: string, roleCode: string) {
  if (userId === DEMO_USER_ID) return true;

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
  if (userId === DEMO_USER_ID) return true;

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
  let { data: roleRows, error: roleError } = await getSupabaseAdmin()
    .from('roles')
    .select('id')
    .eq('code', roleCode)
    .limit(1);

  if (roleError) {
    return { ok: false as const, error: roleError.message };
  }

  if (!roleRows || roleRows.length === 0) {
    const { error: seedRoleError } = await getSupabaseAdmin().from('roles').insert({
      code: roleCode,
      description: ROLE_DESCRIPTIONS[roleCode],
    });

    if (seedRoleError) {
      return {
        ok: false as const,
        error: `No se encontro rol ${roleCode} y no fue posible sembrarlo: ${seedRoleError.message}`,
      };
    }

    const seededRoleResult = await getSupabaseAdmin()
      .from('roles')
      .select('id')
      .eq('code', roleCode)
      .limit(1);

    roleRows = seededRoleResult.data;
    roleError = seededRoleResult.error;

    if (roleError || !roleRows || roleRows.length === 0) {
      return {
        ok: false as const,
        error: roleError?.message || `No se encontro rol ${roleCode} despues de sembrarlo`,
      };
    }
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
