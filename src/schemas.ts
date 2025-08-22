import { z } from "zod";

// Example schema for API validation
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  age: z.number().int().min(18, "Must be at least 18 years old").optional(),
});

// Infer TypeScript type from schema
export type User = z.infer<typeof UserSchema>;

// Example schema for API request body
export const CreateUserSchema = UserSchema.omit({ id: true }).strict();
export type CreateUserRequest = z.infer<typeof CreateUserSchema>;

// Example API response schema
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.unknown().optional(),
});

export type ApiResponse = z.infer<typeof ApiResponseSchema>;

// Example error response schema
export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(z.string()).optional(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
