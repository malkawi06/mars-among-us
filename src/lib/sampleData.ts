/**
 * Synthetic data so charts have something to show before real data is wired up.
 * Replace calls to sampleTimeSeries() with a real source (see README: NASA POWER is a good fit).
 */

import { addDays } from './date'

export interface TimePoint {
  /** YYYY-MM-DD */
  date: string
  value: number
}

/**
 * `days` daily points ending on `endDate`: a seasonal wave plus noise.
 * Deterministic: the same date always gives the same value, so the chart doesn't jump on re-render.
 */
export function sampleTimeSeries(endDate: string, days = 30): TimePoint[] {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(endDate, i - days + 1)
    const dayNumber = Date.parse(date) / 86_400_000
    const seasonal = 12 * Math.sin((2 * Math.PI * dayNumber) / 365.25)
    const weekly = 2.5 * Math.sin((2 * Math.PI * dayNumber) / 7.3)
    const noise = (seededRandom(dayNumber) - 0.5) * 4
    return { date, value: Math.round((50 + seasonal + weekly + noise) * 10) / 10 }
  })
}

/** Stable pseudo-random number in [0, 1) for a given seed. */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

export interface SeriesSummary {
  latest: number
  mean: number
  min: number
  max: number
  /** Change from the first to the last point. */
  change: number
}

export function summarize(points: TimePoint[]): SeriesSummary | undefined {
  if (points.length === 0) return undefined
  const values = points.map((p) => p.value)
  const latest = values[values.length - 1]
  return {
    latest,
    mean: values.reduce((sum, v) => sum + v, 0) / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    change: latest - values[0],
  }
}
