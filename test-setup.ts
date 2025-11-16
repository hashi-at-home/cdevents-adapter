// Mock Cloudflare Workers global APIs for testing
import { beforeAll, vi } from 'vitest'

// Mock the global Request/Response if not available
beforeAll(() => {
  // Ensure fetch API globals are available
  if (typeof globalThis.Request === 'undefined') {
    // @ts-ignore
    globalThis.Request = class Request {
      constructor(public url: string, public init?: RequestInit) { }

      get method() {
        return this.init?.method || 'GET'
      }

      get headers() {
        return new Headers(this.init?.headers)
      }

      async json() {
        if (typeof this.init?.body === 'string') {
          return JSON.parse(this.init.body)
        }
        return {}
      }

      async text() {
        return this.init?.body?.toString() || ''
      }
    }
  }

  if (typeof globalThis.Response === 'undefined') {
    // @ts-ignore
    globalThis.Response = class Response {
      constructor(
        public body?: any,
        public init?: ResponseInit
      ) { }

      get status() {
        return this.init?.status || 200
      }

      get headers() {
        return new Headers(this.init?.headers)
      }

      async json() {
        if (typeof this.body === 'string') {
          return JSON.parse(this.body)
        }
        return this.body
      }

      async text() {
        return this.body?.toString() || ''
      }

      static json(data: any, init?: ResponseInit) {
        return new Response(JSON.stringify(data), {
          ...init,
          headers: {
            ...init?.headers,
            'Content-Type': 'application/json'
          }
        })
      }
    }
  }

  if (typeof (globalThis as any).Headers === 'undefined') {
    // @ts-ignore
    (globalThis as any).Headers = class Headers {
      private headers: Record<string, string> = {}

      constructor(init?: HeadersInit) {
        if (init) {
          if (init instanceof Headers) {
            // @ts-ignore
            this.headers = { ...init.headers }
          } else if (Array.isArray(init)) {
            init.forEach(([key, value]) => {
              this.headers[key.toLowerCase()] = value
            })
          } else {
            Object.entries(init).forEach(([key, value]) => {
              this.headers[key.toLowerCase()] = value as string
            })
          }
        }
      }

      get(name: string) {
        return this.headers[name.toLowerCase()] || null
      }

      set(name: string, value: string) {
        this.headers[name.toLowerCase()] = value
      }

      has(name: string) {
        return name.toLowerCase() in this.headers
      }

      delete(name: string) {
        delete this.headers[name.toLowerCase()]
      }

      forEach(callback: (value: string, key: string) => void) {
        Object.entries(this.headers).forEach(([key, value]) => {
          callback(value, key)
        })
      }

      entries() {
        return Object.entries(this.headers)
      }
    }
  }

  // Mock Cloudflare-specific APIs
  // @ts-ignore
  globalThis.caches = {
    default: {
      match: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    }
  }

  // Mock Cloudflare KV namespace
  const mockKV = {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue({ keys: [], list_complete: true }),
    getWithMetadata: vi.fn().mockResolvedValue({ value: null, metadata: null }),
  }

  // Mock R2 bucket
  const mockR2 = {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
    delete: vi.fn().mockResolvedValue(undefined),
    list: vi.fn().mockResolvedValue({ objects: [] }),
    head: vi.fn().mockResolvedValue(null),
  }

  // Mock Queue producer
  const mockQueue = {
    send: vi.fn().mockResolvedValue(undefined),
    sendBatch: vi.fn().mockResolvedValue(undefined),
  }

  // @ts-ignore - Mock the env bindings
  globalThis.EVENTS_BUCKET = mockR2
  // @ts-ignore
  globalThis.CI_BUILD_QUEUED = mockQueue

  // Mock crypto.randomUUID if not available
  if (!(globalThis as any).crypto?.randomUUID) {
    // @ts-ignore
    (globalThis as any).crypto = (globalThis as any).crypto || {};
    // @ts-ignore
    (globalThis as any).crypto.randomUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
  }

  // Set up TextEncoder/TextDecoder if not available
  if (typeof (globalThis as any).TextEncoder === 'undefined') {
    const util = require('util');
    (globalThis as any).TextEncoder = util.TextEncoder;
    (globalThis as any).TextDecoder = util.TextDecoder;
  }
})
