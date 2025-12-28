import { z } from "@hono/zod-openapi";

// GitHub webhook common types
export const GitHubUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  node_id: z.string().optional(),
  avatar_url: z.string().url().optional(),
  gravatar_id: z.string().optional(),
  url: z.string().url().optional(),
  html_url: z.string().url().optional(),
  followers_url: z.string().url().optional(),
  following_url: z.string().optional(),
  gists_url: z.string().optional(),
  starred_url: z.string().optional(),
  subscriptions_url: z.string().url().optional(),
  organizations_url: z.string().url().optional(),
  repos_url: z.string().url().optional(),
  events_url: z.string().optional(),
  received_events_url: z.string().url().optional(),
  type: z.string().optional(),
  site_admin: z.boolean().optional(),
}).openapi("GitHubUser", {
  description: "GitHub user information",
});

export const GitHubRepositorySchema = z.object({
  id: z.number(),
  node_id: z.string(),
  name: z.string(),
  full_name: z.string(),
  private: z.boolean().optional(),
  owner: GitHubUserSchema.optional(),
  html_url: z.string().url().optional(),
  description: z.string().nullable().optional(),
  fork: z.boolean().optional(),
  url: z.string().url().optional(),
  archive_url: z.string().optional(),
  assignees_url: z.string().optional(),
  blobs_url: z.string().optional(),
  branches_url: z.string().optional(),
  collaborators_url: z.string().optional(),
  comments_url: z.string().optional(),
  commits_url: z.string().optional(),
  compare_url: z.string().optional(),
  contents_url: z.string().optional(),
  contributors_url: z.string().url().optional(),
  deployments_url: z.string().url().optional(),
  downloads_url: z.string().url().optional(),
  events_url: z.string().url().optional(),
  forks_url: z.string().url().optional(),
  git_commits_url: z.string().optional(),
  git_refs_url: z.string().optional(),
  git_tags_url: z.string().optional(),
  git_url: z.string().optional(),
  issue_comment_url: z.string().optional(),
  issue_events_url: z.string().optional(),
  issues_url: z.string().optional(),
  keys_url: z.string().optional(),
  labels_url: z.string().optional(),
  languages_url: z.string().url().optional(),
  merges_url: z.string().url().optional(),
  milestones_url: z.string().optional(),
  notifications_url: z.string().optional(),
  pulls_url: z.string().optional(),
  releases_url: z.string().optional(),
  ssh_url: z.string().optional(),
  stargazers_url: z.string().url().optional(),
  statuses_url: z.string().optional(),
  subscribers_url: z.string().url().optional(),
  subscription_url: z.string().url().optional(),
  tags_url: z.string().url().optional(),
  teams_url: z.string().url().optional(),
  trees_url: z.string().optional(),
  clone_url: z.string().url().optional(),
  mirror_url: z.string().url().nullable().optional(),
  hooks_url: z.string().url().optional(),
  svn_url: z.string().url().optional(),
  homepage: z.string().url().nullable().or(z.literal("")).optional(),
  language: z.string().nullable().optional(),
  forks_count: z.number().optional(),
  stargazers_count: z.number().optional(),
  watchers_count: z.number().optional(),
  size: z.number().optional(),
  default_branch: z.string().optional(),
  open_issues_count: z.number().optional(),
  is_template: z.boolean().optional(),
  topics: z.array(z.string()).optional(),
  has_issues: z.boolean().optional(),
  has_projects: z.boolean().optional(),
  has_wiki: z.boolean().optional(),
  has_pages: z.boolean().optional(),
  has_downloads: z.boolean().optional(),
  archived: z.boolean().optional(),
  disabled: z.boolean().optional(),
  visibility: z.string().optional(),
  pushed_at: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  permissions: z.object({
    admin: z.boolean(),
    push: z.boolean(),
    pull: z.boolean(),
  }).optional(),
  allow_rebase_merge: z.boolean().optional(),
  template_repository: z.any().nullable().optional(),
  temp_clone_token: z.string().optional(),
  allow_squash_merge: z.boolean().optional(),
  allow_auto_merge: z.boolean().optional(),
  delete_branch_on_merge: z.boolean().optional(),
  allow_merge_commit: z.boolean().optional(),
  subscribers_count: z.number().optional(),
  network_count: z.number().optional(),
  allow_forking: z.boolean().optional(),
  web_commit_signoff_required: z.boolean().optional(),
  license: z.object({
    key: z.string(),
    name: z.string(),
    spdx_id: z.string(),
    url: z.string().url().nullable(),
    node_id: z.string(),
  }).nullable().optional(),
  forks: z.number().optional(),
  open_issues: z.number().optional(),
  watchers: z.number().optional(),
}).openapi("GitHubRepository", {
  description: "GitHub repository information",
});

