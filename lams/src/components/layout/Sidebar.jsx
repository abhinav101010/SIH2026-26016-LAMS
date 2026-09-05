import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  Bell,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  Building2,
} from 'lucide-react'
import Logo from '../common/Logo'
import { useAuth } from '../../auth/AuthContext'

const Sidebar = ({ collapsed, onToggle }) => {
  const location = useLocation()
  const { user, hasPermission } = useAuth()

  const topNav = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', permission: 'DASHBOARD_VIEW' },
    { label: 'Proposals', icon: FileText, path: '/proposals', permission: 'PROPOSALS_VIEW' },
    { label: 'GIS Map', icon: BarChart3, path: '/map', permission: 'GIS_VIEW' },
    { label: 'Notifications', icon: Bell, path: '/notifications', permission: 'NOTIFICATIONS_VIEW' },
    { label: 'Users & Roles', icon: Users, path: '/users', permission: 'USERS_VIEW' },
    { label: 'Departments', icon: Building2, path: '/departments', permission: 'USERS_VIEW', roles: ['SUPER_ADMIN'] },
    { label: 'Audit Logs', icon: ScrollText, path: '/audit-logs', permission: 'AUDIT_VIEW' },
    { label: 'Settings', icon: Settings, path: '/settings', permission: 'SETTINGS_VIEW' },
  ].filter((item) => {
    if (!hasPermission(item.permission)) return false
    if (item.roles && !item.roles.includes(user?.role)) return false
    return true
  })

  const bottomNav = [
    { label: 'Help & Support', icon: HelpCircle, path: '/help' },
  ]

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <aside
      className={`
        relative flex flex-col h-screen
        bg-card border-r border-border
        transition-all duration-300 ease-out
        ${collapsed ? 'w-[4.5rem]' : 'w-64'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 h-16 border-b border-border`}>
        <Logo size={collapsed ? 'sm' : 'md'} variant={collapsed ? 'icon' : 'full'} animated={true} />
        {!collapsed && (
          <button
            onClick={onToggle}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground-tertiary hover:text-foreground hover:bg-surface transition-all duration-200"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Collapse toggle when collapsed */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-foreground-tertiary hover:text-foreground hover:border-primary transition-all duration-200 shadow-clay-sm z-10"
        >
          <ChevronRight size={12} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {topNav.map((item) => {
            const active = isActive(item.path)
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 group relative
                    ${active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-foreground-secondary hover:text-foreground hover:bg-surface'}
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? item.label : undefined}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                  )}
                  <item.icon
                    size={20}
                    className={`
                      transition-colors duration-200
                      ${active ? 'text-primary' : 'text-foreground-tertiary group-hover:text-foreground'}
                      ${collapsed ? '' : ''}
                    `}
                  />
                  {!collapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom nav */}
      <div className="px-2 pb-2">
        <div className="border-t border-border pt-2">
          <ul className="space-y-1">
            {bottomNav.map((item) => {
              const active = isActive(item.path)
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200 group
                      ${active
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-surface'}
                      ${collapsed ? 'justify-center' : ''}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon
                      size={20}
                      className={`
                        transition-colors duration-200
                        ${active ? 'text-primary' : 'text-foreground-tertiary group-hover:text-foreground'}
                      `}
                    />
                    {!collapsed && <span className="text-sm">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Collapse button */}
      <div className="p-3 border-t border-border">
        <button
          onClick={onToggle}
          className={`
            w-full flex items-center justify-center gap-2
            px-3 py-2 rounded-xl text-foreground-secondary hover:text-foreground
            hover:bg-surface transition-all duration-200
            ${collapsed ? '' : 'justify-start'}
          `}
        >
          <ChevronLeft
            size={16}
            className={`transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
          />
          {!collapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
