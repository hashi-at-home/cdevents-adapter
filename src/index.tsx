import { OpenAPIHono, createRoute } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { githubRoutes } from "./adapters/github/routes";
import {
  CDEventSchema,
  CoreCDEventSchema,
  PipelineRunQueuedEventSchema,
  PipelineRunStartedEventSchema,
  PipelineRunFinishedEventSchema,
  TaskRunStartedEventSchema,
  TaskRunFinishedEventSchema,
  CDEventContextSchema,
  CDEventSubjectSchema,
  OutcomeEnum,
  SubjectTypeEnum,
  LinkTypeEnum,
  LinkKindEnum,
} from "./schemas";

type Environment = {
  readonly CI_BUILD_QUEUED: Queue<Error>
  readonly CI_BUILD_QUEUED_BUCKET: R2Bucket
}

const app = new OpenAPIHono<{ Bindings: Environment }>();

// OpenAPI documentation endpoint
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "CD Events Adapter API",
    description: `
# CD Events Adapter API

This API provides schemas and validation for CD Events (Continuous Delivery Events) v0.4.1 specification.

## About CD Events

CD Events is a vendor-neutral specification for defining the format of event data.
This adapter provides TypeScript/JavaScript support with comprehensive validation using Zod schemas.

## Supported Events

This API currently supports the following core CD Events:

- **Pipeline Run Events**: queued, started, finished
- **Task Run Events**: started, finished

## Features

- Full TypeScript support with inferred types
- Strict validation according to CD Events specification
- OpenAPI 3.0 documentation
- RFC 3339 timestamp validation
- UUID validation for identifiers

## Usage

Send your github webhooks to the adapter's endpoint.
The adapter will validate and transform the incoming webhook payload into a relevant CD Event.
This is then placed on a queue for downstream processing.

Use the schemas provided in this documentation to:
1. Validate incoming CD Events
2. Generate properly formatted CD Events
3. Ensure compliance with the specification
4. Integrate with CI/CD systems

Visit the [CD Events specification](https://cdevents.dev/) for more information.
    `.trim(),
    contact: {
      name: "CD Events Community",
      url: "https://cdevents.dev",
    },
    license: {
      name: "Apache 2.0",
      url: "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
  },
  servers: [
    {
      url: "http://localhost:8787",
      description: "Development server",
    },
  ],
  tags: [
    {
      name: "Adapters",
      description:
        "Webhook adapters for transforming external events to CD Events",
    },
    {
      name: "GitHub Adapter",
      description: "Transform GitHub webhook events to CD Events",
    },
    {
      name: "Validation",
      description: "CD Events schema validation endpoints",
    },
    {
      name: "Schemas",
      description: "CD Events schema definitions and validation",
    },
    {
      name: "Events",
      description: "CD Event type definitions",
    },
    {
      name: "Components",
      description: "Reusable schema components",
    },
  ],
});

// Swagger UI endpoint
app.get(
  "/docs",
  swaggerUI({
    url: "/openapi.json",
  }),
);

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "cd-events-adapter",
    version: "1.0.0",
  });
});

// Schema validation endpoints to register schemas in OpenAPI
const validatePipelineRunQueuedRoute = createRoute({
  method: "post",
  path: "/validate/pipelinerun/queued",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PipelineRunQueuedEventSchema,
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
              valid: { type: "boolean" },
              eventType: { type: "string" },
            },
          },
        },
      },
      description: "Validation result",
    },
    400: {
      content: {
        "application/json": {
          schema: { type: "object", properties: { error: { type: "string" } } },
        },
      },
      description: "Validation error",
    },
  },
  tags: ["Validation"],
});

const validatePipelineRunStartedRoute = createRoute({
  method: "post",
  path: "/validate/pipelinerun/started",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PipelineRunStartedEventSchema,
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
              valid: { type: "boolean" },
              eventType: { type: "string" },
            },
          },
        },
      },
      description: "Validation result",
    },
    400: {
      content: {
        "application/json": {
          schema: { type: "object", properties: { error: { type: "string" } } },
        },
      },
      description: "Validation error",
    },
  },
  tags: ["Validation"],
});

