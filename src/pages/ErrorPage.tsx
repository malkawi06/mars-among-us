import { isRouteErrorResponse, useRouteError } from 'react-router'
import { ErrorState } from '../components/ErrorState'

/** Shown inside the layout when a page throws while rendering. */
export default function ErrorPage() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'Unknown error'

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <ErrorState
        title="This page crashed"
        error={message}
        onRetry={() => window.location.reload()}
      />
    </div>
  )
}
