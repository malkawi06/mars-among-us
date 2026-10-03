import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { Layout } from './components/Layout'
import ErrorPage from './pages/ErrorPage'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// Heavier pages load on demand, so the home page stays fast.
const Analogs = lazy(() => import('./pages/Analogs'))
const Compare = lazy(() => import('./pages/Compare'))
const About = lazy(() => import('./pages/About'))

// To add a page: create it in src/pages, add a route here, and add a link to `nav` in src/config/site.ts.
const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        {
          errorElement: <ErrorPage />,
          children: [
            { index: true, element: <Home /> },
            { path: 'analogs', element: <Analogs /> },
            { path: 'compare', element: <Compare /> },
            { path: 'about', element: <About /> },
            { path: '*', element: <NotFound /> },
          ],
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
)

export default function App() {
  return <RouterProvider router={router} />
}
