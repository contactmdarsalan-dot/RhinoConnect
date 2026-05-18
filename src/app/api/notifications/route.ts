import { getBootstrap, markAllNotificationsRead } from '@/server/repository';
import { handleApi, jsonOk } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handleApi(async () => {
    const bootstrap = await getBootstrap();
    return jsonOk(bootstrap.notifications);
  });
}

export async function PATCH() {
  return handleApi(async () => jsonOk(await markAllNotificationsRead()));
}
