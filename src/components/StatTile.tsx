import type { ReactNode } from 'react'
import { formatNumber } from '../lib/format'

interface StatTileProps {
  /** Sentence case, no trailing colon. */
  label: string
  value: number | string
  unit?: string
  /** Signed change vs. a named period, e.g. { value: -2.4, period: 'vs. 30 days ago' }. */
  delta?: { value: number; period: string }
  /** Which direction counts as good. Colors the delta; 'neutral' keeps it gray. */
  goodDirection?: 'up' | 'down' | 'neutral'
  /** Small print under the value. */
  caption?: ReactNode
  className?: string
}

/** A single headline number with a label. Use instead of a chart when one value tells the story. */
export function StatTile({
  label,
  value,
  unit,
  delta,
  goodDirection = 'neutral',
  caption,
  className = '',
}: StatTileProps) {
  const display = typeof value === 'number' ? formatNumber(value) : value
  return (
    <div className={`rounded-xl border border-border bg-surface p-4 ${className}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">
        {display}
        {unit && <span className="ml-1 text-sm font-normal text-muted">{unit}</span>}
      </p>
      {delta && <Delta {...delta} goodDirection={goodDirection} />}
      {caption && <p className="mt-1 text-xs text-muted">{caption}</p>}
    </div>
  )
}

function Delta({
  value,
  period,
  goodDirection,
}: {
  value: number
  period: string
  goodDirection: 'up' | 'down' | 'neutral'
}) {
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat'
  const tone =
    goodDirection === 'neutral' || direction === 'flat'
      ? 'text-muted'
      : direction === goodDirection
        ? 'text-emerald-700 dark:text-emerald-400'
        : 'text-danger'
  const arrow = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '■'
  const sign = value > 0 ? '+' : ''
  return (
    <p className={`mt-1 text-xs ${tone}`}>
      <span aria-hidden="true">{arrow}</span> {sign}
      {formatNumber(value)} <span className="text-muted">{period}</span>
    </p>
  )
}
