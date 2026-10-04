import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { PageHeader } from '../components/PageHeader'
import { TargetImages } from '../components/TargetImages'
import { site as siteConfig } from '../config/site'
import { EARTH_SITES, TARGETS } from '../data/compare'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { loadOrbitalImages } from '../lib/orbitalImages'
import {
  NO_DATA,
  PURPOSES,
  rank,
  type FactorResult,
  type Match,
  type Score,
  type Target,
} from '../lib/similarity'

/** Sites shown before "Show all". */
const TOP = 5
/** Fewer scored factors than this and the scores are flagged as rough. */
const MIN_FACTORS = 2

const SCORE_STYLE: Record<Score, { label: string; bar: string; text: string }> = {
  3: { label: 'strong', bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  2: { label: 'partial', bar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  1: { label: 'weak', bar: 'bg-danger', text: 'text-danger' },
}

const verdict = (match: Match) =>
  match.fails
    ? 'Too steep to land'
    : match.percent === null
      ? 'Not enough data'
      : match.percent >= 75
        ? 'Strong match'
        : match.percent >= 50
          ? 'Partial match'
          : 'Weak match'

export default function Compare() {
  const { compare: page } = siteConfig
  usePageTitle(page.title)

  // ?target=moon-2&purpose=training&site=mistastin&view=images makes every comparison shareable.
  const [params, setParams] = useSearchParams()
  const target = TARGETS.find((t) => t.id === params.get('target')) ?? TARGETS[0]
  const purposes = PURPOSES.filter((p) => p.bodies.includes(target.body))
  const purpose = purposes.find((p) => p.id === params.get('purpose')) ?? purposes[0]
  const matches = rank(target, purpose, EARTH_SITES)
  const selected = matches.find((m) => m.site.id === params.get('site')) ?? matches[0]
  const view = params.get('view') === 'images' ? 'images' : 'scores'
  const { data: images } = useAsync('orbital-images', loadOrbitalImages)
  const [showAll, setShowAll] = useState(false)
  const details = useRef<HTMLDivElement>(null)

  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace: true })
  }

  const select = (id: string) => {
    update({ site: id })
    // On narrow screens the details sit above the list: bring them into view.
    if (window.matchMedia('(max-width: 1023px)').matches)
      details.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader title={page.title} intro={page.intro} />

      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,20rem)_1fr]">
          <label className="block">
            <StepLabel number={1}>Place on the Moon or Mars</StepLabel>
            <select
              value={target.id}
              onChange={(event) => update({ target: event.target.value, site: undefined })}
              className="mt-2 block h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm text-fg"
            >
              {(['Moon', 'Mars'] as const).map((body) => (
                <optgroup
                  key={body}
                  label={body === 'Moon' ? 'Moon: Artemis III landing regions' : 'Mars'}
                >
                  {TARGETS.filter((t) => t.body === body).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <div>
            <StepLabel number={2}>Analog needed for</StepLabel>
            <div role="group" aria-label="Analog needed for" className="mt-2 flex flex-wrap gap-2">
              {purposes.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={p === purpose}
                  onClick={() => update({ purpose: p.id, site: undefined })}
                  className={`h-10 rounded-full border px-4 text-sm font-medium transition-colors ${
                    p === purpose
                      ? 'border-accent bg-accent text-accent-fg'
                      : 'border-border bg-bg text-fg-2 hover:border-accent hover:text-fg'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <TargetSummary target={target} />
      </section>

      {selected.scored < MIN_FACTORS && (
        <p className="mt-4 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-fg-2">
          <span className="font-medium text-fg">Rough scores: </span>
          only {selected.scored} of {selected.factors.length} factors can be scored for{' '}
          {target.name}, so many sites tie. Check the orbital images too.
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="mb-3 text-sm font-medium text-muted">Earth sites, best match first</h2>
          <ol className="space-y-2">
            {matches.map(
              (match, i) =>
                (showAll || i < TOP || match === selected) && (
                  <li key={match.site.id}>
                    <SiteButton
                      match={match}
                      maxSlopeDeg={purpose.maxSlopeDeg}
                      rank={i + 1}
                      selected={match === selected}
                      onSelect={() => select(match.site.id)}
                    />
                  </li>
                ),
            )}
          </ol>
          {matches.length > TOP && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="mt-3 text-sm font-medium text-accent hover:underline"
            >
              {showAll ? `Show top ${TOP} only` : `Show all ${matches.length} Earth sites`}
            </button>
          )}
        </div>

        <div
          ref={details}
          className="order-first scroll-mt-20 lg:order-none lg:sticky lg:top-20 lg:col-span-3 lg:self-start"
        >
          <section className="rounded-2xl border border-border bg-surface">
            <header className="flex items-start justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-xs font-medium tracking-wide text-accent uppercase">
                  #{matches.indexOf(selected) + 1} for {purpose.label.toLowerCase()}
                </p>
                <h2 className="mt-1 text-xl font-semibold">{selected.site.name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {selected.site.country} · {selected.site.lat.toFixed(2)},{' '}
                  {selected.site.lon.toFixed(2)}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-4xl font-semibold tabular-nums">
                  {selected.percent === null ? '—' : `${selected.percent}%`}
                </p>
                <p className="text-sm text-muted">{verdict(selected)}</p>
              </div>
            </header>

            {selected.fails && (
              <p className="mx-5 mb-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-fg-2">
                This site is {selected.site.slopeDeg?.toFixed(1)}° steep. NASA&apos;s Artemis lunar
                lander requires landing slopes under {purpose.maxSlopeDeg}°, so it is ranked last
                for this purpose.
              </p>
            )}

            <div
              role="tablist"
              aria-label="Comparison view"
              className="flex border-b border-border px-5"
            >
              {(['scores', 'images'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={view === id}
                  onClick={() => update({ view: id === 'images' ? id : undefined })}
                  className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                    view === id
                      ? 'border-accent text-fg'
                      : 'border-transparent text-muted hover:text-fg'
                  }`}
                >
                  {id === 'scores' ? 'Why it matches' : 'Seen from orbit'}
                </button>
              ))}
            </div>

            <div role="tabpanel" className="p-5">
              {view === 'images' ? (
                <TargetImages target={target} site={selected.site} images={images} />
              ) : (
                <Factors match={selected} targetName={target.name} />
              )}
            </div>

            <footer className="space-y-2 border-t border-border p-5 text-xs text-muted">
              {selected.site.note && <p>Note: {selected.site.note}</p>}
              <p>
                <a
                  href={selected.site.source}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Why this site is a {selected.site.analogFor} analog (source)
                </a>
              </p>
              <p>
                {page.method}{' '}
                <a
                  href={page.methodSource}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  Stern et al. 2025
                </a>
              </p>
            </footer>
          </section>
        </div>
      </div>
    </div>
  )
}

