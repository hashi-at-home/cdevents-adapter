import { z } from '@hono/zod-openapi';
import { BaseAdapter, WebhookEventMetadata, AdapterUtils } from '../base';
import { getVersion } from '../../version';
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
  JiraWebhookEvent,
  JiraIssueCreatedWebhook,
  JiraIssueUpdatedWebhook,
  JiraIssueDeletedWebhook,
  JiraCommentCreatedWebhook,
  JiraCommentUpdatedWebhook,
  JiraCommentDeletedWebhook,
  JiraWorklogCreatedWebhook,
  JiraWorklogUpdatedWebhook,
  JiraWorklogDeletedWebhook,
  JiraGenericWebhook,
  getStatusChanges,
  movedToStatus,
  movedFromStatus,
  JIRA_STATUSES,
} from './schemas';
import {
  createPipelineRunQueuedEvent,
  createPipelineRunStartedEvent,
  createPipelineRunFinishedEvent,
  createTaskRunStartedEvent,
  createTaskRunFinishedEvent,
  Outcome,
} from '../../schemas';

export class JiraAdapter extends BaseAdapter {
  readonly name = 'jira';
  readonly version = getVersion();
  readonly supportedEvents = [
    'jira:issue_created',
    'jira:issue_updated',
    'jira:issue_deleted',
    'comment_created',
    'comment_updated',
    'comment_deleted',
    'worklog_created',
    'worklog_updated',
    'worklog_deleted',
  ];

