/**
 * Orbital images of the Earth analog sites and the Moon/Mars targets, downloaded at deploy time by
 * scripts/fetch_earth_images.py.
 */

export const EARTH_URL = `${import.meta.env.BASE_URL}earth/`
export const TARGETS_URL = `${import.meta.env.BASE_URL}targets/`

export interface OrbitalImage {
  file: string
  /** Width and height in pixels (the images are square). */
  size: number
  metersPerPixel: number
}

export interface OrbitalImages {
  earth: Record<string, OrbitalImage>
  targets: Record<string, OrbitalImage>
}

async function json<T>(url: string): Promise<T | null> {
  const response = await fetch(url)
  // Missing files come back as index.html or a 404.
  if (!response.ok || !response.headers.get('content-type')?.includes('json')) return null
  return response.json()
}

/** Returns null when the deploy step did not produce the images (e.g. in local development). */
export async function loadOrbitalImages(): Promise<OrbitalImages | null> {
  const [earth, targets] = await Promise.all([
    json<Record<string, OrbitalImage>>(EARTH_URL + 'index.json'),
    json<Record<string, OrbitalImage>>(TARGETS_URL + 'index.json'),
  ])
  return earth ? { earth, targets: targets ?? {} } : null
}
