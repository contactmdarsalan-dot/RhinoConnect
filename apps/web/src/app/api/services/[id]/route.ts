import { deleteService, getService, updateService } from '@/server/repository';
import { handleApi, jsonOk, parseJsonBody } from '@/server/http';
import { serviceUpdateSchema } from '@/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  return handleApi(async () => {
    const { id } = await params;
    return jsonOk(await getService(id));
  });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  return handleApi(async () => {
    const { id } = await params;
    const input = serviceUpdateSchema.parse(await parseJsonBody(request));
    return jsonOk(await updateService(id, input));
  });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  return handleApi(async () => {
    const { id } = await params;
    return jsonOk(await deleteService(id));
  });
}
