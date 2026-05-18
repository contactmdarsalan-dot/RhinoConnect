import type { NextRequest } from 'next/server';
import { createCustomer, listCustomers } from '@/server/repository';
import { getPagination, handleApi, jsonOk, parseJsonBody } from '@/server/http';
import { customerCreateSchema } from '@/server/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleApi(async () => {
    const { page, limit } = getPagination(request.nextUrl.searchParams);
    return jsonOk(
      await listCustomers({
        page,
        limit,
        search: request.nextUrl.searchParams.get('search'),
      })
    );
  });
}

export async function POST(request: Request) {
  return handleApi(async () => {
    const input = customerCreateSchema.parse(await parseJsonBody(request));
    return jsonOk(await createCustomer(input), { status: 201 });
  });
}
