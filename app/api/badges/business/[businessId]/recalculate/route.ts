import { apiError } from '@/lib/api-response';

export async function POST() {
  return apiError('NOT_FOUND', 'La funcionalidad de insignias fue retirada del sistema', 410);
}
