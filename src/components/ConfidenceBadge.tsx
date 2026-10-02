import type { Confidence } from '../data/analogs'

const STYLE: Record<Confidence, string> = {
  strong: 'border-emerald-600/40 bg-emerald-600/10 text-emerald-800 dark:text-emerald-300',
  moderate: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300',
  weak: 'border-danger/40 bg-danger/10 text-danger',
}

/** How strongly an Earth site is backed as an analog for a landform. Always labelled, never colour alone. */
export function ConfidenceBadge({
  confidence,
  className = '',
}: {
  confidence: Confidence
  className?: string
}) {
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${STYLE[confidence]} ${className}`}
    >
      {confidence}
    </span>
  )
}
