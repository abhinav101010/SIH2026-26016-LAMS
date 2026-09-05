import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Check,
  Search,
  Trash2,
  AlertCircle,
  Calendar,
  CheckCircle,
  FileText,
  Settings,
  Home,
} from 'lucide-react'
import ClayCard from '../components/ui/ClayCard'
import ClayButton from '../components/ui/ClayButton'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import { notificationApi } from '../services'
import { useAuth } from '../auth/AuthContext'
import PermissionGate from '../auth/PermissionGate'

const NotificationsPage = () => {
  const { user, hasPermission } = useAuth()
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true)
      try {
        const res = await notificationApi.getAll()
        setNotifications(res.data || [])
      } catch (err) {
        console.error('Failed to fetch notifications:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'unread' && n.unread) return true
      if (filter === 'read' && !n.unread) return false
      if (filter !== 'all' && n.category !== filter) return false
      if (searchQuery && !n.title.toLowerCase().includes(searchQuery.toLowerCase()) && !n.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [filter, searchQuery, notifications])

  const unreadCount = notifications.filter((n) => n.unread).length

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)))
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      const notification = notifications.find((n) => n.id === id)
      const isOwn = notification?.userId === user?.id
      const isSuperAdmin = user?.role === 'SUPER_ADMIN'
      const needsConfirm = !isOwn && isSuperAdmin

      if (needsConfirm && deleteId !== id) {
        setDeleteId(id)
        setDeleting(false)
        return
      }

      await notificationApi.delete(id)
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      setDeleteId(null)
    } catch (err) {
      console.error('Failed to delete notification:', err)
    } finally {
      setDeleting(false)
    }
  }

  const clearAll = () => {
    setNotifications([])
  }

  const typeIcons = {
    approval: Bell,
    compensation: Bell,
    document: FileText,
    deadline: Calendar,
    status: AlertCircle,
    possession: Home,
    system: Settings,
    verification: AlertCircle,
  }

  const getTypeColor = (type) => {
    const map = {
      approval: 'info',
      compensation: 'success',
      document: 'secondary',
      deadline: 'warning',
      status: 'primary',
      possession: 'emerald',
      system: 'neutral',
    }
    return map[type] || 'neutral'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-foreground-secondary text-sm mt-1">
              {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('NOTIFICATIONS_MANAGE') && unreadCount > 0 && (
            <ClayButton variant="outline" size="sm" icon={Check} onClick={markAllRead}>
              Mark All as Read
            </ClayButton>
          )}
          {hasPermission('NOTIFICATIONS_MANAGE') && (
            <ClayButton variant="outline" size="sm" icon={Trash2} onClick={clearAll} disabled={notifications.length === 0}>
              Clear All
            </ClayButton>
          )}
        </div>
      </div>

      {/* Filters */}
      <ClayCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-wrap gap-1">
            <FilterButton label="All" value="all" current={filter} onClick={setFilter} count={notifications.length} />
            <FilterButton label="Unread" value="unread" current={filter} onClick={setFilter} count={unreadCount} />
            <FilterButton label="Read" value="read" current={filter} onClick={setFilter} count={notifications.length - unreadCount} />
          </div>

          <div className="relative w-56">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
      </ClayCard>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <ClayCard className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-4xl">
              📭
            </div>
            <h3 className="text-lg font-semibold text-foreground">No notifications</h3>
            <p className="text-sm text-foreground-secondary">
              {searchQuery || filter !== 'all'
                ? 'No notifications match your current filters.'
                : 'You have no notifications at this time.'}
            </p>
          </div>
        </ClayCard>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hide"
          animate="show"
          variants={{
            show: { transition: { staggerChildren: 0.05 } },
          }}
        >
          <AnimatePresence>
            {filteredNotifications.map((notification) => {
              const Icon = typeIcons[notification.type] || Bell
              return (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, x: 100 }}
                  className={`
                    clay-card-hover p-4
                    ${notification.unread
                      ? 'border-l-3 border-primary bg-primary/2'
                      : 'border border-border'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`
                      w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                      ${notification.unread
                        ? 'bg-primary/10 text-primary'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-foreground-tertiary'}
                    `}>
                      <Icon size={16} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`
                          text-sm font-medium
                          ${notification.unread ? 'text-foreground' : 'text-foreground-secondary'}
                        `}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-foreground-tertiary whitespace-nowrap">
                          {notification.time}
                        </span>
                      </div>
                      <p className={`
                        text-sm mt-1
                        ${notification.unread ? 'text-foreground' : 'text-foreground-secondary'}
                      `}>
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3 mt-2">
                        {notification.priority === 'high' && (
                          <StatusBadge status="error" size="xs">
                            High Priority
                          </StatusBadge>
                        )}
                        {notification.action && (
                          <button className="text-xs font-medium text-primary hover:text-primary-hover">
                            {notification.action}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      {notification.unread && (
                        <PermissionGate permission="NOTIFICATIONS_MANAGE" fallback={<div />}>
                          <button
                            onClick={() => markAsRead(notification.id)}
                            title="Mark as read"
                            className="p-1 rounded-lg text-foreground-tertiary hover:text-foreground hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                          >
                            <CheckCircle size={14} />
                          </button>
                        </PermissionGate>
                      )}
                      <PermissionGate permission="NOTIFICATIONS_MANAGE" fallback={<div />}>
                        <button
                          onClick={() => setDeleteId(notification.id)}
                          title="Delete"
                          className="p-1 rounded-lg text-foreground-tertiary hover:text-status-rejected hover:bg-status-rejected/10 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </PermissionGate>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => { setDeleteId(null); setDeleting(false) }} title="Delete Notification">
        <div className="space-y-4">
          {(() => {
            const notification = notifications.find((n) => n.id === deleteId)
            const isOwn = notification?.userId === user?.id
            const isSuperAdmin = user?.role === 'SUPER_ADMIN'

            if (!isOwn && isSuperAdmin) {
              return (
                <div className="space-y-2">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Warning: You are about to delete another user's notification. This action is irreversible.
                  </p>
                  <p className="text-sm text-foreground-secondary">
                    This notification will be permanently deleted. This cannot be undone.
                  </p>
                </div>
              )
            }

            return (
              <p className="text-sm text-foreground-secondary">
                This action will permanently delete this notification. This cannot be undone.
              </p>
            )
          })()}
          <div className="flex justify-end gap-3">
            <ClayButton variant="outline" onClick={() => { setDeleteId(null); setDeleting(false) }} disabled={deleting}>
              Cancel
            </ClayButton>
            <ClayButton variant="danger" onClick={() => handleDelete(deleteId)} loading={deleting}>
              {deleting ? 'Deleting...' : 'Delete Notification'}
            </ClayButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function FilterButton({ label, value, current, onClick, count }) {
  const active = current === value
  return (
    <button
      onClick={() => onClick(value)}
      className={`
        px-3 py-1.5 rounded-full text-xs font-medium transition-all
        ${active
          ? 'bg-primary text-white shadow-clay-btn'
          : 'bg-neutral-100 dark:bg-neutral-800 text-foreground-secondary hover:text-foreground hover:bg-neutral-200 dark:hover:bg-neutral-700'}
      `}
    >
      {label} ({count})
    </button>
  )
}

export default NotificationsPage
