import { useEffect, useState } from 'react'
import { CircleMarker, Tooltip, useMap } from 'react-leaflet'
import { Card } from '../components/Card'
import { MapView } from '../components/MapView'
import { PageHeader } from '../components/PageHeader'
import { site as siteConfig } from '../config/site'
import {
  ANALOG_SITES,
  LANDFORM_NAMES,
  analogsFor,
  type AnalogSite,
  type Confidence,
  type LandformCode,
} from '../data/analogs'
import { usePageTitle } from '../hooks/usePageTitle'

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  strong: 'border-emerald-600/40 bg-emerald-600/10 text-emerald-800 dark:text-emerald-300',
  moderate: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  weak: 'border-danger/40 bg-danger/10 text-danger',
}

export default function Analogs() {
  const { analogs: page } = siteConfig
  usePageTitle(page.title)

  const [landform, setLandform] = useState<LandformCode | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string>()

  const sites = landform === 'all' ? ANALOG_SITES : analogsFor(landform).map(({ site }) => site)
  const selected = sites.find((s) => s.id === selectedId)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader title={page.title} intro={page.intro} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MapView
            basemap="satellite"
            gibsLayer={null}
            center={[20, 0]}
            zoom={2}
            className="h-[50vh] min-h-80 lg:h-[640px]"
          >
            {sites.map((s) => (
              <CircleMarker
                key={s.id}
                center={[s.lat, s.lon]}
                radius={s.id === selectedId ? 10 : 7}
                pathOptions={{
                  color: '#ffffff',
                  weight: 2,
                  fillColor: '#e8673a',
                  fillOpacity: 0.9,
                }}
                eventHandlers={{ click: () => setSelectedId(s.id) }}
              >
                <Tooltip>{s.name}</Tooltip>
              </CircleMarker>
            ))}
            <FlyTo site={selected} />
          </MapView>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <label className="block text-sm text-fg-2">
            Mars landform
            <select
              value={landform}
              onChange={(event) => setLandform(event.target.value as LandformCode | 'all')}
              className="mt-1 block h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg"
            >
              <option value="all">All landforms ({ANALOG_SITES.length} sites)</option>
              {(Object.keys(LANDFORM_NAMES) as LandformCode[]).map((code) => (
                <option key={code} value={code}>
                  {LANDFORM_NAMES[code]} ({analogsFor(code).length})
                </option>
              ))}
            </select>
          </label>

          {selected ? (
            <SiteDetails site={selected} onBack={() => setSelectedId(undefined)} />
          ) : (
            <ul className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
              {sites.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(s.id)}
                    className="w-full rounded-xl border border-border bg-surface p-3 text-left hover:border-accent"
                  >
                    <span className="block font-medium">{s.name}</span>
                    <span className="block text-sm text-muted">{s.country}</span>
                    {landform !== 'all' && (
                      <ConfidenceBadge confidence={s.landforms[landform]!} className="mt-2" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

function SiteDetails({ site, onBack }: { site: AnalogSite; onBack: () => void }) {
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

function ConfidenceBadge({
  confidence,
  className = '',
}: {
  confidence: Confidence
  className?: string
}) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${CONFIDENCE_STYLE[confidence]} ${className}`}
    >
      {confidence}
    </span>
  )
}

/** Flies the map to the selected site: close in for exact sites, wider for area centres. */
function FlyTo({ site }: { site?: AnalogSite }) {
  const map = useMap()
  useEffect(() => {
    if (site) map.flyTo([site.lat, site.lon], site.precision === 'site' ? 14 : 10)
  }, [map, site])
  return null
}
