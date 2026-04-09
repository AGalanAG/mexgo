import { DEMO_TOKEN, DEMO_USER_ID, DEMO_BUSINESS_ID, DEMO_INSIGHT, DEMO_BUSINESS_NAME, DEMO_BOROUGH, DEMO_INSIGHT_CONTEXT } from '@/constants/demo-data';

export { DEMO_TOKEN, DEMO_USER_ID, DEMO_BUSINESS_ID, DEMO_INSIGHT, DEMO_BUSINESS_NAME, DEMO_BOROUGH, DEMO_INSIGHT_CONTEXT };

/** true solo cuando el token del request es el DEMO_TOKEN */
export function isDemoToken(token: string): boolean {
  return token === DEMO_TOKEN;
}

/**
 * @deprecated Usar isDemoToken(token) en lugar de isDemoMode().
 * isDemoMode() activa demo globalmente por env vars, lo que puede enmascarar
 * errores de configuración en producción.
 *
 * Para forzar modo demo aunque Supabase esté configurado, establece:
 *   DEMO_MODE=true
 * en las variables de entorno del proyecto.
 */
export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === 'true') return true;
  return !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}
