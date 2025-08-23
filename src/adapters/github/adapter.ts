import { z } from "@hono/zod-openapi";
import { BaseAdapter, WebhookEventMetadata, AdapterUtils } from "../base";
import {
  GitHubWorkflowJobWebhookSchema,
  GitHubWorkflowJobQueuedWebhookSchema,
  GitHubWorkflowJobInProgressWebhookSchema,
  GitHubWorkflowJobCompletedWebhookSchema,
  GitHubPingWebhookSchema,
  GitHubWorkflowJobQueuedWebhook,
  GitHubWorkflowJobInProgressWebhook,
  GitHubWorkflowJobCompletedWebhook,
  GitHubPingWebhook,
} from "./schemas";
import {
  createPipelineRunQueuedEvent,
  createPipelineRunStartedEvent,
  createPipelineRunFinishedEvent,
  createTaskRunStartedEvent,
  createTaskRunFinishedEvent,
  Outcome,
} from "../../schemas";

export class GitHubAdapter extends BaseAdapter {
  readonly name = "github";
  readonly version = "1.0.0";
  readonly supportedEvents = [
    "workflow_job.queued",
    "workflow_job.in_progress",
    "workflow_job.completed",
    "ping",
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
        case "workflow_job.queued":
          parsedWebhook =
            GitHubWorkflowJobQueuedWebhookSchema.parse(webhookData);
          return this.transformWorkflowJobQueued(parsedWebhook);

        case "workflow_job.in_progress":
          parsedWebhook =
            GitHubWorkflowJobInProgressWebhookSchema.parse(webhookData);
          return this.transformWorkflowJobInProgress(parsedWebhook);

        case "workflow_job.completed":
          parsedWebhook =
            GitHubWorkflowJobCompletedWebhookSchema.parse(webhookData);
          return this.transformWorkflowJobCompleted(parsedWebhook);

        case "ping":
          parsedWebhook = GitHubPingWebhookSchema.parse(webhookData);
          return this.transformPing(parsedWebhook);

        default:
          throw new Error(
            `Transformation not implemented for event type: ${eventType}`,
          );
      }
    } catch (error) {
      throw new Error(
        `Failed to transform webhook: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  getWebhookSchema(eventType: string): z.ZodSchema | null {
    switch (eventType) {
      case "workflow_job.queued":
        return GitHubWorkflowJobQueuedWebhookSchema;
      case "workflow_job.in_progress":
        return GitHubWorkflowJobInProgressWebhookSchema;
      case "workflow_job.completed":
        return GitHubWorkflowJobCompletedWebhookSchema;
      case "ping":
        return GitHubPingWebhookSchema;
      default:
        return GitHubWorkflowJobWebhookSchema;
    }
  }

  async validateWebhook(webhookData: any): Promise<boolean> {
    try {
      // Basic validation using the generic schema
      GitHubWorkflowJobWebhookSchema.parse(webhookData);
      return true;
    } catch (error) {
      return false;
    }
  }

  private transformWorkflowJobQueued(
    webhook: GitHubWorkflowJobQueuedWebhook,
  ): any {
    const metadata = this.extractGitHubMetadata(webhook);

    // For workflow_job.queued, we create a pipeline run queued event
    // The workflow job represents a task within a pipeline (workflow run)
    const cdevent = createPipelineRunQueuedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      this.createSubjectId(webhook.workflow_job),
      webhook.workflow.name,
      webhook.workflow_job.html_url,
    );

    // Add custom data with GitHub-specific information
    cdevent.customData = {
      github: {
        action: webhook.action,
        workflow_job: {
          id: webhook.workflow_job.id,
          run_id: webhook.workflow_job.run_id,
          name: webhook.workflow_job.name,
          labels: webhook.workflow_job.labels,
          status: webhook.workflow_job.status,
        },
        workflow: {
          id: webhook.workflow.id,
          name: webhook.workflow.name,
          path: webhook.workflow.path,
        },
        repository: {
          id: webhook.repository.id,
          name: webhook.repository.name,
          full_name: webhook.repository.full_name,
          owner: webhook.repository.owner.login,
        },
        sender: {
          login: webhook.sender.login,
          id: webhook.sender.id,
        },
      },
    };

    return cdevent;
  }

  private transformWorkflowJobInProgress(
    webhook: GitHubWorkflowJobInProgressWebhook,
  ): any {
    const metadata = this.extractGitHubMetadata(webhook);

    // For workflow_job.in_progress, we create a pipeline run started event
    const cdevent = createPipelineRunStartedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      this.createSubjectId(webhook.workflow_job),
      webhook.workflow.name,
      webhook.workflow_job.html_url,
    );

    // Add custom data with GitHub-specific information
    cdevent.customData = {
      github: {
        action: webhook.action,
        workflow_job: {
          id: webhook.workflow_job.id,
          run_id: webhook.workflow_job.run_id,
          name: webhook.workflow_job.name,
          labels: webhook.workflow_job.labels,
          status: webhook.workflow_job.status,
          started_at: webhook.workflow_job.started_at,
          runner_id: webhook.workflow_job.runner_id,
          runner_name: webhook.workflow_job.runner_name,
        },
        workflow: {
          id: webhook.workflow.id,
          name: webhook.workflow.name,
          path: webhook.workflow.path,
        },
        repository: {
          id: webhook.repository.id,
          name: webhook.repository.name,
          full_name: webhook.repository.full_name,
          owner: webhook.repository.owner.login,
        },
        sender: {
          login: webhook.sender.login,
          id: webhook.sender.id,
        },
      },
    };

    return cdevent;
  }

  private transformWorkflowJobCompleted(
    webhook: GitHubWorkflowJobCompletedWebhook,
  ): any {
    const metadata = this.extractGitHubMetadata(webhook);

    // Map GitHub conclusion to CD Events outcome
    const outcome = this.mapGitHubConclusionToOutcome(
      webhook.workflow_job.conclusion,
    );

    // For workflow_job.completed, we create a pipeline run finished event
    const cdevent = createPipelineRunFinishedEvent(
      metadata.eventId,
      metadata.source,
      metadata.timestamp,
      this.createSubjectId(webhook.workflow_job),
      outcome,
      webhook.workflow.name,
      webhook.workflow_job.html_url,
      outcome === "error" || outcome === "failure"
        ? this.extractErrorMessage(webhook)
        : undefined,
    );

    // Add custom data with GitHub-specific information
    cdevent.customData = {
      github: {
        action: webhook.action,
        workflow_job: {
          id: webhook.workflow_job.id,
          run_id: webhook.workflow_job.run_id,
          name: webhook.workflow_job.name,
          labels: webhook.workflow_job.labels,
          status: webhook.workflow_job.status,
          conclusion: webhook.workflow_job.conclusion,
          started_at: webhook.workflow_job.started_at,
          completed_at: webhook.workflow_job.completed_at,
          runner_id: webhook.workflow_job.runner_id,
          runner_name: webhook.workflow_job.runner_name,
          steps: webhook.workflow_job.steps,
        },
        workflow: {
          id: webhook.workflow.id,
          name: webhook.workflow.name,
          path: webhook.workflow.path,
        },
        repository: {
          id: webhook.repository.id,
          name: webhook.repository.name,
          full_name: webhook.repository.full_name,
          owner: webhook.repository.owner.login,
        },
        sender: {
          login: webhook.sender.login,
          id: webhook.sender.id,
        },
      },
    };

    return cdevent;
  }

  private extractGitHubMetadata(
    webhook:
      | GitHubWorkflowJobQueuedWebhook
      | GitHubWorkflowJobInProgressWebhook
      | GitHubWorkflowJobCompletedWebhook,
  ): WebhookEventMetadata {
    const baseMetadata = this.extractWebhookMetadata(webhook);

    return {
      ...baseMetadata,
      eventId: baseMetadata.eventId || this.generateEventId(),
      source: AdapterUtils.createSourceUri(
        "github",
        webhook.repository.owner.login,
        webhook.repository.name,
      ),
      eventType: `workflow_job.${webhook.action}`,
      timestamp: webhook.workflow_job.started_at || new Date().toISOString(),
    };
  }

  private createSubjectId(workflowJob: any): string {
    // Create a unique subject ID that combines workflow job info
    return `github-workflow-job-${workflowJob.id}`;
  }

  private mapGitHubConclusionToOutcome(conclusion: string | null): Outcome {
    switch (conclusion) {
      case "success":
        return "success";
      case "failure":
      case "timed_out":
      case "action_required":
        return "failure";
      case "cancelled":
      case "skipped":
      case "neutral":
        return "error";
      default:
        return "error";
    }
  }

  private extractErrorMessage(
    webhook: GitHubWorkflowJobCompletedWebhook,
  ): string {
    const conclusion = webhook.workflow_job.conclusion;
    const jobName = webhook.workflow_job.name;

    if (conclusion === "failure") {
      return `Workflow job "${jobName}" failed`;
    }
    if (conclusion === "timed_out") {
      return `Workflow job "${jobName}" timed out`;
    }
    if (conclusion === "cancelled") {
      return `Workflow job "${jobName}" was cancelled`;
    }
    if (conclusion === "action_required") {
      return `Workflow job "${jobName}" requires action`;
    }

    return `Workflow job "${jobName}" completed with conclusion: ${conclusion}`;
  }

  private transformPing(webhook: GitHubPingWebhook): any {
    // For ping events, we don't create a CD Event since it's just a webhook test
    // Instead, we return a simple success response indicating the webhook is working
    return {
      success: true,
      message: "GitHub webhook ping received successfully",
      ping: {
        zen: webhook.zen,
        hook_id: webhook.hook_id,
        repository: webhook.repository.full_name,
        sender: webhook.sender.login,
      },
    };
  }
}
