import { z } from '@hono/zod-openapi';
import { Context } from 'hono';

// Base adapter interface
export interface Adapter {
  readonly name: string;
  readonly version: string;
  readonly supportedEvents: string[];

  // Transform webhook data to CD Event
  transform(webhookData: any, eventType: string): Promise<any>;

  // Validate incoming webhook (optional)
  validateWebhook?(webhookData: any): Promise<boolean>;

  // Get webhook schema for OpenAPI documentation
  getWebhookSchema(eventType: string): z.ZodSchema | null;
}

// Base adapter response types
export const AdapterResponseSchema = z
  .object({
    success: z.boolean(),
    logged: z.boolean().optional(),
    message: z.string(),
    eventType: z.string().optional(),
    cdevent: z.any().optional(),
    errors: z.array(z.string()).optional(),
  })
  .openapi('AdapterResponse', {
    description: 'Response from webhook adapter transformation',
  });

export const AdapterErrorResponseSchema = z
  .object({
    success: z.literal(false),
    logged: z.boolean().optional(),
    eventType: z.string().optional(),
    message: z.string(),
    errors: z.array(z.string()),
  })
  .openapi('AdapterErrorResponse', {
    description: 'Error response from webhook adapter',
  });

export type AdapterResponse = z.infer<typeof AdapterResponseSchema>;
export type AdapterErrorResponse = z.infer<typeof AdapterErrorResponseSchema>;

// Adapter configuration
export interface AdapterConfig {
  name: string;
  basePath: string;
  adapter: Adapter;
}

// Webhook event metadata
export interface WebhookEventMetadata {
  source: string;
  timestamp: string;
  eventId: string;
  eventType: string;
}

// Base adapter class with common functionality
export abstract class BaseAdapter implements Adapter {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly supportedEvents: string[];

  // Abstract methods to be implemented by specific adapters
  abstract transform(webhookData: any, eventType: string): Promise<any>;
  abstract getWebhookSchema(eventType: string): z.ZodSchema | null;

  // Common validation logic
  async validateWebhook(webhookData: any): Promise<boolean> {
    try {
      // Basic validation - check if data exists
      return webhookData !== null && webhookData !== undefined;
    } catch (error) {
      return false;
    }
  }

  // Helper method to extract common webhook metadata
  protected extractWebhookMetadata(
    webhookData: any
  ): Partial<WebhookEventMetadata> {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      eventId: this.generateEventId(),
    };
  }

  // Generate a unique event ID
  protected generateEventId(): string {
    return `${this.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Helper method to create error response
  protected createErrorResponse(
    message: string,
    errors: string[] = []
  ): AdapterErrorResponse {
    return {
      success: false,
      logged: true,
      message,
      errors,
    };
  }

  // Helper method to create success response
  protected createSuccessResponse(
    message: string,
    cdevent?: any
  ): AdapterResponse {
    return {
      success: true,
      message,
      cdevent,
    };
  }

  // Validate that event type is supported
  protected isEventTypeSupported(eventType: string): boolean {
    return this.supportedEvents.includes(eventType);
  }
}

// Utility function to register adapter routes
export interface AdapterRouteConfig {
  path: string;
  method: 'POST' | 'GET';
  eventType: string;
  description: string;
}

// Common adapter utilities
export class AdapterUtils {
  // Extract GitHub-style event type from headers
  static extractGitHubEventType(c: Context): string | null {
    return c.req.header('x-github-event') || null;
  }

  // Extract GitLab-style event type from headers
  static extractGitLabEventType(c: Context): string | null {
    return c.req.header('x-gitlab-event') || null;
  }

  // Validate webhook signature (placeholder for implementation)
  static async validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    // Implementation would depend on the webhook provider
    // GitHub uses HMAC-SHA256, GitLab uses different methods, etc.
    return true; // Placeholder
  }

  // Create standardized source URI
  static createSourceUri(
    provider: string,
    organization?: string,
    repository?: string
  ): string {
    let source = `https://${provider}.com`;
    if (organization) {
      source += `/${organization}`;
    }
    if (repository) {
      source += `/${repository}`;
    }
    return source;
  }
}
