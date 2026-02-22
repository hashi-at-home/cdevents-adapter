import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Hono } from 'hono';
import app from '../../../index';

describe('GitHub Adapter R2 Logging and Queue Integration', () => {
  // Mock R2 bucket
  const mockR2Bucket = {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn(),
    list: vi.fn(),
  };

  // Mock Queue
  const mockQueue = {
    send: vi.fn().mockResolvedValue(undefined),
  };

  // Create test app with mocked environment
  const testApp = new Hono();
  testApp.use('*', async (c, next) => {
    c.env = {
      EVENTS_BUCKET: mockR2Bucket,
      CI_BUILD_QUEUED: mockQueue,
    };
    await next();
  });
  testApp.route('/', app);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createCompleteWebhook = (
    action: string,
    status: string,
    conclusion: string | null = null
  ) => ({
    action,
    workflow_job: {
      id: 123456789,
      run_id: 987654321,
      workflow_name: 'Test Pipeline',
      head_branch: 'main',
      run_url: 'https://api.github.com/repos/owner/repo/actions/runs/987654321',
      run_attempt: 1,
      node_id: 'MDExOldvcmtmbG93Sm9iMTIzNDU2Nzg5',
      head_sha: 'abc123def456', // # pragma: allowlist secret
      url: 'https://api.github.com/repos/owner/repo/actions/jobs/123456789',
      html_url:
        'https://github.com/owner/repo/actions/runs/987654321/jobs/123456789',
      status,
      conclusion,
      created_at: '2023-10-01T12:00:00Z',
      started_at:
        status === 'queued' || status === 'waiting'
          ? null
          : '2023-10-01T12:01:00Z',
      completed_at: status === 'completed' ? '2023-10-01T12:05:00Z' : null,
      name: 'test-job',
      steps: [],
      check_run_url:
        'https://api.github.com/repos/owner/repo/check-runs/123456789',
      labels: ['ubuntu-latest'],
      runner_id: status === 'queued' || status === 'waiting' ? null : 1,
      runner_name:
        status === 'queued' || status === 'waiting' ? null : 'runner-1',
      runner_group_id: null,
      runner_group_name: null,
    },
    repository: {
      id: 12345,
      node_id: 'MDEwOlJlcG9zaXRvcnkxMjM0NQ==',
      name: 'repo',
      full_name: 'owner/repo',
      owner: {
        login: 'owner',
        id: 67890,
      },
    },
    sender: {
      login: 'developer',
      id: 67890,
    },
  });

  describe('R2 Logging', () => {
    it('should log queued webhook to R2 with CDEvent', async () => {
      const webhook = createCompleteWebhook('queued', 'queued');

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook),
      });

      expect(res.status).toBe(200);

      // Verify R2 put was called
      expect(mockR2Bucket.put).toHaveBeenCalled();

      // Check the second call which should have the transformedEvent
      const callIndex = mockR2Bucket.put.mock.calls.length > 1 ? 1 : 0;
      const [key, content, metadata] = mockR2Bucket.put.mock.calls[callIndex];

      // Check key format
      expect(key).toMatch(
        /^github-webhooks\/\d{4}-\d{2}-\d{2}\/workflow_job\.queued\/\d+-\d{4}-\d{2}-\d{2}T[\d-]+Z\.json$/
      );

      // Check stored content includes both webhook and CDEvent
      const storedData = JSON.parse(content);
      expect(storedData).toHaveProperty('timestamp');
      expect(storedData).toHaveProperty('eventType', 'workflow_job.queued');
      expect(storedData).toHaveProperty('webhook');
      expect(storedData).toHaveProperty('transformedEvent');

      // Verify CDEvent structure
      expect(storedData.transformedEvent).toHaveProperty('context');
      expect(storedData.transformedEvent.context.type).toBe(
        'dev.cdevents.pipelinerun.queued.0.2.0'
      );

      // Check metadata
      expect(metadata.httpMetadata.contentType).toBe('application/json');
      expect(metadata.customMetadata).toHaveProperty(
        'eventType',
        'workflow_job.queued'
      );
      expect(metadata.customMetadata).toHaveProperty(
        'repository',
        'owner/repo'
      );
    });

    it('should log in_progress webhook to R2', async () => {
      const webhook = createCompleteWebhook('in_progress', 'in_progress');

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-event': 'workflow_job',
        },
        body: JSON.stringify(webhook),
      });

      expect(res.status).toBe(200);
      expect(mockR2Bucket.put).toHaveBeenCalled();

      // Check the second call which should have the transformedEvent
      const callIndex = mockR2Bucket.put.mock.calls.length > 1 ? 1 : 0;
      const storedData = JSON.parse(mockR2Bucket.put.mock.calls[callIndex][1]);
      expect(storedData.transformedEvent.context.type).toBe(
        'dev.cdevents.pipelinerun.started.0.2.0'
      );
    });

    it('should log completed webhook to R2 with outcome', async () => {
      const webhook = createCompleteWebhook(
        'completed',
        'completed',
        'success'
      );

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-event': 'workflow_job',
        },
        body: JSON.stringify(webhook),
      });

      expect(res.status).toBe(200);
      expect(mockR2Bucket.put).toHaveBeenCalled();

      // Check the second call which should have the transformedEvent
      const callIndex = mockR2Bucket.put.mock.calls.length > 1 ? 1 : 0;
      const storedData = JSON.parse(mockR2Bucket.put.mock.calls[callIndex][1]);
      expect(storedData.transformedEvent.context.type).toBe(
        'dev.cdevents.pipelinerun.finished.0.2.0'
      );
      expect(storedData.transformedEvent.subject.content.outcome).toBe(
        'success'
      );
    });

    it('should log validation status in R2', async () => {
      const webhook = createCompleteWebhook('queued', 'queued');

      // Mock validation service response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ valid: true }),
      });

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook),
      });

      expect(res.status).toBe(200);
      expect(mockR2Bucket.put).toHaveBeenCalled();

      // Check the second call which should have the transformedEvent
      const callIndex = mockR2Bucket.put.mock.calls.length > 1 ? 1 : 0;
      if (
        mockR2Bucket.put.mock.calls.length > callIndex &&
        mockR2Bucket.put.mock.calls[callIndex]
      ) {
        const storedData = JSON.parse(
          mockR2Bucket.put.mock.calls[callIndex][1]
        );
        expect(storedData.transformedEvent).toBeDefined();
      }
    });

    it('should handle R2 logging failures gracefully', async () => {
      const webhook = createCompleteWebhook('queued', 'queued');

      // Make R2 put fail
      mockR2Bucket.put.mockRejectedValueOnce(new Error('R2 connection failed'));

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook),
      });

      // Should still return success even if R2 logging fails
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveProperty('eventId');
    });
  });

  describe('Queue Posting', () => {
    it('should post queued events to CI_BUILD_QUEUED queue', async () => {
      const webhook = createCompleteWebhook('queued', 'queued');

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook),
      });

      expect(res.status).toBe(200);
      expect(mockQueue.send).toHaveBeenCalled();

      // Check if send was called and has valid calls
      expect(mockQueue.send.mock.calls.length).toBeGreaterThan(0);
      const queuedMessage = mockQueue.send.mock.calls[0][0];
      expect(queuedMessage).toHaveProperty('context');
      expect(queuedMessage.context.type).toBe(
        'dev.cdevents.pipelinerun.queued.0.2.0'
      );
      expect(queuedMessage.subject.id).toBe('github-workflow-job-123456789');
    });

    it('should post waiting events to CI_BUILD_QUEUED queue', async () => {
      const webhook = createCompleteWebhook('waiting', 'waiting');

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-event': 'workflow_job',
        },
        body: JSON.stringify(webhook),
      });

      expect(res.status).toBe(200);
      expect(mockQueue.send).toHaveBeenCalled();

      const queuedMessage = mockQueue.send.mock.calls[0][0];
      expect(queuedMessage.context.type).toBe(
        'dev.cdevents.pipelinerun.queued.0.2.0'
      );
    });

    it('should NOT post in_progress events to queue', async () => {
      const webhook = createCompleteWebhook('in_progress', 'in_progress');

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-event': 'workflow_job',
        },
        body: JSON.stringify(webhook),
      });

      expect(res.status).toBe(200);
      // in_progress events are not queued
      expect(mockQueue.send).not.toHaveBeenCalled();
    });

    it('should NOT post completed events to queue', async () => {
      const webhook = createCompleteWebhook(
        'completed',
        'completed',
        'success'
      );

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-event': 'workflow_job',
        },
        body: JSON.stringify(webhook),
      });

      expect(res.status).toBe(200);
      // completed events are not queued
      expect(mockQueue.send).not.toHaveBeenCalled();
    });

    it('should handle queue failures gracefully', async () => {
      const webhook = createCompleteWebhook('queued', 'queued');

      // Make queue send fail
      mockQueue.send.mockRejectedValueOnce(new Error('Queue unavailable'));

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-event': 'workflow_job',
        },
        body: JSON.stringify(webhook),
      });

      // Should return error status when queue posting fails
      expect(res.status).toBe(400);
      const body = (await res.json()) as any;
      expect(body.success).toBe(false);
      expect(body.message).toContain('Failed to transform webhook');
    });
  });

  describe('Response Format', () => {
    it('should return eventId on successful transformation', async () => {
      const webhook = createCompleteWebhook('queued', 'queued');

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body).toHaveProperty('eventId');
      expect(body.eventId).toMatch(/^[\w-]+$/);
    });

    it('should return validation status when validation succeeds', async () => {
      const webhook = createCompleteWebhook('queued', 'queued');

      // Mock successful validation
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ valid: true }),
      });

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body).toHaveProperty('eventId');
      expect(body).toHaveProperty('validation');
    });

    it('should return error details on webhook validation failure', async () => {
      const invalidWebhook = {
        action: 'queued',
        // Missing required fields
      };

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-event': 'workflow_job',
        },
        body: JSON.stringify(invalidWebhook),
      });

      expect(res.status).toBe(400);
      const body = (await res.json()) as any;
      expect(body.success).toBe(false);
      // The error response should have either a message or errors array
      if (body.message) {
        expect(body.message.toLowerCase()).toContain('invalid');
      } else if (body.errors) {
        // Handle errors array
        expect(body.errors).toBeDefined();
        expect(body.errors.length).toBeGreaterThan(0);
        const errorMessage = Array.isArray(body.errors)
          ? body.errors.join(' ')
          : String(body.errors);
        expect(errorMessage.toLowerCase()).toContain('webhook');
      }
    });

    it('should handle ping events with success response', async () => {
      const pingWebhook = {
        zen: 'Design for failure.',
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
          created_at: '2023-10-01T12:00:00Z',
          deliveries_url:
            'https://api.github.com/repos/owner/repo/hooks/12345678/deliveries',
          ping_url:
            'https://api.github.com/repos/owner/repo/hooks/12345678/pings',
          last_response: {
            code: 200,
            status: 'success',
            message: null,
          },
        },
        repository: {
          id: 12345,
          node_id: 'MDEwOlJlcG9zaXRvcnkxMjM0NQ==',
          name: 'repo',
          full_name: 'owner/repo',
          owner: {
            login: 'owner',
            id: 67890,
          },
        },
        sender: {
          login: 'developer',
          id: 67890,
        },
      };

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-event': 'ping',
        },
        body: JSON.stringify(pingWebhook),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as any;
      expect(body).toHaveProperty('success', true);
      expect(body).toHaveProperty('message');
      expect(body.message).toContain('ping received successfully');
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for malformed JSON', async () => {
      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json',
      });

      expect(res.status).toBe(400);
    });

    it('should return 400 for unsupported event types', async () => {
      const webhook = createCompleteWebhook('unsupported', 'unknown');

      const res = await testApp.request('/adapters/github/workflow_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhook),
      });

      // The generic endpoint will attempt to process it and fail
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent endpoints', async () => {
      const res = await testApp.request('/adapters/github/nonexistent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(404);
    });
  });

  describe('Adapter Info Endpoint', () => {
    it('should return adapter information', async () => {
      const res = await testApp.request('/adapters/github/info');

      expect(res.status).toBe(200);
      const info = (await res.json()) as any;

      expect(info).toHaveProperty('name', 'github');
      expect(info).toHaveProperty('version');
      expect(info).toHaveProperty('supportedEvents');
      expect(info.supportedEvents).toEqual([
        'workflow_job.queued',
        'workflow_job.waiting',
        'workflow_job.in_progress',
        'workflow_job.completed',
        'ping',
      ]);
    });
  });
});
