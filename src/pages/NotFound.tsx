import { Link } from 'react-router'
import { PageHeader } from '../components/PageHeader'
import { site } from '../config/site'
import { usePageTitle } from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Page not found')
  return (
    <div className="py-8">
      <PageHeader
        eyebrow="404"
        title="Lost in space"
        intro="This page doesn't exist."
        photo={site.photos.compare}
      >
        <Link to="/" className="btn-line mt-8 text-white">
          Back to home
        </Link>
      </PageHeader>
    </div>
  )
}
