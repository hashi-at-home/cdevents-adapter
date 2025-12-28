import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { GitHubAdapter } from "./adapter";
import {
  GitHubWorkflowJobQueuedWebhookSchema,
  GitHubWorkflowJobWaitingWebhookSchema,
  GitHubWorkflowJobInProgressWebhookSchema,
  GitHubWorkflowJobCompletedWebhookSchema,
  GitHubPingWebhookSchema,
} from "./schemas";
import { AdapterResponseSchema, AdapterErrorResponseSchema } from "../base";
import { z } from "zod";

// Define environment bindings
type Env = {
  readonly CI_BUILD_QUEUED?: Queue;
  readonly EVENTS_BUCKET?: R2Bucket;
};

// Success response schema for webhook transformations
const AdapterSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  cdevent: z.any().optional(),
});

const githubAdapter = new GitHubAdapter();

/**
 * Helper function to log webhook data to R2 storage
 * @param bucket - The R2 bucket to store the webhook data
 * @param eventType - The type of GitHub event
 * @param webhookData - The raw webhook payload from GitHub
 * @param cdevent - Optional transformed CD event
 */
async function logWebhookToR2(
  bucket: R2Bucket | undefined,
  eventType: string,
  webhookData: any,
  cdevent?: any
): Promise<void> {
  // Skip logging if bucket is not configured (e.g., in tests)
  if (!bucket) {
    return;
  }

  try {
    const timestamp = new Date().toISOString();
    const date = timestamp.split('T')[0];

    // Generate a unique key for this webhook
    const webhookId = webhookData.workflow_job?.id ||
      webhookData.repository?.id ||
      crypto.randomUUID();

    const key = `github-webhooks/${date}/${eventType}/${webhookId}-${timestamp.replace(/[:.]/g, '-')}.json`;

    // Prepare the log entry
    const logEntry = {
      timestamp,
      eventType,
      source: 'github',
      webhook: webhookData,
      ...(cdevent && { transformedEvent: cdevent }),
      metadata: {
        repository: webhookData.repository?.full_name,
        organization: webhookData.organization?.login,
        sender: webhookData.sender?.login,
        workflowJobId: webhookData.workflow_job?.id,
        workflowJobName: webhookData.workflow_job?.name,
        runId: webhookData.workflow_job?.run_id,
        runAttempt: webhookData.workflow_job?.run_attempt,
      }
    };

    // Store the log entry in R2
    await bucket.put(key, JSON.stringify(logEntry, null, 2), {
      httpMetadata: {
        contentType: 'application/json',
      },
      customMetadata: {
        eventType,
        repository: webhookData.repository?.full_name || 'unknown',
        timestamp,
      }
    });

    console.log(`Webhook logged to R2: ${key}`);
  } catch (error) {
    console.error('Failed to log webhook to R2:', error);
    // Don't throw - logging failure shouldn't break the main flow
  }
}

// GitHub adapter routes
export const githubRoutes = new OpenAPIHono<{ Bindings: Env }>();

// The generic github adapter route
const githubWebhookRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.any()
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.any(),
        },
      },
      description: "Successfully received Github webhook",
    },
    400: {
      content: {
        "application/json": {
          schema: z.any(),
        },
      },
      description: "Invalid request body",
    }
  }
})

