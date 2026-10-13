import { ArrowLeft, BookOpenText, Crosshair, GitCompareArrows, Thermometer } from 'lucide-react'
import { Link } from 'react-router'
import {
  LANDFORM_NAMES,
  type AnalogSite,
  type Confidence,
  type LandformCode,
} from '../data/analogs'
import { EARTH_SITES, TARGETS } from '../data/compare'
import { Card } from './Card'
import { ConfidenceBadge } from './ConfidenceBadge'
import { SourceLink } from './FactorEvidence'

/** Everything we know about one analog site: image, why it resembles Mars, landforms, sources. */
export function AnalogSiteDetails({ site, onBack }: { site: AnalogSite; onBack: () => void }) {
  // Sites that are also scored on the Compare page link there, against the first place on the
  // body they are an analog for.
  const scored = EARTH_SITES.find((s) => s.id === site.id)
  const target = scored && TARGETS.find((t) => t.body === scored.analogFor)

  return (
    <Card
      title={site.name}
      subtitle={site.country}
      actions={
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 py-2 text-sm text-accent hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          All sites
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

      <ul className="mt-4 space-y-2 text-sm">
        <li className="flex items-start gap-2">
          <Crosshair className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <span>
            {site.lat.toFixed(3)}, {site.lon.toFixed(3)}{' '}
            <span className="text-muted">
              (
              {site.precision === 'site'
                ? 'the pin marks the feature itself'
                : 'approximate centre of the area'}
              )
            </span>
          </span>
        </li>
        <li className="flex items-start gap-2">
          <Thermometer className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
          <span>{site.climate}</span>
        </li>
      </ul>

      <h3 className="mt-4 text-sm font-semibold">Analog for</h3>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {(Object.entries(site.landforms) as [LandformCode, Confidence][]).map(
          ([code, confidence]) => (
            <li key={code} className="flex items-center gap-1.5 text-sm">
              {LANDFORM_NAMES[code]}
              <ConfidenceBadge confidence={confidence} />
            </li>
          ),
        )}
      </ul>

      <h3 className="mt-4 flex items-center gap-2 text-sm font-semibold">
        <BookOpenText className="size-4 text-accent" aria-hidden />
        Sources
      </h3>
      <ul className="mt-2 space-y-1.5 text-sm">
        {site.sources.map((source) => (
          <li key={source.url}>
            <SourceLink title={source.title} url={source.url} />
          </li>
        ))}
      </ul>

      {target && (
        <Link
          to={`/compare?target=${target.id}&site=${site.id}`}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-accent hover:text-accent"
        >
          <GitCompareArrows className="size-4" aria-hidden />
          Score it against {target.name} on the Compare page
        </Link>
      )}
    </Card>
  )
}
