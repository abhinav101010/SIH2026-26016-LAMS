import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Check,
  X,
  MessageSquare,
} from 'lucide-react'

import ClayCard from '../components/ui/ClayCard'
import ClayButton from '../components/ui/ClayButton'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import { proposalApi } from '../services'
import { useAuth } from '../auth/AuthContext'
import { formatDate } from '../utils/formatters'

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'acquired', label: 'Acquired' },
]

const Proposals = () => {
  const { user, hasPermission } = useAuth()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stateFilter, setStateFilter] = useState('all')
  const [districtFilter, setDistrictFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [sortField, setSortField] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [actionLoadingId, setActionLoadingId] = useState(null)
  const [showDeleteId, setShowDeleteId] = useState(null)

  const canCreate = hasPermission('PROPOSALS_CREATE')
  const canEdit = hasPermission('PROPOSALS_EDIT')
  const canDelete = hasPermission('PROPOSALS_DELETE')

  const handleDelete = async (proposalId) => {
    setActionLoadingId(proposalId)
    try {
      const proposal = data.find((p) => p.id === proposalId)
      const isSuperAdmin = user?.role === 'SUPER_ADMIN'
      const isDraft = proposal?.status === 'DRAFT'
      const needsConfirm = !isDraft && isSuperAdmin
      await proposalApi.delete(proposalId, needsConfirm)
      await fetchProposals()
    } catch (err) {
      console.error('Failed to delete proposal:', err)
    } finally {
      setActionLoadingId(null)
      setShowDeleteId(null)
    }
  }

  const fetchProposals = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        limit: 10,
        sortBy: sortField,
        sortOrder: sortDirection,
      }
      if (statusFilter !== 'all') params.status = statusFilter.toUpperCase()
      if (stateFilter !== 'all') params.state = stateFilter
      if (searchQuery) params.search = searchQuery

      const res = await proposalApi.getAll(params)
      setData(res.data || [])
      setTotal(res.pagination?.total || 0)
      setTotalPages(res.pagination?.totalPages || 1)
    } catch (err) {
      console.error('Failed to fetch proposals:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProposals()
  }, [currentPage, statusFilter, stateFilter, sortField, sortDirection])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, stateFilter])

  const filteredData = useMemo(() => {
    if (!searchQuery) return data
    const q = searchQuery.toLowerCase()
    return data.filter(
      (p) =>
        p.proposalNumber?.toLowerCase().includes(q) ||
        p.projectName?.toLowerCase().includes(q) ||
        p.department?.toLowerCase().includes(q) ||
        p.district?.toLowerCase().includes(q) ||
        p.state?.toLowerCase().includes(q)
    )
  }, [data, searchQuery])

  const clearAllFilters = () => {
    setStatusFilter('all')
    setStateFilter('all')
    setDistrictFilter('all')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const columns = [
    {
      key: 'proposalNumber',
      header: 'Proposal ID',
      sortable: true,
      render: (val) => <code className="text-xs font-mono text-foreground-secondary">{val}</code>,
    },
    {
      key: 'projectName',
      header: 'Project',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="text-sm font-medium text-foreground">{val}</p>
          <p className="text-xs text-foreground-tertiary">{row.department}</p>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (_, row) => (
        <div>
          <p className="text-sm text-foreground">{row.district}</p>
          <span className="text-xs text-foreground-tertiary">{row.state}</span>
        </div>
      ),
    },
    {
      key: 'totalLandRequired',
      header: 'Area',
      sortable: true,
      render: (val) => <span className="text-sm font-medium text-foreground">{val} ha</span>,
    },
    {
      key: 'affectedFamilies',
      header: 'Families',
      sortable: true,
      render: (val) => <span className="text-sm text-foreground">{val?.toLocaleString('en-IN')}</span>,
    },
    {
      key: 'submittedDate',
      header: 'Submitted',
      sortable: true,
      render: (val) => <span className="text-sm text-foreground-secondary">{formatDate(val)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (val) => <StatusBadge status={(val || '').toLowerCase()} size="sm" />,
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: val + '%',
                backgroundColor: val >= 75 ? '#10B981' : val >= 40 ? '#F59E0B' : '#EF4444',
              }}
            />
          </div>
          <span className="text-xs text-foreground-secondary">{val}%</span>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: false,
      render: (_, row) => {
        const isDraft = row.status === 'DRAFT'
        const isUnderReview = row.status === 'UNDER_REVIEW'
        const canApprove = isUnderReview && user?.role === 'REVIEWING_AUTHORITY'
        const canReject = isUnderReview && hasPermission('PROPOSALS_REJECT')
        const canRequestChanges = isUnderReview && hasPermission('PROPOSALS_EDIT')

        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => (window.location.href = `/proposals/${row.id}`)}
              className="px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              View
            </button>
            {isDraft && canEdit && (
              <button
                onClick={() => (window.location.href = `/proposals/${row.id}/edit`)}
                className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-foreground transition"
              >
                <Edit3 size={15} />
              </button>
            )}
            {(isDraft || (user?.role === 'SUPER_ADMIN' && canDelete)) && (
              <button
                onClick={() => setShowDeleteId(row.id)}
                className="p-1.5 rounded-lg hover:bg-surface text-text-secondary hover:text-foreground transition"
              >
                <Trash2 size={15} />
              </button>
            )}
            {canApprove && (
              <button
                onClick={() => (window.location.href = `/proposals/${row.id}`)}
                className="p-1.5 rounded-lg hover:bg-status-approved/10 text-status-approved transition"
                title="Approve"
              >
                <Check size={15} />
              </button>
            )}
            {canReject && (
              <button
                onClick={() => (window.location.href = `/proposals/${row.id}`)}
                className="p-1.5 rounded-lg hover:bg-status-rejected/10 text-status-rejected transition"
                title="Reject"
              >
                <X size={15} />
              </button>
            )}
            {canRequestChanges && (
              <button
                onClick={() => (window.location.href = `/proposals/${row.id}`)}
                className="p-1.5 rounded-lg hover:bg-neutral-50 text-text-secondary hover:text-foreground transition"
                title="Request Changes"
              >
                <MessageSquare size={15} />
              </button>
            )}
          </div>
        )
      },
    },
  ]

  const SortHeader = (col) => {
    if (!col.sortable) return null
    const isActive = sortField === col.key
    return (
      <button
        onClick={() => {
          if (sortField === col.key) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
          } else {
            setSortField(col.key)
            setSortDirection('desc')
          }
        }}
        className="flex items-center gap-1 text-xs font-medium text-foreground-secondary uppercase tracking-wider hover:text-foreground"
      >
        {col.header}
        {isActive && (sortDirection === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </button>
    )
  }

  const activeFiltersCount = [
    statusFilter !== 'all',
    stateFilter !== 'all',
    !!searchQuery,
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Land Acquisition Proposals</h1>
          <p className="text-foreground-secondary text-sm mt-1">
            Manage, review and monitor submitted land acquisition proposals.
          </p>
        </div>
        {canCreate && (
          <ClayButton
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => (window.location.href = '/proposals/new')}
          >
            New Proposal
          </ClayButton>
        )}
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
            placeholder="Search proposal, project, or ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-foreground-secondary hover:text-foreground px-2 py-1 rounded-lg hover:bg-neutral-50 transition"
            >
              Clear all ({activeFiltersCount})
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setCurrentPage(1) }}
            className={`
              px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${statusFilter === f.value
                ? 'bg-primary text-white shadow-clay-btn'
                : 'bg-card border border-border text-foreground-secondary hover:text-foreground hover:bg-neutral-50'}
            `}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table View (Desktop) */}
      <div className="hidden sm:block">
        <ClayCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800">
                  {columns.map((col) => (
                    <th key={col.key} className="text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider pb-3 px-4">
                      {SortHeader(col) || col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-t border-border/50">
                      <td colSpan={columns.length} className="py-4 px-4">
                        <div className="h-4 bg-neutral-100 rounded animate-pulse w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-foreground-secondary">
                        <div className="text-4xl opacity-20">📋</div>
                        <p>No proposals found</p>
                        <p className="text-xs">Try changing your filters or create a new proposal.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr
                      key={row.id}
                      className="border-t border-border/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="py-3 px-4 align-middle">
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-foreground-secondary">
                Showing {(currentPage - 1) * 10 + 1}–{Math.min(currentPage * 10, total)} of {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-border bg-surface disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                  let pageNum
                  if (totalPages <= 5) pageNum = i + 1
                  else if (currentPage <= 3) pageNum = i + 1
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                  else pageNum = currentPage - 2 + i

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`
                        px-3 py-1.5 text-sm rounded-lg border transition
                        ${currentPage === pageNum
                          ? 'bg-primary text-white border-primary'
                          : 'border-border bg-surface hover:bg-neutral-50'}
                      `}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-border bg-surface disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </ClayCard>
      </div>

      {/* Results summary */}
      <div className="text-sm text-foreground-secondary">
        {filteredData.length} proposal{filteredData.length !== 1 ? 's' : ''} found
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!showDeleteId} onClose={() => setShowDeleteId(null)} title="Delete Proposal">
        <div className="space-y-4">
          {(() => {
            const proposal = data.find((p) => p.id === showDeleteId)
            const isDraft = proposal?.status === 'DRAFT'
            const isSuperAdmin = user?.role === 'SUPER_ADMIN'

            if (isDraft) {
              return (
                <p className="text-sm text-foreground-secondary">
                  This action will permanently delete this proposal and its associated records. This cannot be undone.
                </p>
              )
            }

            if (isSuperAdmin) {
              return (
                <div className="space-y-2">
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Warning: You are about to delete a non-draft proposal. This action is irreversible.
                  </p>
                  <p className="text-sm text-foreground-secondary">
                    This proposal and all its associated records will be permanently deleted. This cannot be undone.
                  </p>
                </div>
              )
            }

            return null
          })()}
          <div className="flex justify-end gap-3">
            <ClayButton variant="outline" onClick={() => setShowDeleteId(null)} disabled={actionLoadingId === showDeleteId}>
              Cancel
            </ClayButton>
            <ClayButton variant="danger" onClick={() => handleDelete(showDeleteId)} loading={actionLoadingId === showDeleteId}>
              Delete Proposal
            </ClayButton>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default Proposals
