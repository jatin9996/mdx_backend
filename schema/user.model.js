import { z } from "zod";

export const insertUserTypeSchema = z.object({
  UserType: z.string().min(1, "UserType is required"),
});

export const insertUserSchema = z.object({
  UserType: z.string().min(1, "UserType is required"),
  UserName: z.string().min(1, "UserName is required"),
  Password: z.string().min(1, "Password is required"),

  FirstName: z.string().min(1, "FirstName is required"),
  LastName: z.string().min(1, "LastName is required"),
  FullName: z.string().optional(),

  Email: z.string().email("Invalid email").min(1, "Email is required"),
  Mobile: z.string().optional().nullable(),

  IsActive: z.coerce.boolean().optional().default(true),   
  IsDeleted: z.coerce.boolean().optional().default(false), 

  CreatedDate: z.union([z.string(), z.date()]).optional(),
  CreatedBy: z.string().min(1, "CreatedBy is required"),

  UpdatedDate: z.union([z.string(), z.date()]).optional().nullable(),
  UpdatedBy: z.string().optional().nullable()
});