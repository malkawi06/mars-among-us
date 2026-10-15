import { useEffect, useState, type ReactNode } from 'react'
import { PageHeader } from '../components/PageHeader'
import { site } from '../config/site'
import { usePageTitle } from '../hooks/usePageTitle'

const stats = __HOME_STATS__

// Section order and names follow the Space Apps project submission form.
const SECTIONS = [
  { id: 'challenge', title: 'The Challenge' },
  { id: 'solution', title: 'Our Solution' },
  { id: 'nasa-data', title: 'NASA Data Used' },
  ...(site.about.ai ? [{ id: 'ai', title: 'Use of AI' }] : []),
  { id: 'team', title: 'Team' },
]
const SECTION_IDS = SECTIONS.map((s) => s.id)

export default function About() {
  usePageTitle('About')
  const { about, team } = site
  const active = useActiveSection(SECTION_IDS)
  const number = (id: string) => String(SECTIONS.findIndex((s) => s.id === id) + 1).padStart(2, '0')

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        eyebrow="About"
        title={`About ${site.name}`}
        intro={site.pitch}
        photo={site.photos.method}
      />

      <div className="lg:grid lg:grid-cols-[13rem_1fr] lg:gap-16">
        {/* Desktop: the sections, with the one on screen marked. */}
        <nav aria-label="On this page" className="hidden lg:block">
          <ol className="sticky top-28 space-y-1 border-l border-border">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? 'true' : undefined}
                  className={`-ml-px flex gap-3 border-l-2 py-2 pl-4 font-display text-sm font-semibold tracking-[0.14em] uppercase transition-colors ${
                    active === s.id
                      ? 'border-accent text-fg'
                      : 'border-transparent text-muted hover:text-fg'
                  }`}
                >
                  <span className="tabular-nums">{number(s.id)}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="min-w-0">
          <Section id="challenge" number={number('challenge')} title="The Challenge">
            <p className="text-sm text-muted">
              {site.event.name}
              {site.challenge.name && (
                <>
                  {' · '}
                  <a
                    href={site.challenge.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    {site.challenge.name}
                  </a>
                </>
              )}
            </p>
            <div className="mt-6 grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2">
              <div className="bg-bg p-6">
                <p className="font-display text-xs font-semibold tracking-[0.2em] text-muted uppercase">
                  Before
                </p>
                <p className="mt-3 text-fg-2">{about.challenge}</p>
              </div>
              <div className="bg-surface p-6">
                <p className="font-display text-xs font-semibold tracking-[0.2em] text-accent uppercase">
                  With {site.name}
                </p>
                <p className="mt-3 text-lg text-fg">{site.pitch}</p>
              </div>
            </div>
          </Section>

          <Section id="solution" number={number('solution')} title="Our Solution">
            <dl className="mb-8 grid grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
              {[
                { value: stats.targets, label: 'Places on the Moon and Mars' },
                { value: stats.earthSites, label: 'Earth sites scored' },
                { value: stats.analogSites, label: 'Earth analog sites' },
                { value: stats.sources, label: 'Sources cited' },
              ].map((item) => (
                <div key={item.label} className="bg-bg p-5">
                  <dt className="sr-only">{item.label}</dt>
                  <dd className="font-display text-5xl leading-none font-bold text-fg tabular-nums">
                    {item.value}
                  </dd>
                  <dd className="mt-2 font-display text-xs font-semibold tracking-[0.16em] text-muted uppercase">
                    {item.label}
                  </dd>
                </div>
              ))}
            </dl>
            <p>{about.solution}</p>
          </Section>

          <Section id="nasa-data" number={number('nasa-data')} title="NASA Data Used">
            <ul className="divide-y divide-border border-y border-border">
              {about.nasaData.map((source) => (
                <li key={source.name} className="py-4 sm:grid sm:grid-cols-[1fr_1.4fr] sm:gap-6">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-fg hover:text-accent hover:underline"
                  >
                    {source.name}
                  </a>
                  <p className="mt-1 text-fg-2 sm:mt-0">{source.howWeUseIt}</p>
                </li>
              ))}
            </ul>
          </Section>

          {about.ai && (
            <Section id="ai" number={number('ai')} title="Use of AI">
              <p>{about.ai}</p>
            </Section>
          )}

          <Section id="team" number={number('team')} title="Team">
            <p className="mb-6 text-sm text-muted">
              {[team.name, team.location].filter(Boolean).join(' · ')}
            </p>
            <ul className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 xl:grid-cols-3">
              {team.members.map((member) => (
                <li key={member.name} className="flex items-center gap-4 bg-bg p-5">
                  <span
                    aria-hidden="true"
                    className="grid size-14 shrink-0 place-items-center border border-border bg-surface font-display text-xl font-bold tracking-wider text-fg"
                  >
                    {initials(member.name)}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-fg">{member.name}</span>
                    {member.role && <span className="block text-sm text-muted">{member.role}</span>}
                    <span className="mt-1 flex gap-3 text-sm">
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                      {member.linkedin && (
                        <a
                          href={member.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline"
                        >
                          LinkedIn
                        </a>
                      )}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </div>
  )
}

/** The section nearest the top of the screen, for the side index. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) setActive(visible[0].target.id)
      },
      { rootMargin: '-25% 0px -65% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [ids])
  return active
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string
  number: string
  title: string
  children: ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-border py-12 leading-relaxed text-fg-2 first:border-t-0 first:pt-0"
    >
      <p className="font-display text-sm font-semibold tracking-[0.3em] text-muted">{number}</p>
      <h2 className="mt-2 mb-6 font-display text-4xl leading-none font-bold text-fg sm:text-5xl">
        {title}
      </h2>
      {children}
    </section>
  )
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
