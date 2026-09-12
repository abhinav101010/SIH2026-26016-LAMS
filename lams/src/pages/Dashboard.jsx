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
  ArrowUpRight,
  Minus,
} from 'lucide-react'
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Avatar,
  useTheme,
  alpha,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import KPICard from '../components/dashboard/KPICard'
import ChartCard from '../components/ui/ChartCard'
import AcquisitionProgressChart from '../components/charts/AcquisitionProgressChart'
import StateProgressChart from '../components/charts/StateProgressChart'
import AcquisitionStatusChart from '../components/charts/AcquisitionStatusChart'
import TimelineAdherenceChart from '../components/charts/TimelineAdherenceChart'
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
  const theme = useTheme()
  const navigate = useNavigate()
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

        if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value.data)
        if (statusRes.status === 'fulfilled') setStatusDistribution(statusRes.value.data)
        if (stateRes.status === 'fulfilled') setStateProgress(stateRes.value.data)
        if (trendsRes.status === 'fulfilled') setTrends(trendsRes.value.data)
        if (timelineRes.status === 'fulfilled') setTimeline(timelineRes.value.data)
        if (recentRes.status === 'fulfilled') setRecentProposals(recentRes.value.data)
      } catch (err) {
        console.error('Unexpected dashboard fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Page Header */}
      <motion.div initial="initial" animate="animate" variants={fadeInUp}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1, flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Real-time overview of land acquisition proposals and approvals
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
            <RefreshCw size={14} className="animate-spin-slow" />
            <Typography variant="caption">Last updated: Today</Typography>
          </Box>
        </Box>
      </motion.div>

      {/* KPI Cards */}
      <motion.div
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.08 } } }}
      >
        <Grid container spacing={3}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="text" width="50%" height={20} />
                    <Skeleton variant="text" width="75%" height={36} sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : overview && (
            <>
              <Grid item xs={12} sm={6} lg={3}>
                <KPICard
                  title="Total Proposals"
                  value={formatNumber(overview.totalProposals)}
                  icon={FileText}
                  change="+12%"
                  trend="up"
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <KPICard
                  title="Land Proposed"
                  value={formatNumber(overview.landProposed)}
                  suffix=" ha"
                  icon={Landmark}
                  change="+8.4%"
                  trend="up"
                  color="secondary"
                />
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
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
              </Grid>
              <Grid item xs={12} sm={6} lg={3}>
                <KPICard
                  title="Pending Approvals"
                  value={formatNumber(overview.pendingDepartmentApprovals)}
                  icon={Clock}
                  change="-5.1%"
                  trend="down"
                  color="warning"
                  subtitle={`${overview.approvedDepartmentApprovals} approved · ${overview.rejectedDepartmentApprovals} rejected`}
                />
              </Grid>
            </>
          )}
        </Grid>
      </motion.div>

      {/* ==================== CHARTS SECTION ==================== */}
      <Box
        sx={{
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* ==================== MAIN CHARTS ROW ==================== */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1,
              },
            },
          }}
          style={{
            width: '100%',
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: '100%',
              minWidth: 0,
      
              display: 'grid',
      
              // Desktop: approximately 70 / 30
              gridTemplateColumns: {
                xs: '1fr',
                md: '2fr 1fr',
              },
      
              gap: 3,
            }}
          >
            {/* Acquisition Progress */}
            <Box
              sx={{
                width: '100%',
                minWidth: 0,
                display: 'flex',
              }}
            >
              <ChartCard
                title="Acquisition Progress"
                subtitle="Area acquired vs. proposed (ha)"
                icon={TrendingUp}
                height={420}
                sx={{
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    minWidth: 0,
                    minHeight: 0,
                  }}
                >
                  {loading ? (
                    <SkeletonChart />
                  ) : (
                    <AcquisitionProgressChart data={trends} />
                  )}
                </Box>
              </ChartCard>
            </Box>
      
            {/* Status Distribution */}
            <Box
              sx={{
                width: '100%',
                minWidth: 0,
                display: 'flex',
              }}
            >
              <ChartCard
                title="Status Distribution"
                subtitle="Proposals by current status"
                icon={Activity}
                height={420}
                sx={{
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    minWidth: 0,
                    minHeight: 0,
                  }}
                >
                  {loading ? (
                    <SkeletonChart />
                  ) : (
                    <AcquisitionStatusChart data={statusDistribution} />
                  )}
                </Box>
              </ChartCard>
            </Box>
          </Box>
        </motion.div>
      
        {/* ==================== SECONDARY CHARTS ROW ==================== */}
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
              },
            },
          }}
          style={{
            width: '100%',
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: '100%',
              minWidth: 0,
      
              display: 'grid',
      
              // Desktop: approximately 60 / 40
              gridTemplateColumns: {
                xs: '1fr',
                md: '7fr 5fr',
              },
      
              gap: 3,
            }}
          >
            {/* State-wise Progress */}
            <Box
              sx={{
                width: '100%',
                minWidth: 0,
                display: 'flex',
              }}
            >
              <ChartCard
                title="State-wise Progress"
                subtitle="Land proposed by state (ha)"
                icon={Landmark}
                height={360}
                sx={{
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    minWidth: 0,
                    minHeight: 0,
                  }}
                >
                  {loading ? (
                    <SkeletonChart />
                  ) : (
                    <StateProgressChart data={stateProgress} />
                  )}
                </Box>
              </ChartCard>
            </Box>
      
            {/* Timeline Adherence */}
            <Box
              sx={{
                width: '100%',
                minWidth: 0,
                display: 'flex',
              }}
            >
              <ChartCard
                title="Timeline Adherence"
                subtitle="Project schedule performance"
                icon={Clock}
                height={360}
                sx={{
                  width: '100%',
                  minWidth: 0,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    minWidth: 0,
                    minHeight: 0,
                  }}
                >
                  {loading ? (
                    <SkeletonChart />
                  ) : (
                    <TimelineAdherenceChart data={timeline} />
                  )}
                </Box>
              </ChartCard>
            </Box>
          </Box>
        </motion.div>
      </Box>
      
      {/* Recent Proposals */}
      <motion.div variants={fadeInUp}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}`,
            boxShadow: theme.palette.mode === 'dark'
              ? '0 4px 24px rgba(0,0,0,0.25)'
              : '0 4px 24px rgba(30,111,255,0.04)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: 2.5, bgcolor: 'primary.main', color: 'primary.contrastText', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={18} />
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: '-0.01em' }}>
                Recent Proposals
              </Typography>
            </Box>
            <IconButton
              onClick={() => navigate('/proposals')}
              size="small"
              sx={{
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.14) },
              }}
            >
              <FileText size={16} />
              <Typography variant="button" sx={{ ml: 1, fontSize: '0.8rem' }}>View All</Typography>
            </IconButton>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Proposal ID', 'Project', 'Location', 'Area', 'Status', 'Progress', ''].map((head) => (
                    <TableCell
                      key={head}
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: 'text.secondary',
                        bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                        py: 2,
                      }}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {recentProposals.slice(0, 8).map((p) => (
                  <TableRow
                    key={p.id}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 'none' },
                      transition: 'background-color 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/proposals/${p.id}`)}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" fontFamily="mono" color="text.secondary">
                        {p.proposalNumber}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" fontWeight={600}>{p.projectName}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2">{p.district}</Typography>
                      <Typography variant="caption" color="text.secondary">{p.state}</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2, textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={500}>{p.totalLandRequired} ha</Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <StatusBadge status={p.status.toLowerCase()} size="sm" />
                    </TableCell>
                    <TableCell sx={{ py: 2, minWidth: 160 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={p.progress}
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
                          {p.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2, textAlign: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); navigate(`/proposals/${p.id}`) }}
                        sx={{ color: 'primary.main' }}
                      >
                        <ArrowUpRight size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </motion.div>
    </Box>
  )
}

export default Dashboard
