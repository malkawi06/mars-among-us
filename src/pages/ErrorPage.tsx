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

  // After a new deploy, an open tab may ask for page files that no longer exist.
  const outdated = /dynamically imported module|module script failed/i.test(message)

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <ErrorState
        title={outdated ? 'The site was updated' : 'This page crashed'}
        error={outdated ? 'A new version is out. Reload the page to get it.' : message}
        onRetry={() => window.location.reload()}
      />
    </div>
  )
}
