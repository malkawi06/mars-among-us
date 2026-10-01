import type { ReactNode } from 'react'
import { PageHeader } from '../components/PageHeader'
import { site } from '../config/site'
import { usePageTitle } from '../hooks/usePageTitle'

// Section order and names follow the Space Apps project submission form.
export default function About() {
  usePageTitle('About')
  const { about, team } = site

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader title={`About ${site.name}`} intro={site.pitch} />

      <Section id="challenge" title="The Challenge">
        <p className="text-sm text-muted">
          {site.event.name} ·{' '}
          <a
            href={site.challenge.url}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:underline"
          >
            {site.challenge.name}
          </a>
        </p>
        <p className="mt-2">{about.challenge}</p>
      </Section>

      <Section id="solution" title="Our Solution">
        <p>{about.solution}</p>
      </Section>

      <Section id="nasa-data" title="NASA Data Used">
        <ul className="space-y-3">
          {about.nasaData.map((source) => (
            <li key={source.name}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-accent hover:underline"
              >
                {source.name}
              </a>
              <p className="text-fg-2">{source.howWeUseIt}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="ai" title="Use of AI">
        <p>{about.ai}</p>
      </Section>

      <Section id="team" title="Team">
        <p className="mb-4 text-sm text-muted">
          {team.name} · {team.location}
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {team.members.map((member) => (
            <li
              key={member.name}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4"
            >
              <span
                aria-hidden="true"
                className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-fg-2"
              >
                {initials(member.name)}
              </span>
              <span className="min-w-0">
                <span className="block font-medium">{member.name}</span>
                <span className="block text-sm text-muted">{member.role}</span>
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
  )
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-border py-8 leading-relaxed text-fg-2">
      <h2 className="mb-3 text-xl font-semibold text-fg">{title}</h2>
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
