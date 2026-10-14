import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { Footer } from './Footer'
import { LoadingState } from './LoadingState'
import { Navbar } from './Navbar'

/** Shared page frame: navbar, the current page, footer. */
export function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:rounded-md focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1">
        <Suspense fallback={<LoadingState label="Loading page…" className="py-24" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  )
}
