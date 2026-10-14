import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router'
import { site } from '../config/site'
import { PAGE_ICONS } from '../lib/icons'
import { ThemeToggle } from './ThemeToggle'

/**
 * Top bar: floats over the photo at the top of every page and turns solid once the page scrolls;
 * the `dark` class keeps it light-on-dark in both themes. On phones and tablets the page links
 * move to a tab bar fixed to the bottom of the screen, within reach of the thumb.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = site.nav.filter((item) => item.to !== '/')

  return (
    <>
      <header
        className={`dark fixed inset-x-0 top-0 z-50 text-white transition-colors duration-500 ${
          scrolled ? 'bg-black/90 backdrop-blur' : 'bg-gradient-to-b from-black/70 to-transparent'
        }`}
      >
        <nav
          className="mx-auto flex h-16 max-w-[90rem] items-center gap-8 px-5 sm:px-8 lg:h-20"
          aria-label="Main"
        >
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-lg font-bold tracking-[0.14em] uppercase lg:text-xl"
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

          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <nav
        aria-label="Pages"
        className="dark fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/95 pb-[env(safe-area-inset-bottom)] text-white backdrop-blur lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {site.nav.map((item) => {
            const Icon = PAGE_ICONS[item.to]
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `relative flex h-16 flex-col items-center justify-center gap-1 font-display text-[11px] font-semibold tracking-[0.12em] uppercase transition-colors ${
                      isActive ? 'text-white' : 'text-white/50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`absolute inset-x-5 top-0 h-0.5 bg-white transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
                        aria-hidden
                      />
                      <Icon className="size-5" aria-hidden />
                      {item.shortLabel ?? item.label}
                    </>
                  )}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
