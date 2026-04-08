import { apiError, apiOk } from '@/lib/api-response';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from('badge_definitions')
    .select('id, code, public_name, description, icon_key, is_active, created_at')
    .eq('is_active', true)
    .order('code', { ascending: true });

  if (error) {
    return apiError('INTERNAL_ERROR', error.message, 500);
  }

  return apiOk({
    items: (data || []).map((badge) => ({
      id: badge.id,
      code: badge.code,
      publicName: badge.public_name,
      description: badge.description,
      iconKey: badge.icon_key,
      isActive: badge.is_active,
      createdAt: badge.created_at,
    })),
  });
}
