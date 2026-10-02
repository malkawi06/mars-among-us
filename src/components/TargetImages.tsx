import { LANDFORM_NAMES, type LandformCode } from '../data/analogs'
import {
  EARTH_URL,
  percent,
  strength,
  strongestLandform,
  TARGETS_URL,
  topSpots,
  type EarthScan,
} from '../lib/earthScan'
import type { EarthSite, Target } from '../lib/similarity'
import { SpotImages } from './SpotImages'

const CREDITS = {
  Mars: 'Mars: Global CTX Mosaic, NASA/JPL/MSSS/The Murray Lab.',
  Moon: 'Moon: LROC NAC south-pole mosaic (NASA/GSFC/Arizona State University; LMMP/USGS via NASA Moon Trek).',
}
const EARTH_CREDIT =
  'Earth: Sentinel-2 cloudless 2024 by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2024).'
const MOON_MOSAIC_LIMIT = -85.5

/**
 * A Moon or Mars target image next to an Earth analog's satellite image. The model's clearest
 * landform in the target image is boxed there, and the matching areas are boxed on Earth.
 */
export function TargetImages({
  target,
  site,
  scan,
}: {
  target: Target
  site: EarthSite
  /** null = no images in this build; undefined = still loading. */
  scan: EarthScan | null | undefined
}) {
  if (scan === undefined) return <p className="text-sm text-muted">Loading images…</p>
  const targetImage = scan?.targetImages[target.id]
  const earthImage = scan?.earthImages[site.id]
  if (!scan || !targetImage || !earthImage) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
        {target.body === 'Moon' && target.lat > MOON_MOSAIC_LIMIT
          ? `No close-up image of ${target.name} yet: the 1 m/pixel LROC south-pole mosaic covers 85.5°S to the pole, and this region is at ${Math.abs(target.lat).toFixed(1)}°S.`
          : 'Images for this comparison are not available in this build.'}
      </p>
    )
  }

  const landform = strongestLandform(scan.targets[target.id], scan.classes)
  if (!landform) return null
  const name = LANDFORM_NAMES[landform.code as LandformCode].toLowerCase()
  const targetSpots = topSpots(scan.targets[target.id], scan.classes, landform.code, 1)
  const earthSpots = topSpots(scan.sites[site.id], scan.classes, landform.code)
  const best = earthSpots[0]

  return (
    <div className="space-y-3">
      <SpotImages
        left={{
          src: TARGETS_URL + targetImage.file,
          caption: `${target.body}: ${target.name}`,
          size: targetImage.size,
          spots: targetSpots,
          highlight: true,
        }}
        right={{
          src: EARTH_URL + earthImage.file,
          caption: `Earth: ${site.name}`,
          size: earthImage.size,
          spots: earthSpots,
        }}
        landformName={name}
        note={`Both images about ${((targetImage.size * targetImage.metersPerPixel) / 1000).toFixed(1)} km across; each area about ${(scan.windowMeters / 1000).toFixed(1)} km. ${CREDITS[target.body]} ${EARTH_CREDIT}`}
      />
      <p className="text-sm leading-relaxed text-fg-2">
        <span className="font-medium text-fg">What the images show: </span>
        in the {target.name} image the model sees <strong className="text-fg">{name}</strong> most
        clearly ({percent(landform.probability)}, area 1 on the left).
        {best &&
          ` In the ${site.name} satellite image the closest ${name} area reaches ${percent(best.probability)} (${strength(best.probability)}).`}
        {target.body === 'Moon' &&
          ' The model learned from Mars images, so on Moon images this is a visual hint, not a measurement.'}
      </p>
    </div>
  )
}
