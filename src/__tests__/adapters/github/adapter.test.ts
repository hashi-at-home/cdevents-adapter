import { describe, it, expect } from "vitest";
import { GitHubAdapter } from "../../../adapters/github/adapter";
import {
  PipelineRunQueuedEventSchema,
  PipelineRunStartedEventSchema,
  PipelineRunFinishedEventSchema,
} from "../../../schemas";

describe("GitHubAdapter", () => {
  const adapter = new GitHubAdapter();

  const mockWorkflowJob = {
    id: 123456789,
    run_id: 987654321,
    run_url: "https://api.github.com/repos/owner/repo/actions/runs/987654321",
    run_attempt: 1,
    node_id: "MDExOldXb3JrZmxvd0pvYjEyMzQ1Njc4OQ==",
    head_sha: "abc123def456",
    url: "https://api.github.com/repos/owner/repo/actions/jobs/123456789",
    html_url:
      "https://github.com/owner/repo/actions/runs/987654321/jobs/123456789",
    started_at: "2023-10-01T12:00:00Z",
    completed_at: null,
    name: "build",
    steps: [],
    check_run_url:
      "https://api.github.com/repos/owner/repo/check-runs/123456789",
    labels: ["ubuntu-latest"],
    runner_id: null,
    runner_name: null,
    runner_group_id: null,
    runner_group_name: null,
  };

  const mockWorkflow = {
    id: 456789123,
    node_id: "MDExOldXb3JrZmxvdzQ1Njc4OTEyMw==",
    name: "CI/CD Pipeline",
    path: ".github/workflows/ci.yml",
    state: "active",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-10-01T11:00:00Z",
    url: "https://api.github.com/repos/owner/repo/actions/workflows/456789123",
    html_url: "https://github.com/owner/repo/actions/workflows/ci.yml",
    badge_url:
      "https://github.com/owner/repo/workflows/CI%2FCD%20Pipeline/badge.svg",
  };

  const mockRepository = {
    id: 123456,
    node_id: "MDEwOlJlcG9zaXRvcnkxMjM0NTY=",
    name: "test-repo",
    full_name: "owner/test-repo",
    private: false,
    owner: {
      login: "owner",
      id: 12345,
      node_id: "MDQ6VXNlcjEyMzQ1",
      avatar_url: "https://github.com/images/error/owner_happy.gif",
      gravatar_id: "",
      url: "https://api.github.com/users/owner",
      html_url: "https://github.com/owner",
      followers_url: "https://api.github.com/users/owner/followers",
      following_url:
        "https://api.github.com/users/owner/following{/other_user}",
      gists_url: "https://api.github.com/users/owner/gists{/gist_id}",
      starred_url: "https://api.github.com/users/owner/starred{/owner}{/repo}",
      subscriptions_url: "https://api.github.com/users/owner/subscriptions",
      organizations_url: "https://api.github.com/users/owner/orgs",
      repos_url: "https://api.github.com/users/owner/repos",
      events_url: "https://api.github.com/users/owner/events{/privacy}",
      received_events_url: "https://api.github.com/users/owner/received_events",
      type: "User",
      site_admin: false,
    },
    html_url: "https://github.com/owner/test-repo",
    description: "A test repository",
    fork: false,
    url: "https://api.github.com/repos/owner/test-repo",
    archive_url:
      "https://api.github.com/repos/owner/test-repo/{archive_format}{/ref}",
    assignees_url:
      "https://api.github.com/repos/owner/test-repo/assignees{/user}",
    blobs_url: "https://api.github.com/repos/owner/test-repo/git/blobs{/sha}",
    branches_url:
      "https://api.github.com/repos/owner/test-repo/branches{/branch}",
    collaborators_url:
      "https://api.github.com/repos/owner/test-repo/collaborators{/collaborator}",
    comments_url:
      "https://api.github.com/repos/owner/test-repo/comments{/number}",
    commits_url: "https://api.github.com/repos/owner/test-repo/commits{/sha}",
    compare_url:
      "https://api.github.com/repos/owner/test-repo/compare/{base}...{head}",
    contents_url:
      "https://api.github.com/repos/owner/test-repo/contents/{+path}",
    contributors_url:
      "https://api.github.com/repos/owner/test-repo/contributors",
    deployments_url: "https://api.github.com/repos/owner/test-repo/deployments",
    downloads_url: "https://api.github.com/repos/owner/test-repo/downloads",
    events_url: "https://api.github.com/repos/owner/test-repo/events",
    forks_url: "https://api.github.com/repos/owner/test-repo/forks",
    git_commits_url:
      "https://api.github.com/repos/owner/test-repo/git/commits{/sha}",
    git_refs_url: "https://api.github.com/repos/owner/test-repo/git/refs{/sha}",
    git_tags_url: "https://api.github.com/repos/owner/test-repo/git/tags{/sha}",
    git_url: "git:github.com/owner/test-repo.git",
    issue_comment_url:
      "https://api.github.com/repos/owner/test-repo/issues/comments{/number}",
    issue_events_url:
      "https://api.github.com/repos/owner/test-repo/issues/events{/number}",
    issues_url: "https://api.github.com/repos/owner/test-repo/issues{/number}",
    keys_url: "https://api.github.com/repos/owner/test-repo/keys{/key_id}",
    labels_url: "https://api.github.com/repos/owner/test-repo/labels{/name}",
    languages_url: "https://api.github.com/repos/owner/test-repo/languages",
    merges_url: "https://api.github.com/repos/owner/test-repo/merges",
    milestones_url:
      "https://api.github.com/repos/owner/test-repo/milestones{/number}",
    notifications_url:
      "https://api.github.com/repos/owner/test-repo/notifications{?since,all,participating}",
    pulls_url: "https://api.github.com/repos/owner/test-repo/pulls{/number}",
    releases_url: "https://api.github.com/repos/owner/test-repo/releases{/id}",
    ssh_url: "git@github.com:owner/test-repo.git",
    stargazers_url: "https://api.github.com/repos/owner/test-repo/stargazers",
    statuses_url: "https://api.github.com/repos/owner/test-repo/statuses/{sha}",
    subscribers_url: "https://api.github.com/repos/owner/test-repo/subscribers",
    subscription_url:
      "https://api.github.com/repos/owner/test-repo/subscription",
    tags_url: "https://api.github.com/repos/owner/test-repo/tags",
    teams_url: "https://api.github.com/repos/owner/test-repo/teams",
    trees_url: "https://api.github.com/repos/owner/test-repo/git/trees{/sha}",
    clone_url: "https://github.com/owner/test-repo.git",
    mirror_url: null,
    hooks_url: "https://api.github.com/repos/owner/test-repo/hooks",
    svn_url: "https://github.com/owner/test-repo",
    homepage: null,
    language: "TypeScript",
    forks_count: 5,
    stargazers_count: 10,
    watchers_count: 10,
    size: 1000,
    default_branch: "main",
    open_issues_count: 2,
    has_issues: true,
    has_projects: true,
    has_wiki: true,
    has_pages: false,
    has_downloads: true,
    archived: false,
    disabled: false,
    pushed_at: "2023-10-01T11:30:00Z",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-10-01T11:30:00Z",
  };

  const mockSender = {
    login: "developer",
    id: 67890,
    node_id: "MDQ6VXNlcjY3ODkw",
    avatar_url: "https://github.com/images/error/developer_happy.gif",
    gravatar_id: "",
    url: "https://api.github.com/users/developer",
    html_url: "https://github.com/developer",
    followers_url: "https://api.github.com/users/developer/followers",
    following_url:
      "https://api.github.com/users/developer/following{/other_user}",
    gists_url: "https://api.github.com/users/developer/gists{/gist_id}",
    starred_url:
      "https://api.github.com/users/developer/starred{/owner}{/repo}",
    subscriptions_url: "https://api.github.com/users/developer/subscriptions",
    organizations_url: "https://api.github.com/users/developer/orgs",
    repos_url: "https://api.github.com/users/developer/repos",
    events_url: "https://api.github.com/users/developer/events{/privacy}",
    received_events_url:
      "https://api.github.com/users/developer/received_events",
    type: "User",
    site_admin: false,
  };

  describe("Adapter Configuration", () => {
    it("should have correct adapter metadata", () => {
      expect(adapter.name).toBe("github");
      expect(adapter.version).toBe("1.0.0");
      expect(adapter.supportedEvents).toEqual([
        "workflow_job.queued",
        "workflow_job.in_progress",
        "workflow_job.completed",
      ]);
    });

    it("should provide webhook schemas for supported events", () => {
      expect(adapter.getWebhookSchema("workflow_job.queued")).toBeDefined();
      expect(
        adapter.getWebhookSchema("workflow_job.in_progress"),
      ).toBeDefined();
      expect(adapter.getWebhookSchema("workflow_job.completed")).toBeDefined();
    });
  });

  describe("Webhook Validation", () => {
    it("should validate valid webhook data", async () => {
      const validWebhook = {
        action: "queued",
        workflow_job: {
          ...mockWorkflowJob,
          status: "queued",
          conclusion: null,
        },
        workflow: mockWorkflow,
        repository: mockRepository,
        sender: mockSender,
      };

      const isValid = await adapter.validateWebhook(validWebhook);
      expect(isValid).toBe(true);
    });

    it("should reject invalid webhook data", async () => {
      const isValid = await adapter.validateWebhook(null);
      expect(isValid).toBe(false);
    });
  });

  describe("Workflow Job Queued Transformation", () => {
    it("should transform workflow_job.queued to pipeline run queued CD Event", async () => {
      const queuedWebhook = {
        action: "queued",
        workflow_job: {
          ...mockWorkflowJob,
          status: "queued",
          conclusion: null,
        },
        workflow: mockWorkflow,
        repository: mockRepository,
        sender: mockSender,
      };

      const result = await adapter.transform(
        queuedWebhook,
        "workflow_job.queued",
      );

      expect(result).toBeDefined();
      expect(result.context.type).toBe("dev.cdevents.pipelinerun.queued.0.2.0");
      expect(result.subject.id).toBe("github-workflow-job-123456789");
      expect(result.subject.content.pipelineName).toBe("CI/CD Pipeline");
      expect(result.subject.content.url).toBe(
        queuedWebhook.workflow_job.html_url,
      );

      // Validate the result is a proper CD Event
      const validation = PipelineRunQueuedEventSchema.safeParse(result);
      expect(validation.success).toBe(true);
    });

    it("should include GitHub-specific custom data", async () => {
      const queuedWebhook = {
        action: "queued",
        workflow_job: {
          ...mockWorkflowJob,
          status: "queued",
          conclusion: null,
        },
        workflow: mockWorkflow,
        repository: mockRepository,
        sender: mockSender,
      };

      const result = await adapter.transform(
        queuedWebhook,
        "workflow_job.queued",
      );

      expect(result.customData).toBeDefined();
      expect(result.customData.github).toBeDefined();
      expect(result.customData.github.action).toBe("queued");
      expect(result.customData.github.workflow_job.id).toBe(123456789);
      expect(result.customData.github.workflow.name).toBe("CI/CD Pipeline");
      expect(result.customData.github.repository.full_name).toBe(
        "owner/test-repo",
      );
    });
  });

  describe("Workflow Job In Progress Transformation", () => {
    it("should transform workflow_job.in_progress to pipeline run started CD Event", async () => {
      const inProgressWebhook = {
        action: "in_progress",
        workflow_job: {
          ...mockWorkflowJob,
          status: "in_progress",
          conclusion: null,
        },
        workflow: mockWorkflow,
        repository: mockRepository,
        sender: mockSender,
      };

      const result = await adapter.transform(
        inProgressWebhook,
        "workflow_job.in_progress",
      );

      expect(result).toBeDefined();
      expect(result.context.type).toBe(
        "dev.cdevents.pipelinerun.started.0.2.0",
      );
      expect(result.subject.id).toBe("github-workflow-job-123456789");
      expect(result.subject.content.pipelineName).toBe("CI/CD Pipeline");

      // Validate the result is a proper CD Event
      const validation = PipelineRunStartedEventSchema.safeParse(result);
      expect(validation.success).toBe(true);
    });
  });

  describe("Workflow Job Completed Transformation", () => {
    it("should transform successful workflow_job.completed to pipeline run finished CD Event", async () => {
      const completedWebhook = {
        action: "completed",
        workflow_job: {
          ...mockWorkflowJob,
          status: "completed",
          conclusion: "success",
          completed_at: "2023-10-01T12:05:00Z",
        },
        workflow: mockWorkflow,
        repository: mockRepository,
        sender: mockSender,
      };

      const result = await adapter.transform(
        completedWebhook,
        "workflow_job.completed",
      );

      expect(result).toBeDefined();
      expect(result.context.type).toBe(
        "dev.cdevents.pipelinerun.finished.0.2.0",
      );
      expect(result.subject.id).toBe("github-workflow-job-123456789");
      expect(result.subject.content.outcome).toBe("success");

      // Validate the result is a proper CD Event
      const validation = PipelineRunFinishedEventSchema.safeParse(result);
      expect(validation.success).toBe(true);
    });

    it("should transform failed workflow_job.completed with error message", async () => {
      const failedWebhook = {
        action: "completed",
        workflow_job: {
          ...mockWorkflowJob,
          status: "completed",
          conclusion: "failure",
          completed_at: "2023-10-01T12:05:00Z",
        },
        workflow: mockWorkflow,
        repository: mockRepository,
        sender: mockSender,
      };

      const result = await adapter.transform(
        failedWebhook,
        "workflow_job.completed",
      );

      expect(result).toBeDefined();
      expect(result.subject.content.outcome).toBe("failure");
      expect(result.subject.content.errors).toBe('Workflow job "build" failed');

      // Validate the result is a proper CD Event
      const validation = PipelineRunFinishedEventSchema.safeParse(result);
      expect(validation.success).toBe(true);
    });

    it("should map GitHub conclusions to CD Events outcomes correctly", async () => {
      const testCases = [
        { conclusion: "success", expectedOutcome: "success" },
        { conclusion: "failure", expectedOutcome: "failure" },
        { conclusion: "timed_out", expectedOutcome: "failure" },
        { conclusion: "cancelled", expectedOutcome: "error" },
        { conclusion: "skipped", expectedOutcome: "error" },
      ];

      for (const { conclusion, expectedOutcome } of testCases) {
        const webhook = {
          action: "completed",
          workflow_job: {
            ...mockWorkflowJob,
            status: "completed",
            conclusion: conclusion as any,
            completed_at: "2023-10-01T12:05:00Z",
          },
          workflow: mockWorkflow,
          repository: mockRepository,
          sender: mockSender,
        };

        const result = await adapter.transform(
          webhook,
          "workflow_job.completed",
        );
        expect(result.subject.content.outcome).toBe(expectedOutcome);
      }
    });
  });

  describe("Error Handling", () => {
    it("should throw error for unsupported event type", async () => {
      const webhook = {
        action: "queued",
        workflow_job: mockWorkflowJob,
        workflow: mockWorkflow,
        repository: mockRepository,
        sender: mockSender,
      };

      await expect(
        adapter.transform(webhook, "unsupported.event"),
      ).rejects.toThrow("Unsupported event type");
    });

    it("should throw error for invalid webhook structure", async () => {
      const invalidWebhook = { invalid: "data" };

      await expect(
        adapter.transform(invalidWebhook, "workflow_job.queued"),
      ).rejects.toThrow("Failed to transform webhook");
    });
  });
});
