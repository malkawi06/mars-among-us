/// <reference types="vite/client" />

/** Counts and landform names for the home page, filled in by vite.config.ts at build time. */
declare const __HOME_STATS__: {
  targets: number
  earthSites: number
  purposes: number
  analogSites: number
  landforms: [string, string][]
  /** The best Earth match for one Moon region and purpose, computed from the data at build time. */
  example: {
    targetId: string
    targetName: string
    purposeId: string
    purposeLabel: string
    siteId: string
    siteName: string
    siteCountry: string
    percent: number | null
    factors: { label: string; score: 1 | 2 | 3; reason: string }[]
    notScored: string[]
  }
}
