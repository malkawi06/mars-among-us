import { useState } from 'react'
import type { AnalogSite } from '../data/analogs'
import { EARTH_SITES } from '../data/compare'
import { useAsync } from '../hooks/useAsync'
import { scanForLandform, type LandformPrediction, type ScanResult } from '../lib/landformModel'
import { Card } from './Card'
import { LoadingState } from './LoadingState'

const EARTH_URL = `${import.meta.env.BASE_URL}earth/`
/** Window width on the ground, close to the ~1.2 km tiles the model was trained on. */
const WINDOW_M = 1500
/** A box is drawn only if the model gives the landform at least this probability. */
const MIN_PROBABILITY = 0.4
const MAX_BOXES = 5

/** One entry of earth/index.json (written by scripts/fetch_earth_images.py at deploy time). */
interface EarthImage {
  file: string
  size: number
  metersPerPixel: number
}

/**
 * The uploaded image next to a satellite image of an Earth analog site, with boxes where the
 * model sees the same landform, and a plain-language analysis of why the two are compared.
 */
export function SimilarSpots({
  userImage,
  site,
  landform,
}: {
  userImage: string
  site: AnalogSite
  landform: LandformPrediction
}) {
  const { data: index, loading: indexLoading } = useAsync('earth-index', loadEarthIndex)
  const earth = index?.[site.id]
  const windowPx = earth ? Math.round(WINDOW_M / earth.metersPerPixel) : 0
  const [progress, setProgress] = useState(0)
  const {
    data: scan,
    error,
    loading,
  } = useAsync(earth ? `${site.id}:${landform.code}` : null, () =>
    scanEarthImage(EARTH_URL + earth!.file, landform, windowPx, setProgress),
  )
  const boxes = scan ? strongestSpots(scan) : []
  const climate = EARTH_SITES.find((s) => s.id === site.id)
  const landformName = landform.name.toLowerCase()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <figure className="min-w-0">
          <img
            src={userImage}
            alt="Your image"
            className="aspect-square w-full rounded-xl border border-border object-cover"
          />
          <figcaption className="mt-2 text-sm font-medium">
            Your image: {landform.name} ({Math.round(landform.probability * 100)}%)
          </figcaption>
        </figure>
        <figure className="min-w-0">
          {earth ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              <img
                src={EARTH_URL + earth.file}
                alt={`Satellite image of ${site.name}`}
                className="aspect-square w-full object-cover"
              />
              {boxes.map((box, i) => (
                <span
                  key={`${box.x}-${box.y}`}
                  className="absolute border-2 border-accent shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
                  style={{
                    left: `${(box.x / earth.size) * 100}%`,
                    top: `${(box.y / earth.size) * 100}%`,
                    width: `${(box.size / earth.size) * 100}%`,
                    height: `${(box.size / earth.size) * 100}%`,
                  }}
                >
                  <span className="absolute -top-px -left-px bg-accent px-1.5 text-xs font-semibold text-accent-fg">
                    {i + 1}
                  </span>
                </span>
              ))}
            </div>
          ) : (
            <div className="grid aspect-square place-items-center rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
              {indexLoading ? 'Loading…' : 'No satellite image of this site is available yet.'}
            </div>
          )}
          <figcaption className="mt-2 text-sm font-medium">Earth: {site.name}</figcaption>
        </figure>
      </div>

      {earth && (
        <p className="text-xs text-muted">
          Satellite image about {((earth.size * earth.metersPerPixel) / 1000).toFixed(1)} km across;
          each box about {(WINDOW_M / 1000).toFixed(1)} km. Sentinel-2 cloudless 2024 by EOX IT
          Services GmbH (contains modified Copernicus Sentinel data 2024).
        </p>
      )}
      {loading && (
        <div>
          <LoadingState
            label={`Scanning the satellite image for ${landformName}… ${Math.round(progress * 100)}%`}
            className="py-3"
          />
          <div className="h-1.5 rounded-full bg-surface-2">
            <div
              className="h-1.5 rounded-full bg-accent transition-[width]"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}
      {error && (
        <p className="text-sm text-danger">Could not scan the satellite image: {error.message}</p>
      )}

      <Card title={`Why ${site.name} matches your image`}>
        <ul className="space-y-3 text-sm leading-relaxed text-fg-2">
          <li>
            <span className="font-medium text-fg">What the model sees: </span>
            your image looks like <strong className="text-fg">{landformName}</strong> (
            {Math.round(landform.probability * 100)}% confidence).
          </li>
          {scan && (
            <li>
              <span className="font-medium text-fg">In the satellite image: </span>
              {boxes.length ? (
                <>
                  the model found {boxes.length} area{boxes.length > 1 ? 's' : ''} that look like{' '}
                  {landformName}:{' '}
                  {boxes
                    .map((box, i) => `box ${i + 1} ${Math.round(box.probability * 100)}%`)
                    .join(', ')}
                  .
                </>
              ) : (
                <>
                  the model did not find a clear {landformName} area at this scale. The published
                  evidence below is why the site is still a known analog.
                </>
              )}
            </li>
          )}
          <li>
            <span className="font-medium text-fg">Why scientists compare them: </span>
            {site.why}
          </li>
          {climate && (
            <li>
              <span className="font-medium text-fg">Environment at the site: </span>
              mean {climate.meanTempC.toFixed(1)} °C, about {climate.precipMmYr} mm of rain a year,
              slope {climate.slopeDeg.toFixed(1)}° (NASA POWER 2001–2020; ASTER 30 m elevation
              model). Mars today is about −65 °C with no rain (NASA).
            </li>
          )}
          <li className="text-xs text-muted">
            The model learned from Mars images, so on Earth images the boxes point to
            similar-looking areas; they are not proof on their own. The sources are the evidence.
          </li>
        </ul>
        <h3 className="mt-4 text-sm font-semibold">Sources</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {site.sources.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                {source.title}
              </a>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

async function loadEarthIndex(): Promise<Record<string, EarthImage>> {
  const response = await fetch(`${EARTH_URL}index.json`)
  // Images are added at deploy time; without them the host answers with index.html or a 404.
  if (!response.ok || !response.headers.get('content-type')?.includes('json')) return {}
  return response.json()
}

async function scanEarthImage(
  url: string,
  landform: LandformPrediction,
  windowPx: number,
  onProgress: (done: number) => void,
): Promise<ScanResult[]> {
  const image = new Image()
  image.src = url
  await image.decode()
  onProgress(0)
  return scanForLandform(image, landform.code, windowPx, onProgress)
}

/** Highest-scoring windows above the threshold, skipping ones that mostly overlap a better one. */
function strongestSpots(results: ScanResult[]): ScanResult[] {
  const picked: ScanResult[] = []
  for (const r of [...results].sort((a, b) => b.probability - a.probability)) {
    if (r.probability < MIN_PROBABILITY || picked.length === MAX_BOXES) break
    const overlaps = picked.some(
      (p) => Math.abs(p.x - r.x) < r.size * 0.75 && Math.abs(p.y - r.y) < r.size * 0.75,
    )
    if (!overlaps) picked.push(r)
  }
  return picked
}
