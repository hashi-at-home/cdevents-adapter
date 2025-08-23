import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import {
  createPipelineRunQueuedEvent,
  createPipelineRunStartedEvent,
  createPipelineRunFinishedEvent,
  createTaskRunStartedEvent,
  createTaskRunFinishedEvent,
  PipelineRunQueuedEventSchema,
  PipelineRunStartedEventSchema,
  PipelineRunFinishedEventSchema,
  TaskRunStartedEventSchema,
  TaskRunFinishedEventSchema,
  CoreCDEventSchema,
} from "../schemas";

const app = new Hono();

// Mock CD Events API endpoints
app.post("/events/pipelinerun/queued", async (c) => {
  try {
    const body = await c.req.json();
    const result = PipelineRunQueuedEventSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Invalid event format", issues: result.error.issues },
        400,
      );
    }

    return c.json(
      {
        message: "Pipeline run queued event received",
        eventId: result.data.context.id,
      },
      201,
    );
  } catch (error) {
    return c.json({ error: "Invalid JSON format" }, 400);
  }
});

app.post("/events/pipelinerun/started", async (c) => {
  try {
    const body = await c.req.json();
    const result = PipelineRunStartedEventSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Invalid event format", issues: result.error.issues },
        400,
      );
    }

    return c.json(
      {
        message: "Pipeline run started event received",
        eventId: result.data.context.id,
      },
      201,
    );
  } catch (error) {
    return c.json({ error: "Invalid JSON format" }, 400);
  }
});

app.post("/events/pipelinerun/finished", async (c) => {
  try {
    const body = await c.req.json();
    const result = PipelineRunFinishedEventSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Invalid event format", issues: result.error.issues },
        400,
      );
    }

    return c.json(
      {
        message: "Pipeline run finished event received",
        eventId: result.data.context.id,
      },
      201,
    );
  } catch (error) {
    return c.json({ error: "Invalid JSON format" }, 400);
  }
});

app.post("/events/taskrun/started", async (c) => {
  try {
    const body = await c.req.json();
    const result = TaskRunStartedEventSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Invalid event format", issues: result.error.issues },
        400,
      );
    }

    return c.json(
      {
        message: "Task run started event received",
        eventId: result.data.context.id,
      },
      201,
    );
  } catch (error) {
    return c.json({ error: "Invalid JSON format" }, 400);
  }
});

app.post("/events/taskrun/finished", async (c) => {
  try {
    const body = await c.req.json();
    const result = TaskRunFinishedEventSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Invalid event format", issues: result.error.issues },
        400,
      );
    }

    return c.json(
      {
        message: "Task run finished event received",
        eventId: result.data.context.id,
      },
      201,
    );
  } catch (error) {
    return c.json({ error: "Invalid JSON format" }, 400);
  }
});

app.post("/events", async (c) => {
  try {
    const body = await c.req.json();
    const result = CoreCDEventSchema.safeParse(body);

    if (!result.success) {
      return c.json(
        { error: "Invalid event format", issues: result.error.issues },
        400,
      );
    }

    const eventType = result.data.context.type;
    return c.json(
      {
        message: "CD Event received",
        eventId: result.data.context.id,
        eventType,
        subjectId: result.data.subject.id,
      },
      201,
    );
  } catch (error) {
    return c.json({ error: "Invalid JSON format" }, 400);
  }
});

app.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

