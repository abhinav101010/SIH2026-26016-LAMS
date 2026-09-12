import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  FileText,
  Clock,
  Activity,
  Landmark,
  CheckCircle,
  Users as UsersIcon,
  RefreshCw,
} from 'lucide-react'

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

import {
  dashboardApi,
  proposalApi,
} from '../services'
import { formatNumber, calculateProgress } from '../utils/formatters'

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [
          overviewRes,
          statusRes,
          stateRes,
          trendsRes,
          timelineRes,
          recentRes,
        ] = await Promise.allSettled([
          dashboardApi.getOverview(),
          dashboardApi.getStatusDistribution(),
          dashboardApi.getStateProgress(),
          dashboardApi.getAcquisitionTrends(),
          dashboardApi.getTimelineAdherence(),
          dashboardApi.getRecentProposals(),
        ])

        if (overviewRes.status === 'fulfilled') {
          setOverview(overviewRes.value.data)
        } else {
          console.error('Failed to fetch overview:', overviewRes.reason)
        }

        if (statusRes.status === 'fulfilled') {
          setStatusDistribution(statusRes.value.data)
        } else {
          console.error('Failed to fetch status distribution:', statusRes.reason)
        }

        if (stateRes.status === 'fulfilled') {
          setStateProgress(stateRes.value.data)
        } else {
          console.error('Failed to fetch state progress:', stateRes.reason)
        }

        if (trendsRes.status === 'fulfilled') {
          setTrends(trendsRes.value.data)
        } else {
          console.error('Failed to fetch acquisition trends:', trendsRes.reason)
        }

        if (timelineRes.status === 'fulfilled') {
          setTimeline(timelineRes.value.data)
        } else {
          console.error('Failed to fetch timeline adherence:', timelineRes.reason)
        }

        if (recentRes.status === 'fulfilled') {
          setRecentProposals(recentRes.value.data)
        } else {
          console.error('Failed to fetch recent proposals:', recentRes.reason)
        }
      } catch (err) {
        console.error('Unexpected dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.div initial="initial" animate="animate" variants={fadeInUp}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-foreground-secondary mt-1 text-sm">
              Real-time overview of land acquisition proposals and approvals
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-foreground-secondary">
            <RefreshCw size={14} className="animate-spin-slow" />
            <span>Last updated: Today</span>
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
                title="Total Proposals"
                value={formatNumber(overview.totalProposals)}
                icon={FileText}
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
                icon={Landmark}
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
                title="Pending Approvals"
                value={formatNumber(overview.pendingDepartmentApprovals)}
                icon={Clock}
                change="-5.1%"
                trend="down"
                color="warning"
                subtitle={`${overview.approvedDepartmentApprovals} approved · ${overview.rejectedDepartmentApprovals} rejected`}
              />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Main Charts Row */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
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
            subtitle="Proposals by current status"
            icon={Activity}
          >
            {loading ? <SkeletonChart /> : <AcquisitionStatusChart data={statusDistribution} />}
          </ChartCard>
        </motion.div>
      </motion.div>

      {/* Secondary Charts Row */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={fadeInUp}>
          <ChartCard
            title="State-wise Progress"
            subtitle="Land proposed by state (ha)"
            icon={Landmark}
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

      {/* Recent Proposals */}
      <motion.div variants={fadeInUp}>
        <ClayCard className="p-0 overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Activity size={20} className="text-primary" />
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
                  <th className="text-center text-xs font-medium text-foreground-secondary uppercase tracking-wider pb-3">Progress</th>
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
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: p.progress + '%',
                              backgroundColor: p.progress >= 75 ? '#10B981' : p.progress >= 40 ? '#F59E0B' : '#EF4444',
                            }}
                          />
                        </div>
                        <span className="text-xs text-foreground-secondary">{p.progress}%</span>
                      </div>
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
