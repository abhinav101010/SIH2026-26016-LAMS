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

const INDIA_CENTER = [20.5937, 78.9629]

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'bg-gray-100 text-gray-700' },
  SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  FIELD_VERIFICATION: { label: 'Field Verification', color: 'bg-yellow-100 text-yellow-700' },
  UNDER_REVIEW: { label: 'Under Review', color: 'bg-orange-100 text-orange-700' },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: 'bg-purple-100 text-purple-700' },
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

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-surface border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-foreground">NLAMS</h1>
          <p className="text-xs text-foreground-secondary">National Land Acquisition Management System</p>
        </div>
        <nav className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground">Explore Proposals</span>
          <ClayButton variant="outline" size="sm" onClick={() => navigate('/login')}>
            Admin Login
          </ClayButton>
        </nav>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-full md:w-[380px] lg:w-[420px] bg-surface border-r border-border flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground mb-3">Land Acquisition Proposals</h2>

            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search proposals..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                className="px-2 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All Statuses</option>
                {filters.statuses.map((s) => (
                  <option key={s} value={s}>{statusConfig[s]?.label || s}</option>
                ))}
              </select>

              <select
                value={stateFilter}
                onChange={(e) => { setStateFilter(e.target.value); setPage(1) }}
                className="px-2 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All States</option>
                {filters.states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={districtFilter}
                onChange={(e) => { setDistrictFilter(e.target.value); setPage(1) }}
                className="px-2 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All Districts</option>
                {filters.districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                value={departmentFilter}
                onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1) }}
                className="px-2 py-1.5 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">All Departments</option>
                {filters.departments.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs text-primary hover:underline flex items-center gap-1">
                <X size={12} /> Clear filters
              </button>
            )}

            <p className="text-xs text-text-tertiary mt-2">
              {total} Public Proposal{total !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="text-center py-8 text-text-secondary text-sm">Loading proposals...</div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-8 text-text-secondary text-sm">
                <p>No proposals found</p>
                <p className="text-xs mt-1">Try changing your search or filters.</p>
              </div>
            ) : (
              proposals.map((proposal) => {
                const isSelected = proposal.id === selectedId
                const status = statusConfig[proposal.status] || { label: proposal.status, color: 'bg-gray-100 text-gray-700' }

                return (
                  <motion.div
                    key={proposal.id}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleCardClick(proposal)}
                    className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-surface hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground leading-tight">{proposal.projectName}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mb-2">{proposal.proposalNumber}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <MapPin size={12} />
                        {proposal.district}, {proposal.state}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <Building2 size={12} />
                        {proposal.department}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
                      <span className="text-[10px] text-text-tertiary">
                        {proposal.totalLandRequired} acres
                      </span>
                      <span className="text-[10px] text-text-tertiary">
                        Updated {new Date(proposal.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="p-3 border-t border-border flex items-center justify-between">
              <ClayButton variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft size={14} />
              </ClayButton>
              <span className="text-xs text-text-secondary">Page {page} of {totalPages}</span>
              <ClayButton variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight size={14} />
              </ClayButton>
            </div>
          )}
        </aside>

        <main className="hidden md:flex flex-1 relative">
          <div className="absolute inset-0">
            <MapContainer
              key={mapKey}
              center={INDIA_CENTER}
              zoom={5}
              style={{ height: '100%', width: '100%', background: 'hsl(var(--color-surface))' }}
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
                        color: isSelected ? '#2563eb' : '#64748b',
                        fillColor: isSelected ? '#3b82f6' : '#94a3b8',
                        fillOpacity: isSelected ? 0.5 : 0.35,
                        weight: isSelected ? 3 : 2,
                      }}
                      eventHandlers={{
                        click: () => handleMarkerClick(proposal),
                      }}
                    >
                      <Popup>
                        <div className="text-xs space-y-1">
                          <p className="font-semibold">{proposal.projectName}</p>
                          <p>{proposal.proposalNumber}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${status.color}`}>
                            {status.label}
                          </span>
                          <p>{proposal.district}, {proposal.state}</p>
                          <button
                            onClick={() => navigate(`/explore/${proposal.id}`)}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View Details <ExternalLink size={10} />
                          </button>
                        </div>
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
                        <div className="text-xs space-y-1">
                          <p className="font-semibold">{proposal.projectName}</p>
                          <p>{proposal.proposalNumber}</p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${status.color}`}>
                            {status.label}
                          </span>
                          <button
                            onClick={() => navigate(`/explore/${proposal.id}`)}
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            View Details <ExternalLink size={10} />
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                }

                return null
              })}
            </MapContainer>
          </div>

          {selectedProposal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-lg z-[1000]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{selectedProposal.projectName}</h3>
                  <p className="text-xs text-text-secondary">{selectedProposal.proposalNumber}</p>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-text-tertiary hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-text-secondary">
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  {selectedProposal.district}, {selectedProposal.state}
                </div>
                <div className="flex items-center gap-1">
                  <Building2 size={12} />
                  {selectedProposal.department}
                </div>
                <div className="flex items-center gap-1">
                  <FileText size={12} />
                  {selectedProposal.totalLandRequired} acres
                </div>
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${statusConfig[selectedProposal.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                    {statusConfig[selectedProposal.status]?.label || selectedProposal.status}
                  </span>
                </div>
              </div>
              <ClayButton
                variant="primary"
                size="sm"
                className="w-full mt-3"
                onClick={() => navigate(`/explore/${selectedProposal.id}`)}
              >
                View Details
              </ClayButton>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}

export default PublicProposals
