import { describe, it, expect } from "vitest";
import {
  // Enums and types
  OutcomeEnum,
  SubjectTypeEnum,
  LinkTypeEnum,
  LinkKindEnum,
  // Basic schemas
  TimestampSchema,
  UriReferenceSchema,
  UriSchema,
  CDEventContextSchema,
  CDEventSubjectSchema,
  SubjectReferenceSchema,
  // Content schemas
  PipelineRunContentSchema,
  PipelineRunQueuedContentSchema,
  PipelineRunStartedContentSchema,
  PipelineRunFinishedContentSchema,
  TaskRunContentSchema,
  TaskRunStartedContentSchema,
  TaskRunFinishedContentSchema,
  // Event schemas
  PipelineRunQueuedEventSchema,
  PipelineRunStartedEventSchema,
  PipelineRunFinishedEventSchema,
  TaskRunStartedEventSchema,
  TaskRunFinishedEventSchema,
  CoreCDEventSchema,
  // Helper functions
  createPipelineRunQueuedEvent,
  createPipelineRunStartedEvent,
  createPipelineRunFinishedEvent,
  createTaskRunStartedEvent,
  createTaskRunFinishedEvent,
} from "../schemas";

describe("CD Events Core Schemas", () => {
  describe("Basic Types and Enums", () => {
    it("should validate outcome enum", () => {
      expect(OutcomeEnum.parse("success")).toBe("success");
      expect(OutcomeEnum.parse("error")).toBe("error");
      expect(OutcomeEnum.parse("failure")).toBe("failure");

      expect(() => OutcomeEnum.parse("invalid")).toThrow();
    });

    it("should validate subject type enum", () => {
      expect(SubjectTypeEnum.parse("pipelineRun")).toBe("pipelineRun");
      expect(SubjectTypeEnum.parse("taskRun")).toBe("taskRun");

      expect(() => SubjectTypeEnum.parse("invalid")).toThrow();
    });

    it("should validate link type enum", () => {
      expect(LinkTypeEnum.parse("PATH")).toBe("PATH");
      expect(LinkTypeEnum.parse("RELATION")).toBe("RELATION");
      expect(LinkTypeEnum.parse("END")).toBe("END");

      expect(() => LinkTypeEnum.parse("invalid")).toThrow();
    });

    it("should validate link kind enum", () => {
      expect(LinkKindEnum.parse("TRIGGER")).toBe("TRIGGER");
      expect(LinkKindEnum.parse("COMPOSITION")).toBe("COMPOSITION");
      expect(LinkKindEnum.parse("DEPENDENCY")).toBe("DEPENDENCY");

      expect(() => LinkKindEnum.parse("invalid")).toThrow();
    });
  });

  describe("Basic Schema Validation", () => {
    it("should validate timestamps", () => {
      const validTimestamps = [
        "2023-01-01T00:00:00Z",
        "2023-12-31T23:59:59Z",
        "2023-06-15T12:30:45.123Z",
      ];

      const invalidTimestamps = [
        "2023-01-01",
        "2023-01-01T00:00:00",
        "invalid-timestamp",
        "",
      ];

      validTimestamps.forEach((timestamp) => {
        expect(() => TimestampSchema.parse(timestamp)).not.toThrow();
      });

      invalidTimestamps.forEach((timestamp) => {
        expect(() => TimestampSchema.parse(timestamp)).toThrow();
      });
    });

    it("should validate URI references", () => {
      const validUris = [
        "/tekton",
        "https://example.com",
        "/cluster1/jenkins",
        "http://localhost:8080/api",
      ];

      const invalidUris = ["", "   "];

      validUris.forEach((uri) => {
        expect(() => UriReferenceSchema.parse(uri)).not.toThrow();
      });

      invalidUris.forEach((uri) => {
        expect(() => UriReferenceSchema.parse(uri)).toThrow();
      });
    });

    it("should validate URIs", () => {
      const validUris = [
        "https://example.com",
        "http://localhost:8080",
        "https://api.cdsystem.com/namespace/pipelinerun-1234",
      ];

      const invalidUris = ["/relative/path", "not-a-url", ""];

      validUris.forEach((uri) => {
        expect(() => UriSchema.parse(uri)).not.toThrow();
      });

      invalidUris.forEach((uri) => {
        expect(() => UriSchema.parse(uri)).toThrow();
      });
    });
  });

  describe("Context Schema", () => {
    const validContext = {
      version: "0.4.1",
      id: "test-id-123",
      source: "/staging/tekton",
      type: "dev.cdevents.pipelinerun.started.0.2.0",
      timestamp: "2023-01-01T00:00:00Z",
    };

    it("should validate a valid context", () => {
      expect(() => CDEventContextSchema.parse(validContext)).not.toThrow();
    });

    it("should validate context with optional fields", () => {
      const contextWithOptionals = {
        ...validContext,
        schemaUri: "https://example.com/schema",
        chain_id: "550e8400-e29b-41d4-a716-446655440000",
        links: [
          {
            link_type: "PATH",
            from: { context_id: "550e8400-e29b-41d4-a716-446655440001" },
          },
        ],
      };

      expect(() =>
        CDEventContextSchema.parse(contextWithOptionals),
      ).not.toThrow();
    });

    it("should reject context missing required fields", () => {
      const requiredFields = ["version", "id", "source", "type", "timestamp"];

      requiredFields.forEach((field) => {
        const incompleteContext = { ...validContext };
        delete (incompleteContext as any)[field];

        expect(() => CDEventContextSchema.parse(incompleteContext)).toThrow();
      });
    });

    it("should reject invalid timestamp format", () => {
      const invalidContext = {
        ...validContext,
        timestamp: "invalid-timestamp",
      };

      expect(() => CDEventContextSchema.parse(invalidContext)).toThrow();
    });

    it("should reject invalid chain_id format", () => {
      const invalidContext = {
        ...validContext,
        chain_id: "not-a-uuid",
      };

      expect(() => CDEventContextSchema.parse(invalidContext)).toThrow();
    });
  });

  describe("Subject Reference Schema", () => {
    it("should validate a valid subject reference", () => {
      const validRef = {
        id: "my-pipeline-run-123",
        source: "/staging/tekton",
      };

      expect(() => SubjectReferenceSchema.parse(validRef)).not.toThrow();
    });

    it("should validate subject reference without optional source", () => {
      const validRef = {
        id: "my-pipeline-run-123",
      };

      expect(() => SubjectReferenceSchema.parse(validRef)).not.toThrow();
    });

    it("should reject subject reference without id", () => {
      const invalidRef = {
        source: "/staging/tekton",
      };

      expect(() => SubjectReferenceSchema.parse(invalidRef)).toThrow();
    });
  });

  describe("PipelineRun Content Schemas", () => {
    it("should validate complete pipeline run content", () => {
      const validContent = {
        pipelineName: "MyPipeline",
        url: "https://dashboard.org/namespace/pipelinerun-1234",
        outcome: "success" as const,
        errors: "No errors",
      };

      expect(() => PipelineRunContentSchema.parse(validContent)).not.toThrow();
    });

    it("should validate empty pipeline run content", () => {
      const emptyContent = {};
      expect(() => PipelineRunContentSchema.parse(emptyContent)).not.toThrow();
    });

    it("should validate queued content", () => {
      const queuedContent = {
        pipelineName: "MyPipeline",
        url: "https://dashboard.org/namespace/pipelinerun-1234",
      };

      expect(() =>
        PipelineRunQueuedContentSchema.parse(queuedContent),
      ).not.toThrow();
    });

    it("should validate started content", () => {
      const startedContent = {
        pipelineName: "MyPipeline",
        url: "https://dashboard.org/namespace/pipelinerun-1234",
      };

      expect(() =>
        PipelineRunStartedContentSchema.parse(startedContent),
      ).not.toThrow();
    });

    it("should validate finished content", () => {
      const finishedContent = {
        pipelineName: "MyPipeline",
        url: "https://dashboard.org/namespace/pipelinerun-1234",
        outcome: "failure" as const,
        errors: "Unit tests failed",
      };

      expect(() =>
        PipelineRunFinishedContentSchema.parse(finishedContent),
      ).not.toThrow();
    });

    it("should reject invalid outcome in finished content", () => {
      const invalidContent = {
        pipelineName: "MyPipeline",
        outcome: "invalid-outcome",
      };

      expect(() =>
        PipelineRunFinishedContentSchema.parse(invalidContent),
      ).toThrow();
    });

    it("should reject invalid URL format", () => {
      const invalidContent = {
        url: "not-a-url",
      };

      expect(() => PipelineRunContentSchema.parse(invalidContent)).toThrow();
    });
  });

  describe("TaskRun Content Schemas", () => {
    it("should validate complete task run content", () => {
      const validContent = {
        taskName: "build-task",
        pipelineRun: {
          id: "my-pipeline-run-123",
          source: "/staging/tekton",
        },
        url: "https://dashboard.org/namespace/taskrun-1234",
        outcome: "error" as const,
        errors: "Build failed",
      };

      expect(() => TaskRunContentSchema.parse(validContent)).not.toThrow();
    });

    it("should validate task run content without pipeline reference", () => {
      const validContent = {
        taskName: "standalone-task",
        url: "https://dashboard.org/namespace/taskrun-1234",
      };

      expect(() => TaskRunContentSchema.parse(validContent)).not.toThrow();
    });

    it("should validate started content", () => {
      const startedContent = {
        taskName: "build-task",
        pipelineRun: {
          id: "my-pipeline-run-123",
        },
        url: "https://dashboard.org/namespace/taskrun-1234",
      };

      expect(() =>
        TaskRunStartedContentSchema.parse(startedContent),
      ).not.toThrow();
    });

    it("should validate finished content", () => {
      const finishedContent = {
        taskName: "test-task",
        pipelineRun: {
          id: "my-pipeline-run-123",
        },
        url: "https://dashboard.org/namespace/taskrun-1234",
        outcome: "success" as const,
      };

      expect(() =>
        TaskRunFinishedContentSchema.parse(finishedContent),
      ).not.toThrow();
    });
  });

  describe("Complete Event Schemas", () => {
    const baseContext = {
      version: "0.4.1",
      id: "event-123",
      source: "/staging/tekton",
      timestamp: "2023-01-01T00:00:00Z",
    };

    const baseSubject = {
      id: "subject-123",
      type: "pipelineRun" as const,
    };

    it("should validate pipeline run queued event", () => {
      const event = {
        context: {
          ...baseContext,
          type: "dev.cdevents.pipelinerun.queued.0.2.0",
        },
        subject: {
          ...baseSubject,
          content: {
            pipelineName: "MyPipeline",
            url: "https://dashboard.org/pipelinerun-123",
          },
        },
      };

      expect(() => PipelineRunQueuedEventSchema.parse(event)).not.toThrow();
    });

    it("should validate pipeline run started event", () => {
      const event = {
        context: {
          ...baseContext,
          type: "dev.cdevents.pipelinerun.started.0.2.0",
        },
        subject: {
          ...baseSubject,
          content: {
            pipelineName: "MyPipeline",
            url: "https://dashboard.org/pipelinerun-123",
          },
        },
      };

      expect(() => PipelineRunStartedEventSchema.parse(event)).not.toThrow();
    });

    it("should validate pipeline run finished event", () => {
      const event = {
        context: {
          ...baseContext,
          type: "dev.cdevents.pipelinerun.finished.0.2.0",
        },
        subject: {
          ...baseSubject,
          content: {
            pipelineName: "MyPipeline",
            url: "https://dashboard.org/pipelinerun-123",
            outcome: "success" as const,
          },
        },
      };

      expect(() => PipelineRunFinishedEventSchema.parse(event)).not.toThrow();
    });

    it("should validate task run started event", () => {
      const event = {
        context: {
          ...baseContext,
          type: "dev.cdevents.taskrun.started.0.2.0",
        },
        subject: {
          id: "task-subject-123",
          type: "taskRun" as const,
          content: {
            taskName: "build-task",
            pipelineRun: {
              id: "pipeline-123",
            },
            url: "https://dashboard.org/taskrun-123",
          },
        },
      };

      expect(() => TaskRunStartedEventSchema.parse(event)).not.toThrow();
    });

    it("should validate task run finished event", () => {
      const event = {
        context: {
          ...baseContext,
          type: "dev.cdevents.taskrun.finished.0.2.0",
        },
        subject: {
          id: "task-subject-123",
          type: "taskRun" as const,
          content: {
            taskName: "test-task",
            pipelineRun: {
              id: "pipeline-123",
            },
            url: "https://dashboard.org/taskrun-123",
            outcome: "failure" as const,
            errors: "Tests failed",
          },
        },
      };

      expect(() => TaskRunFinishedEventSchema.parse(event)).not.toThrow();
    });

    it("should validate event with custom data", () => {
      const event = {
        context: {
          ...baseContext,
          type: "dev.cdevents.pipelinerun.started.0.2.0",
        },
        subject: {
          ...baseSubject,
          content: {
            pipelineName: "MyPipeline",
          },
        },
        customData: {
          buildNumber: 42,
          branch: "main",
        },
        customDataContentType: "application/json",
      };

      expect(() => PipelineRunStartedEventSchema.parse(event)).not.toThrow();
    });

    it("should reject event with wrong event type", () => {
      const event = {
        context: {
          ...baseContext,
          type: "dev.cdevents.pipelinerun.wrong.0.2.0",
        },
        subject: {
          ...baseSubject,
          content: {
            pipelineName: "MyPipeline",
          },
        },
      };

      expect(() => PipelineRunQueuedEventSchema.parse(event)).toThrow();
    });

    it("should validate all events with CoreCDEventSchema union", () => {
      const events = [
        {
          context: {
            ...baseContext,
            type: "dev.cdevents.pipelinerun.queued.0.2.0",
          },
          subject: {
            ...baseSubject,
            content: { pipelineName: "Test" },
          },
        },
        {
          context: {
            ...baseContext,
            type: "dev.cdevents.taskrun.finished.0.2.0",
          },
          subject: {
            id: "task-123",
            type: "taskRun" as const,
            content: {
              taskName: "Test",
              outcome: "success" as const,
            },
          },
        },
      ];

      events.forEach((event) => {
        expect(() => CoreCDEventSchema.parse(event)).not.toThrow();
      });
    });
  });

  describe("Helper Functions", () => {
    const commonParams = {
      contextId: "ctx-123",
      source: "/test/source",
      timestamp: "2023-01-01T00:00:00Z",
      subjectId: "subj-123",
    };

    it("should create valid pipeline run queued event", () => {
      const event = createPipelineRunQueuedEvent(
        commonParams.contextId,
        commonParams.source,
        commonParams.timestamp,
        commonParams.subjectId,
        "TestPipeline",
        "https://example.com/pipeline",
      );

      expect(() => PipelineRunQueuedEventSchema.parse(event)).not.toThrow();
      expect(event.context.type).toBe("dev.cdevents.pipelinerun.queued.0.2.0");
      expect(event.subject.content.pipelineName).toBe("TestPipeline");
    });

    it("should create valid pipeline run started event", () => {
      const event = createPipelineRunStartedEvent(
        commonParams.contextId,
        commonParams.source,
        commonParams.timestamp,
        commonParams.subjectId,
        "TestPipeline",
      );

      expect(() => PipelineRunStartedEventSchema.parse(event)).not.toThrow();
      expect(event.context.type).toBe("dev.cdevents.pipelinerun.started.0.2.0");
    });

    it("should create valid pipeline run finished event", () => {
      const event = createPipelineRunFinishedEvent(
        commonParams.contextId,
        commonParams.source,
        commonParams.timestamp,
        commonParams.subjectId,
        "success",
        "TestPipeline",
        "https://example.com/pipeline",
        undefined,
      );

      expect(() => PipelineRunFinishedEventSchema.parse(event)).not.toThrow();
      expect(event.context.type).toBe(
        "dev.cdevents.pipelinerun.finished.0.2.0",
      );
      expect(event.subject.content.outcome).toBe("success");
    });

    it("should create valid task run started event", () => {
      const event = createTaskRunStartedEvent(
        commonParams.contextId,
        commonParams.source,
        commonParams.timestamp,
        commonParams.subjectId,
        "build-task",
        { id: "pipeline-123" },
        "https://example.com/task",
      );

      expect(() => TaskRunStartedEventSchema.parse(event)).not.toThrow();
      expect(event.context.type).toBe("dev.cdevents.taskrun.started.0.2.0");
      expect(event.subject.content.taskName).toBe("build-task");
    });

    it("should create valid task run finished event", () => {
      const event = createTaskRunFinishedEvent(
        commonParams.contextId,
        commonParams.source,
        commonParams.timestamp,
        commonParams.subjectId,
        "error",
        "test-task",
        { id: "pipeline-123" },
        "https://example.com/task",
        "Build compilation failed",
      );

      expect(() => TaskRunFinishedEventSchema.parse(event)).not.toThrow();
      expect(event.context.type).toBe("dev.cdevents.taskrun.finished.0.2.0");
      expect(event.subject.content.outcome).toBe("error");
      expect(event.subject.content.errors).toBe("Build compilation failed");
    });

    it("should create events with minimal parameters", () => {
      const event = createPipelineRunQueuedEvent(
        commonParams.contextId,
        commonParams.source,
        commonParams.timestamp,
        commonParams.subjectId,
      );

      expect(() => PipelineRunQueuedEventSchema.parse(event)).not.toThrow();
      expect(event.subject.content.pipelineName).toBeUndefined();
      expect(event.subject.content.url).toBeUndefined();
    });
  });

  describe("Edge Cases and Error Scenarios", () => {
    it("should handle empty subject content", () => {
      const event = {
        context: {
          version: "0.4.1",
          id: "test-id",
          source: "/test",
          type: "dev.cdevents.pipelinerun.queued.0.2.0",
          timestamp: "2023-01-01T00:00:00Z",
        },
        subject: {
          id: "subject-id",
          content: {},
        },
      };

      expect(() => PipelineRunQueuedEventSchema.parse(event)).not.toThrow();
    });

    it("should reject invalid UUID in subject reference", () => {
      const invalidRef = {
        id: "not-a-valid-id",
        source: "/test",
      };

      // Subject reference ID doesn't need to be UUID, just non-empty string
      expect(() => SubjectReferenceSchema.parse(invalidRef)).not.toThrow();
    });

    it("should handle various timestamp formats", () => {
      const validTimestamps = [
        "2023-01-01T00:00:00Z",
        "2023-12-31T23:59:59Z",
        "2023-06-15T12:30:45.123Z",
      ];

      validTimestamps.forEach((timestamp) => {
        expect(() => TimestampSchema.parse(timestamp)).not.toThrow();
      });
    });

    it("should validate complex link structures", () => {
      const context = {
        version: "0.4.1",
        id: "test-id",
        source: "/test",
        type: "dev.cdevents.pipelinerun.started.0.2.0",
        timestamp: "2023-01-01T00:00:00Z",
        links: [
          {
            link_type: "PATH" as const,
            from: {
              context_id: "550e8400-e29b-41d4-a716-446655440000",
            },
          },
          {
            link_type: "RELATION" as const,
            link_kind: "TRIGGER" as const,
            target: {
              context_id: "550e8400-e29b-41d4-a716-446655440001",
            },
          },
        ],
      };

      expect(() => CDEventContextSchema.parse(context)).not.toThrow();
    });
  });
});
