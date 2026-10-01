/** Date helpers. All dates are ISO `YYYY-MM-DD` strings in UTC, which is what NASA APIs expect. */

const DAY_MS = 24 * 60 * 60 * 1000

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Today's date in UTC. */
export function today(): string {
  return toIsoDate(new Date())
}

/** The date `days` days before `from` (default: today). */
export function daysAgo(days: number, from: string = today()): string {
  return addDays(from, -days)
}

export function addDays(isoDate: string, days: number): string {
  return toIsoDate(new Date(Date.parse(isoDate) + days * DAY_MS))
}

/** "2026-11-14" -> "Nov 14, 2026" (or "Nov 14" with `short`). */
export function formatDate(isoDate: string, options: { short?: boolean } = {}): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'short',
    day: 'numeric',
    year: options.short ? undefined : 'numeric',
  })
}
