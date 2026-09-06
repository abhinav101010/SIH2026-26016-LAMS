const express = require('express')
const router = express.Router()
const { getAuditLogs, deleteAuditLog, deleteAllAuditLogs } = require('../controllers/auditController')
const { authenticate, requirePermission } = require('../middleware/auth')

router.get('/', authenticate, requirePermission('AUDIT_VIEW'), getAuditLogs)
router.delete('/:id', authenticate, requirePermission('AUDIT_VIEW'), deleteAuditLog)
router.delete('/', authenticate, requirePermission('AUDIT_EXPORT'), deleteAllAuditLogs)

module.exports = router
