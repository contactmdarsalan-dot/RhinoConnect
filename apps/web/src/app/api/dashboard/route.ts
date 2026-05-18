import { getDashboard } from '@/server/repository';
import { handleApi, jsonOk } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handleApi(async () => jsonOk(await getDashboard()));
}
