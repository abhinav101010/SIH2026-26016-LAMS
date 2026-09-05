const express = require('express')
const router = express.Router()
const { getAuditLogs, deleteAuditLog } = require('../controllers/auditController')
const { authenticate, requirePermission } = require('../middleware/auth')

router.get('/', authenticate, requirePermission('AUDIT_VIEW'), getAuditLogs)
router.delete('/:id', authenticate, requirePermission('AUDIT_VIEW'), deleteAuditLog)

module.exports = router
