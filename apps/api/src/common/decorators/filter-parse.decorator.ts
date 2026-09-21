import {
  createParamDecorator,
  ExecutionContext,
  UnprocessableEntityException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { Request } from 'express';
import { z } from 'zod';

type FilterSchema = z.ZodObject<z.ZodRawShape>;
type SortDirection = 'asc' | 'desc';

type FilterParseOptions<TSchema extends FilterSchema> = {
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

type PrismaFilterQuery = {
  where: Record<string, unknown>;
  skip: number;
  take: number;
  orderBy: Array<Record<string, unknown>>;
};

type FilterParseResult = {
  page: number;
  limit: number;
  filters: Record<string, unknown>;
  prismaQuery: PrismaFilterQuery;
};

//
// 🔹 Default query schema (pagination + sorting)
//
export const DefaultUserQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sort_by: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
type QueryRecord = Record<string, unknown>;

// helpers:
const toNum = (v: unknown) => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

function readString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function isRecordArray(
  value: unknown,
): value is Array<Record<string, unknown>> {
  return (
    Array.isArray(value) &&
    value.every((item) => item !== null && typeof item === 'object')
  );
}

function foldMinMax(where: QueryRecord, data: QueryRecord, fields: string[]) {
  for (const f of fields) {
    const min = toNum(data[`min_${f}`]);
    const max = toNum(data[`max_${f}`]);
    if (min != null || max != null) {
      where[f] = {
        ...(min != null ? { gte: min } : {}),
        ...(max != null ? { lte: max } : {}),
      };
    }
    delete data[`min_${f}`];
    delete data[`max_${f}`];
  }
}

//
// 🔹 Decorator factory
//
export const FilterParse = <TSchema extends FilterSchema>(
  options: FilterParseOptions<TSchema>,
) =>
  createParamDecorator(
    (data: unknown, ctx: ExecutionContext): FilterParseResult => {
      const request = ctx.switchToHttp().getRequest<Request>();
      const query = request.query;

      // ✅ Merge default + custom schema
      const finalSchema = DefaultUserQuerySchema.merge(options.schema);
      // ✅ Validate
      const parsed = finalSchema.safeParse(query);
      if (!parsed.success) {
        throw new UnprocessableEntityException(parsed.error.format());
      }

      const queryRecord: QueryRecord = parsed.data;

      let page = 1;
      let limit = 10;
      const filters: QueryRecord = {};

      const qKey = options.searchKey ?? 'q';

      //
      // ✅ Pagination
      //
      if (options.allowPagination) {
        const parsedPage = parseInt(readString(queryRecord.page) ?? '1', 10);
        const parsedLimit = parseInt(readString(queryRecord.limit) ?? '10', 10);
        page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
        limit = isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit;
      }

      //
      // ✅ Extract filters (exclude reserved keys)
      //
      Object.keys(queryRecord).forEach((key) => {
        const k = String(key);
        if (
          ![
            'page',
            'limit',
            'sort',
            'sortBy',
            'sort_by',
            'startDate',
            'endDate',
          ].includes(k) &&
          !k.startsWith('min_') &&
          !k.startsWith('max_') &&
          k !== 'created_at' &&
          k !== qKey
        ) {
          filters[k] = queryRecord[k];
        }
      });

      // ✅ Map min_/max_ thành range Prisma
      if (options.rangeFields?.length) {
        foldMinMax(filters, queryRecord, options.rangeFields);
      }

      if (options.searchBy?.length) {
        const qVal = readString(queryRecord[qKey]);
        if (qVal && qVal.trim().length) {
          const or = options.searchBy.map((field) => ({
            [field]: { contains: qVal, mode: 'insensitive' as const },
          }));
          const currentOr = filters.OR;
          if (isRecordArray(currentOr)) {
            filters.OR = [...currentOr, ...or];
          } else {
            filters.OR = or;
          }
        }
      }

      if (options.allowGetBetweenDate) {
        const dateFilter: QueryRecord = {};
        const startDate = readString(queryRecord.startDate);
        const endDate = readString(queryRecord.endDate);
        if (startDate) {
          dateFilter.gte = dayjs(startDate).toDate();
        }
        if (endDate) {
          dateFilter.lte = dayjs(endDate).endOf('day').toDate();
        }
        if (Object.keys(dateFilter).length > 0) {
          filters.created_at = dateFilter;
        }
      }

      if (options.listFields?.length) {
        for (const field of options.listFields) {
          const val = queryRecord[field];
          if (typeof val === 'string') {
            const arr = val
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean);

            if (field === 'categories') {
              if (arr.length) {
                filters[field] = {
                  some: {
                    id: {
                      in: arr,
                    },
                  },
                };
              } else {
                delete filters[field];
              }
            } else {
              filters[field] = arr;
            }
          }
        }
      }

      //
      // ✅ Sorting
      //
      const orderBy: Array<Record<string, unknown>> = [];
      const querySort = readString(queryRecord.sort);
      const orderDirection =
        querySort === 'asc' || querySort === 'desc'
          ? querySort
          : options.defaultSort;
      const sortBy =
        readString(queryRecord.sort_by) ??
        readString(queryRecord.sortBy) ??
        options.defaultSortBy;

      if (options.allowSorting && sortBy) {
        const allowedSorts = [
          ...(options.allowedSortBy ?? []),
          ...(options.relationCountSorts
            ? Object.keys(options.relationCountSorts)
            : []),
        ];

        if (allowedSorts.includes(sortBy)) {
          if (options.relationCountSorts?.[sortBy]) {
            orderBy.push({
              [options.relationCountSorts[sortBy]]: {
                _count: orderDirection,
              },
            });
          } else {
            orderBy.push({
              [sortBy]: orderDirection,
            });
          }
        } else {
          throw new UnprocessableEntityException(
            `Invalid sortBy field: ${sortBy}`,
          );
        }
      }

      return {
        page,
        limit,
        filters,
        prismaQuery: {
          where: filters,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
        },
      };
    },
  )();
