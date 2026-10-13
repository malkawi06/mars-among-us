import type { ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import type { AnalogSite } from '../data/analogs'
import { GLOSSARY } from '../data/glossary'
import {
  MATERIAL_GROUP,
  scoreLevels,
  type EarthSite,
  type FactorResult,
  type Target,
} from '../lib/similarity'

/** How the Earth values were measured, by data set. */
const EARTH_DATA = {
  climate: {
    title: 'NASA POWER climatology (MERRA-2), 2001–2020',
    url: 'https://power.larc.nasa.gov',
    how: 'Yearly average for the grid cell of about 50 km that contains the site.',
  },
  terrain: {
    title: 'ASTER Global Digital Elevation Model, 30 m (NASA/METI)',
    url: 'https://asterweb.jpl.nasa.gov/gdem.asp',
    how: "Nine elevation points 300 m apart around the site. Slope is measured at the centre point (Horn's method); local relief is the highest point minus the lowest.",
  },
}

const SCORE_WORD = { 3: 'strong', 2: 'partial', 1: 'weak' } as const

interface Props {
  factor: FactorResult
  target: Target
  site: EarthSite
  /** The sourced description of the site from the Earth Analogs data, when there is one. */
  analog?: AnalogSite
}

/** Where both values of one factor come from and how the score was worked out. */
export function FactorEvidence({ factor, target, site, analog }: Props) {
  const levels = scoreLevels(factor.factor, target)
  // A value missing on the Earth side scores a neutral 2 rather than a measured one.
  const neutral = factor.earth === 'not measured' || factor.earth === 'none recorded'
  return (
    <div className="mt-3 space-y-4 rounded-xl border border-border bg-bg/60 p-4 text-sm">
      <Side
        label={`On ${target.body === 'Moon' ? 'the Moon' : 'Mars'}: ${target.name}`}
        value={factor.target}
      >
        <TargetEvidence factor={factor} target={target} />
      </Side>

      <Side label={`On Earth: ${site.name}`} value={factor.earth}>
        <EarthEvidence factor={factor} site={site} analog={analog} />
      </Side>

      {levels.length > 0 && (
        <div>
          <p className="text-xs font-medium tracking-wide text-muted uppercase">How it is scored</p>
          <ul className="mt-2 space-y-1">
            {levels.map((level) => {
              const applied = !neutral && level.score === factor.score
              return (
                <li
                  key={level.score}
                  className={`flex gap-3 rounded-lg px-3 py-2 ${
                    applied ? 'bg-accent/10 text-fg ring-1 ring-accent/40' : 'text-muted'
                  }`}
                >
                  <span className="w-20 shrink-0 font-medium tabular-nums">
                    {level.score} · {SCORE_WORD[level.score]}
                  </span>
                  <span>
                    {level.text}
                    {applied && <span className="ml-1 font-medium text-accent">← this site</span>}
                  </span>
                </li>
              )
            })}
          </ul>
          {neutral && (
            <p className="mt-2 text-xs text-muted">
              Not measured at this site, so it scores a neutral 2 instead of a measured one.
            </p>
          )}
          {factor.factor === 'rock' && <RockKinds factor={factor} target={target} site={site} />}
        </div>
      )}

      {(factor.factor === 'rock' || factor.factor === 'landform' || factor.factor === 'ice') && (
        <Glossary
          terms={
            factor.factor === 'landform'
              ? [...target.landforms, ...site.landforms]
              : factor.factor === 'ice'
                ? ['ice']
                : [...target.materials, ...site.materials]
          }
        />
      )}
    </div>
  )
}

/** What each rock or landform word means, with the source of the meaning. */
function Glossary({ terms }: { terms: string[] }) {
  const entries = [...new Set(terms)].flatMap((term) => GLOSSARY[term] ?? [])
  if (!entries.length) return null
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted uppercase">What the words mean</p>
      <dl className="mt-2 space-y-3">
        {entries.map((entry) => (
          <div key={entry.name}>
            <dt className="font-medium text-fg">{entry.name}</dt>
            <dd className="text-fg-2">
              {entry.meaning} <SourceLink title={entry.source.title} url={entry.source.url} />
              {entry.onMarsOrMoon && (
                <span className="mt-1 block">
                  {entry.onMarsOrMoon.text}{' '}
                  <SourceLink
                    title={entry.onMarsOrMoon.source.title}
                    url={entry.onMarsOrMoon.source.url}
                  />
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function Side({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 font-medium text-fg">{value}</p>
      <div className="mt-1 space-y-1 text-fg-2">{children}</div>
    </div>
  )
}

function TargetEvidence({ factor, target }: { factor: FactorResult; target: Target }) {
  if (factor.factor === 'aridity')
    return <p>No rain falls on the {target.body} today, so the target counts as fully dry.</p>
  const backing = target.sources.filter((s) => s.supports?.includes(factor.factor))
  if (factor.target === 'no data' || !backing.length)
    return (
      <>
        {factor.target === 'no data' && <p>No published value for {target.name} yet.</p>}
        {factor.target !== 'no data' && (
          <p>From the sources listed for {target.name} at the top of the page.</p>
        )}
      </>
    )
  return (
    <ul className="space-y-2">
      {factor.factor === 'landform' && target.setting && <li>{target.setting}</li>}
      {backing.map((s) => (
        <li key={s.url}>
          {s.says && <p>“{s.says}”</p>}
          {/* Measured values are explained in the target's note (instrument, dates, highs and lows). */}
          {!s.says && (factor.factor === 'dailyRange' || factor.factor === 'slope') && (
            <p>{target.note}</p>
          )}
          <SourceLink title={s.title} url={s.url} />
        </li>
      ))}
    </ul>
  )
}

function EarthEvidence({
  factor,
  site,
  analog,
}: {
  factor: FactorResult
  site: EarthSite
  analog?: AnalogSite
}) {
  switch (factor.factor) {
    case 'meanTemp':
    case 'dailyRange':
    case 'aridity':
      return <DataSet data={EARTH_DATA.climate} />
    case 'slope':
    case 'relief':
      return site.slopeDeg === null ? (
        <p>Not measured: the coordinates fall on water, so the elevation model sees the water.</p>
      ) : (
        <DataSet data={EARTH_DATA.terrain} />
      )
    default:
      return analog ? (
        <>
          <p>“{analog.why}”</p>
          <ul className="space-y-0.5">
            {analog.sources.map((s) => (
              <li key={s.url}>
                <SourceLink title={s.title} url={s.url} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <SourceLink title="Source for this site" url={site.source} />
      )
  }
}

function DataSet({ data }: { data: (typeof EARTH_DATA)[keyof typeof EARTH_DATA] }) {
  return (
    <>
      <p>{data.how}</p>
      <SourceLink title={data.title} url={data.url} />
    </>
  )
}

/** Names the kind of each rock, which decides the partial score. */
function RockKinds({
  factor,
  target,
  site,
}: {
  factor: FactorResult
  target: Target
  site: EarthSite
}) {
  const all = [...new Set([...target.materials, ...site.materials])].filter(
    (m) => MATERIAL_GROUP[m],
  )
  if (factor.score === null || !all.length) return null
  return (
    <p className="mt-2 text-xs text-muted">
      Kinds:{' '}
      {all
        .map((m) => `${m}: ${MATERIAL_GROUP[m] === 'ice' ? 'ice' : `${MATERIAL_GROUP[m]} rock`}`)
        .join(' · ')}
    </p>
  )
}

export function SourceLink({ title, url }: { title: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-start gap-1 text-accent hover:underline"
    >
      <ExternalLink className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <span>{title}</span>
    </a>
  )
}
