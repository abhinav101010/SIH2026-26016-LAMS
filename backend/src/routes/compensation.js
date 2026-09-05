const express = require('express')
const router = express.Router()
const {
  getCompensations,
  createCompensation,
  updateCompensation,
} = require('../controllers/compensationController')
const { authenticate, requirePermission } = require('../middleware/auth')

router.get('/', authenticate, requirePermission('MANAGE_COMPENSATION'), getCompensations)
router.post('/', authenticate, requirePermission('MANAGE_COMPENSATION'), createCompensation)
router.put('/:id', authenticate, requirePermission('MANAGE_COMPENSATION'), updateCompensation)

module.exports = router
