import { useCallback, useEffect, useEffectEvent, useState } from 'react'

export interface AsyncState<T> {
  data: T | undefined
  error: Error | undefined
  loading: boolean
  /** Run the request again (e.g. from a "Try again" button). */
  reload: () => void
}

interface Settled<T> {
  requestKey: string
  data?: T
  error?: Error
}

/**
 * Runs `load` whenever `key` changes and tracks loading/error state.
 * `key` identifies the request: include every input the request depends on.
 * Pass `null` to skip loading (e.g. until the user clicks a button).
 *
 *   const { data, error, loading, reload } = useAsync('orbital-images', loadOrbitalImages)
 */
export function useAsync<T>(key: string | null, load: () => Promise<T>): AsyncState<T> {
  const [attempt, setAttempt] = useState(0)
  const [settled, setSettled] = useState<Settled<T>>()
  const requestKey = key === null ? null : `${key}#${attempt}`
  const run = useEffectEvent(load)

  useEffect(() => {
    if (requestKey === null) return
    let active = true
    run().then(
      (data) => active && setSettled({ requestKey, data }),
      (error: unknown) =>
        active &&
        setSettled({
          requestKey,
          error: error instanceof Error ? error : new Error(String(error)),
        }),
    )
    return () => {
      active = false
    }
  }, [requestKey])

  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  const current = settled?.requestKey === requestKey ? settled : undefined

  return {
    data: current?.data,
    error: current?.error,
    loading: requestKey !== null && current === undefined,
    reload,
  }
}
