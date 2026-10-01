import { Link } from 'react-router'
import { site } from '../config/site'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Home() {
  usePageTitle()
  const { team, home } = site

  return (
    <>
      <section className="hero-sky relative overflow-hidden border-b border-border">
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-28">
          <p className="text-sm font-medium text-accent">
            {site.event.name} · {site.event.dates}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            {site.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-pretty text-fg-2 sm:text-xl">{site.pitch}</p>

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

          <div className="mt-12 text-sm">
            <p className="text-muted">
              Team <span className="font-medium text-fg">{team.name}</span> · {team.location} ·
              Challenge:{' '}
              <a
                href={site.challenge.url}
                target="_blank"
                rel="noreferrer"
                className="text-accent hover:underline"
              >
                {site.challenge.name}
              </a>
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {team.members.map((member) => (
                <li
                  key={member.name}
                  className="rounded-full border border-border bg-surface px-3 py-1 text-fg-2"
                >
                  {member.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:grid-cols-3">
        {home.highlights.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent"
          >
            <h2 className="font-semibold">
              {item.title}{' '}
              <span
                aria-hidden="true"
                className="inline-block text-accent transition-transform group-hover:translate-x-0.5"
              >
                →
              </span>
            </h2>
            <p className="mt-2 text-sm text-fg-2">{item.body}</p>
          </Link>
        ))}
      </section>
    </>
  )
}
