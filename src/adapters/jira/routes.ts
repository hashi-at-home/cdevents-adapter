import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';
import { Context } from 'hono';
import { getVersion } from '../../version';
import { JiraAdapter } from './adapter';
import {
  JiraWebhookEventSchema,
  JiraIssueCreatedWebhookSchema,
  JiraIssueUpdatedWebhookSchema,
  JiraIssueDeletedWebhookSchema,
  JiraCommentCreatedWebhookSchema,
  JiraCommentUpdatedWebhookSchema,
  JiraCommentDeletedWebhookSchema,
  JiraWorklogCreatedWebhookSchema,
  JiraWorklogUpdatedWebhookSchema,
  JiraWorklogDeletedWebhookSchema,
  JiraGenericWebhookSchema,
  extractJiraWebhookEventType,
  safeValidateJiraWebhookEvent,
} from './schemas';
import {
  PipelineRunQueuedEventSchema,
  PipelineRunStartedEventSchema,
  PipelineRunFinishedEventSchema,
  TaskRunStartedEventSchema,
  TaskRunFinishedEventSchema,
} from '../../schemas';

type Env = {
  readonly CI_BUILD_QUEUED: any;
  readonly EVENTS_BUCKET?: any;
};

const AdapterSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  cdevent: z.any().optional(),
});

const jiraAdapter = new JiraAdapter();

/**
 * Log webhook data to R2 bucket for debugging and audit trails
 * Added: 2025-01-27 - Webhook logging functionality for Jira events
 */
async function logWebhookToR2(
  bucket: any | undefined,
  webhookData: any,
  transformedEvent: any | null,
  context: {
    eventType: string;
    issueKey?: string;
    projectKey?: string;
    user?: string;
  }
): Promise<void> {
  if (!bucket) {
    console.log('R2 bucket not configured, skipping webhook logging');
    return;
  }

  try {
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0]; // YYYY-MM-DD format

    // Create a unique key for this webhook
    const webhookId = `${context.eventType}-${context.issueKey || 'unknown'}-${Date.now()}`;

    const key = `jira-webhooks/${date}/${webhookId}.json`;

    const logEntry = {
      // Metadata about the webhook
      source: 'jira',
      webhook: webhookData,
      transformedEvent,
      metadata: {
        issueKey: context.issueKey,
        projectKey: context.projectKey,
        user: context.user,
        eventType: context.eventType,
        timestamp,
        adapterId: jiraAdapter.name,
        adapterVersion: jiraAdapter.version,
      },
    };

    // Store in R2 with appropriate metadata
    const httpMetadata = {
      contentType: 'application/json',
    };

    const customMetadata = {
      'event-type': context.eventType,
      'issue-key': context.issueKey || 'unknown',
      'project-key': context.projectKey || 'unknown',
    };

    await bucket.put(key, JSON.stringify(logEntry, null, 2), {
      httpMetadata,
      customMetadata,
    });

    console.log(`Jira webhook logged to R2: ${key}`);
  } catch (error) {
    console.error('Failed to log Jira webhook to R2:', error);
  }
}

/**
 * Validate a transformed CD Event by calling the validation endpoint
 * Added: 2025-01-27 - CD Event validation for Jira transformations
 */
