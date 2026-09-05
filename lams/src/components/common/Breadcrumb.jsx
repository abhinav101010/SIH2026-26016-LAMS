import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const Breadcrumb = ({ items = [], className = '' }) => {
  const location = useLocation()
  const pathSegments = location.pathname.split('/').filter(Boolean)

  const generateItems = () => {
    if (items.length > 0) return items

    const crumbs = [{ label: 'Dashboard', path: '/dashboard' }]
    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/')
      const isLast = index === pathSegments.length - 1
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)

      if (segment.match(/^[0-9]+$/)) {
        label = 'Item ' + segment
      }

      crumbs.push({
        label,
        path: isLast ? undefined : path,
        active: isLast,
      })
    })

    return crumbs
  }

  const crumbs = generateItems()

  return (
    <nav className={'flex items-center gap-1 text-sm ' + className} aria-label="breadcrumb">
      {crumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && <ChevronRight size={14} className="text-text-tertiary" />}
          {crumb.path && !crumb.active ? (
            <Link
              to={crumb.path}
              className="text-text-secondary hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span
              className={
                'text-foreground font-medium ' +
                (crumb.active && index === crumbs.length - 1 ? '' : 'text-text-secondary')
              }
            >
              {crumb.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

export default Breadcrumb