  async transform(webhookData: any, eventType: string): Promise<any> {
    try {
      // Validate the event type is supported
      if (!this.isEventTypeSupported(eventType)) {
        throw new Error(`Unsupported event type: ${eventType}`);
      }

      // Parse the webhook data based on event type
      let parsedWebhook;
      switch (eventType) {
        case 'jira:issue_created':
          parsedWebhook = JiraIssueCreatedWebhookSchema.parse(webhookData);
          return this.transformIssueCreated(parsedWebhook);

        case 'jira:issue_updated':
          parsedWebhook = JiraIssueUpdatedWebhookSchema.parse(webhookData);
          return this.transformIssueUpdated(parsedWebhook);

        case 'jira:issue_deleted':
          parsedWebhook = JiraIssueDeletedWebhookSchema.parse(webhookData);
          return this.transformIssueDeleted(parsedWebhook);

        case 'comment_created':
          parsedWebhook = JiraCommentCreatedWebhookSchema.parse(webhookData);
          return this.transformCommentCreated(parsedWebhook);

        case 'comment_updated':
          parsedWebhook = JiraCommentUpdatedWebhookSchema.parse(webhookData);
          return this.transformCommentUpdated(parsedWebhook);

        case 'comment_deleted':
          parsedWebhook = JiraCommentDeletedWebhookSchema.parse(webhookData);
          return this.transformCommentDeleted(parsedWebhook);

        case 'worklog_created':
          parsedWebhook = JiraWorklogCreatedWebhookSchema.parse(webhookData);
          return this.transformWorklogCreated(parsedWebhook);

        case 'worklog_updated':
          parsedWebhook = JiraWorklogUpdatedWebhookSchema.parse(webhookData);
          return this.transformWorklogUpdated(parsedWebhook);

        case 'worklog_deleted':
          parsedWebhook = JiraWorklogDeletedWebhookSchema.parse(webhookData);
          return this.transformWorklogDeleted(parsedWebhook);

        default:
          // Try to parse as generic webhook
          parsedWebhook = JiraGenericWebhookSchema.parse(webhookData);
          return this.transformGenericEvent(parsedWebhook, eventType);
      }
    } catch (error) {
      throw new Error(
        `Failed to transform Jira webhook: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  getWebhookSchema(eventType: string): z.ZodSchema | null {
    switch (eventType) {
      case 'jira:issue_created':
        return JiraIssueCreatedWebhookSchema;
      case 'jira:issue_updated':
        return JiraIssueUpdatedWebhookSchema;
      case 'jira:issue_deleted':
        return JiraIssueDeletedWebhookSchema;
      case 'comment_created':
        return JiraCommentCreatedWebhookSchema;
      case 'comment_updated':
        return JiraCommentUpdatedWebhookSchema;
      case 'comment_deleted':
        return JiraCommentDeletedWebhookSchema;
      case 'worklog_created':
        return JiraWorklogCreatedWebhookSchema;
      case 'worklog_updated':
        return JiraWorklogUpdatedWebhookSchema;
      case 'worklog_deleted':
        return JiraWorklogDeletedWebhookSchema;
      default:
        return JiraGenericWebhookSchema;
    }
  }

  async validateWebhook(webhookData: any): Promise<boolean> {
    try {
      // Basic validation using the generic schema
      JiraWebhookEventSchema.parse(webhookData);
      return true;
    } catch (error) {
      return false;
    }
  }

  private transformIssueCreated(webhook: JiraIssueCreatedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);

    // Issue created maps to TaskRunStarted event
    const cdevent = createTaskRunStartedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      this.createSubjectId(webhook.issue),
      webhook.issue.fields.summary,
      undefined, // pipelineRun
      this.createIssueUrl(webhook.issue)
    );

    // Add Jira-specific custom data
    cdevent.customData = this.createJiraCustomData(webhook, 'issue_created');

    return cdevent;
  }

  private transformIssueUpdated(webhook: JiraIssueUpdatedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);

    // Check if this is a status transition
    const statusChanges = getStatusChanges(webhook.changelog);

    if (statusChanges.length > 0) {
      // This is a status change - determine the appropriate CD Event
      const latestStatusChange = statusChanges[statusChanges.length - 1];
      const newStatus = latestStatusChange.toString;
      const oldStatus = latestStatusChange.fromString;

      // Map status transitions to CD Events
      if (this.isQueuedStatus(newStatus)) {
        const cdevent = createPipelineRunQueuedEvent(
          metadata.eventId,
          metadata.source,
          metadata.timestamp,
          this.createSubjectId(webhook.issue),
          webhook.issue.fields.summary,
          this.createIssueUrl(webhook.issue)
        );
        cdevent.customData = this.createJiraCustomData(
          webhook,
          'status_change_queued'
        );
        return cdevent;
      }

      if (this.isInProgressStatus(newStatus)) {
        const cdevent = createPipelineRunStartedEvent(
          metadata.eventId,
          metadata.source,
          metadata.timestamp,
          this.createSubjectId(webhook.issue),
          webhook.issue.fields.summary,
          this.createIssueUrl(webhook.issue)
        );
        cdevent.customData = this.createJiraCustomData(
          webhook,
          'status_change_started'
        );
        return cdevent;
      }

      if (this.isCompletedStatus(newStatus)) {
        const outcome = this.mapJiraStatusToOutcome(newStatus);
        const cdevent = createPipelineRunFinishedEvent(
          metadata.eventId,
          metadata.source,
          metadata.timestamp,
          this.createSubjectId(webhook.issue),
          outcome,
          webhook.issue.fields.summary,
          this.createIssueUrl(webhook.issue),
          outcome === 'error' || outcome === 'failure'
            ? `Issue moved to ${newStatus}`
            : undefined
        );
        cdevent.customData = this.createJiraCustomData(
          webhook,
          'status_change_finished'
        );
        return cdevent;
      }

      // Generic status change - use TaskRunFinishedEvent
      const cdevent = createTaskRunFinishedEvent(
        metadata.eventId,
        metadata.source,
        metadata.timestamp,
        this.createSubjectId(webhook.issue),
        'success',
        webhook.issue.fields.summary,
        undefined, // pipelineRun
        this.createIssueUrl(webhook.issue)
      );
      cdevent.customData = this.createJiraCustomData(
        webhook,
        'status_change_generic'
      );
      return cdevent;
    }

    // Non-status change update - use TaskRunFinished event
    const cdevent = createTaskRunFinishedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      this.createSubjectId(webhook.issue),
      'success',
      webhook.issue.fields.summary,
      undefined, // pipelineRun
      this.createIssueUrl(webhook.issue)
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'issue_updated');
    return cdevent;
  }

  private transformIssueDeleted(webhook: JiraIssueDeletedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);

    // Issue deleted maps to PipelineRunFinished with error outcome
    const cdevent = createPipelineRunFinishedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      this.createSubjectId(webhook.issue),
      'error',
      webhook.issue.fields.summary,
      this.createIssueUrl(webhook.issue),
      'Issue was deleted'
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'issue_deleted');
    return cdevent;
  }

  private transformCommentCreated(webhook: JiraCommentCreatedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);

    // Comment events can be treated as task events
    const cdevent = createTaskRunStartedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      `${this.createSubjectId(webhook.issue)}-comment-${webhook.comment!.id}`,
      `Comment on ${webhook.issue.fields.summary}`,
      undefined, // pipelineRun
      this.createIssueUrl(webhook.issue)
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'comment_created');
    return cdevent;
  }

  private transformCommentUpdated(webhook: JiraCommentUpdatedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);

    const cdevent = createTaskRunFinishedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      `${this.createSubjectId(webhook.issue)}-comment-${webhook.comment!.id}`,
      'success',
      `Comment updated on ${webhook.issue.fields.summary}`,
      undefined, // pipelineRun
      this.createIssueUrl(webhook.issue)
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'comment_updated');
    return cdevent;
  }

  private transformCommentDeleted(webhook: JiraCommentDeletedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);

    const cdevent = createTaskRunFinishedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      `${this.createSubjectId(webhook.issue)}-comment-${webhook.comment!.id}`,
      'error',
      `Comment deleted from ${webhook.issue.fields.summary}`,
      undefined, // pipelineRun
      this.createIssueUrl(webhook.issue)
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'comment_deleted');
    return cdevent;
  }

  private transformWorklogCreated(webhook: JiraWorklogCreatedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);

    const cdevent = createTaskRunStartedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      `${this.createSubjectId(webhook.issue)}-worklog-${webhook.worklog!.id}`,
      `Work logged on ${webhook.issue.fields.summary}`,
      undefined, // pipelineRun
      this.createIssueUrl(webhook.issue)
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'worklog_created');
    return cdevent;
  }

  private transformWorklogUpdated(webhook: JiraWorklogUpdatedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);

    const cdevent = createTaskRunFinishedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      `${this.createSubjectId(webhook.issue)}-worklog-${webhook.worklog!.id}`,
      'success',
      `Worklog updated on ${webhook.issue.fields.summary}`,
      undefined, // pipelineRun
      this.createIssueUrl(webhook.issue)
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'worklog_updated');
    return cdevent;
  }

  private transformWorklogDeleted(webhook: JiraWorklogDeletedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);

    const cdevent = createTaskRunFinishedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      `${this.createSubjectId(webhook.issue)}-worklog-${webhook.worklog!.id}`,
      'error',
      `Worklog deleted from ${webhook.issue.fields.summary}`,
      undefined, // pipelineRun
      this.createIssueUrl(webhook.issue)
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'worklog_deleted');
    return cdevent;
  }

  private transformGenericEvent(
    webhook: JiraGenericWebhook,
    eventType: string
  ): any {
    const metadata = this.extractGenericJiraMetadata(webhook, eventType);

    // Generic events default to task events
    const cdevent = createTaskRunFinishedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      webhook.issue
        ? this.createSubjectId(webhook.issue)
        : `jira-${eventType}-${Date.now()}`,
      'success',
      webhook.issue?.fields.summary || `Jira ${eventType} event`,
      undefined, // pipelineRun
      webhook.issue ? this.createIssueUrl(webhook.issue) : undefined
    );

    cdevent.customData = {
      jira: {
        eventType,
        timestamp: webhook.timestamp,
        user: webhook.user,
        issue: webhook.issue
          ? {
              key: webhook.issue.key,
              id: webhook.issue.id,
              summary: webhook.issue.fields.summary,
              status: webhook.issue.fields.status.name,
              assignee: webhook.issue.fields.assignee?.displayName,
              project: {
                key: webhook.issue.fields.project.key,
                name: webhook.issue.fields.project.name,
              },
              issueType: webhook.issue.fields.issuetype.name,
            }
          : undefined,
        comment: webhook.comment,
        worklog: webhook.worklog,
        changelog: webhook.changelog,
      },
    };

    return cdevent;
  }

  private extractJiraMetadata(webhook: JiraWebhookEvent): WebhookEventMetadata {
    const baseMetadata = this.extractWebhookMetadata(webhook);

    return {
      ...baseMetadata,
      eventId: baseMetadata.eventId || this.generateEventId(),
      source: AdapterUtils.createSourceUri(
        'jira',
        webhook.issue.fields.project.key,
        webhook.issue.key
      ),
      eventType: webhook.webhookEvent,
      timestamp: new Date(webhook.timestamp).toISOString(),
    };
  }

  private extractGenericJiraMetadata(
    webhook: JiraGenericWebhook,
    eventType: string
  ): WebhookEventMetadata {
    const baseMetadata = this.extractWebhookMetadata(webhook);

    return {
      ...baseMetadata,
      eventId: baseMetadata.eventId || this.generateEventId(),
      source: webhook.issue
        ? AdapterUtils.createSourceUri(
            'jira',
            webhook.issue.fields.project.key,
            webhook.issue.key
          )
        : 'https://jira.com',
      eventType,
      timestamp: webhook.timestamp
        ? new Date(webhook.timestamp).toISOString()
        : new Date().toISOString(),
    };
  }

  private createSubjectId(issue: any): string {
    return `jira-issue-${issue.key}`;
  }

  private createIssueUrl(issue: any): string {
    // Extract base URL from issue self URL and create browse URL
    const selfUrl = issue.self;
    const baseUrl = selfUrl.substring(0, selfUrl.indexOf('/rest/api'));
    return `${baseUrl}/browse/${issue.key}`;
  }

  private createJiraCustomData(
    webhook: JiraWebhookEvent | any,
    eventContext: string
  ): any {
    return {
      jira: {
        eventType: webhook.webhookEvent,
        eventContext,
        timestamp: webhook.timestamp,
        user: {
          displayName: webhook.user.displayName,
          emailAddress: webhook.user.emailAddress,
          accountId: webhook.user.accountId,
        },
        issue: {
          key: webhook.issue.key,
          id: webhook.issue.id,
          summary: webhook.issue.fields.summary,
          description: webhook.issue.fields.description,
          status: {
            name: webhook.issue.fields.status.name,
            category: webhook.issue.fields.status.statusCategory.name,
            categoryKey: webhook.issue.fields.status.statusCategory.key,
          },
          assignee: webhook.issue.fields.assignee
            ? {
                displayName: webhook.issue.fields.assignee.displayName,
                emailAddress: webhook.issue.fields.assignee.emailAddress,
                accountId: webhook.issue.fields.assignee.accountId,
              }
            : null,
          reporter: {
            displayName: webhook.issue.fields.reporter.displayName,
            emailAddress: webhook.issue.fields.reporter.emailAddress,
            accountId: webhook.issue.fields.reporter.accountId,
          },
          creator: {
            displayName: webhook.issue.fields.creator.displayName,
            emailAddress: webhook.issue.fields.creator.emailAddress,
            accountId: webhook.issue.fields.creator.accountId,
          },
          project: {
            key: webhook.issue.fields.project.key,
            name: webhook.issue.fields.project.name,
            id: webhook.issue.fields.project.id,
          },
          issueType: {
            name: webhook.issue.fields.issuetype.name,
            id: webhook.issue.fields.issuetype.id,
            subtask: webhook.issue.fields.issuetype.subtask,
          },
          priority: webhook.issue.fields.priority
            ? {
                name: webhook.issue.fields.priority.name,
                id: webhook.issue.fields.priority.id,
              }
            : null,
          created: new Date(webhook.issue.fields.created).toISOString(),
          updated: new Date(webhook.issue.fields.updated).toISOString(),
          duedate: webhook.issue.fields.duedate,
        },
        comment: webhook.comment,
        worklog: webhook.worklog,
        changelog: webhook.changelog,
      },
    };
  }

  // Status classification helpers
  private isQueuedStatus(status: string | null): boolean {
    if (!status) return false;
    const queuedStatuses = [
      JIRA_STATUSES.TODO,
      JIRA_STATUSES.OPEN,
      JIRA_STATUSES.SELECTED_FOR_DEVELOPMENT,
      'Backlog',
      'To Do',
      'Ready',
    ];
    return queuedStatuses.includes(status);
  }

  private isInProgressStatus(status: string | null): boolean {
    if (!status) return false;
    const inProgressStatuses = [
      JIRA_STATUSES.IN_PROGRESS,
      JIRA_STATUSES.IN_REVIEW,
      JIRA_STATUSES.TESTING,
      'In Development',
      'Code Review',
    ];
    return inProgressStatuses.includes(status);
  }

  private isCompletedStatus(status: string | null): boolean {
    if (!status) return false;
    const completedStatuses = [
      JIRA_STATUSES.DONE,
      JIRA_STATUSES.CLOSED,
      JIRA_STATUSES.RESOLVED,
      JIRA_STATUSES.READY_FOR_DEPLOY,
      'Deployed',
      'Complete',
    ];
    return completedStatuses.includes(status);
  }

  private mapJiraStatusToOutcome(status: string | null): Outcome {
    if (!status) return 'error';

    // Map specific statuses to outcomes
    switch (status.toLowerCase()) {
      case 'done':
      case 'closed':
      case 'resolved':
      case 'complete':
      case 'deployed':
        return 'success';

      case 'rejected':
      case 'cancelled':
      case 'failed':
      case 'blocked':
        return 'failure';

      case 'reopened':
      case 'duplicate':
      case "won't fix":
      case 'cannot reproduce':
        return 'error';

      default:
        // Default completed statuses to success
        return 'success';
    }
  }
}
