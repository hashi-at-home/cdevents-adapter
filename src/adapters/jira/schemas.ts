import { z } from '@hono/zod-openapi';

// Avatar URLs schema
const AvatarUrlsSchema = z
  .object({
    '48x48': z.string(),
    '24x24': z.string(),
    '16x16': z.string(),
    '32x32': z.string(),
  })
  .openapi('JiraAvatarUrls', {
    description: 'Jira user avatar URLs',
  });

// User schema (for assignee, creator, reporter)
export const JiraUserSchema = z
  .object({
    self: z.string(),
    name: z.string(),
    key: z.string(),
    accountId: z.string().nullable().optional(),
    emailAddress: z.string(),
    avatarUrls: AvatarUrlsSchema,
    displayName: z.string(),
    active: z.boolean(),
    timeZone: z.string(),
    groups: z.unknown().nullable().optional(),
    locale: z.string().nullable().optional(),
  })
  .openapi('JiraUser', {
    description: 'Jira user information',
  });

// Status category schema
const StatusCategorySchema = z
  .object({
    self: z.string().optional(),
    id: z.number(),
    key: z.string(),
    colorName: z.string(),
    name: z.string(),
  })
  .openapi('JiraStatusCategory', {
    description: 'Jira status category information',
  });

// Status schema
export const JiraStatusSchema = z
  .object({
    self: z.string(),
    description: z.string(),
    iconUrl: z.string(),
    name: z.string(),
    id: z.number(),
    statusCategory: StatusCategorySchema,
  })
  .openapi('JiraStatus', {
    description: 'Jira issue status information',
  });

// Issue type schema
export const JiraIssueTypeSchema = z
  .object({
    self: z.string(),
    id: z.number(),
    description: z.string(),
    iconUrl: z.string(),
    name: z.string(),
    subtask: z.boolean(),
    fields: z.unknown().nullable(),
    statuses: z.array(z.unknown()),
    namedValue: z.string(),
  })
  .openapi('JiraIssueType', {
    description: 'Jira issue type information',
  });

// Project schema
export const JiraProjectSchema = z
  .object({
    self: z.string(),
    id: z.number(),
    key: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
    avatarUrls: AvatarUrlsSchema,
    issuetypes: z.unknown().nullable(),
    projectCategory: z.unknown().nullable(),
    email: z.string().nullable().optional(),
    lead: z.unknown().nullable(),
    components: z.unknown().nullable(),
    versions: z.unknown().nullable(),
    projectTypeKey: z.string(),
    simplified: z.boolean(),
  })
  .openapi('JiraProject', {
    description: 'Jira project information',
  });

// Progress schema
const ProgressSchema = z
  .object({
    progress: z.number(),
    total: z.number(),
  })
  .openapi('JiraProgress', {
    description: 'Jira progress information',
  });

// Votes schema
const VotesSchema = z
  .object({
    self: z.string(),
    votes: z.number(),
    hasVoted: z.boolean(),
  })
  .openapi('JiraVotes', {
    description: 'Jira issue votes information',
  });

// Watches schema
const WatchesSchema = z
  .object({
    self: z.string(),
    watchCount: z.number(),
    isWatching: z.boolean(),
  })
  .openapi('JiraWatches', {
    description: 'Jira issue watches information',
  });

// Change item for tracking what changed in an issue
export const JiraChangeItemSchema = z
  .object({
    field: z.string(),
    fieldtype: z.string(),
    from: z.string().nullable(),
    fromString: z.string().nullable(),
    to: z.string().nullable(),
    toString: z.string().nullable(),
  })
  .openapi('JiraChangeItem', {
    description: 'Individual change item in Jira issue changelog',
  });

// Changelog history entry
const ChangeHistorySchema = z
  .object({
    id: z.string(),
    author: JiraUserSchema,
    created: z.string(),
    items: z.array(JiraChangeItemSchema),
  })
  .openapi('JiraChangeHistory', {
    description: 'Jira issue change history entry',
  });

// Changelog schema
const ChangelogSchema = z
  .object({
    startAt: z.number(),
    maxResults: z.number(),
    total: z.number(),
    histories: z.array(ChangeHistorySchema).nullable(),
  })
  .openapi('JiraChangelog', {
    description: 'Jira issue changelog',
  });

