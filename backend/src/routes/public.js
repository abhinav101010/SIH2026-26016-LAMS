const express = require('express')
const router = express.Router()
const { getPublicProposals, getPublicProposalById, getPublicFilters } = require('../controllers/publicController')

router.get('/proposals', getPublicProposals)
router.get('/proposals/:id', getPublicProposalById)
router.get('/filters', getPublicFilters)

module.exports = router
