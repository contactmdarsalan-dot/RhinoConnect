import { handleApi } from '@/server/http';
import { getMobileUserFromRequest } from '@/server/mobile';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleApi(async () => {
    const user = await getMobileUserFromRequest(request);
    return Response.json({
      id: user.id,
      email: user.email,
      full_name: user.name,
      country: user.country,
      role: 'customer',
      is_verified: true,
      created_at: user.createdAt,
    });
  });
}
