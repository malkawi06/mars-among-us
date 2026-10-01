import { useSyncExternalStore } from 'react'
import { getTheme, setTheme, subscribeToTheme, type Theme } from '../lib/theme'

export function useTheme(): { theme: Theme; setTheme: (theme: Theme) => void; toggle: () => void } {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme)
  return {
    theme,
    setTheme,
    toggle: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  }
}
