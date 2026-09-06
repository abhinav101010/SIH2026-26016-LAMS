import { useState, useEffect, useRef } from 'react'
import { Search, Trash2 } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { auditApi } from '../services'
import { useToast } from '../components/ui/Toast'
import ClayCard from '../components/ui/ClayCard'
import ClayButton from '../components/ui/ClayButton'
import ClaySelect from '../components/ui/ClaySelect'
import ClayBadge from '../components/ui/ClayBadge'
import DataTable from '../components/ui/DataTable'
import Modal from '../components/ui/Modal'
import { formatDate } from '../utils/formatters'

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
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [changeTypeFilter, setChangeTypeFilter] = useState('')
  const [recordTypeFilter, setRecordTypeFilter] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
  const fetchedRef = useRef(false)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = { page, limit: 10 }
      if (search) params.search = search
      if (changeTypeFilter) params.action = changeTypeFilter
      if (recordTypeFilter) params.entityType = recordTypeFilter

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
  }, [page, changeTypeFilter, recordTypeFilter])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchedRef.current = false
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

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
      key: 'entityType',
      header: 'Record Type',
      render: (value) => RECORD_TYPE_LABELS[value] || value,
    },
    {
      key: 'entityId',
      header: 'Record ID',
      render: (value) => value ? `${value.slice(0, 8)}...` : '-',
    },
    {
      key: 'action',
      header: 'Change',
      render: (value) => {
        const status = CHANGE_TYPE_COLORS[value] || 'default'
        const label = value?.replace('PROPOSAL_', '').replace('USER_', '').replace('ROLE_', '') || value
        return (
          <ClayBadge status={status} size="sm">
            {label}
          </ClayBadge>
        )
      },
    },
    {
      key: 'user',
      header: 'Changed By',
      render: (_, row) => row.user?.name || row.user?.email || '-',
    },
    {
      key: 'createdAt',
      header: 'Date & Time',
      render: (value) => formatDate(value),
      sortable: true,
    },
    ...(user?.role === 'SUPER_ADMIN'
      ? [
          {
            key: 'actions',
            header: 'Actions',
            render: (_, row) => (
              <button
                onClick={() => setDeleteId(row.id)}
                className="p-1 rounded-lg text-foreground-tertiary hover:text-status-rejected hover:bg-status-rejected/10 transition"
              >
                <Trash2 size={14} />
              </button>
            ),
          },
        ]
      : []),
  ]

  if (!hasPermission('AUDIT_VIEW')) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">403</h1>
          <p className="text-foreground-secondary">Access Denied</p>
          <p className="text-sm text-foreground-secondary mt-2">You do not have permission to view audit logs.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
          <p className="text-sm text-text-secondary mt-1">Track all changes across the application</p>
        </div>
        <div className="flex items-center gap-2">
          {user?.role === 'SUPER_ADMIN' && total > 0 && (
            <ClayButton variant="outline" size="sm" icon={Trash2} onClick={() => setShowDeleteAllModal(true)}>
              Clear All Logs
            </ClayButton>
          )}
          <ClayButton variant="outline" size="sm" onClick={fetchLogs} loading={loading}>
            Refresh
          </ClayButton>
        </div>
      </div>

      <ClayCard>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface border border-border text-foreground placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <ClaySelect
            value={changeTypeFilter}
            onChange={(e) => setChangeTypeFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">All Changes</option>
            <option value="CREATED">Created</option>
            <option value="UPDATED">Updated</option>
            <option value="DELETED">Deleted</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </ClaySelect>
          <ClaySelect
            value={recordTypeFilter}
            onChange={(e) => setRecordTypeFilter(e.target.value)}
            className="w-full sm:w-48"
          >
            <option value="">All Records</option>
            <option value="Proposal">Proposal</option>
            <option value="User">User</option>
            <option value="Role">Role</option>
            <option value="LandParcel">Land Parcel</option>
            <option value="Document">Document</option>
          </ClaySelect>
        </div>

        <DataTable
          columns={columns}
          data={logs}
          searchable={false}
          pagination={true}
          pageSize={10}
          emptyMessage={loading ? 'Loading...' : 'No audit logs found'}
        />

        {total > 0 && (
          <div className="mt-4 text-sm text-text-secondary">
            Showing {logs.length} of {total} records
          </div>
        )}
      </ClayCard>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Audit Log">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              Warning: You are about to permanently delete an audit log. This action is irreversible.
            </p>
            <p className="text-sm text-foreground-secondary">
              This audit log will be permanently removed from the system. This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <ClayButton variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancel
            </ClayButton>
            <ClayButton variant="danger" onClick={handleDelete} loading={deleting}>
              {deleting ? 'Deleting...' : 'Delete Audit Log'}
            </ClayButton>
          </div>
        </div>
      </Modal>

      {/* Delete All Confirmation Modal */}
      <Modal isOpen={showDeleteAllModal} onClose={() => setShowDeleteAllModal(false)} title="Clear All Audit Logs">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              Warning: You are about to permanently delete all audit logs. This action is irreversible.
            </p>
            <p className="text-sm text-foreground-secondary">
              All audit logs will be permanently removed from the system. This cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <ClayButton variant="outline" onClick={() => setShowDeleteAllModal(false)} disabled={deletingAll}>
              Cancel
            </ClayButton>
            <ClayButton variant="danger" onClick={handleDeleteAll} loading={deletingAll}>
              {deletingAll ? 'Deleting...' : 'Delete All Audit Logs'}
            </ClayButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AuditLogs
