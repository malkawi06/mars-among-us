import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { AnalogMap } from '../components/AnalogMap'
import { AnalogSiteDetails } from '../components/AnalogSiteDetails'
import { ConfidenceBadge } from '../components/ConfidenceBadge'
import { PageHeader } from '../components/PageHeader'
import { site as siteConfig } from '../config/site'
import { ANALOG_SITES, LANDFORM_NAMES, analogsFor, type LandformCode } from '../data/analogs'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Analogs() {
  const { analogs: page } = siteConfig
  usePageTitle(page.title)

  // ?landform=cra&site=meteor-crater links straight to a landform and site (the Home page uses it).
  const [params] = useSearchParams()
  const [landform, setLandform] = useState<LandformCode | 'all'>(() => {
    const code = params.get('landform')
    return code && Object.hasOwn(LANDFORM_NAMES, code) ? (code as LandformCode) : 'all'
  })
  const [selectedId, setSelectedId] = useState(() => params.get('site') ?? undefined)

  const sites = landform === 'all' ? ANALOG_SITES : analogsFor(landform).map(({ site }) => site)
  const selected = sites.find((s) => s.id === selectedId)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader title={page.title} intro={page.intro} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AnalogMap
            sites={sites}
            selectedId={selectedId}
            onSelect={setSelectedId}
            className="h-[50vh] min-h-80 lg:h-[640px]"
          />
        </div>

        <div className="space-y-4 lg:col-span-2">
          <label className="block text-sm text-fg-2">
            Landform
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
            <AnalogSiteDetails site={selected} onBack={() => setSelectedId(undefined)} />
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
