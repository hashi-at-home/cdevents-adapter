import { z } from '@hono/zod-openapi';
import {
  CDEventContextSchema,
  CDEventSubjectSchema,
  CDEvent,
  CDEventSchema,
  CDEventContext,
  LinkFromSchema,
  UriSchema,
  OutcomeEnum,
  Outcome,
  LinkKindEnum,
  LinkSchema,
  SubjectReferenceSchema,
  LinkTargetSchema,
  SubjectTypeEnum,
  LinkTypeEnum,
  TimestampSchema,
  UriReferenceSchema,
  SubjectReference,
  SubjectType,
} from './schemas';

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

// Union type for all core events
export const CoreCDEventSchema = z
  .union([
    // core events
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