async function validateCDEvent(cdevent: any): Promise<{
  success: boolean;
  errors?: string[];
}> {
  let validationResult = { success: true, errors: [] as string[] };

  try {
    const validationResponse = await fetch(
      'http://localhost:8787/validate/event',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cdevent),
      }
    );

    if (!validationResponse.ok) {
      validationResult = {
        success: false,
        errors: [`Validation failed with status ${validationResponse.status}`],
      };
    }
  } catch (error) {
    validationResult = {
      success: false,
      errors: [
        `Validation request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
    };
  }

  return validationResult;
}

export const jiraRoutes = new OpenAPIHono<{ Bindings: Env }>();

// Issue Created Route
const issueCreatedRoute = createRoute({
  method: 'post',
  path: '/issue/created',
  request: {
    body: {
      content: {
        'application/json': {
          schema: JiraIssueCreatedWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description:
        'Successfully transformed Jira issue created event to CD Event',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z.array(z.string()).optional(),
          }),
        },
      },
      description: 'Invalid webhook payload or transformation failed',
    },
  },
  tags: ['Jira Adapter'],
  summary: 'Transform Jira issue created webhook to CD Event',
  description: `
    Transforms a Jira issue created webhook into a CD Event TaskRunStarted event.
    The issue creation represents the start of work on a task.
  `,
});

// Issue Updated Route
const issueUpdatedRoute = createRoute({
  method: 'post',
  path: '/issue/updated',
  request: {
    body: {
      content: {
        'application/json': {
          schema: JiraIssueUpdatedWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description:
        'Successfully transformed Jira issue updated event to CD Event',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z.array(z.string()).optional(),
          }),
        },
      },
      description: 'Invalid webhook payload or transformation failed',
    },
  },
  tags: ['Jira Adapter'],
  summary: 'Transform Jira issue updated webhook to CD Event',
  description: `
    Transforms a Jira issue updated webhook into appropriate CD Events based on the changes.
    Status transitions map to different pipeline/task events:
    - To Do/Open → PipelineRunQueued
    - In Progress → PipelineRunStarted
    - Done/Closed → PipelineRunFinished
    - Other updates → TaskRunFinished
  `,
});

// Issue Deleted Route
const issueDeletedRoute = createRoute({
  method: 'post',
  path: '/issue/deleted',
  request: {
    body: {
      content: {
        'application/json': {
          schema: JiraIssueDeletedWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description:
        'Successfully transformed Jira issue deleted event to CD Event',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z.array(z.string()).optional(),
          }),
        },
      },
      description: 'Invalid webhook payload or transformation failed',
    },
  },
  tags: ['Jira Adapter'],
  summary: 'Transform Jira issue deleted webhook to CD Event',
  description: `
    Transforms a Jira issue deleted webhook into a PipelineRunFinished event with error outcome.
  `,
});

// Comment Created Route
const commentCreatedRoute = createRoute({
  method: 'post',
  path: '/comment/created',
  request: {
    body: {
      content: {
        'application/json': {
          schema: JiraCommentCreatedWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description:
        'Successfully transformed Jira comment created event to CD Event',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z.array(z.string()).optional(),
          }),
        },
      },
      description: 'Invalid webhook payload or transformation failed',
    },
  },
  tags: ['Jira Adapter'],
  summary: 'Transform Jira comment created webhook to CD Event',
  description: `
    Transforms a Jira comment created webhook into a TaskRunStarted event.
  `,
});

// Comment Updated Route
const commentUpdatedRoute = createRoute({
  method: 'post',
  path: '/comment/updated',
  request: {
    body: {
      content: {
        'application/json': {
          schema: JiraCommentUpdatedWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description:
        'Successfully transformed Jira comment updated event to CD Event',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z.array(z.string()).optional(),
          }),
        },
      },
      description: 'Invalid webhook payload or transformation failed',
    },
  },
  tags: ['Jira Adapter'],
  summary: 'Transform Jira comment updated webhook to CD Event',
  description: `
    Transforms a Jira comment updated webhook into a TaskRunFinished event.
  `,
});

// Comment Deleted Route
const commentDeletedRoute = createRoute({
  method: 'post',
  path: '/comment/deleted',
  request: {
    body: {
      content: {
        'application/json': {
          schema: JiraCommentDeletedWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description:
        'Successfully transformed Jira comment deleted event to CD Event',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z.array(z.string()).optional(),
          }),
        },
      },
      description: 'Invalid webhook payload or transformation failed',
    },
  },
  tags: ['Jira Adapter'],
  summary: 'Transform Jira comment deleted webhook to CD Event',
  description: `
    Transforms a Jira comment deleted webhook into a TaskRunFinished event with error outcome.
  `,
});

// Worklog Created Route
const worklogCreatedRoute = createRoute({
  method: 'post',
  path: '/worklog/created',
  request: {
    body: {
      content: {
        'application/json': {
          schema: JiraWorklogCreatedWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description:
        'Successfully transformed Jira worklog created event to CD Event',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z.array(z.string()).optional(),
          }),
        },
      },
      description: 'Invalid webhook payload or transformation failed',
    },
  },
  tags: ['Jira Adapter'],
  summary: 'Transform Jira worklog created webhook to CD Event',
  description: `
    Transforms a Jira worklog created webhook into a TaskRunStarted event.
  `,
});

// Worklog Updated Route
const worklogUpdatedRoute = createRoute({
  method: 'post',
  path: '/worklog/updated',
  request: {
    body: {
      content: {
        'application/json': {
          schema: JiraWorklogUpdatedWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description:
        'Successfully transformed Jira worklog updated event to CD Event',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z.array(z.string()).optional(),
          }),
        },
      },
      description: 'Invalid webhook payload or transformation failed',
    },
  },
  tags: ['Jira Adapter'],
  summary: 'Transform Jira worklog updated webhook to CD Event',
  description: `
    Transforms a Jira worklog updated webhook into a TaskRunFinished event.
  `,
});

// Worklog Deleted Route
const worklogDeletedRoute = createRoute({
  method: 'post',
  path: '/worklog/deleted',
  request: {
    body: {
      content: {
        'application/json': {
          schema: JiraWorklogDeletedWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description:
        'Successfully transformed Jira worklog deleted event to CD Event',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z.array(z.string()).optional(),
          }),
        },
      },
      description: 'Invalid webhook payload or transformation failed',
    },
  },
  tags: ['Jira Adapter'],
  summary: 'Transform Jira worklog deleted webhook to CD Event',
  description: `
    Transforms a Jira worklog deleted webhook into a TaskRunFinished event with error outcome.
  `,
});

// Generic Webhook Route
const genericWebhookRoute = createRoute({
  method: 'post',
  path: '/webhook',
  request: {
    body: {
      content: {
        'application/json': {
          schema: JiraGenericWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            eventType: z.string().optional(),
            logged: z.boolean(),
            cdevent: z.any().optional(),
          }),
        },
      },
      description: 'Successfully processed Jira webhook',
    },
    400: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            errors: z.array(z.string()).optional(),
          }),
        },
      },
      description: 'Invalid webhook payload or processing failed',
    },
  },
  tags: ['Jira Adapter'],
  summary: 'Generic Jira webhook endpoint',
  description: `
    Generic endpoint for processing any Jira webhook. Automatically detects event type
    from headers or payload and transforms to appropriate CD Event.
    Supports all Jira webhook event types.
  `,
});

// Adapter Info Route
const adapterInfoRoute = createRoute({
  method: 'get',
  path: '/info',
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            name: z.string(),
            version: z.string(),
            supportedEvents: z.array(z.string()),
            endpoints: z.object({
              issue_created: z.string(),
              issue_updated: z.string(),
              issue_deleted: z.string(),
              comment_created: z.string(),
              comment_updated: z.string(),
              comment_deleted: z.string(),
              worklog_created: z.string(),
              worklog_updated: z.string(),
              worklog_deleted: z.string(),
              generic_webhook: z.string(),
              info: z.string(),
            }),
            description: z.string(),
          }),
        },
      },
      description: 'Jira adapter information and capabilities',
    },
  },
  tags: ['Jira Adapter'],
  summary: 'Get Jira adapter information',
  description:
    'Returns information about the Jira adapter capabilities and available endpoints',
});

// Route Implementations

// Issue Created Implementation
jiraRoutes.openapi(issueCreatedRoute, async c => {
  try {
    const webhookData = c.req.valid('json');
    const eventType = 'jira:issue_created';

    // Transform webhook to CD Event
    const cdevent = await jiraAdapter.transform(webhookData, eventType);

    // Validate the generated CD Event
    const validationResult = await validateCDEvent(cdevent);

    // Log to R2 if available
    await logWebhookToR2(c.env.EVENTS_BUCKET, webhookData, cdevent, {
      eventType,
      issueKey: webhookData.issue?.key,
      projectKey: webhookData.issue?.fields?.project?.key,
      user: webhookData.user?.displayName,
    });

    if (validationResult.success) {
      return c.json(
        {
          success: true,
          message: `Successfully transformed Jira issue created event for ${webhookData.issue.key}`,
          eventId: cdevent.context.id,
          validation: validationResult,
        },
        200
      );
    } else {
      return c.json(
        {
          success: true,
          message: 'Transformed but validation failed',
          errors: validationResult.errors,
        },
        200
      );
    }
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Failed to transform Jira webhook',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      400
    );
  }
});

// Issue Updated Implementation
jiraRoutes.openapi(issueUpdatedRoute, async c => {
  try {
    const webhookData = c.req.valid('json');
    const eventType = 'jira:issue_updated';

    const cdevent = await jiraAdapter.transform(webhookData, eventType);
    const validationResult = await validateCDEvent(cdevent);

    await logWebhookToR2(c.env.EVENTS_BUCKET, webhookData, cdevent, {
      eventType,
      issueKey: webhookData.issue?.key,
      projectKey: webhookData.issue?.fields?.project?.key,
      user: webhookData.user?.displayName,
    });

    if (validationResult.success) {
      return c.json(
        {
          success: true,
          message: `Successfully transformed Jira issue updated event for ${webhookData.issue.key}`,
          validation: validationResult,
        },
        200
      );
    } else {
      return c.json(
        {
          success: true,
          message: 'Transformed but validation failed',
          errors: validationResult.errors,
        },
        200
      );
    }
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Failed to transform Jira webhook',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      400
    );
  }
});

// Issue Deleted Implementation
jiraRoutes.openapi(issueDeletedRoute, async c => {
  try {
    const webhookData = c.req.valid('json');
    const eventType = 'jira:issue_deleted';

    const cdevent = await jiraAdapter.transform(webhookData, eventType);
    const validationResult = await validateCDEvent(cdevent);

    await logWebhookToR2(c.env.EVENTS_BUCKET, webhookData, cdevent, {
      eventType,
      issueKey: webhookData.issue?.key,
      projectKey: webhookData.issue?.fields?.project?.key,
      user: webhookData.user?.displayName,
    });

    if (validationResult.success) {
      return c.json(
        {
          success: true,
          message: `Successfully transformed Jira issue deleted event for ${webhookData.issue.key}`,
          validation: validationResult,
        },
        200
      );
    } else {
      return c.json(
        {
          success: true,
          message: 'Transformed but validation failed',
          errors: validationResult.errors,
        },
        200
      );
    }
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Failed to transform Jira webhook',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      400
    );
  }
});

// Comment Created Implementation
jiraRoutes.openapi(commentCreatedRoute, async c => {
  try {
    const webhookData = c.req.valid('json');
    const eventType = 'comment_created';

    const cdevent = await jiraAdapter.transform(webhookData, eventType);
    const validationResult = await validateCDEvent(cdevent);

    await logWebhookToR2(c.env.EVENTS_BUCKET, webhookData, cdevent, {
      eventType,
      issueKey: webhookData.issue?.key,
      projectKey: webhookData.issue?.fields?.project?.key,
      user: webhookData.user?.displayName,
    });

    if (validationResult.success) {
      return c.json(
        {
          success: true,
          message: `Successfully transformed Jira comment created event for ${webhookData.issue.key}`,
          validation: validationResult,
        },
        200
      );
    } else {
      return c.json(
        {
          success: true,
          message: 'Transformed but validation failed',
          errors: validationResult.errors,
        },
        200
      );
    }
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Failed to transform Jira webhook',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      400
    );
  }
});

// Comment Updated Implementation
jiraRoutes.openapi(commentUpdatedRoute, async c => {
  try {
    const webhookData = c.req.valid('json');
    const eventType = 'comment_updated';

    const cdevent = await jiraAdapter.transform(webhookData, eventType);
    const validationResult = await validateCDEvent(cdevent);

    await logWebhookToR2(c.env.EVENTS_BUCKET, webhookData, cdevent, {
      eventType,
      issueKey: webhookData.issue?.key,
      projectKey: webhookData.issue?.fields?.project?.key,
      user: webhookData.user?.displayName,
    });

    return c.json(
      {
        success: true,
        logged: true,
        message: `Successfully transformed Jira comment updated event for ${webhookData.issue.key}`,
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        logged: true,
        message: 'Failed to transform Jira webhook',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      400
    );
  }
});

// Comment Deleted Implementation
jiraRoutes.openapi(commentDeletedRoute, async c => {
  try {
    const webhookData = c.req.valid('json');
    const eventType = 'comment_deleted';

    const cdevent = await jiraAdapter.transform(webhookData, eventType);
    const validationResult = await validateCDEvent(cdevent);

    await logWebhookToR2(c.env.EVENTS_BUCKET, webhookData, cdevent, {
      eventType,
      issueKey: webhookData.issue?.key,
      projectKey: webhookData.issue?.fields?.project?.key,
      user: webhookData.user?.displayName,
    });

    return c.json(
      {
        success: true,
        logged: true,
        message: `Successfully transformed Jira comment deleted event for ${webhookData.issue.key}`,
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Failed to transform Jira webhook',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      400
    );
  }
});

// Worklog Created Implementation
jiraRoutes.openapi(worklogCreatedRoute, async c => {
  try {
    const webhookData = c.req.valid('json');
    const eventType = 'worklog_created';

    const cdevent = await jiraAdapter.transform(webhookData, eventType);
    const validationResult = await validateCDEvent(cdevent);

    await logWebhookToR2(c.env.EVENTS_BUCKET, webhookData, cdevent, {
      eventType,
      issueKey: webhookData.issue?.key,
      projectKey: webhookData.issue?.fields?.project?.key,
      user: webhookData.user?.displayName,
    });

    return c.json(
      {
        success: true,
        logged: true,
        message: `Successfully transformed Jira worklog created event for ${webhookData.issue.key}`,
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Failed to transform Jira webhook',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      400
    );
  }
});

// Worklog Updated Implementation
jiraRoutes.openapi(worklogUpdatedRoute, async c => {
  try {
    const webhookData = c.req.valid('json');
    const eventType = 'worklog_updated';

    const cdevent = await jiraAdapter.transform(webhookData, eventType);
    const validationResult = await validateCDEvent(cdevent);

    await logWebhookToR2(c.env.EVENTS_BUCKET, webhookData, cdevent, {
      eventType,
      issueKey: webhookData.issue?.key,
      projectKey: webhookData.issue?.fields?.project?.key,
      user: webhookData.user?.displayName,
    });

    return c.json(
      {
        success: true,
        logged: true,
        message: `Successfully transformed Jira worklog updated event for ${webhookData.issue.key}`,
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Failed to transform Jira webhook',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      400
    );
  }
});

// Worklog Deleted Implementation
jiraRoutes.openapi(worklogDeletedRoute, async c => {
  try {
    const webhookData = c.req.valid('json');
    const eventType = 'worklog_deleted';

    const cdevent = await jiraAdapter.transform(webhookData, eventType);
    const validationResult = await validateCDEvent(cdevent);

    await logWebhookToR2(c.env.EVENTS_BUCKET, webhookData, cdevent, {
      eventType,
      issueKey: webhookData.issue?.key,
      projectKey: webhookData.issue?.fields?.project?.key,
      user: webhookData.user?.displayName,
    });

    return c.json(
      {
        success: true,
        logged: true,
        message: `Successfully transformed Jira worklog deleted event for ${webhookData.issue.key}`,
      },
      200
    );
  } catch (error) {
    return c.json(
      {
        success: false,
        message: 'Failed to transform Jira webhook',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      400
    );
  }
});

// Generic Webhook Implementation
jiraRoutes.openapi(genericWebhookRoute, async c => {
  try {
    const webhookData = c.req.valid('json');

    // Try to detect event type from headers or payload
    let eventType = extractJiraWebhookEventType(c.req.raw.headers);

    if (!eventType && webhookData.webhookEvent) {
      eventType = webhookData.webhookEvent;
    }

    if (!eventType) {
      return c.json(
        {
          success: false,
          logged: false,
          eventType: 'unknown',
          message: 'Could not determine Jira event type',
          errors: ['Missing event type in headers and payload'],
        },
        400
      );
    }

    // Try to transform the webhook
    let cdevent: any = null;
    let transformationMessage = '';

    try {
      cdevent = await jiraAdapter.transform(webhookData, eventType);
      transformationMessage = `Successfully transformed ${eventType} event`;

      if (webhookData.issue?.key) {
        transformationMessage += ` for issue ${webhookData.issue.key}`;
      }
    } catch (error) {
      transformationMessage = `Failed to transform ${eventType} event: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Validate the transformed event if transformation succeeded
    const validationResult = cdevent
      ? await validateCDEvent(cdevent)
      : { success: false, errors: ['No CD Event generated'] };

    // Always log to R2, even if transformation failed
    await logWebhookToR2(c.env.EVENTS_BUCKET, webhookData, cdevent, {
      eventType,
      issueKey: webhookData.issue?.key,
      projectKey: webhookData.issue?.fields?.project?.key,
      user: webhookData.user?.displayName,
    });

    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];
    const key = `jira-webhooks/${date}/${eventType}-${webhookData.issue?.key || 'unknown'}-${Date.now()}.json`;

    const logEntry = {
      source: 'jira',
      webhook: webhookData,
      transformedEvent: cdevent,
      metadata: {
        issueKey: webhookData.issue?.key,
        projectKey: webhookData.issue?.fields?.project?.key,
        user: webhookData.user?.displayName,
        eventType,
        timestamp,
        transformation: {
          success: !!cdevent,
          message: transformationMessage,
        },
        validation: validationResult,
        pullRequestNumber: webhookData.issue?.fields?.customfield_10004
          ? (webhookData.issue.fields.customfield_10004 as any)[0]?.key
          : undefined, // Common PR field
        pullRequestTitle: webhookData.issue?.fields?.customfield_10004
          ? (webhookData.issue.fields.customfield_10004 as any)[0]?.summary
          : undefined,
        // Epic information if available
        issueNumber: webhookData.issue?.id,
        issueTitle: webhookData.issue?.fields?.summary,
      },
    };

    if (c.env.EVENTS_BUCKET) {
      await c.env.EVENTS_BUCKET.put(key, JSON.stringify(logEntry, null, 2), {
        httpMetadata: { contentType: 'application/json' },
        customMetadata: {
          'event-type': eventType,
          'issue-key': webhookData.issue?.key || 'unknown',
        },
      });
    }

    const message = cdevent
      ? `Successfully processed ${eventType} webhook for ${webhookData.issue?.key || 'unknown issue'}`
      : transformationMessage;

    if (cdevent && validationResult.success) {
      return c.json(
        {
          success: true,
          logged: true,
          message,
          eventId: cdevent.context?.id,
          validation: validationResult,
        },
        200
      );
    } else {
      return c.json(
        {
          success: false,
          logged: true,
          message,
          errors: validationResult.errors || ['Transformation failed'],
        },
        400
      );
    }
  } catch (error) {
    return c.json(
      {
        success: false,
        logged: true,
        message: 'Failed to process Jira webhook',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      },
      400
    );
  }
});

// Adapter Info Implementation
jiraRoutes.openapi(adapterInfoRoute, async c => {
  return c.json({
    name: jiraAdapter.name,
    version: jiraAdapter.version,
    supportedEvents: jiraAdapter.supportedEvents,
    endpoints: {
      issue_created: '/adapters/jira/issue/created',
      issue_updated: '/adapters/jira/issue/updated',
      issue_deleted: '/adapters/jira/issue/deleted',
      comment_created: '/adapters/jira/comment/created',
      comment_updated: '/adapters/jira/comment/updated',
      comment_deleted: '/adapters/jira/comment/deleted',
      worklog_created: '/adapters/jira/worklog/created',
      worklog_updated: '/adapters/jira/worklog/updated',
      worklog_deleted: '/adapters/jira/worklog/deleted',
      generic_webhook: '/adapters/jira/webhook',
      info: '/adapters/jira/info',
    },
    description:
      'Jira webhook adapter for transforming Jira events to CD Events',
  });
});
