import api from './api'

export const dashboardApi = {
  getOverview: () =>
    api.get('/dashboard/overview').then((r) => r.data),

  getStatusDistribution: () =>
    api.get('/dashboard/status-distribution').then((r) => r.data),

  getStateProgress: () =>
    api.get('/dashboard/state-progress').then((r) => r.data),

  getAcquisitionTrends: () =>
    api.get('/dashboard/acquisition-trends').then((r) => r.data),

  getTimelineAdherence: () =>
    api.get('/dashboard/timeline').then((r) => r.data),

  getRecentProposals: () =>
    api.get('/dashboard/recent-proposals').then((r) => r.data),
}
