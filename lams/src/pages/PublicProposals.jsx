import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  MapPin,
  Building2,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react'
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet'
import ClayButton from '../components/ui/ClayButton'
import { publicApi } from '../services'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Box,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Card,
  CardContent,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
  useTheme,
} from '@mui/material'

const INDIA_CENTER = [20.5937, 78.9629]

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  FIELD_VERIFICATION: { label: 'Field Verification', color: 'bg-yellow-100 text-yellow-700' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-orange-100 text-orange-700' },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: 'bg-indigo-100 text-indigo-700' },
  NOTIFICATION_ISSUED: { label: 'Notification Issued', color: 'bg-indigo-100 text-indigo-700' },
  AWARD_DECLARED: { label: 'Award Declared', color: 'bg-teal-100 text-teal-700' },
  COMPENSATION: { label: 'Compensation', color: 'bg-pink-100 text-pink-700' },
  ACQUIRED: { label: 'Acquired', color: 'bg-emerald-100 text-emerald-700' },
  POSSESSION: { label: 'Possession', color: 'bg-cyan-100 text-cyan-700' },
}

const MapController = ({ selectedId, proposals, onMapReady }) => {
  const map = useMap()
  const initialized = useRef(false)

  useEffect(() => {
    onMapReady(map)
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 150)
    return () => clearTimeout(timer)
  }, [map, onMapReady])

  useEffect(() => {
    if (!selectedId) return
    const proposal = proposals.find((p) => p.id === selectedId)
    if (!proposal) return
    const parcel = proposal.parcels?.[0]
    if (parcel?.geometry) {
      try {
        const raw = typeof parcel.geometry === 'string' ? parcel.geometry : JSON.stringify(parcel.geometry)
        const geo = JSON.parse(raw)
        if (geo.type === 'Polygon') {
          const coords = geo.coordinates[0].map((c) => [c[1], c[0]])
          map.fitBounds(coords, { padding: [50, 50], maxZoom: 16 })
        } else if (geo.type === 'Point') {
          const [lng, lat] = geo.coordinates
          map.setView([lat, lng], 14, { animate: true })
        }
      } catch {}
    }
  }, [selectedId, proposals, map])

  useEffect(() => {
    if (initialized.current || !proposals.length) return
    initialized.current = true
    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 300)
    return () => clearTimeout(timer)
  }, [proposals, map])

  return null
}