function StepLabel({ number, children }: { number: number; children: string }) {
  return (
    <span className="flex items-center gap-2 text-sm font-medium">
      <span className="grid size-5 place-items-center rounded-full bg-accent text-xs text-accent-fg">
        {number}
      </span>
      {children}
    </span>
  )
}

function TargetSummary({ target }: { target: Target }) {
  return (
    <div className="mt-4 flex flex-wrap items-start gap-x-3 gap-y-1 border-t border-border pt-4 text-sm">
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          target.body === 'Mars' ? 'bg-accent/15 text-accent' : 'bg-surface-2 text-fg-2'
        }`}
      >
        {target.body}
      </span>
      <span className="font-medium">{target.name}</span>
      <span className="text-muted tabular-nums">
        {target.lat.toFixed(2)}, {target.lon.toFixed(2)}
      </span>
      <p className="w-full text-fg-2">
        {target.note}{' '}
        {target.sources.map((url, i) => (
          <a
            key={url}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="mr-1 text-accent hover:underline"
          >
            [source {i + 1}]
          </a>
        ))}
      </p>
    </div>
  )
}

function SiteButton({
  match,
  maxSlopeDeg,
  rank,
  selected,
  onSelect,
}: {
  match: Match
  maxSlopeDeg?: number
  rank: number
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:border-accent ${
        selected ? 'border-accent bg-accent/5' : 'border-border bg-surface'
      }`}
    >
      <span className="w-5 shrink-0 text-center text-sm text-muted tabular-nums">{rank}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{match.site.name}</span>
        <span className="block truncate text-xs text-muted">
          {match.fails ? `Too steep to land (${maxSlopeDeg}° or more)` : match.site.country}
        </span>
        <span className="mt-2 block h-1 rounded-full bg-surface-2">
          <span
            className={`block h-1 rounded-full ${match.fails ? 'bg-danger' : 'bg-accent'}`}
            style={{ width: `${match.percent ?? 0}%` }}
          />
        </span>
      </span>
      <span className="w-12 shrink-0 text-right font-semibold tabular-nums">
        {match.percent === null ? '—' : `${match.percent}%`}
      </span>
    </button>
  )
}

function Factors({ match, targetName }: { match: Match; targetName: string }) {
  const scored = match.factors.filter((f) => f.score !== null)
  const noData = match.factors.filter((f) => f.score === null && f.target === NO_DATA)
  const leftOut = match.factors.filter((f) => f.score === null && f.target !== NO_DATA)
  return (
    <>
      <ul className="divide-y divide-border">
        {scored.map((f) => (
          <FactorRow key={f.factor} factor={f} targetName={targetName} />
        ))}
      </ul>
      {noData.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          Not scored (no sourced value for {targetName} yet):{' '}
          {noData.map((f) => f.label.toLowerCase()).join(', ')}.
        </p>
      )}
      {leftOut.map((f) => (
        <p key={f.factor} className="mt-3 text-xs text-muted">
          {f.label}: {f.reason}
        </p>
      ))}
    </>
  )
}

function FactorRow({ factor, targetName }: { factor: FactorResult; targetName: string }) {
  const style = SCORE_STYLE[factor.score!]
  return (
    <li className="flex items-start justify-between gap-4 py-3 first:pt-0">
      <div className="min-w-0">
        <p className="font-medium">{factor.label}</p>
        <p className="mt-0.5 text-sm text-fg-2">
          {targetName}: {factor.target} · This site: {factor.earth}
        </p>
        <p className="mt-0.5 text-xs text-muted">{factor.reason}</p>
      </div>
      <div className="shrink-0 text-right">
        <span className="flex gap-1" aria-hidden>
          {[1, 2, 3].map((n) => (
            <span
              key={n}
              className={`h-1.5 w-5 rounded-full ${n <= factor.score! ? style.bar : 'bg-surface-2'}`}
            />
          ))}
        </span>
        <span className={`mt-1 block text-xs font-medium ${style.text}`}>{style.label}</span>
      </div>
    </li>
  )
}
