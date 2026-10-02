import {
  LANDFORM_NAMES,
  type AnalogSite,
  type Confidence,
  type LandformCode,
} from '../data/analogs'
import { Card } from './Card'
import { ConfidenceBadge } from './ConfidenceBadge'

/** Everything we know about one analog site: image, why it resembles Mars, landforms, sources. */
export function AnalogSiteDetails({ site, onBack }: { site: AnalogSite; onBack: () => void }) {
  return (
    <Card
      title={site.name}
      subtitle={`${site.country} · ${site.lat.toFixed(3)}, ${site.lon.toFixed(3)} (${
        site.precision === 'site' ? 'exact site' : 'approximate area centre'
      })`}
      actions={
        <button type="button" onClick={onBack} className="text-sm text-accent hover:underline">
          ← All sites
        </button>
      }
    >
      {site.image && (
        <figure className="mb-4">
          <img
            src={site.image.url}
            alt={site.name}
            loading="lazy"
            className="w-full rounded-lg border border-border"
          />
          <figcaption className="mt-1 text-xs text-muted">
            <a href={site.image.page} target="_blank" rel="noreferrer" className="hover:underline">
              {site.image.credit}
            </a>
          </figcaption>
        </figure>
      )}
      <p className="leading-relaxed text-fg-2">{site.why}</p>
      <p className="mt-3 text-sm">
        <span className="text-muted">Climate: </span>
        {site.climate}
      </p>

      <h3 className="mt-4 text-sm font-semibold">Analog for</h3>
      <ul className="mt-2 flex flex-wrap gap-2">
        {(Object.entries(site.landforms) as [LandformCode, Confidence][]).map(
          ([code, confidence]) => (
            <li key={code} className="flex items-center gap-1.5 text-sm">
              {LANDFORM_NAMES[code]}
              <ConfidenceBadge confidence={confidence} />
            </li>
          ),
        )}
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
  )
}
