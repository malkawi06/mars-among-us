import { BookOpenText, ListFilter, MapPin, MousePointerClick } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { AnalogMap } from '../components/AnalogMap'
import { AnalogSiteDetails } from '../components/AnalogSiteDetails'
import { ConfidenceBadge } from '../components/ConfidenceBadge'
import { PageHeader } from '../components/PageHeader'
import { site as siteConfig } from '../config/site'
import {
  ANALOG_SITES,
  CONFIDENCE_MEANING,
  LANDFORM_NAMES,
  analogsFor,
  type LandformCode,
} from '../data/analogs'
import { usePageTitle } from '../hooks/usePageTitle'

const GUIDE = [
  { icon: ListFilter, text: 'Pick a landform' },
  { icon: MousePointerClick, text: 'Pick a site on the list or the map' },
  { icon: BookOpenText, text: 'Read why it counts, with its sources' },
]

export default function Analogs() {
  const { analogs: page } = siteConfig
  usePageTitle(page.title)

  // ?landform=cra&site=meteor-crater links straight to a landform and site (the Home page uses it).
  // The filter and the selected site live in the URL, so the current view can be shared.
  const [params, setParams] = useSearchParams()
  const code = params.get('landform')
  const landform = code && Object.hasOwn(LANDFORM_NAMES, code) ? (code as LandformCode) : 'all'
  const selectedId = params.get('site') ?? undefined
  const update = (key: 'landform' | 'site', value: string | undefined) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const setLandform = (value: LandformCode | 'all') => {
    const next = new URLSearchParams(params)
    if (value === 'all') next.delete('landform')
    else next.set('landform', value)
    next.delete('site')
    setParams(next, { replace: true })
  }
  const setSelectedId = (id: string | undefined) => update('site', id)

  const sites = landform === 'all' ? ANALOG_SITES : analogsFor(landform).map(({ site }) => site)
  const selected = sites.find((s) => s.id === selectedId)
  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1.5 text-sm transition-colors ${
      active
        ? 'border-accent bg-accent text-accent-fg'
        : 'border-border bg-surface text-fg-2 hover:border-accent hover:text-fg'
    }`

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader title={page.title} intro={page.intro}>
        <ol className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-2">
          {GUIDE.map(({ icon: Icon, text }, i) => (
            <li key={text} className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-accent/15 text-accent">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="text-muted">{i + 1}.</span> {text}
            </li>
          ))}
        </ol>
      </PageHeader>

      <section aria-label="Landform" className="mb-5">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-medium">
          <ListFilter className="size-4 text-accent" aria-hidden />
          Landform
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={landform === 'all'}
            onClick={() => setLandform('all')}
            className={chip(landform === 'all')}
          >
            All ({ANALOG_SITES.length})
          </button>
          {(Object.keys(LANDFORM_NAMES) as LandformCode[]).map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={landform === code}
              onClick={() => setLandform(code)}
              className={chip(landform === code)}
            >
              {LANDFORM_NAMES[code]} ({analogsFor(code).length})
            </button>
          ))}
        </div>
      </section>

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
          <dl className="space-y-1.5 rounded-xl border border-border bg-surface p-3 text-xs">
            {CONFIDENCE_MEANING.map(([confidence, meaning]) => (
              <div key={confidence} className="flex items-start gap-2">
                <dt className="w-24 shrink-0">
                  <ConfidenceBadge confidence={confidence} />
                </dt>
                <dd className="text-fg-2">{meaning}</dd>
              </div>
            ))}
          </dl>

          {selected ? (
            <AnalogSiteDetails site={selected} onBack={() => setSelectedId(undefined)} />
          ) : (
            <>
              <p className="text-sm text-muted">
                {sites.length} {sites.length === 1 ? 'site' : 'sites'}
                {landform !== 'all' && (
                  <> for {LANDFORM_NAMES[landform].toLowerCase()}, strongest evidence first</>
                )}
              </p>
              <ul className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
                {sites.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(s.id)}
                      className="flex w-full items-start gap-3 rounded-xl border border-border bg-surface p-3 text-left hover:border-accent"
                    >
                      <MapPin className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{s.name}</span>
                        <span className="block text-sm text-muted">{s.country}</span>
                        {landform !== 'all' && (
                          <ConfidenceBadge confidence={s.landforms[landform]!} className="mt-2" />
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
