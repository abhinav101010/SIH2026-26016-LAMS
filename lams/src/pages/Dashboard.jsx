import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Map,
  TrendingUp,
  FileText,
  Clock,
  Activity,
  Landmark,
  CheckCircle,
  Users as UsersIcon,
  RefreshCw,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Polygon, Tooltip } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import KPICard from '../components/dashboard/KPICard'
import ChartCard from '../components/ui/ChartCard'
import AcquisitionProgressChart from '../components/charts/AcquisitionProgressChart'
import StateProgressChart from '../components/charts/StateProgressChart'
import AcquisitionStatusChart from '../components/charts/AcquisitionStatusChart'
import TimelineAdherenceChart from '../components/charts/TimelineAdherenceChart'
import ClayCard from '../components/ui/ClayCard'
import ClayButton from '../components/ui/ClayButton'
import StatusBadge from '../components/ui/StatusBadge'
import { SkeletonChart } from '../components/ui/Skeleton'
import MapPopup from '../components/gis/MapPopup'

import {
  dashboardApi,
  proposalApi,
  parcelApi,
} from '../services'
import { formatNumber, calculateProgress } from '../utils/formatters'

const projectIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -40],
})

const statusColors = {
  proposed: '#F59E0B',
  notification: '#3B82F6',
  acquired: '#10B981',
  award: '#D97706',
  disputed: '#EF4444',
  delayed: '#EF4444',
  review: '#8B5CF6',
  approved: '#10B981',
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-foreground-secondary">{label}</span>
    </div>
  )
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState(null)
  const [statusDistribution, setStatusDistribution] = useState([])
  const [stateProgress, setStateProgress] = useState([])
  const [trends, setTrends] = useState([])
  const [timeline, setTimeline] = useState([])
  const [recentProposals, setRecentProposals] = useState([])
  const [parcels, setParcels] = useState([])
  const [mapProjects, setMapProjects] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          overviewRes,
          statusRes,
          stateRes,
          trendsRes,
          timelineRes,
          recentRes,
          parcelsRes,
        ] = await Promise.all([
          dashboardApi.getOverview(),
          dashboardApi.getStatusDistribution(),
          dashboardApi.getStateProgress(),
          dashboardApi.getAcquisitionTrends(),
          dashboardApi.getTimelineAdherence(),
          dashboardApi.getRecentProposals(),
          parcelApi.getAll({ limit: 50 }),
        ])

        setOverview(overviewRes.data)
        setStatusDistribution(statusRes.data)
        setStateProgress(stateProgressRes.data)
        setTrends(trendsRes.data)
        setTimeline(timelineRes.data)
        setRecentProposals(recentRes.data)
        setParcels(parcelsRes.data || [])

        const projectsRes = await proposalApi.getAll({ limit: 50 })
        setMapProjects(projectsRes.data || [])
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getPolygonColor = (status) => statusColors[status] || '#6366F1'
  const getPolygonFillColor = (status) => getPolygonColor(status) + '40'

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div initial="initial" animate="animate" variants={fadeInUp}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              National Land Acquisition Overview
            </h1>
            <p className="text-foreground-secondary mt-1 text-sm">
              Real-time monitoring of land acquisition projects across India
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-foreground-secondary">
            <RefreshCw size={14} className="animate-spin-slow" />
            <span>Last updated: Today, 14:32 IST</span>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="clay-card p-6 animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-neutral-200 rounded w-3/4" />
            </div>
          ))
        ) : overview && (
          <>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Total Projects"
                value={formatNumber(overview.totalProjects)}
                icon={Landmark}
                change="+12%"
                trend="up"
                color="primary"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Land Proposed"
                value={formatNumber(overview.landProposed)}
                suffix=" ha"
                icon={Map}
                change="+8.4%"
                trend="up"
                color="secondary"
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Land Acquired"
                value={formatNumber(overview.landAcquired)}
                suffix=" ha"
                icon={CheckCircle}
                change="+15.2%"
                trend="up"
                color="success"
                subtitle={calculateProgress(overview.landAcquired, overview.landProposed) + '% of proposed'}
              />
            </motion.div>
            <motion.div variants={fadeInUp}>
              <KPICard
                title="Pending Proposals"
                value={formatNumber(overview.pendingProposals)}
                icon={FileText}
                change="-5.1%"
                trend="down"
                color="warning"
              />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* National GIS Map */}
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <ClayCard className="p-0 overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Map size={20} className="text-primary" />
                National Land Acquisition Map
              </h2>
              <div className="flex items-center gap-2">
                <button className="px-2.5 py-1 text-xs rounded-lg bg-surface border border-border hover:bg-neutral-50 transition">
                  Layers
                </button>
              </div>
            </div>

            <div className="p-3">
              {loading ? (
                <SkeletonChart />
              ) : (
                <MapContainer
                  center={[22.9741, 79.9577]}
                  zoom={4.5}
                  style={{ height: '480px', width: '100%', borderRadius: '12px' }}
                  scrollWheelZoom={true}
                  zoomControl={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {mapProjects.slice(0, 20).map((proj) => (
                    <Marker key={proj.id} position={[proj.center?.[1] || 20, proj.center?.[0] || 77]} icon={projectIcon}>
                      <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
                        <span className="text-xs font-medium">{proj.projectName}</span>
                      </Tooltip>
                    </Marker>
                  ))}

                  {parcels.filter((p) => p.geometry).map((parcel) => {
                    let positions
                    try {
                      const geo = JSON.parse(parcel.geometry)
                      positions = geo.type === 'Polygon' ? geo.coordinates[0].map((c) => [c[1], c[0]]) : []
                    } catch {
                      positions = []
                    }
                    if (positions.length < 3) return null
                    const color = getPolygonColor(parcel.status)
                    return (
                      <Polygon
                        key={parcel.id}
                        positions={positions}
                        pathOptions={{
                          color,
                          fillColor: color,
                          fillOpacity: 0.25,
                          weight: 1.5,
                        }}
                      >
                        <Tooltip sticky direction="center" opacity={0.85}>
                          <div className="text-xs">
                            <p className="font-medium">{parcel.parcelNumber}</p>
                            <p>{parcel.area} ha • {parcel.status}</p>
                            <p>Owner: {parcel.owner}</p>
                          </div>
                        </Tooltip>
                      </Polygon>
                    )
                  })}
                </MapContainer>
              )}

              {/* Map Legend */}
              <div className="mt-3 flex flex-wrap gap-4 px-1">
                <LegendItem color="#10B981" label="Acquired" />
                <LegendItem color="#F59E0B" label="Proposed" />
                <LegendItem color="#3B82F6" label="Notification Issued" />
                <LegendItem color="#D97706" label="Award Declared" />
                <LegendItem color="#EF4444" label="Delayed / Disputed" />
              </div>
            </div>
          </ClayCard>
        </motion.div>

        {/* Recent Proposals */}
        <motion.div variants={fadeInUp} className="space-y-6">
          <ClayCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Activity size={20} className="text-primary" />
                Recent Proposals
              </h2>
            </div>
            <div className="space-y-3">
              {recentProposals.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className={`
                    p-3 rounded-xl transition-all
                    ${p.status === 'PENDING' || p.status === 'UNDER_REVIEW' ? 'bg-primary/5 border-l-2 border-primary' : 'hover:bg-neutral-50 dark:hover:bg-neutral-800'}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{p.projectName}</p>
                      <p className="text-xs text-foreground-tertiary mt-0.5">{p.district}, {p.state}</p>
                    </div>
                    <StatusBadge status={p.status.toLowerCase()} size="xs" />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-foreground-tertiary">
                    <span>{p.proposalNumber}</span>
                    <span>{p.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <a href="/proposals" className="text-sm text-primary hover:text-primaryHover font-medium">
                View all proposals →
              </a>
            </div>
          </ClayCard>
        </motion.div>
      </div>

      {/* Analytics Section */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <ChartCard
            title="Acquisition Progress"
            subtitle="Area acquired vs. proposed (ha)"
            icon={TrendingUp}
          >
            {loading ? <SkeletonChart /> : <AcquisitionProgressChart data={trends} />}
          </ChartCard>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <ChartCard
            title="Status Distribution"
            subtitle="Active proposals by status"
            icon={Activity}
          >
            {loading ? <SkeletonChart /> : <AcquisitionStatusChart data={statusDistribution} />}
          </ChartCard>
        </motion.div>
      </motion.div>

      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } } }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={fadeInUp}>
          <ChartCard
            title="State-wise Progress"
            subtitle="Land acquired by state (ha)"
            icon={Map}
          >
            {loading ? <SkeletonChart /> : <StateProgressChart data={stateProgress} />}
          </ChartCard>
        </motion.div>
        <motion.div variants={fadeInUp}>
          <ChartCard
            title="Timeline Adherence"
            subtitle="Project schedule performance"
            icon={Clock}
          >
            {loading ? <SkeletonChart /> : <TimelineAdherenceChart data={timeline} />}
          </ChartCard>
        </motion.div>
      </motion.div>

      {/* Recent Proposals Table */}
      <motion.div variants={fadeInUp}>
        <ClayCard className="p-0 overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              Recent Proposals
            </h2>
            <ClayButton
              variant="outline"
              size="sm"
              icon={FileText}
              onClick={() => (window.location.href = '/proposals')}
            >
              View All Proposals
            </ClayButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800">
                  <th className="text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider pb-3 px-6">Proposal ID</th>
                  <th className="text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider pb-3">Project</th>
                  <th className="text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider pb-3">Location</th>
                  <th className="text-right text-xs font-medium text-foreground-secondary uppercase tracking-wider pb-3">Area</th>
                  <th className="text-left text-xs font-medium text-foreground-secondary uppercase tracking-wider pb-3">Status</th>
                  <th className="text-center text-xs font-medium text-foreground-secondary uppercase tracking-wider pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentProposals.slice(0, 8).map((p) => (
                  <tr
                    key={p.id}
                    className="border-t border-border/50 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <td className="py-3 px-6">
                      <code className="text-xs font-mono text-foreground-secondary">{p.proposalNumber}</code>
                    </td>
                    <td className="py-3">
                      <p className="text-sm font-medium text-foreground">{p.projectName}</p>
                    </td>
                    <td className="py-3">
                      <p className="text-sm text-foreground">{p.district}</p>
                      <span className="text-xs text-foreground-tertiary">{p.state}</span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm font-medium text-foreground">{p.totalLandRequired} ha</span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={p.status.toLowerCase()} size="sm" />
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => (window.location.href = `/proposals/${p.id}`)}
                        className="px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ClayCard>
      </motion.div>
    </div>
  )
}

export default Dashboard
