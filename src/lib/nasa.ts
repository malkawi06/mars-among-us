/**
 * Typed helpers for NASA data sources.
 *
 * - api.nasa.gov endpoints (APOD, NeoWs) use VITE_NASA_API_KEY, falling back to DEMO_KEY.
 * - DONKI (space weather) moved to NASA CCMC on 2026-09-30 and needs no key. Requests go through
 *   the /api/donki proxy (vite.config.ts in dev, vercel.json in production) so CORS can't block them.
 * - GIBS imagery tiles need no key: build tile URLs with gibsTileUrl().
 *
 * JSON responses are cached in memory per URL, so revisiting a page or a date does not spend
 * rate limit. Failed requests are never cached, so a retry hits the network.
 * Pair these helpers with the useAsync hook to get loading and error state in components.
 */

import { today } from './date'

const API_ROOT = 'https://api.nasa.gov'
const DONKI_ROOT = '/api/donki'
const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

export const NASA_API_KEY: string = import.meta.env.VITE_NASA_API_KEY?.trim() || 'DEMO_KEY'
export const usingDemoKey = NASA_API_KEY === 'DEMO_KEY'

/** Error thrown by every helper here. `status` is the HTTP status, or 0 for network failures. */
export class NasaApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'NasaApiError'
    this.status = status
  }
}

// ---------------------------------------------------------------------------
// Fetch + cache
// ---------------------------------------------------------------------------

interface CacheEntry {
  expiresAt: number
  value: Promise<unknown>
}

const cache = new Map<string, CacheEntry>()

export function clearNasaCache(): void {
  cache.clear()
}

type QueryParams = Record<string, string | number | boolean | undefined>

/** Adds query parameters to a URL, skipping empty values. Relative URLs resolve against the site. */
export function withParams(base: string, params: QueryParams): string {
  const url = new URL(base, window.location.origin)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  }
  return url.toString()
}

/**
 * GET a URL and parse JSON, with in-memory caching and readable errors.
 * Concurrent calls for the same URL share one request.
 * Use it for any JSON API, e.g. NASA POWER: cachedJson(withParams('https://power.larc.nasa.gov/...', {...})).
 */
export function cachedJson<T>(url: string, ttlMs = 10 * MINUTE): Promise<T> {
  const hit = cache.get(url)
  if (hit && hit.expiresAt > Date.now()) return hit.value as Promise<T>

  const value = fetchJson<T>(url)
  cache.set(url, { expiresAt: Date.now() + ttlMs, value })
  value.catch(() => {
    if (cache.get(url)?.value === value) cache.delete(url)
  })
  return value
}

/** GET an api.nasa.gov path (the API key is added for you). For endpoints without a helper yet. */
export function nasaGet<T>(path: string, params: QueryParams = {}, ttlMs?: number): Promise<T> {
  return cachedJson<T>(withParams(API_ROOT + path, { ...params, api_key: NASA_API_KEY }), ttlMs)
}

async function fetchJson<T>(url: string): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { headers: { Accept: 'application/json' } })
  } catch {
    throw new NasaApiError(
      'Could not reach the NASA API. Check your internet connection, or wait if the rate limit was hit.',
      0,
    )
  }
  if (!response.ok) {
    throw new NasaApiError(await describeError(response), response.status)
  }
  // DONKI answers 200 with an empty body when there are no results.
  const text = await response.text()
  if (!text) return null as T
  try {
    return JSON.parse(text) as T
  } catch {
    throw new NasaApiError(
      'The API answered with something other than JSON. The endpoint may have moved: check its documentation.',
      response.status,
    )
  }
}

async function describeError(response: Response): Promise<string> {
  const { status } = response
  if (status === 429) {
    return usingDemoKey
      ? 'DEMO_KEY rate limit reached. Get a free key at api.nasa.gov and set VITE_NASA_API_KEY.'
      : 'API rate limit reached. Wait a few minutes and try again.'
  }
  if (status === 403) {
    return 'api.nasa.gov rejected the API key. Check VITE_NASA_API_KEY.'
  }
  const detail = await readErrorDetail(response)
  if (status >= 500) {
    return `NASA's server had a problem (HTTP ${status}${detail ? `: ${detail}` : ''}). The request got through, so your setup is fine. Try again later or pick another date.`
  }
  return detail ? `${detail} (HTTP ${status})` : `NASA API request failed (HTTP ${status}).`
}

/** api.nasa.gov errors come as `{ error: { message } }`, `{ msg }`, or `{ message }`. */
async function readErrorDetail(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json()
    if (typeof body !== 'object' || body === null) return undefined
    const record = body as { error?: { message?: unknown }; msg?: unknown; message?: unknown }
    const detail = record.error?.message ?? record.msg ?? record.message
    return typeof detail === 'string' ? detail : undefined
  } catch {
    return undefined
  }
}

// ---------------------------------------------------------------------------
// APOD: Astronomy Picture of the Day
// https://github.com/nasa/apod-api
// ---------------------------------------------------------------------------

export interface Apod {
  date: string
  title: string
  explanation: string
  media_type: 'image' | 'video' | 'other'
  /** Image URL, or an embeddable video URL when media_type is "video". Absent for "other". */
  url?: string
  hdurl?: string
  /** Video thumbnail (we request thumbs=true). */
  thumbnail_url?: string
  copyright?: string
}

/** APOD for a date (YYYY-MM-DD, from 1995-06-16). Omit the date for today's picture. */
export function apod(options: { date?: string } = {}): Promise<Apod> {
  return nasaGet<Apod>('/planetary/apod', { date: options.date, thumbs: true }, HOUR)
}

