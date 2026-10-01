const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
const precise = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

/** Formats numbers for display: 1,284 / 12.9K / 4.2M. */
export function formatNumber(value: number): string {
  return Math.abs(value) >= 10_000 ? compact.format(value) : precise.format(value)
}