const PublicProposals = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [filters, setFilters] = useState({ statuses: [], states: [], districts: [], departments: [] })
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedId, setSelectedId] = useState(null)
  const [mapKey, setMapKey] = useState(0)
  const mapInstanceRef = useRef(null)
  const fetchTriggerRef = useRef(0)

  useEffect(() => {
    publicApi.getFilters().then((data) => setFilters(data.data)).catch(() => {})
  }, [])

  const fetchProposals = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, limit: 20 }
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (stateFilter) params.state = stateFilter
      if (districtFilter) params.district = districtFilter
      if (departmentFilter) params.department = departmentFilter

      const res = await publicApi.getProposals(params)
      setProposals(res.data || [])
      setTotal(res.pagination?.total || 0)
      setTotalPages(res.pagination?.totalPages || 1)

      if (res.data?.length && !mapInstanceRef.current) {
        setMapKey((k) => k + 1)
      }
    } catch (err) {
      console.error('[PublicProposals] Failed to load proposals', err)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, stateFilter, districtFilter, departmentFilter])

  useEffect(() => {
    const current = fetchTriggerRef.current
    fetchTriggerRef.current += 1
    fetchProposals()
    return () => {
      fetchTriggerRef.current = current
    }
  }, [page, search, statusFilter, stateFilter, districtFilter, departmentFilter])

  const handleMapReady = useCallback((map) => {
    mapInstanceRef.current = map
  }, [])

  const selectedProposal = useMemo(() => proposals.find((p) => p.id === selectedId), [proposals, selectedId])

  const getGeometry = (proposal) => {
    const parcel = proposal.parcels?.[0]
    if (!parcel?.geometry) return null
    try {
      const raw = typeof parcel.geometry === 'string' ? parcel.geometry : JSON.stringify(parcel.geometry)
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  const handleCardClick = (proposal) => {
    setSelectedId(proposal.id)
  }

  const handleMarkerClick = (proposal) => {
    setSelectedId(proposal.id)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('')
    setStateFilter('')
    setDistrictFilter('')
    setDepartmentFilter('')
    setPage(1)
  }

  const hasActiveFilters = search || statusFilter || stateFilter || districtFilter || departmentFilter

  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: isDark ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          borderBottom: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56, px: { xs: 2, md: 3 } }}>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.02em', lineHeight: 1.2 }}>Bharat Bhoomi</Typography>
            <Typography variant="caption" color="text.secondary">Land Acquisition Management Platform</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip label="Explore Proposals" size="small" sx={{ fontWeight: 600, fontSize: '0.8125rem', display: { xs: 'none', sm: 'flex' } }} />
            <Button variant="outlined" size="small" onClick={() => navigate('/login')} sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600 }}>Admin Login</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <Box
          sx={{
            width: { xs: '100%', md: 400, lg: 420 },
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRight: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
          }}
        >
          <Box sx={{ p: 2.5, borderBottom: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em', mb: 2 }}>Land Acquisition Proposals</Typography>
            <TextField
              placeholder="Search proposals..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              size="small"
              fullWidth
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} style={{ opacity: 0.5 }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
                  <MenuItem value="">All Statuses</MenuItem>
                  {filters.statuses.map((s) => (
                    <MenuItem key={s} value={s}>{statusConfig[s]?.label || s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>State</InputLabel>
                <Select value={stateFilter} label="State" onChange={(e) => { setStateFilter(e.target.value); setPage(1) }}>
                  <MenuItem value="">All States</MenuItem>
                  {filters.states.map((s) => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>District</InputLabel>
                <Select value={districtFilter} label="District" onChange={(e) => { setDistrictFilter(e.target.value); setPage(1) }}>
                  <MenuItem value="">All Districts</MenuItem>
                  {filters.districts.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" fullWidth>
                <InputLabel>Department</InputLabel>
                <Select value={departmentFilter} label="Department" onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1) }}>
                  <MenuItem value="">All Departments</MenuItem>
                  {filters.departments.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {hasActiveFilters && (
              <Button variant="text" size="small" onClick={clearFilters} startIcon={<X size={14} />} sx={{ textTransform: 'none', px: 0, py: 0.5 }}>
                Clear filters
              </Button>
            )}
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <Typography variant="body2">Loading proposals...</Typography>
              </Box>
            ) : proposals.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                <Typography variant="body2">No proposals found</Typography>
                <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>Try changing your search or filters.</Typography>
              </Box>
            ) : (
              proposals.map((proposal) => {
                const isSelected = proposal.id === selectedId
                const status = statusConfig[proposal.status] || { label: proposal.status, color: 'bg-gray-100 text-gray-700' }

                return (
                  <motion.div
                    key={proposal.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleCardClick(proposal)}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        cursor: 'pointer',
                        borderRadius: 3,
                        border: (t) => `1px solid ${isSelected ? t.palette.primary.main : (t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')}`,
                        bgcolor: isSelected ? 'primary.main' : 'background.paper',
                        color: isSelected ? 'primary.contrastText' : 'text.primary',
                        boxShadow: isSelected ? '0 4px 16px rgba(30,111,255,0.15)' : 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: '0 2px 8px rgba(30,111,255,0.08)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>{proposal.projectName}</Typography>
                          <Chip label={status.label} size="small" sx={{ fontWeight: 600, fontSize: '0.7rem', flexShrink: 0 }} />
                        </Box>
                        <Typography variant="caption" color={isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary'} sx={{ display: 'block', mb: 1.5 }}>{proposal.proposalNumber}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MapPin size={12} color={isSelected ? 'rgba(255,255,255,0.7)' : undefined} />
                            <Typography variant="caption" color={isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary'}>{proposal.district}, {proposal.state}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Building2 size={12} color={isSelected ? 'rgba(255,255,255,0.7)' : undefined} />
                            <Typography variant="caption" color={isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary'}>{proposal.department}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1.5, pt: 1.5, borderTop: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}` }}>
                          <Typography variant="caption" color={isSelected ? 'rgba(255,255,255,0.7)' : 'text.tertiary'}>{proposal.totalLandRequired} acres</Typography>
                          <Typography variant="caption" color={isSelected ? 'rgba(255,255,255,0.7)' : 'text.tertiary'}>Updated {new Date(proposal.updatedAt).toLocaleDateString()}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            )}
          </Box>

          {totalPages > 1 && (
            <Box sx={{ p: 2, borderTop: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <IconButton size="small" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} sx={{ color: 'text.secondary' }}>
                <ChevronLeft size={18} />
              </IconButton>
              <Typography variant="caption" color="text.secondary">Page {page} of {totalPages}</Typography>
              <IconButton size="small" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} sx={{ color: 'text.secondary' }}>
                <ChevronRight size={18} />
              </IconButton>
            </Box>
          )}
        </Box>

        <Box sx={{ flex: '1 1 0%', minWidth: 0, position: 'relative', display: { xs: selectedProposal ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column' }}>
          <Box sx={{ flex: 1, position: 'relative' }}>
            <MapContainer
              key={mapKey}
              center={INDIA_CENTER}
              zoom={5}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom
              zoomControl
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              <MapController selectedId={selectedId} proposals={proposals} onMapReady={handleMapReady} />

              {proposals.map((proposal) => {
                const geo = getGeometry(proposal)
                if (!geo) return null

                const isSelected = proposal.id === selectedId
                const status = statusConfig[proposal.status] || { label: proposal.status }

                if (geo.type === 'Polygon') {
                  const coords = geo.coordinates[0].map((c) => [c[1], c[0]])
                  return (
                    <Polygon
                      key={proposal.id}
                      positions={coords}
                      pathOptions={{
                        color: isSelected ? '#1e6fff' : '#64748b',
                        fillColor: isSelected ? '#3b82f6' : '#94a3b8',
                        fillOpacity: isSelected ? 0.5 : 0.35,
                        weight: isSelected ? 3 : 2,
                      }}
                      eventHandlers={{
                        click: () => handleMarkerClick(proposal),
                      }}
                    >
                      <Popup>
                        <Box sx={{ p: 1, minWidth: 180 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{proposal.projectName}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{proposal.proposalNumber}</Typography>
                          <Chip label={status.label} size="small" sx={{ mb: 1 }} />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                            <MapPin size={12} />
                            <Typography variant="caption">{proposal.district}, {proposal.state}</Typography>
                          </Box>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => navigate(`/explore/${proposal.id}`)}
                            sx={{ mt: 1, textTransform: 'none', px: 0, py: 0.5 }}
                            endIcon={<ExternalLink size={12} />}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Popup>
                    </Polygon>
                  )
                }

                if (geo.type === 'Point') {
                  const [lng, lat] = geo.coordinates
                  return (
                    <Marker
                      key={proposal.id}
                      position={[lat, lng]}
                      eventHandlers={{
                        click: () => handleMarkerClick(proposal),
                      }}
                    >
                      <Popup>
                        <Box sx={{ p: 1, minWidth: 180 }}>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{proposal.projectName}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{proposal.proposalNumber}</Typography>
                          <Chip label={status.label} size="small" sx={{ mb: 1 }} />
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => navigate(`/explore/${proposal.id}`)}
                            sx={{ mt: 1, textTransform: 'none', px: 0, py: 0.5 }}
                            endIcon={<ExternalLink size={12} />}
                          >
                            View Details
                          </Button>
                        </Box>
                      </Popup>
                    </Marker>
                  )
                }

                return null
              })}
            </MapContainer>
          </Box>

          {selectedProposal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                elevation={0}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  right: 16,
                  zIndex: 1000,
                  borderRadius: 4,
                  border: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'}`,
                  boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(30,111,255,0.08)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>{selectedProposal.projectName}</Typography>
                      <Typography variant="caption" color="text.secondary">{selectedProposal.proposalNumber}</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setSelectedId(null)} sx={{ color: 'text.secondary' }}>
                      <X size={18} />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <MapPin size={14} color="text.secondary" />
                      <Typography variant="caption" color="text.secondary">{selectedProposal.district}, {selectedProposal.state}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Building2 size={14} color="text.secondary" />
                      <Typography variant="caption" color="text.secondary">{selectedProposal.department}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <FileText size={14} color="text.secondary" />
                      <Typography variant="caption" color="text.secondary">{selectedProposal.totalLandRequired} acres</Typography>
                    </Box>
                    <Box>
                      <Chip
                        label={statusConfig[selectedProposal.status]?.label || selectedProposal.status}
                        size="small"
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </Box>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => navigate(`/explore/${selectedProposal.id}`)}
                    sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600 }}
                    endIcon={<ExternalLink size={14} />}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default PublicProposals
