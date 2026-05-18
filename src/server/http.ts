import { ZodError } from 'zod';

export class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return Response.json(
    { data },
    {
      status: init?.status ?? 200,
      headers: {
        'Cache-Control': 'no-store',
        ...(init?.headers ?? {}),
      },
    }
  );
}

export function jsonError(message: string, status = 400, details?: unknown) {
  return Response.json(
    { error: { message, details } },
    {
      status,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}

export async function handleApi(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof ApiError) {
      return jsonError(error.message, error.status, error.details);
    }

    if (error instanceof ZodError) {
      return jsonError('Validation failed', 422, error.flatten());
    }

    console.error(error);
    return jsonError('Unexpected server error', 500);
  }
}

export async function parseJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError('Request body must be valid JSON', 400);
  }
}

export function getPagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get('page') ?? 1) || 1);
  const requestedLimit = Math.max(1, Number(searchParams.get('limit') ?? 25) || 25);
  const limit = Math.min(requestedLimit, 100);
  return { page, limit };
}
