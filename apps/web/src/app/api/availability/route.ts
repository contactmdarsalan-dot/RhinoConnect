import { buildAvailability, createAvailabilityBlock } from '@/server/repository';
import { readDb } from '@/server/storage';
import { handleApi, jsonOk, parseJsonBody } from '@/server/http';
import { availabilityBlockCreateSchema } from '@/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return handleApi(async () => jsonOk(buildAvailability(await readDb())));
}

export async function POST(request: Request) {
  return handleApi(async () => {
    const input = availabilityBlockCreateSchema.parse(await parseJsonBody(request));
    return jsonOk(await createAvailabilityBlock(input), { status: 201 });
  });
}
