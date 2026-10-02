/**
 * Orbital images of the Earth analog sites and the Moon/Mars targets, and the landform model's scan
 * of them. Made at deploy time by scripts/fetch_earth_images.py and scripts/scan_earth_images.py.
 */

import type { LandformCode } from '../data/analogs'

export const EARTH_URL = `${import.meta.env.BASE_URL}earth/`
export const TARGETS_URL = `${import.meta.env.BASE_URL}targets/`

export interface OrbitalImage {
  file: string
  /** Width and height in pixels (the images are square). */
  size: number
  metersPerPixel: number
}

/** Spots at or above this probability are drawn as clear matches; below it as weak ones. */
export const CLEAR = 0.4

export const percent = (value: number) => `${Math.round(value * 100)}%`
export const strength = (p: number) => (p >= 0.6 ? 'strong' : p >= CLEAR ? 'moderate' : 'weak')

/** One scanned square of an image. */
export interface Spot {
  x: number
  y: number
  size: number
  /** Model probability of the landform asked about. */
  probability: number
}

type Windows = { x: number; y: number; size: number; p: number[] }[]

export interface EarthScan {
  earthImages: Record<string, OrbitalImage>
  targetImages: Record<string, OrbitalImage>
  windowMeters: number
  classes: string[]
  sites: Record<string, Windows>
  targets: Record<string, Windows>
}

async function json<T>(url: string): Promise<T | null> {
  const response = await fetch(url)
  // Missing files come back as index.html or a 404.
  if (!response.ok || !response.headers.get('content-type')?.includes('json')) return null
  return response.json()
}

/** Returns null when the deploy step did not produce the images (e.g. in local development). */
export async function loadEarthScan(): Promise<EarthScan | null> {
  const [earthImages, targetImages, scan] = await Promise.all([
    json<Record<string, OrbitalImage>>(EARTH_URL + 'index.json'),
    json<Record<string, OrbitalImage>>(TARGETS_URL + 'index.json'),
    json<Omit<EarthScan, 'earthImages' | 'targetImages'>>(EARTH_URL + 'scan.json'),
  ])
  if (!earthImages || !scan) return null
  return { ...scan, targets: scan.targets ?? {}, earthImages, targetImages: targetImages ?? {} }
}

/** The best non-overlapping squares for a landform, strongest first. */
export function topSpots(
  windows: Windows | undefined,
  classes: string[],
  code: string,
  count = 3,
): Spot[] {
  const index = classes.indexOf(code)
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
  return topSpots(scan.sites[siteId], scan.classes, code, 1)[0]?.probability ?? null
}

/**
 * The landform the model is most sure of anywhere in an image: the class with the highest
 * single-square probability (a crater fills only a few squares, so an average would hide it).
 */
export function strongestLandform(windows: Windows | undefined, classes: string[]) {
  if (!windows?.length) return null
  const best = classes.map((_, i) => Math.max(...windows.map((w) => w.p[i])))
  const index = best.indexOf(Math.max(...best))
  return { code: classes[index], probability: best[index] }
}
