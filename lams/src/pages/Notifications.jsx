import { useState, useEffect } from 'react'
import { Bell, Check, Trash2, AlertCircle, Calendar, FileText, Settings, Home } from 'lucide-react'
import ClayButton from '../components/ui/ClayButton'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import { notificationApi } from '../services'
import { useAuth } from '../auth/AuthContext'
import PermissionGate from '../auth/PermissionGate'
import { useToast } from '../components/ui/Toast'
import { Box, Card, Typography, IconButton, alpha, useTheme } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

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
    possession: 'success',
    system: 'default',
  }
  return map[type] || 'default'
}

const NotificationsPage = () => {
  const { user, hasPermission } = useAuth()
  const toast = useToast()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showClearAllModal, setShowClearAllModal] = useState(false)
  const [clearingAll, setClearingAll] = useState(false)

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

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

  const clearAll = async () => {
    setClearingAll(true)
    try {
      await notificationApi.deleteAll()
      setNotifications([])
      setShowClearAllModal(false)
      toast.success({ title: 'All notifications cleared' })
    } catch (err) {
      console.error('Failed to clear notifications:', err)
    } finally {
      setClearingAll(false)
    }
  }

  const columns = [
    {
      field: 'title',
      headerName: 'Notification',
      flex: 2,
      minWidth: 280,
      renderCell: (params) => {
        const n = params.row
        const Icon = typeIcons[n.type] || Bell
        return (
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 0.5 }}>
            <Box sx={{
              width: 32, height: 32, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              bgcolor: n.unread ? 'primary.main' : 'action.disabledBackground',
              color: n.unread ? 'primary.contrastText' : 'text.secondary',
            }}>
              <Icon size={14} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={n.unread ? 600 : 400}>{n.title}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.message}</Typography>
            </Box>
          </Box>
        )
      },
    },
    {
      field: 'priority',
      headerName: 'Priority',
      flex: 1,
      minWidth: 100,
      renderCell: (params) => {
        const priority = params.value
        if (priority !== 'high') return <Typography variant="caption" color="text.secondary">-</Typography>
        return <StatusBadge status="error" size="xs">High Priority</StatusBadge>
      },
    },
    {
      field: 'time',
      headerName: 'Time',
      flex: 1,
      minWidth: 120,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 120,
      sortable: false,
      renderCell: (params) => {
        const n = params.row
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {n.unread && (
              <PermissionGate permission="NOTIFICATIONS_MANAGE" fallback={<div />}>
                <IconButton size="small" onClick={() => markAsRead(n.id)} sx={{ color: 'primary.main' }}>
                  <CheckCircle size={14} />
                </IconButton>
              </PermissionGate>
            )}
            <PermissionGate permission="NOTIFICATIONS_MANAGE" fallback={<div />}>
              <IconButton size="small" onClick={() => setDeleteId(n.id)} sx={{ color: 'error.main' }}>
                <Trash2 size={14} />
              </IconButton>
            </PermissionGate>
          </Box>
        )
      },
    },
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 3, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'primary.contrastText' }}>
            <Bell size={20} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.03em', lineHeight: 1.2 }}>Notifications</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {hasPermission('NOTIFICATIONS_MANAGE') && unreadCount > 0 && (
            <ClayButton variant="outline" size="sm" icon={Check} onClick={markAllRead}>
              Mark All as Read
            </ClayButton>
          )}
          {hasPermission('NOTIFICATIONS_MANAGE') && (
            <ClayButton variant="outline" size="sm" icon={Trash2} onClick={() => setShowClearAllModal(true)} disabled={notifications.length === 0}>
              Clear All
            </ClayButton>
          )}
        </Box>
      </Box>

      <Card elevation={0} sx={{ border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ height: 'clamp(360px, calc(100dvh - 330px), 760px)', width: '100%' }}>
            <DataGrid
              rows={notifications}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                borderRadius: 0,
                '& .MuiDataGrid-row': { cursor: 'pointer' },
                '& .MuiDataGrid-cell': { borderColor: borderColor },
                '& .MuiDataGrid-columnHeaders': { borderColor: borderColor, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' },
                '& .MuiDataGrid-footerContainer': { borderColor: borderColor },
              }}
            />
          </Box>
        </Box>
      </Card>

      <Modal isOpen={!!deleteId} onClose={() => { setDeleteId(null); setDeleting(false) }} title="Delete Notification">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {(() => {
            const notification = notifications.find((n) => n.id === deleteId)
            const isOwn = notification?.userId === user?.id
            const isSuperAdmin = user?.role === 'SUPER_ADMIN'

            if (!isOwn && isSuperAdmin) {
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                    Warning: You are about to delete another user's notification. This action is irreversible.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This notification will be permanently deleted. This cannot be undone.
                  </Typography>
                </Box>
              )
            }

            return (
              <Typography variant="body2" color="text.secondary">
                This action will permanently delete this notification. This cannot be undone.
              </Typography>
            )
          })()}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <ClayButton variant="outline" onClick={() => { setDeleteId(null); setDeleting(false) }} disabled={deleting}>Cancel</ClayButton>
            <ClayButton variant="danger" onClick={() => handleDelete(deleteId)} loading={deleting}>
              {deleting ? 'Deleting...' : 'Delete Notification'}
            </ClayButton>
          </Box>
        </Box>
      </Modal>

      <Modal isOpen={showClearAllModal} onClose={() => setShowClearAllModal(false)} title="Clear All Notifications">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
              Warning: You are about to permanently delete all notifications. This action is irreversible.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All notifications will be permanently removed from the system. This cannot be undone.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <ClayButton variant="outline" onClick={() => setShowClearAllModal(false)} disabled={clearingAll}>Cancel</ClayButton>
            <ClayButton variant="danger" onClick={clearAll} loading={clearingAll}>
              {clearingAll ? 'Clearing...' : 'Clear All Notifications'}
            </ClayButton>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default NotificationsPage
