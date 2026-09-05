const express = require('express')
const router = express.Router()
const {
  getParcels,
  getParcelById,
  getParcelsByProposal,
} = require('../controllers/parcelController')
const { authenticate, requirePermission } = require('../middleware/auth')

router.get('/', authenticate, requirePermission('PROPOSALS_VIEW'), getParcels)
router.get('/:id', authenticate, requirePermission('PROPOSALS_VIEW'), getParcelById)
router.get('/proposal/:proposalId', authenticate, requirePermission('PROPOSALS_VIEW'), getParcelsByProposal)

module.exports = router
