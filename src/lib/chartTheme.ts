/**
 * Chart colors as CSS variables (defined in index.css), so Recharts follows the light/dark theme
 * without re-rendering. Series colors come from a colorblind-checked categorical palette:
 * use them in this order and keep each entity on the same color across charts.
 */
export const chartTheme = {
  series: [
    'var(--series-1)',
    'var(--series-2)',
    'var(--series-3)',
    'var(--series-4)',
    'var(--series-5)',
  ],
  grid: 'var(--chart-grid)',
  axis: 'var(--chart-axis)',
  surface: 'var(--surface)',
  tick: { fill: 'var(--muted)', fontSize: 12 },
  tooltip: {
    contentStyle: {
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      color: 'var(--fg)',
      fontSize: 13,
    },
    labelStyle: { color: 'var(--muted)', marginBottom: 2 },
    itemStyle: { color: 'var(--fg)', padding: 0 },
  },
} as const