// Workflow job queued webhook route
const workflowJobQueuedRoute = createRoute({
  method: "post",
  path: "/workflow_job/queued",
  request: {
    body: {
      content: {
        "application/json": {
          schema: GitHubWorkflowJobQueuedWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description: "Successfully transformed GitHub webhook to CD Event",
    },
    400: {
      content: {
        "application/json": {
          schema: AdapterErrorResponseSchema,
        },
      },
      description: "Invalid webhook payload or transformation error",
    },
  },
  tags: ["GitHub Adapter"],
  summary: "Transform GitHub workflow job queued webhook to CD Event",
  description: `
Transform a GitHub workflow_job.queued webhook payload into a CD Events pipeline run queued event.
This endpoint accepts GitHub webhook payloads and converts them to compliant CD Events format.
The resulting event is automatically validated and can be forwarded to CD Events consumers.
  `.trim(),
});

// Workflow job waiting webhook route
const workflowJobWaitingRoute = createRoute({
  method: "post",
  path: "/workflow_job/waiting",
  request: {
    body: {
      content: {
        "application/json": {
          schema: GitHubWorkflowJobWaitingWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description: "Successfully transformed GitHub webhook to CD Event",
    },
    400: {
      content: {
        "application/json": {
          schema: AdapterErrorResponseSchema,
        },
      },
      description: "Invalid webhook payload or transformation error",
    },
  },
  tags: ["GitHub Adapter"],
  summary: "Transform GitHub workflow job waiting webhook to CD Event",
  description: `
Transform a GitHub workflow_job.waiting webhook payload into a CD Events pipeline run queued event.
This endpoint accepts GitHub webhook payloads and converts them to compliant CD Events format.
The resulting event is automatically validated and can be forwarded to CD Events consumers.
  `.trim(),
});

// Workflow job in progress webhook route
const workflowJobInProgressRoute = createRoute({
  method: "post",
  path: "/workflow_job/in_progress",
  request: {
    body: {
      content: {
        "application/json": {
          schema: GitHubWorkflowJobInProgressWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description: "Successfully transformed GitHub webhook to CD Event",
    },
    400: {
      content: {
        "application/json": {
          schema: AdapterErrorResponseSchema,
        },
      },
      description: "Invalid webhook payload or transformation error",
    },
  },
  tags: ["GitHub Adapter"],
  summary: "Transform GitHub workflow job in progress webhook to CD Event",
  description: `
Transform a GitHub workflow_job.in_progress webhook payload into a CD Events pipeline run started event.
This endpoint accepts GitHub webhook payloads and converts them to compliant CD Events format.
The resulting event is automatically validated and can be forwarded to CD Events consumers.
  `.trim(),
});

// Workflow job completed webhook route
const workflowJobCompletedRoute = createRoute({
  method: "post",
  path: "/workflow_job/completed",
  request: {
    body: {
      content: {
        "application/json": {
          schema: GitHubWorkflowJobCompletedWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description: "Successfully transformed GitHub webhook to CD Event",
    },
    400: {
      content: {
        "application/json": {
          schema: AdapterErrorResponseSchema,
        },
      },
      description: "Invalid webhook payload or transformation error",
    },
  },
  tags: ["GitHub Adapter"],
  summary: "Transform GitHub workflow job completed webhook to CD Event",
  description: `
Transform a GitHub workflow_job.completed webhook payload into a CD Events pipeline run finished event.
This endpoint accepts GitHub webhook payloads and converts them to compliant CD Events format.
The resulting event is automatically validated and can be forwarded to CD Events consumers.
  `.trim(),
});

// Generic workflow job webhook route (routes to specific endpoints)
const workflowJobRoute = createRoute({
  method: "post",
  path: "/workflow_job",
  request: {
    body: {
      content: {
        "application/json": {
          schema: GitHubWorkflowJobQueuedWebhookSchema.or(
            GitHubWorkflowJobWaitingWebhookSchema
          ).or(GitHubWorkflowJobInProgressWebhookSchema).or(GitHubWorkflowJobCompletedWebhookSchema).or(GitHubPingWebhookSchema),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description: "Successfully transformed GitHub webhook to CD Event",
    },
    400: {
      content: {
        "application/json": {
          schema: AdapterErrorResponseSchema,
        },
      },
      description: "Invalid webhook payload or transformation error",
    },
  },
  tags: ["GitHub Adapter"],
  summary: "Route GitHub workflow job webhook to specific endpoint",
  description: `
Routes GitHub workflow_job webhook payloads to the appropriate specific endpoint based on action type.
This endpoint auto-detects the action type from the payload and redirects to the correct specific endpoint.
Supports queued, waiting, in_progress, and completed actions, as well as ping events for webhook validation.
  `.trim(),
});

// Ping webhook route
const pingRoute = createRoute({
  method: "post",
  path: "/ping",
  request: {
    body: {
      content: {
        "application/json": {
          schema: GitHubPingWebhookSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AdapterSuccessResponseSchema,
        },
      },
      description: "Ping webhook received successfully",
    },
    400: {
      content: {
        "application/json": {
          schema: AdapterErrorResponseSchema,
        },
      },
      description: "Invalid ping payload",
    },
  },
  tags: ["GitHub Adapter"],
  summary: "Handle GitHub webhook ping event",
  description: `
Handle GitHub webhook ping events sent when a webhook is first created.
This endpoint validates that the webhook is properly configured and responds with a success message.
No CD Events are generated for ping events as they are purely for webhook validation.
  `.trim(),
});

// Adapter info route
const adapterInfoRoute = createRoute({
  method: "get",
  path: "/info",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string(),
            version: z.string(),
            supportedEvents: z.array(z.string()),
            endpoints: z.object({
              workflow_job_queued: z.string(),
              workflow_job_waiting: z.string(),
              workflow_job_in_progress: z.string(),
              workflow_job_completed: z.string(),
              workflow_job_generic: z.string(),
              ping: z.string(),
              info: z.string(),
              generic_webhook: z.string(), // 2024-12-19: Added generic webhook endpoint
            }),
            description: z.string(),
          }),
        },
      },
      description: "GitHub adapter information",
    },
  },
  tags: ["GitHub Adapter"],
  summary: "Get GitHub adapter information",
  description: "Returns information about the GitHub adapter including supported events and endpoints.",
});

// Generic webhook handler route - 2024-12-19: Added to handle arbitrary GitHub webhooks
const genericWebhookRoute = createRoute({
  method: "post",
  path: "/webhook",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.any(), // Accept any JSON payload for now
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            success: z.literal(true),
            message: z.string(),
            eventType: z.string().optional(),
            logged: z.boolean(),
            cdevent: z.any().optional(), // 2024-12-19: Added for workflow_job.queued transformation
          }),
        },
      },
      description: "Webhook successfully received and logged",
    },
    400: {
      content: {
        "application/json": {
          schema: AdapterErrorResponseSchema,
        },
      },
      description: "Invalid webhook payload",
    },
  },
  tags: ["GitHub Adapter"],
  summary: "Handle arbitrary GitHub webhooks",
  description: `
Receives any GitHub webhook event and routes it based on event type.
- workflow_job.queued and workflow_job.waiting events are transformed to CD Events format and sent to queue
- All other events are logged to R2 storage without transformation
The webhook is stored in R2 with metadata for auditing and replay.
  `.trim(),
});

