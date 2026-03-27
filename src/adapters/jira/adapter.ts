import { z } from '@hono/zod-openapi';
import { KVNamespace } from '@cloudflare/workers-types';

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
  JiraStatus,
  JiraStatusSchema,
  JiraWebhookEventType,
  JiraTicketTransition,
} from './schemas';
import { Outcome, CDEvent } from '../../schemas';

import {
  createTicketCreatedEvent,
  createTicketUpdatedEvent,
  createTicketClosedEvent,
} from '../../schema-ticket-events';

export interface Env {
  TICKET_TX: KVNamespace;
}
export class JiraAdapter extends BaseAdapter {
  readonly name = 'jira';
  readonly version = getVersion();
  // supportedEvents
  readonly supportedEvents = [
    // We support only jira tickets, other ticketing systems later
    'jira:issue_created',
    'jira:issue_updated',
    'jira:issue_deleted',
    'jira:comment_created',
    'jira:comment_updated',
    'jira:comment_deleted',
    'jira:worklog_created',
    'jira:worklog_updated',
    'jira:worklog_deleted',
  ];

  /*
  transform is a function which takes webhook data and a presumed event type and transforms it into a Promise of a CDEvent or throws and Error if not supported or transformation fails.
  */
  async transform(webhookData: any, eventType: string): Promise<CDEvent> {
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

        case 'jira:comment_created':
          parsedWebhook = JiraCommentCreatedWebhookSchema.parse(webhookData);
          return this.transformCommentCreated(parsedWebhook);

        case 'jira:comment_updated':
          parsedWebhook = JiraCommentUpdatedWebhookSchema.parse(webhookData);
          return this.transformCommentUpdated(parsedWebhook);

        case 'comment_deleted':
          parsedWebhook = JiraCommentDeletedWebhookSchema.parse(webhookData);
          return this.transformCommentDeleted(parsedWebhook);

        case 'worklog_created':
          parsedWebhook = JiraWorklogCreatedWebhookSchema.parse(webhookData);
          return this.transformWorklogCreated(parsedWebhook);

        case 'jira:worklog_updated':
          parsedWebhook = JiraWorklogUpdatedWebhookSchema.parse(webhookData);
          return this.transformWorklogUpdated(parsedWebhook);

        case 'jira:worklog_deleted':
          parsedWebhook = JiraWorklogDeletedWebhookSchema.parse(webhookData);
          return this.transformWorklogDeleted(parsedWebhook);

        default:
          // Try to parse as generic webhook
          // This shouldn't happen since we are catching an error above
          console.warn(
            'Warning: Unknown or unsupported event. Attempting generic transformation'
          );
          parsedWebhook = JiraWebhookEventSchema.parse(webhookData);
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
    // Extract metadata to generate eventId and source uri
    const metadata = this.extractJiraMetadata(webhook);
    // Get the issue type from the webhook fields
    const issueType = webhook.issue.fields.issuetype.name;
    // Extract assignees if present
    const assignees = webhook.issue.fields.assignee
      ? [webhook.issue.fields.assignee.displayName]
      : undefined;

    // Issue created maps to TicketCreated event TODO
    const cdevent = createTicketCreatedEvent(
      metadata.eventId, // contextId
      webhook.issue.key, // subjectId
      metadata.timestamp, //timestamp
      webhook.issue.self, // source
      issueType, // ticketType
      webhook.issue.fields.creator.emailAddress, // creator
      webhook.issue.fields.description, // summary
      this.createIssueUrl(webhook.issue), // uri
      webhook.issue.fields.project.key, // group
      assignees, // assignees
      '', // priority - not present on our tickets
      [] // labels - no labels on our tickets, they are hidden on all projects.
    );

    // Add Jira-specific custom data
    cdevent.customData = this.createJiraCustomData(webhook, 'issue_created');

    return cdevent;
  }

  private transformIssueUpdated(webhook: JiraIssueUpdatedWebhook): CDEvent {
    const metadata = this.extractJiraMetadata(webhook);

    const assignees = webhook.issue.fields.assignee
      ? [webhook.issue.fields.assignee.displayName]
      : undefined;

    return createTicketUpdatedEvent(
      metadata.eventId, // contextID
      webhook.issue.key, // subjectID
      metadata.source, // source
      metadata.timestamp, // timestamp
      webhook.issue.fields.creator.displayName, // creator
      webhook.issue.fields.summary, // summary
      this.createIssueUrl(webhook.issue), // uri
      webhook.issue.fields.issuetype.name, // ticketType
      assignees,
      undefined, // priority
      [],
      undefined
    );
  }

