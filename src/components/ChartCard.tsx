import type { ReactElement, ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'
import { Card } from './Card'

export interface ChartTable {
  columns: string[]
  rows: (string | number)[][]
}

interface ChartCardProps {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  /** A single Recharts chart element (LineChart, AreaChart, BarChart, ...). */
  children: ReactElement
  /** Chart height in pixels. Width always fills the card. */
  height?: number
  /** Optional data table behind a "View data" toggle, so values are readable without the chart. */
  table?: ChartTable
  className?: string
}

/** A Card sized for a responsive Recharts chart, with an optional data-table view. */
export function ChartCard({
  title,
  subtitle,
  actions,
  children,
  height = 280,
  table,
  className = '',
}: ChartCardProps) {
  return (
    <Card title={title} subtitle={subtitle} actions={actions} className={className}>
      <div style={{ height }} className="-ml-2">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      {table && (
        <details className="mt-3 text-sm">
          <summary className="cursor-pointer text-muted select-none hover:text-fg">
            View data
          </summary>
          <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-border">
            <table className="w-full text-left tabular-nums">
              <thead className="sticky top-0 bg-surface-2 text-muted">
                <tr>
                  {table.columns.map((column) => (
                    <th key={column} scope="col" className="px-3 py-2 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, i) => (
                  <tr key={i} className="border-t border-border">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-1.5">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </Card>
  )
}
