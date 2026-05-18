import { getPublicBusiness } from '@/server/repository';
import { handleApi, jsonOk } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  return handleApi(async () => {
    const { slug } = await params;
    return jsonOk(await getPublicBusiness(slug));
  });
}
