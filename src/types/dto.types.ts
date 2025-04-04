import { z } from "zod";

// Type alias for Base64 encoded strings
export type Base64URLString = string;

// Define string as Base64 format for validation
const base64String = () =>
  z.string().regex(/^[A-Za-z0-9+/=]+$/, "Must be a valid base64 string");

export const CreateUserRequestSchema = z.object({
  name: z.string().min(1, "`name` is required"),
  username: z.string().min(1, "`username` is required"),
  password_salt: base64String(),
  encrypted_dek_mk: base64String(),
  iv_mk: base64String(),
  encrypted_dek_rk: base64String(),
  iv_rk: base64String(),
  hashed_authkey: base64String(),
  authkey_salt: base64String()
});

export const CreateUserResponseSchema = z.object({
  id: z.string().uuid("`id` must be a valid UUID"),
  username: z.string().min(1, "`username` is required"),
  name: z.string().min(1, "`name` is required"),
  created_at: z.string().datetime("`created_at` must be a valid date"),
  updated_at: z.string().datetime("`updated_at` must be a valid date")
});

export const GetAuthRequestSchema = z.object({
  username: z.string().min(1, "`username` is required")
});

export const GetAuthResponseSchema = z.object({
  id: z.string().uuid("`id` must be a valid UUID"),
  encrypted_dek_mk: base64String(),
  iv_mk: base64String(),
  password_salt: base64String(),
  authkey_salt: base64String()
});

export const SessionRequestSchema = z.object({
  id: z.string().uuid("`id` must be a valid UUID"),
  hashed_authkey: z.string().min(1, "`hashed_authkey` is required")
});

export const SessionResponseSchema = z.object({
  jwt_token: z.string().min(1, "`jwt_token` is required")
});

// Page-related schemas
export const GetPageRequestSchema = z.object({
  date: z.string().optional()
});

export const EntrySchema = z.object({
  id: z.string().uuid("`id` must be a valid UUID"),
  content: z.string(),
  iv: z.string(),
  created_at: z.string().datetime("`created_at` must be a valid date"),
  updated_at: z.string().datetime("`updated_at` must be a valid date"),
  page_id: z.string().uuid("`page_id` must be a valid UUID")
});

export const PageSchema = z.object({
  id: z.string().uuid("`id` must be a valid UUID"),
  user_id: z.string().uuid("`user_id` must be a valid UUID"),
  created_at: z.string().datetime("`created_at` must be a valid date"),
  updated_at: z.string().datetime("`updated_at` must be a valid date"),
  entries: z.array(EntrySchema)
});

export const PaginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  pages: z.number()
});

export const GetPagesResponseSchema = z.object({
  pages: z.array(PageSchema)
});

export const CreatePageRequestSchema = z.object({
  created_at: z.string().datetime("`created_at` must be a valid date"),
  updated_at: z.string().datetime("`updated_at` must be a valid date")
});

export const CreatePageResponseSchema = z.object({
  page: PageSchema
});

// Entry-related schemas
export const CreateEntryRequestSchema = z.object({
  content: base64String(),
  iv: base64String(),
  created_at: z.string().datetime("`created_at` must be a valid date"),
  updated_at: z.string().datetime("`updated_at` must be a valid date")
});

export const UpdateEntryRequestSchema = z.object({
  content: base64String(),
  iv: base64String()
});

export const DeleteEntryResponseSchema = z.object({
  success: z.boolean()
});

// Create types from Zod schemas
export type CreateUserRequestDto = z.infer<typeof CreateUserRequestSchema>;
export type CreateUserResponseDto = z.infer<typeof CreateUserResponseSchema>;
export type GetAuthRequestDto = z.infer<typeof GetAuthRequestSchema>;
export type GetAuthResponseDto = z.infer<typeof GetAuthResponseSchema>;
export type CreateSessionRequestDto = z.infer<typeof SessionRequestSchema>;
export type CreateSessionResponseDto = z.infer<typeof SessionResponseSchema>;
export type GetPageRequestDto = z.infer<typeof GetPageRequestSchema>;
export type PageDto = z.infer<typeof PageSchema>;
export type EntryDto = z.infer<typeof EntrySchema>;
export type GetPagesResponseDto = z.infer<typeof GetPagesResponseSchema>;
export type CreatePageRequestDto = z.infer<typeof CreatePageRequestSchema>;
export type CreatePageResponseDto = z.infer<typeof CreatePageResponseSchema>;
export type CreateEntryRequestDto = z.infer<typeof CreateEntryRequestSchema>;
export type UpdateEntryRequestDto = z.infer<typeof UpdateEntryRequestSchema>;
export type DeleteEntryResponseDto = z.infer<typeof DeleteEntryResponseSchema>;
