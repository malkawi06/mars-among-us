import { useSyncExternalStore } from 'react'

/** True while the CSS media query matches, e.g. `useMediaQuery('(min-width: 1024px)')`. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
  )
}

/** Tailwind's `lg` breakpoint: side-by-side layouts and the top navigation links start here. */
export const DESKTOP = '(min-width: 1024px)'
