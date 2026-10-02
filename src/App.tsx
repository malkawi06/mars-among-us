import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { Layout } from './components/Layout'
import ErrorPage from './pages/ErrorPage'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

// Heavier pages load on demand, so the home page stays fast.
const Explore = lazy(() => import('./pages/Explore'))
const Data = lazy(() => import('./pages/Data'))
const Analogs = lazy(() => import('./pages/Analogs'))
const About = lazy(() => import('./pages/About'))

// To add a page: create it in src/pages, add a route here, and add a link to `nav` in src/config/site.ts.
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        errorElement: <ErrorPage />,
        children: [
          { index: true, element: <Home /> },
          { path: 'explore', element: <Explore /> },
          { path: 'data', element: <Data /> },
          { path: 'analogs', element: <Analogs /> },
          { path: 'about', element: <About /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