  private transformIssueDeleted(webhook: JiraIssueDeletedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);

    // Issue deleted maps to issueClosed event
  }

  private transformCommentCreated(webhook: JiraCommentCreatedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);
    const assignees = webhook.issue.fields.assignee
      ? [webhook.issue.fields.assignee.displayName]
      : undefined;
    // Comment events can be treated as task events
    const cdevent = createTicketUpdatedEvent(
      metadata.eventId, // contextId
      metadata.eventId, // subjectId
      metadata.source, // source
      metadata.timestamp, // timestamp
      webhook.issue.fields.creator.displayName, // creator
      webhook.issue.fields.summary, // summary
      this.createIssueUrl(webhook.issue), // uri
      webhook.issue.fields.issuetype.name, // ticketType,
      assignees, // assignees
      undefined, // priority
      [],
      undefined
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'comment_created');
    return cdevent;
  }

  private transformCommentUpdated(webhook: JiraCommentUpdatedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);
    const assignees = webhook.issue.fields.assignee
      ? [webhook.issue.fields.assignee.displayName]
      : undefined;
    const cdevent = createTicketUpdatedEvent(
      metadata.eventId, // contextId
      metadata.eventId, // subjectId
      metadata.source, // source
      metadata.timestamp, // timestamp
      webhook.issue.fields.creator.displayName, // creator
      webhook.issue.fields.summary, // summary
      this.createIssueUrl(webhook.issue), // uri
      webhook.issue.fields.issuetype.name, // ticketType,
      assignees, // assignees
      undefined, // priority
      [],
      undefined
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'comment_updated');
    return cdevent;
  }

  private transformCommentDeleted(webhook: JiraCommentDeletedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);
    const assignees = webhook.issue.fields.assignee
      ? [webhook.issue.fields.assignee.displayName]
      : undefined;
    const cdevent = createTicketUpdatedEvent(
      metadata.eventId, // contextId
      metadata.eventId, // subjectId
      metadata.source, // source
      metadata.timestamp, // timestamp
      webhook.issue.fields.creator.displayName, // creator
      webhook.issue.fields.summary, // summary
      this.createIssueUrl(webhook.issue), // uri
      webhook.issue.fields.issuetype.name, // ticketType,
      assignees, // assignees
      undefined, // priority
      [],
      undefined
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'comment_deleted');
    return cdevent;
  }

  private transformWorklogCreated(webhook: JiraWorklogCreatedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);
    const assignees = webhook.issue.fields.assignee
      ? [webhook.issue.fields.assignee.displayName]
      : undefined;
    const cdevent = createTicketUpdatedEvent(
      metadata.eventId, // contextId
      metadata.eventId, // subjectId
      metadata.source, // source
      metadata.timestamp, // timestamp
      webhook.issue.fields.creator.displayName, // creator
      webhook.issue.fields.summary, // summary
      this.createIssueUrl(webhook.issue), // uri
      webhook.issue.fields.issuetype.name, // ticketType,
      assignees, // assignees
      undefined, // priority
      [],
      undefined
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'worklog_created');
    return cdevent;
  }

  private transformWorklogUpdated(webhook: JiraWorklogUpdatedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);
    const assignees = webhook.issue.fields.assignee
      ? [webhook.issue.fields.assignee.displayName]
      : undefined;
    const cdevent = createTicketUpdatedEvent(
      metadata.eventId, // contextId
      metadata.eventId, // subjectId
      metadata.source, // source
      metadata.timestamp, // timestamp
      webhook.issue.fields.creator.displayName, // creator
      webhook.issue.fields.summary, // summary
      this.createIssueUrl(webhook.issue), // uri
      webhook.issue.fields.issuetype.name, // ticketType,
      assignees, // assignees
      undefined, // priority
      [],
      undefined
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'worklog_updated');
    return cdevent;
  }

  private transformWorklogDeleted(webhook: JiraWorklogDeletedWebhook): any {
    const metadata = this.extractJiraMetadata(webhook);
    const assignees = webhook.issue.fields.assignee
      ? [webhook.issue.fields.assignee.displayName]
      : undefined;
    const cdevent = createTicketUpdatedEvent(
      metadata.eventId, // contextId
      metadata.eventId, // subjectId
      metadata.source, // source
      metadata.timestamp, // timestamp
      webhook.issue.fields.creator.displayName, // creator
      webhook.issue.fields.summary, // summary
      this.createIssueUrl(webhook.issue), // uri
      webhook.issue.fields.issuetype.name, // ticketType,
      assignees, // assignees
      undefined, // priority
      [],
      undefined
    );

    cdevent.customData = this.createJiraCustomData(webhook, 'worklog_deleted');
    return cdevent;
  }

  private transformGenericEvent(
    webhook: JiraWebhookEvent,
    eventType: string
  ): CDEvent {
    const metadata = this.extractGenericJiraMetadata(webhook, eventType);
    const assignees = webhook.issue.fields.assignee
      ? [webhook.issue.fields.assignee.displayName]
      : undefined;
    // Generic events default to task events
    const cdevent = createTicketUpdatedEvent(
      metadata.eventId, // contextId
      metadata.eventId, // subjectId
      metadata.source, // source
      metadata.timestamp, // timestamp
      webhook.issue.fields.creator.displayName, // creator
      webhook.issue.fields.summary, // summary
      this.createIssueUrl(webhook.issue), // uri
      webhook.issue.fields.issuetype.name, // ticketType,
      assignees, // assignees
      undefined, // priority
      [],
      undefined
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

  // // Status classification helpers
  // //
  // // private mapWebhookStatusToCdEventStatus(status: string | null): string {
  // //   const jiraStatuses = [
  // //     "Backlog" |
  // //   ]

  // //   return cdEventStatus;
  // // }

  // private isQueuedStatus(status: string | null): boolean {
  //   if (!status) return false;
  //   const queuedStatuses = [
  //     JIRA_STATUSES.TODO,
  //     JIRA_STATUSES.OPEN,
  //     JIRA_STATUSES.SELECTED_FOR_DEVELOPMENT,
  //     'Backlog',
  //     'To Do',
  //     'Ready',
  //   ];
  //   return queuedStatuses.includes(status);
  // }

  // private isInProgressStatus(status: string | null): boolean {
  //   if (!status) return false;
  //   const inProgressStatuses = [
  //     JIRA_STATUSES.IN_PROGRESS,
  //     JIRA_STATUSES.IN_REVIEW,
  //     JIRA_STATUSES.TESTING,
  //     'In Development',
  //     'Code Review',
  //   ];
  //   return inProgressStatuses.includes(status);
  // }

  // private isCompletedStatus(status: string | null): boolean {
  //   if (!status) return false;
  //   const completedStatuses = [
  //     JIRA_STATUSES.DONE,
  //     JIRA_STATUSES.CLOSED,
  //     JIRA_STATUSES.RESOLVED,
  //     JIRA_STATUSES.READY_FOR_DEPLOY,
  //     'Deployed',
  //     'Complete',
  //   ];
  //   return completedStatuses.includes(status);
  // }

  // private mapJiraStatusToOutcome(status: string | null): Outcome {
  //   if (!status) return 'error';

  //   // Map specific statuses to outcomes
  //   switch (status.toLowerCase()) {
  //     case 'done':
  //     case 'closed':
  //     case 'resolved':
  //     case 'complete':
  //     case 'deployed':
  //       return 'success';

  //     case 'rejected':
  //     case 'cancelled':
  //     case 'failed':
  //     case 'blocked':
  //       return 'failure';

  //     case 'reopened':
  //     case 'duplicate':
  //     case "won't fix":
  //     case 'cannot reproduce':
  //       return 'error';

  //     default:
  //       // Default completed statuses to success
  //       return 'success';
  //   }
  // }
  //
  // GetStatusTransition is a function which computes the transition from a change between
  // two statuses - the fromStatus and the toStatus
  // The toStatus is the ticket status in the payload
  // The fromStatus is either null or whatever it was before the event occurred.
  // This is handled
  private async GetStatusTransition(
    webhook: JiraWebhookEvent,
    env: Env
  ): Promise<JiraTicketTransition> {
    let tx: JiraTicketTransition;
    // toState is always what we get from the webhook.
    const toState = webhook.issue.fields.status.name;
    let fromState;
    const issueKey: string = webhook.issue.key;
    const result = await env.TICKET_TX.get(issueKey);
    if (!result) {
      fromState = null;
    } else {
      fromState = JSON.parse(result).toState;
    }
    tx = { fromState: fromState, toState: toState };

    return tx;
  }
}
