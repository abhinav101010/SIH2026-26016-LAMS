const express = require('express')
const router = express.Router()
const {
  getAllProposals,
  getProposalById,
  createProposal,
  updateProposal,
  deleteProposal,
  submitProposal,
  startReview,
  startFieldVerification,
  completeVerification,
  approveProposal,
  rejectProposal,
  requestChanges,
  dropProposal,
} = require('../controllers/proposalController')
const { getAffectedPopulation } = require('../controllers/populationController')
const { authenticate, requirePermission } = require('../middleware/auth')

router.get('/', authenticate, requirePermission('PROPOSALS_VIEW'), getAllProposals)
router.get('/:id', authenticate, requirePermission('PROPOSALS_VIEW'), getProposalById)
router.post('/', authenticate, requirePermission('PROPOSALS_CREATE'), createProposal)
router.put('/:id', authenticate, requirePermission('PROPOSALS_EDIT'), updateProposal)
router.delete('/:id', authenticate, requirePermission('PROPOSALS_DELETE'), deleteProposal)
router.post('/:id/submit', authenticate, requirePermission('PROPOSALS_SUBMIT'), submitProposal)
router.post('/:id/start-field-verification', authenticate, requirePermission('DOCUMENTS_VERIFY'), startFieldVerification)
router.post('/:id/start-review', authenticate, requirePermission('PROPOSALS_APPROVE'), startReview)
router.post('/:id/complete-verification', authenticate, requirePermission('DOCUMENTS_VERIFY'), completeVerification)
router.post('/:id/approve', authenticate, requirePermission('PROPOSALS_APPROVE'), approveProposal)
router.post('/:id/reject', authenticate, requirePermission('PROPOSALS_REJECT'), rejectProposal)
router.post('/:id/request-changes', authenticate, requirePermission('PROPOSALS_EDIT'), requestChanges)
router.post('/:id/drop', authenticate, requirePermission('PROPOSALS_DELETE'), dropProposal)
router.post('/affected-population', authenticate, getAffectedPopulation)

module.exports = router
