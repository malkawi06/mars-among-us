import { useState } from 'react'
import { Card } from '../components/Card'
import { ErrorState } from '../components/ErrorState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { StatTile } from '../components/StatTile'
import { site } from '../config/site'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { formatDate, today } from '../lib/date'
import {
  apod,
  donkiNotifications,
  neoFeed,
  usingDemoKey,
  type Apod,
  type NeoFeed,
} from '../lib/nasa'

const buttonClass =
  'rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-2'

export default function Data() {
  usePageTitle(site.data.title)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader title={site.data.title} intro={site.data.intro} />
      <ApiKeyNotice />
      <ApodCard />

      <h2 className="mt-10 mb-4 text-xl font-semibold">More endpoints</h2>
      <p className="-mt-2 mb-4 text-sm text-muted">
        These load on click to save rate limit. The helpers live in src/lib/nasa.ts.
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <NeoCard />
        <DonkiCard />
      </div>
    </div>
  )
}

function ApiKeyNotice() {
  if (!usingDemoKey) {
    return <p className="mb-6 text-sm text-muted">Using your API key from VITE_NASA_API_KEY.</p>
  }
  return (
    <div className="mb-6 rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
      <p className="font-semibold text-warning">Using DEMO_KEY</p>
      <p className="mt-1 text-fg-2">
        DEMO_KEY allows about 30 requests per hour. Get a free key at{' '}
        <a
          href="https://api.nasa.gov"
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:underline"
        >
          api.nasa.gov
        </a>{' '}
        and set <code className="rounded bg-surface-2 px-1">VITE_NASA_API_KEY</code> in{' '}
        <code className="rounded bg-surface-2 px-1">.env</code> and in your Vercel project settings.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// APOD
// ---------------------------------------------------------------------------

function ApodCard() {
  // Empty string means "latest": the API picks today's date in US Eastern time.
  const [date, setDate] = useState('')
  const { data, error, loading, reload } = useAsync(`apod:${date}`, () =>
    apod({ date: date || undefined }),
  )

  return (
    <Card
      title="Astronomy Picture of the Day"
      subtitle="GET https://api.nasa.gov/planetary/apod"
      actions={
        <label className="flex items-center gap-2 text-sm text-fg-2">
          Date
          <input
            type="date"
            value={date}
            min="1995-06-16"
            max={today()}
            onChange={(event) => setDate(event.target.value)}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-fg"
          />
        </label>
      }
    >
      {loading && <LoadingState label="Loading APOD…" />}
      {error && <ErrorState title="Could not load APOD" error={error} onRetry={reload} />}
      {data && <ApodContent apod={data} />}
    </Card>
  )
}

function ApodContent({ apod }: { apod: Apod }) {
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-3">
        <ApodMedia apod={apod} />
      </div>
      <div className="lg:col-span-2">
        <p className="text-sm text-muted">{formatDate(apod.date)}</p>
        <h3 className="mt-1 text-2xl font-semibold tracking-tight">{apod.title}</h3>
        {apod.copyright && <p className="mt-1 text-sm text-muted">© {apod.copyright.trim()}</p>}
        <p className="mt-4 leading-relaxed text-fg-2">{apod.explanation}</p>
      </div>
    </div>
  )
}

function ApodMedia({ apod }: { apod: Apod }) {
  const { media_type: type, url, hdurl, thumbnail_url: thumbnail, title } = apod

  if (type === 'image' && url) {
    return (
      <a href={hdurl ?? url} target="_blank" rel="noreferrer">
        <img src={url} alt={title} className="w-full rounded-lg border border-border" />
      </a>
    )
  }
  if (type === 'video' && url) {
    return /\.(mp4|webm|mov)$/i.test(url) ? (
      <video src={url} controls className="w-full rounded-lg border border-border" />
    ) : (
      <iframe
        src={url}
        title={title}
        allowFullScreen
        className="aspect-video w-full rounded-lg border border-border"
      />
    )
  }
  return (
    <a
      href={`https://apod.nasa.gov/apod/ap${apod.date.slice(2).replaceAll('-', '')}.html`}
      target="_blank"
      rel="noreferrer"
      className="block"
    >
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="w-full rounded-lg border border-border" />
      ) : (
        <span className="grid aspect-video place-items-center rounded-lg border border-border bg-surface-2 text-sm text-muted">
          View this entry on apod.nasa.gov
        </span>
      )}
    </a>
  )
}

