/// <reference types="vite/client" />

// Global constants injected at build time by Vite
declare const __APP_VERSION__: string;
declare const __APP_NAME__: string;

// Vite environment variables
interface ImportMetaEnv {
  readonly APP_VERSION?: string;
  readonly MODE: string;
  // Add other env variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
