import { handleApi, parseJsonBody } from '@/server/http';
import { loginMobileUser } from '@/server/mobile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleApi(async () => Response.json(await loginMobileUser(await parseJsonBody(request))));
}