// ---------------------------------------------------------------------------
// NeoWs
// ---------------------------------------------------------------------------

function NeoCard() {
  const [enabled, setEnabled] = useState(false)
  const { data, error, loading, reload } = useAsync(enabled ? 'neo:today' : null, () => neoFeed())

  return (
    <Card title="Near-Earth objects today" subtitle="GET https://api.nasa.gov/neo/rest/v1/feed">
      {!enabled && (
        <button type="button" onClick={() => setEnabled(true)} className={buttonClass}>
          Load asteroids
        </button>
      )}
      {loading && <LoadingState label="Loading asteroids…" />}
      {error && <ErrorState title="Could not load NeoWs" error={error} onRetry={reload} />}
      {data && <NeoSummary feed={data} />}
    </Card>
  )
}

function NeoSummary({ feed }: { feed: NeoFeed }) {
  const objects = Object.values(feed.near_earth_objects).flat()
  const approaches = objects.flatMap((neo) => neo.close_approach_data)
  const closestLunar = Math.min(...approaches.map((a) => Number(a.miss_distance.lunar)))
  const fastest = Math.max(
    ...approaches.map((a) => Number(a.relative_velocity.kilometers_per_second)),
  )
  const hazardous = objects.filter((neo) => neo.is_potentially_hazardous_asteroid).length

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatTile label="Close approaches" value={feed.element_count} />
      <StatTile label="Potentially hazardous" value={hazardous} />
      <StatTile
        label="Closest approach"
        value={approaches.length ? closestLunar : '–'}
        unit={approaches.length ? 'LD' : undefined}
        caption="LD = Earth–Moon distance"
      />
      <StatTile
        label="Fastest"
        value={approaches.length ? fastest : '–'}
        unit={approaches.length ? 'km/s' : undefined}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// DONKI
// ---------------------------------------------------------------------------

const DONKI_TYPES: Record<string, string> = {
  FLR: 'Solar flare',
  SEP: 'Solar energetic particles',
  CME: 'Coronal mass ejection',
  IPS: 'Interplanetary shock',
  MPC: 'Magnetopause crossing',
  GST: 'Geomagnetic storm',
  RBE: 'Radiation belt enhancement',
  Report: 'Weekly report',
}

function DonkiCard() {
  const [enabled, setEnabled] = useState(false)
  const { data, error, loading, reload } = useAsync(enabled ? 'donki:7d' : null, () =>
    donkiNotifications(),
  )

  return (
    <Card
      title="Space weather notifications"
      subtitle="GET ccmc.gsfc.nasa.gov/DONKI-API/get/notifications (last 7 days)"
    >
      {!enabled && (
        <button type="button" onClick={() => setEnabled(true)} className={buttonClass}>
          Load notifications
        </button>
      )}
      {loading && <LoadingState label="Loading notifications…" />}
      {error && <ErrorState title="Could not load DONKI" error={error} onRetry={reload} />}
      {data && data.length === 0 && (
        <p className="text-sm text-muted">No notifications in the last 7 days.</p>
      )}
      {data && data.length > 0 && (
        <ul className="divide-y divide-border">
          {data.slice(0, 6).map((note) => (
            <li
              key={note.messageID}
              className="flex items-baseline justify-between gap-4 py-2 text-sm"
            >
              <span>
                <span className="font-medium">
                  {DONKI_TYPES[note.messageType] ?? note.messageType}
                </span>
                <span className="ml-2 text-muted">
                  {formatDate(note.messageIssueTime.slice(0, 10))}
                </span>
              </span>
              <a
                href={note.messageURL}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 text-accent hover:underline"
              >
                Read
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
