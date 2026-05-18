import { createBooking, getPublicBusiness } from '@/server/repository';
import { ApiError, handleApi, jsonOk, parseJsonBody } from '@/server/http';
import { bookingCreateSchema } from '@/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleApi(async () => {
    const body = (await parseJsonBody(request)) as Record<string, unknown>;
    const slug = typeof body.businessSlug === 'string' ? body.businessSlug : '';
    if (!slug) throw new ApiError('businessSlug is required', 422);

    await getPublicBusiness(slug);
    const input = bookingCreateSchema.parse({
      ...body,
      source: 'public-booking',
    });

    return jsonOk(await createBooking(input), { status: 201 });
  });
}