describe("CD Events API", () => {
  describe("Health Check", () => {
    it("should return healthy status", async () => {
      const res = await app.request("/health");
      expect(res.status).toBe(200);

      const json = (await res.json()) as { status: string; timestamp: string };
      expect(json.status).toBe("healthy");
      expect(json.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });
  });

  describe("Pipeline Run Events", () => {
    it("should accept valid pipeline run queued event", async () => {
      const event = createPipelineRunQueuedEvent(
        "test-ctx-123",
        "/test/tekton",
        "2023-01-01T00:00:00Z",
        "pipeline-run-123",
        "MyTestPipeline",
        "https://dashboard.example.com/pipelines/123",
      );

      const res = await app.request("/events/pipelinerun/queued", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(201);
      const json = (await res.json()) as { message: string; eventId: string };
      expect(json.message).toBe("Pipeline run queued event received");
      expect(json.eventId).toBe("test-ctx-123");
    });

    it("should accept valid pipeline run started event", async () => {
      const event = createPipelineRunStartedEvent(
        "test-ctx-456",
        "/test/tekton",
        "2023-01-01T00:05:00Z",
        "pipeline-run-123",
        "MyTestPipeline",
      );

      const res = await app.request("/events/pipelinerun/started", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(201);
      const json = (await res.json()) as { message: string; eventId: string };
      expect(json.message).toBe("Pipeline run started event received");
      expect(json.eventId).toBe("test-ctx-456");
    });

    it("should accept valid pipeline run finished event", async () => {
      const event = createPipelineRunFinishedEvent(
        "test-ctx-789",
        "/test/tekton",
        "2023-01-01T00:10:00Z",
        "pipeline-run-123",
        "success",
        "MyTestPipeline",
        "https://dashboard.example.com/pipelines/123",
      );

      const res = await app.request("/events/pipelinerun/finished", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(201);
      const json = (await res.json()) as { message: string; eventId: string };
      expect(json.message).toBe("Pipeline run finished event received");
      expect(json.eventId).toBe("test-ctx-789");
    });

    it("should reject invalid pipeline run event", async () => {
      const invalidEvent = {
        context: {
          // missing required fields
          version: "0.4.1",
          id: "test-id",
        },
        subject: {
          id: "pipeline-123",
          content: {},
        },
      };

      const res = await app.request("/events/pipelinerun/queued", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidEvent),
      });

      expect(res.status).toBe(400);
      const json = (await res.json()) as { error: string; issues: any[] };
      expect(json.error).toBe("Invalid event format");
      expect(json.issues).toBeDefined();
    });
  });

  describe("Task Run Events", () => {
    it("should accept valid task run started event", async () => {
      const event = createTaskRunStartedEvent(
        "test-task-ctx-123",
        "/test/tekton",
        "2023-01-01T00:06:00Z",
        "task-run-456",
        "build-task",
        { id: "pipeline-run-123" },
        "https://dashboard.example.com/tasks/456",
      );

      const res = await app.request("/events/taskrun/started", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(201);
      const json = (await res.json()) as { message: string; eventId: string };
      expect(json.message).toBe("Task run started event received");
      expect(json.eventId).toBe("test-task-ctx-123");
    });

    it("should accept valid task run finished event", async () => {
      const event = createTaskRunFinishedEvent(
        "test-task-ctx-789",
        "/test/tekton",
        "2023-01-01T00:08:00Z",
        "task-run-456",
        "failure",
        "test-task",
        { id: "pipeline-run-123" },
        "https://dashboard.example.com/tasks/456",
        "Unit tests failed in test suite",
      );

      const res = await app.request("/events/taskrun/finished", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(201);
      const json = (await res.json()) as { message: string; eventId: string };
      expect(json.message).toBe("Task run finished event received");
      expect(json.eventId).toBe("test-task-ctx-789");
    });
  });

  describe("Generic Events Endpoint", () => {
    it("should accept any valid core CD event", async () => {
      const events = [
        createPipelineRunQueuedEvent(
          "generic-test-1",
          "/test/source",
          "2023-01-01T00:00:00Z",
          "pipeline-1",
        ),
        createTaskRunStartedEvent(
          "generic-test-2",
          "/test/source",
          "2023-01-01T00:00:00Z",
          "task-1",
        ),
      ];

      for (const event of events) {
        const res = await app.request("/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        });

        expect(res.status).toBe(201);
        const json = (await res.json()) as {
          message: string;
          eventId: string;
          eventType: string;
          subjectId: string;
        };
        expect(json.message).toBe("CD Event received");
        expect(json.eventId).toBe(event.context.id);
        expect(json.eventType).toBe(event.context.type);
        expect(json.subjectId).toBe(event.subject.id);
      }
    });

    it("should handle events with custom data", async () => {
      const event = createPipelineRunStartedEvent(
        "custom-data-test",
        "/test/source",
        "2023-01-01T00:00:00Z",
        "pipeline-custom",
      );

      // Add custom data
      const eventWithCustomData = {
        ...event,
        customData: {
          buildNumber: 42,
          branch: "feature/new-feature",
          triggeredBy: "webhook",
        },
        customDataContentType: "application/json",
      };

      const res = await app.request("/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventWithCustomData),
      });

      expect(res.status).toBe(201);
      const json = (await res.json()) as { message: string; eventId: string };
      expect(json.message).toBe("CD Event received");
      expect(json.eventId).toBe("custom-data-test");
    });

    it("should reject completely invalid event structure", async () => {
      const invalidEvent = {
        not: "a valid event",
        structure: true,
      };

      const res = await app.request("/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidEvent),
      });

      expect(res.status).toBe(400);
      const json = (await res.json()) as { error: string; issues: any[] };
      expect(json.error).toBe("Invalid event format");
      expect(json.issues).toBeDefined();
      expect(json.issues.length).toBeGreaterThan(0);
    });
  });

  describe("Event Validation Edge Cases", () => {
    it("should handle malformed JSON", async () => {
      const res = await app.request("/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json }",
      });

      expect(res.status).toBe(400);
    });

    it("should validate timestamp format strictly", async () => {
      const event = createPipelineRunStartedEvent(
        "timestamp-test",
        "/test/source",
        "invalid-timestamp",
        "pipeline-1",
      );

      const res = await app.request("/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(400);
      const json = (await res.json()) as { error: string };
      expect(json.error).toBe("Invalid event format");
    });

    it("should validate event type format", async () => {
      const event = createPipelineRunStartedEvent(
        "type-test",
        "/test/source",
        "2023-01-01T00:00:00Z",
        "pipeline-1",
      );

      // Modify the event type to be invalid
      (event as any).context.type = "invalid.event.type";

      const res = await app.request("/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(400);
      const json = (await res.json()) as { error: string };
      expect(json.error).toBe("Invalid event format");
    });
  });
});
