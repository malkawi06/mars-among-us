/// <reference types="vite/client" />

/** Counts and landform names for the home page, filled in by vite.config.ts at build time. */
declare const __HOME_STATS__: {
  targets: number
  earthSites: number
  purposes: number
  analogSites: number
  landforms: [string, string][]
}
