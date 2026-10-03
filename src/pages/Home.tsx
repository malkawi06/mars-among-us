import { Link } from 'react-router'
import { StatTile } from '../components/StatTile'
import { site } from '../config/site'
import { ANALOG_SITES, LANDFORM_NAMES, type LandformCode } from '../data/analogs'
import { usePageTitle } from '../hooks/usePageTitle'

const LANDFORMS = Object.entries(LANDFORM_NAMES) as [LandformCode, string][]

export default function Home() {
  usePageTitle()
  const { home } = site

  return (
    <>
      <section className="hero-sky relative overflow-hidden border-b border-border">
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <div>
            <p className="text-sm font-medium text-accent">
              {site.event.name} · {site.event.dates}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
              {site.name}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-pretty text-fg-2 sm:text-xl">{site.pitch}</p>

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
          </div>
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

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {home.stats.map((stat) => (
            <StatTile key={stat.label} label={stat.label} value={stat.value} />
          ))}
          <StatTile label="Moon and Mars landforms recognised" value={LANDFORMS.length} />
          <StatTile label="Earth analog sites, all sourced" value={ANALOG_SITES.length} />
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl font-semibold tracking-tight">The landforms it knows</h2>
          <p className="mt-2 max-w-2xl text-fg-2">
            Pick one to see where on Earth it can be found.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {LANDFORMS.map(([code, name]) => (
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
