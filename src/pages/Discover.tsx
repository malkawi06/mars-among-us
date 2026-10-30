import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Sparkles, MapPin } from 'lucide-react'
import { DiscoverMap, SHOW_FROM } from '../components/DiscoverMap'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { SheetOnPhone } from '../components/SheetOnPhone'
import { site as siteConfig } from '../config/site'
import { ANALOG_SITES } from '../data/analogs'
import { EARTH_SITES } from '../data/compare'
import { useAsync } from '../hooks/useAsync'
import { DESKTOP } from '../hooks/useMediaQuery'
import { usePageTitle } from '../hooks/usePageTitle'
import {
  TRAITS,
  cellAt,
  cellLat,
  cellLon,
  distanceKm,
  similarity,
  topRegions,
  traitScores,
  type Cells,
} from '../lib/discover'

/** The grid built by scripts/build_discover.py: every 0.5° land cell, about 3 MB. */
async function loadCells(): Promise<Cells> {
  const response = await fetch(`${import.meta.env.BASE_URL}discover/cells.json`)
  if (!response.ok) throw new Error(`Could not load the Discover grid (HTTP ${response.status}).`)
  return (await response.json()) as Cells
}

const DEFAULT_SEED = 'wadi-rum'
/** A region this close to a site on our lists counts as an already known analog. */
const KNOWN_KM = 100
const KNOWN_PLACES = [...EARTH_SITES, ...ANALOG_SITES].map((s) => ({
  name: s.name,
  lat: s.lat,
  lon: s.lon,
}))

export default function Discover() {
  const { discover: page } = siteConfig
  usePageTitle(page.title)
  const { data: cells, error, reload } = useAsync('discover-cells', loadCells)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        eyebrow="Discover"
        title={page.title}
        intro={page.intro}
        photo={siteConfig.photos.hero}
      />
      {error ? (
        <ErrorState title="The Discover grid did not load" error={error} onRetry={reload} />
      ) : !cells ? (
        <LoadingState label="Loading every patch of land on Earth…" className="py-24" />
      ) : (
        <Explorer cells={cells} />
      )}
    </div>
  )
}

