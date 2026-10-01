interface ErrorStateProps {
  title?: string
  /** An Error, or a message string. */
  error: Error | string
  /** Shows a "Try again" button when provided. */
  onRetry?: () => void
  className?: string
}

/** Inline error panel with an optional retry button. */
export function ErrorState({
  title = 'Something went wrong',
  error,
  onRetry,
  className = '',
}: ErrorStateProps) {
  const message = typeof error === 'string' ? error : error.message
  return (
    <div
      role="alert"
      className={`rounded-lg border border-danger/40 bg-danger/5 p-4 text-sm ${className}`}
    >
      <p className="font-semibold text-danger">{title}</p>
      <p className="mt-1 text-fg-2">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md border border-border bg-surface px-3 py-1.5 font-medium hover:bg-surface-2"
        >
          Try again
        </button>
      )}
    </div>
  )
}
