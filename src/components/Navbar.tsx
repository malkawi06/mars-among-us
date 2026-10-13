import { Link, NavLink } from 'react-router'
import { site } from '../config/site'
import { PAGE_ICONS } from '../lib/icons'
import { ThemeToggle } from './ThemeToggle'

/** Top bar with icon tabs; on phones the tabs move to a bar at the bottom of the screen. */
export function Navbar() {
  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur">
        <nav
          className="mx-auto flex h-[4.5rem] max-w-7xl items-center gap-4 px-4"
          aria-label="Main"
        >
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-7" />
            {site.name}
          </Link>

          <ul className="ml-auto hidden items-center gap-1 sm:flex">
            {site.nav.map((item) => {
              const Icon = PAGE_ICONS[item.to]
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    title={item.description}
                    className={({ isActive }) =>
                      `flex min-w-24 flex-col items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-surface-2 text-accent'
                          : 'text-fg-2 hover:bg-surface-2 hover:text-fg'
                      }`
                    }
                  >
                    <Icon className="size-5" aria-hidden />
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>

          <div className="ml-auto sm:ml-0">
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <nav
        aria-label="Pages"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg/90 backdrop-blur sm:hidden"
      >
        <ul className="grid grid-cols-5">
          {site.nav.map((item) => {
            const Icon = PAGE_ICONS[item.to]
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1 py-2 text-[11px] font-medium ${
                      isActive ? 'text-accent' : 'text-fg-2'
                    }`
                  }
                >
                  <Icon className="size-5" aria-hidden />
                  {item.shortLabel ?? item.label}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
