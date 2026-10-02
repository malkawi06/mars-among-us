/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** api.nasa.gov key. Optional: the app falls back to DEMO_KEY. */
  readonly VITE_NASA_API_KEY?: string
  /** DONKI API base. Defaults to the /api/donki proxy; set on hosts without a proxy (GitHub Pages). */
  readonly VITE_DONKI_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
