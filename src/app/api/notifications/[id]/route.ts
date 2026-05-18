import { markNotification } from '@/server/repository';
import { handleApi, jsonOk, parseJsonBody } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  return handleApi(async () => {
    const { id } = await params;
    const body = (await parseJsonBody(request)) as { read?: boolean };
    return jsonOk(await markNotification(id, body.read ?? true));
  });
}
