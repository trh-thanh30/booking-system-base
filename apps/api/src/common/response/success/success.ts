import {
  createApiResponseMeta,
  createPaginationMeta,
  type ApiResponse as SharedApiResponse,
  type PaginatedApiResponse,
  type PaginationMeta,
} from '@repo/shared';

/**
 * Success Response Class
 * Provides standardized success responses following API structure guidelines
 * Implements Builder pattern for fluent API
 */
export class ApiResponse<T = unknown> implements SharedApiResponse<T> {
  public success: boolean;
  public data?: T;
  public message?: string;
  public meta: SharedApiResponse<T>['meta'];

  constructor(success: boolean, data?: T, message?: string) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.meta = createApiResponseMeta();
  }

  /**
   * Create a success response
   */
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  /**
   * Create an error response
   */
  static error(message: string): ApiResponse<never> {
    return new ApiResponse<never>(false, undefined, message);
  }

  /**
   * Add request ID to metadata
   */
  withRequestId(requestId: string): ApiResponse<T> {
    this.meta.requestId = requestId;
    return this;
  }

  /**
   * Convert to JSON object
   */
  toJSON(): SharedApiResponse<T> {
    const response: SharedApiResponse<T> = {
      success: this.success,
      meta: this.meta,
    };

    if (this.data !== undefined) {
      response.data = this.data;
    }

    if (this.message) {
      response.message = this.message;
    }

    return response;
  }
}

/**
 * Pagination Response Class
 * Extends ApiResponse for paginated data
 */
export class PaginatedResponse<T> extends ApiResponse<T[]> {
  public pagination: PaginationMeta;

  constructor(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string,
  ) {
    super(true, data, message);
    this.pagination = createPaginationMeta(page, limit, total);
  }

  /**
   * Create a paginated response
   */
  static from<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string,
  ): PaginatedResponse<T> {
    return new PaginatedResponse(data, page, limit, total, message);
  }

  /**
   * Convert to JSON object
   */
  toJSON(): PaginatedApiResponse<T> {
    return {
      ...super.toJSON(),
      pagination: this.pagination,
    };
  }
}

export default ApiResponse;
