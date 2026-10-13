import { Link } from 'react-router'
import { site } from '../config/site'
import { useAsync } from '../hooks/useAsync'
import { usePageTitle } from '../hooks/usePageTitle'
import { EARTH_URL, TARGETS_URL, loadOrbitalImages } from '../lib/orbitalImages'

const stats = __HOME_STATS__
const example = stats.example
const SCORE_LABEL = { 3: 'strong', 2: 'partial', 1: 'weak' } as const

export default function Home() {
  usePageTitle()
  const { home, about } = site
  const exampleLink = `/compare?target=${example.targetId}&purpose=${example.purposeId}&site=${example.siteId}`

  return (
    <>
      <section className="hero-sky relative overflow-hidden border-b border-border">
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:py-20 lg:grid-cols-[1fr_minmax(0,30rem)]">
          <div className="min-w-0">
            <p className="text-sm font-medium text-accent">
              {site.event.name} · {site.event.dates}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              {site.name}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-pretty text-fg-2 sm:text-xl">{site.pitch}</p>
            <p className="mt-3 text-sm text-muted">
              {stats.targets} places on the Moon and Mars · {stats.earthSites} Earth sites ·{' '}
              {stats.purposes} purposes
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={home.primaryCta.to}
                className="rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-fg hover:opacity-90"
              >
                {home.primaryCta.label}
              </Link>
              <Link
                to={home.secondaryCta.to}
                className="rounded-lg border border-border bg-surface px-5 py-2.5 font-medium hover:bg-surface-2"
              >
                {home.secondaryCta.label}
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-2">
              {home.promises.map((promise) => (
                <li key={promise} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                  {promise}
                </li>
              ))}
            </ul>
          </div>

          <ExampleCard link={exampleLink} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {home.steps.map((step, i) => (
            <li key={step.title} className="rounded-xl border border-border bg-surface p-5">
              <span className="grid size-8 place-items-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                {i + 1}
              </span>
              <h3 className="mt-3 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-fg-2">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold">What the percentage means</h3>
            <p className="mt-1 text-sm text-fg-2">{home.scoring}</p>
          </div>
          <div className="rounded-xl border border-border p-5">
            <h3 className="font-semibold">What “no data” means</h3>
            <p className="mt-1 text-sm text-fg-2">{home.noData}</p>
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">Where the data comes from</h2>
          <p className="mt-2 max-w-2xl text-fg-2">
            Every number on the site links back to one of these sources or to a published paper.
          </p>
          <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {about.nasaData.map((source) => (
              <li key={source.name} className="min-w-0 border-t border-border pt-3">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium hover:text-accent hover:underline"
                >
                  {source.name}
                </a>
                <p className="mt-0.5 text-sm text-fg-2">{source.howWeUseIt}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">Browse by landform</h2>
          <p className="mt-2 max-w-2xl text-fg-2">
            Pick one to see where on Earth it can be found.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {stats.landforms.map(([code, name]) => (
              <li key={code}>
                <Link
                  to={`/analogs?landform=${code}`}
                  className="block rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-fg-2 transition-colors hover:border-accent hover:text-fg"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

/** One real comparison from the data, with its orbital images when the build has them. */
function ExampleCard({ link }: { link: string }) {
  const { data: images } = useAsync('orbital-images', loadOrbitalImages)
  const targetImage = images?.targets[example.targetId]
  const siteImage = images?.earth[example.siteId]

  return (
    <figure className="min-w-0 rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-medium tracking-wide text-accent uppercase">
          Example · {example.purposeLabel}
        </span>
        <span className="text-xs text-muted">from the live data</span>
      </figcaption>

      {targetImage && siteImage && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { src: TARGETS_URL + targetImage.file, label: 'Moon', name: example.targetName },
            { src: EARTH_URL + siteImage.file, label: 'Earth', name: example.siteName },
          ].map((image) => (
            <div key={image.label} className="relative">
              <img
                src={image.src}
                alt={`${image.name} from orbit`}
                className="aspect-square w-full rounded-lg object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 rounded bg-black/65 px-1.5 py-0.5 text-xs font-medium text-white">
                {image.label}
              </span>
            </div>
          ))}
        </div>
      )}
      {targetImage && siteImage && (
        <p className="mt-1 text-xs text-muted">Both images about 6 km across.</p>
      )}

      <div className="mt-3 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-fg-2">
            Moon: <span className="font-medium text-fg">{example.targetName}</span>
          </p>
          <p className="text-sm text-fg-2">
            Best Earth match:{' '}
            <span className="font-medium text-fg">
              {example.siteName}, {example.siteCountry}
            </span>
          </p>
        </div>
        <p className="shrink-0 text-4xl font-semibold tabular-nums">
          {example.percent === null ? '—' : `${example.percent}%`}
        </p>
      </div>

      <ul className="mt-3 divide-y divide-border border-y border-border">
        {example.factors.map((factor) => (
          <li key={factor.label} className="flex items-center justify-between gap-3 py-2 text-sm">
            <span className="min-w-0">
              <span className="font-medium">{factor.label}</span>
              <span className="block text-xs text-muted">{factor.reason}</span>
            </span>
            <span className="shrink-0 text-xs font-medium text-fg-2">
              {SCORE_LABEL[factor.score]} · {factor.score}/3
            </span>
          </li>
        ))}
      </ul>
      {example.notScored.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          No sourced data yet, so not scored: {example.notScored.join(', ').toLowerCase()}.
        </p>
      )}

      <Link to={link} className="mt-3 inline-block text-sm font-medium text-accent hover:underline">
        Open this comparison →
      </Link>
    </figure>
  )
}
