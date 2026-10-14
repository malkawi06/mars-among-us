import { useEffect, useRef } from 'react'

/**
 * Marks an element with `data-shown` the first time a quarter of it is on screen,
 * which starts the `.reveal` and `.settle` transitions in index.css.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.dataset.shown = ''
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.shown = ''
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}