// Fields schema - this contains all the issue fields
const FieldsSchema = z
  .object({
    // Core fields
    self: z.string().optional(),
    lastViewed: z.string().nullable().optional(),
    fixVersions: z.array(z.unknown()),
    resolution: z.unknown().nullable(),
    versions: z.array(z.unknown()),
    issuelinks: z.array(z.unknown()),
    assignee: JiraUserSchema.nullable(),
    status: JiraStatusSchema,
    components: z.array(z.unknown()),
    archiveddate: z.unknown().nullable(),
    aggregatetimeoriginalestimate: z.unknown().nullable(),
    timeestimate: z.unknown().nullable(),
    aggregatetimeestimate: z.unknown().nullable(),
    creator: JiraUserSchema,
    subtasks: z.array(z.unknown()),
    reporter: JiraUserSchema,
    aggregateprogress: ProgressSchema,
    progress: ProgressSchema,
    votes: VotesSchema,
    archivedby: z.unknown().nullable(),
    issuetype: JiraIssueTypeSchema,
    timespent: z.unknown().nullable(),
    project: JiraProjectSchema,
    aggregatetimespent: z.unknown().nullable(),
    resolutiondate: z.unknown().nullable(),
    workratio: z.number(),
    watches: WatchesSchema,
    created: z.number(),
    updated: z.number(),
    timeoriginalestimate: z.unknown().nullable(),
    description: z.string(),
    summary: z.string(),
    environment: z.unknown().nullable(),
    duedate: z.string().nullable(),
  })
  .catchall(z.unknown().nullable())
  .openapi('JiraIssueFields', {
    description: 'Jira issue fields including custom fields',
  });

// Main Jira Issue schema
export const JiraIssueSchema = z
  .object({
    self: z.string(),
    id: z.number(),
    key: z.string(),
    changelog: ChangelogSchema,
    fields: FieldsSchema,
    renderedFields: z.object({}).catchall(z.unknown()).optional(),
  })
  .openapi('JiraIssue', {
    description: 'Jira issue information',
  });

// Webhook event types that Jira can send
export const JiraWebhookEventType = z.enum([
  'jira:issue_created',
  'jira:issue_updated',
  'jira:issue_deleted',
  'comment_created',
  'comment_updated',
  'comment_deleted',
  'issue_property_set',
  'issue_property_deleted',
  'worklog_created',
  'worklog_updated',
  'worklog_deleted',
  'project_created',
  'project_updated',
  'project_deleted',
  'version_created',
  'version_updated',
  'version_deleted',
  'version_released',
  'version_unreleased',
  'component_created',
  'component_updated',
  'component_deleted',
]);

// Comment schema for comment events
const JiraCommentSchema = z
  .object({
    self: z.string(),
    id: z.string(),
    author: JiraUserSchema,
    body: z.string(),
    created: z.string(),
    updated: z.string(),
    visibility: z
      .object({
        type: z.string(),
        value: z.string(),
      })
      .nullable()
      .optional(),
  })
  .openapi('JiraComment', {
    description: 'Jira issue comment',
  });

// Worklog schema for worklog events
const JiraWorklogSchema = z
  .object({
    self: z.string(),
    id: z.string(),
    author: JiraUserSchema,
    comment: z.string().nullable().optional(),
    created: z.string(),
    updated: z.string(),
    started: z.string(),
    timeSpent: z.string(),
    timeSpentSeconds: z.number(),
    visibility: z
      .object({
        type: z.string(),
        value: z.string(),
      })
      .nullable()
      .optional(),
  })
  .openapi('JiraWorklog', {
    description: 'Jira issue worklog entry',
  });

// Base webhook event schema
export const JiraWebhookEventSchema = z
  .object({
    timestamp: z.number(),
    webhookEvent: JiraWebhookEventType,
    user: JiraUserSchema,
    issue: JiraIssueSchema,
    comment: JiraCommentSchema.optional(),
    worklog: JiraWorklogSchema.optional(),
    changelog: z
      .object({
        id: z.string(),
        items: z.array(JiraChangeItemSchema),
      })
      .optional(),
  })
  .openapi('JiraWebhookEvent', {
    description: 'Base Jira webhook event payload',
  });

// Issue event schemas
export const JiraIssueCreatedWebhookSchema = JiraWebhookEventSchema.extend({
  webhookEvent: z.literal('jira:issue_created'),
}).openapi('JiraIssueCreatedWebhook', {
  description: 'Jira issue created webhook payload',
});

