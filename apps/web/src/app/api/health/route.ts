import { getDataFilePath } from '@/server/storage';
import { handleApi, jsonOk } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handleApi(async () =>
    jsonOk({
      status: 'ok',
      service: 'rhinopeak-connect',
      storage: getDataFilePath(),
      timestamp: new Date().toISOString(),
    })
  );
}
