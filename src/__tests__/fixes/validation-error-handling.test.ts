import { describe, it, expect, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import { OpenAPIHono } from "@hono/zod-openapi";
// import type { Env } from "../../types";

type Env = {
  readonly CI_BUILD_QUEUED?: Queue;
  readonly EVENTS_BUCKET?: R2Bucket;
};

describe("Validation Error Handling Fix", () => {
  let app: OpenAPIHono<{ Bindings: Env }>;
  let mockEnv: Partial<Env>;

  beforeEach(() => {
    // Create a minimal app with the validation helper
    app = new OpenAPIHono<{ Bindings: Env }>();

    // Mock environment
    mockEnv = {
      EVENTS_BUCKET: undefined, // No R2 in test
      CI_BUILD_QUEUED: {
        send: vi.fn().mockResolvedValue(undefined),
      } as any,
    };

    // Add a test endpoint that uses the validation logic
    app.post("/test-validation", async (c) => {
      const cdevent = {
        context: {
          version: "0.4.1",
          id: "test-event-id",
          source: "https://github.com/test/repo",
          type: "dev.cdevents.pipelinerun.queued.0.2.0",
          timestamp: new Date().toISOString(),
        },
        subject: {
          id: "test-subject-id",
          type: "pipelineRun",
          content: {
            pipelineName: "Test Pipeline",
            url: "https://github.com/test/repo/actions/runs/123",
          },
        },
      };

      // Simulate the validation logic with proper error handling
      let validationResult = null;
      const validationUrl = `${c.req.url.split("/test-validation")[0]}/validate/event`;

      try {
        const validationResponse = await fetch(validationUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cdevent),
        });

        // This is the fix: check response status before parsing JSON
        if (validationResponse.ok) {
          validationResult = await validationResponse.json();
        } else {
          // Handle non-OK responses without trying to parse as JSON
          console.warn(`Validation failed with status ${validationResponse.status}: ${validationResponse.statusText}`);
        }
      } catch (error) {
        console.warn("Validation request failed:", error);
      }

      return c.json({
        success: true,
        message: "Test completed",
        validationResult,
      });
    });
  });

  it("should handle Cloudflare 522 error (Connection Timed Out) gracefully", async () => {
    // Mock fetch to simulate a 522 error response
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/validate/event")) {
        // Simulate Cloudflare 522 error response
        return Promise.resolve({
          ok: false,
          status: 522,
          statusText: "Connection Timed Out",
          text: () => Promise.resolve("error code: 522"),
          json: () => Promise.reject(new SyntaxError('Unexpected token \'e\', "error code: 522" is not valid JSON')),
        });
      }
      return originalFetch(url);
    });

    const response = await app.request("/test-validation", {
      method: "POST",
    }, mockEnv as Env);

    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(body.success).toBe(true);
    expect(body.validationResult).toBeNull(); // Validation failed but request succeeded

    // Restore original fetch
    global.fetch = originalFetch;
  });

  it("should handle successful validation response", async () => {
    // Mock fetch to simulate a successful validation response
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/validate/event")) {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: () => Promise.resolve({
            valid: true,
            message: "CDEvent is valid",
          }),
        });
      }
      return originalFetch(url);
    });

    const response = await app.request("/test-validation", {
      method: "POST",
    }, mockEnv as Env);

    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(body.success).toBe(true);
    expect(body.validationResult).toEqual({
      valid: true,
      message: "CDEvent is valid",
    });

    // Restore original fetch
    global.fetch = originalFetch;
  });

  it("should handle network errors gracefully", async () => {
    // Mock fetch to simulate a network error
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/validate/event")) {
        return Promise.reject(new Error("Network error: Connection refused"));
      }
      return originalFetch(url);
    });

    const response = await app.request("/test-validation", {
      method: "POST",
    }, mockEnv as Env);

    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(body.success).toBe(true);
    expect(body.validationResult).toBeNull(); // Network error handled gracefully

    // Restore original fetch
    global.fetch = originalFetch;
  });

  it("should handle HTML error responses without parsing as JSON", async () => {
    // Mock fetch to simulate an HTML error response (common with proxy errors)
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes("/validate/event")) {
        const htmlError = `
          <!DOCTYPE html>
          <html>
          <head><title>502 Bad Gateway</title></head>
          <body>
          <h1>502 Bad Gateway</h1>
          <p>The proxy server received an invalid response from an upstream server.</p>
          </body>
          </html>
        `;
        return Promise.resolve({
          ok: false,
          status: 502,
          statusText: "Bad Gateway",
          text: () => Promise.resolve(htmlError),
          json: () => Promise.reject(new SyntaxError("Unexpected token '<'")),
        });
      }
      return originalFetch(url);
    });

    const response = await app.request("/test-validation", {
      method: "POST",
    }, mockEnv as Env);

    expect(response.status).toBe(200);
    const body = await response.json() as any;
    expect(body.success).toBe(true);
    expect(body.validationResult).toBeNull(); // HTML error handled without crashing

    // Restore original fetch
    global.fetch = originalFetch;
  });
});
