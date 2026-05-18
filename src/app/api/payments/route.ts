import type { NextRequest } from 'next/server';
import { listPayments } from '@/server/repository';
import { getPagination, handleApi, jsonOk } from '@/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return handleApi(async () => {
    const { page, limit } = getPagination(request.nextUrl.searchParams);
    return jsonOk(
      await listPayments({
        page,
        limit,
        status: request.nextUrl.searchParams.get('status'),
      })
    );
  });
}
