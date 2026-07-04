import type {
  ApiResponse as SharedApiResponse,
  PaginatedApiResponse,
  PaginationMeta,
} from '@repo/shared';

/**
 * Base response interface for all API responses
 */
export type BaseResponse = Pick<SharedApiResponse<unknown>, 'success' | 'meta'>;

/**
 * Success response interface
 */
export type SuccessResponse<T = unknown> = SharedApiResponse<T>;

/**
 * Error response interface
 */
export interface ErrorResponse extends BaseResponse {
  success: false;
  /** Error details */
  error: {
    /** Error code */
    code: string;
    /** Error message */
    message: string;
    /** Optional additional error details */
    details?: unknown;
  };
}

/**
 * Pagination information interface
 */
export type PaginationInfo = PaginationMeta;

/**
 * Paginated response interface
 */
export type PaginatedSuccessResponse<T = unknown> = PaginatedApiResponse<T>;

/**
 * Raw response wrapper to bypass the response interceptor
 */
export interface RawResponse<T = unknown> {
  __raw: true;
  data: T;
}

/**
 * Helper function to create a raw response that bypasses the interceptor
 */
export function createRawResponse<T = unknown>(data: T): RawResponse<T> {
  return {
    __raw: true,
    data,
  };
}

/**
 * Type guard to check if a response is a raw response
 */
export function isRawResponse(data: RawResponse): data is RawResponse {
  return data && typeof data === 'object' && data.__raw === true;
}

/**
 * ============================================================================
 * API RESPONSE DECORATOR TYPES
 * ============================================================================
 */

/**
 * Options for API response configuration
 */
export interface ApiResponseOptions {
  /** Custom status code for the response */
  statusCode?: number;

  /** Additional metadata to include in the response */
  metadata?: Record<string, any>;

  /** Custom headers to set on the response */
  headers?: Record<string, string>;

  /** Whether to include request ID in the response */
  includeRequestId?: boolean;

  /** Custom response transformation function */
  transform?: (data: any) => any;
}

/**
 * Metadata stored by API response decorators
 */
export interface ApiSuccessMetadata {
  message?: string;
  options?: ApiResponseOptions;
}

export interface ApiCustomMetadata {
  statusCode: number;
  message?: string;
  options?: ApiResponseOptions;
}

export interface ApiErrorMetadata {
  message?: string;
  statusCode: number;
}

/**
 * Union type for all API response metadata
 */
export type ApiResponseMetadata =
  | { type: 'success'; data: ApiSuccessMetadata }
  | { type: 'custom'; data: ApiCustomMetadata }
  | { type: 'error'; data: ApiErrorMetadata }
  | { type: 'raw'; data: boolean };
