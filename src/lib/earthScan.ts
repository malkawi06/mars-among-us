/**
 * Satellite images of the Earth analog sites, and the landform model's scan of them.
 * Both are made at deploy time by scripts/fetch_earth_images.py and scripts/scan_earth_images.py.
 */

import type { LandformCode } from '../data/analogs'

export const EARTH_URL = `${import.meta.env.BASE_URL}earth/`

export interface EarthImage {
  file: string
  /** Width and height in pixels (the images are square). */
  size: number
  metersPerPixel: number
}

/** One scanned square of a satellite image. */
export interface Spot {
  x: number
  y: number
  size: number
  /** Model probability of the landform asked about. */
  probability: number
}

export interface EarthScan {
  images: Record<string, EarthImage>
  windowMeters: number
  classes: string[]
  sites: Record<string, { x: number; y: number; size: number; p: number[] }[]>
}

/** Returns null when the deploy step did not produce the images (e.g. in local development). */
export async function loadEarthScan(): Promise<EarthScan | null> {
  const [images, scan] = await Promise.all(
    ['index.json', 'scan.json'].map(async (file) => {
      const response = await fetch(EARTH_URL + file)
      // Missing files come back as index.html or a 404.
      if (!response.ok || !response.headers.get('content-type')?.includes('json')) return null
      return response.json()
    }),
  )
  return images && scan ? { images, ...scan } : null
}

/** The best non-overlapping squares for a landform, strongest first. */
export function topSpots(scan: EarthScan, siteId: string, code: LandformCode, count = 3): Spot[] {
  const index = scan.classes.indexOf(code)
  const windows = scan.sites[siteId]
  if (index < 0 || !windows) return []
  const picked: Spot[] = []
  const ranked = windows
    .map(({ x, y, size, p }) => ({ x, y, size, probability: p[index] }))
    .sort((a, b) => b.probability - a.probability)
  for (const spot of ranked) {
    if (picked.length === count) break
    const overlaps = picked.some(
      (p) => Math.abs(p.x - spot.x) < spot.size * 0.75 && Math.abs(p.y - spot.y) < spot.size * 0.75,
    )
    if (!overlaps) picked.push(spot)
  }
  return picked
}

/** How much a site's satellite image looks like the landform: its best square's probability. */
export function visualMatch(scan: EarthScan, siteId: string, code: LandformCode): number | null {
  return topSpots(scan, siteId, code, 1)[0]?.probability ?? null
}
