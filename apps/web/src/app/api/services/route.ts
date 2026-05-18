import { createService, listServices } from '@/server/repository';
import { handleApi, jsonOk, parseJsonBody } from '@/server/http';
import { serviceCreateSchema } from '@/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handleApi(async () => {
    return jsonOk(await listServices());
  });
}

export async function POST(request: Request) {
  return handleApi(async () => {
    const input = serviceCreateSchema.parse(await parseJsonBody(request));
    return jsonOk(await createService(input), { status: 201 });
  });
}
