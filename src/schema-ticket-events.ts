import { z } from '@hono/zod-openapi';
import {
  CDEventSchema,
  CDEventContext,
  CDEventContextSchema,
  CDEventSubjectSchema,
  SubjectTypeEnum,
  UriReferenceSchema,
} from './schemas';
// ticket events
//
// // Ticket Event Schemas
//
// ticket content common to all
export const TicketClosedContentSchema = z
  .object({
    summary: z.string().openapi({
      description: 'Summary provided on the ticket',
      example: 'Implement el featuro',
    }),
    ticketType: z.string().optional().openapi({
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

export const TicketContentSchema = z.object({
  summary: z.string().openapi({
    description: 'Summary provided on the ticket',
    example: 'Implement feature xyz',
  }),
  ticketType: z.string().optional().openapi({
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
  // updatedBy: z.string().optional().openapi({
  //   description: 'The ticket updater',
  //   example: 'Bob',
  // }),
});

// dev.cdevents.ops events
// ticket events - incidents not supported yet
export const TicketCreatedSubjectSchema = CDEventSubjectSchema.extend({
  type: z.literal('ticketCreated').optional(),
  content: TicketContentSchema,
}).openapi({
  description: 'Subject of a ticket created event',
});

export const TicketUpdatedSubjectSchema = CDEventSubjectSchema.extend({
  type: z.literal('ticket').optional(),
  content: TicketContentSchema,
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

// ticket created Event
export const createTicketCreatedEvent = (
  contextId: string,
  subjectId: string,
  timestamp: string,
  source: string,
  creator: string,
  summary: string,
  uri: string,
  ticketType?: string,
  group?: string,
  assignees?: string[],
  priority?: string,
  labels?: string[],
  milestone?: string
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
      summary,
      creator,
      uri,
      ...(ticketType && { ticketType }),
      ...(group && { group }),
      ...(assignees && assignees.length > 0 && { assignees }),
      ...(priority && { priority }),
      ...(labels && labels.length > 0 && { labels }),
      ...(milestone && { milestone }),
    },
  },
});

// ticketUpdated Event
export const createTicketUpdatedEvent = (
  contextId: string,
  subjectId: string,
  source: string,
  timestamp: string,
  creator: string,
  summary: string,
  uri: string,
  ticketType?: string | undefined,
  assignees?: string[],
  priority?: string,
  labels?: Array<string>,
  milestone?: string
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
      summary,
      creator,
      uri,
      ...(ticketType && { ticketType }),
      ...(assignees && assignees.length > 0 && { assignees }),
      ...(priority && { priority }),
      ...(labels && labels.length > 0 && { labels }),
      ...(milestone && { milestone }),
    },
  },
});

export const createTicketClosedEvent = (
  contextId: string,
  subjectId: string,
  source: string,
  timestamp: string,
  summary: string,
  creator: string,
  uri: string,
  resolution: 'Completed' | 'Abandoned' | 'Closed' | 'Rejected',
  ticketType?: string | undefined,
  assignees?: string[],
  priority?: string,
  labels?: string[],
  milestone?: string,
  updatedBy?: string
): TicketClosedEvent => ({
  context: {
    specVersion: '0.4.1',
    id: contextId,
    source,
    timestamp,
    type: 'dev.cdevents.ticket.closed.0.2.0',
  },
  subject: {
    id: subjectId,
    type: 'ticketClosed',
    content: {
      summary,
      creator,
      uri,
      resolution,
      ...(ticketType && { ticketType }),
      ...(assignees && { assignees }),
      ...(priority && { priority }),
      ...(labels && { labels }),
      ...(milestone && { milestone }),
      ...(updatedBy && { updatedBy }),
    },
  },
});

// Union type for all core events
export const TicketCDEventSchema = z
  .union([
    TicketCreatedEventSchema,
    TicketUpdatedEventSchema,
    TicketClosedEventSchema,
  ])
  .openapi('CoreCDEvent', {
    description: 'Any of the core CD Events supported by this adapter',
  });

export type TicketCreatedEvent = z.infer<typeof TicketCreatedEventSchema>;
export type TicketUpdatedEvent = z.infer<typeof TicketUpdatedEventSchema>;
export type TicketClosedEvent = z.infer<typeof TicketClosedEventSchema>;