// Register route handlers
githubRoutes.openapi(workflowJobQueuedRoute, async (c) => {
  try {
    const webhookData = c.req.valid("json");
    const eventType = "workflow_job.queued";

    // Log the incoming webhook to R2
    await logWebhookToR2(c.env?.EVENTS_BUCKET, eventType, webhookData);

    const cdevent = await githubAdapter.transform(webhookData, eventType);
    console.log(JSON.stringify(cdevent));

    // Update the log with the transformed CD event
    await logWebhookToR2(c.env?.EVENTS_BUCKET, eventType, webhookData, cdevent);

    // Forward the CD Event to the validation endpoint
    let validationResult = null;
    try {
      const validationResponse = await fetch(`${c.req.url.split("/adapters")[0]}/validate/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cdevent),
      });

      validationResult = await validationResponse.json() as any;
    } catch (validationError) {
      // Validation service might not be available in test environment
      console.warn('CD Event validation skipped:', validationError);
    }

    // Send to the queue if configured - 2024-12-19
    if (c.env?.CI_BUILD_QUEUED) {
      await c.env.CI_BUILD_QUEUED.send(cdevent);
      console.log('CD Event sent to CI_BUILD_QUEUED queue');
    }

    return c.json({
      success: true as const,
      message: "GitHub workflow job queued webhook successfully transformed to CD Event",
      cdevent,
      ...(validationResult && { validation: validationResult }),
    }, 200);
  } catch (error) {
    return c.json(
      {
        success: false as const,
        message: "Failed to transform webhook",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      400
    );
  }
});

githubRoutes.openapi(workflowJobInProgressRoute, async (c) => {
  try {
    const webhookData = c.req.valid("json");
    const eventType = "workflow_job.in_progress";

    // Log the incoming webhook to R2
    await logWebhookToR2(c.env?.EVENTS_BUCKET, eventType, webhookData);

    const cdevent = await githubAdapter.transform(webhookData, eventType);

    // Update the log with the transformed CD event
    await logWebhookToR2(c.env?.EVENTS_BUCKET, eventType, webhookData, cdevent);

    // Forward the CD Event to the validation endpoint
    let validationResult = null;
    try {
      const validationResponse = await fetch(`${c.req.url.split("/adapters")[0]}/validate/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cdevent),
      });

      validationResult = await validationResponse.json() as any;
    } catch (validationError) {
      // Validation service might not be available in test environment
      console.warn('CD Event validation skipped:', validationError);
    }

    return c.json({
      success: true as const,
      message: "GitHub workflow job in progress webhook successfully transformed to CD Event",
      cdevent,
      ...(validationResult && { validation: validationResult }),
    }, 200);
  } catch (error) {
    return c.json(
      {
        success: false as const,
        message: "Failed to transform webhook",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      400
    );
  }
});

