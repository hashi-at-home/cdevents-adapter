import { z } from '@hono/zod-openapi';

// Common types and enums
export const OutcomeEnum = z.enum(['success', 'error', 'failure']).openapi({
  description: 'The outcome status of an operation',
  example: 'success',
});
export type Outcome = z.infer<typeof OutcomeEnum>;

export const SubjectTypeEnum = z
  .enum(['pipelineRun', 'taskRun', 'ticket'])
  .openapi({
    description: 'The type of subject in a CD Event',
    example: 'pipelineRun',
  });
export type SubjectType = z.infer<typeof SubjectTypeEnum>;

export const LinkTypeEnum = z.enum(['PATH', 'RELATION', 'END']).openapi({
  description: 'Type of link between CD Events',
  example: 'RELATION',
});

export const LinkKindEnum = z
  .enum(['TRIGGER', 'COMPOSITION', 'DEPENDENCY'])
  .openapi({
    description: 'Kind of relationship between CD Events',
    example: 'TRIGGER',
  });

// Base schemas for common structures
export const TimestampSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/)
  .openapi({
    description: 'RFC 3339 formatted timestamp',
    example: '2023-10-01T12:00:00.000Z',
    format: 'date-time',
  });

export const UriReferenceSchema = z.string().trim().min(1).openapi({
  description: 'URI reference as per RFC 3986',
  example: 'https://example.com/pipeline/123',
});

export const UriSchema = z.string().url().openapi({
  description: 'Full URI as per RFC 3986',
  example: 'https://example.com/pipeline/123',
  format: 'uri',
});

