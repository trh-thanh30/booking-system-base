import { z } from "zod";

export const defaultFilterQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sort_by: z.string().optional(),
  sort: z.enum(["asc", "desc"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type DefaultFilterQuery = z.infer<typeof defaultFilterQuerySchema>;
