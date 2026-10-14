import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { Menu, X } from 'lucide-react'
import { site } from '../config/site'
import { ThemeToggle } from './ThemeToggle'

/**
 * Top bar. It floats over the photo at the top of every page and turns solid once the page
 * scrolls; the `dark` class keeps it light-on-dark in both themes. On phones the links open in a
 * panel from the right.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the phone menu with Escape (links close it on click).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const clear = !scrolled && !open
  const links = site.nav.filter((item) => item.to !== '/')

  return (
    <>
      {/* The phone menu sits outside the header: the header's backdrop blur would trap a fixed child. */}
      <header
        className={`dark fixed inset-x-0 top-0 z-50 text-white transition-colors duration-500 ${
          clear ? 'bg-gradient-to-b from-black/70 to-transparent' : 'bg-black/90 backdrop-blur'
        }`}
      >
        <nav
          className="mx-auto flex h-20 max-w-[90rem] items-center gap-8 px-5 sm:px-8"
          aria-label="Main"
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-xl font-bold tracking-[0.14em] uppercase"
          >
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" className="size-7" />
            {site.name}
          </Link>

          <ul className="hidden items-center gap-7 lg:flex">
            {links.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  title={item.description}
                  className={({ isActive }) =>
                    `group relative py-2 font-display text-sm font-semibold tracking-[0.18em] uppercase ${
                      isActive ? '' : 'opacity-85 hover:opacity-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      <span
                        className={`absolute inset-x-0 -bottom-0.5 h-0.5 origin-left bg-current transition-transform duration-300 ${
                          isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                        }`}
                        aria-hidden
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              className="grid size-10 place-items-center lg:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="site-menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <X className="size-6" aria-hidden />
              ) : (
                <Menu className="size-6" aria-hidden />
              )}
            </button>
          </div>
        </nav>
      </header>

      <div
        id="site-menu"
        className={`fixed inset-0 top-20 z-40 lg:hidden ${open ? '' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        <ul
          className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col gap-1 bg-black px-8 py-6 text-white transition-transform duration-300 ${
            open ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {site.nav.map((item) => (
            <li key={item.to} className="border-b border-white/15">
              <NavLink
                to={item.to}
                end={item.to === '/'}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block py-4 font-display text-lg font-semibold tracking-[0.18em] uppercase ${
                    isActive ? 'text-white' : 'text-white/70 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
