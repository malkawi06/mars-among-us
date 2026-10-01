import { Link } from 'react-router'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Lost in space</h1>
      <p className="mt-3 text-fg-2">This page doesn't exist.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 font-medium text-accent-fg hover:opacity-90"
      >
        Back to home
      </Link>
    </div>
  )
}
