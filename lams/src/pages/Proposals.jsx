import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  Check,
  X,
  MessageSquare,
  FileText,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
  alpha,
  useTheme,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { Clear as ClearIcon } from '@mui/icons-material'
import ClayButton from '../components/ui/ClayButton'
import StatusBadge from '../components/ui/StatusBadge'
import Modal from '../components/ui/Modal'
import { proposalApi } from '../services'
import { useAuth } from '../auth/AuthContext'
import { formatDate } from '../utils/formatters'
import { DataGrid } from '@mui/x-data-grid'

const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'acquired', label: 'Acquired' },
]

const Proposals = () => {
  const theme = useTheme()
  const navigate = useNavigate()
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
  const [states, setStates] = useState([])
  const [districts, setDistricts] = useState([])

  const canCreate = hasPermission('PROPOSALS_CREATE')
  const canEdit = hasPermission('PROPOSALS_EDIT')
  const canDelete = hasPermission('PROPOSALS_DELETE')

  const isDark = theme.palette.mode === 'dark'

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await proposalApi.getFilters()
        setStates(res.data?.states || [])
        setDistricts(res.data?.districts || [])
      } catch (e) { console.error(e) }
    }
    fetchFilters()
  }, [])

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
      if (districtFilter !== 'all') params.district = districtFilter
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
  }, [currentPage, statusFilter, stateFilter, districtFilter, sortField, sortDirection])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, stateFilter, districtFilter])

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

  const activeFiltersCount = [
    statusFilter !== 'all',
    stateFilter !== 'all',
    districtFilter !== 'all',
    !!searchQuery,
  ].filter(Boolean).length

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            Land Acquisition Proposals
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage, review and monitor submitted land acquisition proposals.
          </Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => navigate('/proposals/new')}
            sx={{ borderRadius: 3, px: 3, py: 1.5 }}
          >
            New Proposal
          </Button>
        )}
      </Box>

      {/* Search + Filters */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
          boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)',
        }}
      >
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search proposal, project, or ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              size="small"
              sx={{ flex: 1, minWidth: 240 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} style={{ opacity: 0.5 }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
              >
                {statusFilters.map((f) => (
                  <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>State</InputLabel>
              <Select
                value={stateFilter}
                label="State"
                onChange={(e) => { setStateFilter(e.target.value); setCurrentPage(1) }}
              >
                <MenuItem value="all">All States</MenuItem>
                {states.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {activeFiltersCount > 0 && (
              <Button
                variant="text"
                size="small"
                startIcon={<ClearIcon fontSize="small" />}
                onClick={clearAllFilters}
                sx={{ color: 'text.secondary' }}
              >
                Clear ({activeFiltersCount})
              </Button>
            )}
          </Box>

          {/* Status Chips */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {statusFilters.map((f) => (
              <Chip
                key={f.value}
                label={f.label}
                onClick={() => { setStatusFilter(f.value); setCurrentPage(1) }}
                color={statusFilter === f.value ? 'primary' : 'default'}
                variant={statusFilter === f.value ? 'filled' : 'outlined'}
                sx={{ borderRadius: 2.5, fontWeight: 500, fontSize: '0.8125rem' }}
              />
            ))}
          </Box>
        </Box>
      </Card>

      {/* Table */}
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
          boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 24px rgba(30,111,255,0.04)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ height: 520, width: '100%' }}>
          <DataGrid
            rows={filteredData.map((r) => ({ ...r, id: r.id }))}
            columns={[
              {
                field: 'proposalNumber',
                headerName: 'Proposal ID',
                flex: 1,
                minWidth: 130,
                renderCell: (params) => (
                  <Typography variant="body2" fontFamily="mono" color="text.secondary" fontSize="0.8125rem">
                    {params.value}
                  </Typography>
                ),
              },
              {
                field: 'projectName',
                headerName: 'Project',
                flex: 2,
                minWidth: 220,
                renderCell: (params) => (
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{params.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{params.row.department}</Typography>
                  </Box>
                ),
              },
              {
                field: 'district',
                headerName: 'Location',
                flex: 1,
                minWidth: 150,
                renderCell: (params) => (
                  <Box>
                    <Typography variant="body2">{params.value}</Typography>
                    <Typography variant="caption" color="text.secondary">{params.row.state}</Typography>
                  </Box>
                ),
              },
              {
                field: 'totalLandRequired',
                headerName: 'Area',
                flex: 1,
                minWidth: 100,
                renderCell: (params) => <Typography variant="body2" fontWeight={500}>{params.value} ha</Typography>,
              },
              {
                field: 'affectedFamilies',
                headerName: 'Families',
                flex: 1,
                minWidth: 100,
                renderCell: (params) => <Typography variant="body2">{params.value?.toLocaleString('en-IN')}</Typography>,
              },
              {
                field: 'submittedDate',
                headerName: 'Submitted',
                flex: 1,
                minWidth: 120,
                renderCell: (params) => <Typography variant="body2" color="text.secondary" fontSize="0.8125rem">{formatDate(params.value)}</Typography>,
              },
              {
                field: 'status',
                headerName: 'Status',
                flex: 1,
                minWidth: 130,
                renderCell: (params) => <StatusBadge status={String(params.value).toLowerCase()} size="sm" />,
              },
              {
                field: 'progress',
                headerName: 'Progress',
                flex: 1,
                minWidth: 160,
                sortable: false,
                renderCell: (params) => (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={params.value}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          },
                        }}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 36, textAlign: 'right' }}>
                      {params.value}%
                    </Typography>
                  </Box>
                ),
              },
              {
                field: 'actions',
                headerName: 'Actions',
                flex: 1,
                minWidth: 180,
                sortable: false,
                renderCell: (params) => {
                  const row = params.row
                  const isDraft = row.status === 'DRAFT'
                  const isUnderReview = row.status === 'UNDER_REVIEW'
                  const canApprove = isUnderReview && user?.role === 'REVIEWING_AUTHORITY'
                  const canReject = isUnderReview && hasPermission('PROPOSALS_REJECT')
                  const canRequestChanges = isUnderReview && hasPermission('PROPOSALS_EDIT')
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'center' }}>
                      <Tooltip title="View">
                        <IconButton size="small" onClick={() => navigate(`/proposals/${row.id}`)} sx={{ color: 'primary.main' }}>
                          <FileText size={16} />
                        </IconButton>
                      </Tooltip>
                      {isDraft && canEdit && (
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => navigate(`/proposals/${row.id}/edit`)} sx={{ color: 'text.secondary' }}>
                            <Edit3 size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {(isDraft || (user?.role === 'SUPER_ADMIN' && canDelete)) && (
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setShowDeleteId(row.id)} sx={{ color: 'text.secondary' }}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canApprove && (
                        <Tooltip title="Approve">
                          <IconButton size="small" onClick={() => navigate(`/proposals/${row.id}`)} sx={{ color: 'success.main' }}>
                            <Check size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canReject && (
                        <Tooltip title="Reject">
                          <IconButton size="small" onClick={() => navigate(`/proposals/${row.id}`)} sx={{ color: 'error.main' }}>
                            <X size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {canRequestChanges && (
                        <Tooltip title="Request Changes">
                          <IconButton size="small" onClick={() => navigate(`/proposals/${row.id}`)} sx={{ color: 'text.secondary' }}>
                            <MessageSquare size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  )
                },
              },
            ]}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              borderRadius: 0,
              '& .MuiDataGrid-row': { cursor: 'pointer' },
              '& .MuiDataGrid-cell': { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
              '& .MuiDataGrid-columnHeaders': { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' },
              '& .MuiDataGrid-footerContainer': { borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' },
            }}
          />
        </Box>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!showDeleteId} onClose={() => setShowDeleteId(null)} title="Delete Proposal">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {(() => {
            const proposal = data.find((p) => p.id === showDeleteId)
            const isDraft = proposal?.status === 'DRAFT'
            const isSuperAdmin = user?.role === 'SUPER_ADMIN'

            if (isDraft) {
              return (
                <Typography variant="body2" color="text.secondary">
                  This action will permanently delete this proposal and its associated records. This cannot be undone.
                </Typography>
              )
            }

            if (isSuperAdmin) {
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2" color="error.main" fontWeight={600}>
                    Warning: You are about to delete a non-draft proposal. This action is irreversible.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This proposal and all its associated records will be permanently deleted. This cannot be undone.
                  </Typography>
                </Box>
              )
            }

            return null
          })()}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button variant="outlined" onClick={() => setShowDeleteId(null)} disabled={actionLoadingId === showDeleteId}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDelete(showDeleteId)}
              disabled={actionLoadingId === showDeleteId}
              startIcon={actionLoadingId === showDeleteId ? <LinearProgress size={16} /> : null}
            >
              Delete Proposal
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  )
}

export default Proposals
