import { EARTH_URL, TARGETS_URL, type OrbitalImage, type OrbitalImages } from '../lib/orbitalImages'
import type { EarthSite, Target } from '../lib/similarity'

const CREDITS = {
  Mars: 'Mars: Global CTX Mosaic, NASA/JPL/MSSS/The Murray Lab.',
  Moon: 'Moon: LROC NAC south-pole mosaic (NASA/GSFC/Arizona State University; LMMP/USGS via NASA Moon Trek).',
}
const EARTH_CREDIT =
  'Earth: Sentinel-2 cloudless 2024 by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2024).'
const MOON_MOSAIC_LIMIT = -85.5

/** A Moon or Mars target's orbital image next to an Earth analog's satellite image (both 8 m/pixel). */
export function TargetImages({
  target,
  site,
  images,
}: {
  target: Target
  site: EarthSite
  /** null = no images in this build; undefined = still loading. */
  images: OrbitalImages | null | undefined
}) {
  if (images === undefined) return <p className="text-sm text-muted">Loading images…</p>
  const targetImage = images?.targets[target.id]
  const earthImage = images?.earth[site.id]
  if (!targetImage || !earthImage) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
        {target.body === 'Moon' && target.lat > MOON_MOSAIC_LIMIT
          ? `No close-up image of ${target.name} yet: the 1 m/pixel LROC south-pole mosaic covers 85.5°S to the pole, and this region is at ${Math.abs(target.lat).toFixed(1)}°S.`
          : 'Images for this comparison are not available in this build.'}
      </p>
    )
  }

  const widthKm = (image: OrbitalImage) => ((image.size * image.metersPerPixel) / 1000).toFixed(1)
  const scale =
    widthKm(targetImage) === widthKm(earthImage)
      ? `Both images about ${widthKm(targetImage)} km across.`
      : `${target.body} image about ${widthKm(targetImage)} km across, Earth image about ${widthKm(earthImage)} km.`
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {[
          { src: TARGETS_URL + targetImage.file, caption: `${target.body}: ${target.name}` },
          { src: EARTH_URL + earthImage.file, caption: `Earth: ${site.name}` },
        ].map((image) => (
          <figure key={image.src} className="min-w-0">
            <img
              src={image.src}
              alt={image.caption}
              className="aspect-square w-full rounded-xl border border-border object-cover"
            />
            <figcaption className="mt-2 text-sm font-medium">{image.caption}</figcaption>
          </figure>
        ))}
      </div>
      <p className="text-xs text-muted">
        {scale} {CREDITS[target.body]} {EARTH_CREDIT}
      </p>
    </div>
  )
}
