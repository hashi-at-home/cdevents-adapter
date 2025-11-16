import { describe, it, expect } from "vitest";
import app from "../../index";

describe("CD Events Adapter API", () => {
  describe("GET /", () => {
    it("should return API information", async () => {
      const res = await app.request("/");
      expect(res.status).toBe(200);

      const json = (await res.json()) as {
        name: string;
        version: string;
        description: string;
        documentation: any;
        endpoints: any;
        supported_events: any;
        specification: any;
      };
      expect(json.name).toBe("CD Events Adapter API");
      expect(json.version).toMatch(/^\d+\.\d+\.\d+(-\w+)?$/);
      expect(json).toMatchObject({
        description: "API for CD Events schema validation and documentation",
        documentation: {
          openapi: "/openapi.json",
          swagger: "/docs",
        },
        endpoints: {
          health: "/health",
          documentation: "/docs",
          openapi_spec: "/openapi.json",
        },
        supported_events: {
          pipelineRun: ["queued", "started", "finished"],
          taskRun: ["started", "finished"],
        },
        specification: {
          version: "0.4.1",
          url: "https://cdevents.dev",
        },
      });
    });

    it("should return JSON content type", async () => {
      const res = await app.request("/");
      expect(res.headers.get("content-type")).toContain("application/json");
    });
  });

  describe("GET /health", () => {
    it("should return health status", async () => {
      const res = await app.request("/health");
      expect(res.status).toBe(200);

      const json = (await res.json()) as {
        status: string;
        service: string;
        version: string;
        timestamp: string;
      };
      expect(json.status).toBe("healthy");
      expect(json.service).toBe("cdevents-adapter");
      expect(json.version).toMatch(/^\d+\.\d+\.\d+(-\w+)?$/);
      expect(json.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it("should return JSON content type", async () => {
      const res = await app.request("/health");
      expect(res.headers.get("content-type")).toContain("application/json");
    });
  });

  describe("GET /openapi.json", () => {
    it("should return OpenAPI specification", async () => {
      const res = await app.request("/openapi.json");
      expect(res.status).toBe(200);

      const json = (await res.json()) as {
        openapi: string;
        info: any;
        servers: any;
        components: any;
        tags: any;
      };
      expect(json).toHaveProperty("openapi", "3.0.0");
      expect(json).toHaveProperty("info");
      expect(json.info.title).toBe("CD Events Adapter API");
      expect(json.info.version).toMatch(/^\d+\.\d+\.\d+(-\w+)?$/);
    });

    it("should have required OpenAPI structure", async () => {
      const res = await app.request("/openapi.json");
      const json = (await res.json()) as {
        openapi: string;
        info: any;
        servers: any;
        components: any;
        tags: any;
      };

      expect(json).toHaveProperty("openapi");
      expect(json).toHaveProperty("info");
      expect(json).toHaveProperty("servers");
      expect(json).toHaveProperty("components");
      expect(json).toHaveProperty("tags");
    });

    it("should include CD Events schemas in components", async () => {
      const res = await app.request("/openapi.json");
      const json = (await res.json()) as {
        components: {
          schemas: Record<string, any>;
        };
      };

      expect(json.components).toHaveProperty("schemas");
      const schemas = json.components.schemas;

      // Check that schemas object exists
      expect(schemas).toBeDefined();
      expect(typeof schemas).toBe("object");

      // Check for automatically registered schemas from validation endpoints
      expect(schemas).toHaveProperty("CDEvent");
      expect(schemas).toHaveProperty("CoreCDEvent");
      expect(schemas).toHaveProperty("PipelineRunQueuedEvent");
      expect(schemas).toHaveProperty("PipelineRunStartedEvent");
      expect(schemas).toHaveProperty("PipelineRunFinishedEvent");
      expect(schemas).toHaveProperty("TaskRunStartedEvent");
      expect(schemas).toHaveProperty("TaskRunFinishedEvent");
      expect(schemas).toHaveProperty("CDEventContext");
      expect(schemas).toHaveProperty("CDEventSubject");

      expect(Object.keys(schemas).length).toBeGreaterThan(10);
    });

    it("should have proper schema structure", async () => {
      const res = await app.request("/openapi.json");
      const json = (await res.json()) as {
        components: {
          schemas: Record<string, any>;
        };
      };

      const schemas = json.components.schemas;

      // Check that core event schema is properly structured
      expect(schemas.CDEvent).toHaveProperty("type", "object");
      expect(schemas.CDEvent).toHaveProperty("properties");
      expect(schemas.CDEvent.properties).toHaveProperty("context");
      expect(schemas.CDEvent.properties).toHaveProperty("subject");

      // Check that context schema has proper structure
      expect(schemas.CDEventContext).toHaveProperty("type", "object");
      expect(schemas.CDEventContext.properties).toHaveProperty("version");
      expect(schemas.CDEventContext.properties).toHaveProperty("id");
      expect(schemas.CDEventContext.properties).toHaveProperty("source");
      expect(schemas.CDEventContext.properties).toHaveProperty("type");
      expect(schemas.CDEventContext.properties).toHaveProperty("timestamp");

      // Check that finished content has outcome enum inline
      expect(schemas.PipelineRunFinishedContent.properties).toHaveProperty(
        "outcome",
      );
      expect(
        schemas.PipelineRunFinishedContent.properties.outcome.enum,
      ).toEqual(["success", "error", "failure"]);
    });

    it("should include proper API information", async () => {
      const res = await app.request("/openapi.json");
      const json = (await res.json()) as {
        info: {
          title: string;
          version: string;
          description: string;
          contact: any;
          license: any;
        };
      };

      expect(json.info.title).toBe("CD Events Adapter API");
      expect(json.info.version).toMatch(/^\d+\.\d+\.\d+(-\w+)?$/);
      expect(json.info.description).toContain("CD Events");
      expect(json.info.description).toContain("v0.4.1");

      expect(json.info.contact).toEqual({
        name: "CD Events Community",
        url: "https://cdevents.dev",
      });

      expect(json.info.license).toEqual({
        name: "Apache 2.0",
        url: "https://www.apache.org/licenses/LICENSE-2.0.html",
      });
    });

    it("should include proper tags", async () => {
      const res = await app.request("/openapi.json");
      const json = (await res.json()) as {
        tags: any[];
      };

      expect(json.tags).toEqual([
        {
          name: "Adapters",
          description:
            "Webhook adapters for transforming external events to CD Events",
        },
        {
          name: "GitHub Adapter",
          description: "Transform GitHub webhook events to CD Events",
        },
        {
          name: "Validation",
          description: "CD Events schema validation endpoints",
        },
        {
          name: "Schemas",
          description: "CD Events schema definitions and validation",
        },
        {
          name: "Events",
          description: "CD Event type definitions",
        },
        {
          name: "Components",
          description: "Reusable schema components",
        },
      ]);
    });

    it("should return JSON content type", async () => {
      const res = await app.request("/openapi.json");
      expect(res.headers.get("content-type")).toContain("application/json");
    });
  });

  describe("GET /docs", () => {
    it("should return Swagger UI HTML", async () => {
      const res = await app.request("/docs");
      expect(res.status).toBe(200);

      const html = await res.text();
      expect(html).toContain("swagger-ui");
      expect(html).toContain("SwaggerUI");
    });

    it("should return HTML content type", async () => {
      const res = await app.request("/docs");
      expect(res.headers.get("content-type")).toContain("text/html");
    });

    it("should configure Swagger UI with OpenAPI spec URL", async () => {
      const res = await app.request("/docs");
      const html = await res.text();

      expect(html).toContain("/openapi.json");
    });
  });

  describe("Error handling", () => {
    it("should handle 404 for non-existent routes", async () => {
      const res = await app.request("/non-existent");
      expect(res.status).toBe(404);
    });

    it("should handle invalid methods", async () => {
      const res = await app.request("/", { method: "POST" });
      expect(res.status).toBe(404);
    });
  });

  describe("CORS and Headers", () => {
    it("should handle preflight requests", async () => {
      const res = await app.request("/", { method: "OPTIONS" });
      // The response should be handled appropriately
      expect(res.status).toBeOneOf([200, 204, 404, 405]);
    });
  });

  describe("API Response Format", () => {
    it("should consistently return JSON for API endpoints", async () => {
      const endpoints = ["/", "/health", "/openapi.json"];

      for (const endpoint of endpoints) {
        const res = await app.request(endpoint);
        expect(res.headers.get("content-type")).toContain("application/json");

        // Ensure valid JSON
        const json = (await res.json()) as Record<string, any>;
        expect(json).toBeDefined();
      }
    });

    it("should return appropriate status codes", async () => {
      const testCases = [
        { path: "/", expectedStatus: 200 },
        { path: "/health", expectedStatus: 200 },
        { path: "/openapi.json", expectedStatus: 200 },
        { path: "/docs", expectedStatus: 200 },
      ];

      for (const { path, expectedStatus } of testCases) {
        const res = await app.request(path);
        expect(res.status).toBe(expectedStatus);
      }
    });
  });

  describe("API Documentation Content", () => {
    it("should include comprehensive API description", async () => {
      const res = await app.request("/openapi.json");
      const json = (await res.json()) as {
        info: {
          description: string;
        };
      };

      const description = json.info.description;
      expect(description).toContain("CD Events Adapter API");
      expect(description).toContain("v0.4.1");
      expect(description).toContain("Pipeline Run Events");
      expect(description).toContain("Task Run Events");
      expect(description).toContain("TypeScript support");
      expect(description).toContain("Zod schemas");
    });

    it("should include proper server configuration", async () => {
      const res = await app.request("/openapi.json");
      const json = (await res.json()) as {
        servers: any[];
      };

      expect(json.servers).toEqual([
        {
          url: "http://localhost:8787",
          description: "Development server",
        },
      ]);
    });
  });

  describe("Validation Endpoints", () => {
    it("should include validation endpoints in API information", async () => {
      const res = await app.request("/");
      const json = (await res.json()) as {
        endpoints: {
          validation: {
            pipelineRun: any;
            taskRun: any;
            generic: string;
          };
        };
      };

      expect(json.endpoints).toHaveProperty("validation");
      expect(json.endpoints.validation).toHaveProperty("pipelineRun");
      expect(json.endpoints.validation).toHaveProperty("taskRun");
      expect(json.endpoints.validation).toHaveProperty("generic");

      expect(json.endpoints.validation.pipelineRun).toEqual({
        queued: "/validate/pipelinerun/queued",
        started: "/validate/pipelinerun/started",
        finished: "/validate/pipelinerun/finished",
      });

      expect(json.endpoints.validation.taskRun).toEqual({
        started: "/validate/taskrun/started",
        finished: "/validate/taskrun/finished",
      });

      expect(json.endpoints.validation.generic).toBe("/validate/event");
    });

    it("should have validation endpoints in OpenAPI paths", async () => {
      const res = await app.request("/openapi.json");
      const json = (await res.json()) as {
        paths: Record<string, any>;
      };

      expect(json.paths).toHaveProperty("/validate/pipelinerun/queued");
      expect(json.paths).toHaveProperty("/validate/pipelinerun/started");
      expect(json.paths).toHaveProperty("/validate/pipelinerun/finished");
      expect(json.paths).toHaveProperty("/validate/taskrun/started");
      expect(json.paths).toHaveProperty("/validate/taskrun/finished");
      expect(json.paths).toHaveProperty("/validate/event");

      // Check that endpoints are POST methods
      expect(json.paths["/validate/pipelinerun/queued"]).toHaveProperty("post");
      expect(json.paths["/validate/taskrun/started"]).toHaveProperty("post");
      expect(json.paths["/validate/event"]).toHaveProperty("post");
    });
  });
});
