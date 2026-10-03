import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Card } from '../components/Card'
import { ConfidenceBadge } from '../components/ConfidenceBadge'
import { PageHeader } from '../components/PageHeader'
import { TargetImages } from '../components/TargetImages'
import { site as siteConfig } from '../config/site'
import type { Confidence } from '../data/analogs'
import { EARTH_SITES, TARGETS } from '../data/compare'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { loadEarthScan } from '../lib/earthScan'
import { PURPOSES, rank, type FactorResult, type Match, type Score } from '../lib/similarity'

/** Sites shown before "Show all". */
const TOP = 5
/** Fewer scored factors than this and the percentage is flagged as low confidence. */
const MIN_FACTORS = 2
const SCORE_BADGE: Record<Score, Confidence> = { 3: 'strong', 2: 'moderate', 1: 'weak' }

const selectClass =
  'mt-1 block h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg'

export default function Compare() {
  const { compare: page } = siteConfig
  usePageTitle(page.title)

  // ?target=moon-2&purpose=training&site=mistastin makes every comparison shareable.
  const [params, setParams] = useSearchParams()
  const target = TARGETS.find((t) => t.id === params.get('target')) ?? TARGETS[0]
  const purposes = PURPOSES.filter((p) => p.bodies.includes(target.body))
  const purpose = purposes.find((p) => p.id === params.get('purpose')) ?? purposes[0]
  const matches = rank(target, purpose, EARTH_SITES)
  const selected = matches.find((m) => m.site.id === params.get('site')) ?? matches[0]
  const { data: scan } = useAsync('earth-scan', loadEarthScan)
  const view = params.get('view') === 'images' ? 'images' : 'scores'
  const [showAll, setShowAll] = useState(false)
  const details = useRef<HTMLDivElement>(null)

  const select = (id: string) => {
    update({ site: id })
    // On narrow screens the details sit above the list: bring them into view.
    if (window.matchMedia('(max-width: 1023px)').matches)
      details.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const update = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    setParams(next, { replace: true })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader title={page.title} intro={page.intro} />

      <div className="grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
        <label className="block text-sm text-fg-2">
          Place on the Moon or Mars
          <select
            value={target.id}
            onChange={(event) => update({ target: event.target.value, site: undefined })}
            className={selectClass}
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
        <label className="block text-sm text-fg-2">
          Analog needed for
          <select
            value={purpose.id}
            onChange={(event) => update({ purpose: event.target.value, site: undefined })}
            className={selectClass}
          >
            {purposes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-4 max-w-3xl text-sm text-fg-2">
        <span className="font-medium text-fg">
          {target.name} ({target.body}, {target.lat.toFixed(2)}, {target.lon.toFixed(2)}):
        </span>{' '}
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

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <ol className="space-y-2" aria-label="Earth sites, best match first">
            {matches.map(
              (match, i) =>
                (showAll || i < TOP || match === selected) && (
                  <li key={match.site.id}>
                    <button
                      type="button"
                      onClick={() => select(match.site.id)}
                      aria-current={match === selected}
                      className={`w-full rounded-xl border bg-surface p-3 text-left transition-colors hover:border-accent ${
                        match === selected ? 'border-accent' : 'border-border'
                      }`}
                    >
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0">
                          <span className="mr-2 text-sm text-muted tabular-nums">{i + 1}.</span>
                          <span className="font-medium">{match.site.name}</span>
                          <span className="block text-sm text-muted">{match.site.country}</span>
                        </span>
                        <Percent match={match} />
                      </span>
                      <MatchBar match={match} />
                    </button>
                  </li>
                ),
            )}
          </ol>
          {matches.length > TOP && (
            <button
              type="button"
              onClick={() => setShowAll((value) => !value)}
              className="mt-3 text-sm text-accent hover:underline"
            >
              {showAll ? `Show top ${TOP} only` : `Show all ${matches.length} Earth sites`}
            </button>
          )}
        </div>

        <div
          ref={details}
          className="order-first scroll-mt-20 space-y-4 lg:order-none lg:sticky lg:top-20 lg:col-span-3 lg:self-start"
        >
          <div
            role="tablist"
            aria-label="Comparison view"
            className="flex gap-1 rounded-lg bg-surface-2 p-1"
          >
            {(['scores', 'images'] as const).map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={view === id}
                onClick={() => update({ view: id === 'images' ? id : undefined })}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === id ? 'bg-surface text-fg shadow-sm' : 'text-muted hover:text-fg'
                }`}
              >
                {id === 'scores' ? 'Scores' : 'Images'}
              </button>
            ))}
          </div>
          <div role="tabpanel">
            {view === 'images' ? (
              <TargetImages target={target} site={selected.site} scan={scan} />
            ) : (
              <MatchDetails
                match={selected}
                targetName={target.name}
                purposeLabel={purpose.label}
              />
            )}
          </div>
          <p className="text-xs text-muted">
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
        </div>
      </div>
    </div>
  )
}

function Percent({ match }: { match: Match }) {
  return (
    <span className="shrink-0 text-lg font-semibold tabular-nums">
      {match.percent === null ? '—' : `${match.percent}%`}
    </span>
  )
}

function MatchBar({ match }: { match: Match }) {
  return (
    <>
      <span className="mt-2 block h-1.5 rounded-full bg-surface-2">
        <span
          className={`block h-1.5 rounded-full ${match.fails ? 'bg-danger' : 'bg-accent'}`}
          style={{ width: `${match.percent ?? 0}%` }}
        />
      </span>
      <span
        className={`mt-1 block text-xs ${!match.fails && match.scored < MIN_FACTORS ? 'text-warning' : 'text-muted'}`}
      >
        {match.fails
          ? 'Too steep for a landing site (8° or more)'
          : `${match.scored < MIN_FACTORS ? 'Low confidence: based on only' : 'Based on'} ${match.scored} of ${match.factors.length} factors`}
      </span>
    </>
  )
}

function MatchDetails({
  match,
  targetName,
  purposeLabel,
}: {
  match: Match
  targetName: string
  purposeLabel: string
}) {
  const { site } = match
  return (
    <Card
      title={`${site.name} vs ${targetName}`}
      subtitle={`${purposeLabel} · ${site.country} · ${site.lat.toFixed(3)}, ${site.lon.toFixed(3)}`}
      actions={<Percent match={match} />}
    >
      {match.fails && (
        <p className="mb-4 rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-fg-2">
          This site is {site.slopeDeg.toFixed(1)}° steep. NASA requires landing slopes under 8°, so
          it is ranked last for this purpose.
        </p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-muted">
            <tr className="border-b border-border">
              <th className="py-2 pr-3 font-medium">Factor</th>
              <th className="py-2 pr-3 font-medium">{targetName}</th>
              <th className="py-2 pr-3 font-medium">This site</th>
              <th className="py-2 font-medium">Match</th>
            </tr>
          </thead>
          <tbody>
            {match.factors.map((f) => (
              <FactorRow key={f.factor} factor={f} />
            ))}
          </tbody>
        </table>
      </div>
      {site.note && <p className="mt-3 text-xs text-muted">Note: {site.note}</p>}
      <p className="mt-3 text-sm">
        <a
          href={site.source}
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:underline"
        >
          Why this site is a {site.analogFor} analog (source)
        </a>
      </p>
    </Card>
  )
}

function FactorRow({ factor }: { factor: FactorResult }) {
  return (
    <tr className="border-b border-border align-top last:border-0">
      <td className="py-2 pr-3 font-medium">{factor.label}</td>
      <td className="py-2 pr-3 text-fg-2">{factor.target}</td>
      <td className="py-2 pr-3 text-fg-2">{factor.earth}</td>
      <td className="py-2">
        {factor.score === null ? (
          <span className="text-xs text-muted">no data</span>
        ) : (
          <ConfidenceBadge confidence={SCORE_BADGE[factor.score]} />
        )}
        <span className="mt-1 block text-xs text-muted">{factor.reason}</span>
      </td>
    </tr>
  )
}
