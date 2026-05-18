import { handleApi, parseJsonBody } from '@/server/http';
import { createMobileBooking, getMobileBookings, getMobileUserFromRequest } from '@/server/mobile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleApi(async () => {
    const user = await getMobileUserFromRequest(request);
    return Response.json(await getMobileBookings(user));
  });
}

export async function POST(request: Request) {
  return handleApi(async () => {
    const user = await getMobileUserFromRequest(request);
    return Response.json(await createMobileBooking(user, await parseJsonBody(request)), { status: 201 });
  });
}
