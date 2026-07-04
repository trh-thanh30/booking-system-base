export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  message?: string;
  meta: {
    timestamp: string;
    version: "v1" | string;
    requestId?: string;
  };
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type PaginatedApiResponse<T> = ApiResponse<T[]> & {
  pagination: PaginationMeta;
};
