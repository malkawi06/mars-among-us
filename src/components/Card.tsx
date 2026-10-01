import type { ReactNode } from 'react'

interface CardProps {
  title?: ReactNode
  subtitle?: ReactNode
  /** Rendered at the top right, e.g. a button or a select. */
  actions?: ReactNode
  children?: ReactNode
  className?: string
}

/** Bordered surface for grouping content. Every panel in the app is built on it. */
export function Card({ title, subtitle, actions, children, className = '' }: CardProps) {
  const hasHeader = title !== undefined || subtitle !== undefined || actions !== undefined
  return (
    <section className={`rounded-xl border border-border bg-surface p-5 ${className}`}>
      {hasHeader && (
        <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {title !== undefined && <h2 className="text-base font-semibold">{title}</h2>}
            {subtitle !== undefined && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  )
}
