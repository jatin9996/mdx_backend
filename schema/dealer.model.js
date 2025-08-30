import { z } from "zod";

export const insertDealerMasterSchema = z.object({
  BrandId: z.number({ required_error: "BrandId is required" }).int(),
  DealerId: z.number({ required_error: "DealerId is required" }).int(),
  DealerName: z.string({ required_error: "DealerName is required" }).min(1, "DealerName is required"),
  LookupName: z.string({ required_error: "LookupName is required" }).min(1, "LookupName is required"),

  Address1: z.string().nullable().optional(),
  Address2: z.string().nullable().optional(),
  City: z.string().nullable().optional(),
  State: z.string().nullable().optional(),
  Zipcode: z.string().nullable().optional(),
  Country: z.string().nullable().optional(),

  OpenDate: z.union([z.string(), z.date()]).nullable().optional(),
  CloseDate: z.union([z.string(), z.date()]).nullable().optional(),

  SellSource: z.string().nullable().optional(),
  DealerCode: z.string().nullable().optional(),
  DealerCodeAlternate: z.string().nullable().optional(),

  DealerType: z.string().nullable().optional(),

  LATCoordinate: z.number().nullable().optional(),
  LONCoordinate: z.number().nullable().optional(),

  PreviousBAC: z.string().nullable().optional(),

  AccountMapLocked: z.boolean().default(false),
  NationalComposite: z.boolean().default(false),
  RegionalComposite: z.boolean().default(false),
  DisableRisk: z.boolean().default(false),
  OEMDealer: z.boolean().default(false),

  Lookup: z.string().nullable().optional(),

  IsActive: z.boolean().default(true),
  IsDeleted: z.boolean().default(false),

  CreatedDate: z.union([z.string(), z.date()]).optional(),
  CreatedBy: z.string({ required_error: "CreatedBy is required" }).min(1, "CreatedBy is required"),

  UpdatedDate: z.union([z.string(), z.date()]).nullable().optional(),
  UpdatedBy: z.string().nullable().optional()
});
