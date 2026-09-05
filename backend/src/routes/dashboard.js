const express = require('express')
const router = express.Router()
const {
  getOverview,
  getStatusDistribution,
  getStateProgress,
  getAcquisitionTrends,
  getTimelineAdherence,
  getRecentProposals,
} = require('../controllers/dashboardController')
const { authenticate, requirePermission } = require('../middleware/auth')

router.get('/overview', authenticate, requirePermission('DASHBOARD_VIEW'), getOverview)
router.get('/status-distribution', authenticate, requirePermission('DASHBOARD_VIEW'), getStatusDistribution)
router.get('/state-progress', authenticate, requirePermission('DASHBOARD_VIEW'), getStateProgress)
router.get('/acquisition-trends', authenticate, requirePermission('DASHBOARD_VIEW'), getAcquisitionTrends)
router.get('/timeline', authenticate, requirePermission('DASHBOARD_VIEW'), getTimelineAdherence)
router.get('/recent-proposals', authenticate, requirePermission('DASHBOARD_VIEW'), getRecentProposals)

module.exports = router
