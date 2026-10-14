import { site } from '../config/site'

export function Footer() {
  const links = [
    { label: 'Source code', href: site.links.repo },
    { label: 'Demo video', href: site.links.video },
    { label: 'Slides', href: site.links.slides },
    { label: 'Space Apps', href: site.event.url },
  ].filter((link) => link.href)

  return (
    <footer className="bg-black text-white/60">
      <div className="mx-auto flex max-w-[90rem] flex-col gap-4 px-5 py-10 font-display text-xs font-semibold tracking-[0.18em] uppercase sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>
          {site.footer.tagline} · {site.footer.disclaimer}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer" className="hover:text-white">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
