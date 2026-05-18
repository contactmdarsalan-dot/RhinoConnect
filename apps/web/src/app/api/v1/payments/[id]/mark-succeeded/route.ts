import { handleApi } from '@/server/http';
import { getMobileUserFromRequest, markMobilePaymentSucceeded } from '@/server/mobile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  return handleApi(async () => {
    const user = await getMobileUserFromRequest(request);
    const { id } = await context.params;
    return Response.json(await markMobilePaymentSucceeded(user, id));
  });
}
