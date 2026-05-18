import { handleApi } from '@/server/http';
import { getMobileServices } from '@/server/mobile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handleApi(async () => Response.json(await getMobileServices()));
}
