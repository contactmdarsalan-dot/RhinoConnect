import { handleApi, parseJsonBody } from '@/server/http';
import { createMobilePaymentIntent, getMobileUserFromRequest } from '@/server/mobile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleApi(async () => {
    const user = await getMobileUserFromRequest(request);
    return Response.json(await createMobilePaymentIntent(user, await parseJsonBody(request)), { status: 201 });
  });
}