// GitHub workflow job specific schemas
export const GitHubWorkflowJobStepSchema = z.object({
  name: z.string(),
  status: z.enum(["queued", "waiting", "in_progress", "completed"]),
  conclusion: z.enum(["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required"]).nullable(),
  number: z.number(),
  started_at: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
}).openapi("GitHubWorkflowJobStep", {
  description: "GitHub workflow job step information",
});

export const GitHubWorkflowJobSchema = z.object({
  id: z.number(),
  run_id: z.number(),
  workflow_name: z.string(),
  head_branch: z.string(),
  run_url: z.string().url(),
  run_attempt: z.number(),
  node_id: z.string(),
  head_sha: z.string(),
  url: z.string().url(),
  html_url: z.string().url(),
  status: z.enum(["queued", "waiting", "in_progress", "completed"]),
  conclusion: z.enum(["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required"]).nullable(),
  created_at: z.string().datetime(),
  started_at: z.string().datetime().nullable(),
  completed_at: z.string().datetime().nullable(),
  name: z.string(),
  steps: z.array(GitHubWorkflowJobStepSchema),
  check_run_url: z.string().url(),
  labels: z.array(z.string()),
  runner_id: z.number().nullable(),
  runner_name: z.string().nullable(),
  runner_group_id: z.number().nullable(),
  runner_group_name: z.string().nullable(),
}).openapi("GitHubWorkflowJob", {
  description: "GitHub workflow job information",
});

