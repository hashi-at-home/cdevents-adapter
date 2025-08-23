import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { GitHubAdapter } from "./adapter";
import {
  GitHubWorkflowJobQueuedWebhookSchema,
  GitHubWorkflowJobInProgressWebhookSchema,
  GitHubWorkflowJobCompletedWebhookSchema,
  GitHubPingWebhookSchema,
} from "./schemas";
import { AdapterResponseSchema, AdapterErrorResponseSchema } from "../base";

const githubAdapter = new GitHubAdapter();

// GitHub adapter routes
export const githubRoutes = new OpenAPIHono();

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
          schema: AdapterResponseSchema,
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
          schema: AdapterResponseSchema,
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
          schema: AdapterResponseSchema,
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

// Generic workflow job webhook route (auto-detects action)
const workflowJobRoute = createRoute({
  method: "post",
  path: "/workflow_job",
  request: {
    body: {
      content: {
        "application/json": {
          schema: GitHubWorkflowJobQueuedWebhookSchema.or(
            GitHubWorkflowJobInProgressWebhookSchema
          ).or(GitHubWorkflowJobCompletedWebhookSchema).or(GitHubPingWebhookSchema),
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AdapterResponseSchema,
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
  summary: "Transform GitHub workflow job webhook to CD Event (auto-detect action)",
  description: `
Transform any GitHub workflow_job webhook payload into the appropriate CD Events.
This endpoint auto-detects the action type from the payload and routes to the correct transformation.
Supports queued, in_progress, and completed actions, as well as ping events for webhook validation.
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
          schema: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              ping: {
                type: "object",
                properties: {
                  zen: { type: "string" },
                  hook_id: { type: "number" },
                  repository: { type: "string" },
                  sender: { type: "string" },
                },
              },
            },
          },
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
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              version: { type: "string" },
              supportedEvents: { type: "array", items: { type: "string" } },
              endpoints: {
                type: "object",
                additionalProperties: { type: "string" },
              },
            },
          },
        },
      },
      description: "GitHub adapter information",
    },
  },
  tags: ["GitHub Adapter"],
  summary: "Get GitHub adapter information",
  description: "Returns information about the GitHub adapter including supported events and endpoints.",
});

// Register route handlers
githubRoutes.openapi(workflowJobQueuedRoute, async (c) => {
  try {
    const webhookData = c.req.valid("json");
    const eventType = "workflow_job.queued";

    const cdevent = await githubAdapter.transform(webhookData, eventType);

    // Forward the CD Event to the validation endpoint
    const validationResponse = await c.env?.fetch?.(
      new Request(`${c.req.url.split("/adapters")[0]}/validate/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cdevent),
      })
    );

    let validationResult = { valid: true };
    if (validationResponse) {
      validationResult = await validationResponse.json();
    }

    return c.json({
      success: true,
      message: "GitHub workflow job queued webhook successfully transformed to CD Event",
      cdevent,
      validation: validationResult,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
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

    const cdevent = await githubAdapter.transform(webhookData, eventType);

    // Forward the CD Event to the validation endpoint
    const validationResponse = await c.env?.fetch?.(
      new Request(`${c.req.url.split("/adapters")[0]}/validate/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cdevent),
      })
    );

    let validationResult = { valid: true };
    if (validationResponse) {
      validationResult = await validationResponse.json();
    }

    return c.json({
      success: true,
      message: "GitHub workflow job in progress webhook successfully transformed to CD Event",
      cdevent,
      validation: validationResult,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
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

    const cdevent = await githubAdapter.transform(webhookData, eventType);

    // Forward the CD Event to the validation endpoint
    const validationResponse = await c.env?.fetch?.(
      new Request(`${c.req.url.split("/adapters")[0]}/validate/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cdevent),
      })
    );

    let validationResult = { valid: true };
    if (validationResponse) {
      validationResult = await validationResponse.json();
    }

    return c.json({
      success: true,
      message: "GitHub workflow job completed webhook successfully transformed to CD Event",
      cdevent,
      validation: validationResult,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        message: "Failed to transform webhook",
        errors: [error instanceof Error ? error.message : "Unknown error"],
      },
      400
    );
  }
});

githubRoutes.openapi(workflowJobRoute, async (c) => {
  try {
    const webhookData = c.req.valid("json");

    // Check if this is a ping event (ping events don't have an action field)
    if (webhookData.zen && webhookData.hook_id && !webhookData.action) {
      const response = await githubAdapter.transform(webhookData, "ping");
      return c.json(response);
    }

    const action = webhookData.action;
    const eventType = `workflow_job.${action}`;

    const cdevent = await githubAdapter.transform(webhookData, eventType);

    // Forward the CD Event to the validation endpoint
    const validationResponse = await c.env?.fetch?.(
      new Request(`${c.req.url.split("/adapters")[0]}/validate/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cdevent),
      })
    );

    let validationResult = { valid: true };
    if (validationResponse) {
      validationResult = await validationResponse.json();
    }

    return c.json({
      success: true,
      message: `GitHub workflow job ${action} webhook successfully transformed to CD Event`,
      cdevent,
      validation: validationResult,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
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

    const response = await githubAdapter.transform(webhookData, eventType);

    return c.json(response);
  } catch (error) {
    return c.json(
      {
        success: false,
        message: "Failed to handle ping webhook",
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
      workflow_job_in_progress: "/adapters/github/workflow_job/in_progress",
      workflow_job_completed: "/adapters/github/workflow_job/completed",
      workflow_job_generic: "/adapters/github/workflow_job",
      ping: "/adapters/github/ping",
      info: "/adapters/github/info",
    },
    description: "GitHub webhook adapter for transforming workflow job events to CD Events",
  });
});
