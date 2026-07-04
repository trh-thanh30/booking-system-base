import { z } from 'zod';

const DEFAULT_RESPONSE_VERSION = 'v1';

export const defaultFilterQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sort_by: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export function createApiResponseMeta(
  input: {
    requestId?: string;
    timestamp?: string;
    version?: string;
  } = {},
) {
  return {
    timestamp: input.timestamp ?? new Date().toISOString(),
    version: input.version ?? DEFAULT_RESPONSE_VERSION,
    ...(input.requestId ? { requestId: input.requestId } : {}),
  };
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: Parameters<typeof createApiResponseMeta>[0],
) {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
    meta: createApiResponseMeta(meta),
  };
}

export function createErrorResponse(
  message: string,
  meta?: Parameters<typeof createApiResponseMeta>[0],
) {
  return {
    success: false,
    message,
    meta: createApiResponseMeta(meta),
  };
}

export function createPaginationMeta(
  page: number,
  limit: number,
  total: number,
) {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string,
  meta?: Parameters<typeof createApiResponseMeta>[0],
) {
  return {
    ...createSuccessResponse(data, message, meta),
    pagination: createPaginationMeta(page, limit, total),
  };
}
