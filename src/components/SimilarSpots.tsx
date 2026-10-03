import type { AnalogSite } from '../data/analogs'
import { EARTH_SITES } from '../data/compare'
import { CLEAR, EARTH_URL, percent, strength, topSpots, type EarthScan } from '../lib/earthScan'
import type { LandformPrediction } from '../lib/landformModel'
import { Card } from './Card'
import { SpotImages } from './SpotImages'

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
  const image = scan?.earthImages[site.id]
  const spots = scan && image ? topSpots(scan.sites[site.id], scan.classes, landform.code) : []
  const climate = EARTH_SITES.find((s) => s.id === site.id)
  const name = landform.name.toLowerCase()
  const best = spots[0]

  return (
    <div className="space-y-4">
      {image ? (
        <SpotImages
          left={{
            src: userImage,
            caption: `Your image: ${landform.name} (${percent(landform.probability)})`,
            highlight: true,
          }}
          right={{
            src: EARTH_URL + image.file,
            caption: `Earth: ${site.name}`,
            size: image.size,
            spots,
          }}
          landformName={name}
          note={`Satellite image about ${((image.size * image.metersPerPixel) / 1000).toFixed(1)} km across; each area about ${(scan!.windowMeters / 1000).toFixed(1)} km. Sentinel-2 cloudless 2024 by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2024).`}
        />
      ) : (
        <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
          {scan === undefined
            ? 'Loading satellite images…'
            : 'No satellite image of this site in this build.'}
        </p>
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
              mean {climate.meanTempC.toFixed(1)} °C, about {climate.precipMmYr} mm of rain a year
              {climate.slopeDeg !== null && `, slope ${climate.slopeDeg.toFixed(1)}°`} (NASA POWER
              2001–2020; ASTER 30 m elevation model). Mars today is about −65 °C with no rain
              (NASA).
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
