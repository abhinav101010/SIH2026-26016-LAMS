import { useState, useEffect } from 'react'
import { Bell, Search, User, Sun, Moon, Settings } from 'lucide-react'
import Breadcrumb from '../common/Breadcrumb'
import { useAuth } from '../../auth/AuthContext'

const Header = ({ onSearch, user }) => {
  const { hasPermission } = useAuth()
  const [searchValue, setSearchValue] = useState('')
  const [dark, setDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark')
    }
    return false
  })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
    }
  }, [dark])

  const handleSearch = (e) => {
    const val = e.target.value
    setSearchValue(val)
    onSearch?.(val)
  }

  const unreadCount = 3

  return (
    <header
      className={`
        sticky top-0 z-40
        bg-card/80 backdrop-blur-md border-b border-border
        flex items-center justify-between
        h-16 px-6
      `}
    >
      <div className="flex items-center gap-4">
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary"
          />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearch}
            placeholder="Search..."
            className={`
              pl-10 pr-4 py-2 rounded-xl
              bg-surface border border-border
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              text-foreground text-sm
              transition-all duration-200
              w-64
            `}
          />
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDark(!dark)}
          className={`
            w-9 h-9 rounded-xl flex items-center justify-center
            text-foreground-secondary hover:text-foreground
            hover:bg-surface transition-all duration-200
          `}
          title="Toggle dark mode"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
        {hasPermission('NOTIFICATIONS_VIEW') && (
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`
                relative w-9 h-9 rounded-xl flex items-center justify-center
                text-foreground-secondary hover:text-foreground
                hover:bg-surface transition-all duration-200
              `}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span
                  className={`
                    absolute -top-1 -right-1
                    flex items-center justify-center
                    text-xs font-bold text-white
                    bg-primary rounded-full
                    w-5 h-5
                  `}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`
              flex items-center gap-2
              w-9 h-9 rounded-xl
              bg-primary/10 text-primary
              hover:bg-primary/20
              transition-all duration-200
            `}
          >
            <User size={18} />
          </button>

          {showUserMenu && (
            <div
              className={`
                absolute right-0 mt-2 w-48
                clay-card shadow-clay-lg
                py-1 z-50
              `}
            >
              <div className="px-4 py-3 border-b border-border">
                <p className="font-medium text-foreground">{user?.name || 'User'}</p>
                <p className="text-sm text-foreground-secondary">{user?.role || 'Role'}</p>
              </div>
              <div className="py-1">
                <a
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors"
                >
                  <Settings size={14} />
                  Settings
                </a>
                <a
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors"
                >
                  Sign Out
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