export const JiraIssueUpdatedWebhookSchema = JiraWebhookEventSchema.extend({
  webhookEvent: z.literal('jira:issue_updated'),
  issue_event_type_name: z.string().optional(),
  changelog: z
    .object({
      id: z.string(),
      items: z.array(JiraChangeItemSchema),
    })
    .optional(),
}).openapi('JiraIssueUpdatedWebhook', {
  description: 'Jira issue updated webhook payload',
});

export const JiraIssueDeletedWebhookSchema = JiraWebhookEventSchema.extend({
  webhookEvent: z.literal('jira:issue_deleted'),
}).openapi('JiraIssueDeletedWebhook', {
  description: 'Jira issue deleted webhook payload',
});

// Comment event schemas
export const JiraCommentCreatedWebhookSchema = JiraWebhookEventSchema.extend({
  webhookEvent: z.literal('comment_created'),
  comment: JiraCommentSchema,
}).openapi('JiraCommentCreatedWebhook', {
  description: 'Jira comment created webhook payload',
});

export const JiraCommentUpdatedWebhookSchema = JiraWebhookEventSchema.extend({
  webhookEvent: z.literal('comment_updated'),
  comment: JiraCommentSchema,
}).openapi('JiraCommentUpdatedWebhook', {
  description: 'Jira comment updated webhook payload',
});

export const JiraCommentDeletedWebhookSchema = JiraWebhookEventSchema.extend({
  webhookEvent: z.literal('comment_deleted'),
  comment: JiraCommentSchema,
}).openapi('JiraCommentDeletedWebhook', {
  description: 'Jira comment deleted webhook payload',
});

// Worklog event schemas
export const JiraWorklogCreatedWebhookSchema = JiraWebhookEventSchema.extend({
  webhookEvent: z.literal('worklog_created'),
  worklog: JiraWorklogSchema,
}).openapi('JiraWorklogCreatedWebhook', {
  description: 'Jira worklog created webhook payload',
});

export const JiraWorklogUpdatedWebhookSchema = JiraWebhookEventSchema.extend({
  webhookEvent: z.literal('worklog_updated'),
  worklog: JiraWorklogSchema,
}).openapi('JiraWorklogUpdatedWebhook', {
  description: 'Jira worklog updated webhook payload',
});

export const JiraWorklogDeletedWebhookSchema = JiraWebhookEventSchema.extend({
  webhookEvent: z.literal('worklog_deleted'),
  worklog: JiraWorklogSchema,
}).openapi('JiraWorklogDeletedWebhook', {
  description: 'Jira worklog deleted webhook payload',
});

// Generic Jira webhook schema for unknown events
export const JiraGenericWebhookSchema = z
  .object({
    timestamp: z.number().optional(),
    webhookEvent: z.string(),
    user: JiraUserSchema.optional(),
    issue: JiraIssueSchema.optional(),
    comment: JiraCommentSchema.optional(),
    worklog: JiraWorklogSchema.optional(),
    changelog: z
      .object({
        id: z.string(),
        items: z.array(JiraChangeItemSchema),
      })
      .optional(),
  })
  .catchall(z.unknown())
  .openapi('JiraGenericWebhook', {
    description: 'Generic Jira webhook payload for unknown event types',
  });

// Export types
export type JiraUser = z.infer<typeof JiraUserSchema>;
export type JiraStatus = z.infer<typeof JiraStatusSchema>;
export type JiraIssueType = z.infer<typeof JiraIssueTypeSchema>;
export type JiraProject = z.infer<typeof JiraProjectSchema>;
export type JiraIssue = z.infer<typeof JiraIssueSchema>;
export type JiraChangeItem = z.infer<typeof JiraChangeItemSchema>;
export type JiraWebhookEventType = z.infer<typeof JiraWebhookEventType>;

