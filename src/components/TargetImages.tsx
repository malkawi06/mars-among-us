import { useState } from 'react'
import { EARTH_URL, TARGETS_URL, type OrbitalImage, type OrbitalImages } from '../lib/orbitalImages'
import type { EarthSite, Target } from '../lib/similarity'

const CREDITS = {
  Mars: 'Mars: Global CTX Mosaic, NASA/JPL/MSSS/The Murray Lab.',
  Moon: 'Moon: LROC NAC south-pole mosaic and Artemis site mosaics (NASA/GSFC/Arizona State University; LMMP/USGS via NASA Moon Trek).',
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
          ? `No close-up image of ${target.name} in this build: it lies outside the LROC south-pole mosaic (85.5°S to the pole), and its LROC site mosaic could not be loaded.`
          : 'Images for this comparison are not available in this build.'}
      </p>
    )
  }

  const pair = [
    { src: TARGETS_URL + targetImage.file, caption: `${target.body}: ${target.name}` },
    { src: EARTH_URL + earthImage.file, caption: `Earth: ${site.name}` },
  ]
  const widthKm = (image: OrbitalImage) => ((image.size * image.metersPerPixel) / 1000).toFixed(1)
  const scale =
    widthKm(targetImage) === widthKm(earthImage)
      ? `Both images about ${widthKm(targetImage)} km across.`
      : `${target.body} image about ${widthKm(targetImage)} km across, Earth image about ${widthKm(earthImage)} km.`
  return (
    <div className="space-y-3">
      <ImagePair key={target.id + site.id} pair={pair} />
      <p className="text-xs text-muted">
        {scale} {CREDITS[target.body]} {EARTH_CREDIT}
      </p>
    </div>
  )
}

/** The two images, either side by side or stacked with a slider that wipes from one to the other. */
function ImagePair({ pair }: { pair: { src: string; caption: string }[] }) {
  const [mode, setMode] = useState<'slider' | 'side'>('slider')
  const [split, setSplit] = useState(50)
  const [left, right] = pair
  const tab = (value: typeof mode, label: string) => (
    <button
      type="button"
      aria-pressed={mode === value}
      onClick={() => setMode(value)}
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        mode === value
          ? 'border-accent bg-accent text-accent-fg'
          : 'border-border text-fg-2 hover:text-fg'
      }`}
    >
      {label}
    </button>
  )
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {tab('slider', 'Slider')}
        {tab('side', 'Side by side')}
      </div>
      {mode === 'slider' ? (
        <figure>
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border">
            <img
              src={right.src}
              alt={right.caption}
              className="absolute inset-0 size-full object-cover"
            />
            <img
              src={left.src}
              alt={left.caption}
              className="absolute inset-0 size-full object-cover"
              style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
            />
            <div
              className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.7)]"
              style={{ left: `${split}%` }}
              aria-hidden
            />
            <span className="absolute top-2 left-2 rounded bg-black/65 px-1.5 py-0.5 text-xs font-medium text-white">
              {left.caption}
            </span>
            <span className="absolute top-2 right-2 rounded bg-black/65 px-1.5 py-0.5 text-xs font-medium text-white">
              {right.caption}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={split}
              onChange={(e) => setSplit(Number(e.target.value))}
              aria-label="Slide between the two images"
              className="absolute inset-0 size-full cursor-ew-resize opacity-0"
            />
          </div>
          <figcaption className="mt-2 text-xs text-muted">
            Drag across the image to compare.
          </figcaption>
        </figure>
      ) : (
        <SideBySide pair={pair} />
      )}
    </div>
  )
}

function SideBySide({ pair }: { pair: { src: string; caption: string }[] }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {pair.map((image) => (
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
    </div>
  )
}
