import { z } from "zod";

export const kpiDashboardSchema = z.object({
  filterType: z.string().min(1, "filterType is required"),
  month: z
    .number({ invalid_type_error: "month must be a number" })
    .min(1, "Invalid month")
    .max(12, "Invalid month"),
  year: z
    .number({ invalid_type_error: "year must be a number" })
    .min(2000, "Year must be after 2000")
    .max(new Date().getFullYear(), "Year can't be in the future"),
  userId: z.number().optional().nullable(),
  viewType: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  pageNumber: z
    .number({ invalid_type_error: "pageNumber must be a number" })
    .int("pageNumber must be an integer")
    .min(1, "pageNumber must be at least 1")
    .default(1)
    .optional(),
  pageSize: z
    .number({ invalid_type_error: "pageSize must be a number" })
    .int("pageSize must be an integer")
    .min(1, "pageSize must be at least 1")
    .default(10)
    .optional(),
});