function Explorer({ cells }: { cells: Cells }) {
  const { discover: page } = siteConfig
  // ?from=wadi-rum&region=12345 makes every view shareable.
  const [params, setParams] = useSearchParams()
  const seeds = useMemo(
    () =>
      EARTH_SITES.map((s) => ({ site: s, cell: cellAt(cells, s.lat, s.lon) })).filter(
        (s) => s.cell >= 0,
      ),
    [cells],
  )
  const seed =
    seeds.find((s) => s.site.id === params.get('from')) ??
    seeds.find((s) => s.site.id === DEFAULT_SEED)!
  const scores = useMemo(() => {
    const out = new Float32Array(cells.row.length)
    for (let i = 0; i < out.length; i++) out[i] = similarity(cells, seed.cell, i)
    return out
  }, [cells, seed.cell])
  const picks = useMemo(() => topRegions(cells, scores, seed.cell, 10), [cells, scores, seed.cell])
  const knownName = useCallback(
    (i: number) =>
      KNOWN_PLACES.find(
        (k) => distanceKm(k.lat, k.lon, cellLat(cells, i), cellLon(cells, i)) < KNOWN_KM,
      )?.name,
    [cells],
  )
  const known = useMemo(() => new Set(picks.filter((i) => knownName(i))), [picks, knownName])
  const regionParam = Number(params.get('region'))
  const selected = picks.includes(regionParam) ? regionParam : undefined
  const [sheetOpen, setSheetOpen] = useState(
    () => selected !== undefined && !window.matchMedia(DESKTOP).matches,
  )
  const closeSheet = useCallback(() => setSheetOpen(false), [])

  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace: true })
  }
  const select = (i: number) => {
    update({ region: String(i) })
    setSheetOpen(true)
  }
  const newCount = picks.length - known.size

  return (
    <>
      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <label className="block max-w-xl">
          <span className="text-sm font-medium">
            Start from a place already used to study the Moon or Mars
          </span>
          <select
            value={seed.site.id}
            onChange={(e) => update({ from: e.target.value, region: undefined })}
            className="mt-2 block h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg"
          >
            {(['Mars', 'Moon'] as const).map((body) => (
              <optgroup key={body} label={`${body} analogs`}>
                {seeds
                  .filter((s) => s.site.analogFor === body)
                  .map((s) => (
                    <option key={s.site.id} value={s.site.id}>
                      {s.site.name}, {s.site.country}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
        <p className="mt-3 text-sm text-fg-2">
          The map lights up every patch of land at least {SHOW_FROM}% like {seed.site.name}. Of the
          10 closest regions,{' '}
          <span className="font-medium text-accent">
            {newCount} {newCount === 1 ? 'is' : 'are'} not on our list of known analogs
          </span>
          .
        </p>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="-mx-4 lg:col-span-3 lg:mx-0">
          <DiscoverMap
            cells={cells}
            scores={scores}
            seed={seed.cell}
            picks={picks}
            selected={selected}
            known={known}
            onSelect={select}
            className="h-[58svh] min-h-80 lg:h-[640px]"
          />
          <p className="mt-2 px-4 text-xs text-muted lg:px-0">
            White: {seed.site.name}. Orange: new regions. Grey: already known analogs. Yellow is the
            closest match.
          </p>
        </div>

        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-medium text-muted">
            Closest regions, at least 400 km apart
          </h2>
          <ol className="space-y-2">
            {picks.map((i, n) => {
              const name = knownName(i)
              return (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => select(i)}
                    aria-current={i === selected}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-accent ${
                      i === selected ? 'border-accent bg-accent/5' : 'border-border bg-surface'
                    }`}
                  >
                    <span className="w-5 shrink-0 text-center text-sm text-muted tabular-nums">
                      {n + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium tabular-nums">
                        {formatLat(cellLat(cells, i))} {formatLon(cellLon(cells, i))}
                      </span>
                      <span className="block truncate text-xs">
                        {name ? (
                          <span className="text-muted">Known: {name}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-accent">
                            <Sparkles className="size-3" aria-hidden /> Not on our list of analogs
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="w-12 shrink-0 text-right font-semibold tabular-nums">
                      {Math.round(scores[i])}%
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          <p className="mt-2 text-xs text-muted lg:hidden">Tap a region to see why it matches.</p>
        </div>

        {selected !== undefined && (
          <SheetOnPhone
            open={sheetOpen}
            onClose={closeSheet}
            label="Why this region matches"
            className="lg:static lg:col-span-5"
          >
            <RegionDetails
              cells={cells}
              seed={seed.cell}
              seedName={seed.site.name}
              cell={selected}
              rank={picks.indexOf(selected) + 1}
              score={scores[selected]}
              knownName={knownName(selected)}
            />
          </SheetOnPhone>
        )}
      </div>

      <section className="mt-10 border-t border-border pt-6 text-sm text-fg-2">
        <h2 className="text-lg font-semibold text-fg">How Discover works</h2>
        <p className="mt-2 max-w-4xl">{page.method}</p>
        <ul className="mt-3 space-y-1">
          {page.sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function RegionDetails({
  cells,
  seed,
  seedName,
  cell,
  rank,
  score,
  knownName,
}: {
  cells: Cells
  seed: number
  seedName: string
  cell: number
  rank: number
  score: number
  knownName?: string
}) {
  const scores = traitScores(cells, seed, cell)
  const weak = TRAITS.filter((t) => scores[t.id] !== null && scores[t.id]! < 0.5)
  const show = (v: number | string | null, unit: string) =>
    v === null ? 'no data' : typeof v === 'number' ? `${v.toLocaleString('en')} ${unit}` : v
  return (
    <section className="border-border bg-surface lg:rounded-2xl lg:border">
      <header className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-medium tracking-wide text-accent uppercase">
            #{rank} closest to {seedName}
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold tabular-nums">
            <MapPin className="size-5 text-accent" aria-hidden />
            {formatLat(cellLat(cells, cell))} {formatLon(cellLon(cells, cell))}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {knownName
              ? `Already known as an analog: ${knownName}`
              : 'Not on our list of known analogs'}{' '}
            · a patch about 50 km across
          </p>
        </div>
        <p className="shrink-0 text-4xl font-semibold tabular-nums">{Math.round(score)}%</p>
      </header>

      <div className="overflow-x-auto border-t border-border px-5 py-4">
        <table className="w-full min-w-[34rem] text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="py-1 font-medium">Trait</th>
              <th className="py-1 font-medium">{seedName}</th>
              <th className="py-1 font-medium">This region</th>
              <th className="py-1 text-right font-medium">Similarity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TRAITS.map((t) => {
              const s = scores[t.id]
              return (
                <tr key={t.id}>
                  <td className="py-2">
                    <span className="font-medium text-fg">{t.label}</span>
                    <span className="block text-xs text-muted">{t.tolerance}</span>
                  </td>
                  <td className="py-2">{show(t.value(cells, seed), t.unit)}</td>
                  <td className="py-2">{show(t.value(cells, cell), t.unit)}</td>
                  <td className="py-2 text-right tabular-nums">
                    {s === null ? '—' : `${Math.round(s * 100)}%`}
                    <span className="mt-1 ml-auto block h-1 w-20 rounded-full bg-surface-2">
                      <span
                        className={`block h-1 rounded-full ${s !== null && s < 0.5 ? 'bg-danger' : 'bg-accent'}`}
                        style={{ width: `${(s ?? 0) * 100}%` }}
                      />
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-2 border-t border-border p-5 text-sm text-fg-2">
        <h3 className="font-semibold text-fg">Where the analogy breaks down</h3>
        {weak.length > 0 ? (
          <p>
            Weakest here: {weak.map((t) => t.label.toLowerCase()).join(', ')}. Use this region for
            the traits that match, not these.
          </p>
        ) : (
          <p>Every trait we can measure is at least 50% similar.</p>
        )}
        <p>
          Not measured at this scale: landform, ground ice and fine slope. Check them on the
          satellite map before calling it an analog. And no place on Earth reproduces the lower
          gravity, the Moon&apos;s vacuum, Mars&apos;s thin atmosphere or their radiation.
        </p>
      </div>
    </section>
  )
}

const formatLat = (v: number) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? 'N' : 'S'}`
const formatLon = (v: number) => `${Math.abs(v).toFixed(2)}° ${v >= 0 ? 'E' : 'W'}`
