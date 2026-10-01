interface LoadingStateProps {
  label?: string
  className?: string
}

/** Spinner with a label. Announced to screen readers. */
export function LoadingState({ label = 'Loading…', className = '' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center gap-3 py-10 text-sm text-muted ${className}`}
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-border border-t-accent"
      />
      {label}
    </div>
  )
}
