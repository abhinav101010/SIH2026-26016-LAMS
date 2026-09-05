import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Tooltip,
  Popup,
} from 'react-leaflet'
import L from 'leaflet'
import { Search, Filter, ZoomIn, ZoomOut, Info, Layers } from 'lucide-react'
import 'leaflet/dist/leaflet.css'

import ClayCard from '../components/ui/ClayCard'
import StatusBadge from '../components/ui/StatusBadge'
import MapPopup from '../components/gis/MapPopup'

import { parcelApi, proposalApi } from '../services'
import { STATES } from '../data'

const GISMapPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [stateFilter, setStateFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedParcel, setSelectedParcel] = useState(null)
  const [mapLayer, setMapLayer] = useState('osm')
  const [parcels, setParcels] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [parcelsRes, projectsRes] = await Promise.all([
          parcelApi.getMapParcels({ format: 'geojson' }),
          proposalApi.getAll({ limit: 50 }),
        ])
        setParcels(parcelsRes.features || [])
        setProjects(projectsRes.data || [])
      } catch (err) {
        console.error('Failed to fetch map data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      if (statusFilter !== 'all' && p.properties?.status !== statusFilter) return false
      if (searchQuery && !(p.properties?.projectName || '').toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [parcels, statusFilter, searchQuery])

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (stateFilter !== 'All' && p.state !== stateFilter) return false
      if (statusFilter !== 'all' && p.status?.toLowerCase() !== statusFilter) return false
      if (searchQuery && !p.projectName?.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [projects, stateFilter, statusFilter, searchQuery])

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'acquired', label: 'Acquired' },
    { value: 'rejected', label: 'Rejected' },
  ]

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  }

  return (
    <div className="h-[calc(100vh-220px)] flex flex-col lg:flex-row gap-4">
      {/* Filters Sidebar */}
      <motion.aside
        initial="initial"
        animate="animate"
        variants={fadeIn}
        className="w-full lg:w-72 xl:w-80 space-y-4"
      >
        <ClayCard className="p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Filter size={16} className="text-primary" />
            Filters
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-foreground-secondary mb-1 block">Search Location</label>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-tertiary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-foreground-secondary mb-1 block">State</label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground focus:ring-2 focus:ring-primary/30"
              >
                <option value="All">All States</option>
                {STATES.map((s) => (
                  <option key={s.code} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-foreground-secondary mb-1 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-surface border border-border text-sm text-foreground focus:ring-2 focus:ring-primary/30"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-foreground-secondary mb-1 block">Map Layers</label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="layer" checked={mapLayer === 'osm'} onChange={() => setMapLayer('osm')} className="accent-primary" />
                  <span className="text-sm text-foreground">Street Map</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="layer" checked={mapLayer === 'satellite'} onChange={() => setMapLayer('satellite')} className="accent-primary" />
                  <span className="text-sm text-foreground">Satellite</span>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-foreground-secondary mb-2">
              {filteredProjects.length} projects, {filteredParcels.length} parcels found
            </p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {filteredProjects.slice(0, 8).map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => setSelectedParcel(proj)}
                  className={`
                    p-2 rounded-xl cursor-pointer transition-all text-xs
                    ${selectedParcel?.id === proj.id ? 'bg-primary/10 border border-primary/30' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'}
                  `}
                >
                  <p className="font-medium text-foreground truncate">{proj.projectName}</p>
                  <p className="text-foreground-tertiary">{proj.district}, {proj.state}</p>
                  <StatusBadge status={proj.status?.toLowerCase()} size="xs" />
                </div>
              ))}
            </div>
          </div>
        </ClayCard>

        {/* Map Legend */}
        <ClayCard className="p-4">
          <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
            <Info size={14} className="text-primary" />
            Legend
          </h4>
          <div className="space-y-1.5 text-xs">
            <LegendItem color="#10B981" label="Acquired" />
            <LegendItem color="#F59E0B" label="Proposed" />
            <LegendItem color="#3B82F6" label="Notification Issued" />
            <LegendItem color="#D97706" label="Award Declared" />
            <LegendItem color="#EF4444" label="Delayed / Disputed" />
          </div>
        </ClayCard>
      </motion.aside>

      {/* Map */}
      <motion.div variants={fadeIn} className="flex-1 min-h-[500px] relative">
        <ClayCard className="h-full p-0 overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Interactive GIS Map</h2>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground hover:bg-neutral-50 transition">
                <Search size={14} />
              </button>
              <button className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-foreground hover:bg-neutral-50 transition">
                <Layers size={14} />
              </button>
            </div>
          </div>

          <div className="h-[calc(100%-60px)]">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3 mx-auto" />
                  <p className="text-sm text-foreground-secondary">Loading map data...</p>
                </div>
              </div>
            ) : (
              <MapContainer
                center={[22.9741, 79.9577]}
                zoom={4.5}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
                zoomControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Project markers */}
                {filteredProjects.slice(0, 20).map((proj) => {
                  const pos = [proj.center?.[1] || 20, proj.center?.[0] || 77]
                  return (
                    <Marker key={proj.id} position={pos} icon={projectIcon}>
                      <Tooltip direction="top" offset={[0, -8]} opacity={0.9} sticky>
                        <div className="text-xs">
                          <p className="font-medium">{proj.projectName}</p>
                          <p className="text-neutral-400">{proj.district}, {proj.state}</p>
                        </div>
                      </Tooltip>
                      <Popup maxWidth={320} className="clay-popup">
                        <MapPopup project={proj} />
                      </Popup>
                    </Marker>
                  )
                })}

                {/* Parcel polygons */}
                {filteredParcels.map((parcel) => {
                  const geo = parcel.geometry || parcel
                  let positions = []
                  if (geo.type === 'Polygon' && geo.coordinates) {
                    positions = geo.coordinates[0].map((c) => [c[1], c[0]])
                  }
                  if (positions.length < 3) return null
                  const statusColorMap = {
                    acquired: '#10B981',
                    pending: '#F59E0B',
                    disputed: '#EF4444',
                    notification: '#3B82F6',
                    award: '#D97706',
                    review: '#8B5CF6',
                  }
                  const color = statusColorMap[parcel.properties?.status] || '#6366F1'
                  return (
                    <Polygon
                      key={parcel.properties?.id || parcel.id}
                      positions={positions}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.25,
                        weight: 1.5,
                      }}
                    >
                      <Tooltip sticky direction="center" offset={[0, 0]} opacity={0.85}>
                        <div className="text-xs">
                          <p className="font-medium">{parcel.properties?.parcelNumber}</p>
                          <p>{parcel.properties?.area} ha • {parcel.properties?.status}</p>
                          <p>Owner: {parcel.properties?.owner}</p>
                        </div>
                      </Tooltip>
                    </Polygon>
                  )
                })}
              </MapContainer>
            )}

            {/* Zoom Controls */}
            <div className="absolute top-3 right-3 z-[800] flex flex-col gap-1">
              <button className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-surface transition-all shadow-clay-sm">
                <ZoomIn size={16} />
              </button>
              <button className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-foreground hover:bg-surface transition-all shadow-clay-sm">
                <ZoomOut size={16} />
              </button>
            </div>
          </div>
        </ClayCard>
      </motion.div>
    </div>
  )
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-sm text-foreground-secondary">{label}</span>
    </div>
  )
}

const projectIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -40],
})

export default GISMapPage
