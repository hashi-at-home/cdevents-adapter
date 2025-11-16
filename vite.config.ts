import { cloudflare } from '@cloudflare/vite-plugin'
import { defineConfig } from 'vite'
import ssrPlugin from 'vite-ssr-components/plugin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Read version from package.json
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'))
const version = packageJson.version || '0.0.0'

export default defineConfig({
  plugins: [cloudflare(), ssrPlugin()],
  define: {
    // Inject version as a global constant at build time
    '__APP_VERSION__': JSON.stringify(version),
    // Also inject package name if needed
    '__APP_NAME__': JSON.stringify(packageJson.name),
  }
})
