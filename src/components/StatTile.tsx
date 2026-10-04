import { formatNumber } from '../lib/format'

interface StatTileProps {
  /** Sentence case, no trailing colon. */
  label: string
  value: number | string
  className?: string
}

/** A single headline number with a label. Use instead of a chart when one value tells the story. */
export function StatTile({ label, value, className = '' }: StatTileProps) {
  const display = typeof value === 'number' ? formatNumber(value) : value
  return (
    <div className={`rounded-xl border border-border bg-surface p-4 ${className}`}>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{display}</p>
    </div>
  )
}