githubRoutes.openapi(workflowJobCompletedRoute, async (c) => {
  try {
    const webhookData = c.req.valid("json");
    const eventType = "workflow_job.completed";

    // Log the incoming webhook to R2
    await logWebhookToR2(c.env?.EVENTS_BUCKET, eventType, webhookData);

    const cdevent = await githubAdapter.transform(webhookData, eventType);

    // Update the log with the transformed CD event
    await logWebhookToR2(c.env?.EVENTS_BUCKET, eventType, webhookData, cdevent);

    // Forward the CD Event to the validation endpoint
    let validationResult = null;
    try {
      const validationResponse = await fetch(`${c.req.url.split("/adapters")[0]}/validate/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cdevent),
      });

      validationResult = await validationResponse.json() as any;
    } catch (validationError) {
      // Validation service might not be available in test environment
      console.warn('CD Event validation skipped:', validationError);
    }

    return c.json({
      success: true as const,
      message: "GitHub workflow job completed webhook successfully transformed to CD Event",
      cdevent,
      ...(validationResult && { validation: validationResult }),
    }, 200);
  } catch (error) {
    return c.json(
      {
        success: false as const,
        message: "Failed to transform webhook",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      400
    );
  }
});

githubRoutes.openapi(workflowJobWaitingRoute, async (c) => {
  try {
    const webhookData = c.req.valid("json");
    const eventType = "workflow_job.waiting";

    // Log the incoming webhook to R2
    await logWebhookToR2(c.env?.EVENTS_BUCKET, eventType, webhookData);

    const cdevent = await githubAdapter.transform(webhookData, eventType);
    console.log(JSON.stringify(cdevent));

    // Update the log with the transformed CD event
    await logWebhookToR2(c.env?.EVENTS_BUCKET, eventType, webhookData, cdevent);

    // Forward the CD Event to the validation endpoint
    let validationResult = null;
    try {
      const validationResponse = await fetch(`${c.req.url.split("/adapters")[0]}/validate/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cdevent),
      });

      validationResult = await validationResponse.json() as any;
    } catch (validationError) {
      // Validation service might not be available in test environment
      console.warn('CD Event validation skipped:', validationError);
    }

    // Send to the queue if configured - 2024-12-19
    // workflow_job.waiting events also represent queued work
    if (c.env?.CI_BUILD_QUEUED) {
      await c.env.CI_BUILD_QUEUED.send(cdevent);
      console.log('CD Event sent to CI_BUILD_QUEUED queue');
    }

    return c.json({
      success: true as const,
      message: "GitHub workflow job waiting webhook successfully transformed to CD Event",
      cdevent,
      ...(validationResult && { validation: validationResult }),
    }, 200);
  } catch (error) {
    return c.json(
      {
        success: false as const,
        message: "Failed to transform webhook",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      400
    );
  }
});

