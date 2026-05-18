import { deleteAvailabilityBlock } from '@/server/repository';
import { handleApi, jsonOk } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  return handleApi(async () => {
    const { id } = await params;
    return jsonOk(await deleteAvailabilityBlock(id));
  });
}
