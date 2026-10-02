import type { AnalogSite } from '../data/analogs'
import { EARTH_SITES } from '../data/compare'
import { EARTH_URL, topSpots, type EarthScan, type Spot } from '../lib/earthScan'
import type { LandformPrediction } from '../lib/landformModel'
import { Card } from './Card'

/** Spots at or above this probability are drawn as clear matches; below it as weak ones. */
const CLEAR = 0.4

const percent = (value: number) => `${Math.round(value * 100)}%`
const strength = (p: number) => (p >= 0.6 ? 'strong' : p >= CLEAR ? 'moderate' : 'weak')

/**
 * The uploaded image next to a satellite image of an Earth analog site, with the areas where the
 * model sees the same landform boxed and enlarged, and a plain-language analysis of the match.
 */
export function SimilarSpots({
  userImage,
  site,
  landform,
  scan,
  candidates,
  autoPicked,
}: {
  userImage: string
  site: AnalogSite
  landform: LandformPrediction
  /** null = no satellite images in this build; undefined = still loading. */
  scan: EarthScan | null | undefined
  /** How many sourced analog sites were compared to pick this one. */
  candidates: number
  /** True when the site was chosen because its image looks most like the upload. */
  autoPicked: boolean
}) {
  const image = scan?.images[site.id]
  const spots = scan && image ? topSpots(scan, site.id, landform.code) : []
  const climate = EARTH_SITES.find((s) => s.id === site.id)
  const name = landform.name.toLowerCase()
  const best = spots[0]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <figure className="min-w-0">
          <img
            src={userImage}
            alt="Your image"
            className="aspect-square w-full rounded-xl border-2 border-earth object-cover"
          />
          <figcaption className="mt-2 text-sm font-medium">
            Your image: {landform.name} ({percent(landform.probability)})
          </figcaption>
        </figure>
        <figure className="min-w-0">
          {image ? (
            <div className="relative overflow-hidden rounded-xl border border-border">
              <img
                src={EARTH_URL + image.file}
                alt={`Satellite image of ${site.name}`}
                className="aspect-square w-full object-cover"
              />
              {spots.map((spot, i) => (
                <SpotBox
                  key={`${spot.x}-${spot.y}`}
                  spot={spot}
                  number={i + 1}
                  imageSize={image.size}
                />
              ))}
            </div>
          ) : (
            <div className="grid aspect-square place-items-center rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">
              {scan === undefined ? 'Loading…' : 'No satellite image of this site in this build.'}
            </div>
          )}
          <figcaption className="mt-2 text-sm font-medium">Earth: {site.name}</figcaption>
        </figure>
      </div>

      {image && spots.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold">Side by side, enlarged</h3>
          <ul className="mt-2 grid grid-cols-4 gap-2">
            <li>
              <img
                src={userImage}
                alt=""
                className="aspect-square w-full rounded-lg border-2 border-earth object-cover"
              />
              <p className="mt-1 text-xs text-fg-2">Your image</p>
            </li>
            {spots.map((spot, i) => (
              <li key={`${spot.x}-${spot.y}`}>
                <div
                  role="img"
                  aria-label={`Area ${i + 1}, enlarged`}
                  className={`aspect-square w-full rounded-lg border-2 ${spot.probability >= CLEAR ? 'border-accent' : 'border-dashed border-muted'}`}
                  style={cropStyle(EARTH_URL + image.file, spot, image.size)}
                />
                <p className="mt-1 text-xs text-fg-2">
                  Area {i + 1}: {percent(spot.probability)} {name} ({strength(spot.probability)})
                </p>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">
            Satellite image about {((image.size * image.metersPerPixel) / 1000).toFixed(1)} km
            across; each area about {(scan!.windowMeters / 1000).toFixed(1)} km. Sentinel-2
            cloudless 2024 by EOX IT Services GmbH (contains modified Copernicus Sentinel data
            2024).
          </p>
        </div>
      )}

      <Card title={`Why ${site.name} matches your image`}>
        <ul className="space-y-3 text-sm leading-relaxed text-fg-2">
          <li>
            <span className="font-medium text-fg">1. What the model sees: </span>
            your image looks like <strong className="text-fg">{name}</strong> (
            {percent(landform.probability)} confidence).
          </li>
          {best && (
            <li>
              <span className="font-medium text-fg">2. Where it looks the same on Earth: </span>
              {autoPicked && candidates > 1
                ? `Of the ${candidates} sourced Earth sites for ${name}, this satellite image looks most like yours. `
                : ''}
              {best.probability >= CLEAR ? (
                <>
                  The model sees {name} in area 1 ({percent(best.probability)},{' '}
                  {strength(best.probability)})
                  {spots.length > 1
                    ? ` and in ${spots.length - 1} more boxed area${spots.length > 2 ? 's' : ''}`
                    : ''}
                  . Compare the enlarged areas with your image above.
                </>
              ) : (
                <>
                  The closest area only reaches {percent(best.probability)}, a weak visual match at
                  this scale. The site is still a known analog because of the published evidence in
                  point 3.
                </>
              )}
            </li>
          )}
          <li>
            <span className="font-medium text-fg">3. Why scientists compare them: </span>
            {site.why}
          </li>
          {climate && (
            <li>
              <span className="font-medium text-fg">4. Environment at the site: </span>
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

function SpotBox({ spot, number, imageSize }: { spot: Spot; number: number; imageSize: number }) {
  const clear = spot.probability >= CLEAR
  return (
    <span
      className={`absolute border-2 shadow-[0_0_0_1px_rgba(0,0,0,0.6)] ${clear ? 'border-accent' : 'border-dashed border-white/70'}`}
      style={{
        left: `${(spot.x / imageSize) * 100}%`,
        top: `${(spot.y / imageSize) * 100}%`,
        width: `${(spot.size / imageSize) * 100}%`,
        height: `${(spot.size / imageSize) * 100}%`,
      }}
    >
      <span
        className={`absolute -top-px -left-px px-1.5 text-xs font-semibold ${clear ? 'bg-accent text-accent-fg' : 'bg-black/70 text-white'}`}
      >
        {number} · {percent(spot.probability)}
      </span>
    </span>
  )
}

/** Shows one square of an image, scaled to fill the element. */
function cropStyle(url: string, spot: Spot, imageSize: number) {
  const scale = imageSize / spot.size
  const range = imageSize - spot.size
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: `${scale * 100}%`,
    backgroundPosition: `${range ? (spot.x / range) * 100 : 0}% ${range ? (spot.y / range) * 100 : 0}%`,
  }
}
