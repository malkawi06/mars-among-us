import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  intro?: ReactNode
  children?: ReactNode
}

/** Title block at the top of inner pages. */
export function PageHeader({ title, intro, children }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      {intro && <p className="mt-2 max-w-3xl text-fg-2">{intro}</p>}
      {children}
    </div>
  )
}