githubRoutes.openapi(workflowJobRoute, async (c) => {
  try {
    // webhookData should be a valid github webhook payload
    // either a ping event or a workflow job event
    const webhookData = c.req.valid("json") as any;
    console.log("received webhook event")

    // Check if this is a ping event (ping events don't have an action field)
    if ("zen" in webhookData && "hook_id" in webhookData && !("action" in webhookData)) {
      // Log the ping webhook to R2
      await logWebhookToR2(c.env?.EVENTS_BUCKET, "ping", webhookData);

      const response = await githubAdapter.transform(webhookData, "ping");
      return c.json({
        success: true as const,
        message: "GitHub webhook ping received successfully",
        ...response,
      }, 200);
    }

    if (!("action" in webhookData)) {
      return c.json(
        {
          success: false as const,
          message: "Invalid webhook payload: missing action field",
          errors: ["Webhook payload must contain an action field"],
        },
        400
      );
    }

    const action = webhookData.action;
    const eventType = `workflow_job.${action}`;

    // Validate action is supported
    if (!['queued', 'waiting', 'in_progress', 'completed'].includes(action)) {
      return c.json(
        {
          success: false as const,
          message: `Unsupported action: ${action}`,
          errors: [`Action '${action}' is not supported. Supported actions: queued, waiting, in_progress, completed`],
        },
        400
      );
    }

    // Log the incoming webhook to R2
    await logWebhookToR2(c.env?.EVENTS_BUCKET, eventType, webhookData);

    const cdevent = await githubAdapter.transform(webhookData, eventType);

    // Update the log with the transformed CD event
    await logWebhookToR2(c.env?.EVENTS_BUCKET, eventType, webhookData, cdevent);

    // Forward the CD Event to the validation endpoint
    let validationResult = null;
    try {
      const validationResponse = await fetch(`${c.req.url.split("/adapters")[0]}/validate/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cdevent),
      });

      validationResult = await validationResponse.json() as any;
    } catch (validationError) {
      // Validation service might not be available in test environment
      console.warn('CD Event validation skipped:', validationError);
    }

    // if this is a queued or waiting event, put the cdevent on the queue - 2024-12-19
    // Both queued and waiting represent work that needs to be processed
    if ((action === 'queued' || action === 'waiting') && c.env?.CI_BUILD_QUEUED) {
      await c.env.CI_BUILD_QUEUED.send(cdevent);
      console.log('CD Event sent to CI_BUILD_QUEUED queue');
    }

    return c.json({
      success: true as const,
      message: `GitHub workflow job waiting webhook successfully transformed to CD Event`,
      eventId: cdevent.context?.id,  // Return the CD event unique ID
      cdevent,
      ...(validationResult && { validation: validationResult }),
    }, 200);
  } catch (error) {
    return c.json(
      {
        success: false as const,
        message: "Failed to transform webhook",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      400
    );
  }
});

githubRoutes.openapi(pingRoute, async (c) => {
  try {
    const webhookData = c.req.valid("json");
    const eventType = "ping";

    // Log the ping webhook to R2
    await logWebhookToR2(c.env?.EVENTS_BUCKET, eventType, webhookData);

    const response = await githubAdapter.transform(webhookData, eventType);

    return c.json({
      success: true as const,
      message: "GitHub webhook ping received successfully",
      ...response,
    }, 200);
  } catch (error) {
    return c.json(
      {
        success: false as const,
        message: "Failed to handle ping webhook",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      400
    );
  }
});

// Generic webhook handler - 2024-12-19: Routes webhooks based on event type
githubRoutes.openapi(genericWebhookRoute, async (c) => {
  try {
    const webhookData = c.req.valid("json") as any;

    // Detect the event type from GitHub headers or webhook payload
    const githubEvent = c.req.header("X-GitHub-Event") || "unknown";
    const githubDelivery = c.req.header("X-GitHub-Delivery") || crypto.randomUUID();

    // For workflow_job events, include the action in the event type
    let eventType = githubEvent;
    if (githubEvent === "workflow_job" && webhookData.action) {
      eventType = `${githubEvent}.${webhookData.action}`;
    }

    console.log(`Received GitHub webhook: ${eventType} (delivery: ${githubDelivery})`);

    // Initialize variables for CD Event transformation
    let cdevent = null;
    let transformationMessage = null;

    // Route workflow_job.queued and workflow_job.waiting events to the CD Events adapter
    // Both represent queued work that should be transformed to CD Events
    if (eventType === "workflow_job.queued" || eventType === "workflow_job.waiting") {
      try {
        // Transform to CD Event using the existing adapter
        cdevent = await githubAdapter.transform(webhookData, eventType);
        console.log(`Transformed ${eventType} to CD Event:`, JSON.stringify(cdevent));

        // Send to the queue if configured
        if (c.env?.CI_BUILD_QUEUED) {
          await c.env.CI_BUILD_QUEUED.send(cdevent);
          console.log('CD Event sent to CI_BUILD_QUEUED queue');
        }

        // Validate the CD Event
        try {
          const validationResponse = await fetch(`${c.req.url.split("/adapters")[0]}/validate/event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cdevent),
          });
          const validationResult = await validationResponse.json() as any;
          console.log('CD Event validation result:', validationResult);
        } catch (validationError) {
          console.warn('CD Event validation skipped:', validationError);
        }

        transformationMessage = `${eventType} transformed to CD Event and queued`;
      } catch (transformError) {
        console.error(`Failed to transform ${eventType} to CD Event:`, transformError);
        transformationMessage = `${eventType} transformation failed, logged as-is`;
        // Continue to log the webhook even if transformation fails
      }
    }

    // Log the webhook to R2 with enhanced metadata
    if (c.env?.EVENTS_BUCKET) {
      const timestamp = new Date().toISOString();
      const date = timestamp.split('T')[0];

      // Create a unique key using GitHub delivery ID if available
      const key = `github-webhooks/${date}/${eventType}/${githubDelivery}-${timestamp.replace(/[:.]/g, '-')}.json`;

      const logEntry = {
        timestamp,
        eventType,
        githubEvent,
        githubDelivery,
        source: 'github',
        webhook: webhookData,
        ...(cdevent && { transformedEvent: cdevent }), // Include CD Event if transformed
        metadata: {
          repository: webhookData.repository?.full_name,
          organization: webhookData.organization?.login,
          sender: webhookData.sender?.login,
          action: webhookData.action,
          // Additional metadata based on event type
          ...(webhookData.workflow_job && {
            workflowJobId: webhookData.workflow_job.id,
            workflowJobName: webhookData.workflow_job.name,
            runId: webhookData.workflow_job.run_id,
            runAttempt: webhookData.workflow_job.run_attempt,
          }),
          ...(webhookData.pull_request && {
            pullRequestNumber: webhookData.pull_request.number,
            pullRequestTitle: webhookData.pull_request.title,
          }),
          ...(webhookData.issue && {
            issueNumber: webhookData.issue.number,
            issueTitle: webhookData.issue.title,
          }),
        }
      };

      await c.env.EVENTS_BUCKET.put(key, JSON.stringify(logEntry, null, 2), {
        httpMetadata: {
          contentType: 'application/json',
        },
        customMetadata: {
          eventType,
          githubEvent,
          githubDelivery,
          repository: webhookData.repository?.full_name || 'unknown',
          timestamp,
        }
      });

      console.log(`Webhook logged to R2: ${key}`);
    }

    // Return success response with appropriate message
    const message = transformationMessage ||
      `GitHub ${eventType} webhook received and logged`;

    return c.json({
      success: true as const,
      message,
      eventType,
      logged: true,
      ...(cdevent && { cdevent }), // Include CD Event if transformation occurred
    }, 200);

  } catch (error) {
    console.error('Failed to handle generic webhook:', error);
    return c.json(
      {
        success: false as const,
        message: "Failed to process webhook",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      400
    );
  }
});

githubRoutes.openapi(adapterInfoRoute, (c) => {
  return c.json({
    name: githubAdapter.name,
    version: githubAdapter.version,
    supportedEvents: githubAdapter.supportedEvents,
    endpoints: {
      workflow_job_queued: "/adapters/github/workflow_job/queued",
      workflow_job_waiting: "/adapters/github/workflow_job/waiting",
      workflow_job_in_progress: "/adapters/github/workflow_job/in_progress",
      workflow_job_completed: "/adapters/github/workflow_job/completed",
      workflow_job_generic: "/adapters/github/workflow_job",
      ping: "/adapters/github/ping",
      info: "/adapters/github/info",
      generic_webhook: "/adapters/github/webhook", // 2024-12-19: Added generic webhook endpoint
    },
    description: "GitHub webhook adapter for transforming workflow job events to CD Events",
  });
});
