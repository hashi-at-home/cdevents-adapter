import { describe, it, expect, beforeEach, vi } from "vitest";
import { GitHubAdapter } from "../../../adapters/github/adapter";
import {
  PipelineRunQueuedEventSchema,
  PipelineRunStartedEventSchema,
  PipelineRunFinishedEventSchema,
} from "../../../schemas";

describe("GitHub Adapter Essential Tests", () => {
  const adapter = new GitHubAdapter();

  describe("Supported Events Configuration", () => {
    it("should support the correct workflow_job events", () => {
      expect(adapter.supportedEvents).toEqual([
        "workflow_job.queued",
        "workflow_job.waiting",
        "workflow_job.in_progress",
        "workflow_job.completed",
        "ping",
      ]);
    });


  });

  describe("Webhook Data Validation - Required Fields Only", () => {
    // Complete webhook data with all required fields for the schema
    const createCompleteWebhook = (action: string, status: string, conclusion: string | null = null) => ({
      action,
      workflow_job: {
        id: 123456789,
        run_id: 987654321,
        workflow_name: "Test Pipeline",
        head_branch: "main",
        run_url: "https://api.github.com/repos/owner/repo/actions/runs/987654321",
        run_attempt: 1,
        node_id: "MDExOldvcmtmbG93Sm9iMTIzNDU2Nzg5",
        head_sha: "abc123def456", // # pragma: allowlist secret
        url: "https://api.github.com/repos/owner/repo/actions/jobs/123456789",
        html_url: "https://github.com/owner/repo/actions/runs/987654321/jobs/123456789",
        status,
        conclusion,
        created_at: "2023-10-01T12:00:00Z",
        started_at: status === "queued" ? null : "2023-10-01T12:01:00Z",
        completed_at: status === "completed" ? "2023-10-01T12:05:00Z" : null,
        name: "test-job",
        steps: [],
        check_run_url: "https://api.github.com/repos/owner/repo/check-runs/123456789",
        labels: ["ubuntu-latest"],
        runner_id: status === "queued" || status === "waiting" ? null : 1,
        runner_name: status === "queued" || status === "waiting" ? null : "runner-1",
        runner_group_id: null,
        runner_group_name: null,
      },
      repository: {
        id: 12345,
        node_id: "MDEwOlJlcG9zaXRvcnkxMjM0NQ==",
        name: "repo",
        full_name: "owner/repo",
        owner: {
          login: "owner",
          id: 67890,
        },
      },
      sender: {
        login: "developer",
        id: 67890,
      },
    });

    it("should validate complete queued webhook data", async () => {
      const webhook = createCompleteWebhook("queued", "queued");
      const isValid = await adapter.validateWebhook(webhook);
      expect(isValid).toBe(true);
    });

    it("should validate complete in_progress webhook data", async () => {
      const webhook = createCompleteWebhook("in_progress", "in_progress");
      const isValid = await adapter.validateWebhook(webhook);
      expect(isValid).toBe(true);
    });

    it("should validate complete completed webhook data", async () => {
      const webhook = createCompleteWebhook("completed", "completed", "success");
      const isValid = await adapter.validateWebhook(webhook);
      expect(isValid).toBe(true);
    });

    it("should reject webhook missing required fields", async () => {
      const invalidWebhook = {
        action: "queued",
        // Missing workflow_job
        repository: {
          name: "repo",
          owner: { login: "owner" },
        },
        sender: { login: "developer", id: 123 },
      };
      const isValid = await adapter.validateWebhook(invalidWebhook);
      expect(isValid).toBe(false);
    });
  });

  describe("CDEvent Transformation - workflow_job.queued", () => {
    it("should transform queued webhook to valid PipelineRunQueued CDEvent", async () => {
      const webhook = {
        action: "queued",
        workflow_job: {
          id: 123456789,
          run_id: 987654321,
          workflow_name: "CI Pipeline",
          head_branch: "main",
          run_url: "https://api.github.com/repos/owner/repo/actions/runs/987654321",
          run_attempt: 1,
          node_id: "MDExOldvcmtmbG93Sm9iMTIzNDU2Nzg5",
          head_sha: "abc123def456", // # pragma: allowlist secret
          url: "https://api.github.com/repos/owner/repo/actions/jobs/123456789",
          html_url: "https://github.com/owner/repo/actions/runs/987654321/jobs/123456789",
          status: "queued",
          conclusion: null,
          created_at: "2023-10-01T12:00:00Z",
          started_at: null,
          completed_at: null,
          name: "build",
          steps: [],
          check_run_url: "https://api.github.com/repos/owner/repo/check-runs/123456789",
          labels: ["ubuntu-latest"],
          runner_id: null,
          runner_name: null,
          runner_group_id: null,
          runner_group_name: null,
        },
        repository: {
          id: 12345,
          node_id: "MDEwOlJlcG9zaXRvcnkxMjM0NQ==",
          name: "repo",
          full_name: "owner/repo",
          owner: {
            login: "owner",
            id: 67890,
          },
        },
        sender: {
          login: "developer",
          id: 67890,
        },
      };

      const cdevent = await adapter.transform(webhook, "workflow_job.queued");

      // Verify core CDEvent structure
      expect(cdevent.context).toMatchObject({
        version: "0.4.1",
        type: "dev.cdevents.pipelinerun.queued.0.2.0",
      });
      expect(cdevent.context.id).toBeDefined();
      expect(cdevent.context.source).toBe("https://github.com/owner/repo");
      expect(cdevent.context.timestamp).toBeDefined();

      // Verify subject contains required fields from webhook
      expect(cdevent.subject).toMatchObject({
        id: "github-workflow-job-123456789",
        content: {
          pipelineName: "CI Pipeline",
          url: "https://github.com/owner/repo/actions/runs/987654321/jobs/123456789",
        },
      });

      // Verify custom data includes necessary GitHub info
      expect(cdevent.customData.github).toMatchObject({
        action: "queued",
        workflow_job: {
          id: 123456789,
          run_id: 987654321,
          name: "build",
          workflow_name: "CI Pipeline",
          head_branch: "main",
        },
        repository: {
          name: "repo",
          full_name: "owner/repo",
        },
        sender: {
          login: "developer",
        },
      });

      // Validate against CDEvent schema
      const validation = PipelineRunQueuedEventSchema.safeParse(cdevent);
      expect(validation.success).toBe(true);
    });
  });

  describe("CDEvent Transformation - workflow_job.in_progress", () => {
    it("should transform in_progress webhook to valid PipelineRunStarted CDEvent", async () => {
      const webhook = {
        action: "in_progress",
        workflow_job: {
          id: 123456789,
          run_id: 987654321,
          workflow_name: "CI Pipeline",
          head_branch: "main",
          run_url: "https://api.github.com/repos/owner/repo/actions/runs/987654321",
          run_attempt: 1,
          node_id: "MDExOldvcmtmbG93Sm9iMTIzNDU2Nzg5",
          head_sha: "abc123def456", // # pragma: allowlist secret
          url: "https://api.github.com/repos/owner/repo/actions/jobs/123456789",
          html_url: "https://github.com/owner/repo/actions/runs/987654321/jobs/123456789",
          status: "in_progress",
          conclusion: null,
          created_at: "2023-10-01T12:00:00Z",
          started_at: "2023-10-01T12:01:00Z",
          completed_at: null,
          name: "build",
          steps: [],
          check_run_url: "https://api.github.com/repos/owner/repo/check-runs/123456789",
          labels: ["ubuntu-latest"],
          runner_id: 1,
          runner_name: "runner-1",
          runner_group_id: null,
          runner_group_name: null,
        },
        repository: {
          id: 12345,
          node_id: "MDEwOlJlcG9zaXRvcnkxMjM0NQ==",
          name: "repo",
          full_name: "owner/repo",
          owner: {
            login: "owner",
            id: 67890,
          },
        },
        sender: {
          login: "developer",
          id: 67890,
        },
      };

      const cdevent = await adapter.transform(webhook, "workflow_job.in_progress");

      // Verify core CDEvent structure
      expect(cdevent.context).toMatchObject({
        version: "0.4.1",
        type: "dev.cdevents.pipelinerun.started.0.2.0",
      });
      expect(cdevent.context.id).toBeDefined();
      expect(cdevent.context.source).toBe("https://github.com/owner/repo");

      // Verify subject
      expect(cdevent.subject).toMatchObject({
        id: "github-workflow-job-123456789",
        content: {
          pipelineName: "CI Pipeline",
          url: "https://github.com/owner/repo/actions/runs/987654321/jobs/123456789",
        },
      });

      // Verify runner info is included in custom data
      expect(cdevent.customData.github.workflow_job).toMatchObject({
        started_at: "2023-10-01T12:01:00Z",
        runner_id: 1,
        runner_name: "runner-1",
      });

      // Validate against CDEvent schema
      const validation = PipelineRunStartedEventSchema.safeParse(cdevent);
      expect(validation.success).toBe(true);
    });
  });

  describe("CDEvent Transformation - workflow_job.completed", () => {
    const testCases = [
      { conclusion: "success", expectedOutcome: "success", expectError: false },
      { conclusion: "failure", expectedOutcome: "failure", expectError: true },
      { conclusion: "cancelled", expectedOutcome: "error", expectError: true },
      { conclusion: "timed_out", expectedOutcome: "failure", expectError: true },
    ];

    testCases.forEach(({ conclusion, expectedOutcome, expectError }) => {
      it(`should transform completed webhook with ${conclusion} conclusion to CDEvent with ${expectedOutcome} outcome`, async () => {
        const webhook = {
          action: "completed",
          workflow_job: {
            id: 123456789,
            run_id: 987654321,
            workflow_name: "CI Pipeline",
            head_branch: "main",
            run_url: "https://api.github.com/repos/owner/repo/actions/runs/987654321",
            run_attempt: 1,
            node_id: "MDExOldvcmtmbG93Sm9iMTIzNDU2Nzg5",
            head_sha: "abc123def456", // # pragma: allowlist secret
            url: "https://api.github.com/repos/owner/repo/actions/jobs/123456789",
            html_url: "https://github.com/owner/repo/actions/runs/987654321/jobs/123456789",
            status: "completed",
            conclusion,
            created_at: "2023-10-01T12:00:00Z",
            started_at: "2023-10-01T12:01:00Z",
            completed_at: "2023-10-01T12:05:00Z",
            name: "build",
            steps: [],
            check_run_url: "https://api.github.com/repos/owner/repo/check-runs/123456789",
            labels: ["ubuntu-latest"],
            runner_id: 1,
            runner_name: "runner-1",
            runner_group_id: null,
            runner_group_name: null,
          },
          repository: {
            id: 12345,
            node_id: "MDEwOlJlcG9zaXRvcnkxMjM0NQ==",
            name: "repo",
            full_name: "owner/repo",
            owner: {
              login: "owner",
              id: 67890,
            },
          },
          sender: {
            login: "developer",
            id: 67890,
          },
        };

        const cdevent = await adapter.transform(webhook, "workflow_job.completed");

        // Verify core CDEvent structure
        expect(cdevent.context).toMatchObject({
          version: "0.4.1",
          type: "dev.cdevents.pipelinerun.finished.0.2.0",
        });

        // Verify outcome mapping
        expect(cdevent.subject.content.outcome).toBe(expectedOutcome);

        // Verify error message is included when appropriate
        if (expectError) {
          expect(cdevent.subject.content.errors).toBeDefined();
          expect(cdevent.subject.content.errors).toContain("build");
        } else {
          expect(cdevent.subject.content.errors).toBeUndefined();
        }

        // Validate against CDEvent schema
        const validation = PipelineRunFinishedEventSchema.safeParse(cdevent);
        expect(validation.success).toBe(true);
      });
    });
  });

  describe("CDEvent Transformation - workflow_job.waiting", () => {
    it("should transform waiting webhook to valid PipelineRunQueued CDEvent", async () => {
      const webhook = {
        action: "waiting",
        workflow_job: {
          id: 123456789,
          run_id: 987654321,
          workflow_name: "CI Pipeline",
          head_branch: "main",
          run_url: "https://api.github.com/repos/owner/repo/actions/runs/987654321",
          run_attempt: 1,
          node_id: "MDExOldvcmtmbG93Sm9iMTIzNDU2Nzg5",
          head_sha: "abc123def456", // # pragma: allowlist secret
          url: "https://api.github.com/repos/owner/repo/actions/jobs/123456789",
          html_url: "https://github.com/owner/repo/actions/runs/987654321/jobs/123456789",
          status: "waiting",
          conclusion: null,
          created_at: "2023-10-01T12:00:00Z",
          started_at: null,
          completed_at: null,
          name: "build",
          steps: [],
          check_run_url: "https://api.github.com/repos/owner/repo/check-runs/123456789",
          labels: ["ubuntu-latest"],
          runner_id: null,
          runner_name: null,
          runner_group_id: null,
          runner_group_name: null,
        },
        repository: {
          id: 12345,
          node_id: "MDEwOlJlcG9zaXRvcnkxMjM0NQ==",
          name: "repo",
          full_name: "owner/repo",
          owner: {
            login: "owner",
            id: 67890,
          },
        },
        sender: {
          login: "developer",
          id: 67890,
        },
      };

      const cdevent = await adapter.transform(webhook, "workflow_job.waiting");

      // Verify it creates a queued event (waiting is mapped to queued)
      expect(cdevent.context.type).toBe("dev.cdevents.pipelinerun.queued.0.2.0");
      expect(cdevent.subject.id).toBe("github-workflow-job-123456789");

      // Validate against CDEvent schema
      const validation = PipelineRunQueuedEventSchema.safeParse(cdevent);
      expect(validation.success).toBe(true);
    });
  });

  describe("Ping Event Handling", () => {
    it("should handle ping webhook and return success response", async () => {
      const pingWebhook = {
        zen: "Design for failure.",
        hook_id: 12345678,
        hook: {
          type: "Repository",
          id: 12345678,
          name: "web",
          active: true,
          events: ["workflow_job"],
          config: {
            content_type: "json",
            insecure_ssl: "0",
            url: "https://example.com/webhook"
          },
          updated_at: "2023-10-01T12:00:00Z",
          created_at: "2023-10-01T12:00:00Z",
          deliveries_url: "https://api.github.com/repos/owner/repo/hooks/12345678/deliveries",
          ping_url: "https://api.github.com/repos/owner/repo/hooks/12345678/pings",
          last_response: {
            code: 200,
            status: "success",
            message: null
          }
        },
        repository: {
          id: 12345,
          node_id: "MDEwOlJlcG9zaXRvcnkxMjM0NQ==",
          name: "repo",
          full_name: "owner/repo",
          owner: {
            login: "owner",
            id: 67890,
          },
        },
        sender: {
          login: "developer",
          id: 67890,
        },
      };

      const result = await adapter.transform(pingWebhook, "ping");

      // Ping doesn't create a CDEvent, just returns success info
      expect(result).toMatchObject({
        success: true,
        message: "GitHub webhook ping received successfully",
        ping: {
          zen: "Design for failure.",
          hook_id: 12345678,
          repository: "owner/repo",
          sender: "developer",
        },
      });
    });
  });

  describe("Error Handling", () => {
    it("should throw error for unsupported event type", async () => {
      const webhook = {
        action: "unknown",
        workflow_job: { id: 123 },
        repository: { name: "repo", owner: { login: "owner" } },
        sender: { login: "dev", id: 1 },
      };

      await expect(
        adapter.transform(webhook, "workflow_job.unknown")
      ).rejects.toThrow("Unsupported event type");
    });

    it("should throw error for malformed webhook data", async () => {
      const malformedWebhook = { invalid: "data" };

      await expect(
        adapter.transform(malformedWebhook, "workflow_job.queued")
      ).rejects.toThrow("Failed to transform webhook");
    });
  });

  describe("CDEvent ID Generation", () => {
    it("should generate consistent subject IDs for the same workflow job", async () => {
      const baseWebhook = {
        action: "queued",
        workflow_job: {
          id: 999,
          run_id: 111,
          workflow_name: "Test",
          head_branch: "main",
          run_url: "https://api.github.com/repos/owner/repo/actions/runs/111",
          run_attempt: 1,
          node_id: "MDExOldvcmtmbG93Sm9iOTk5",
          head_sha: "abc123",
          url: "https://api.github.com/repos/owner/repo/actions/jobs/999",
          html_url: "https://github.com/owner/repo/actions/runs/111/jobs/999",
          status: "queued",
          conclusion: null,
          created_at: "2023-10-01T12:00:00Z",
          started_at: null,
          completed_at: null,
          name: "job",
          steps: [],
          check_run_url: "https://api.github.com/repos/owner/repo/check-runs/999",
          labels: [],
          runner_id: null,
          runner_name: null,
          runner_group_id: null,
          runner_group_name: null,
        },
        repository: {
          id: 1,
          node_id: "MDEwOlJlcG9zaXRvcnkx",
          name: "repo",
          full_name: "owner/repo",
          owner: { login: "owner", id: 1 },
        },
        sender: { login: "dev", id: 1 },
      };

      const webhook2 = JSON.parse(JSON.stringify(baseWebhook));
      webhook2.action = "in_progress";
      webhook2.workflow_job.status = "in_progress";
      webhook2.workflow_job.started_at = "2023-10-01T12:01:00Z";
      webhook2.workflow_job.runner_id = 1;
      webhook2.workflow_job.runner_name = "runner-1";

      const cdevent1 = await adapter.transform(baseWebhook, "workflow_job.queued");
      const cdevent2 = await adapter.transform(webhook2, "workflow_job.in_progress");

      // Same job ID should produce same subject ID
      expect(cdevent1.subject.id).toBe("github-workflow-job-999");
      expect(cdevent2.subject.id).toBe("github-workflow-job-999");
    });

    it("should generate unique context IDs for each event", async () => {
      const webhook = {
        action: "queued",
        workflow_job: {
          id: 123,
          run_id: 456,
          workflow_name: "Test",
          head_branch: "main",
          run_url: "https://api.github.com/repos/owner/repo/actions/runs/456",
          run_attempt: 1,
          node_id: "MDExOldvcmtmbG93Sm9iMTIz",
          head_sha: "abc123",
          url: "https://api.github.com/repos/owner/repo/actions/jobs/123",
          html_url: "https://github.com/owner/repo/actions/runs/456/jobs/123",
          status: "queued",
          conclusion: null,
          created_at: "2023-10-01T12:00:00Z",
          started_at: null,
          completed_at: null,
          name: "job",
          steps: [],
          check_run_url: "https://api.github.com/repos/owner/repo/check-runs/123",
          labels: [],
          runner_id: null,
          runner_name: null,
          runner_group_id: null,
          runner_group_name: null,
        },
        repository: {
          id: 1,
          node_id: "MDEwOlJlcG9zaXRvcnkx",
          name: "repo",
          full_name: "owner/repo",
          owner: { login: "owner", id: 1 },
        },
        sender: { login: "dev", id: 1 },
      };

      const cdevent1 = await adapter.transform(webhook, "workflow_job.queued");
      const cdevent2 = await adapter.transform(webhook, "workflow_job.queued");

      // Each event should have a unique context ID
      expect(cdevent1.context.id).toBeDefined();
      expect(cdevent2.context.id).toBeDefined();
      expect(cdevent1.context.id).not.toBe(cdevent2.context.id);
    });
  });

  describe("Source URI Construction", () => {
    it("should construct correct source URI from repository information", async () => {
      const webhook = {
        action: "queued",
        workflow_job: {
          id: 123,
          run_id: 456,
          workflow_name: "Test",
          head_branch: "main",
          run_url: "https://api.github.com/repos/my-org/my-repo/actions/runs/456",
          run_attempt: 1,
          node_id: "MDExOldvcmtmbG93Sm9iMTIz",
          head_sha: "abc123",
          url: "https://api.github.com/repos/my-org/my-repo/actions/jobs/123",
          html_url: "https://github.com/my-org/my-repo/actions/runs/456/jobs/123",
          status: "queued",
          conclusion: null,
          created_at: "2023-10-01T12:00:00Z",
          started_at: null,
          completed_at: null,
          name: "job",
          steps: [],
          check_run_url: "https://api.github.com/repos/my-org/my-repo/check-runs/123",
          labels: [],
          runner_id: null,
          runner_name: null,
          runner_group_id: null,
          runner_group_name: null,
        },
        repository: {
          id: 1,
          node_id: "MDEwOlJlcG9zaXRvcnkx",
          name: "my-repo",
          full_name: "my-org/my-repo",
          owner: { login: "my-org", id: 1 },
        },
        sender: { login: "dev", id: 1 },
      };

      const cdevent = await adapter.transform(webhook, "workflow_job.queued");

      expect(cdevent.context.source).toBe("https://github.com/my-org/my-repo");
    });
  });
});
