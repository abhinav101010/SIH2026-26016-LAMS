const express = require('express')
const router = express.Router()
const {
  seedPermissions,
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} = require('../controllers/roleController')
const { authenticate, requirePermission } = require('../middleware/auth')

router.get('/', authenticate, requirePermission('ROLES_VIEW'), getRoles)
router.get('/:id', authenticate, requirePermission('ROLES_VIEW'), getRoleById)
router.post('/', authenticate, requirePermission('ROLES_CREATE'), createRole)
router.put('/:id', authenticate, requirePermission('ROLES_EDIT'), updateRole)
router.delete('/:id', authenticate, requirePermission('ROLES_DELETE'), deleteRole)

module.exports = router
