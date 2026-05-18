import { getBootstrap, updateBusiness } from '@/server/repository';
import { handleApi, jsonOk, parseJsonBody } from '@/server/http';
import { businessUpdateSchema } from '@/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handleApi(async () => {
    const bootstrap = await getBootstrap();
    return jsonOk(bootstrap.business);
  });
}

export async function PATCH(request: Request) {
  return handleApi(async () => {
    const input = businessUpdateSchema.parse(await parseJsonBody(request));
    return jsonOk(await updateBusiness(input));
  });
}