// Link schemas for context
export const LinkTargetSchema = z
  .object({
    context_id: z.string().uuid().openapi({
      description: 'UUID of the target context',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
  })
  .openapi('LinkTarget');

export const LinkFromSchema = z
  .object({
    context_id: z.string().uuid().openapi({
      description: 'UUID of the source context',
      example: '550e8400-e29b-41d4-a716-446655440001',
    }),
  })
  .openapi('LinkFrom');

export const LinkSchema = z
  .object({
    link_type: LinkTypeEnum,
    link_kind: LinkKindEnum.optional(),
    target: LinkTargetSchema.optional(),
    from: LinkFromSchema.optional(),
  })
  .openapi('Link', {
    description: 'Link between CD Events that establishes relationships',
  });

// CDEVent Context Schema.
// See specification at https://github.com/cdevents/spec/blob/v0.5.0/spec.md#cdevent-context
export const CDEventContextSchema = z
  .object({
    specVersion: z.string().min(1).openapi({
      description: 'Version of the CD Events specification',
      example: '0.4.1',
    }),
    id: z.string().min(1).openapi({
      description: 'Unique identifier for this event',
      example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    source: UriReferenceSchema.openapi({
      description: 'Source of the event',
    }),
    type: z.string().min(1).openapi({
      description: 'Event type following CD Events specification',
      example: 'dev.cdevents.pipelinerun.started.0.2.0',
    }),
    timestamp: TimestampSchema,
    schemaUri: UriSchema.optional().openapi({
      description: 'URI to the schema definition for this event',
    }),
    chain_id: z.string().uuid().optional().openapi({
      description: 'UUID that groups events in a chain',
      example: '550e8400-e29b-41d4-a716-446655440002',
    }),
    links: z.array(LinkSchema).optional().openapi({
      description: 'Links to other related events',
    }),
  })
  .openapi('CDEventContext', {
    description: 'Context information for a CD Event',
  });

export type CDEventContext = z.infer<typeof CDEventContextSchema>;

// Subject reference schema (for cross-references between subjects)
export const SubjectReferenceSchema = z
  .object({
    id: z.string().min(1).openapi({
      description: 'Identifier of the referenced subject',
      example: 'pipeline-run-123',
    }),
    source: UriReferenceSchema.optional().openapi({
      description: 'Source of the referenced subject',
    }),
  })
  .openapi('SubjectReference', {
    description: 'Reference to another CD Event subject',
  });

export type SubjectReference = z.infer<typeof SubjectReferenceSchema>;

// PipelineRun subject content schemas
export const PipelineRunContentSchema = z
  .object({
    pipelineName: z.string().optional().openapi({
      description: 'Name of the pipeline',
      example: 'build-and-test-pipeline',
    }),
    url: UriSchema.optional().openapi({
      description: 'URL to view the pipeline execution',
    }),
    outcome: OutcomeEnum.optional(),
    errors: z.string().optional().openapi({
      description: 'Error message if the pipeline failed',
      example: 'Build failed due to test failures',
    }),
  })
  .openapi('PipelineRunContent');

export const PipelineRunQueuedContentSchema = z
  .object({
    pipelineName: z.string().optional().openapi({
      description: 'Name of the pipeline',
      example: 'build-and-test-pipeline',
    }),
    url: UriSchema.optional().openapi({
      description: 'URL to view the pipeline execution',
    }),
  })
  .openapi('PipelineRunQueuedContent');

export const PipelineRunStartedContentSchema = z
  .object({
    pipelineName: z.string().optional().openapi({
      description: 'Name of the pipeline',
      example: 'build-and-test-pipeline',
    }),
    url: UriSchema.optional().openapi({
      description: 'URL to view the pipeline execution',
    }),
  })
  .openapi('PipelineRunStartedContent');

export const PipelineRunFinishedContentSchema = z
  .object({
    pipelineName: z.string().optional().openapi({
      description: 'Name of the pipeline',
      example: 'build-and-test-pipeline',
    }),
    url: UriSchema.optional().openapi({
      description: 'URL to view the pipeline execution',
    }),
    outcome: OutcomeEnum.optional(),
    errors: z.string().optional().openapi({
      description: 'Error message if the pipeline failed',
      example: 'Build failed due to test failures',
    }),
  })
  .openapi('PipelineRunFinishedContent');

// TaskRun subject content schemas
export const TaskRunContentSchema = z
  .object({
    taskName: z.string().optional().openapi({
      description: 'Name of the task',
      example: 'unit-tests',
    }),
    pipelineRun: SubjectReferenceSchema.optional(),
    url: UriSchema.optional().openapi({
      description: 'URL to view the task execution',
    }),
    outcome: OutcomeEnum.optional(),
    errors: z.string().optional().openapi({
      description: 'Error message if the task failed',
      example: 'Test suite failed with 3 failing tests',
    }),
  })
  .openapi('TaskRunContent');

export const TaskRunStartedContentSchema = z
  .object({
    taskName: z.string().optional().openapi({
      description: 'Name of the task',
      example: 'unit-tests',
    }),
    pipelineRun: SubjectReferenceSchema.optional(),
    url: UriSchema.optional().openapi({
      description: 'URL to view the task execution',
    }),
  })
  .openapi('TaskRunStartedContent');

export const TaskRunFinishedContentSchema = z
  .object({
    taskName: z.string().optional().openapi({
      description: 'Name of the task',
      example: 'unit-tests',
    }),
    pipelineRun: SubjectReferenceSchema.optional(),
    url: UriSchema.optional().openapi({
      description: 'URL to view the task execution',
    }),
    outcome: OutcomeEnum.optional(),
    errors: z.string().optional().openapi({
      description: 'Error message if the task failed',
      example: 'Test suite failed with 3 failing tests',
    }),
  })
  .openapi('TaskRunFinishedContent');

// ticket events
export const TicketContentSchema = z.object({
  summary: z.string().openapi({
    description: 'Summary provided on the ticket',
    example: 'Implement feature xyz',
  }),
  ticketType: z
    .enum(['Bug', 'Epic', 'Story', 'Task', 'Sub-Task'])
    .optional()
    .openapi({
      description: 'The type of ticket in the event',
      example: 'Bug',
    }),
  group: z.string().optional().openapi({
    description: 'Group or project the ticket is assigned to',
    example: 'DevOps',
  }),
  creator: z.string().openapi({
    description: 'The ticket author',
    example: 'Boss',
  }),
  assignees: z.array(z.string()).optional().openapi({
    description: 'The ticket assignee',
    example: 'Dev',
  }),
  priority: z.string().optional().openapi({
    description: 'The ticket priority',
    example: 'High',
  }),
  labels: z
    .array(z.string())
    .optional()
    .openapi({
      description: 'The ticket labels',
      example: ['bug', 'urgent'],
    }),
  milestone: z.string().optional().openapi({
    description: 'The ticket milestone',
    example: 'Release 1.0',
  }),
  uri: z.url().openapi({
    description: 'The ticket URI',
    example: 'https://example.com/tickets/123',
  }),
  updatedBy: z.string().optional().openapi({
    description: 'The ticket updater',
    example: 'Bob',
  }),
});

// Generic subject schema
export const CDEventSubjectSchema = z
  .object({
    id: z.string().min(1).openapi({
      description: 'Identifier of the subject',
      example: 'pipeline-run-123',
    }),
    source: UriReferenceSchema.optional().openapi({
      description: 'Source of the subject',
    }),
    type: SubjectTypeEnum.optional(),
    content: z.record(z.string(), z.any()).openapi({
      description: 'Content specific to the subject type',
    }),
  })
  .openapi('CDEventSubject', {
    description: 'Subject of a CD Event',
  });

export type CDEventSubject = z.infer<typeof CDEventSubjectSchema>;

// Specific subject schemas for each event type
export const PipelineRunSubjectSchema = CDEventSubjectSchema.extend({
  type: z.literal('pipelineRun').optional(),
  content: PipelineRunContentSchema,
}).openapi('PipelineRunSubject');

export const PipelineRunQueuedSubjectSchema = CDEventSubjectSchema.extend({
  type: z.literal('pipelineRun').optional(),
  content: PipelineRunQueuedContentSchema,
}).openapi('PipelineRunQueuedSubject');

export const PipelineRunStartedSubjectSchema = CDEventSubjectSchema.extend({
  type: z.literal('pipelineRun').optional(),
  content: PipelineRunStartedContentSchema,
}).openapi('PipelineRunStartedSubject');

export const PipelineRunFinishedSubjectSchema = CDEventSubjectSchema.extend({
  type: z.literal('pipelineRun').optional(),
  content: PipelineRunFinishedContentSchema,
}).openapi('PipelineRunFinishedSubject');

export const TaskRunSubjectSchema = CDEventSubjectSchema.extend({
  type: z.literal('taskRun').optional(),
  content: TaskRunContentSchema,
}).openapi('TaskRunSubject');

export const TaskRunStartedSubjectSchema = CDEventSubjectSchema.extend({
  type: z.literal('taskRun').optional(),
  content: TaskRunStartedContentSchema,
}).openapi('TaskRunStartedSubject');

export const TaskRunFinishedSubjectSchema = CDEventSubjectSchema.extend({
  type: z.literal('taskRun').optional(),
  content: TaskRunFinishedContentSchema,
}).openapi('TaskRunFinishedSubject');

// dev.cdevents.ops events
// ticket events - incidents not supported yet
export const TicketCreatedSubjectSchema = CDEventSubjectSchema.extend({
  type: z.literal('ticketCreated').optional(),
  content: TicketContentSchema,
}).openapi({
  description: 'Subject of a ticket created event',
});

export const TicketUpdatedSubjectSchema = CDEventSubjectSchema.extend({
  type: z.literal('ticketUpdated').optional(),
  content: TicketContentSchema,
});

// Base CDEvent schema
export const CDEventSchema = z
  .object({
    context: CDEventContextSchema,
    subject: CDEventSubjectSchema,
    customData: z.any().optional().openapi({
      description: 'Custom data payload for the event',
    }),
    customDataContentType: z
      .string()
      .default('application/json')
      .optional()
      .openapi({
        description: 'Content type of the custom data',
        example: 'application/json',
      }),
  })
  .openapi('CDEvent', {
    description: 'A CD Event following the CD Events specification',
  });

export type CDEvent = z.infer<typeof CDEventSchema>;

// Specific event schemas
export const PipelineRunQueuedEventSchema = CDEventSchema.extend({
  context: CDEventContextSchema.extend({
    type: z.literal('dev.cdevents.pipelinerun.queued.0.2.0').openapi({
      description: 'Event type for pipeline run queued events',
    }),
  }),
  subject: PipelineRunQueuedSubjectSchema,
}).openapi('PipelineRunQueuedEvent', {
  description: 'Event emitted when a pipeline run is queued',
});

export const PipelineRunStartedEventSchema = CDEventSchema.extend({
  context: CDEventContextSchema.extend({
    type: z.literal('dev.cdevents.pipelinerun.started.0.2.0').openapi({
      description: 'Event type for pipeline run started events',
    }),
  }),
  subject: PipelineRunStartedSubjectSchema,
}).openapi('PipelineRunStartedEvent', {
  description: 'Event emitted when a pipeline run starts',
});

export const PipelineRunFinishedEventSchema = CDEventSchema.extend({
  context: CDEventContextSchema.extend({
    type: z.literal('dev.cdevents.pipelinerun.finished.0.2.0').openapi({
      description: 'Event type for pipeline run finished events',
    }),
  }),
  subject: PipelineRunFinishedSubjectSchema,
}).openapi('PipelineRunFinishedEvent', {
  description: 'Event emitted when a pipeline run finishes',
});

export const TaskRunStartedEventSchema = CDEventSchema.extend({
  context: CDEventContextSchema.extend({
    type: z.literal('dev.cdevents.taskrun.started.0.2.0').openapi({
      description: 'Event type for task run started events',
    }),
  }),
  subject: TaskRunStartedSubjectSchema,
}).openapi('TaskRunStartedEvent', {
  description: 'Event emitted when a task run starts',
});

export const TaskRunFinishedEventSchema = CDEventSchema.extend({
  context: CDEventContextSchema.extend({
    type: z.literal('dev.cdevents.taskrun.finished.0.2.0').openapi({
      description: 'Event type for task run finished events',
    }),
  }),
  subject: TaskRunFinishedSubjectSchema,
}).openapi('TaskRunFinishedEvent', {
  description: 'Event emitted when a task run finishes',
});

// Ticket Event Schemas
//
// ticket content common to all
export const TicketClosedContentSchema = z
  .object({
    summary: z.string().openapi({
      description: 'Summary provided on the ticket',
      example: 'Implement el featuro',
    }),
    ticketType: z
      .enum(['Bug', 'Feature', 'Epic', 'Story', 'Task', 'Sub-Task'])
      .optional()
      .openapi({
        description: 'The type of ticket',
        example: 'Bug',
      }),
    group: z.string().optional().openapi({
      description: 'The group the ticket belongs to',
      example: 'DevOps',
    }),
    creator: z.string().openapi({
      description: 'The creator of the ticket',
      example: 'Product Owner',
    }),
    assignees: z
      .array(z.string())
      .optional()
      .openapi({
        description: 'The assignees of the ticket',
        example: ['Engineer'],
      }),
    priority: z.string().optional().openapi({
      description: 'The priority of the ticket',
      example: 'High',
    }),
    labels: z
      .array(z.string())
      .optional()
      .openapi({
        description: 'The labels of the ticket',
        example: ['bug', 'urgent'],
      }),
    milestone: z.string().optional().openapi({
      description: 'The milestone of the ticket',
      example: 'Release xyz',
    }),
    uri: z.string().optional().openapi({
      description: 'The URI of the ticket',
      example: 'https://jira.your.org/ticket/123',
    }),
    resolution: z
      .enum(['Completed', 'Abandoned', 'Closed', 'Rejected'])
      .openapi({
        description: 'The resolution of the ticket',
        example: 'Closed',
      }),
  })
  .openapi('TicketClosedContent');

export const TicketClosedSubjectSchema = CDEventSubjectSchema.extend({
  type: z.literal('ticketClosed').optional(),
  content: TicketClosedContentSchema,
}).openapi('TicketClosedSubject', {
  description: 'Subject of a ticket closed event',
});

export const TicketCreatedEventSchema = CDEventSchema.extend({
  context: CDEventContextSchema.extend({
    type: z.literal('dev.cdevents.ticket.created.0.2.0').openapi({
      description: 'Event type for ticket created events',
    }),
  }),
  subject: TicketCreatedSubjectSchema,
}).openapi('TicketCreatedEvent', {
  description: 'Event emitted when a ticket is created',
});

export const TicketUpdatedEventSchema = CDEventSchema.extend({
  context: CDEventContextSchema.extend({
    type: z.literal('dev.cdevents.ticket.updated.0.2.0').openapi({
      description: 'Event type for ticket updated events',
    }),
  }),
  subject: TicketUpdatedSubjectSchema,
}).openapi('TicketUpdatedEvent', {
  description: 'Event emitted when a ticket is updated',
});

export const TicketClosedEventSchema = CDEventSchema.extend({
  context: CDEventContextSchema.extend({
    type: z.literal('dev.cdevents.ticket.closed.0.2.0').openapi({
      description: 'Event type for ticket closed events',
    }),
  }),
  subject: TicketClosedSubjectSchema,
}).openapi('TicketClosedEvent', {
  description: 'Event emitted when a ticket is closed',
});

// Union type for all core events
export const CoreCDEventSchema = z
  .union([
    PipelineRunQueuedEventSchema,
    PipelineRunStartedEventSchema,
    PipelineRunFinishedEventSchema,
    TaskRunStartedEventSchema,
    TaskRunFinishedEventSchema,
  ])
  .openapi('CoreCDEvent', {
    description: 'Any of the core CD Events supported by this adapter',
  });

// Inferred TypeScript types
export type PipelineRunQueuedEvent = z.infer<
  typeof PipelineRunQueuedEventSchema
>;
export type PipelineRunStartedEvent = z.infer<
  typeof PipelineRunStartedEventSchema
>;
export type PipelineRunFinishedEvent = z.infer<
  typeof PipelineRunFinishedEventSchema
>;
export type TaskRunStartedEvent = z.infer<typeof TaskRunStartedEventSchema>;
export type TaskRunFinishedEvent = z.infer<typeof TaskRunFinishedEventSchema>;

export type TicketCreatedEvent = z.infer<typeof TicketCreatedEventSchema>;
export type TicketUpdatedEvent = z.infer<typeof TicketUpdatedEventSchema>;
export type TicketClosedEvent = z.infer<typeof TicketClosedEventSchema>;

export type CoreCDEvent = z.infer<typeof CoreCDEventSchema>;

// Helper functions for creating events
export const createPipelineRunQueuedEvent = (
  contextId: string,
  source: string,
  timestamp: string,
  subjectId: string,
  pipelineName?: string,
  url?: string
): PipelineRunQueuedEvent => ({
  context: {
    specVersion: '0.4.1',
    id: contextId,
    source,
    type: 'dev.cdevents.pipelinerun.queued.0.2.0',
    timestamp,
  },
  subject: {
    id: subjectId,
    type: 'pipelineRun',
    content: {
      ...(pipelineName && { pipelineName }),
      ...(url && { url }),
    },
  },
});

export const createPipelineRunStartedEvent = (
  contextId: string,
  source: string,
  timestamp: string,
  subjectId: string,
  pipelineName?: string,
  url?: string
): PipelineRunStartedEvent => ({
  context: {
    specVersion: '0.4.1',
    id: contextId,
    source,
    type: 'dev.cdevents.pipelinerun.started.0.2.0',
    timestamp,
  },
  subject: {
    id: subjectId,
    type: 'pipelineRun',
    content: {
      ...(pipelineName && { pipelineName }),
      ...(url && { url }),
    },
  },
});

export const createPipelineRunFinishedEvent = (
  contextId: string,
  source: string,
  timestamp: string,
  subjectId: string,
  outcome?: Outcome,
  pipelineName?: string,
  url?: string,
  errors?: string
): PipelineRunFinishedEvent => ({
  context: {
    specVersion: '0.4.1',
    id: contextId,
    source,
    type: 'dev.cdevents.pipelinerun.finished.0.2.0',
    timestamp,
  },
  subject: {
    id: subjectId,
    type: 'pipelineRun',
    content: {
      ...(pipelineName && { pipelineName }),
      ...(url && { url }),
      ...(outcome && { outcome }),
      ...(errors && { errors }),
    },
  },
});

export const createTaskRunStartedEvent = (
  contextId: string,
  source: string,
  timestamp: string,
  subjectId: string,
  taskName?: string,
  pipelineRun?: SubjectReference,
  url?: string
): TaskRunStartedEvent => ({
  context: {
    specVersion: '0.4.1',
    id: contextId,
    source,
    type: 'dev.cdevents.taskrun.started.0.2.0',
    timestamp,
  },
  subject: {
    id: subjectId,
    type: 'taskRun',
    content: {
      ...(taskName && { taskName }),
      ...(pipelineRun && { pipelineRun }),
      ...(url && { url }),
    },
  },
});

export const createTaskRunFinishedEvent = (
  contextId: string,
  source: string,
  timestamp: string,
  subjectId: string,
  outcome?: Outcome,
  taskName?: string,
  pipelineRun?: SubjectReference,
  url?: string,
  errors?: string
): TaskRunFinishedEvent => ({
  context: {
    specVersion: '0.4.1',
    id: contextId,
    source,
    type: 'dev.cdevents.taskrun.finished.0.2.0',
    timestamp,
  },
  subject: {
    id: subjectId,
    type: 'taskRun',
    content: {
      ...(taskName && { taskName }),
      ...(pipelineRun && { pipelineRun }),
      ...(url && { url }),
      ...(outcome && { outcome }),
      ...(errors && { errors }),
    },
  },
});

// ticket created Event
export const createTicketCreatedEvent = (
  contextId: string,
  subjectId: string,
  timestamp: string,
  source: string,
  ticketType: string,
  creator: string,
  summary?: string,
  group?: string,
  assignee?: string,
  priority?: string,
  labels?: Array<string>,
  milestone?: string,
  uri?: string
): TicketCreatedEvent => ({
  context: {
    specVersion: '0.4.1',
    id: contextId,
    source,
    type: 'dev.cdevents.ticket.created.0.2.0',
    timestamp,
  },
  subject: {
    id: subjectId,
    type: 'ticketCreated',
    content: {
      ...(summary && { summary }),
      ...(ticketType && { ticketType }),
      ...(group && { group }),
      ...(creator && { creator }),
      ...(assignee && { assignee }),
      ...(priority && { priority }),
      ...(labels && { labels }),
      ...(milestone && { milestone }),
      ...(uri && { uri }),
    },
  },
});

// ticketUpdated Event
export const createTicketUpdatedEvent = (
  contextId: string,
  subjectId: string,
  source: string,
  timestamp: string,
  summary: string,
  creator: string,
  ticketType?: string,
  assignee?: string,
  priority?: string,
  labels?: Array<string>,
  milestone?: string,
  url?: string
): TicketUpdatedEvent => ({
  context: {
    specVersion: '0.4.1',
    id: contextId,
    source,
    timestamp,
    type: 'dev.cdevents.ticket.updated.0.2.0',
  },
  subject: {
    id: subjectId,
    source: source,
    content: {
      // ...(id && { subjectId }),
      ...(summary && { summary }),
      ...(ticketType && { ticketType }),
      ...(assignee && { assignee }),
      ...(priority && { priority }),
      ...(labels && { labels }),
      ...(milestone && { milestone }),
      ...(url && { url }),
      ...(creator && { creator }),
      ...(url && { url }),
    },
  },
});
