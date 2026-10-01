import { useEffect } from 'react'
import { site } from '../config/site'

/** Sets the browser tab title to "<title> · <project name>" (or just the project name). */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${site.name}` : site.name
  }, [title])
}
