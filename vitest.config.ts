import { defineConfig } from 'vitest/config'
import ssrPlugin from 'vite-ssr-components/plugin'

export default defineConfig({
  plugins: [
    // Don't use the cloudflare plugin directly in test mode
    // to avoid the resolve.external validation error
    ssrPlugin()
  ],
  test: {
    globals: true,
    environment: 'node',
    // Use node environment with web-like globals
    environmentOptions: {
      // Add web-like globals to node environment
      jsdom: false,
    },
    setupFiles: ['./test-setup.ts'],
    // Mock Cloudflare-specific globals
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
  resolve: {
    alias: {
      '~': '/src',
    },
    conditions: ['worker', 'webworker', 'import', 'module', 'browser', 'default'],
    mainFields: ['module', 'main'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('test'),
    // Define Cloudflare Workers globals
    'globalThis.caches': 'undefined',
    'globalThis.crypto': 'globalThis.crypto',
    'globalThis.CryptoKey': 'globalThis.CryptoKey',
    'globalThis.fetch': 'globalThis.fetch',
    'globalThis.FormData': 'globalThis.FormData',
    'globalThis.Headers': 'globalThis.Headers',
    'globalThis.Request': 'globalThis.Request',
    'globalThis.Response': 'globalThis.Response',
    'globalThis.URL': 'globalThis.URL',
    'globalThis.URLSearchParams': 'globalThis.URLSearchParams',
  },
  ssr: {
    target: 'webworker',
    noExternal: true,
  },
  build: {
    target: 'es2022',
    minify: false,
  },
  optimizeDeps: {
    include: ['hono', 'zod', '@hono/zod-openapi', '@hono/swagger-ui'],
  },
})