// ---------------------------------------------------------------------------
// NeoWs: Near-Earth objects by closest-approach date
// https://api.nasa.gov (Asteroids - NeoWs)
// ---------------------------------------------------------------------------

export interface NeoCloseApproach {
  close_approach_date: string
  close_approach_date_full?: string
  orbiting_body: string
  /** Numbers arrive as strings. */
  relative_velocity: { kilometers_per_second: string; kilometers_per_hour: string }
  miss_distance: { astronomical: string; lunar: string; kilometers: string }
}

export interface NearEarthObject {
  id: string
  name: string
  nasa_jpl_url: string
  absolute_magnitude_h: number
  is_potentially_hazardous_asteroid: boolean
  estimated_diameter: {
    meters: { estimated_diameter_min: number; estimated_diameter_max: number }
  }
  close_approach_data: NeoCloseApproach[]
}

export interface NeoFeed {
  element_count: number
  /** Keyed by date (YYYY-MM-DD). */
  near_earth_objects: Record<string, NearEarthObject[]>
}

/** Asteroids by closest-approach date. The range can span at most 7 days. Defaults to today. */
export function neoFeed(options: { startDate?: string; endDate?: string } = {}): Promise<NeoFeed> {
  const startDate = options.startDate ?? today()
  return nasaGet<NeoFeed>('/neo/rest/v1/feed', {
    start_date: startDate,
    end_date: options.endDate ?? startDate,
  })
}

// ---------------------------------------------------------------------------
// DONKI: Space weather notifications (NASA CCMC, no API key)
// Docs: https://ccmc.gsfc.nasa.gov/tools/DONKI/#donki-webservice-calls-api
// /api/donki/<endpoint> is proxied to https://ccmc.gsfc.nasa.gov/DONKI-API/get/<endpoint>
// ---------------------------------------------------------------------------

export type DonkiNotificationType =
  'all' | 'FLR' | 'SEP' | 'CME' | 'IPS' | 'MPC' | 'GST' | 'RBE' | 'report'

export interface DonkiNotification {
  messageType: string
  messageID: string
  messageURL: string
  messageIssueTime: string
  messageBody: string
}

/** Space weather notifications, newest first. The API defaults to the last 7 days (max 30). */
export async function donkiNotifications(
  options: { startDate?: string; endDate?: string; type?: DonkiNotificationType } = {},
): Promise<DonkiNotification[]> {
  const notifications = await cachedJson<DonkiNotification[] | null>(
    withParams(`${DONKI_ROOT}/notifications`, {
      startDate: options.startDate,
      endDate: options.endDate,
      type: options.type ?? 'all',
    }),
  )
  return [...(notifications ?? [])].sort((a, b) =>
    b.messageIssueTime.localeCompare(a.messageIssueTime),
  )
}

// ---------------------------------------------------------------------------
// GIBS: Global Imagery Browse Services (map tiles, no API key)
// Find more layers in Worldview (https://worldview.earthdata.nasa.gov) or the GIBS docs:
// https://nasa-gibs.github.io/gibs-api-docs/available-visualizations/
// ---------------------------------------------------------------------------

export interface GibsLayer {
  /** GIBS layer identifier, e.g. "MODIS_Terra_CorrectedReflectance_TrueColor". */
  id: string
  title: string
  format: 'jpg' | 'png'
  /** N in the layer's GoogleMapsCompatible_LevelN tile matrix set. */
  maxNativeZoom: number
}

/** Layers checked against the GIBS EPSG:3857 endpoint. Add your own here. */
export const GIBS_LAYERS = {
  MODIS_Terra_CorrectedReflectance_TrueColor: {
    id: 'MODIS_Terra_CorrectedReflectance_TrueColor',
    title: 'MODIS Terra true color',
    format: 'jpg',
    maxNativeZoom: 9,
  },
  VIIRS_SNPP_CorrectedReflectance_TrueColor: {
    id: 'VIIRS_SNPP_CorrectedReflectance_TrueColor',
    title: 'VIIRS SNPP true color',
    format: 'jpg',
    maxNativeZoom: 9,
  },
  MODIS_Terra_Land_Surface_Temp_Day: {
    id: 'MODIS_Terra_Land_Surface_Temp_Day',
    title: 'MODIS Terra land surface temperature (day)',
    format: 'png',
    maxNativeZoom: 7,
  },
  IMERG_Precipitation_Rate: {
    id: 'IMERG_Precipitation_Rate',
    title: 'IMERG precipitation rate',
    format: 'png',
    maxNativeZoom: 6,
  },
} as const satisfies Record<string, GibsLayer>

export type GibsLayerId = keyof typeof GIBS_LAYERS

export const DEFAULT_GIBS_LAYER: GibsLayerId = 'MODIS_Terra_CorrectedReflectance_TrueColor'

/** First day of MODIS Terra imagery. */
export const GIBS_MIN_DATE = '2000-02-24'

export const GIBS_ATTRIBUTION =
  'Imagery: <a href="https://earthdata.nasa.gov/gibs">NASA EOSDIS GIBS</a>'

export function resolveGibsLayer(layer: GibsLayerId | GibsLayer): GibsLayer {
  return typeof layer === 'string' ? GIBS_LAYERS[layer] : layer
}

/**
 * Leaflet tile URL template ({z}/{y}/{x}) for a GIBS layer on a date (YYYY-MM-DD),
 * using the Web Mercator (EPSG:3857) WMTS REST endpoint.
 */
export function gibsTileUrl(layer: GibsLayerId | GibsLayer, date: string): string {
  const { id, format, maxNativeZoom } = resolveGibsLayer(layer)
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${id}/default/${date}/GoogleMapsCompatible_Level${maxNativeZoom}/{z}/{y}/{x}.${format}`
}
