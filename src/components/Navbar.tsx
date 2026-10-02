import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { site } from '../config/site'
import { ThemeToggle } from './ThemeToggle'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-surface-2 text-fg' : 'text-fg-2 hover:bg-surface-2 hover:text-fg'
  }`

export function Navbar() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4" aria-label="Main">
        <Link
          to="/"
          onClick={close}
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-7" />
          {site.name}
        </Link>

        <ul className="ml-auto hidden items-center gap-1 sm:flex">
          {site.nav.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.to === '/'} className={linkClass}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1 sm:ml-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid size-9 place-items-center rounded-lg text-fg-2 hover:bg-surface-2 hover:text-fg sm:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <ul id="mobile-menu" className="border-t border-border px-4 py-2 sm:hidden">
          {site.nav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                onClick={close}
                className={(state) => `block ${linkClass(state)}`}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
