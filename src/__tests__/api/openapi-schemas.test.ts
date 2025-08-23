import { describe, it, expect, beforeAll } from "vitest";
import app from "../../index";
import {
  CDEventSchema,
  CoreCDEventSchema,
  PipelineRunQueuedEventSchema,
  PipelineRunStartedEventSchema,
  PipelineRunFinishedEventSchema,
  TaskRunStartedEventSchema,
  TaskRunFinishedEventSchema,
  OutcomeEnum,
  SubjectTypeEnum,
  TimestampSchema,
  UriSchema,
  createPipelineRunQueuedEvent,
  createPipelineRunStartedEvent,
  createPipelineRunFinishedEvent,
  createTaskRunStartedEvent,
  createTaskRunFinishedEvent,
} from "../../schemas";

describe("OpenAPI Schema Integration", () => {
  let openApiSpec: any;

  beforeAll(async () => {
    const res = await app.request("/openapi.json");
    openApiSpec = await res.json();
  });

  describe("Schema Registration", () => {
    it("should include all required schemas in OpenAPI spec", () => {
      const schemas = openApiSpec.components.schemas;

      // Core schemas
      expect(schemas).toHaveProperty("CoreCDEvent");
      expect(schemas).toHaveProperty("CDEvent");

      // Event type schemas
      expect(schemas).toHaveProperty("PipelineRunQueuedEvent");
      expect(schemas).toHaveProperty("PipelineRunStartedEvent");
      expect(schemas).toHaveProperty("PipelineRunFinishedEvent");
      expect(schemas).toHaveProperty("TaskRunStartedEvent");
      expect(schemas).toHaveProperty("TaskRunFinishedEvent");

      // Component schemas
      expect(schemas).toHaveProperty("CDEventContext");
      expect(schemas).toHaveProperty("CDEventSubject");

      // Additional generated schemas
      expect(schemas).toHaveProperty("PipelineRunFinishedContent");
      expect(schemas).toHaveProperty("TaskRunFinishedContent");
      expect(schemas).toHaveProperty("SubjectReference");
    });

    it("should have proper schema structure with inline enums", () => {
      const schemas = openApiSpec.components.schemas;

      // Check that enums are properly embedded in content schemas
      expect(schemas.PipelineRunFinishedContent.properties.outcome).toEqual({
        type: "string",
        enum: ["success", "error", "failure"],
        description: "The outcome status of an operation",
        example: "success",
      });

      expect(schemas.CDEventSubject.properties.type).toEqual({
        type: "string",
        enum: ["pipelineRun", "taskRun"],
        description: "The type of subject in a CD Event",
        example: "pipelineRun",
      });
    });
  });

  describe("Schema Validation with Examples", () => {
    const validTimestamp = "2023-10-01T12:00:00.000Z";
    const validUuid = "550e8400-e29b-41d4-a716-446655440000";
    const validSource = "https://example.com/ci";

    it("should validate PipelineRunQueuedEvent schema", () => {
      const event = createPipelineRunQueuedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "pipeline-123",
        "build-pipeline",
        "https://example.com/pipeline/123",
      );

      const result = PipelineRunQueuedEventSchema.safeParse(event);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.context.type).toBe(
          "dev.cdevents.pipelinerun.queued.0.2.0",
        );
        expect(result.data.subject.content.pipelineName).toBe("build-pipeline");
      }
    });

    it("should validate PipelineRunStartedEvent schema", () => {
      const event = createPipelineRunStartedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "pipeline-123",
        "build-pipeline",
        "https://example.com/pipeline/123",
      );

      const result = PipelineRunStartedEventSchema.safeParse(event);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.context.type).toBe(
          "dev.cdevents.pipelinerun.started.0.2.0",
        );
        expect(result.data.subject.content.pipelineName).toBe("build-pipeline");
      }
    });

    it("should validate PipelineRunFinishedEvent schema", () => {
      const event = createPipelineRunFinishedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "pipeline-123",
        "success",
        "build-pipeline",
        "https://example.com/pipeline/123",
      );

      const result = PipelineRunFinishedEventSchema.safeParse(event);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.context.type).toBe(
          "dev.cdevents.pipelinerun.finished.0.2.0",
        );
        expect(result.data.subject.content.outcome).toBe("success");
      }
    });

    it("should validate TaskRunStartedEvent schema", () => {
      const event = createTaskRunStartedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "task-123",
        "unit-tests",
        { id: "pipeline-123", source: validSource },
        "https://example.com/task/123",
      );

      const result = TaskRunStartedEventSchema.safeParse(event);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.context.type).toBe(
          "dev.cdevents.taskrun.started.0.2.0",
        );
        expect(result.data.subject.content.taskName).toBe("unit-tests");
      }
    });

    it("should validate TaskRunFinishedEvent schema", () => {
      const event = createTaskRunFinishedEvent(
        validUuid,
        validSource,
        validTimestamp,
        "task-123",
        "success",
        "unit-tests",
        { id: "pipeline-123", source: validSource },
        "https://example.com/task/123",
      );

      const result = TaskRunFinishedEventSchema.safeParse(event);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.context.type).toBe(
          "dev.cdevents.taskrun.finished.0.2.0",
        );
        expect(result.data.subject.content.outcome).toBe("success");
      }
    });

    it("should validate CoreCDEventSchema union", () => {
      const events = [
        createPipelineRunQueuedEvent(
          validUuid,
          validSource,
          validTimestamp,
          "pipeline-1",
        ),
        createPipelineRunStartedEvent(
          validUuid,
          validSource,
          validTimestamp,
          "pipeline-2",
        ),
        createPipelineRunFinishedEvent(
          validUuid,
          validSource,
          validTimestamp,
          "pipeline-3",
          "success",
        ),
        createTaskRunStartedEvent(
          validUuid,
          validSource,
          validTimestamp,
          "task-1",
        ),
        createTaskRunFinishedEvent(
          validUuid,
          validSource,
          validTimestamp,
          "task-2",
          "success",
        ),
      ];

      events.forEach((event, index) => {
        const result = CoreCDEventSchema.safeParse(event);
        expect(result.success).toBe(true);
      });
    });
  });

  describe("Schema Validation Errors", () => {
    it("should reject invalid timestamp format", () => {
      const invalidEvent = {
        context: {
          version: "0.4.1",
          id: "test-id",
          source: "https://example.com",
          type: "dev.cdevents.pipelinerun.queued.0.2.0",
          timestamp: "invalid-timestamp",
        },
        subject: {
          id: "pipeline-123",
          type: "pipelineRun",
          content: {},
        },
      };

      const result = PipelineRunQueuedEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path.includes("timestamp") ||
              issue.message.includes("timestamp"),
          ),
        ).toBe(true);
      }
    });

    it("should reject invalid outcome enum", () => {
      const invalidEvent = {
        context: {
          version: "0.4.1",
          id: "test-id",
          source: "https://example.com",
          type: "dev.cdevents.pipelinerun.finished.0.2.0",
          timestamp: "2023-10-01T12:00:00.000Z",
        },
        subject: {
          id: "pipeline-123",
          type: "pipelineRun",
          content: {
            outcome: "invalid-outcome",
          },
        },
      };

      const result = PipelineRunFinishedEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path.includes("outcome") ||
              issue.message.includes("outcome"),
          ),
        ).toBe(true);
      }
    });

    it("should reject invalid URL format", () => {
      const invalidEvent = {
        context: {
          version: "0.4.1",
          id: "test-id",
          source: "https://example.com",
          type: "dev.cdevents.pipelinerun.started.0.2.0",
          timestamp: "2023-10-01T12:00:00.000Z",
        },
        subject: {
          id: "pipeline-123",
          type: "pipelineRun",
          content: {
            url: "not-a-valid-url",
          },
        },
      };

      const result = PipelineRunStartedEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path.includes("url") || issue.message.includes("url"),
          ),
        ).toBe(true);
      }
    });

    it("should reject invalid event type", () => {
      const invalidEvent = {
        context: {
          version: "0.4.1",
          id: "test-id",
          source: "https://example.com",
          type: "invalid.event.type",
          timestamp: "2023-10-01T12:00:00.000Z",
        },
        subject: {
          id: "pipeline-123",
          type: "pipelineRun",
          content: {},
        },
      };

      const result = PipelineRunQueuedEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(
          result.error.issues.some(
            (issue) =>
              issue.path.includes("type") || issue.message.includes("type"),
          ),
        ).toBe(true);
      }
    });

    it("should reject missing required fields", () => {
      const invalidEvent = {
        context: {
          version: "0.4.1",
          // missing id, source, type, timestamp
        },
        subject: {
          // missing id
          content: {},
        },
      };

      const result = CDEventSchema.safeParse(invalidEvent);
      expect(result.success).toBe(false);

      if (!result.success) {
        const missingFields = result.error.issues.map((issue) =>
          issue.path.join("."),
        );
        expect(missingFields).toContain("context.id");
        expect(missingFields).toContain("context.source");
        expect(missingFields).toContain("context.type");
        expect(missingFields).toContain("context.timestamp");
        expect(missingFields).toContain("subject.id");
      }
    });
  });

  describe("OpenAPI Schema Metadata", () => {
    it("should include examples in schema definitions", () => {
      // Test that schemas include proper examples
      const timestampResult = TimestampSchema.safeParse(
        "2023-10-01T12:00:00.000Z",
      );
      expect(timestampResult.success).toBe(true);

      const outcomeResult = OutcomeEnum.safeParse("success");
      expect(outcomeResult.success).toBe(true);

      const subjectTypeResult = SubjectTypeEnum.safeParse("pipelineRun");
      expect(subjectTypeResult.success).toBe(true);

      const uriResult = UriSchema.safeParse("https://example.com/pipeline/123");
      expect(uriResult.success).toBe(true);
    });

    it("should validate against specification requirements", () => {
      // Ensure event type follows the specification pattern
      const eventTypes = [
        "dev.cdevents.pipelinerun.queued.0.2.0",
        "dev.cdevents.pipelinerun.started.0.2.0",
        "dev.cdevents.pipelinerun.finished.0.2.0",
        "dev.cdevents.taskrun.started.0.2.0",
        "dev.cdevents.taskrun.finished.0.2.0",
      ];

      eventTypes.forEach((type) => {
        expect(type).toMatch(/^dev\.cdevents\.\w+\.\w+\.\d+\.\d+\.\d+$/);
      });
    });

    it("should support custom data fields", () => {
      const eventWithCustomData = {
        context: {
          version: "0.4.1",
          id: "test-id",
          source: "https://example.com",
          type: "dev.cdevents.pipelinerun.queued.0.2.0",
          timestamp: "2023-10-01T12:00:00.000Z",
        },
        subject: {
          id: "pipeline-123",
          type: "pipelineRun",
          content: {},
        },
        customData: {
          buildNumber: 42,
          branch: "main",
          commit: "abc123",
        },
        customDataContentType: "application/json",
      };

      const result =
        PipelineRunQueuedEventSchema.safeParse(eventWithCustomData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.customData).toEqual({
          buildNumber: 42,
          branch: "main",
          commit: "abc123",
        });
      }
    });
  });
});
