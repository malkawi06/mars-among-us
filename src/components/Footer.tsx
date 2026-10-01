import { site } from '../config/site'

export function Footer() {
  const links = [
    { label: 'Source code', href: site.links.repo },
    { label: 'Demo video', href: site.links.video },
    { label: 'Slides', href: site.links.slides },
    { label: 'Space Apps', href: site.event.url },
  ].filter((link) => link.href)

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-fg-2">{site.footer.tagline}</p>
          <p className="mt-1">
            {site.team.name} · {site.footer.disclaimer}
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer" className="hover:text-fg">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