export const GitHubWorkflowRunSchema = z.object({
  id: z.number(),
  name: z.string(),
  node_id: z.string(),
  head_branch: z.string(),
  head_sha: z.string(),
  path: z.string(),
  display_title: z.string(),
  run_number: z.number(),
  event: z.string(),
  status: z.string(),
  conclusion: z.string().nullable(),
  workflow_id: z.number(),
  check_suite_id: z.number(),
  check_suite_node_id: z.string(),
  url: z.string().url(),
  html_url: z.string().url(),
  pull_requests: z.array(z.any()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  actor: GitHubUserSchema,
  run_attempt: z.number(),
  referenced_workflows: z.array(z.any()),
  run_started_at: z.string().datetime(),
  triggering_actor: GitHubUserSchema,
  jobs_url: z.string().url(),
  logs_url: z.string().url(),
  check_suite_url: z.string().url(),
  artifacts_url: z.string().url(),
  cancel_url: z.string().url(),
  rerun_url: z.string().url(),
  previous_attempt_url: z.string().url().nullable(),
  workflow_url: z.string().url(),
  head_commit: z.object({
    id: z.string(),
    tree_id: z.string(),
    message: z.string(),
    timestamp: z.string().datetime(),
    author: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
    committer: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
  }),
  repository: GitHubRepositorySchema,
  head_repository: GitHubRepositorySchema,
}).openapi("GitHubWorkflowRun", {
  description: "GitHub workflow run information",
});

// Main webhook payload schema for workflow_job events
export const GitHubWorkflowJobWebhookSchema = z.object({
  action: z.enum(["queued", "waiting", "in_progress", "completed"]).openapi({
    description: "The action that was performed on the workflow job",
    example: "queued",
  }),
  workflow_job: GitHubWorkflowJobSchema,

  repository: GitHubRepositorySchema,
  sender: GitHubUserSchema,
  installation: z.object({
    id: z.number(),
    node_id: z.string(),
  }).optional(),
  organization: z.object({
    login: z.string(),
    id: z.number(),
    node_id: z.string(),
    url: z.string().url(),
    repos_url: z.string().url(),
    events_url: z.string().url(),
    hooks_url: z.string().url(),
    issues_url: z.string().url(),
    members_url: z.string(),
    public_members_url: z.string(),
    avatar_url: z.string().url(),
    description: z.string().nullable(),
  }).optional(),
}).openapi("GitHubWorkflowJobWebhook", {
  description: "GitHub workflow job webhook payload",
});

// Specific webhook schemas for different actions
export const GitHubWorkflowJobQueuedWebhookSchema = GitHubWorkflowJobWebhookSchema.extend({
  action: z.literal("queued"),
}).openapi("GitHubWorkflowJobQueuedWebhook", {
  description: "GitHub workflow job queued webhook payload",
});

export const GitHubWorkflowJobWaitingWebhookSchema = GitHubWorkflowJobWebhookSchema.extend({
  action: z.literal("waiting"),
}).openapi("GitHubWorkflowJobWaitingWebhook", {
  description: "GitHub workflow job waiting webhook payload",
});

export const GitHubWorkflowJobInProgressWebhookSchema = GitHubWorkflowJobWebhookSchema.extend({
  action: z.literal("in_progress"),
}).openapi("GitHubWorkflowJobInProgressWebhook", {
  description: "GitHub workflow job in progress webhook payload",
});

export const GitHubWorkflowJobCompletedWebhookSchema = GitHubWorkflowJobWebhookSchema.extend({
  action: z.literal("completed"),
}).openapi("GitHubWorkflowJobCompletedWebhook", {
  description: "GitHub workflow job completed webhook payload",
});

// GitHub ping webhook schema
export const GitHubPingWebhookSchema = z.object({
  zen: z.string().openapi({
    description: "Random zen quote from GitHub",
    example: "Speak like a human.",
  }),
  hook_id: z.number().openapi({
    description: "The ID of the webhook",
    example: 12345678,
  }),
  hook: z.object({
    type: z.string(),
    id: z.number(),
    name: z.string(),
    active: z.boolean(),
    events: z.array(z.string()),
    config: z.object({
      content_type: z.string(),
      insecure_ssl: z.string(),
      url: z.string().url(),
    }).passthrough(), // Allow additional config properties
    updated_at: z.string().datetime(),
    created_at: z.string().datetime(),
    app_id: z.number().optional(),
    deliveries_url: z.string().url(),
    ping_url: z.string().url(),
    last_response: z.object({
      code: z.number().nullable(),
      status: z.string(),
      message: z.string().nullable(),
    }).nullable(),
  }).openapi({
    description: "The webhook configuration",
  }),
  repository: GitHubRepositorySchema,
  sender: GitHubUserSchema,
  organization: z.object({
    login: z.string(),
    id: z.number(),
    node_id: z.string(),
    url: z.string().url(),
    repos_url: z.string().url(),
    events_url: z.string().url(),
    hooks_url: z.string().url(),
    issues_url: z.string().url(),
    members_url: z.string(),
    public_members_url: z.string(),
    avatar_url: z.string().url(),
    description: z.string().nullable(),
  }).optional().openapi({
    description: "The organization if the webhook is for an organization",
  }),
}).openapi("GitHubPingWebhook", {
  description: "GitHub ping webhook payload sent when a webhook is first created",
});

// Export types
export type GitHubUser = z.infer<typeof GitHubUserSchema>;
export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>;
export type GitHubWorkflowJob = z.infer<typeof GitHubWorkflowJobSchema>;
export type GitHubWorkflowRun = z.infer<typeof GitHubWorkflowRunSchema>;
export type GitHubWorkflowJobWebhook = z.infer<typeof GitHubWorkflowJobWebhookSchema>;
export type GitHubWorkflowJobQueuedWebhook = z.infer<typeof GitHubWorkflowJobQueuedWebhookSchema>;
export type GitHubWorkflowJobWaitingWebhook = z.infer<typeof GitHubWorkflowJobWaitingWebhookSchema>;
export type GitHubWorkflowJobInProgressWebhook = z.infer<typeof GitHubWorkflowJobInProgressWebhookSchema>;
export type GitHubWorkflowJobCompletedWebhook = z.infer<typeof GitHubWorkflowJobCompletedWebhookSchema>;
export type GitHubPingWebhook = z.infer<typeof GitHubPingWebhookSchema>;
