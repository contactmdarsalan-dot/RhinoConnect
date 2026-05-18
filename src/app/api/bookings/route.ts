import type { NextRequest } from 'next/server';
import { createBooking, listBookings } from '@/server/repository';
import { getPagination, handleApi, jsonOk, parseJsonBody } from '@/server/http';
import { bookingCreateSchema } from '@/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleApi(async () => {
    const { page, limit } = getPagination(request.nextUrl.searchParams);
    const result = await listBookings({
      page,
      limit,
      search: request.nextUrl.searchParams.get('search'),
      status: request.nextUrl.searchParams.get('status'),
      paymentStatus: request.nextUrl.searchParams.get('paymentStatus'),
    });
    return jsonOk(result);
  });
}

export async function POST(request: Request) {
  return handleApi(async () => {
    const input = bookingCreateSchema.parse(await parseJsonBody(request));
    return jsonOk(await createBooking(input), { status: 201 });
  });
}
