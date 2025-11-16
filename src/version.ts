// Application version management
// This file provides centralized access to the application version
// which is injected at build time from package.json

// Global constants are declared in vite-env.d.ts
// No need to redeclare them here

/**
 * Get the current application version
 * This value is injected at build time from package.json
 */
export const getVersion = (): string => {
  // In production, use the build-time injected version
  try {
    // Use try-catch to handle cases where the global might not be defined
    if ((globalThis as any).__APP_VERSION__) {
      return (globalThis as any).__APP_VERSION__;
    }
  } catch (e) {
    // Global not defined, fall through to fallback
  }

  // Fallback for development or when version is not injected
  // This allows the app to work even if the build process doesn't inject the version
  return process.env.APP_VERSION || '0.0.0-dev';
};

/**
 * Get the application name
 */
export const getAppName = (): string => {
  try {
    // Use try-catch to handle cases where the global might not be defined
    if ((globalThis as any).__APP_NAME__) {
      return (globalThis as any).__APP_NAME__;
    }
  } catch (e) {
    // Global not defined, fall through to fallback
  }
  return 'cdevents-adapter';
};

/**
 * Get full version string with app name
 */
export const getFullVersion = (): string => {
  return `${getAppName()}@${getVersion()}`;
};

/**
 * Version information object
 */
export const versionInfo = {
  version: getVersion(),
  name: getAppName(),
  full: getFullVersion(),
} as const;
