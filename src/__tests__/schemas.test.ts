import { describe, it, expect } from "vitest";
import {
  UserSchema,
  CreateUserSchema,
  ApiResponseSchema,
  ErrorResponseSchema,
  type User,
  type CreateUserRequest,
} from "../schemas";

describe("UserSchema", () => {
  it("should validate a valid user object", () => {
    const validUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      email: "john@example.com",
      age: 25,
    };

    const result = UserSchema.safeParse(validUser);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data).toEqual(validUser);
    }
  });

  it("should reject invalid UUID", () => {
    const invalidUser = {
      id: "invalid-uuid",
      name: "John Doe",
      email: "john@example.com",
    };

    const result = UserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it("should reject invalid email", () => {
    const invalidUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      email: "not-an-email",
    };

    const result = UserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it("should reject empty name", () => {
    const invalidUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "",
      email: "john@example.com",
    };

    const result = UserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it("should reject age under 18", () => {
    const invalidUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      email: "john@example.com",
      age: 17,
    };

    const result = UserSchema.safeParse(invalidUser);
    expect(result.success).toBe(false);
  });

  it("should accept user without age (optional field)", () => {
    const validUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      email: "john@example.com",
    };

    const result = UserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });
});

describe("CreateUserSchema", () => {
  it("should validate user creation request without id", () => {
    const createUserRequest = {
      name: "Jane Doe",
      email: "jane@example.com",
      age: 30,
    };

    const result = CreateUserSchema.safeParse(createUserRequest);
    expect(result.success).toBe(true);
  });

  it("should reject if id is provided", () => {
    const invalidRequest = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Jane Doe",
      email: "jane@example.com",
    };

    const result = CreateUserSchema.safeParse(invalidRequest);
    expect(result.success).toBe(false);
  });
});

describe("ApiResponseSchema", () => {
  it("should validate successful response with data", () => {
    const response = {
      success: true,
      message: "User created successfully",
      data: { id: "123", name: "John" },
    };

    const result = ApiResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it("should validate response without data", () => {
    const response = {
      success: false,
      message: "Something went wrong",
    };

    const result = ApiResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it("should reject response without required fields", () => {
    const invalidResponse = {
      success: true,
      // missing message
    };

    const result = ApiResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });
});

describe("ErrorResponseSchema", () => {
  it("should validate error response with errors array", () => {
    const errorResponse = {
      success: false,
      message: "Validation failed",
      errors: ["Name is required", "Invalid email"],
    };

    const result = ErrorResponseSchema.safeParse(errorResponse);
    expect(result.success).toBe(true);
  });

  it("should validate error response without errors array", () => {
    const errorResponse = {
      success: false,
      message: "Something went wrong",
    };

    const result = ErrorResponseSchema.safeParse(errorResponse);
    expect(result.success).toBe(true);
  });

  it("should reject if success is not false", () => {
    const invalidResponse = {
      success: true, // should be false for error response
      message: "Error message",
    };

    const result = ErrorResponseSchema.safeParse(invalidResponse);
    expect(result.success).toBe(false);
  });
});

describe("Type inference", () => {
  it("should correctly infer User type", () => {
    const user: User = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "John Doe",
      email: "john@example.com",
      age: 25,
    };

    // This test passes if TypeScript compilation succeeds
    expect(user.name).toBe("John Doe");
  });

  it("should correctly infer CreateUserRequest type", () => {
    const createRequest: CreateUserRequest = {
      name: "Jane Doe",
      email: "jane@example.com",
      age: 30,
    };

    // This test passes if TypeScript compilation succeeds
    expect(createRequest.name).toBe("Jane Doe");
  });
});
