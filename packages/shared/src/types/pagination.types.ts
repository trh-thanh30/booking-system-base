export type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
};

export type PageLimitQuery = {
  page?: number;
  limit?: number;
};
