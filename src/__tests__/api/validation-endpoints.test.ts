import { describe, it, expect } from "vitest";
import app from "../../index";
import {
  createPipelineRunQueuedEvent,
  createPipelineRunStartedEvent,
  createPipelineRunFinishedEvent,
  createTaskRunStartedEvent,
  createTaskRunFinishedEvent,
} from "../../schemas";

describe("Validation Endpoints", () => {
  const validTimestamp = "2023-10-01T12:00:00.000Z";
  const validUuid = "550e8400-e29b-41d4-a716-446655440000";
  const validSource = "https://example.com/ci";

  describe("POST /validate/pipelinerun/queued", () => {
    it("should validate a valid pipeline run queued event", async () => {
      const event = createPipelineRunQueuedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "pipeline-123",
        "build-pipeline",
        "https://example.com/pipeline/123",
      );

      const res = await app.request("/validate/pipelinerun/queued", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({
        valid: true,
        eventType: "dev.cdevents.pipelinerun.queued.0.2.0",
      });
    });

    it("should reject invalid pipeline run queued event", async () => {
      const invalidEvent = {
        context: {
          version: "0.4.1",
          id: validUuid,
          // missing source and timestamp
          type: "dev.cdevents.pipelinerun.queued.0.2.0",
        },
        subject: {
          id: "pipeline-123",
          content: {},
        },
      };

      const res = await app.request("/validate/pipelinerun/queued", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidEvent),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /validate/pipelinerun/started", () => {
    it("should validate a valid pipeline run started event", async () => {
      const event = createPipelineRunStartedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "pipeline-123",
        "build-pipeline",
      );

      const res = await app.request("/validate/pipelinerun/started", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({
        valid: true,
        eventType: "dev.cdevents.pipelinerun.started.0.2.0",
      });
    });

    it("should reject event with wrong type", async () => {
      const event = createPipelineRunStartedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "pipeline-123",
      );

      // Change the type to be invalid for started event
      (event as any).context.type = "dev.cdevents.pipelinerun.queued.0.2.0";

      const res = await app.request("/validate/pipelinerun/started", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /validate/pipelinerun/finished", () => {
    it("should validate a valid pipeline run finished event", async () => {
      const event = createPipelineRunFinishedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "pipeline-123",
        "success",
        "build-pipeline",
      );

      const res = await app.request("/validate/pipelinerun/finished", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({
        valid: true,
        eventType: "dev.cdevents.pipelinerun.finished.0.2.0",
      });
    });

    it("should validate event with error outcome", async () => {
      const event = createPipelineRunFinishedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "pipeline-123",
        "error",
        "build-pipeline",
        undefined,
        "Build failed due to compilation errors",
      );

      const res = await app.request("/validate/pipelinerun/finished", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as { valid: boolean };
      expect(json.valid).toBe(true);
    });

    it("should reject event with invalid outcome", async () => {
      const event = createPipelineRunFinishedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "pipeline-123",
        "success",
      );

      // Change outcome to invalid value
      (event as any).subject.content.outcome = "invalid-outcome";

      const res = await app.request("/validate/pipelinerun/finished", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /validate/taskrun/started", () => {
    it("should validate a valid task run started event", async () => {
      const event = createTaskRunStartedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "task-123",
        "unit-tests",
        { id: "pipeline-123", source: validSource },
      );

      const res = await app.request("/validate/taskrun/started", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({
        valid: true,
        eventType: "dev.cdevents.taskrun.started.0.2.0",
      });
    });

    it("should validate event without pipeline reference", async () => {
      const event = createTaskRunStartedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "task-123",
        "unit-tests",
      );

      const res = await app.request("/validate/taskrun/started", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as { valid: boolean };
      expect(json.valid).toBe(true);
    });
  });

  describe("POST /validate/taskrun/finished", () => {
    it("should validate a valid task run finished event", async () => {
      const event = createTaskRunFinishedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "task-123",
        "failure",
        "integration-tests",
        { id: "pipeline-123" },
        undefined,
        "Tests failed with connection timeout",
      );

      const res = await app.request("/validate/taskrun/finished", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({
        valid: true,
        eventType: "dev.cdevents.taskrun.finished.0.2.0",
      });
    });
  });

  describe("POST /validate/event", () => {
    it("should validate any core CD event type", async () => {
      const events = [
        createPipelineRunQueuedEvent(
          validUuid,
          validSource,
          validTimestamp,
          "p1",
        ),
        createPipelineRunStartedEvent(
          validUuid,
          validSource,
          validTimestamp,
          "p2",
        ),
        createPipelineRunFinishedEvent(
          validUuid,
          validSource,
          validTimestamp,
          "p3",
          "success",
        ),
        createTaskRunStartedEvent(validUuid, validSource, validTimestamp, "t1"),
        createTaskRunFinishedEvent(
          validUuid,
          validSource,
          validTimestamp,
          "t2",
          "error",
        ),
      ];

      for (const event of events) {
        const res = await app.request("/validate/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        });

        expect(res.status).toBe(200);
        const json = (await res.json()) as {
          valid: boolean;
          eventType: string;
        };
        expect(json.valid).toBe(true);
        expect(json.eventType).toBe(event.context.type);
      }
    });

    it("should reject completely invalid events", async () => {
      const invalidEvents = [
        { invalid: "structure" },
        {
          context: {
            version: "0.4.1",
            // missing required fields
          },
          subject: {
            content: {},
          },
        },
        {
          context: {
            version: "0.4.1",
            id: validUuid,
            source: validSource,
            type: "invalid.event.type",
            timestamp: validTimestamp,
          },
          subject: {
            id: "test",
            content: {},
          },
        },
      ];

      for (const event of invalidEvents) {
        const res = await app.request("/validate/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        });

        expect(res.status).toBe(400);
      }
    });

    it("should handle malformed JSON", async () => {
      const res = await app.request("/validate/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{ invalid json }",
      });

      expect(res.status).toBe(400);
    });
  });

  describe("Event validation with custom data", () => {
    it("should validate events with custom data fields", async () => {
      const event = createPipelineRunStartedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "pipeline-with-custom-data",
      );

      // Add custom data
      const eventWithCustomData = {
        ...event,
        customData: {
          buildNumber: 42,
          branch: "feature/new-feature",
          commit: "abc123def456",
          triggeredBy: {
            user: "developer@example.com",
            webhook: true,
          },
        },
        customDataContentType: "application/json",
      };

      const res = await app.request("/validate/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventWithCustomData),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as { valid: boolean };
      expect(json.valid).toBe(true);
    });

    it("should validate events with different custom data content types", async () => {
      const event = createTaskRunFinishedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "task-custom",
        "success",
      );

      const eventWithCustomData = {
        ...event,
        customData: "Custom string data",
        customDataContentType: "text/plain",
      };

      const res = await app.request("/validate/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventWithCustomData),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as { valid: boolean };
      expect(json.valid).toBe(true);
    });
  });

  describe("Timestamp validation", () => {
    it("should reject events with invalid timestamp format", async () => {
      const event = createPipelineRunStartedEvent(
        validUuid,
        validSource,
        "invalid-timestamp",
        "pipeline-123",
      );

      const res = await app.request("/validate/pipelinerun/started", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      expect(res.status).toBe(400);
    });

    it("should accept various valid timestamp formats", async () => {
      const validTimestamps = [
        "2023-10-01T12:00:00Z",
        "2023-10-01T12:00:00.000Z",
        "2023-12-31T23:59:59.999Z",
      ];

      for (const timestamp of validTimestamps) {
        const event = createPipelineRunStartedEvent(
          validUuid,
          validSource,
          timestamp,
          "pipeline-123",
        );

        const res = await app.request("/validate/pipelinerun/started", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(event),
        });

        expect(res.status).toBe(200);
      }
    });
  });
});
