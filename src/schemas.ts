import { z } from '@hono/zod-openapi';

// Common types and enums
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
export const OutcomeEnum = z.enum(['success', 'error', 'failure']).openapi({
  description: 'The outcome status of an operation',
  example: 'success',
});
export type Outcome = z.infer<typeof OutcomeEnum>;
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
