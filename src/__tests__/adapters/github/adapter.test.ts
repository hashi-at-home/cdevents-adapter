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
    workflow_name: "CI/CD Pipeline",
    head_branch: "main",
    run_url: "https://api.github.com/repos/owner/repo/actions/runs/987654321",
    run_attempt: 1,
    node_id: "MDExOldXb3JrZmxvd0pvYjEyMzQ1Njc4OQ==",
    head_sha: "abc123def456",
    url: "https://api.github.com/repos/owner/repo/actions/jobs/123456789",
    html_url:
      "https://github.com/owner/repo/actions/runs/987654321/jobs/123456789",
    created_at: "2023-10-01T11:50:00Z",
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
        "workflow_job.waiting",
        "workflow_job.in_progress",
        "workflow_job.completed",
        "ping",
      ]);
    });

    it("should provide webhook schemas for supported events", () => {
      expect(adapter.getWebhookSchema("workflow_job.queued")).toBeDefined();
      expect(
        adapter.getWebhookSchema("workflow_job.in_progress"),
      ).toBeDefined();
      expect(adapter.getWebhookSchema("workflow_job.completed")).toBeDefined();
      expect(adapter.getWebhookSchema("ping")).toBeDefined();
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
        repository: mockRepository,
        sender: mockSender,
      };

      const isValid = await adapter.validateWebhook(validWebhook);
      expect(isValid).toBe(true);
    });

    it("should validate actual GitHub webhook payload structure", async () => {
      const actualWebhookPayload = {
        action: "queued",
        workflow_job: {
          id: 49565775813,
          run_id: 17454675960,
          workflow_name: "Release",
          head_branch: "master",
          run_url: "https://api.github.com/repos/brucellino/personal-automation/actions/runs/17454675960",
          run_attempt: 1,
          node_id: "CR_kwDOCnygpM8AAAALilm3xQ",
          head_sha: "21105e046013dbbfdaa8ad7fbd8aa6bf51115731",
          url: "https://api.github.com/repos/brucellino/personal-automation/actions/jobs/49565775813",
          html_url: "https://github.com/brucellino/personal-automation/actions/runs/17454675960/job/49565775813",
          status: "queued",
          conclusion: null,
          created_at: "2025-09-04T05:52:26Z",
          started_at: "2025-09-04T05:52:26Z",
          completed_at: null,
          name: "Lint",
          steps: [],
          check_run_url: "https://api.github.com/repos/brucellino/personal-automation/check-runs/49565775813",
          labels: ["self-hosted, hah"],
          runner_id: null,
          runner_name: null,
          runner_group_id: null,
          runner_group_name: null
        },
        repository: {
          id: 175939748,
          node_id: "MDEwOlJlcG9zaXRvcnkxNzU5Mzk3NDg=",
          name: "personal-automation",
          full_name: "brucellino/personal-automation",
          private: true,
          owner: {
            login: "brucellino",
            id: 2115428,
            node_id: "MDQ6VXNlcjIxMTU0Mjg=",
            avatar_url: "https://avatars.githubusercontent.com/u/2115428?v=4",
            gravatar_id: "",
            url: "https://api.github.com/users/brucellino",
            html_url: "https://github.com/brucellino",
            followers_url: "https://api.github.com/users/brucellino/followers",
            following_url: "https://api.github.com/users/brucellino/following{/other_user}",
            gists_url: "https://api.github.com/users/brucellino/gists{/gist_id}",
            starred_url: "https://api.github.com/users/brucellino/starred{/owner}{/repo}",
            subscriptions_url: "https://api.github.com/users/brucellino/subscriptions",
            organizations_url: "https://api.github.com/users/brucellino/orgs",
            repos_url: "https://api.github.com/users/brucellino/repos",
            events_url: "https://api.github.com/users/brucellino/events{/privacy}",
            received_events_url: "https://api.github.com/users/brucellino/received_events",
            type: "User",
            user_view_type: "public",
            site_admin: false
          },
          html_url: "https://github.com/brucellino/personal-automation",
          description: "Personal automation for my own workspace",
          fork: false,
          url: "https://api.github.com/repos/brucellino/personal-automation",
          archive_url: "https://api.github.com/repos/brucellino/personal-automation/{archive_format}{/ref}",
          assignees_url: "https://api.github.com/repos/brucellino/personal-automation/assignees{/user}",
          blobs_url: "https://api.github.com/repos/brucellino/personal-automation/git/blobs{/sha}",
          branches_url: "https://api.github.com/repos/brucellino/personal-automation/branches{/branch}",
          collaborators_url: "https://api.github.com/repos/brucellino/personal-automation/collaborators{/collaborator}",
          comments_url: "https://api.github.com/repos/brucellino/personal-automation/comments{/number}",
          commits_url: "https://api.github.com/repos/brucellino/personal-automation/commits{/sha}",
          compare_url: "https://api.github.com/repos/brucellino/personal-automation/compare/{base}...{head}",
          contents_url: "https://api.github.com/repos/brucellino/personal-automation/contents/{+path}",
          contributors_url: "https://api.github.com/repos/brucellino/personal-automation/contributors",
          deployments_url: "https://api.github.com/repos/brucellino/personal-automation/deployments",
          downloads_url: "https://api.github.com/repos/brucellino/personal-automation/downloads",
          events_url: "https://api.github.com/repos/brucellino/personal-automation/events",
          forks_url: "https://api.github.com/repos/brucellino/personal-automation/forks",
          git_commits_url: "https://api.github.com/repos/brucellino/personal-automation/git/commits{/sha}",
          git_refs_url: "https://api.github.com/repos/brucellino/personal-automation/git/refs{/sha}",
          git_tags_url: "https://api.github.com/repos/brucellino/personal-automation/git/tags{/sha}",
          git_url: "git://github.com/brucellino/personal-automation.git",
          issue_comment_url: "https://api.github.com/repos/brucellino/personal-automation/issues/comments{/number}",
          issue_events_url: "https://api.github.com/repos/brucellino/personal-automation/issues/events{/number}",
          issues_url: "https://api.github.com/repos/brucellino/personal-automation/issues{/number}",
          keys_url: "https://api.github.com/repos/brucellino/personal-automation/keys{/key_id}",
          labels_url: "https://api.github.com/repos/brucellino/personal-automation/labels{/name}",
          languages_url: "https://api.github.com/repos/brucellino/personal-automation/languages",
          merges_url: "https://api.github.com/repos/brucellino/personal-automation/merges",
          milestones_url: "https://api.github.com/repos/brucellino/personal-automation/milestones{/number}",
          notifications_url: "https://api.github.com/repos/brucellino/personal-automation/notifications{?since,all,participating}",
          pulls_url: "https://api.github.com/repos/brucellino/personal-automation/pulls{/number}",
          releases_url: "https://api.github.com/repos/brucellino/personal-automation/releases{/id}",
          ssh_url: "git@github.com:brucellino/personal-automation.git",
          clone_url: "https://github.com/brucellino/personal-automation.git",
          svn_url: "https://github.com/brucellino/personal-automation",
          homepage: "",
          size: 1428,
          stargazers_count: 0,
          watchers_count: 0,
          language: "Jinja",
          has_issues: true,
          has_projects: true,
          has_downloads: true,
          has_wiki: false,
          has_pages: false,
          has_discussions: false,
          forks_count: 0,
          mirror_url: null,
          archived: false,
          disabled: false,
          open_issues_count: 11,
          license: null,
          allow_forking: true,
          is_template: false,
          web_commit_signoff_required: false,
          topics: ["hacktoberfest-accepted", "hah-runner"],
          visibility: "private",
          forks: 0,
          open_issues: 11,
          watchers: 0,
          default_branch: "master",
          created_at: "2019-03-16T07:20:56Z",
          updated_at: "2025-08-25T06:03:57Z",
          pushed_at: "2025-09-04T05:52:24Z"
        },
        sender: {
          login: "brucellino",
          id: 2115428,
          node_id: "MDQ6VXNlcjIxMTU0Mjg=",
          avatar_url: "https://avatars.githubusercontent.com/u/2115428?v=4",
          gravatar_id: "",
          url: "https://api.github.com/users/brucellino",
          html_url: "https://github.com/brucellino",
          followers_url: "https://api.github.com/users/brucellino/followers",
          following_url: "https://api.github.com/users/brucellino/following{/other_user}",
          gists_url: "https://api.github.com/users/brucellino/gists{/gist_id}",
          starred_url: "https://api.github.com/users/brucellino/starred{/owner}{/repo}",
          subscriptions_url: "https://api.github.com/users/brucellino/subscriptions",
          organizations_url: "https://api.github.com/users/brucellino/orgs",
          repos_url: "https://api.github.com/users/brucellino/repos",
          events_url: "https://api.github.com/users/brucellino/events{/privacy}",
          received_events_url: "https://api.github.com/users/brucellino/received_events",
          type: "User",
          user_view_type: "public",
          site_admin: false
        }
      };

      const isValid = await adapter.validateWebhook(actualWebhookPayload);
      expect(isValid).toBe(true);

      // Test that transformation also works with actual payload
      const result = await adapter.transform(actualWebhookPayload, "workflow_job.queued");
      expect(result).toBeDefined();
      expect(result.context.type).toBe("dev.cdevents.pipelinerun.queued.0.2.0");
      expect(result.subject.id).toBe("github-workflow-job-49565775813");
      expect(result.subject.content.pipelineName).toBe("Release");
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
      expect(result.customData.github.workflow_job.workflow_name).toBe("CI/CD Pipeline");
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
        },
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

  describe("Workflow Job Waiting Transformation", () => {
    it("should transform workflow_job.waiting to pipeline run queued CD Event", async () => {
      const waitingWebhook = {
        action: "waiting",
        workflow_job: {
          ...mockWorkflowJob,
          status: "waiting",
          conclusion: null,
        },
        repository: mockRepository,
        sender: mockSender,
      };

      const result = await adapter.transform(
        waitingWebhook,
        "workflow_job.waiting",
      );

      expect(result).toBeDefined();
      expect(result.context.type).toBe("dev.cdevents.pipelinerun.queued.0.2.0");
      expect(result.subject.id).toBe("github-workflow-job-123456789");
      expect(result.subject.content.pipelineName).toBe("CI/CD Pipeline");

      // Validate the result is a proper CD Event
      const validation = PipelineRunQueuedEventSchema.safeParse(result);
      expect(validation.success).toBe(true);
    });
  });

  describe("Ping Event Handling", () => {
    it("should handle GitHub ping webhook successfully", async () => {
      const pingWebhook = {
        zen: "Speak like a human.",
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
            url: "https://example.com/webhook",
          },
          updated_at: "2023-10-01T12:00:00Z",
          created_at: "2023-10-01T11:00:00Z",
          deliveries_url: "https://api.github.com/repos/owner/test-repo/hooks/12345678/deliveries",
          ping_url: "https://api.github.com/repos/owner/test-repo/hooks/12345678/pings",
          last_response: {
            code: null,
            status: "unused",
            message: null,
          },
        },
        repository: mockRepository,
        sender: mockSender,
      };

      const result = await adapter.transform(pingWebhook, "ping");

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toBe("GitHub webhook ping received successfully");
      expect(result.ping).toBeDefined();
      expect(result.ping.zen).toBe("Speak like a human.");
      expect(result.ping.hook_id).toBe(12345678);
      expect(result.ping.repository).toBe("owner/test-repo");
      expect(result.ping.sender).toBe("developer");
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

    it("should handle ping event in unsupported check", async () => {
      const pingWebhook = {
        zen: "Test zen quote",
        hook_id: 123,
        hook: {
          type: "Repository",
          id: 123,
          name: "web",
          active: true,
          events: ["ping"],
          config: {
            content_type: "json",
            insecure_ssl: "0",
            url: "https://example.com/webhook",
          },
          updated_at: "2023-10-01T12:00:00Z",
          created_at: "2023-10-01T11:00:00Z",
          deliveries_url: "https://api.github.com/repos/owner/test-repo/hooks/123/deliveries",
          ping_url: "https://api.github.com/repos/owner/test-repo/hooks/123/pings",
          last_response: null,
        },
        repository: mockRepository,
        sender: mockSender,
      };

      const result = await adapter.transform(pingWebhook, "ping");
      expect(result.success).toBe(true);
    });

    it("should throw error for invalid webhook structure", async () => {
      const invalidWebhook = { invalid: "data" };

      await expect(
        adapter.transform(invalidWebhook, "workflow_job.queued"),
      ).rejects.toThrow("Failed to transform webhook");
    });
  });
});
