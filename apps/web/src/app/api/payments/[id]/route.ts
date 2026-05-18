import { updatePayment } from '@/server/repository';
import { handleApi, jsonOk, parseJsonBody } from '@/server/http';
import { paymentUpdateSchema } from '@/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  return handleApi(async () => {
    const { id } = await params;
    const input = paymentUpdateSchema.parse(await parseJsonBody(request));
    return jsonOk(await updatePayment(id, input));
  });
}
