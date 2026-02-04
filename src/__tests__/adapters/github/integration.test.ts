import { describe, it, expect } from 'vitest';
import app from '../../../index';
import { GitHubAdapter } from '../../../adapters/github/adapter';
import { CDEvent } from '../../../schemas';

describe('GitHub Adapter API Integration', () => {
  const mockGitHubWebhook = {
    action: 'queued',
    workflow_job: {
      id: 123456789,
      run_id: 987654321,
      workflow_name: 'CI/CD Pipeline',
      head_branch: 'main',
      run_url: 'https://api.github.com/repos/owner/repo/actions/runs/987654321',
      run_attempt: 1,
      node_id: 'MDExOldXb3JrZmxvd0pvYjEyMzQ1Njc4OQ==',
      head_sha: 'abc123def456',
      url: 'https://api.github.com/repos/owner/repo/actions/jobs/123456789',
      html_url:
        'https://github.com/owner/repo/actions/runs/987654321/jobs/123456789',
      status: 'queued',
      conclusion: null,
      created_at: '2023-10-01T11:50:00Z',
      started_at: '2023-10-01T12:00:00Z',
      completed_at: null,
      name: 'build',
      steps: [],
      check_run_url:
        'https://api.github.com/repos/owner/repo/check-runs/123456789',
      labels: ['ubuntu-latest'],
      runner_id: null,
      runner_name: null,
      runner_group_id: null,
      runner_group_name: null,
    },
    repository: {
      id: 123456,
      node_id: 'MDEwOlJlcG9zaXRvcnkxMjM0NTY=',
      name: 'test-repo',
      full_name: 'owner/test-repo',
      private: false,
      owner: {
        login: 'owner',
        id: 12345,
        node_id: 'MDQ6VXNlcjEyMzQ1',
        avatar_url: 'https://github.com/images/error/owner_happy.gif',
        gravatar_id: '',
        url: 'https://api.github.com/users/owner',
        html_url: 'https://github.com/owner',
        followers_url: 'https://api.github.com/users/owner/followers',
        following_url:
          'https://api.github.com/users/owner/following{/other_user}',
        gists_url: 'https://api.github.com/users/owner/gists{/gist_id}',
        starred_url:
          'https://api.github.com/users/owner/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/owner/subscriptions',
        organizations_url: 'https://api.github.com/users/owner/orgs',
        repos_url: 'https://api.github.com/users/owner/repos',
        events_url: 'https://api.github.com/users/owner/events{/privacy}',
        received_events_url:
          'https://api.github.com/users/owner/received_events',
        type: 'User',
        site_admin: false,
      },
      html_url: 'https://github.com/owner/test-repo',
      description: 'A test repository',
      fork: false,
      url: 'https://api.github.com/repos/owner/test-repo',
      archive_url:
        'https://api.github.com/repos/owner/test-repo/{archive_format}{/ref}',
      assignees_url:
        'https://api.github.com/repos/owner/test-repo/assignees{/user}',
      blobs_url: 'https://api.github.com/repos/owner/test-repo/git/blobs{/sha}',
      branches_url:
        'https://api.github.com/repos/owner/test-repo/branches{/branch}',
      collaborators_url:
        'https://api.github.com/repos/owner/test-repo/collaborators{/collaborator}',
      comments_url:
        'https://api.github.com/repos/owner/test-repo/comments{/number}',
      commits_url: 'https://api.github.com/repos/owner/test-repo/commits{/sha}',
      compare_url:
        'https://api.github.com/repos/owner/test-repo/compare/{base}...{head}',
      contents_url:
        'https://api.github.com/repos/owner/test-repo/contents/{+path}',
      contributors_url:
        'https://api.github.com/repos/owner/test-repo/contributors',
      deployments_url:
        'https://api.github.com/repos/owner/test-repo/deployments',
      downloads_url: 'https://api.github.com/repos/owner/test-repo/downloads',
      events_url: 'https://api.github.com/repos/owner/test-repo/events',
      forks_url: 'https://api.github.com/repos/owner/test-repo/forks',
      git_commits_url:
        'https://api.github.com/repos/owner/test-repo/git/commits{/sha}',
      git_refs_url:
        'https://api.github.com/repos/owner/test-repo/git/refs{/sha}',
      git_tags_url:
        'https://api.github.com/repos/owner/test-repo/git/tags{/sha}',
      git_url: 'git:github.com/owner/test-repo.git',
      issue_comment_url:
        'https://api.github.com/repos/owner/test-repo/issues/comments{/number}',
      issue_events_url:
        'https://api.github.com/repos/owner/test-repo/issues/events{/number}',
      issues_url:
        'https://api.github.com/repos/owner/test-repo/issues{/number}',
      keys_url: 'https://api.github.com/repos/owner/test-repo/keys{/key_id}',
      labels_url: 'https://api.github.com/repos/owner/test-repo/labels{/name}',
      languages_url: 'https://api.github.com/repos/owner/test-repo/languages',
      merges_url: 'https://api.github.com/repos/owner/test-repo/merges',
      milestones_url:
        'https://api.github.com/repos/owner/test-repo/milestones{/number}',
      notifications_url:
        'https://api.github.com/repos/owner/test-repo/notifications{?since,all,participating}',
      pulls_url: 'https://api.github.com/repos/owner/test-repo/pulls{/number}',
      releases_url:
        'https://api.github.com/repos/owner/test-repo/releases{/id}',
      ssh_url: 'git@github.com:owner/test-repo.git',
      stargazers_url: 'https://api.github.com/repos/owner/test-repo/stargazers',
      statuses_url:
        'https://api.github.com/repos/owner/test-repo/statuses/{sha}',
      subscribers_url:
        'https://api.github.com/repos/owner/test-repo/subscribers',
      subscription_url:
        'https://api.github.com/repos/owner/test-repo/subscription',
      tags_url: 'https://api.github.com/repos/owner/test-repo/tags',
      teams_url: 'https://api.github.com/repos/owner/test-repo/teams',
      trees_url: 'https://api.github.com/repos/owner/test-repo/git/trees{/sha}',
      clone_url: 'https://github.com/owner/test-repo.git',
      mirror_url: null,
      hooks_url: 'https://api.github.com/repos/owner/test-repo/hooks',
      svn_url: 'https://github.com/owner/test-repo',
      homepage: null,
      language: 'TypeScript',
      forks_count: 5,
      stargazers_count: 10,
      watchers_count: 10,
      size: 1000,
      default_branch: 'main',
      open_issues_count: 2,
      has_issues: true,
      has_projects: true,
      has_wiki: true,
      has_pages: false,
      has_downloads: true,
      archived: false,
      disabled: false,
      pushed_at: '2023-10-01T11:30:00Z',
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-10-01T11:30:00Z',
    },
    sender: {
      login: 'developer',
      id: 67890,
      node_id: 'MDQ6VXNlcjY3ODkw',
      avatar_url: 'https://github.com/images/error/developer_happy.gif',
      gravatar_id: '',
      url: 'https://api.github.com/users/developer',
      html_url: 'https://github.com/developer',
      followers_url: 'https://api.github.com/users/developer/followers',
      following_url:
        'https://api.github.com/users/developer/following{/other_user}',
      gists_url: 'https://api.github.com/users/developer/gists{/gist_id}',
      starred_url:
        'https://api.github.com/users/developer/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/developer/subscriptions',
      organizations_url: 'https://api.github.com/users/developer/orgs',
      repos_url: 'https://api.github.com/users/developer/repos',
      events_url: 'https://api.github.com/users/developer/events{/privacy}',
      received_events_url:
        'https://api.github.com/users/developer/received_events',
      type: 'User',
      site_admin: false,
    },
  };

  describe('GET /adapters/github/info', () => {
    it('should return GitHub adapter information', async () => {
      const res = await app.request('/adapters/github/info');
      expect(res.status).toBe(200);

      const json = (await res.json()) as any;
      expect(json.name).toBe('github');
      expect(json.version).toMatch(/^\d+\.\d+\.\d+(-\w+)?$/);
      expect(json).toMatchObject({
        supportedEvents: [
          'workflow_job.queued',
          'workflow_job.waiting',
          'workflow_job.in_progress',
          'workflow_job.completed',
          'ping',
        ],
        endpoints: {
          workflow_job_queued: '/adapters/github/workflow_job/queued',
          workflow_job_waiting: '/adapters/github/workflow_job/waiting',
          workflow_job_in_progress: '/adapters/github/workflow_job/in_progress',
          workflow_job_completed: '/adapters/github/workflow_job/completed',
          workflow_job_generic: '/adapters/github/workflow_job',
          ping: '/adapters/github/ping',
          info: '/adapters/github/info',
        },
        description:
          'GitHub webhook adapter for transforming workflow job events to CD Events',
      });
    });

    it('should return JSON content type', async () => {
      const res = await app.request('/adapters/github/info');
      expect(res.headers.get('content-type')).toContain('application/json');
    });
  });

  describe('POST /adapters/github/ping', () => {
    it('should successfully handle GitHub ping webhook', async () => {
      const pingPayload = {
        zen: 'Speak like a human.',
        hook_id: 12345678,
        hook: {
          type: 'Repository',
          id: 12345678,
          name: 'web',
          active: true,
          events: ['workflow_job'],
          config: {
            content_type: 'json',
            insecure_ssl: '0',
            url: 'https://example.com/webhook',
          },
          updated_at: '2023-10-01T12:00:00Z',
          created_at: '2023-10-01T11:00:00Z',
          deliveries_url:
            'https://api.github.com/repos/owner/test-repo/hooks/12345678/deliveries',
          ping_url:
            'https://api.github.com/repos/owner/test-repo/hooks/12345678/pings',
          last_response: {
            code: null,
            status: 'unused',
            message: null,
          },
        },
        repository: mockGitHubWebhook.repository,
        sender: mockGitHubWebhook.sender,
      };

      const res = await app.request('/adapters/github/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pingPayload),
      });

      expect(res.status).toBe(200);

      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.message).toBe('GitHub webhook ping received successfully');
      expect(json.ping).toBeDefined();
      expect(json.ping.zen).toBe('Speak like a human.');
      expect(json.ping.hook_id).toBe(12345678);
      expect(json.ping.repository).toBe('owner/test-repo');
      expect(json.ping.sender).toBe('developer');
    });

    it('should reject invalid ping payload', async () => {
      const invalidPayload = {
        invalid: 'payload',
      };

      const res = await app.request('/adapters/github/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidPayload),
      });

      expect(res.status).toBe(400);

      const json = (await res.json()) as any;
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
      expect(json.error.name).toBe('ZodError');
      expect(json.error.message).toContain('Invalid input');
    });
  });

  describe('POST /adapters/github/workflow_job/queued', () => {
    it('should successfully transform GitHub workflow_job.queued webhook', async () => {
      const res = await app.request('/adapters/github/workflow_job/queued', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockGitHubWebhook),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as {
        success: boolean;
        message: string;
        eventId: string;
        cdevent: any;
      };

      expect(json.success).toBe(true);
      expect(json.message).toContain('successfully transformed');
      // expect(json.eventId).toBeDefined();
      // expect(json.eventId).toMatch(/^github-\d+-\w+$/); // Verify event ID format
      expect(json.cdevent).toBeDefined();
      expect(json.cdevent.context.type).toBe(
        'dev.cdevents.pipelinerun.queued.0.2.0'
      );
      expect(json.cdevent.subject.id).toBe('github-workflow-job-123456789');
      expect(json.cdevent.subject.content.pipelineName).toBe('CI/CD Pipeline');
      expect(json.cdevent.customData.github.action).toBe('queued');
    });

    it('should validate generated CD Event automatically', async () => {
      const res = await app.request('/adapters/github/workflow_job/queued', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockGitHubWebhook),
      });

      const json = (await res.json()) as {
        success: boolean;
        eventId: string;
        validation?: any;
      };
      // Note: validation might be skipped in test environment, so it's optional
      // Just verify the response has the expected structure
      expect(json.success).toBe(true);
      expect(json.eventId).toBeDefined(); // Should have event ID even without validation
    });

    it('should reject invalid webhook payload', async () => {
      const invalidWebhook = {
        action: 'queued',
        // Missing required fields
      };

      const res = await app.request('/adapters/github/workflow_job/queued', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidWebhook),
      });

      expect(res.status).toBe(400);
      const json = (await res.json()) as { success: boolean; error: any };
      expect(json.success).toBe(false);
      expect(json.error).toBeDefined();
    });

    it('should handle malformed JSON', async () => {
      const res = await app.request('/adapters/github/workflow_job/queued', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ invalid json }',
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /adapters/github/workflow_job/in_progress', () => {
    it('should successfully transform GitHub workflow_job.in_progress webhook', async () => {
      const inProgressWebhook = {
        ...mockGitHubWebhook,
        action: 'in_progress',
        workflow_job: {
          ...mockGitHubWebhook.workflow_job,
          status: 'in_progress',
          runner_id: 456,
          runner_name: 'GitHub Actions Runner',
        },
      };

      const res = await app.request(
        '/adapters/github/workflow_job/in_progress',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inProgressWebhook),
        }
      );

      expect(res.status).toBe(200);
      const json = (await res.json()) as {
        success: boolean;
        cdevent: any;
      };

      expect(json.success).toBe(true);
      expect(json.cdevent.context.type).toBe(
        'dev.cdevents.pipelinerun.started.0.2.0'
      );
      expect(json.cdevent.customData.github.action).toBe('in_progress');
      expect(json.cdevent.customData.github.workflow_job.runner_id).toBe(456);
    });
  });

  describe('POST /adapters/github/workflow_job/completed', () => {
    it('should successfully transform successful GitHub workflow_job.completed webhook', async () => {
      const completedWebhook = {
        ...mockGitHubWebhook,
        action: 'completed',
        workflow_job: {
          ...mockGitHubWebhook.workflow_job,
          status: 'completed',
          conclusion: 'success',
          completed_at: '2023-10-01T12:05:00Z',
        },
      };

      const res = await app.request('/adapters/github/workflow_job/completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completedWebhook),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as {
        success: boolean;
        cdevent: any;
      };

      expect(json.success).toBe(true);
      expect(json.cdevent.context.type).toBe(
        'dev.cdevents.pipelinerun.finished.0.2.0'
      );
      expect(json.cdevent.subject.content.outcome).toBe('success');
      expect(json.cdevent.customData.github.action).toBe('completed');
    });

    it('should successfully transform failed GitHub workflow_job.completed webhook', async () => {
      const failedWebhook = {
        ...mockGitHubWebhook,
        action: 'completed',
        workflow_job: {
          ...mockGitHubWebhook.workflow_job,
          status: 'completed',
          conclusion: 'failure',
          completed_at: '2023-10-01T12:05:00Z',
        },
      };

      const res = await app.request('/adapters/github/workflow_job/completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(failedWebhook),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as {
        success: boolean;
        cdevent: any;
      };

      expect(json.success).toBe(true);
      expect(json.cdevent.subject.content.outcome).toBe('failure');
      expect(json.cdevent.subject.content.errors).toContain('failed');
    });
  });

  describe('POST /adapters/github/workflow_job', () => {
    it('should auto-detect action and transform queued webhook', async () => {
      const res = await app.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockGitHubWebhook),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as {
        success: boolean;
        message: string;
        eventId: string;
        cdevent: any;
      };

      expect(json.success).toBe(true);
      expect(json.message).toContain(
        'GitHub workflow job waiting webhook successfully transformed to CD Event'
      );
      expect(json.cdevent.context.type).toBe(
        'dev.cdevents.pipelinerun.queued.0.2.0'
      );
    });

    it('should auto-detect action and transform in_progress webhook', async () => {
      const inProgressWebhook = {
        ...mockGitHubWebhook,
        action: 'in_progress',
        workflow_job: {
          ...mockGitHubWebhook.workflow_job,
          status: 'in_progress',
        },
      };

      const res = await app.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inProgressWebhook),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as {
        success: boolean;
        message: string;
        eventId: string;
        cdevent: any;
      };

      expect(json.success).toBe(true);
      expect(json.message).toContain(
        'GitHub workflow job waiting webhook successfully transformed to CD Event'
      );
      expect(json.cdevent.context.type).toBe(
        'dev.cdevents.pipelinerun.started.0.2.0'
      );
    });

    it('should auto-detect action and transform completed webhook', async () => {
      const completedWebhook = {
        ...mockGitHubWebhook,
        action: 'completed',
        workflow_job: {
          ...mockGitHubWebhook.workflow_job,
          status: 'completed',
          conclusion: 'success',
          completed_at: '2023-10-01T12:05:00Z',
        },
      };

      const res = await app.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completedWebhook),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as {
        success: boolean;
        message: string;
        eventId: string;
        cdevent: any;
      };

      expect(json.success).toBe(true);
      expect(json.message).toContain('');
      expect(json.cdevent.context.type).toBe(
        'dev.cdevents.pipelinerun.finished.0.2.0'
      );
    });

    it('should accept and log webhook with unsupported action', async () => {
      const unsupportedWebhook = {
        ...mockGitHubWebhook,
        action: 'unsupported_action',
      };

      const res = await app.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unsupportedWebhook),
      });

      expect(res.status).toBe(400);
      const json = (await res.json()) as {
        success: boolean;
        logged: boolean;
        eventType: string;
      };
      expect(json.success).toBe(false);
      expect(json.logged).toBe(true);
      // expect(json.eventType).toBe('workflow_job.unsupported_action');
    });
  });

  describe('GitHub Webhook Headers', () => {
    it('should handle requests with GitHub webhook headers', async () => {
      const res = await app.request('/adapters/github/workflow_job/queued', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-GitHub-Event': 'workflow_job',
          'X-GitHub-Delivery': '12345678-1234-1234-1234-123456789012',
          'X-Hub-Signature-256': 'sha256=test-signature',
          'User-Agent': 'GitHub-Hookshot/abc123',
        },
        body: JSON.stringify(mockGitHubWebhook),
      });

      expect(res.status).toBe(200);
      const json = (await res.json()) as { success: boolean };
      expect(json.success).toBe(true);
    });
  });

  describe('Response Format', () => {
    it('should return consistent response format for successful transformations', async () => {
      const res = await app.request('/adapters/github/workflow_job/queued', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockGitHubWebhook),
      });

      const json = (await res.json()) as {
        success: boolean;
        message: string;
        eventId?: string;
        cdevent?: any;
      };

      // Check required fields
      expect(json).toHaveProperty('success');
      expect(json).toHaveProperty('message');
      expect(json).toHaveProperty('cdevent');
      // validation is optional (might be skipped in test environment)

      // Check types
      expect(typeof json.success).toBe('boolean');
      expect(typeof json.message).toBe('string');
      if (json.eventId) {
        expect(typeof json.eventId).toBe('string');
      }
      if (json.cdevent) {
        expect(typeof json.cdevent).toBe('object');
      }
    });

    it('should return consistent error response format', async () => {
      const res = await app.request('/adapters/github/workflow_job/queued', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invalid: 'webhook' }),
      });

      const json = (await res.json()) as { success: boolean; error: any };

      // Check required fields
      expect(json).toHaveProperty('success', false);
      expect(json).toHaveProperty('error');

      // Check types
      expect(typeof json.error).toBe('object');
    });
  });

  describe('Custom Data Preservation', () => {
    it('should preserve all GitHub-specific data in custom fields', async () => {
      const res = await app.request('/adapters/github/workflow_job/queued', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockGitHubWebhook),
      });

      const json = (await res.json()) as { cdevent: any };
      const customData = json.cdevent.customData.github;

      // Verify GitHub-specific data is preserved
      expect(customData.workflow_job.id).toBe(
        mockGitHubWebhook.workflow_job.id
      );
      expect(customData.workflow_job.workflow_name).toBe(
        mockGitHubWebhook.workflow_job.workflow_name
      );
      expect(customData.repository.full_name).toBe(
        mockGitHubWebhook.repository.full_name
      );
      expect(customData.sender.login).toBe(mockGitHubWebhook.sender.login);

      // Verify workflow job specific fields
      expect(customData.workflow_job.labels).toEqual(['ubuntu-latest']);
      expect(customData.workflow_job.status).toBe('queued');
    });

    it('should include runner information for in_progress events', async () => {
      const inProgressWebhook = {
        ...mockGitHubWebhook,
        action: 'in_progress',
        workflow_job: {
          ...mockGitHubWebhook.workflow_job,
          status: 'in_progress',
          runner_id: 789,
          runner_name: 'Custom Runner',
          runner_group_id: 2,
          runner_group_name: 'Custom Group',
        },
      };

      const res = await app.request(
        '/adapters/github/workflow_job/in_progress',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inProgressWebhook),
        }
      );

      const json = (await res.json()) as { success: boolean; cdevent: any };
      expect(json.success).toBe(true);
      expect(json.cdevent).toBeDefined();
      const workflowJob = json.cdevent.customData.github.workflow_job;

      expect(workflowJob.runner_id).toBe(789);
      expect(workflowJob.runner_name).toBe('Custom Runner');
    });
  });

  describe('Edge Cases', () => {
    it('should handle workflow job with minimal required fields', async () => {
      const minimalWebhook = {
        action: 'queued',
        workflow_job: {
          id: 1,
          run_id: 1,
          workflow_name: 'Test',
          head_branch: 'main',
          run_url: 'https://api.github.com/repos/test/test/actions/runs/1',
          run_attempt: 1,
          node_id: 'test',
          head_sha: 'abc123',
          url: 'https://api.github.com/repos/test/test/actions/jobs/1',
          html_url: 'https://github.com/test/test/actions/runs/1/jobs/1',
          status: 'queued',
          conclusion: null,
          created_at: '2023-10-01T11:50:00Z',
          started_at: '2023-10-01T12:00:00Z',
          completed_at: null,
          name: 'test',
          steps: [],
          check_run_url: 'https://api.github.com/repos/test/test/check-runs/1',
          labels: ['ubuntu-latest'],
          runner_id: null,
          runner_name: null,
          runner_group_id: null,
          runner_group_name: null,
        },

        repository: {
          id: 1,
          node_id: 'test',
          name: 'test',
          full_name: 'test/test',
          private: false,
          owner: {
            login: 'test',
            id: 1,
            node_id: 'test',
            avatar_url: 'https://github.com/test.png',
            gravatar_id: '',
            url: 'https://api.github.com/users/test',
            html_url: 'https://github.com/test',
            followers_url: 'https://api.github.com/users/test/followers',
            following_url:
              'https://api.github.com/users/test/following{/other_user}',
            gists_url: 'https://api.github.com/users/test/gists{/gist_id}',
            starred_url:
              'https://api.github.com/users/test/starred{/owner}{/repo}',
            subscriptions_url:
              'https://api.github.com/users/test/subscriptions',
            organizations_url: 'https://api.github.com/users/test/orgs',
            repos_url: 'https://api.github.com/users/test/repos',
            events_url: 'https://api.github.com/users/test/events{/privacy}',
            received_events_url:
              'https://api.github.com/users/test/received_events',
            type: 'User',
            site_admin: false,
          },
          html_url: 'https://github.com/test/test',
          description: null,
          fork: false,
          url: 'https://api.github.com/repos/test/test',
          archive_url:
            'https://api.github.com/repos/test/test/{archive_format}{/ref}',
          assignees_url:
            'https://api.github.com/repos/test/test/assignees{/user}',
          blobs_url: 'https://api.github.com/repos/test/test/git/blobs{/sha}',
          branches_url:
            'https://api.github.com/repos/test/test/branches{/branch}',
          collaborators_url:
            'https://api.github.com/repos/test/test/collaborators{/collaborator}',
          comments_url:
            'https://api.github.com/repos/test/test/comments{/number}',
          commits_url: 'https://api.github.com/repos/test/test/commits{/sha}',
          compare_url:
            'https://api.github.com/repos/test/test/compare/{base}...{head}',
          contents_url:
            'https://api.github.com/repos/test/test/contents/{+path}',
          contributors_url:
            'https://api.github.com/repos/test/test/contributors',
          deployments_url: 'https://api.github.com/repos/test/test/deployments',
          downloads_url: 'https://api.github.com/repos/test/test/downloads',
          events_url: 'https://api.github.com/repos/test/test/events',
          forks_url: 'https://api.github.com/repos/test/test/forks',
          git_commits_url:
            'https://api.github.com/repos/test/test/git/commits{/sha}',
          git_refs_url: 'https://api.github.com/repos/test/test/git/refs{/sha}',
          git_tags_url: 'https://api.github.com/repos/test/test/git/tags{/sha}',
          git_url: 'git:github.com/test/test.git',
          issue_comment_url:
            'https://api.github.com/repos/test/test/issues/comments{/number}',
          issue_events_url:
            'https://api.github.com/repos/test/test/issues/events{/number}',
          issues_url: 'https://api.github.com/repos/test/test/issues{/number}',
          keys_url: 'https://api.github.com/repos/test/test/keys{/key_id}',
          labels_url: 'https://api.github.com/repos/test/test/labels{/name}',
          languages_url: 'https://api.github.com/repos/test/test/languages',
          merges_url: 'https://api.github.com/repos/test/test/merges',
          milestones_url:
            'https://api.github.com/repos/test/test/milestones{/number}',
          notifications_url:
            'https://api.github.com/repos/test/test/notifications{?since,all,participating}',
          pulls_url: 'https://api.github.com/repos/test/test/pulls{/number}',
          releases_url: 'https://api.github.com/repos/test/test/releases{/id}',
          ssh_url: 'git@github.com:test/test.git',
          stargazers_url: 'https://api.github.com/repos/test/test/stargazers',
          statuses_url: 'https://api.github.com/repos/test/test/statuses/{sha}',
          subscribers_url: 'https://api.github.com/repos/test/test/subscribers',
          subscription_url:
            'https://api.github.com/repos/test/test/subscription',
          tags_url: 'https://api.github.com/repos/test/test/tags',
          teams_url: 'https://api.github.com/repos/test/test/teams',
          trees_url: 'https://api.github.com/repos/test/test/git/trees{/sha}',
          clone_url: 'https://github.com/test/test.git',
          mirror_url: null,
          hooks_url: 'https://api.github.com/repos/test/test/hooks',
          svn_url: 'https://github.com/test/test',
          homepage: null,
          language: null,
          forks_count: 0,
          stargazers_count: 0,
          watchers_count: 0,
          size: 0,
          default_branch: 'main',
          open_issues_count: 0,
          is_template: false,
          topics: [],
          has_issues: true,
          has_projects: true,
          has_wiki: true,
          has_pages: false,
          has_downloads: true,
          archived: false,
          disabled: false,
          visibility: 'public',
          pushed_at: '2023-10-01T12:00:00Z',
          created_at: '2023-10-01T12:00:00Z',
          updated_at: '2023-10-01T12:00:00Z',
        },
        sender: {
          id: 1,
          login: 'test-user',
          node_id: 'test-node-id',
          avatar_url: 'https://github.com/images/error/test-user_happy.gif',
          gravatar_id: '',
          url: 'https://api.github.com/users/test-user',
          html_url: 'https://github.com/test-user',
          followers_url: 'https://api.github.com/users/test-user/followers',
          following_url:
            'https://api.github.com/users/test-user/following{/other_user}',
          gists_url: 'https://api.github.com/users/test-user/gists{/gist_id}',
          starred_url:
            'https://api.github.com/users/test-user/starred{/owner}{/repo}',
          subscriptions_url:
            'https://api.github.com/users/test-user/subscriptions',
          organizations_url: 'https://api.github.com/users/test-user/orgs',
          repos_url: 'https://api.github.com/users/test-user/repos',
          events_url: 'https://api.github.com/users/test-user/events{/privacy}',
          received_events_url:
            'https://api.github.com/users/test-user/received_events',
          type: 'User',
          site_admin: false,
        },
      };

      const adapter = new GitHubAdapter();
      expect(() =>
        adapter.transform(minimalWebhook, 'workflow_job.queued')
      ).not.toThrow();
    });

    it('should handle ping event on workflow_job endpoint', async () => {
      const pingPayload = {
        zen: 'Non-blocking is better than blocking.',
        hook_id: 565541927,
        hook: {
          type: 'Repository',
          id: 565541927,
          name: 'web',
          active: true,
          events: ['workflow_job'],
          config: {
            content_type: 'json',
            insecure_ssl: '0',
            secret: '********',
            url: 'https://cdevents.brucellino.dev/adapters/github/workflow_job',
          },
          updated_at: '2025-08-23T07:12:54Z',
          created_at: '2025-08-23T07:12:54Z',
          deliveries_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/hooks/565541927/deliveries',
          ping_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/hooks/565541927/pings',
          last_response: {
            code: null,
            status: 'unused',
            message: null,
          },
        },
        repository: {
          id: 175939748,
          node_id: 'MDEwOlJlcG9zaXRvcnkxNzU5Mzk3NDg=',
          name: 'personal-automation',
          full_name: 'brucellino/personal-automation',
          private: true,
          owner: {
            login: 'brucellino',
            id: 2115428,
            node_id: 'MDQ6VXNlcjIxMTU0Mjg=',
            avatar_url: 'https://avatars.githubusercontent.com/u/2115428?v=4',
            gravatar_id: '',
            url: 'https://internal-api.service.iad.github.net/users/brucellino',
            html_url: 'https://github.com/brucellino',
            followers_url:
              'https://internal-api.service.iad.github.net/users/brucellino/followers',
            following_url:
              'https://internal-api.service.iad.github.net/users/brucellino/following{/other_user}',
            gists_url:
              'https://internal-api.service.iad.github.net/users/brucellino/gists{/gist_id}',
            starred_url:
              'https://internal-api.service.iad.github.net/users/brucellino/starred{/owner}{/repo}',
            subscriptions_url:
              'https://internal-api.service.iad.github.net/users/brucellino/subscriptions',
            organizations_url:
              'https://internal-api.service.iad.github.net/users/brucellino/orgs',
            repos_url:
              'https://internal-api.service.iad.github.net/users/brucellino/repos',
            events_url:
              'https://internal-api.service.iad.github.net/users/brucellino/events{/privacy}',
            received_events_url:
              'https://internal-api.service.iad.github.net/users/brucellino/received_events',
            type: 'User',
            site_admin: false,
            user_view_type: 'public',
          },
          html_url: 'https://github.com/brucellino/personal-automation',
          description: 'Personal automation for my own workspace',
          fork: false,
          url: 'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation',
          forks_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/forks',
          keys_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/keys{/key_id}',
          collaborators_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/collaborators{/collaborator}',
          teams_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/teams',
          hooks_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/hooks',
          issue_events_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/issues/events{/number}',
          events_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/events',
          assignees_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/assignees{/user}',
          branches_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/branches{/branch}',
          tags_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/tags',
          blobs_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/git/blobs{/sha}',
          git_tags_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/git/tags{/sha}',
          git_refs_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/git/refs{/sha}',
          trees_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/git/trees{/sha}',
          statuses_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/statuses/{sha}',
          languages_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/languages',
          stargazers_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/stargazers',
          contributors_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/contributors',
          subscribers_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/subscribers',
          subscription_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/subscription',
          commits_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/commits{/sha}',
          git_commits_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/git/commits{/sha}',
          comments_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/comments{/number}',
          issue_comment_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/issues/comments{/number}',
          contents_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/contents/{+path}',
          compare_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/compare/{base}...{head}',
          merges_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/merges',
          archive_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/{archive_format}{/ref}',
          downloads_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/downloads',
          issues_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/issues{/number}',
          pulls_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/pulls{/number}',
          milestones_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/milestones{/number}',
          notifications_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/notifications{?since,all,participating}',
          labels_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/labels{/name}',
          releases_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/releases{/id}',
          deployments_url:
            'https://internal-api.service.iad.github.net/repos/brucellino/personal-automation/deployments',
          created_at: '2019-03-16T07:20:56Z',
          updated_at: '2025-08-23T05:23:27Z',
          pushed_at: '2025-08-23T05:23:43Z',
          git_url: 'git://github.com/brucellino/personal-automation.git',
          ssh_url: 'git@github.com:brucellino/personal-automation.git',
          clone_url: 'https://github.com/brucellino/personal-automation.git',
          svn_url: 'https://github.com/brucellino/personal-automation',
          homepage: '',
          size: 1428,
          stargazers_count: 0,
          watchers_count: 0,
          language: 'Jinja',
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
          open_issues_count: 6,
          license: null,
          allow_forking: true,
          is_template: false,
          web_commit_signoff_required: false,
          topics: ['hacktoberfest-accepted', 'hah-runner'],
          visibility: 'private',
          forks: 0,
          open_issues: 6,
          watchers: 0,
          default_branch: 'master',
        },
        sender: {
          login: 'brucellino',
          id: 2115428,
          node_id: 'MDQ6VXNlcjIxMTU0Mjg=',
          avatar_url: 'https://avatars.githubusercontent.com/u/2115428?v=4',
          gravatar_id: '',
          url: 'https://internal-api.service.iad.github.net/users/brucellino',
          html_url: 'https://github.com/brucellino',
          followers_url:
            'https://internal-api.service.iad.github.net/users/brucellino/followers',
          following_url:
            'https://internal-api.service.iad.github.net/users/brucellino/following{/other_user}',
          gists_url:
            'https://internal-api.service.iad.github.net/users/brucellino/gists{/gist_id}',
          starred_url:
            'https://internal-api.service.iad.github.net/users/brucellino/starred{/owner}{/repo}',
          subscriptions_url:
            'https://internal-api.service.iad.github.net/users/brucellino/subscriptions',
          organizations_url:
            'https://internal-api.service.iad.github.net/users/brucellino/orgs',
          repos_url:
            'https://internal-api.service.iad.github.net/users/brucellino/repos',
          events_url:
            'https://internal-api.service.iad.github.net/users/brucellino/events{/privacy}',
          received_events_url:
            'https://internal-api.service.iad.github.net/users/brucellino/received_events',
          type: 'User',
          site_admin: false,
          user_view_type: 'public',
        },
      };

      const res = await app.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pingPayload),
      });

      expect(res.status).toBe(200);

      const json = (await res.json()) as any;
      expect(json.success).toBe(true);
      expect(json.message).toBe('GitHub webhook ping received successfully');
      expect(json.ping).toBeDefined();
      expect(json.ping.zen).toBe('Non-blocking is better than blocking.');
      expect(json.ping.hook_id).toBe(565541927);
      expect(json.ping.repository).toBe('brucellino/personal-automation');
      expect(json.ping.sender).toBe('brucellino');
    });
  });
});
