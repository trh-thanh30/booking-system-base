import type {
  ApiResponse,
  PaginatedApiResponse,
  PaginationMeta,
} from "../types/index.ts";

const DEFAULT_RESPONSE_VERSION = "v1";

export type ApiResponseMetaInput = {
  requestId?: string;
  timestamp?: string;
  version?: string;
};

export function createApiResponseMeta(
  input: ApiResponseMetaInput = {},
): ApiResponse<unknown>["meta"] {
  return {
    timestamp: input.timestamp ?? new Date().toISOString(),
    version: input.version ?? DEFAULT_RESPONSE_VERSION,
    ...(input.requestId ? { requestId: input.requestId } : {}),
  };
}

export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: ApiResponseMetaInput,
): ApiResponse<T> {
  return {
    success: true,
    data,
    ...(message ? { message } : {}),
    meta: createApiResponseMeta(meta),
  };
}

export function createErrorResponse(
  message: string,
  meta?: ApiResponseMetaInput,
): ApiResponse<never> {
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
): PaginationMeta {
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
  meta?: ApiResponseMetaInput,
): PaginatedApiResponse<T> {
  return {
    ...createSuccessResponse(data, message, meta),
    pagination: createPaginationMeta(page, limit, total),
  };
}
