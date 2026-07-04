import type { z, ZodObject, ZodRawShape } from "zod";

export type SortDirection = "asc" | "desc";

export type DefaultFilterQueryInput = {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sort_by?: string;
  sort?: SortDirection;
  startDate?: string;
  endDate?: string;
};

export type FilterSchema = ZodObject<ZodRawShape>;

export type FilterParseOptions<TSchema extends FilterSchema> = {
  schema: TSchema;
  allowGetBetweenDate?: boolean;
  allowPagination?: boolean;
  allowSorting?: boolean;
  allowedSortBy?: string[];
  defaultSortBy: string;
  defaultSort: SortDirection;
  rangeFields?: string[];
  searchBy?: string[];
  searchKey?: string;
  listFields?: string[];
  relationCountSorts?: Record<string, string>;
};

export type InferFilters<TSchema extends FilterSchema> = z.infer<TSchema>;

export type PrismaFilterQuery<TWhere = unknown, TOrderBy = unknown> = {
  where: TWhere;
  skip: number;
  take: number;
  orderBy: TOrderBy;
};

export type FilterParseResult<TFilters extends Record<string, unknown>> = {
  page: number;
  limit: number;
  filters: Partial<TFilters>;
  prismaQuery: PrismaFilterQuery;
};
