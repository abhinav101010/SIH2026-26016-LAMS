import { useState, useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { auditApi } from '../services'
import { useToast } from '../components/ui/Toast'
import ClayButton from '../components/ui/ClayButton'
import ClayBadge from '../components/ui/ClayBadge'
import Modal from '../components/ui/Modal'
import { formatDate } from '../utils/formatters'
import { Box, Card, Typography, IconButton, alpha, useTheme } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'

const CHANGE_TYPE_COLORS = {
  CREATED: 'success',
  UPDATED: 'info',
  DELETED: 'error',
  SUBMITTED: 'review',
  REVIEW_STARTED: 'review',
  APPROVED: 'success',
  REJECTED: 'rejected',
  CHANGES_REQUESTED: 'pending',
  ACTIVATED: 'success',
  DEACTIVATED: 'rejected',
  ROLE_CHANGED: 'info',
  PASSWORD_RESET: 'pending',
}

const RECORD_TYPE_LABELS = {
  Proposal: 'Proposal',
  User: 'User',
  Role: 'Role',
  LandParcel: 'Land Parcel',
  Document: 'Document',
  Compensation: 'Compensation',
  RehabilitationRecord: 'Rehabilitation',
  Possession: 'Possession',
  Approval: 'Approval',
  Notification: 'Notification',
  AuditLog: 'Audit Log',
}

const AuditLogs = () => {
  const { user, hasPermission } = useAuth()
  const toast = useToast()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
  const fetchedRef = useRef(false)

  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      const response = await auditApi.getAuditLogs(params)
      setLogs(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
      setTotal(response.pagination?.total || 0)
    } catch (err) {
      toast.error({ title: 'Failed to load audit logs', message: err.response?.data?.message || 'Please try again' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasPermission('AUDIT_VIEW') && !fetchedRef.current) {
      fetchedRef.current = true
      fetchLogs()
    }
  }, [])

  useEffect(() => {
    if (hasPermission('AUDIT_VIEW') && fetchedRef.current) {
      fetchLogs()
    }
  }, [page])

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      await auditApi.delete(deleteId)
      setLogs((prev) => prev.filter((l) => l.id !== deleteId))
      setDeleteId(null)
      toast.success({ title: 'Audit log deleted' })
    } catch (err) {
      toast.error({ title: 'Failed to delete audit log', message: err.response?.data?.message || 'Please try again' })
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteAll = async () => {
    setDeletingAll(true)
    try {
      await auditApi.deleteAll()
      setLogs([])
      setTotal(0)
      setTotalPages(1)
      setShowDeleteAllModal(false)
      toast.success({ title: 'All audit logs deleted' })
    } catch (err) {
      toast.error({ title: 'Failed to delete audit logs', message: err.response?.data?.message || 'Please try again' })
    } finally {
      setDeletingAll(false)
    }
  }

  const columns = [
    {
      field: 'entityType',
      headerName: 'Record Type',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => RECORD_TYPE_LABELS[params.value] || params.value,
    },
    {
      field: 'entityId',
      headerName: 'Record ID',
      flex: 1,
      minWidth: 130,
      renderCell: (params) => params.value ? `${String(params.value).slice(0, 8)}...` : '-',
    },
    {
      field: 'action',
      headerName: 'Change',
      flex: 1,
      minWidth: 140,
      renderCell: (params) => {
        const status = CHANGE_TYPE_COLORS[params.value] || 'default'
        const label = String(params.value || '').replace('PROPOSAL_', '').replace('USER_', '').replace('ROLE_', '')
        return <ClayBadge status={status} size="sm">{label}</ClayBadge>
      },
    },
    {
      field: 'user',
      headerName: 'Changed By',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => {
        const user = params.row?.user
        return <Typography variant="body2" color="text.secondary">{user?.name || user?.email || '-'}</Typography>
      },
    },
    {
      field: 'createdAt',
      headerName: 'Date & Time',
      flex: 1,
      minWidth: 160,
      sortable: true,
      renderCell: (params) => <Typography variant="body2" color="text.secondary">{formatDate(params.value)}</Typography>,
    },
    ...(user?.role === 'SUPER_ADMIN'
      ? [
          {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 100,
            sortable: false,
            renderCell: (params) => (
              <IconButton size="small" onClick={() => setDeleteId(params.row.id)} sx={{ color: 'error.main' }}>
                <Trash2 size={14} />
              </IconButton>
            ),
          },
        ]
      : []),
  ]

  if (!hasPermission('AUDIT_VIEW')) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>403</Typography>
          <Typography variant="body2" color="text.secondary">Access Denied</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>You do not have permission to view audit logs.</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.03em', lineHeight: 1.2 }}>Audit Logs</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Track all changes across the application</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {user?.role === 'SUPER_ADMIN' && total > 0 && (
            <ClayButton variant="outline" size="sm" icon={Trash2} onClick={() => setShowDeleteAllModal(true)}>
              Clear All Logs
            </ClayButton>
          )}
          <ClayButton variant="outline" size="sm" onClick={fetchLogs} loading={loading}>
            Refresh
          </ClayButton>
        </Box>
      </Box>

      <Card elevation={0} sx={{ border: `1px solid ${borderColor}`, boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)', overflow: 'hidden' }}>
        <Box sx={{ p: 0 }}>
          <Box sx={{ height: 'clamp(360px, calc(100dvh - 330px), 760px)', width: '100%' }}>
            <DataGrid
              rows={logs}
              columns={columns}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: 'none',
                borderRadius: 0,
                '& .MuiDataGrid-cell': { borderColor: borderColor },
                '& .MuiDataGrid-columnHeaders': { borderColor: borderColor, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' },
                '& .MuiDataGrid-footerContainer': { borderColor: borderColor },
              }}
            />
          </Box>
        </Box>
      </Card>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Audit Log">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
              Warning: You are about to permanently delete an audit log. This action is irreversible.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This audit log will be permanently removed from the system. This cannot be undone.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <ClayButton variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</ClayButton>
            <ClayButton variant="danger" onClick={handleDelete} loading={deleting}>
              {deleting ? 'Deleting...' : 'Delete Audit Log'}
            </ClayButton>
          </Box>
        </Box>
      </Modal>

      <Modal isOpen={showDeleteAllModal} onClose={() => setShowDeleteAllModal(false)} title="Clear All Audit Logs">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
              Warning: You are about to permanently delete all audit logs. This action is irreversible.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All audit logs will be permanently removed from the system. This cannot be undone.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <ClayButton variant="outline" onClick={() => setShowDeleteAllModal(false)} disabled={deletingAll}>Cancel</ClayButton>
            <ClayButton variant="danger" onClick={handleDeleteAll} loading={deletingAll}>
              {deletingAll ? 'Deleting...' : 'Delete All Audit Logs'}
            </ClayButton>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default AuditLogs