const validatePipelineRunFinishedRoute = createRoute({
  method: "post",
  path: "/validate/pipelinerun/finished",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PipelineRunFinishedEventSchema,
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
              valid: { type: "boolean" },
              eventType: { type: "string" },
            },
          },
        },
      },
      description: "Validation result",
    },
    400: {
      content: {
        "application/json": {
          schema: { type: "object", properties: { error: { type: "string" } } },
        },
      },
      description: "Validation error",
    },
  },
  tags: ["Validation"],
});

const validateTaskRunStartedRoute = createRoute({
  method: "post",
  path: "/validate/taskrun/started",
  request: {
    body: {
      content: {
        "application/json": {
          schema: TaskRunStartedEventSchema,
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
              valid: { type: "boolean" },
              eventType: { type: "string" },
            },
          },
        },
      },
      description: "Validation result",
    },
    400: {
      content: {
        "application/json": {
          schema: { type: "object", properties: { error: { type: "string" } } },
        },
      },
      description: "Validation error",
    },
  },
  tags: ["Validation"],
});

const validateTaskRunFinishedRoute = createRoute({
  method: "post",
  path: "/validate/taskrun/finished",
  request: {
    body: {
      content: {
        "application/json": {
          schema: TaskRunFinishedEventSchema,
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
              valid: { type: "boolean" },
              eventType: { type: "string" },
            },
          },
        },
      },
      description: "Validation result",
    },
    400: {
      content: {
        "application/json": {
          schema: { type: "object", properties: { error: { type: "string" } } },
        },
      },
      description: "Validation error",
    },
  },
  tags: ["Validation"],
});

const validateCoreEventRoute = createRoute({
  method: "post",
  path: "/validate/event",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CoreCDEventSchema,
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
              valid: { type: "boolean" },
              eventType: { type: "string" },
            },
          },
        },
      },
      description: "Validation result",
    },
    400: {
      content: {
        "application/json": {
          schema: { type: "object", properties: { error: { type: "string" } } },
        },
      },
      description: "Validation error",
    },
  },
  tags: ["Validation"],
});

// Register validation endpoints
app.openapi(validatePipelineRunQueuedRoute, (c) => {
  const body = c.req.valid("json");
  return c.json({ valid: true, eventType: body.context.type }, 200) as any;
});

app.openapi(validatePipelineRunStartedRoute, (c) => {
  const body = c.req.valid("json");
  return c.json({ valid: true, eventType: body.context.type }, 200) as any;
});

app.openapi(validatePipelineRunFinishedRoute, (c) => {
  const body = c.req.valid("json");
  return c.json({ valid: true, eventType: body.context.type }, 200) as any;
});

app.openapi(validateTaskRunStartedRoute, (c) => {
  const body = c.req.valid("json");
  return c.json({ valid: true, eventType: body.context.type }, 200) as any;
});

app.openapi(validateTaskRunFinishedRoute, (c) => {
  const body = c.req.valid("json");
  return c.json({ valid: true, eventType: body.context.type }, 200) as any;
});

app.openapi(validateCoreEventRoute, (c) => {
  const body = c.req.valid("json");
  return c.json({ valid: true, eventType: body.context.type }, 200) as any;
});

// Mount GitHub adapter routes
app.route("/adapters/github", githubRoutes);

// Root endpoint with API information
app.get("/", (c) => {
  return c.json({
    name: "CD Events Adapter API",
    version: "1.0.0",
    description: "API for CD Events schema validation and documentation",
    documentation: {
      openapi: "/openapi.json",
      swagger: "/docs",
    },
    endpoints: {
      health: "/health",
      documentation: "/docs",
      openapi_spec: "/openapi.json",
      adapters: {
        github: "/adapters/github/info",
      },
      validation: {
        pipelineRun: {
          queued: "/validate/pipelinerun/queued",
          started: "/validate/pipelinerun/started",
          finished: "/validate/pipelinerun/finished",
        },
        taskRun: {
          started: "/validate/taskrun/started",
          finished: "/validate/taskrun/finished",
        },
        generic: "/validate/event",
      },
    },
    supported_events: {
      pipelineRun: ["queued", "started", "finished"],
      taskRun: ["started", "finished"],
    },
    supported_adapters: {
      github: {
        name: "GitHub Webhooks",
        version: "1.0.0",
        supported_events: [
          "workflow_job.queued",
          "workflow_job.waiting",
          "workflow_job.in_progress",
          "workflow_job.completed",
        ],
        base_path: "/adapters/github",
      },
    },
    specification: {
      version: "0.4.1",
      url: "https://cdevents.dev",
    },
  });
});

export default app;