export type JiraWebhookEvent = z.infer<typeof JiraWebhookEventSchema>;
export type JiraIssueCreatedWebhook = z.infer<typeof JiraIssueCreatedWebhookSchema>;
export type JiraIssueUpdatedWebhook = z.infer<typeof JiraIssueUpdatedWebhookSchema>;
export type JiraIssueDeletedWebhook = z.infer<typeof JiraIssueDeletedWebhookSchema>;
export type JiraCommentCreatedWebhook = z.infer<typeof JiraCommentCreatedWebhookSchema>;
export type JiraCommentUpdatedWebhook = z.infer<typeof JiraCommentUpdatedWebhookSchema>;
export type JiraCommentDeletedWebhook = z.infer<typeof JiraCommentDeletedWebhookSchema>;
export type JiraWorklogCreatedWebhook = z.infer<typeof JiraWorklogCreatedWebhookSchema>;
export type JiraWorklogUpdatedWebhook = z.infer<typeof JiraWorklogUpdatedWebhookSchema>;
export type JiraWorklogDeletedWebhook = z.infer<typeof JiraWorklogDeletedWebhookSchema>;
export type JiraGenericWebhook = z.infer<typeof JiraGenericWebhookSchema>;

// Priority constants for common Jira priorities
export const JIRA_PRIORITIES = {
  BLOCKER: 'Blocker',
  CRITICAL: 'Critical',
  MAJOR: 'Major',
  MINOR: 'Minor',
  TRIVIAL: 'Trivial',
  HIGHEST: 'Highest',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  LOWEST: 'Lowest',
} as const;

// Status constants for common Jira statuses
export const JIRA_STATUSES = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  REOPENED: 'Reopened',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  TODO: 'To Do',
  DONE: 'Done',
  SELECTED_FOR_DEVELOPMENT: 'Selected for Development',
  IN_REVIEW: 'In Review',
  READY_FOR_TEST: 'Ready for Test',
  TESTING: 'Testing',
  READY_FOR_DEPLOY: 'Ready for Deploy',
} as const;

// Utility functions for event validation
export function validateJiraWebhookEvent(payload: unknown): JiraWebhookEvent {
  return JiraWebhookEventSchema.parse(payload);
}

export function safeValidateJiraWebhookEvent(payload: unknown): {
  success: boolean;
  data?: JiraWebhookEvent;
  error?: z.ZodError;
} {
  const result = JiraWebhookEventSchema.safeParse(payload);
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

// Event type detection utilities
export function isIssueEvent(webhookEvent: string): boolean {
  return ['jira:issue_created', 'jira:issue_updated', 'jira:issue_deleted'].includes(webhookEvent);
}

export function isCommentEvent(webhookEvent: string): boolean {
  return ['comment_created', 'comment_updated', 'comment_deleted'].includes(webhookEvent);
}

export function isWorklogEvent(webhookEvent: string): boolean {
  return ['worklog_created', 'worklog_updated', 'worklog_deleted'].includes(webhookEvent);
}

// Helper to extract webhook event type from headers
export function extractJiraWebhookEventType(headers: Headers): JiraWebhookEventType | string | null {
  const eventType =
    headers.get('x-atlassian-webhook-identifier') ||
    headers.get('x-event-key') ||
    headers.get('x-jira-webhook-id');

  if (!eventType) return null;

  const result = JiraWebhookEventType.safeParse(eventType);
  return result.success ? result.data : eventType;
}

// Utility functions for changelog analysis
export function getStatusChanges(changelog?: { items: JiraChangeItem[] }): JiraChangeItem[] {
  if (!changelog) return [];
  return changelog.items.filter(item => item.field === 'status');
}

export function getAssigneeChanges(changelog?: { items: JiraChangeItem[] }): JiraChangeItem[] {
  if (!changelog) return [];
  return changelog.items.filter(item => item.field === 'assignee');
}

export function wasAssigned(changelog?: { items: JiraChangeItem[] }): boolean {
  const assigneeChanges = getAssigneeChanges(changelog);
  return assigneeChanges.some(change => change.from === null && change.to !== null);
}

export function wasUnassigned(changelog?: { items: JiraChangeItem[] }): boolean {
  const assigneeChanges = getAssigneeChanges(changelog);
  return assigneeChanges.some(change => change.from !== null && change.to === null);
}

export function movedToStatus(changelog: { items: JiraChangeItem[] } | undefined, statusName: string): boolean {
  const statusChanges = getStatusChanges(changelog);
  return statusChanges.some(change => change.toString === statusName);
}

export function movedFromStatus(changelog: { items: JiraChangeItem[] } | undefined, statusName: string): boolean {
  const statusChanges = getStatusChanges(changelog);
  return statusChanges.some(change => change.fromString === statusName);
}
