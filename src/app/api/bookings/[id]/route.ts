import { deleteBooking, getBooking, updateBooking } from '@/server/repository';
import { handleApi, jsonOk, parseJsonBody } from '@/server/http';
import { bookingUpdateSchema } from '@/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  return handleApi(async () => {
    const { id } = await params;
    return jsonOk(await getBooking(id));
  });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  return handleApi(async () => {
    const { id } = await params;
    const input = bookingUpdateSchema.parse(await parseJsonBody(request));
    return jsonOk(await updateBooking(id, input));
  });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  return handleApi(async () => {
    const { id } = await params;
    return jsonOk(await deleteBooking(id));
  });
}
